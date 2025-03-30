# Plan: Combine Image Upload and Conversation Flow

## Objective
Allow users to upload images while already in a conversation without ending or restarting the conversation session.

## Current Behavior
• When a user opens the Image Upload Drawer, they must initiate a new conversation to discuss the results of the upload.  
• This breaks the flow if they were already chatting with the AI.

## Proposed Approach
1. Maintain the existing conversation session whenever the Image Upload Drawer is opened.  
2. After extracting SKU or product details from the uploaded image, inject a message/event directly into the ongoing conversation context.  
   - Leverage the same conversation ID/session to add the upload-related results or info.  
   - Use existing conversation APIs or the conversation store to append the image data as a "message" from the user.  
3. The AI assistant can then respond to the newly supplied info without requiring a fresh "startSession" call.  
4. Remove the separate "Discuss with AI" button related to the upload drawer. Instead, rely on the ongoing conversation.  

## Action Items
• Update the logic in the Image Upload Drawer handler to dispatch an event (or call the relevant conversation method) with the new data.  
• Ensure the conversation remains active and that the session ID is carried over.  
• Verify that the real-time conversation UI (InlineConversation) automatically displays the new "image upload" message and any subsequent AI response.  

## Implementation Details and Code Examples

### 1. Key Files to Modify

- `client/components/ImageUploadDrawer.jsx`: Remove the "Discuss with AI" button and update to inject data into conversation
- `client/components/FileUploader.jsx`: Update to handle image upload results  
- `client/index.jsx`: Update to support conversation continuation
- `client/components/InlineConversation.jsx`: Add a method to handle incoming image/product data

### 2. Code Example: Update ImageUploadDrawer.jsx

```jsx
// In ImageUploadDrawer.jsx
import React from 'react';
import FileUploader from './FileUploader';

// Remove onStartConversation from props since we won't need a separate button
const ImageUploadDrawer = ({ isOpen, onClose, onFileUpload }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer that slides in from the left */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto
          w-full sm:w-[90%] md:w-[500px]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full relative flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Image Upload</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1">
            <p className="mb-4 text-gray-600">
              Upload an image to extract SKU and find matching marine parts. 
              Results will automatically appear in your ongoing conversation.
            </p>
            
            {/* Remove onStartConversation prop */}
            <FileUploader 
              onFileUpload={onFileUpload} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploadDrawer;
```

### 3. Code Example: Update FileUploader.jsx to Inject Data into Conversation

```jsx
// In FileUploader.jsx

// Modify onDrop function to dispatch an event with product data
const onDrop = useCallback((acceptedFiles) => {
  const uploadedFile = acceptedFiles[0];
  if (uploadedFile) {
    setFile(uploadedFile);
    setIsLoading(true);
    
    // Extract SKU from filename using regex similar to server implementation
    const filename = uploadedFile.name;
    const skuMatch = filename.match(/(.+?)__\d+/);
    const extractedSku = skuMatch ? skuMatch[1] : filename.split('.')[0];
    
    setExtractedSku(extractedSku);
    
    // Find matching products in the catalog
    const matches = findMatchingProducts(extractedSku);
    setMatchingProducts(matches);
    console.log('Matching products:', matches);
    
    setIsLoading(false);
    
    // Call parent callback
    if (onFileUpload) {
      onFileUpload(uploadedFile, extractedSku, matches);
    }
    
    // IMPORTANT: Dispatch event to inject product data into conversation
    if (matches && matches.length > 0) {
      const product = matches[0]; // Use the first match
      window.dispatchEvent(new CustomEvent('marine:injectProductToConversation', {
        detail: { product, source: 'imageUpload' }
      }));
    }
  }
}, [catalogData, onFileUpload]);

// Remove the "Discuss with AI" button from the product display
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
          {/* Remove "Discuss with AI" button */}
        </div>
      </div>
    </div>
  </div>
))}
```

### 4. Code Example: Update InlineConversation.jsx to Handle Injected Data

