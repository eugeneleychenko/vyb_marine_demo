import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const AllProductsWall = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, openCart } = useCart();
  
  // Fetch all products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://opensheet.elk.sh/1euKbdyTecaQmPZmupqmWfkVhVqp9ZJ4BCTFJHHGmdXI/1');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[PRODUCTS WALL] Successfully fetched ${data.length} products`);
        setProducts(data);
      } catch (error) {
        console.error('[PRODUCTS WALL] Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Handle adding to cart
  const handleAddToCart = (product) => {
    const formattedProduct = {
      id: product.SKU,
      name: product.Name,
      price: typeof product.Price === 'string' 
        ? parseFloat(product.Price.replace(/[$,]/g, '')) || 0
        : (typeof product.Price === 'number' ? product.Price : 0),
      category: product.Path?.split('  ')[1] || 'Marine Parts',
      image: product["DG URL"],
      color: '',
      description: product.Description,
      sku: product.SKU,
      stock: product.Stock,
    };
    
    addToCart(formattedProduct);
    openCart();
  };
  
  if (loading) {
    return (
      <div className="my-6 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading products...</p>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="my-6 p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No products available</p>
      </div>
    );
  }
  
  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">All Marine Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.SKU} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="h-48 bg-gray-200">
              <img 
                src={product["DG URL"]} 
                alt={product.Name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm md:text-base mb-1 truncate" title={product.Name}>
                {product.Name}
              </h3>
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
    </div>
  );
};

export default AllProductsWall; 