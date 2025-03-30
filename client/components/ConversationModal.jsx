import { useEffect, useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { getSignedUrl } from '../utils/elevenLabsAuth';

// In Vite, when importing assets from the assets directory, we need to use relative paths
// You'll need to add this image to the assets/images directory
import chatbotAvatar from '../assets/images/chatbot-avatar.png';

// API endpoint for inventory
const INVENTORY_API = 'https://opensheet.elk.sh/1euKbdyTecaQmPZmupqmWfkVhVqp9ZJ4BCTFJHHGmdXI/1';

const ConversationModal = ({ isOpen, onClose, productData }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const connectionAttemptedRef = useRef(false);
  const inventoryCacheRef = useRef(null);
  
  // Use agent ID from environment variables with fallback
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'sLkZceb7wwYGFIpbKZgT';
  
  // Helper function to fetch inventory data
  const fetchInventory = async () => {
    if (inventoryCacheRef.current) {
      return inventoryCacheRef.current;
    }
    
    try {
      console.log('[INVENTORY] Fetching inventory data from API...');
      const response = await fetch(INVENTORY_API);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[INVENTORY] Successfully fetched ${data.length} products`);
      
      // Cache the data for future use
      inventoryCacheRef.current = data;
      return data;
    } catch (error) {
      console.error('[INVENTORY] Error fetching inventory:', error);
      throw error;
    }
  };

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs AI');
      setIsLoading(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs AI');
      // Only reset the state if we intentionally ended the session
      if (connectionAttemptedRef.current) {
        setIsStarted(false);
      }
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Error:', error);
      setError(`Error: ${error.message || 'Unknown error'}`);
      setIsStarted(false);
      setIsLoading(false);
    },
    clientTools: {
      // Add the searchProducts tool
      searchProducts: async (params) => {
        console.log('[CLIENT TOOL] searchProducts called with params:', params);
        
        if (!params || !params.query) {
          return Promise.resolve({
            success: false,
            message: "Search query is required",
            products: []
          });
        }
        
        try {
          const inventory = await fetchInventory();
          const query = params.query.toLowerCase();
          
          const results = inventory.filter(product => 
            (product.Name && product.Name.toLowerCase().includes(query)) || 
            (product.Description && product.Description.toLowerCase().includes(query)) ||
            (product.SKU && product.SKU.toLowerCase().includes(query)) ||
            (product.MPN && product.MPN.toLowerCase().includes(query))
          );
          
          console.log(`[CLIENT TOOL] Search results: Found ${results.length} products matching "${params.query}"`);
          
          return {
            success: true,
            message: `Found ${results.length} products matching "${params.query}"`,
            products: results
          };
        } catch (error) {
          console.error('[CLIENT TOOL] Error searching products:', error);
          return {
            success: false,
            message: "An error occurred while searching for products",
            products: []
          };
        }
      },
      
      // Add the filterProducts function
      filterProducts: async (params) => {
        console.log('[CLIENT TOOL] filterProducts called with params:', params);
        
        // Get keyword and validate
        const keyword = params.keyword;
        if (!keyword) {
          console.error('[CLIENT TOOL] filterProducts: Missing keyword parameter');
          return Promise.resolve({
            success: false,
            message: "Keyword parameter is required",
            products: []
          });
        }
        
        const maxResults = params.maxResults || 5;
        const sortBy = params.sortBy || "relevance";
        
        console.log(`[CLIENT TOOL] filterProducts: Searching for "${keyword}", max results: ${maxResults}, sort by: ${sortBy}`);
        
        try {
          // Fetch inventory and filter by keyword - only look at product Name
          const inventory = await fetchInventory();
          let matches = inventory.filter(product => 
            (product.Name && product.Name.toLowerCase().includes(keyword.toLowerCase()))
          );
          
          console.log(`[CLIENT TOOL] filterProducts: Found ${matches.length} matches for "${keyword}"`);
          
          // Sort results if requested
          if (sortBy === "price") {
            matches.sort((a, b) => parseFloat(a.Price?.replace(/[$,]/g, '') || 0) - parseFloat(b.Price?.replace(/[$,]/g, '') || 0));
            console.log('[CLIENT TOOL] filterProducts: Sorted results by price');
          } else if (sortBy === "name") {
            matches.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
            console.log('[CLIENT TOOL] filterProducts: Sorted results by name');
          }
          
          // Limit results
          matches = matches.slice(0, maxResults);
          console.log(`[CLIENT TOOL] filterProducts: Limited to ${matches.length} results`);
          console.log('[CLIENT TOOL] filterProducts: Matches data:', JSON.stringify(matches));
          
          // Display results in carousel
          if (matches.length > 0) {
            console.log('[CLIENT TOOL] filterProducts: Dispatching showProductCarousel event with', matches.length, 'products');
            window.dispatchEvent(new CustomEvent('marine:showProductCarousel', { 
              detail: { products: matches } 
            }));
            console.log('[CLIENT TOOL] filterProducts: Event dispatched successfully');
          } else {
            console.log('[CLIENT TOOL] filterProducts: No matches found, not dispatching event');
          }
          
          // Return formatted results
          return {
            success: true,
            count: matches.length,
            products: matches.map(p => ({
              name: p.Name,
              sku: p.SKU,
              mpn: p.MPN,
              price: p.Price,
              stock: p.Stock || "Out of stock",
              description: p.Description ? p.Description.substring(0, 100) + (p.Description.length > 100 ? '...' : '') : 'No description available',
              imageUrl: p["Image URL"],
              productUrl: p.Links,
              path: p.Path ? p.Path.substring(0, p.Path.lastIndexOf(p.Name)).trim() : ''
            }))
          };
        } catch (error) {
          console.error('[CLIENT TOOL] filterProducts error:', error);
          return {
            success: false,
            message: "An error occurred while filtering products",
            products: []
          };
        }
      },
      
      // Add the addToCart tool
      addToCart: async (params) => {
        console.log('[CLIENT TOOL] addToCart called with params:', params);
        
        // Validate parameters
        if (!params || !params.productId) {
          console.error('[CLIENT TOOL] addToCart: Missing productId parameter');
          return Promise.resolve("Failed to add product to cart. Missing product ID.");
        }
        
        // Get the quantity (default to 1 if not provided)
        const quantity = params.quantity ? parseInt(params.quantity) : 1;
        console.log('[CLIENT TOOL] addToCart: Quantity parsed as', quantity);
        
        try {
          // First check if we have a preselected product
          let product = productData;
          
          // If not, or if the SKU doesn't match, search in our inventory
          if (!product || product.SKU !== params.productId) {
            console.log('[CLIENT TOOL] addToCart: Searching in inventory for SKU:', params.productId);
            const inventory = await fetchInventory();
            product = inventory.find(p => p.SKU === params.productId);
          }
          
          console.log('[CLIENT TOOL] addToCart: Found product:', product);
          
          // If we found a product, add it to cart
          if (product) {
            // Format the product for cart
            const cartProduct = {
              id: product.SKU,
              name: product.Name,
              price: typeof product.Price === 'string' 
                ? parseFloat(product.Price.replace(/[$,]/g, '')) || 0
                : (typeof product.Price === 'number' ? product.Price : 0),
              category: product.Path?.split('  ')[1] || 'Marine Parts',
              image: product.Image_URL || product["Image URL"],
              color: '',
              description: product.Description,
              sku: product.SKU,
              stock: product.Stock,
            };
            
            console.log('[CLIENT TOOL] addToCart: Formatted cart product:', cartProduct);
            
            // Dispatch an event to add to cart
            console.log('[CLIENT TOOL] addToCart: Dispatching cart:addItem event with quantity', quantity);
            window.dispatchEvent(new CustomEvent('cart:addItem', { 
              detail: { product: cartProduct, quantity } 
            }));
            console.log('[CLIENT TOOL] addToCart: Event dispatched successfully');
            
            return Promise.resolve(`Successfully added ${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.Name} to your cart.`);
          } else {
            console.error('[CLIENT TOOL] addToCart: Product not found with SKU:', params.productId);
            return Promise.resolve(`Could not find a product with SKU: ${params.productId}. Please try searching for a product first.`);
          }
        } catch (error) {
          console.error('Error adding product to cart:', error);
          return Promise.resolve("An error occurred while adding the product to cart. Please try again.");
        }
      },
      
      // Add the openImageUpload function
      openImageUpload: () => {
        console.log('[CLIENT TOOL] openImageUpload called');
        
        try {
          // Dispatch an event to open the image upload drawer
          window.dispatchEvent(new CustomEvent('marine:openImageUpload'));
          console.log('[CLIENT TOOL] openImageUpload: Event dispatched successfully');
          
          return Promise.resolve('Image upload panel opened. You can now upload an image to find marine parts.');
        } catch (error) {
          console.error('[CLIENT TOOL] openImageUpload error:', error);
          return Promise.resolve('Sorry, there was an error opening the image upload panel. Please try again.');
        }
      }
    }
  });

  // Start conversation with or without product context
  const startConversation = useCallback(async () => {
    if (isStarted || isLoading) return; // Prevent multiple connection attempts
    
    try {
      setIsLoading(true);
      setError(null);
      connectionAttemptedRef.current = true;
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL for authentication
      const signedUrl = await getSignedUrl(agentId);
      
      // Prepare overrides object based on whether we have product data
      const overrides = {
        agent: {
          firstMessage: productData 
            ? `I see you're looking at the ${productData.Name}. How can I help you with this product?`
            : "Hey, thanks for coming to Lighthouse Marine Supply. Can I help you find something or do you have an image of the product that you want to replace?",
          prompt: {
            prompt: JSON.stringify(productData 
              ? {
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
                }
              : {
                  context: `You are a helpful marine parts assistant specializing in boats, jet skis, outboard motors, and related marine equipment.
                  
                  You can help users find products by asking about their needs and then using the searchProducts tool.
                  Once you find products, you can recommend them and add them to the cart using the addToCart tool.
                  
                  When users are interested in a product:
                  1. Use searchProducts to find products matching their description
                  2. Present the options clearly with product names, prices, and brief descriptions
                  3. If they want to purchase, use addToCart with the correct SKU
                  
                  Be helpful, conversational, and guide the user through the process of finding marine parts.
                  
                  Our inventory includes many marine products from brands like Mercury Marine, Yamaha, Sea-Doo, and many others.
                  `
                }
            )
          }
        }
      };
      
      // Start the conversation with the signed URL
      await conversation.startSession({
        signedUrl,
        overrides
      });
      
      setIsStarted(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message}`);
      connectionAttemptedRef.current = false;
      setIsLoading(false);
    }
  }, [conversation, productData, agentId, isStarted, isLoading]);
  
  // End conversation when modal closes
  const endConversation = useCallback(async () => {
    if (isStarted) {
      try {
        setIsLoading(true);
        await conversation.endSession();
        connectionAttemptedRef.current = false;
        setIsStarted(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error ending conversation:', error);
        setIsLoading(false);
      }
    }
  }, [conversation, isStarted]);
  
  // Preload inventory data when component mounts
  useEffect(() => {
    // Fetch inventory data to populate the cache
    fetchInventory().catch(error => {
      console.error('Error preloading inventory data:', error);
    });
  }, []);
  
  // Start conversation when modal opens
  useEffect(() => {
    let mounted = true;
    
    if (isOpen && !isStarted && !connectionAttemptedRef.current && !isLoading) {
      startConversation();
    }
    
    // Clean up when component unmounts or modal closes
    return () => {
      mounted = false;
      if (!isOpen && connectionAttemptedRef.current) {
        endConversation();
      }
    };
  }, [isOpen, startConversation, endConversation, isStarted, isLoading]);
  
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
        
        {/* Only show product info if we have a product */}
        {productData && (
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
        )}
        
        <div className="text-center mb-4">
          {error ? (
            <p className="text-red-500 mb-2">{error}</p>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 mr-3 bg-blue-100 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={chatbotAvatar}
                  alt="AI Assistant" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MGYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci11c2VyIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+";
                  }}
                />
              </div>
              <div className="text-left">
                <p className="text-gray-800 font-medium">Marine AI Assistant</p>
                <p className="text-xs text-gray-500">
                  {isLoading ? 'Connecting...' : 
                    conversation.status === 'connected' 
                      ? 'AI is listening...' 
                      : conversation.status === 'connecting' 
                        ? 'Connecting...' 
                        : conversation.status === 'disconnected' && isStarted 
                          ? 'Reconnecting...'
                          : conversation.status}
                </p>
                {conversation.isSpeaking && (
                  <p className="text-xs mt-1 text-blue-500">AI is speaking...</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={endConversation}
            disabled={isLoading || !isStarted}
            className={`px-4 py-2 border border-gray-300 rounded ${
              isLoading || !isStarted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            End Conversation
          </button>
          
          {(!isStarted || error) && (
            <button
              onClick={startConversation}
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {error ? 'Retry' : 'Start Conversation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationModal; 