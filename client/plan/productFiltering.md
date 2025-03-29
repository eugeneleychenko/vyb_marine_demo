# Product Filtering Feature Specification

## Overview

This document outlines the implementation of a voice-activated product filtering feature using ElevenLabs AI. This feature will enable users to filter products by mentioning keywords or product categories during conversation with the AI assistant. The results will be displayed in a carousel component for easy browsing.

## Key Components

### 1. ElevenLabs Function Integration

We will implement a new client tool function called `filterProducts` that can be triggered by the ElevenLabs AI when users mention product categories or ambiguous terms like "fuel pump", "grommet", etc.

#### Function Parameters

- `keyword` (String, Required): The keyword or phrase to search for in product names
- `maxResults` (Number, Optional): Maximum number of results to return (default: 5)
- `sortBy` (String, Optional): How to sort results ("price", "name", "relevance")

#### API Data Structure

Our inventory data is fetched from `https://opensheet.elk.sh/1euKbdyTecaQmPZmupqmWfkVhVqp9ZJ4BCTFJHHGmdXI/1` and has the following structure:

```json
[
  {
    "Links": "https://marineengineparts.com/yamaha-90480-20m05-00-grommet",
    "Name": "Yamaha 90480-20M05-00 Grommet",
    "SKU": "YAM90480-20M05",
    "MPN": "90480-20M05-00",
    "UPC": "12345680462",
    "Price": "$5.19",
    "Stock": "3",
    "Description": "Yamaha 90480-20M05-00 Valve pressure Control Grommet.\n\nFits Models: 115, 130, 150...",
    "Additional Details": "\n        \n\n                \n                    Brand\n                    Yamaha Marine\n                \n\n                \n                    Cross Reference / Specs\n                    \n                \n        \n                    \n                        \n                            \n                        \n                        \n                            PROPOSITION 65 WARNING: FOR MORE INFORMATION, VISIT WWW.P65WARNINGS.CA.GOV\n                        \n                    \n    ",
    "Path": "Home  Engine & Drive Parts  Outboards  Yamaha  Engine Mechanical  Yamaha 90480-20M05-00 Grommet",
    "Image URL": "https://cdn11.bigcommerce.com/s-aiepu2kcnu/images/stencil/760x760/products/27483/16034002/YAM90480-20M05__38589.1743225293.jpg?c=1"
  }
]
```

#### Function Response

The function will process this data and return a simplified structure for the AI:

```json
{
  "success": true,
  "count": 3,
  "products": [
    {
      "name": "Yamaha 90480-20M05-00 Grommet",
      "sku": "YAM90480-20M05",
      "mpn": "90480-20M05-00",
      "price": "$5.19",
      "stock": "3",
      "description": "Yamaha 90480-20M05-00 Valve pressure Control Grommet...",
      "imageUrl": "https://cdn11.bigcommerce.com/s-aiepu2kcnu/images/stencil/760x760/products/27483/16034002/YAM90480-20M05__38589.1743225293.jpg?c=1",
      "productUrl": "https://marineengineparts.com/yamaha-90480-20m05-00-grommet",
      "path": "Home  Engine & Drive Parts  Outboards  Yamaha  Engine Mechanical"
    },
    {
      "name": "Caterpillar 135-9819 Gasket-P",
      "sku": "CAT135-9819",
      "mpn": "135-9819",
      "price": "$37.29",
      "stock": "",
      "description": "Caterpillar 135-9819 Gasket-P. Gasket for Sherwood pump P1732C and P1710C.",
      "imageUrl": "https://cdn11.bigcommerce.com/s-aiepu2kcnu/images/stencil/760x760/products/21085/16030652/CAT135-9819__20934.1743219768.jpg?c=1",
      "productUrl": "https://marineengineparts.com/caterpillar-135-9819-gasket-p",
      "path": "Home  Engine & Drive Parts  Diesel Inboard Engine  Caterpillar  Cooling"
    }
  ]
}
```

### 2. Product Carousel Component

When the AI returns filtered product results, they will be displayed in a carousel component:

- Horizontal scrolling interface showing 1-3 products at a time (depending on screen size)
- Each product card will include:
  - Product image
  - Product name
  - Price
  - Stock availability
  - Brief description
  - "Add to Cart" button
  - "View Details" button (links to product page)
- Navigation arrows for moving between products
- Indicator dots showing current position in the carousel

### 3. Integration Flow

1. User speaks to the AI and mentions a product category (e.g., "Show me fuel filters")
2. AI recognizes this as a product filtering request
3. AI calls the `filterProducts` function with the appropriate keyword
4. Backend filters products from inventory containing the keyword
5. Results are returned to the AI
6. AI presents a brief summary of findings (e.g., "I found 5 fuel filters in our inventory")
7. The carousel component is populated and displayed with the matching products
8. User can browse the carousel and take actions on products

