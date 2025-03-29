import { useEffect, useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { getSignedUrl } from '../utils/elevenLabsAuth';
import chatbotAvatar from '../assets/images/chatbot-avatar.png';

// API endpoint for inventory
const INVENTORY_API = 'https://opensheet.elk.sh/1euKbdyTecaQmPZmupqmWfkVhVqp9ZJ4BCTFJHHGmdXI/1';

const InlineConversation = ({ isActive, onClose, productData }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const connectionAttemptedRef = useRef(false);
  const inventoryCacheRef = useRef(null);
  
  // Use agent ID from environment variables with fallback
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'sLkZceb7wwYGFIpbKZgT';
  
  // Helper function to fetch inventory data
  const fetchInventory = async () => {
    if (inventoryCacheRef.current) {
      return inventoryCacheRef.current;
    }
    
    try {
      console.log('[INVENTORY] Fetching inventory data from API...');
      const response = await fetch(INVENTORY_API);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[INVENTORY] Successfully fetched ${data.length} products`);
      
      // Cache the data for future use
      inventoryCacheRef.current = data;
      return data;
    } catch (error) {
      console.error('[INVENTORY] Error fetching inventory:', error);
      throw error;
    }
  };

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs AI');
      setIsLoading(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs AI');
      if (isActive && isStarted) {
        console.log('Unexpected disconnection. Attempting reconnect...');
        // Don't attempt auto reconnect here - let the user manually reconnect
      }
    },
    onError: (error) => {
      console.error('Error from ElevenLabs AI:', error);
      setError(`Connection error: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    },
    
    // Define client tools for ElevenLabs AI
    clientTools: {
      // Add the searchProducts tool
      searchProducts: async (params) => {
        console.log('[CLIENT TOOL] searchProducts called with params:', params);
        
        // Get query and validate
        const query = params.query;
        if (!query) {
          console.error('[CLIENT TOOL] searchProducts: Missing query parameter');
          return {
            success: false,
            message: "Query parameter is required",
            products: []
          };
        }
        
        console.log(`[CLIENT TOOL] searchProducts: Searching for "${query}"`);
        
        try {
          // Fetch inventory and filter by keyword
          const inventory = await fetchInventory();
          
          const searchTerms = query.toLowerCase().split(' ');
          
          // Scoring function to rank results by relevance
          const scoreProduct = (product) => {
            let score = 0;
            const nameLower = (product.Name || '').toLowerCase();
            const descLower = (product.Description || '').toLowerCase();
            const mpnLower = (product.MPN || '').toLowerCase();
            
            // Check for exact matches
            if (nameLower.includes(query.toLowerCase())) score += 10;
            if (mpnLower === query.toLowerCase()) score += 15;
            
            // Score each search term independently
            for (const term of searchTerms) {
              if (term.length < 3) continue; // Skip very short terms
              
              if (nameLower.includes(term)) score += 5;
              if (descLower.includes(term)) score += 2;
              if (mpnLower.includes(term)) score += 3;
            }
            
            return score;
          };
          
          // Filter and score products
          let results = inventory
            .map(product => ({ product, score: scoreProduct(product) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.product);
            
          console.log(`[CLIENT TOOL] searchProducts: Found ${results.length} results for "${query}"`);
          
          return {
            success: true,
            count: results.length,
            products: results.map(p => ({
              name: p.Name,
              sku: p.SKU,
              mpn: p.MPN,
              price: p.Price,
              stock: p.Stock || "Out of stock",
              description: p.Description ? p.Description.substring(0, 100) + (p.Description.length > 100 ? '...' : '') : 'No description available',
              imageUrl: p["Image URL"]
            }))
          };
        } catch (error) {
          console.error('[CLIENT TOOL] Error searching products:', error);
          return {
            success: false,
            message: "An error occurred while searching for products",
            products: []
          };
        }
      },
      
      // Add the filterProducts function
      filterProducts: async (params) => {
        console.log('[CLIENT TOOL] filterProducts called with params:', params);
        
        // Get keyword and validate
        const keyword = params.keyword;
        if (!keyword) {
          console.error('[CLIENT TOOL] filterProducts: Missing keyword parameter');
          return Promise.resolve({
            success: false,
            message: "Keyword parameter is required",
            products: []
          });
        }
        
        const maxResults = params.maxResults || 5;
        const sortBy = params.sortBy || "relevance";
        
        console.log(`[CLIENT TOOL] filterProducts: Searching for "${keyword}", max results: ${maxResults}, sort by: ${sortBy}`);
        
        try {
          // Fetch inventory and filter by keyword - only look at product Name
          const inventory = await fetchInventory();
          let matches = inventory.filter(product => 
            (product.Name && product.Name.toLowerCase().includes(keyword.toLowerCase()))
          );
          
          console.log(`[CLIENT TOOL] filterProducts: Found ${matches.length} matches for "${keyword}"`);
          
          // Sort results if requested
          if (sortBy === "price") {
            matches.sort((a, b) => parseFloat(a.Price?.replace(/[$,]/g, '') || 0) - parseFloat(b.Price?.replace(/[$,]/g, '') || 0));
            console.log('[CLIENT TOOL] filterProducts: Sorted results by price');
          } else if (sortBy === "name") {
            matches.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
            console.log('[CLIENT TOOL] filterProducts: Sorted results by name');
          }
          
          // Limit results
          matches = matches.slice(0, maxResults);
          console.log(`[CLIENT TOOL] filterProducts: Limited to ${matches.length} results`);
          
          // Display results in carousel
          if (matches.length > 0) {
            console.log('[CLIENT TOOL] filterProducts: Dispatching showProductCarousel event');
            window.dispatchEvent(new CustomEvent('marine:showProductCarousel', { 
              detail: { products: matches } 
            }));
          }
          
          // Return formatted results
          return {
            success: true,
            count: matches.length,
            products: matches.map(p => ({
              name: p.Name,
              sku: p.SKU,
              mpn: p.MPN,
              price: p.Price,
              stock: p.Stock || "Out of stock",
              description: p.Description ? p.Description.substring(0, 100) + (p.Description.length > 100 ? '...' : '') : 'No description available',
              imageUrl: p["Image URL"],
              productUrl: p.Links,
              path: p.Path ? p.Path.substring(0, p.Path.lastIndexOf(p.Name)).trim() : ''
            }))
          };
        } catch (error) {
          console.error('[CLIENT TOOL] filterProducts error:', error);
          return {
            success: false,
            message: "An error occurred while filtering products",
            products: []
          };
        }
      },
      
      // Add the addToCart tool
      addToCart: async (params) => {
        console.log('[CLIENT TOOL] addToCart called with params:', params);
        
        // Validate parameters
        if (!params || !params.productId) {
          console.error('[CLIENT TOOL] addToCart: Missing productId parameter');
          return Promise.resolve("Failed to add product to cart. Missing product ID.");
        }
        
        // Get the quantity (default to 1 if not provided)
        const quantity = params.quantity ? parseInt(params.quantity) : 1;
        console.log('[CLIENT TOOL] addToCart: Quantity parsed as', quantity);
        
        try {
          // First check if we have a preselected product
          let product = productData;
          
          // If not, or if the SKU doesn't match, search in our inventory
          if (!product || product.SKU !== params.productId) {
            console.log('[CLIENT TOOL] addToCart: Searching in inventory for SKU:', params.productId);
            const inventory = await fetchInventory();
            product = inventory.find(p => p.SKU === params.productId);
          }
          
          console.log('[CLIENT TOOL] addToCart: Found product:', product);
          
          // If we found a product, add it to cart
          if (product) {
            // Format the product for cart
            const cartProduct = {
              id: product.SKU,
              name: product.Name,
              price: typeof product.Price === 'string' 
                ? parseFloat(product.Price.replace(/[$,]/g, '')) || 0
                : (typeof product.Price === 'number' ? product.Price : 0),
              category: product.Path?.split('  ')[1] || 'Marine Parts',
              image: product.Image_URL || product["Image URL"],
              color: '',
              description: product.Description,
              sku: product.SKU,
              stock: product.Stock,
            };
            
            console.log('[CLIENT TOOL] addToCart: Formatted cart product:', cartProduct);
            
            // Dispatch an event to add to cart
            console.log('[CLIENT TOOL] addToCart: Dispatching cart:addItem event with quantity', quantity);
            window.dispatchEvent(new CustomEvent('cart:addItem', { 
              detail: { product: cartProduct, quantity } 
            }));
            console.log('[CLIENT TOOL] addToCart: Event dispatched successfully');
            
            return Promise.resolve(`Successfully added ${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.Name} to your cart.`);
          } else {
            console.error('[CLIENT TOOL] addToCart: Product not found with SKU:', params.productId);
            return Promise.resolve(`Could not find a product with SKU: ${params.productId}. Please try searching for a product first.`);
          }
        } catch (error) {
          console.error('Error adding product to cart:', error);
          return Promise.resolve("An error occurred while adding the product to cart. Please try again.");
        }
      },
      
      // Add the openImageUpload function
      openImageUpload: () => {
        console.log('[CLIENT TOOL] openImageUpload called');
        
        try {
          // Dispatch an event to open the image upload drawer
          window.dispatchEvent(new CustomEvent('marine:openImageUpload'));
          console.log('[CLIENT TOOL] openImageUpload: Event dispatched successfully');
          
          return Promise.resolve('Image upload panel opened. You can now upload an image to find marine parts.');
        } catch (error) {
          console.error('[CLIENT TOOL] openImageUpload error:', error);
          return Promise.resolve('Sorry, there was an error opening the image upload panel. Please try again.');
        }
      }
    }
  });

  // Start conversation with or without product context
  const startConversation = useCallback(async () => {
    // Prevent multiple connection attempts
    if (isStarted || isLoading) {
      console.log('[CONVERSATION] startConversation called but already started or loading - ignoring');
      return;
    }
    
    // Set connection attempt flag immediately to prevent race conditions
    connectionAttemptedRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[CONVERSATION] Requesting microphone permission');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('[CONVERSATION] Getting signed URL for authentication');
      
      // Get signed URL for authentication
      const signedUrl = await getSignedUrl(agentId);
      
      console.log('[CONVERSATION] Starting session with ElevenLabs');
      
      // Prepare overrides object based on whether we have product data
      const overrides = {
        agent: {
          firstMessage: productData 
            ? `I see you're looking at the ${productData.Name}. How can I help you with this product?`
            : "Hey, thanks for coming to Lighthouse Marine Supply. Can I help you find something or do you have an image of the product that you want to replace?",
          prompt: {
            prompt: JSON.stringify(productData 
              ? {
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
                }
              : {
                  context: `You are a helpful marine parts assistant specializing in boats, jet skis, outboard motors, and related marine equipment.
                  
                  You can help users find products by asking about their needs and then using the searchProducts tool.
                  Once you find products, you can recommend them and add them to the cart using the addToCart tool.
                  
                  When users are interested in a product:
                  1. Use searchProducts to find products matching their description
                  2. Present the options clearly with product names, prices, and brief descriptions
                  3. If they want to purchase, use addToCart with the correct SKU
                  
                  Be helpful, conversational, and guide the user through the process of finding marine parts.
                  
                  Our inventory includes many marine products from brands like Mercury Marine, Yamaha, Sea-Doo, and many others.
                  `
                }
            )
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
  
  // End conversation when component unmounts or becomes inactive
  const endConversation = useCallback(async () => {
    // Only attempt to end if we're actually in a conversation
    if (!isStarted) {
      console.log('[CONVERSATION] endConversation called but not started - just resetting flags');
      connectionAttemptedRef.current = false;
      setIsLoading(false);
      return;
    }
    
    console.log('[CONVERSATION] Ending conversation session');
    
    try {
      setIsLoading(true);
      
      // Attempt to end the session with ElevenLabs
      await conversation.endSession();
      console.log('[CONVERSATION] Successfully ended conversation with ElevenLabs');
      
      // Reset all state
      connectionAttemptedRef.current = false;
      setIsStarted(false);
    } catch (error) {
      console.error('[CONVERSATION] Error ending conversation:', error);
    } finally {
      // Always turn off loading state, even if there was an error
      setIsLoading(false);
      console.log('[CONVERSATION] Cleanup complete');
    }
  }, [conversation, isStarted]);
  
  // Preload inventory data when component mounts
  useEffect(() => {
    // Fetch inventory data to populate the cache
    fetchInventory().catch(error => {
      console.error('Error preloading inventory data:', error);
    });
  }, []);
  
  // Start/end conversation based on isActive prop
  useEffect(() => {
    console.log(`[CONVERSATION] isActive changed to: ${isActive}, isStarted: ${isStarted}, isLoading: ${isLoading}`);
    
    // Create stable reference to track if we're running this effect
    // This prevents multiple overlapping effect executions
    const effectId = Symbol('conversation-effect');
    console.log('[CONVERSATION] Effect starting with ID:', effectId.toString());
    
    let mounted = true;
    let connectionTimeout = null;
    
    // Function to start conversation with debounce
    const initiateConversation = () => {
      // Prevent initiating if we're already in the process or started
      if (isStarted || isLoading || connectionAttemptedRef.current) {
        console.log(`[CONVERSATION] Already in process - isStarted: ${isStarted}, isLoading: ${isLoading}, attempted: ${connectionAttemptedRef.current}`);
        return;
      }
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Set a small delay to avoid rapid connection attempts
      connectionTimeout = setTimeout(() => {
        if (!mounted) {
          console.log('[CONVERSATION] Component unmounted before timeout completed');
          return;
        }
        
        if (!isStarted && !isLoading && !connectionAttemptedRef.current) {
          console.log('[CONVERSATION] Initiating conversation');
          startConversation();
        } else {
          console.log(`[CONVERSATION] Not starting conversation - isStarted: ${isStarted}, attempted: ${connectionAttemptedRef.current}, isLoading: ${isLoading}`);
        }
      }, 300);
    };
    
    // Function to properly clean up
    const cleanupConversation = async () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      
      // Only end the conversation if we were the ones who started it
      if (mounted && isStarted && !isActive) {
        console.log('[CONVERSATION] Cleaning up conversation - isActive is now false');
        await endConversation();
      }
    };
    
    if (isActive && !isStarted && !isLoading && !connectionAttemptedRef.current) {
      initiateConversation();
    } else if (!isActive && isStarted) {
      cleanupConversation();
    }
    
    // Clean up when component unmounts or when effect re-runs
    return () => {
      console.log('[CONVERSATION] Effect cleanup with ID:', effectId.toString());
      mounted = false;
      
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      
      // Don't automatically end the conversation on every cleanup
      // Only end the conversation if isActive has changed to false
      if (isStarted && !isActive) {
        console.log('[CONVERSATION] Ending conversation during cleanup - isActive is false');
        endConversation();
      }
    };
  }, [isActive]); // Only depend on isActive to prevent loops
  
  // Don't render anything if not active
  if (!isActive) return null;
  
  return (
    <div className={`fixed z-40 transition-all duration-300 ease-in-out
      md:right-4 md:bottom-24 md:max-w-[400px]
      sm:right-2 sm:bottom-20 sm:max-w-[350px]
      right-0 bottom-0 w-full sm:w-auto
      ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full h-full md:h-auto flex flex-col
        max-h-[500px] md:max-h-[500px] sm:max-h-[450px]
        mobile-conversation-height"
      >
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={chatbotAvatar} 
              alt="AI Assistant" 
              className="w-8 h-8 rounded-full mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MGYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+";
              }}
            />
            <span className="font-medium">Marine Parts Assistant</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Only show product info if we have a product */}
        {productData && (
          <div className="p-3 bg-gray-100 border-b">
            <div className="flex items-center">
              <div className="w-12 h-12 mr-3 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{productData.Name}</p>
                <p className="text-xs text-gray-600">SKU: {productData.SKU}</p>
                <p className="text-sm">{productData.Price}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 flex-1 overflow-auto">
          {error ? (
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={startConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 mr-3 bg-blue-100 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={chatbotAvatar}
                  alt="AI Assistant" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MGYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+";
                  }}
                />
              </div>
              <div>
                <p className="text-gray-800 text-sm">
                  {isLoading ? 'Connecting...' : 
                    conversation.status === 'connected' 
                      ? 'I\'m listening. How can I help you find marine parts?' 
                      : conversation.status === 'connecting' 
                        ? 'Connecting...' 
                        : conversation.status === 'disconnected' && isStarted 
                          ? 'Reconnecting...'
                          : 'Ready to help you find marine parts.'}
                </p>
                {conversation.isSpeaking && (
                  <p className="text-xs mt-1 text-blue-500">AI is speaking...</p>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500 mt-2">
            {isStarted ? 
              'Speak to me or click the avatar again to end the conversation.' :
              isLoading ? 
                'Setting up your conversation...' : 
                'Click the avatar to start or stop the conversation.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineConversation; 