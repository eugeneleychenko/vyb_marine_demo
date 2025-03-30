import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCart } from './CartContext';

const FileUploader = ({ onFileUpload, hideProductDisplay = false }) => {
  const [file, setFile] = useState(null);
  const [extractedSku, setExtractedSku] = useState(null);
  const [catalogData, setCatalogData] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, openCart } = useCart();

  // Fetch catalog data when component mounts
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetch('https://opensheet.elk.sh/1euKbdyTecaQmPZmupqmWfkVhVqp9ZJ4BCTFJHHGmdXI/1');
        const data = await response.json();
        setCatalogData(data);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      }
    };
    
    fetchCatalogData();
  }, []);

  const findMatchingProducts = (sku) => {
    if (!catalogData.length) return [];
    
    // First try exact match on SKU
    const exactMatches = catalogData.filter(product => 
      product.SKU === sku
    );
    
    if (exactMatches.length > 0) return exactMatches;
    
    // If no exact matches, try partial matches
    const partialMatches = catalogData.filter(product => 
      product.SKU.includes(sku) || (sku.length > 3 && product.SKU.includes(sku.substring(0, Math.min(sku.length, 10))))
    );
    
    return partialMatches;
  };

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsLoading(true);
      
      // Extract SKU from filename using regex similar to server implementation
      const filename = uploadedFile.name;
      const skuMatch = filename.match(/(.+?)__\d+/);
      const extractedSku = skuMatch ? skuMatch[1] : filename.split('.')[0];
      
      setExtractedSku(extractedSku);
      
      // Find matching products in the catalog
      const matches = findMatchingProducts(extractedSku);
      setMatchingProducts(matches);
      console.log('Matching products:', matches);
      
      setIsLoading(false);
      
      // Call parent callback only
      if (onFileUpload) {
        onFileUpload(uploadedFile, extractedSku, matches);
      }
    }
  }, [catalogData, onFileUpload]);

  const handleAddToCart = (product) => {
    // Format the product to match the expected format in the cart
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
    
    console.log('Adding product to cart with price:', product.Price, '→', cartProduct.price);
    addToCart(cartProduct);
    openCart();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the image here...</p>
        ) : (
          <div>
            <p className="mb-2">Drag and drop an image here, or click to select a file</p>
            <p className="text-sm text-gray-500">Supported formats: JPG, JPEG, PNG, GIF</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Uploaded Image</h3>
          <div className="flex items-start">
            <div className="w-24 h-24 mr-4 bg-gray-100 rounded overflow-hidden">
              <img 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
            </div>
            {matchingProducts.length > 0 ? (
              <div>
                <p><span className="font-medium">Product Name:</span> {matchingProducts[0].Name}</p>
                <p><span className="font-medium">Price:</span> {matchingProducts[0].Price}</p>
                <p><span className="font-medium">Qty:</span> {matchingProducts[0].Stock || "Out of stock"}</p>
                <p className="text-xs text-gray-500 mt-1">SKU: {extractedSku}</p>
              </div>
            ) : (
              <div>
                <p><span className="font-medium">Filename:</span> {file.name}</p>
                <p><span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
                <p><span className="font-medium">Extracted SKU:</span> {extractedSku}</p>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <p className="mt-4 text-center text-gray-500">Looking up product information...</p>
          ) : !hideProductDisplay && matchingProducts.length > 0 ? (
            <div>
              <h3 className="font-medium mt-4 mb-2">Matching Products</h3>
              {matchingProducts.map((product, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                  <p className="font-medium text-blue-600">{product.Name}</p>
                  <p className="text-sm">SKU: {product.SKU}</p>
                  <p className="text-sm">Price: {product.Price}</p>
                  {product.Stock && <p className="text-sm text-gray-600">Stock: {product.Stock}</p>}
                  <div className="mt-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : matchingProducts.length === 0 && !hideProductDisplay ? (
            <p className="mt-4 text-center text-gray-500">No matching products found for this image.</p>
          ) : (
            <p className="mt-4 text-center text-gray-500">
              {matchingProducts.length > 0 
                ? "" 
                : "No matching products found."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 