## Implementation Details

### Function Code Structure

The `filterProducts` function will be added to the existing `clientTools` object in the `ConversationModal.jsx` component:

```javascript
filterProducts: async (params) => {
  // Get keyword and validate
  const keyword = params.keyword;
  const maxResults = params.maxResults || 5;
  const sortBy = params.sortBy || "relevance";
  
  // Fetch inventory and filter by keyword
  const inventory = await fetchInventory();
  let matches = inventory.filter(product => 
    (product.Name && product.Name.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.Description && product.Description.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.MPN && product.MPN.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  // Sort results if requested
  if (sortBy === "price") {
    matches.sort((a, b) => parseFloat(a.Price.replace(/[$,]/g, '')) - parseFloat(b.Price.replace(/[$,]/g, '')));
  } else if (sortBy === "name") {
    matches.sort((a, b) => a.Name.localeCompare(b.Name));
  }
  
  // Limit results
  matches = matches.slice(0, maxResults);
  
  // Display results in carousel
  if (matches.length > 0) {
    window.dispatchEvent(new CustomEvent('marine:showProductCarousel', { 
      detail: { products: matches } 
    }));
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
}
```

### Carousel Component

We will create a new `ProductCarousel.jsx` component that:

1. Listens for the `marine:showProductCarousel` event
2. Receives the filtered products and displays them in a horizontal carousel
3. Provides navigation controls (arrows, dots)
4. Includes "Add to Cart" functionality for each displayed product
5. Provides "View Details" links to the product pages

```jsx
// Sample ProductCarousel.jsx component structure
import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart, openCart } = useCart();
  
  useEffect(() => {
    const handleShowCarousel = (event) => {
      const { products } = event.detail;
      setProducts(products);
      setCurrentIndex(0);
    };
    
    window.addEventListener('marine:showProductCarousel', handleShowCarousel);
    
    return () => {
      window.removeEventListener('marine:showProductCarousel', handleShowCarousel);
    };
  }, []);
  
  // Carousel rendering logic
  // ...
};
```

### ElevenLabs AI Configuration

The ElevenLabs AI will be configured to understand product filtering requests:

```
When a user asks to see products of a specific type or category, such as:
- "Show me fuel pumps"
- "Do you have any filters?"
- "What grommets do you carry?"
- "I need a new hose"
- "Do you sell Yamaha parts?"
- "I'm looking for Caterpillar gaskets"

Use the filterProducts tool with:
- keyword: The product category or term mentioned (e.g. "fuel pump", "filter", "grommet", "hose", "Yamaha", "Caterpillar")
- maxResults: 5 (default, optional)
- sortBy: "relevance" (default, optional)

Example:
User: "What kind of fuel pumps do you have?"
Action: Call filterProducts with { "keyword": "fuel pump" }

After showing results, ask if they'd like to refine the search, see more results, or if they're interested in any specific product from the carousel.
```

## UI Mockup

```
 ┌─────────────────────────────────────────────────────────┐
 │                                                         │
 │  I found 5 products matching "gasket":                  │
 │                                                         │
 │  ┌─────────┐     ┌─────────┐     ┌─────────┐           │
 │  │         │     │         │     │         │           │
 │  │   IMG   │     │   IMG   │     │   IMG   │           │
 │  │         │     │         │     │         │           │
 │  ├─────────┤     ├─────────┤     ├─────────┤     >     │
 │  │Cat Gasket     │Merc Gasket    │Sea-Doo Gasket       │
 │  │$37.29   │     │$149.95  │     │$89.99   │           │
 │  │Stock: 5 │     │Stock: 12│     │Out of stock         │
 │  │         │     │         │     │         │           │
 │  │Add to   │     │Add to   │     │Add to   │           │
 │  │Cart     │     │Cart     │     │Cart     │           │
 │  │View     │     │View     │     │View     │           │
 │  │Details  │     │Details  │     │Details  │           │
 │  └─────────┘     └─────────┘     └─────────┘           │
 │                                                         │
 │                    ● ○ ○                                │
 │                                                         │
 └─────────────────────────────────────────────────────────┘
```

## Implementation Plan

1. Create the `filterProducts` function in the ConversationModal component
2. Develop the ProductCarousel component
3. Set up the event system for communication between the AI and the carousel
4. Configure the ElevenLabs AI to understand product filtering requests
5. Implement UI styling for the carousel
6. Test with various product categories and keywords
7. Refine the response format based on testing results

## Future Enhancements

- Add support for filtering by additional fields beyond name and description
- Implement fuzzy matching for misspelled keywords
- Add price range filtering ("Show me gaskets under $50")
- Enable category filtering based on Path field ("Show me Yamaha outboard parts")
- Add voice-driven carousel navigation ("show me the next one", "previous product")
- Implement advanced filtering by combining multiple criteria
- Add "Compare Products" functionality for similar items 