'use client';

import { useState, useRef, DragEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type QuickUploadButtonProps = {
  className?: string;
};

export default function QuickUploadButton({ className = '' }: QuickUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch available galleries when modal opens
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setUploadError(null);
    setUploadSuccess(false);
    setSelectedFiles([]);
    setPreviews([]);
    setTitles([]);
    
    try {
      const response = await fetch('/api/galleries');
      if (response.ok) {
        const data = await response.json();
        setGalleries(data.galleries || []);
      }
    } catch (error) {
      console.error('Failed to fetch galleries:', error);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    handleAddFiles(newFiles);
  };

  const handleAddFiles = (files: File[]) => {
    // Filter for only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setUploadError('Please select image files (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    // Create preview URLs
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    
    // Create default titles from filenames
    const newTitles = imageFiles.map(file => file.name.split('.')[0]);
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setTitles(prev => [...prev, ...newTitles]);
    
    // Clear any previous errors
    setUploadError(null);
    
    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Clean up preview URL
    URL.revokeObjectURL(previews[index]);
    
    // Remove file, preview, and title
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, newTitle: string) => {
    const newTitles = [...titles];
    newTitles[index] = newTitle;
    setTitles(newTitles);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setUploadError('Chọn ít nhất 1 file để tải lên');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      
      // Add each file to form data
      selectedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
        if (titles[index]) {
          formData.append(`titles[${index}]`, titles[index]);
        }
      });
      
      // Add gallery ID if selected
      if (selectedGallery) {
        formData.append('galleryId', selectedGallery);
      }
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        setUploadProgress(100);
        setUploadSuccess(true);
        
        // Clear cache for newly uploaded images
        const clearImageCache = async () => {
          try {
            // Clear browser cache for image requests
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
            }
            
            // Force reload images by adding a timestamp query parameter
            const imageElements = document.querySelectorAll('img');
            imageElements.forEach(img => {
              if (img.src) {
                const url = new URL(img.src);
                url.searchParams.set('t', Date.now().toString());
                img.src = url.toString();
              }
            });
          } catch (error) {
            console.error('Error clearing cache:', error);
          }
        };
        
        // If uploaded to a gallery, redirect to that gallery after a delay
        if (selectedGallery) {
          const gallerySlug = galleries.find(g => g.sys.id === selectedGallery)?.fields?.slug;
          if (gallerySlug) {
            setTimeout(() => {
              clearImageCache();
              setIsModalOpen(false);
              router.push(`/galleries/${gallerySlug}`);
              router.refresh();
            }, 1500);
          }
        } else {
          setTimeout(() => {
            clearImageCache();
            setIsModalOpen(false);
            router.refresh(); // Refresh the current page to show new uploads
          }, 1500);
        }
      } else {
        const error = await response.json();
        setUploadError(error.error || 'Upload failed');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An error occurred during upload');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`fixed z-10 bottom-8 right-8 bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-110 ${className}`}
        aria-label="Quick upload"
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      </button>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Tải lên hình ảnh</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {uploadSuccess ? (
                <div className="text-center py-6">
                  <div className="mb-4 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-green-600">Tải lên thành công!</p>
                </div>
              ) : (
                <form onSubmit={handleUpload}>
                  <div className="mb-4">
                    <div
                      onClick={handleFileClick}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`cursor-pointer block w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                        isDragging
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-300 hover:border-amber-500'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-600">Click để chọn hình ảnh hoặc kéo và thả</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Chọn nhiều file với Ctrl/Cmd
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Selected Images ({selectedFiles.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="border rounded p-2">
                            <div className="relative aspect-square mb-2">
                              <Image
                                src={previews[index]}
                                alt={`Preview ${index}`}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <input
                              type="text"
                              value={titles[index] || ''}
                              onChange={(e) => updateTitle(index, e.target.value)}
                              className="w-full text-sm p-1 border rounded mb-1"
                              placeholder="Title"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {galleries.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add to Gallery (optional)
                      </label>
                      <select
                        value={selectedGallery}
                        onChange={(e) => setSelectedGallery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">Select a gallery</option>
                        {galleries.map((gallery) => (
                          <option key={gallery.sys.id} value={gallery.sys.id}>
                            {gallery.fields.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {isUploading && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-center mt-1 text-gray-600">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {uploadError}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      disabled={isUploading || selectedFiles.length === 0}
                    >
                      Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 