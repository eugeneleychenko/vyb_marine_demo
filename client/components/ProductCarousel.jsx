import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart, openCart } = useCart();
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [totalSlides, setTotalSlides] = useState(0);
  
  // Determine how many products to show based on screen width
  const calculateVisibleProducts = () => {
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile: 1 product
    if (width < 1024) return 2; // Tablet: 2 products
    return 3; // Desktop: 3 products
  };
  
  // Update visible products when window resizes or products/currentIndex changes
  useEffect(() => {
    const handleResize = () => {
      const productsPerSlide = calculateVisibleProducts();
      setVisibleProducts(
        products.slice(currentIndex, currentIndex + productsPerSlide)
      );
      
      // Calculate total number of slides
      setTotalSlides(Math.ceil(products.length / productsPerSlide));
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [products, currentIndex]);
  
  // Listen for the showProductCarousel event
  useEffect(() => {
    const handleShowCarousel = (event) => {
      const { products } = event.detail;
      console.log('[CAROUSEL] Received products:', products);
      setProducts(products);
      setCurrentIndex(0);
    };
    
    window.addEventListener('marine:showProductCarousel', handleShowCarousel);
    
    return () => {
      window.removeEventListener('marine:showProductCarousel', handleShowCarousel);
    };
  }, []);
  
  // Handle navigation
  const goToNext = () => {
    const productsPerSlide = calculateVisibleProducts();
    if (currentIndex + productsPerSlide < products.length) {
      setCurrentIndex(currentIndex + productsPerSlide);
    }
  };
  
  const goToPrev = () => {
    const productsPerSlide = calculateVisibleProducts();
    if (currentIndex - productsPerSlide >= 0) {
      setCurrentIndex(currentIndex - productsPerSlide);
    }
  };
  
  const goToSlide = (index) => {
    const productsPerSlide = calculateVisibleProducts();
    setCurrentIndex(index * productsPerSlide);
  };
  
  // Handle adding to cart
  const handleAddToCart = (product) => {
    const formattedProduct = {
      id: product.SKU,
      name: product.Name,
      price: typeof product.Price === 'string' 
        ? parseFloat(product.Price.replace(/[$,]/g, '')) || 0
        : (typeof product.Price === 'number' ? product.Price : 0),
      category: product.Path?.split('  ')[1] || 'Marine Parts',
      image: product["Image URL"],
      color: '',
      description: product.Description,
      sku: product.SKU,
      stock: product.Stock,
    };
    
    addToCart(formattedProduct);
    openCart();
  };
  
  // If no products, don't render anything
  if (products.length === 0) {
    return null;
  }
  
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
          {products.slice(currentIndex, currentIndex + calculateVisibleProducts()).map((product, index) => (
            <div key={product.SKU} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200">
                <img 
                  src={product["Image URL"]} 
                  alt={product.Name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm md:text-base mb-1 truncate" title={product.Name}>
                  {product.Name}
                </h4>
                <p className="text-lg font-bold text-blue-600">{product.Price}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {product.Stock ? `Stock: ${product.Stock}` : "Out of stock"}
                </p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2" title={product.Description}>
                  {product.Description ? 
                    (product.Description.length > 100 ? 
                      product.Description.substring(0, 100) + '...' : 
                      product.Description) : 
                    'No description available'}
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 text-sm"
                    disabled={!product.Stock}
                  >
                    Add to Cart
                  </button>
                  <a 
                    href={product.Links} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-center bg-gray-100 text-gray-800 py-1 px-4 rounded hover:bg-gray-200 text-sm"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Next button */}
        {currentIndex + calculateVisibleProducts() < products.length && (
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
      
      {/* Indicator dots */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full ${
                Math.floor(currentIndex / calculateVisibleProducts()) === i ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel; 