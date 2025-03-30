import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import FileUploader from './components/FileUploader';
import { CartProvider, useCart } from './components/CartContext';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import ProductDisplay from './components/ProductDisplay';
import ImageUploadDrawer from './components/ImageUploadDrawer';
import InlineConversation from './components/InlineConversation';
import chatbotAvatar from './assets/images/chatbot-avatar.png';

import './index.css';

// Create a component that uses the cart context hooks
const AppContent = () => {
  // Replace modal state with active conversation state
  const [conversationActive, setConversationActive] = useState(false);
  const [imageUploadDrawerOpen, setImageUploadDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Add ref for the conversation component
  const conversationRef = useRef(null);
  
  // Access cart context functions directly at component level
  const { addToCart, openCart } = useCart();

  // Update handleFileUpload to start a new conversation with product context
  const handleFileUpload = (file, extractedSku, matchingProducts) => {
    console.log('File uploaded:', file);
    console.log('Extracted SKU:', extractedSku);
    
    if (matchingProducts && matchingProducts.length > 0) {
      console.log('Matching products found:', matchingProducts);
      
      // Display detailed information about the first matching product
      const product = matchingProducts[0];
      console.log('Product Details:');
      console.log('Name:', product.Name);
      console.log('SKU:', product.SKU);
      console.log('Price:', product.Price);
      console.log('Stock:', product.Stock || 'Not available');
      console.log('Description:', product.Description);
      console.log('MPN:', product.MPN);
      console.log('UPC:', product.UPC);
      console.log('Link:', product.Links);
      console.log('Image URL:', product.Image_URL || product["Image URL"]);
      
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

  // Function to handle opening the image upload drawer
  const handleOpenImageUploader = () => {
    // If a conversation is active, end it first
    if (conversationActive && conversationRef.current) {
      console.log('[WORKFLOW] Ending current conversation before image upload');
      conversationRef.current.endConversation();
      setConversationActive(false);
    }
    
    // Then open the image upload drawer
    setImageUploadDrawerOpen(true);
  };

  // Function to handle starting a conversation about a product
  const handleStartConversation = (product = null) => {
    console.log('Starting conversation:', product ? `about product: ${product.Name}` : 'general conversation');
    setSelectedProduct(product);
    setConversationActive(true);
    // Close the image upload drawer if it's open
    if (imageUploadDrawerOpen) {
      setImageUploadDrawerOpen(false);
    }
  };

  // Toggle conversation based on current state
  const toggleConversation = () => {
    const newState = !conversationActive;
    console.log(`[AVATAR] Toggle conversation: ${newState ? 'starting' : 'ending'} conversation`);
    
    // Allow some time for previous state changes to finish
    setTimeout(() => {
      setConversationActive(newState);
    }, 10);
  };

  // Function to handle adding product to cart (from voice command)
  const handleAddToCartEvent = useCallback((event) => {
    console.log('[EVENT HANDLER] cart:addItem event received:', event);
    
    const { product, quantity = 1 } = event.detail;
    
    if (product) {
      console.log(`[EVENT HANDLER] Adding ${quantity} of ${product.name} to cart`);
      
      try {
        // Add the product to cart (multiple times if quantity > 1)
        for (let i = 0; i < quantity; i++) {
          console.log(`[EVENT HANDLER] Adding item iteration ${i+1}/${quantity}`);
          addToCart(product);
        }
        
        // Open the cart drawer to show the added product
        console.log('[EVENT HANDLER] Opening cart drawer');
        openCart();
        
        console.log('[EVENT HANDLER] Successfully added product to cart');
      } catch (error) {
        console.error('[EVENT HANDLER] Error adding product to cart:', error);
      }
    } else {
      console.error('[EVENT HANDLER] Product not found in event detail:', event.detail);
    }
  }, [addToCart, openCart]);

  // Listen for openImageUpload event
  const handleOpenImageUploadEvent = useCallback(() => {
    console.log('[EVENT HANDLER] marine:openImageUpload event received');
    // Use the new handler to properly end conversation before opening
    handleOpenImageUploader();
  }, [conversationActive]);

  useEffect(() => {
    console.log('[SETUP] Adding event listeners');
    
    // Add event listener for addToCart
    window.addEventListener('cart:addItem', handleAddToCartEvent);
    
    // Add event listener for openImageUpload
    window.addEventListener('marine:openImageUpload', handleOpenImageUploadEvent);
    
    // Clean up
    return () => {
      console.log('[CLEANUP] Removing event listeners');
      window.removeEventListener('cart:addItem', handleAddToCartEvent);
      window.removeEventListener('marine:openImageUpload', handleOpenImageUploadEvent);
    };
  }, [handleAddToCartEvent, handleOpenImageUploadEvent]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - made sticky */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Image Upload Icon on the left side */}
            <button
              onClick={handleOpenImageUploader}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Upload Image"
              title="Upload Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Marine Parts</h1>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center">
            {/* Chatbot Avatar - circular and clickable */}
            <button
              onClick={toggleConversation}
              className={`w-24 h-24 mr-4 rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                ${conversationActive ? 'ring-2 ring-blue-500 shadow-md avatar-pulse' : 'hover:shadow-md'}`}
              title={conversationActive ? "End Conversation" : "Start Conversation"}
            >
              <img 
                src={chatbotAvatar}
                alt="AI Assistant" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MGYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+";
                }}
              />
            </button>
            <CartIcon />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Replace ProductCarousel with ProductDisplay */}
        <ProductDisplay />
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Find Marine Parts Easily</h2>
          <p className="mb-6 text-gray-600">
            Use our AI assistant to search for marine parts or upload images to find exact matches.
            Our system can extract SKUs from images and find the right parts for your needs.
          </p>
          
          {/* Chatbot Avatar has been moved to the header */}
        </div>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Image Upload Drawer */}
      <ImageUploadDrawer 
        isOpen={imageUploadDrawerOpen}
        onClose={() => setImageUploadDrawerOpen(false)}
        onFileUpload={handleFileUpload}
        onStartConversation={handleStartConversation}
      />
      
      {/* Replace modal with inline conversation - Added ref */}
      <InlineConversation 
        ref={conversationRef}
        isActive={conversationActive}
        onClose={() => setConversationActive(false)}
        productData={selectedProduct}
      />
    </div>
  );
};

const App = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />); 