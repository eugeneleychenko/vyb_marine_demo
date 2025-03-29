import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploader = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [extractedSku, setExtractedSku] = useState(null);
  const [catalogData, setCatalogData] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
              <div className="mt-2 text-sm">
                <p>See console for complete product details</p>
                <p className="text-blue-600">First match: {matchingProducts[0].Name}</p>
                <p>SKU: {matchingProducts[0].SKU}</p>
                <p>Price: {matchingProducts[0].Price}</p>
                {matchingProducts[0].Stock && <p>Stock: {matchingProducts[0].Stock}</p>}
              </div>
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