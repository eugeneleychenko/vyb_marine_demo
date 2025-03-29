import React from 'react';
import { createRoot } from 'react-dom/client';
import FileUploader from './components/FileUploader';
import { InteractiveCheckoutDemo } from './components/ui/interactive-checkout';

import './index.css';

const App = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-10 text-center">Marine Demo</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Image Upload with SKU Extraction</h2>
        <FileUploader onFileUpload={handleFileUpload} />
      </div>
      
      <div className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-semibold mb-6">Interactive Checkout Demo</h2>
        <InteractiveCheckoutDemo />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />); 