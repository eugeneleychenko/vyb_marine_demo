# ElevenLabs AI Integration Plan

## Overview
This document outlines the plan to integrate ElevenLabs AI conversation with our existing image upload functionality. The system will extract product data from uploaded images and inject this information into the AI conversation to provide context-aware interactions about marine parts.

## Implementation Steps

### 1. Enhance Image Upload Component

#### Current Functionality
- We already have a file uploader that extracts SKU from filenames
- The system connects to a product catalog API and displays matching products
- Users can add products to cart

#### Required Enhancements
- Add a "Start Conversation" button next to matching products
- Store the complete product data for use in the conversation

```jsx
// Add to FileUploader.jsx
const [selectedProduct, setSelectedProduct] = useState(null);

// Add a button to product matches
<button
  onClick={() => onStartConversation(product)}
  className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
>
  Discuss with AI
</button>
```

### 2. Create Conversation Component

Create a new component that will handle the conversation with the ElevenLabs AI:

```jsx
// ConversationModal.jsx
import { useEffect, useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';

const ConversationModal = ({ isOpen, onClose, productData }) => {
  const [isStarted, setIsStarted] = useState(false);
  
  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => console.log('Connected to ElevenLabs AI'),
    onDisconnect: () => console.log('Disconnected from ElevenLabs AI'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error)
  });

  // Start conversation with product context
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
      
      // Start the conversation with our specific agent ID
      // We're using the ID from the environment variables
      await conversation.startSession({
        agentId: 'sLkZceb7wwYGFIpbKZgT',
        overrides
      });
      
      setIsStarted(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [conversation, productData]);
  
  // End conversation when modal closes
  const endConversation = useCallback(async () => {
    if (isStarted) {
      await conversation.endSession();
      setIsStarted(false);
    }
  }, [conversation, isStarted]);
  
  // Start conversation when modal opens
  useEffect(() => {
    if (isOpen && productData && !isStarted) {
      startConversation();
    }
    
    // Clean up when component unmounts
    return () => {
      endConversation();
    };
  }, [isOpen, productData, startConversation, endConversation, isStarted]);
  
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
          <p>Speak to ask questions about this marine part</p>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={endConversation}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            End Conversation
          </button>
          
          {!isStarted && (
            <button
              onClick={startConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationModal;
```

### 3. Connect File Uploader to Conversation Component

Update the main component to handle the integration:

```jsx
// In index.jsx
import { useState } from 'react';
import ConversationModal from './components/ConversationModal';

// Add state for conversation modal
const [conversationModalOpen, setConversationModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);

// Function to handle starting a conversation about a product
const handleStartConversation = (product) => {
  setSelectedProduct(product);
  setConversationModalOpen(true);
};

// Add to the App component's render method
return (
  <CartProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Existing header and content */}
      
      {/* Add the conversation modal */}
      {selectedProduct && (
        <ConversationModal 
          isOpen={conversationModalOpen}
          onClose={() => setConversationModalOpen(false)}
          productData={selectedProduct}
        />
      )}
      
      {/* Existing cart drawer */}
    </div>
  </CartProvider>
);
```

### 4. Update FileUploader Component

Update the FileUploader component to pass the onStartConversation prop:

```jsx
// In FileUploader.jsx
const FileUploader = ({ onFileUpload, onStartConversation }) => {
  // Existing code...
  
  // Add to the product item rendering
  {matchingProducts.map((product, index) => (
    <div key={index} className="mt-4 p-4 border rounded-lg">
      <div className="flex items-start">
        {/* Existing product display */}
        <div className="flex-1">
          <p className="font-medium text-blue-600">{product.Name}</p>
          <p>SKU: {product.SKU}</p>
          <p>Price: {product.Price}</p>
          {product.Stock && <p>Stock: {product.Stock}</p>}
          <div className="flex mt-2">
            <button
              onClick={() => handleAddToCart(product)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={() => onStartConversation(product)}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Discuss with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
};
```

### 5. Install ElevenLabs React SDK

Install the necessary dependency:

```bash
npm install @11labs/react
```

### 6. Environment Configuration

We already have an `.env` file with the necessary environment variables:

```
REACT_APP_ELEVENLABS_API_KEY=128498ff7866a6e9bce6e996585a4045
REACT_APP_ELEVENLABS_AGENT_ID=sLkZceb7wwYGFIpbKZgT
```

Update the ConversationModal component to use these environment variables:

```jsx
// In ConversationModal.jsx
const agentId = process.env.REACT_APP_ELEVENLABS_AGENT_ID || 'sLkZceb7wwYGFIpbKZgT';

// When starting the session:
await conversation.startSession({
  agentId,
  overrides
});
```

