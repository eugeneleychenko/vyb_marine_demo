import { useEffect, useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { getSignedUrl } from '../utils/elevenLabsAuth';

const ConversationModal = ({ isOpen, onClose, productData }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const connectionAttemptedRef = useRef(false);
  
  // Use agent ID from environment variables with fallback
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'sLkZceb7wwYGFIpbKZgT';
  
  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs AI');
      setIsLoading(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs AI');
      // Only reset the state if we intentionally ended the session
      if (connectionAttemptedRef.current) {
        setIsStarted(false);
      }
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Error:', error);
      setError(`Error: ${error.message || 'Unknown error'}`);
      setIsStarted(false);
      setIsLoading(false);
    }
  });

  // Start conversation with product context
  const startConversation = useCallback(async () => {
    if (isStarted || isLoading) return; // Prevent multiple connection attempts
    
    try {
      setIsLoading(true);
      setError(null);
      connectionAttemptedRef.current = true;
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL for authentication
      const signedUrl = await getSignedUrl(agentId);
      
      // Prepare the first message and context with product information
      const overrides = {
        agent: {
          firstMessage: `I see you're looking at the ${productData.Name}. How can I help you with this product?`,
          prompt: {
            prompt: JSON.stringify({
              product: productData,
              context: `The user is viewing a marine part with the following details:
              - Name: ${productData.Name}
              - SKU: ${productData.SKU}
              - Price: ${productData.Price}
              - Stock: ${productData.Stock || 'Not specified'}
              - Description: ${productData.Description}
              - Additional Details: ${productData.Additional_Details || productData["Additional Details"] || 'Not available'}
              
              You are a helpful marine parts assistant. Answer questions about this specific product using the provided information.
              If the user asks something not related to this product, you can still help, but remind them which product they're currently viewing.
              
              If asked about compatibility, delivery times, or other information not in the product details, let them know you can only provide information based on what's in the product description.
              `
            })
          }
        }
      };
      
      // Start the conversation with the signed URL
      await conversation.startSession({
        signedUrl,
        overrides
      });
      
      setIsStarted(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message}`);
      connectionAttemptedRef.current = false;
      setIsLoading(false);
    }
  }, [conversation, productData, agentId, isStarted, isLoading]);
  
  // End conversation when modal closes
  const endConversation = useCallback(async () => {
    if (isStarted) {
      try {
        setIsLoading(true);
        await conversation.endSession();
        connectionAttemptedRef.current = false;
        setIsStarted(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error ending conversation:', error);
        setIsLoading(false);
      }
    }
  }, [conversation, isStarted]);
  
  // Start conversation when modal opens
  useEffect(() => {
    let mounted = true;
    
    if (isOpen && productData && !isStarted && !connectionAttemptedRef.current && !isLoading) {
      startConversation();
    }
    
    // Clean up when component unmounts or modal closes
    return () => {
      mounted = false;
      if (!isOpen && connectionAttemptedRef.current) {
        endConversation();
      }
    };
  }, [isOpen, productData, startConversation, endConversation, isStarted, isLoading]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Marine Part Assistant</h2>
          <button 
            onClick={() => {
              endConversation();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4 bg-gray-200 rounded overflow-hidden">
              <img 
                src={productData.Image_URL || productData["Image URL"]} 
                alt={productData.Name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
            <div>
              <p className="font-medium">{productData.Name}</p>
              <p className="text-sm text-gray-600">SKU: {productData.SKU}</p>
              <p className="text-sm">{productData.Price}</p>
              {productData.Stock && <p className="text-sm text-gray-600">Stock: {productData.Stock}</p>}
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 italic mb-4">
          {error ? (
            <p className="text-red-500 mb-2">{error}</p>
          ) : (
            <>
              <p>Speak to ask questions about this marine part</p>
              <p className="text-xs mt-1">
                {isLoading ? 'Connecting...' : 
                  conversation.status === 'connected' 
                    ? 'AI is listening...' 
                    : conversation.status === 'connecting' 
                      ? 'Connecting...' 
                      : conversation.status === 'disconnected' && isStarted 
                        ? 'Reconnecting...'
                        : conversation.status}
              </p>
              {conversation.isSpeaking && (
                <p className="text-xs mt-1 text-blue-500">AI is speaking...</p>
              )}
            </>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={endConversation}
            disabled={isLoading || !isStarted}
            className={`px-4 py-2 border border-gray-300 rounded ${
              isLoading || !isStarted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            End Conversation
          </button>
          
          {(!isStarted || error) && (
            <button
              onClick={startConversation}
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {error ? 'Retry' : 'Start Conversation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationModal; 