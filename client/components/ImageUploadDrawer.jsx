import React from 'react';
import FileUploader from './FileUploader';

const ImageUploadDrawer = ({ isOpen, onClose, onFileUpload, onStartConversation }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer that slides in from the left */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto
          w-full sm:w-[90%] md:w-[500px]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full relative flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Image Upload</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1">
            <p className="mb-4 text-gray-600">
              Upload an image to extract SKU and find matching marine parts. 
              Once a match is found, you can add it directly to your cart or discuss it with our AI assistant.
            </p>
            
            <FileUploader 
              onFileUpload={onFileUpload} 
              onStartConversation={onStartConversation} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploadDrawer; 