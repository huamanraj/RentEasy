import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { storage, STORAGE } from '../services/appwrite';

const ImageGallery = ({ images = [], video = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  useEffect(() => {
    const processMedia = () => {
      const processedImages = (images || []).map(image => {
        if (typeof image === 'string' && image.startsWith('http')) {
          if (image.includes('/storage/buckets/') && image.includes('/files/http')) {
            const matches = image.match(/files\/([^\/]+)\/view/);
            if (matches && matches[1] && STORAGE?.IMAGES) {
              return storage.getFileView(STORAGE.IMAGES, matches[1]);
            }
          }
          return image;
        }
        
        if (typeof image === 'string' && STORAGE?.IMAGES) {
          return storage.getFileView(STORAGE.IMAGES, image);
        }
        
        if (typeof image === 'object' && image.fileId && STORAGE?.IMAGES) {
          return storage.getFileView(STORAGE.IMAGES, image.fileId);
        }
        
        return image;
      });
      
      let processedVideo = null;
      if (video) {
        if (typeof video === 'string' && video.startsWith('http')) {
          if (video.includes('/storage/buckets/') && video.includes('/files/http')) {
            const matches = video.match(/files\/([^\/]+)\/view/);
            if (matches && matches[1] && STORAGE?.VIDEOS) {
              processedVideo = storage.getFileView(STORAGE.VIDEOS, matches[1]);
            } else {
              processedVideo = video;
            }
          } else {
            processedVideo = video;
          }
        }
        else if (typeof video === 'string' && STORAGE?.VIDEOS) {
          processedVideo = storage.getFileView(STORAGE.VIDEOS, video);
        }
        else if (typeof video === 'object' && video.fileId && STORAGE?.VIDEOS) {
          processedVideo = storage.getFileView(STORAGE.VIDEOS, video.fileId);
        }
        else {
          processedVideo = video;
        }
      }
      
      const items = [...processedImages];
      if (processedVideo) {
        items.push({ type: 'video', url: processedVideo });
      }
      
      setMediaItems(items);
    };

    processMedia();
  }, [images, video]);

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }
  
  const isCurrentItemVideo = () => {
    return typeof mediaItems[currentIndex] === 'object' && mediaItems[currentIndex]?.type === 'video';
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    setShowVideo(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    setShowVideo(false);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const getCurrentMediaItem = () => {
    const item = mediaItems[currentIndex];
    if (typeof item === 'object' && item.type === 'video') {
      return (
        <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden">
          {showVideo ? (
            <video 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
              src={item.url}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={() => setShowVideo(true)}
                className="bg-white bg-opacity-70 rounded-full p-4 hover:bg-opacity-90 transition duration-200"
              >
                <Play size={32} className="text-primary ml-1" />
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <img
        src={item}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-contain rounded-xl"
        onClick={() => openLightbox(currentIndex)}
      />
    );
  };

  const renderThumbnails = () => {
    return (
      <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
        {mediaItems.map((item, index) => {
          if (typeof item === 'object' && item.type === 'video') {
            return (
              <button
                key={`video-${index}`}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowVideo(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden relative border-2 ${
                  index === currentIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play size={20} className="text-white" />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={`img-${index}`}
              onClick={() => {
                setCurrentIndex(index);
                setShowVideo(false);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={item}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>
    );
  };

  const renderLightbox = () => {
    if (!lightboxOpen) return null;
    
    const lightboxItem = mediaItems[lightboxIndex];
    const isVideo = typeof lightboxItem === 'object' && lightboxItem?.type === 'video';
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onClick={closeLightbox}
      >
        <button 
          className="absolute top-4 right-4 text-white z-10"
          onClick={closeLightbox}
        >
          <X size={32} />
        </button>
        
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-40 transition"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
          }}
        >
          <ChevronLeft size={32} className="text-white" />
        </button>
        
        <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
          {isVideo ? (
            <video 
              src={lightboxItem.url}
              controls 
              autoPlay 
              className="max-w-full max-h-[90vh]"
            />
          ) : (
            <img
              src={lightboxItem}
              alt={`Full size ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh]"
            />
          )}
        </div>
        
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-40 transition"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
          }}
        >
          <ChevronRight size={32} className="text-white" />
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
          {lightboxIndex + 1} / {mediaItems.length}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="aspect-[16/9] relative bg-gray-100 rounded-xl overflow-hidden">
        {mediaItems.length > 0 && (
          <>
            {getCurrentMediaItem()}
            
            {mediaItems.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded-full">
                  {currentIndex + 1} / {mediaItems.length}
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      {mediaItems.length > 1 && renderThumbnails()}
      
      {renderLightbox()}
    </div>
  );
};

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        fileId: PropTypes.string,
        url: PropTypes.string
      })
    ])
  ),
  video: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      fileId: PropTypes.string,
      url: PropTypes.string
    })
  ])
};

export default ImageGallery;