```jsx
// In InlineConversation.jsx

// Add this in the component
const [injectedProduct, setInjectedProduct] = useState(null);

// Add this to the existing useEffect block or create a new one
useEffect(() => {
  // Handler to inject product info into conversation
  const handleInjectProduct = (event) => {
    if (!isActive || !isStarted) {
      // If conversation isn't active, activate it
      setInjectedProduct(event.detail.product);
      if (!isActive) {
        // Call your existing method to activate conversation
        console.log('Auto-activating conversation due to image upload');
      }
    } else {
      // Conversation is already active, inject the product info
      injectProductIntoConversation(event.detail.product);
    }
  };
  
  // Add event listener
  window.addEventListener('marine:injectProductToConversation', handleInjectProduct);
  
  // Clean up
  return () => {
    window.removeEventListener('marine:injectProductToConversation', handleInjectProduct);
  };
}, [isActive, isStarted]);

// Inject product info into conversation when already active
const injectProductIntoConversation = async (product) => {
  if (!product) return;
  
  try {
    console.log('[CONVERSATION] Injecting product into conversation:', product.Name);
    
    // Option 1: Using the Eleven Labs sendTextMessage API
    const message = `I found this product from the image: ${product.Name} (SKU: ${product.SKU}, Price: ${product.Price}). Would you like more information about it?`;
    
    // This simulates a user message with the product info
    await conversation.sendTextMessage({ 
      text: message, 
      source: 'user'  // Mark as coming from the user
    });
    
    // Optionally, you can also update the UI to show that a product was injected
    // This depends on your UI implementation
    
  } catch (error) {
    console.error('Error injecting product into conversation:', error);
  }
};

// Modify your startConversation function to check for injected product
const startConversation = useCallback(async () => {
  if (isStarted || isLoading) return;
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Request microphone permission
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Get signed URL for authentication
    const signedUrl = await getSignedUrl(agentId);
    
    // Use injectedProduct if available, otherwise use productData
    const productToUse = injectedProduct || productData;
    
    // Prepare context with product information
    const overrides = {
      agent: {
        firstMessage: productToUse
          ? `I see you've uploaded an image of the ${productToUse.Name}. How can I help you with this product?`
          : "Hey, thanks for coming to Lighthouse Marine Supply. Can I help you find something or do you have an image of the product that you want to replace?",
        // ... rest of your existing overrides
      }
    };
    
    // Start the conversation with the signed URL
    await conversation.startSession({
      signedUrl,
      overrides
    });
    
    setIsStarted(true);
    setIsLoading(false);
    
    // Clear injectedProduct after using it
    if (injectedProduct) {
      setInjectedProduct(null);
    }
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    setError(`Failed to start conversation: ${error.message}`);
    setIsLoading(false);
  }
}, [conversation, productData, injectedProduct, agentId, isStarted, isLoading]);
```

### 5. Code Example: Update index.jsx

```jsx
// In index.jsx
// Modify handleFileUpload function

const handleFileUpload = (file, extractedSku, matchingProducts) => {
  console.log('File uploaded:', file);
  console.log('Extracted SKU:', extractedSku);
  
  if (matchingProducts && matchingProducts.length > 0) {
    console.log('Matching products found:', matchingProducts);
    
    // Log details for debugging
    const product = matchingProducts[0];
    console.log('Product Details:', product);
    
    // If conversation isn't active yet, activate it
    if (!conversationActive) {
      setConversationActive(true);
      
      // Optionally set the product to provide initial context
      // This may not be necessary since we'll inject via event
      setSelectedProduct(product);
    }
    
    // Close drawer after upload
    setImageUploadDrawerOpen(false);
  } else {
    console.log('No matching products found');
    
    // You might want to show an error message or inject a "no products found" message
    // into the conversation if it's active
    if (conversationActive) {
      // Dispatch an event to notify the conversation
      window.dispatchEvent(new CustomEvent('marine:injectProductToConversation', {
        detail: { 
          error: true, 
          message: `No products found matching SKU: ${extractedSku}` 
        }
      }));
    }
  }
};

