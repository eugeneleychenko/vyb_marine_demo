import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCart } from './CartContext';

const FileUploader = ({ onFileUpload, onStartConversation }) => {
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
            <div>
              <p><span className="font-medium">Filename:</span> {file.name}</p>
              <p><span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
              <p><span className="font-medium">Extracted SKU:</span> {extractedSku}</p>
            </div>
          </div>
          
          {isLoading ? (
            <p className="mt-4 text-center text-gray-500">Looking up product information...</p>
          ) : matchingProducts.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-semibold">Found {matchingProducts.length} matching product(s):</h4>
              
              {matchingProducts.map((product, index) => (
                <div key={index} className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-start">
                    <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={product.Image_URL || product["Image URL"]} 
                        alt={product.Name}
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-600">{product.Name}</p>
                      <p>SKU: {product.SKU}</p>
                      <p>Price: {product.Price}</p>
                      {product.Stock && <p>Stock: {product.Stock}</p>}
                      <div className="flex mt-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => onStartConversation(product)}
                          className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Discuss with AI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-center text-gray-500">No matching products found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 