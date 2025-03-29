import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import FileUploader from './components/FileUploader';
import { CartProvider } from './components/CartContext';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import ConversationModal from './components/ConversationModal';

import './index.css';

const App = () => {
  // Add state for conversation modal
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  return (
    <CartProvider>
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
    </CartProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />); 