// Update ImageUploadDrawer component
<ImageUploadDrawer 
  isOpen={imageUploadDrawerOpen}
  onClose={() => setImageUploadDrawerOpen(false)}
  onFileUpload={handleFileUpload}
  // Remove onStartConversation prop
/>
```

## Alternative Implementation: End-and-Restart Approach

Based on ElevenLabs API limitations, a more reliable approach would be:

1. End the current conversation when the image upload drawer opens
2. Start a new conversation with product context as soon as an image is uploaded

### Key Files to Modify

- `client/index.jsx`: Update to end conversation when drawer opens, and restart it after upload
- `client/components/ImageUploadDrawer.jsx`: Update to signal conversation end
- `client/components/FileUploader.jsx`: Update to trigger new conversation with context

### Code Example: Update index.jsx

```jsx
// In index.jsx

// Update the function that opens the image upload drawer
const handleOpenImageUploader = () => {
  // If a conversation is active, end it first
  if (conversationActive) {
    console.log('[WORKFLOW] Ending current conversation before image upload');
    // Call the end conversation method on InlineConversation component via ref
    if (conversationRef.current) {
      conversationRef.current.endConversation();
    }
    setConversationActive(false);
  }
  
  // Then open the image upload drawer
  setImageUploadDrawerOpen(true);
};

// Add ref for the conversation component
const conversationRef = useRef(null);

// Modified handleFileUpload function
const handleFileUpload = (file, extractedSku, matchingProducts) => {
  console.log('File uploaded:', file);
  console.log('Extracted SKU:', extractedSku);
  
  if (matchingProducts && matchingProducts.length > 0) {
    console.log('Matching products found:', matchingProducts);
    
    // Get the first matching product
    const product = matchingProducts[0];
    console.log('Product Details:', product);
    
    // Close drawer after upload
    setImageUploadDrawerOpen(false);
    
    // Start a new conversation with the product context
    setSelectedProduct(product);
    setConversationActive(true);
  } else {
    console.log('No matching products found');
    // Optionally start a conversation anyway to inform the user
    setConversationActive(true);
    setSelectedProduct(null);
  }
};

// In the JSX part:
<ImageUploadDrawer 
  isOpen={imageUploadDrawerOpen}
  onClose={() => setImageUploadDrawerOpen(false)}
  onFileUpload={handleFileUpload}
/>

// Update the InlineConversation component to expose end method via ref
<InlineConversation 
  ref={conversationRef}
  isActive={conversationActive}
  onClose={() => setConversationActive(false)}
  productData={selectedProduct}
/>
```

### Code Example: Update InlineConversation.jsx

```jsx
// In InlineConversation.jsx - Update to use forwardRef

import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
// ... other imports

// Use forwardRef to expose methods to the parent component
const InlineConversation = forwardRef(({ isActive, onClose, productData }, ref) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // ... other state variables
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    endConversation: async () => {
      await endConversation();
    }
  }));
  
  // Your existing endConversation function
  const endConversation = useCallback(async () => {
    if (isStarted) {
      try {
        setIsLoading(true);
        await conversation.endSession();
        setIsStarted(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error ending conversation:', error);
        setIsLoading(false);
      }
    }
  }, [conversation, isStarted]);
  
  // ... rest of the component
});

export default InlineConversation;
```

### Code Example: Update ImageUploadDrawer.jsx

```jsx
// No significant changes needed as the drawer just needs to be opened
// The parent component (index.jsx) will handle ending the conversation

// If you want to make it more clear in the UI:
<div className="flex-1">
  <p className="mb-4 text-gray-600">
    Upload an image to extract SKU and find matching marine parts.
    A new conversation will start with the product details after uploading.
  </p>
  
  <FileUploader 
    onFileUpload={onFileUpload} 
  />
</div>
```

## Expected Outcome
• When a user clicks to open the image upload drawer, any active conversation ends
• After successfully uploading an image, a new conversation starts automatically with the product context
• This creates a clean transition between conversations while maintaining a seamless experience
• The user doesn't need to click any additional buttons to start discussing the uploaded product
