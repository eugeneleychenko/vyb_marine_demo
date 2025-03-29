import React from 'react';
import { useCart } from './CartContext';

const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useCart();
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = typeof item.product.price === 'number' ? item.product.price : 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Helper function to format price displays
  const formatPrice = (price, quantity = 1) => {
    const numericPrice = typeof price === 'number' ? price : 0;
    return (numericPrice * quantity).toFixed(2);
  };

  return (
    <>
      {/* Cart Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button 
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.product.id} className="flex py-4 border-b">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.product.image} 
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium">
                        <h3>{item.product.name}</h3>
                        <p className="ml-4">${formatPrice(item.product.price, item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">SKU: {item.product.sku || item.product.id}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 border-r"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 border-l"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex justify-between py-2 text-base font-medium">
              <p>Subtotal</p>
              <p>${formatPrice(calculateTotal())}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
            <div className="mt-4">
              <button
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={cart.length === 0}
              >
                Checkout
              </button>
            </div>
            <div className="mt-2">
              <button
                className="w-full border border-gray-300 bg-white py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                onClick={toggleCart}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCart}
        />
      )}
    </>
  );
};

export default CartDrawer; 