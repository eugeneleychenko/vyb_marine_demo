# Marine Demo Client

This is the client application for the Marine Demo project. It provides a file uploader with SKU extraction functionality and an interactive checkout component.

## Features

1. **File Uploader**
   - Drag and drop image upload
   - Automatic SKU extraction from filenames
   - Preview of uploaded images
   - Mimics the behavior of the server-side implementation

2. **Interactive Checkout**
   - Product listing grid
   - Cart drawer with slide-in animation
   - Add/remove items from cart
   - Update quantities
   - Real-time total calculation

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Usage

### File Uploader

The file uploader component extracts SKUs from image filenames following the pattern `{SKU}__{id}.jpg`. It displays the uploaded image, filename, and extracted SKU.

```jsx
import FileUploader from './components/FileUploader';

const handleFileUpload = (file, extractedSku) => {
  console.log('File uploaded:', file);
  console.log('Extracted SKU:', extractedSku);
};

<FileUploader onFileUpload={handleFileUpload} />
```

### Interactive Checkout

The checkout component displays a list of products and provides a sliding drawer for the cart.

```jsx
import { InteractiveCheckout } from './components/ui/interactive-checkout';

const products = [
  {
    id: "1",
    name: "Product Name",
    price: 129.99,
    category: "Category",
    image: "image-url.jpg",
    color: "Color",
  },
  // More products...
];

<InteractiveCheckout products={products} />
```

Or use the demo component with default products:

```jsx
import { InteractiveCheckoutDemo } from './components/ui/interactive-checkout';

<InteractiveCheckoutDemo />
``` 