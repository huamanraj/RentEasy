import { databases, storage, ID, Query } from './appwriteConfig';

// Get Appwrite collection/bucket IDs from environment variables
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const FLATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FLATS_COLLECTION_ID;
const REVIEWS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID;
const IMAGES_BUCKET_ID = import.meta.env.VITE_APPWRITE_FLAT_IMAGES_BUCKET_ID;
// const VIDEOS_BUCKET_ID = import.meta.env.VITE_APPWRITE_FLAT_VIDEOS_BUCKET_ID; // Uncomment if using videos

// --- Flats API ---

export const api = {
  // Fetch all flats (add filters/pagination later)
  getAllFlats: async () => {
    try {
      const response = await databases.listDocuments(DB_ID, FLATS_COLLECTION_ID, [
          // Add queries here for filtering/sorting, e.g., Query.limit(10)
          Query.orderDesc('$createdAt') // Example: Sort by newest
      ]);
      return response.documents;
    } catch (error) {
      console.error('Error fetching flats:', error);
      throw error;
    }
  },

  // Fetch a single flat by its document ID
  getFlatById: async (id) => {
    try {
      const response = await databases.getDocument(DB_ID, FLATS_COLLECTION_ID, id);
      return response;
    } catch (error) {
      console.error(`Error fetching flat ${id}:`, error);
      throw error;
    }
  },

  // Create a new flat listing
  createFlat: async (flatData, userId) => {
     if (!userId) throw new Error("User ID is required to create a flat.");
    try {
      // 1. Upload images (implement this logic)
      // const imageIds = await uploadImages(flatData.images); // Assume uploadImages returns an array of file IDs

      // 2. Create the document in the database
      const response = await databases.createDocument(
        DB_ID,
        FLATS_COLLECTION_ID,
        ID.unique(), // Generate a unique ID for the document
        {
          ...flatData, // Spread the rest of the form data
          userId: userId, // Associate the flat with the user
          // images: imageIds, // Store the array of image file IDs
          // Add location field { latitude: number, longitude: number } later
        },
        // Add permissions later if needed
      );
      return response;
    } catch (error) {
      console.error('Error creating flat:', error);
      throw error;
    }
  },

  // Update an existing flat
  updateFlat: async (id, updatedData) => {
     try {
        // Handle image updates separately if needed
        const response = await databases.updateDocument(
            DB_ID,
            FLATS_COLLECTION_ID,
            id,
            updatedData
            // Add permissions check later
        );
        return response;
     } catch (error) {
        console.error(`Error updating flat ${id}:`, error);
        throw error;
     }
  },

   // Delete a flat
   deleteFlat: async (id) => {
     try {
        // Add logic to delete associated images/videos from storage first
        const response = await databases.deleteDocument(DB_ID, FLATS_COLLECTION_ID, id);
        return response; // Returns empty response on success
     } catch (error) {
        console.error(`Error deleting flat ${id}:`, error);
        throw error;
     }
   },


  // --- Reviews API ---
  getReviewsForFlat: async (flatId) => {
     try {
        const response = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION_ID, [
            Query.equal('flatId', flatId),
            Query.orderDesc('$createdAt')
        ]);
        return response.documents;
     } catch (error) {
        console.error(`Error fetching reviews for flat ${flatId}:`, error);
        throw error;
     }
  },

  createReview: async (reviewData, userId, flatId) => {
     if (!userId || !flatId) throw new Error("User ID and Flat ID are required.");
     try {
        const response = await databases.createDocument(
            DB_ID,
            REVIEWS_COLLECTION_ID,
            ID.unique(),
            {
                ...reviewData, // rating, reviewText
                userId: userId,
                flatId: flatId,
                // Add userName later if needed
            }
            // Add permissions later
        );
        return response;
     } catch (error) {
        console.error('Error creating review:', error);
        throw error;
     }
  },


  // --- Storage API --- (Example for images)
  uploadImages: async (files) => {
    if (!files || files.length === 0) return [];
    const uploadPromises = Array.from(files).map(file =>
      storage.createFile(IMAGES_BUCKET_ID, ID.unique(), file)
    );
    try {
      const results = await Promise.all(uploadPromises);
      return results.map(result => result.$id); // Return array of file IDs
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },

  getFilePreview: (fileId) => {
     if (!fileId || !IMAGES_BUCKET_ID) return null;
     try {
        // Get a preview URL (adjust width/height as needed)
        return storage.getFilePreview(IMAGES_BUCKET_ID, fileId, 400); // width 400px
     } catch (error) {
        console.error(`Error getting file preview for ${fileId}:`, error);
        return null; // Return null or a placeholder URL on error
     }
  },

   deleteFile: async (fileId) => {
     if (!fileId || !IMAGES_BUCKET_ID) return;
     try {
        await storage.deleteFile(IMAGES_BUCKET_ID, fileId);
     } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        // Don't necessarily throw, maybe just log it
     }
   },

};
