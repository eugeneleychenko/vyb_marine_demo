import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import FileUploader from './components/FileUploader';
import { CartProvider, useCart } from './components/CartContext';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import ConversationModal from './components/ConversationModal';

import './index.css';

// Create a component that uses the cart context hooks
const AppContent = () => {
  // Add state for conversation modal
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Access cart context functions directly at component level
  const { addToCart, openCart } = useCart();

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
    } else {
      console.log('No matching products found');
    }
  };

  // Function to handle starting a conversation about a product
  const handleStartConversation = (product) => {
    console.log('Starting conversation about product:', product.Name);
    setSelectedProduct(product);
    setConversationModalOpen(true);
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

  useEffect(() => {
    console.log('[SETUP] Adding cart:addItem event listener');
    
    // Add event listener for addToCart
    window.addEventListener('cart:addItem', handleAddToCartEvent);
    
    // Clean up
    return () => {
      console.log('[CLEANUP] Removing cart:addItem event listener');
      window.removeEventListener('cart:addItem', handleAddToCartEvent);
    };
  }, [handleAddToCartEvent]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - made sticky */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Marine Parts</h1>
          <CartIcon />
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Image Upload with SKU Extraction</h2>
          <p className="mb-4 text-gray-600">
            Upload an image to extract SKU and find matching marine parts. 
            Once a match is found, you can add it directly to your cart or discuss it with our AI assistant.
          </p>
          <FileUploader 
            onFileUpload={handleFileUpload} 
            onStartConversation={handleStartConversation} 
          />
        </div>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Add the conversation modal */}
      {selectedProduct && (
        <ConversationModal 
          isOpen={conversationModalOpen}
          onClose={() => setConversationModalOpen(false)}
          productData={selectedProduct}
        />
      )}
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