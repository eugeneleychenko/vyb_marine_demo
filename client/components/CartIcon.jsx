import React from 'react';
import { useCart } from './CartContext';

const CartIcon = () => {
  const { cart, toggleCart } = useCart();
  
  // Calculate total number of items in cart
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <div className="relative">
      <button 
        onClick={toggleCart}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Shopping cart"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
      </button>
      
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon; 