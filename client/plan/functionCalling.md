# Voice-Controlled Add-to-Cart Function for ElevenLabs AI

## Overview

This document outlines the implementation of a voice-controlled "Add to Cart" feature using ElevenLabs AI. This feature will enable users to add products to their shopping cart directly through voice commands while conversing with the AI assistant about specific marine products.

## Implementation Steps

### 1. Define the Client Tool in ElevenLabs UI

In the ElevenLabs interface, create a new client tool with the following configuration:

- **Tool Type**: Client
- **Name**: `addToCart`
- **Description**: "Adds the current product being discussed to the shopping cart"
- **Parameters**:
  - `productId` (String, Required): "SKU/ID of the product to add to cart"
  - `quantity` (Number, Optional): "Quantity to add, defaults to 1 if not specified"
- **Wait for response**: ✓ (checked)

### 2. Implement the Function in the ConversationModal Component

Add the `addToCart` function to the `clientTools` object in the `ConversationModal.jsx` component:

```javascript
// In ConversationModal.jsx
const conversation = useConversation({
  onConnect: () => console.log('Connected to ElevenLabs AI'),
  onDisconnect: () => console.log('Disconnected from ElevenLabs AI'),
  onMessage: (message) => console.log('Message:', message),
  onError: (error) => console.error('Error:', error),
  clientTools: {
    // Existing tools...
    
    // Add the new addToCart tool
    addToCart: (params) => {
      console.log('[CLIENT TOOL] addToCart called with params:', params);
      
      // Validate parameters
      if (!params || !params.productId) {
        return Promise.resolve("Failed to add product to cart. Missing product ID.");
      }
      
      // Get the quantity (default to 1 if not provided)
      const quantity = params.quantity ? parseInt(params.quantity) : 1;
      
      try {
        // Get current product from props
        const product = productData;
        
        // If the ID matches the current product, add it to cart
        if (product && product.SKU === params.productId) {
          // Format the product for cart (using existing format)
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
          
          // Dispatch an event to add to cart
          window.dispatchEvent(new CustomEvent('marine:addToCart', { 
            detail: { product: cartProduct, quantity } 
          }));
          
          return Promise.resolve(`Successfully added ${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.Name} to your cart.`);
        }
        
        return Promise.resolve("Could not find the specified product. Please try again with a valid product ID.");
      } catch (error) {
        console.error('Error adding product to cart:', error);
        return Promise.resolve("An error occurred while adding the product to cart. Please try again.");
      }
    }
  }
});
```

### 3. Add Event Listener in the Main Component

Add an event listener in your main application component (e.g., `index.jsx`) to handle the cart addition events:

```javascript
// In index.jsx
import { useState, useEffect } from 'react';
// ... other imports

const App = () => {
  // ... existing code
  
  useEffect(() => {
    // Add event listener for addToCart
    const handleAddToCart = (event) => {
      const { product, quantity = 1 } = event.detail;
      
      if (product) {
        console.log(`Adding ${quantity} of ${product.name} to cart`);
        
        // Access cart context functions
        const { addToCart, openCart } = useCart();
        
        // Add the product to cart (multiple times if quantity > 1)
        for (let i = 0; i < quantity; i++) {
          addToCart(product);
        }
        
        // Open the cart drawer to show the added product
        openCart();
      }
    };
    
    window.addEventListener('marine:addToCart', handleAddToCart);
    
    // Clean up
    return () => {
      window.removeEventListener('marine:addToCart', handleAddToCart);
    };
  }, []);
  
  // ... rest of component
};
```

### 4. Configure the AI to Understand Voice Commands

In the ElevenLabs agent configuration, add examples of voice commands in the prompt section to help the AI recognize cart addition requests:
