import React, { useEffect, useState } from 'react';
import { useConversation, Role } from '@11labs/react';
import { useSalesforceLeadData } from './hooks/useSalesforceLeadData';
import './App.css';

// Add this interface for the message type
interface ConversationMessage {
  message: string;
  source: Role;
  type?: string;
  data?: any;
}

function App() {
  const API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
  const DEFAULT_AGENT_ID = process.env.REACT_APP_ELEVENLABS_AGENT_ID;

  const { leadData, error: leadDataError, fetchLeadData } = useSalesforceLeadData();
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1); // Set default volume to 100%
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [extractedBusinessType, setExtractedBusinessType] = useState<string | null>(null);
  // Add state variables for all other extracted information
  const [extractedMonthlyRevenue, setExtractedMonthlyRevenue] = useState<string | null>(null);
  const [extractedOwnershipStructure, setExtractedOwnershipStructure] = useState<string | null>(null);
  const [extractedFundingAmount, setExtractedFundingAmount] = useState<string | null>(null);
  const [extractedFundingPurpose, setExtractedFundingPurpose] = useState<string | null>(null);
  const [extractedFundingTimeline, setExtractedFundingTimeline] = useState<string | null>(null);
  const [extractedCreditStatus, setExtractedCreditStatus] = useState<string | null>(null);
  const [extractedBetterCreditOwner, setExtractedBetterCreditOwner] = useState<string | null>(null);
  const [extractedPreviousFinancing, setExtractedPreviousFinancing] = useState<string | null>(null);
  const [extractedCurrentFinancingStatus, setExtractedCurrentFinancingStatus] = useState<string | null>(null);
  const [extractedTimeSensitivity, setExtractedTimeSensitivity] = useState<string | null>(null);
  const [extractedPaymentPreference, setExtractedPaymentPreference] = useState<string | null>(null);
  const [extractedOtherOptions, setExtractedOtherOptions] = useState<string | null>(null);

  useEffect(() => {
    if (leadData && !firstMessageSent) {
      console.log('[DEBUG] Initializing conversation with lead data:', leadData);
    }
  }, [leadData, firstMessageSent]);

  // Define the business_type tool handler
  const handleBusinessTypeTool = (params: any) => {
    console.log('[TOOL] business_type called with params:', params);
    
    if (params && params.business_type) {
      const businessType = params.business_type;
      console.log('[EXTRACTED INFO] Business Type (from tool):', businessType);
      setExtractedBusinessType(businessType);
      
      // You can add code here to push this data to your client system
      
      // Return a success response to the agent
      return {
        success: true,
        message: `Successfully extracted business type: ${businessType}`
      };
    }
    
    return {
      success: false,
      message: "Failed to extract business type. Missing required parameter."
    };
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs AI');
    },
    onDisconnect: () => console.log('Disconnected from ElevenLabs AI'),
    onMessage: (message: ConversationMessage) => {
      console.log('New message:', message);
      
      // Log all message types for debugging
      console.log('Message type:', message.type);
      
      // Check if the message contains extracted information
      if (message.type === 'data_collection') {
        // Log the entire data collection message
        console.log('Data Collection received:', message.data);
        
        // Specifically check for business_industry
        if (message.data && message.data.business_industry) {
          console.log('[EXTRACTED INFO] Business Industry:', message.data.business_industry);
        }
      } 
      // Check for other message types that might contain data
      else if (message.type === 'extracted_data' || message.type === 'metadata' || message.type === 'analysis') {
        console.log('Potential data in message:', message);
      }
      // Check for tool calls
      else if (message.type === 'tool_call') {
        console.log('Tool call received:', message.data);
      }
    },
    onError: (error) => console.error('Error:', error),
    clientTools: {
      // Business Details Tools
      business_type: (params) => {
        console.log('[CLIENT TOOL] business_type called with params:', params);
        
        if (params && params.type) {
          const businessType = params.type;
          console.log('[EXTRACTED INFO] Business Type (from client tool):', businessType);
          setExtractedBusinessType(businessType);
          
          // Return a simple success message (string) as expected by the SDK
          return Promise.resolve(`Successfully extracted business type: ${businessType}`);
        }
        
        return Promise.resolve("Failed to extract business type. Missing required parameter.");
      },
      
      // Monthly Revenue Tool
      monthly_revenue: (params) => {
        console.log('[CLIENT TOOL] monthly_revenue called with params:', params);
        
        if (params && params.amount) {
          const revenue = params.amount;
          console.log('[EXTRACTED INFO] Monthly Revenue:', revenue);
          setExtractedMonthlyRevenue(revenue);
          
          return Promise.resolve(`Successfully extracted monthly revenue: ${revenue}`);
        }
        
        return Promise.resolve("Failed to extract monthly revenue. Missing required parameter.");
      },
      
      // Ownership Structure Tool
      ownership_structure: (params) => {
        console.log('[CLIENT TOOL] ownership_structure called with params:', params);
        
        if (params && params.structure) {
          const structure = params.structure;
          console.log('[EXTRACTED INFO] Ownership Structure:', structure);
          setExtractedOwnershipStructure(structure);
          
          return Promise.resolve(`Successfully extracted ownership structure: ${structure}`);
        }
        
        return Promise.resolve("Failed to extract ownership structure. Missing required parameter.");
      },
      
      // Funding Needs Tool
      funding_needs: (params) => {
        console.log('[CLIENT TOOL] funding_needs called with params:', params);
        let response = "";
        
        if (params && params.amount) {
          const amount = params.amount;
          console.log('[EXTRACTED INFO] Funding Amount:', amount);
          setExtractedFundingAmount(amount);
          response += `amount: ${amount}, `;
        }
        
        if (params && params.purpose) {
          const purpose = params.purpose;
          console.log('[EXTRACTED INFO] Funding Purpose:', purpose);
          setExtractedFundingPurpose(purpose);
          response += `purpose: ${purpose}, `;
        }
        
        if (params && params.timeline) {
          const timeline = params.timeline;
          console.log('[EXTRACTED INFO] Funding Timeline:', timeline);
          setExtractedFundingTimeline(timeline);
          response += `timeline: ${timeline}`;
        }
        
        if (response) {
          return Promise.resolve(`Successfully extracted funding needs: ${response}`);
        }
        
        return Promise.resolve("Failed to extract funding needs. Missing required parameters.");
      },
      
      // Credit Information Tool
      credit_info: (params) => {
        console.log('[CLIENT TOOL] credit_info called with params:', params);
        let response = "";
        
        if (params && params.status) {
          const status = params.status;
          console.log('[EXTRACTED INFO] Credit Status:', status);
          setExtractedCreditStatus(status);
          response += `status: ${status}, `;
        }
        
        if (params && params.better_owner) {
          const betterOwner = params.better_owner;
          console.log('[EXTRACTED INFO] Better Credit Owner:', betterOwner);
          setExtractedBetterCreditOwner(betterOwner);
          response += `better owner: ${betterOwner}`;
        }
        
        if (response) {
          return Promise.resolve(`Successfully extracted credit information: ${response}`);
        }
        
        return Promise.resolve("Failed to extract credit information. Missing required parameters.");
      },
      
      // Previous Financing Tool
      previous_financing: (params) => {
        console.log('[CLIENT TOOL] previous_financing called with params:', params);
        let response = "";
        
        if (params && params.history) {
          const history = params.history;
          console.log('[EXTRACTED INFO] Previous Financing History:', history);
          setExtractedPreviousFinancing(history);
          response += `history: ${history}, `;
        }
        
        if (params && params.current_status) {
          const currentStatus = params.current_status;
          console.log('[EXTRACTED INFO] Current Financing Status:', currentStatus);
          setExtractedCurrentFinancingStatus(currentStatus);
          response += `current status: ${currentStatus}`;
        }
        
        if (response) {
          return Promise.resolve(`Successfully extracted previous financing information: ${response}`);
        }
        
        return Promise.resolve("Failed to extract previous financing information. Missing required parameters.");
      },
      
      // Decision Factors Tool
      decision_factors: (params) => {
        console.log('[CLIENT TOOL] decision_factors called with params:', params);
        let response = "";
        
        if (params && params.time_sensitivity) {
          const timeSensitivity = params.time_sensitivity;
          console.log('[EXTRACTED INFO] Time Sensitivity:', timeSensitivity);
          setExtractedTimeSensitivity(timeSensitivity);
          response += `time sensitivity: ${timeSensitivity}, `;
        }
        
        if (params && params.payment_preference) {
          const paymentPreference = params.payment_preference;
          console.log('[EXTRACTED INFO] Payment Preference:', paymentPreference);
          setExtractedPaymentPreference(paymentPreference);
          response += `payment preference: ${paymentPreference}, `;
        }
        
        if (params && params.other_options) {
          const otherOptions = params.other_options;
          console.log('[EXTRACTED INFO] Other Options:', otherOptions);
          setExtractedOtherOptions(otherOptions);
          response += `other options: ${otherOptions}`;
        }
        
        if (response) {
          return Promise.resolve(`Successfully extracted decision factors: ${response}`);
        }
        
        return Promise.resolve("Failed to extract decision factors. Missing required parameters.");
      }
    }
  });

  const [agentId, setAgentId] = useState(DEFAULT_AGENT_ID || '');
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getSignedUrl = async (agentId: string) => {
    if (!API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    const data = await response.json();
    return data.signed_url;
  };

  const handleStart = async () => {
    if (!agentId) {
      alert('Please enter an Agent ID');
      return;
    }

    setIsLoading(true);
    try {
      const signedUrl = await getSignedUrl(agentId);
      
      // Prepare the first message and context with information extraction focus
      const firstName = leadData?.name ? getFirstName(leadData.name) : undefined;
      const overrides = {
        agent: {
          firstMessage: firstName ? `Hey ${firstName}, tell me about your business.` : "Hello, tell me about your business.",
          prompt: {
            prompt: JSON.stringify({
              ...leadData,
              context: `This is a conversation to gather business information. 
              
You are a business funding assistant. Your goal is to gather information about the user's business to help determine appropriate funding options.

During the conversation, extract the following information using the appropriate tools:

1. Business type/industry using the business_type tool with parameter "type"
2. Monthly revenue using the monthly_revenue tool with parameter "amount"
3. Business ownership structure using the ownership_structure tool with parameter "structure"
4. Funding requirements using the funding_needs tool with parameters "amount", "purpose", and "timeline"
5. Credit information using the credit_info tool with parameters "status" and "better_owner"
6. Previous financing history using the previous_financing tool with parameters "history" and "current_status"
7. Decision-making factors using the decision_factors tool with parameters "time_sensitivity", "payment_preference", and "other_options"

Ask questions naturally to gather this information. Don't make it feel like an interrogation. Acknowledge when you've recorded information.

Example tool usage:
- When user says "I run a plumbing business", use business_type tool with parameter: { "type": "plumbing business" }
- When user mentions "We make about $50k per month", use monthly_revenue tool with parameter: { "amount": "$50,000 monthly" }
- When user says "I need $40,000 for new equipment", use funding_needs tool with parameters: { "amount": "$40,000", "purpose": "new equipment" }

Always confirm important information before recording it. If information is unclear, ask for clarification.`,
              extractInformation: true,
              gatherBusinessInfo: true
            })
          }
        }
      };

      const conversationId = await conversation.startSession({
        signedUrl,
        overrides
      });

      // Store the conversation ID
      setCurrentConversationId(conversationId);

      console.log('Conversation started with ID:', conversationId, 'with overrides:', overrides);
      setIsStarted(true);
      setFirstMessageSent(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please check your Agent ID and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function to fetch conversation data
  const fetchConversationData = async (conversationId: string) => {
    if (!API_KEY) {
      console.error('ElevenLabs API key is not configured');
      return;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversation data');
      }

      const data = await response.json();
      console.log('Conversation data retrieved:', data);
      
      // Check for data collection in the response
      if (data.data_collection) {
        console.log('Data Collection from API:', data.data_collection);
        
        // Check for business industry
        if (data.data_collection.business_industry) {
          console.log('[EXTRACTED INFO] Business Industry:', data.data_collection.business_industry);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
  };

  const handleEnd = async () => {
    try {
      // Use the stored conversation ID
      const conversationIdToFetch = currentConversationId;
      
      await conversation.endSession();
      setIsStarted(false);
      setFirstMessageSent(false);
      setCurrentConversationId(null);
      
      // If we have a conversation ID, fetch the data after ending the session
      if (conversationIdToFetch) {
        console.log('Fetching data for conversation:', conversationIdToFetch);
        await fetchConversationData(conversationIdToFetch);
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const handleVolumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (!isMuted) {
      await conversation.setVolume({ volume: newVolume });
    }
  };

  useEffect(() => {
    // Request microphone access when component mounts
    const requestMicrophoneAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    requestMicrophoneAccess();

    // Set initial volume based on mute state
    conversation.setVolume({ volume: isMuted ? 0 : volume });

    // Only auto-start if we have API key, agent ID AND lead data
    if (API_KEY && DEFAULT_AGENT_ID && leadData) {
      handleStart();
    }
  }, []);

  const handleMuteToggle = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    await conversation.setVolume({ volume: newMuteState ? 0 : volume });
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="sidebar">
          <button 
            onClick={() => fetchLeadData()} 
            className="load-lead-button"
          >
            Load Lead Info
          </button>

          {leadData && (
            <div className="lead-info">
              <h2>Lead Information</h2>
              <div className="lead-details">
                <p><strong>Name:</strong> {leadData.name}</p>
                <p><strong>Company:</strong> {leadData.company}</p>
                {leadData.title && <p><strong>Title:</strong> {leadData.title}</p>}
                {leadData.phone && <p><strong>Phone:</strong> {leadData.phone}</p>}
                {leadData.email && <p><strong>Email:</strong> {leadData.email}</p>}
                {leadData.leadSource && <p><strong>Source:</strong> {leadData.leadSource}</p>}
                {leadData.industry && <p><strong>Industry:</strong> {leadData.industry}</p>}
              </div>
            </div>
          )}
          
          {leadDataError && (
            <div className="error-message">
              <p>Error loading lead data: {leadDataError}</p>
            </div>
          )}
        </div>

        <div className="main-content">
          <h1>ElevenLabs Chat</h1>
          
          <div className="controls">
            <input
              type="text"
              placeholder="Enter Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={isStarted || isLoading}
            />
            
            {!isStarted ? (
              <button 
                onClick={handleStart} 
                disabled={isLoading || !agentId || !leadData}
                className={!leadData ? 'button-disabled' : ''}
              >
                {isLoading ? 'Starting...' : !leadData ? 'Load Lead Info First' : 'Start Conversation'}
              </button>
            ) : (
              <button onClick={handleEnd}>End Conversation</button>
            )}

            <div className="audio-controls">
              <button 
                onClick={handleMuteToggle}
                className={`mute-button ${isMuted ? 'muted' : ''}`}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>

              <div className="volume-control">
                <label>Volume:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  disabled={isMuted}
                />
              </div>
            </div>
          </div>

          <div className="status">
            <p>Status: {conversation.status}</p>
            <p>Speaking: {conversation.isSpeaking ? 'Yes' : 'No'}</p>
            <p>Lead Data: {leadData ? 'Loaded' : 'Not Loaded'}</p>
            <p>Audio: {isMuted ? 'Muted' : 'Unmuted'}</p>
            {!API_KEY && (
              <p className="error">Warning: API key not configured in environment variables</p>
            )}
          </div>
        </div>
        
        <div className="transcript extracted-info-panel">
          <h2>Extracted Information</h2>
          <div className="extracted-details">
            <p><strong>Business Type:</strong> {extractedBusinessType || 'Not yet extracted'}</p>
            
            <h3>Business Details</h3>
            <p><strong>Monthly Revenue:</strong> {extractedMonthlyRevenue || 'Not yet extracted'}</p>
            <p><strong>Ownership Structure:</strong> {extractedOwnershipStructure || 'Not yet extracted'}</p>
            
            <h3>Funding Requirements</h3>
            <p><strong>Amount Needed:</strong> {extractedFundingAmount || 'Not yet extracted'}</p>
            <p><strong>Purpose:</strong> {extractedFundingPurpose || 'Not yet extracted'}</p>
            <p><strong>Timeline:</strong> {extractedFundingTimeline || 'Not yet extracted'}</p>
            
            <h3>Credit Information</h3>
            <p><strong>Credit Status:</strong> {extractedCreditStatus || 'Not yet extracted'}</p>
            <p><strong>Better Credit Owner:</strong> {extractedBetterCreditOwner || 'Not yet extracted'}</p>
            
            <h3>Previous Financing</h3>
            <p><strong>Financing History:</strong> {extractedPreviousFinancing || 'Not yet extracted'}</p>
            <p><strong>Current Status:</strong> {extractedCurrentFinancingStatus || 'Not yet extracted'}</p>
            
            <h3>Decision Factors</h3>
            <p><strong>Time Sensitivity:</strong> {extractedTimeSensitivity || 'Not yet extracted'}</p>
            <p><strong>Payment Preference:</strong> {extractedPaymentPreference || 'Not yet extracted'}</p>
            <p><strong>Other Options:</strong> {extractedOtherOptions || 'Not yet extracted'}</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App; 