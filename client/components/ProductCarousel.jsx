import React, { useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';

const ProductCarousel = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState(initialProducts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);
  const { addToCart } = useCart();

  // Effect to update products when initialProducts changes
  useEffect(() => {
    console.log('[PRODUCT CAROUSEL] Received initialProducts:', initialProducts);
    console.log('[PRODUCT CAROUSEL] initialProducts length:', initialProducts?.length || 0);
    setProducts(initialProducts);
    setCurrentIndex(0);
  }, [initialProducts]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Carousel navigation functions
  const goToNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Function to add product to cart
  const handleAddToCart = (product) => {
    // Format the product for the cart
    const cartProduct = {
      id: product.id || product.ID || Math.random().toString(36).substring(2, 9),
      name: product.Name || product.name,
      price: parseFloat(product.Price || product.price || '0').toFixed(2),
      quantity: 1,
      inStock: product['In Stock'] === 'Yes' || product.inStock === true,
      description: product.Description || product.description,
      imageURL: product.ImageUrl || product.imageURL || 'https://placehold.co/300x200?text=No+Image'
    };
    
    addToCart(cartProduct);
  };
  
  if (products.length === 0) {
    console.log('[PRODUCT CAROUSEL] No products available to display');
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">
        No matching products found. Try different search criteria.
      </div>
    );
  }
  
  console.log('[PRODUCT CAROUSEL] Rendering', products.length, 'products');
  // Determine visible items based on window width
  let visibleItems = 1;
  if (windowWidth >= 768) visibleItems = 2;
  if (windowWidth >= 1024) visibleItems = 3;
  
  // Get the products to display
  const displayProducts = products.slice(
    currentIndex,
    Math.min(currentIndex + visibleItems, products.length)
  );
  
  return (
    <div className="product-carousel my-6 p-4 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Found {products.length} products matching your search:
      </h3>
      
      <div className="relative">
        {/* Previous button */}
        {currentIndex > 0 && (
          <button 
            onClick={goToPrev} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow hover:bg-gray-100"
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Products container */}
        <div className="flex gap-4 overflow-hidden py-2">
          {displayProducts.map((product, index) => {
            // Log each product to debug
            console.log(`[PRODUCT CAROUSEL] Product ${index}:`, product);
            
            // Get DG URL with fallback
            const imageUrl = product["DG URL"] || product.ImageUrl || product.imageURL || "https://via.placeholder.com/300x200?text=No+Image";
            
            // Get product name with fallback
            const productName = product.Name || product.name || "Unknown Product";
            
            // Get price with fallback
            const price = product.Price || product.price || "Price not available";
            
            // Get stock info with fallback
            const stockInfo = product.Stock ? `Stock: ${product.Stock}` : (
              product.inStock ? "In Stock" : "Out of stock"
            );
            
            // Get description with fallback
            const description = product.Description || product.description || "No description available";
            
            // Get link with fallback
            const productLink = product.Links || product.link || "#";
            
            return (
              <div key={product.SKU || product.id || index} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 bg-white rounded-lg shadow overflow-hidden">
                <div className="h-48 bg-gray-200">
                  <img 
                    src={imageUrl} 
                    alt={productName} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm md:text-base mb-1 truncate" title={productName}>
                    {productName}
                  </h4>
                  <p className="text-lg font-bold text-blue-600">{price}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    {stockInfo}
                  </p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2" title={description}>
                    {description && description.length > 100 ? 
                      description.substring(0, 100) + '...' : 
                      description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 text-sm"
                    >
                      Add to Cart
                    </button>
                    <a 
                      href={productLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-center bg-gray-100 text-gray-800 py-1 px-4 rounded hover:bg-gray-200 text-sm"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Next button */}
        {currentIndex + visibleItems < products.length && (
          <button 
            onClick={goToNext} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow hover:bg-gray-100"
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel; 