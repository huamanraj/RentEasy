import { Client, Databases, Storage, ID, Permission, Role } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

// Use Vite's import.meta.env pattern instead of process.env
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'your-project-id');

const databases = new Databases(client);
const storage = new Storage(client);

// Correctly access environment variables for Vite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'your-database-id';
const FLATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FLATS_COLLECTION_ID || 'your-flats-collection-id';
const IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_FLAT_IMAGES_BUCKET_ID || 'your-images-bucket-id';
const VIDEOS_BUCKET_ID = import.meta.env.VITE_APPWRITE_FLAT_VIDEOS_BUCKET_ID || 'your-videos-bucket-id';

// Database operations
export const flatsDb = {
  // Create a new flat entry
  createFlat: async (flatData) => {
    try {
      // Basic validation - check if form data is complete
      if (!flatData) {
        throw new Error('No form data provided');
      }
      
      

      // Do not transform the data, send it as is
      return await databases.createDocument(
        DATABASE_ID,
        FLATS_COLLECTION_ID,
        ID.unique(),
        flatData,
        // Add proper permissions
        [
          Permission.read(Role.any()), // Anyone can read
          Permission.update(Role.user(flatData.userId)), // Only creator can update
          Permission.delete(Role.user(flatData.userId)) // Only creator can delete
        ]
      );
    } catch (error) {
      console.error('Error creating flat:', error);
      throw error;
    }
  },

  // Get a flat by ID
  getFlat: async (flatId) => {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        FLATS_COLLECTION_ID,
        flatId
      );
      
      // Make sure ownerNumber is explicitly included in the returned object
      return {
        ...document,
        ownerNumber: document.ownerNumber || null
      };
    } catch (error) {
      console.error('Error getting flat:', error);
      throw error;
    }
  },
  
  // List all flats with optional filters
  listFlats: async (queries = []) => {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        FLATS_COLLECTION_ID,
        queries
      );
    } catch (error) {
      console.error('Error listing flats:', error);
      throw error;
    }
  }
};

// Storage operations
export const fileStorage = {
  // Upload image to bucket
  uploadImage: async (file, progressCallback = null, userId = null) => {
    try {
      // Define permissions based on user ID
      const permissions = [
        Permission.read(Role.any()), // Anyone can read the image
      ];
      
      // If userId is provided, add write permissions for that user
      if (userId) {
        permissions.push(Permission.update(Role.user(userId)));
        permissions.push(Permission.delete(Role.user(userId)));
      }

      const result = await storage.createFile(
        IMAGES_BUCKET_ID,
        ID.unique(),
        file,
        permissions,
        progressCallback ? 
          (progress) => progressCallback(file.name, progress) : 
          undefined
      );
      
      // Return only the essential data to avoid lengthy URLs in database
      return {
        id: result.$id,
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  // Upload video to bucket
  uploadVideo: async (file, progressCallback = null, userId = null) => {
    try {
      // Define permissions based on user ID
      const permissions = [
        Permission.read(Role.any()), // Anyone can read the video
      ];
      
      // If userId is provided, add write permissions for that user
      if (userId) {
        permissions.push(Permission.update(Role.user(userId)));
        permissions.push(Permission.delete(Role.user(userId)));
      }

      const result = await storage.createFile(
        VIDEOS_BUCKET_ID,
        ID.unique(),
        file,
        permissions,
        progressCallback ? 
          (progress) => progressCallback(file.name, progress) : 
          undefined
      );
      
      // Return only the essential data
      return {
        id: result.$id,
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Get image URL by ID - separate function to generate URLs when needed
  getImageUrl: (imageId) => {
    if (!imageId) return null;
    try {
      // Make sure we're working with a clean ID
      const cleanId = typeof imageId === 'string' ? 
        (imageId.includes('/') ? imageId.split('/').pop() : imageId) : 
        imageId;
      
      console.log(`Getting image URL for ID: ${cleanId} using bucket: ${IMAGES_BUCKET_ID}`);
      
      // Use getFilePreview for images (with dimensions)
      return storage.getFilePreview(
        IMAGES_BUCKET_ID,
        cleanId,
        2000, // width
        2000  // height
      ).toString();
    } catch (error) {
      console.error('Error generating image URL:', error, 'for ID:', imageId);
      // Return a placeholder image URL for development
      if (import.meta.env.DEV) {
        return 'https://via.placeholder.com/800x500.png?text=Image+Not+Found';
      }
      return null;
    }
  },
  
  // Get video URL by ID
  getVideoUrl: (videoId) => {
    if (!videoId) return null;
    try {
      // Make sure we're working with a clean ID
      const cleanId = typeof videoId === 'string' ? 
        (videoId.includes('/') ? videoId.split('/').pop() : videoId) : 
        videoId;
        
      console.log(`Getting video URL for ID: ${cleanId} using bucket: ${VIDEOS_BUCKET_ID}`);
      
      // Use getFileView for videos (no preview/resizing needed)
      return storage.getFileView(
        VIDEOS_BUCKET_ID, 
        cleanId
      ).toString();
    } catch (error) {
      console.error('Error generating video URL:', error, 'for ID:', videoId);
      return null;
    }
  },

  // New function to get direct file access
  getFileById: async (bucketId, fileId) => {
    if (!fileId) return null;
    try {
      const cleanId = typeof fileId === 'string' ? 
        (fileId.includes('/') ? fileId.split('/').pop() : fileId) : 
        fileId;
        
      // Get the file view
      return storage.getFileView(bucketId, cleanId);
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  }
};

export { client, databases, storage, Permission, Role };
