import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Loader, AlertCircle, X } from 'lucide-react';
import useLocation from '../hooks/useLocation';
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../context/AuthContext';
import EmailVerificationAlert from './common/EmailVerificationAlert';

const FlatForm = ({ onSubmit, isSubmitting = false, initialData = null, isEditMode = false, submitButtonText = 'Post Flat' }) => {
  const { emailVerified } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    rent: '',
    address: '',
    type: '',
    description: '',
    amenities: [],
    googleMapLink: '',
    images: [],
    video: null,
    isAvailable: true,
    latitude: null,
    longitude: null,
    location: null,
    ownerNumber: ''
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  
  const { 
    location, 
    getCurrentPosition, 
    loading: locationLoading, 
    error: locationError 
  } = useLocation();

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || '',
        rent: initialData.rent || '',
        address: initialData.address || '',
        type: initialData.type || '',
        description: initialData.description || '',
        amenities: initialData.amenities || [],
        googleMapLink: initialData.googleMapLink || '',
        isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null,
        location: initialData.latitude && initialData.longitude ? {
          latitude: initialData.latitude,
          longitude: initialData.longitude
        } : null,
        ownerNumber: initialData.ownerNumber || '',
      }));

      if (initialData.images && initialData.images.length > 0) {
        setImagePreviews(initialData.images.map(imageId => 
          `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_FLAT_IMAGES_BUCKET_ID}/files/${imageId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`
        ));
      }

      if (initialData.video) {
        setVideoPreview(
          `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_FLAT_VIDEOS_BUCKET_ID}/files/${initialData.video}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`
        );
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleAmenityChange = (e) => {
    const { checked, name } = e.target;
    if (checked) {
      setFormData(prevData => ({
        ...prevData,
        amenities: [...prevData.amenities, name]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        amenities: prevData.amenities.filter(amenity => amenity !== name)
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 5) {
      setError(`You can only upload up to 5 images (${imageFiles.length} already selected)`);
      return;
    }
    
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      newPreviews.push(URL.createObjectURL(file));
    });
    setImagePreviews(newPreviews);
    
    setFormData(prevData => ({
      ...prevData,
      images: newImageFiles
    }));
    
    setError('');
  };
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) {
      setError('Video must be less than 20MB');
      return;
    }
    
    setVideoFile(file);
    
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
    
    setFormData(prevData => ({
      ...prevData,
      video: file
    }));
    
    setError('');
  };
  
  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    setFormData(prev => ({
      ...prev,
      images: newImageFiles
    }));
  };
  
  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview('');
    setVideoFile(null);
    setFormData(prev => ({ ...prev, video: null }));
  };
  
  const handleGetLocation = () => {
    getCurrentPosition();
  };

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setFormData(prevData => ({
        latitude: location.latitude,
        longitude: location.longitude,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }));
      toast.success('Location successfully obtained!');
    }
  }, [location]);

  useEffect(() => {
    if (locationError) {
      toast.error(locationError);
    }
  }, [locationError]);
  
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreviews, videoPreview]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.rent || !formData.address || !formData.type) {
      setError('Please fill out all required fields');
      return;
    }
    
    if (!isEditMode && (!formData.images || formData.images.length === 0)) {
      setError('Please upload at least one image');
      return;
    }
    
    if (!formData.ownerNumber) {
      setError('Please provide a contact number');
      return;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.ownerNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      if (onSubmit) {
        await onSubmit(formData, (filename, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [filename]: progress
          }));
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to post property. Please try again.');
    }
  };

  useEffect(() => {
    if (success) {
      setFormData({
        title: '',
        rent: '',
        address: '',
        type: '',
        description: '',
        amenities: [],
        googleMapLink: '',
        images: [],
        video: null,
        isAvailable: true,
        latitude: null,
        longitude: null,
        location: null,
        ownerNumber: ''
      });
      
      setImageFiles([]);
      setVideoFile(null);
      setImagePreviews([]);
      setVideoPreview('');
      setUploadProgress({});
    }
  }, [success]);

  const handleAvailabilityChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      isAvailable: e.target.checked
    }));
  };

  return (
    <div>
      {!emailVerified ? (
        <EmailVerificationAlert 
          message="You need to verify your email address before posting or editing property listings."
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow border border-gray-200">
          <h2 className="text-2xl font-semibold text-textDark mb-6">
            {isEditMode ? 'Edit Your Flat' : 'Post Your Flat'}
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="title" 
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
              placeholder="e.g., Cozy 1BHK near Park" 
              required
            />
          </div>

          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700">Rent per Month (₹) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              id="rent" 
              value={formData.rent}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
              placeholder="15000" 
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address <span className="text-red-500">*</span></label>
            <textarea 
              id="address" 
              value={formData.address}
              onChange={handleChange}
              rows="3" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
              placeholder="Street, Area, City, Pincode"
              required
            ></textarea>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
              <button 
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {locationLoading ? (
                  <><Loader className="animate-spin -ml-1 mr-2 h-4 w-4" /> Getting Location...</>
                ) : (
                  <><MapPin className="-ml-0.5 mr-2 h-4 w-4" /> Get Current Location</>
                )}
              </button>
            </div>
            
            {locationError && (
              <div className="mt-1 p-2 bg-red-50 text-red-600 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>{locationError}</p>
              </div>
            )}
            
            {location && location.latitude && location.longitude && (
              <p className="mt-2 text-sm text-green-600">
                Location obtained: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
            
            <div className="mt-4">
              <label htmlFor="googleMapLink" className="block text-sm font-medium text-gray-700">Google Maps Link (Optional)</label>
              <input 
                type="url" 
                id="googleMapLink" 
                value={formData.googleMapLink}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                placeholder="https://goo.gl/maps/example" 
              />
              <p className="mt-1 text-sm text-gray-500">
                If you don't want to use geolocation, you can paste a Google Maps link instead
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Property Type <span className="text-red-500">*</span></label>
            <select 
              id="type" 
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select Type</option>
              <option value="Single Room">Single Room</option>
              <option value="PG">PG</option>
              <option value="1RK">1RK</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="3BHK+">3BHK+</option>
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">Amenities</span>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['WiFi', 'Parking', 'Air Conditioning', 'Furnished', 'Refrigerator', 'Washing Machine', 'Gym', 'Security', 'Water Supply'].map(amenity => (
                <div key={amenity} className="flex items-center">
                  <input 
                    id={amenity.toLowerCase().replace(' ', '_')}
                    name={amenity} 
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor={amenity.toLowerCase().replace(' ', '_')} className="ml-2 block text-sm text-gray-900">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input 
              id="isAvailable"
              type="checkbox" 
              checked={formData.isAvailable}
              onChange={handleAvailabilityChange}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              This property is currently available for rent
            </label>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea 
              id="description" 
              value={formData.description}
              onChange={handleChange}
              rows="4" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
              placeholder="Describe the property, nearby landmarks, rules, etc."
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Upload Images (1-5) <span className="text-red-500">*</span>
            </label>
            <input 
              type="file" 
              id="images" 
              onChange={handleImageChange}
              multiple 
              accept="image/*" 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-primary hover:file:bg-red-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload up to 5 images. First image will be the main display image. 
              <span className="font-medium">{imageFiles.length}/5</span> selected.
            </p>
            
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden h-24 border border-gray-200">
                    <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    
                    {isSubmitting && uploadProgress[imageFiles[index]?.name] !== undefined && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="text-white font-medium text-center">
                          {Math.round(uploadProgress[imageFiles[index].name] || 0)}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">Upload Video (Optional)</label>
            <input 
              type="file" 
              id="video" 
              onChange={handleVideoChange}
              accept="video/*" 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-primary hover:file:bg-red-100"
              disabled={isSubmitting || videoFile !== null}
            />
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 20MB</p>
            
            {videoPreview && (
              <div className="mt-3 relative">
                <video 
                  src={videoPreview} 
                  controls 
                  className="w-full h-auto max-h-48 rounded-md" 
                ></video>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
                
                {isSubmitting && uploadProgress[videoFile?.name] !== undefined && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md">
                    <div className="text-white font-medium text-center">
                      {Math.round(uploadProgress[videoFile.name] || 0)}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="ownerNumber" className="block text-sm font-medium text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              id="ownerNumber" 
              value={formData.ownerNumber}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
              placeholder="10-digit mobile number"
              maxLength="10"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This number will be displayed for interested renters to contact you
            </p>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader className="animate-spin -ml-1 mr-2 h-5 w-5" /> Posting...</>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

FlatForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  initialData: PropTypes.object,
  isEditMode: PropTypes.bool
};

export default FlatForm;
