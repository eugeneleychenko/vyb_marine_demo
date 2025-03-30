import React, { useState, useEffect } from 'react';
import ProductCarousel from './ProductCarousel';
import AllProductsWall from './AllProductsWall';

const ProductDisplay = () => {
  const [showingFilteredResults, setShowingFilteredResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Listen for the showProductCarousel event
  useEffect(() => {
    const handleShowCarousel = (event) => {
      console.log('[PRODUCT DISPLAY] Showing filtered results');
      
      try {
        // Extract products from the event
        const eventDetail = event.detail;
        console.log('[PRODUCT DISPLAY] Event detail structure:', Object.keys(eventDetail || {}));
        
        // Handle both possible event detail structures
        let products;
        if (eventDetail && eventDetail.products) {
          // Standard format we expect
          products = eventDetail.products;
        } else if (Array.isArray(eventDetail)) {
          // Handle if products are sent directly as array
          products = eventDetail;
        } else {
          // Unknown format
          console.error('[PRODUCT DISPLAY] Unknown event detail format:', eventDetail);
          products = [];
        }
        
        console.log('[PRODUCT DISPLAY] Extracted products count:', products?.length || 0);
        if (products?.length > 0) {
          console.log('[PRODUCT DISPLAY] First product sample:', products[0]);
        }
        
        // Store the products and update display
        setFilteredProducts(products || []);
        setShowingFilteredResults(true);
      } catch (error) {
        console.error('[PRODUCT DISPLAY] Error handling carousel event:', error);
        setFilteredProducts([]);
        setShowingFilteredResults(false);
      }
    };
    
    // Listen for custom event to clear filtered results
    const handleClearFilteredResults = () => {
      console.log('[PRODUCT DISPLAY] Clearing filtered results');
      setShowingFilteredResults(false);
    };
    
    window.addEventListener('marine:showProductCarousel', handleShowCarousel);
    window.addEventListener('marine:clearFilteredResults', handleClearFilteredResults);
    
    return () => {
      window.removeEventListener('marine:showProductCarousel', handleShowCarousel);
      window.removeEventListener('marine:clearFilteredResults', handleClearFilteredResults);
    };
  }, []);
  
  // Function to clear filtered results
  const clearFilteredResults = () => {
    window.dispatchEvent(new CustomEvent('marine:clearFilteredResults'));
  };
  
  return (
    <div className="relative">
      {showingFilteredResults ? (
        <div className="transition-opacity duration-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-blue-700">Recommended Products</h2>
            <button
              onClick={clearFilteredResults}
              className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 flex items-center"
            >
              <span>View All Products</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <ProductCarousel initialProducts={filteredProducts} />
          {/* Debug info */}
          <div className="hidden">
            Debug: Passing {filteredProducts.length} products to carousel
          </div>
        </div>
      ) : (
        <div className="transition-opacity duration-300">
          <AllProductsWall />
        </div>
      )}
    </div>
  );
};

export default ProductDisplay; 