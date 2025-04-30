import { Client, Databases, Account, Query, Storage, ID } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASES = {
  MAIN: import.meta.env.VITE_APPWRITE_DATABASE_ID,
};

export const COLLECTIONS = {
  LISTINGS: import.meta.env.VITE_APPWRITE_FLATS_COLLECTION_ID,
  REVIEWS: import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID,
};

export const STORAGE = {
  IMAGES: import.meta.env.VITE_APPWRITE_FLAT_IMAGES_BUCKET_ID,
  VIDEOS: import.meta.env.VITE_APPWRITE_FLAT_VIDEOS_BUCKET_ID,
};

const FALLBACK_LISTINGS = [
  { 
    id: 1, 
    title: 'Cozy 1BHK near Metro', 
    price: 12000, 
    location: { 
      latitude: 28.459497, 
      longitude: 77.026634,
      address: 'Sector 15' 
    },
    type: '1BHK', 
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: 2, 
    title: 'Spacious 2BHK with Balcony', 
    price: 25000, 
    location: { 
      latitude: 28.461712, 
      longitude: 77.031006,
      address: 'Downtown' 
    },
    type: '2BHK', 
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: 3, 
    title: 'Affordable Studio Room', 
    price: 8000, 
    location: { 
      latitude: 28.452135, 
      longitude: 77.020721,
      address: 'University Area'
    },
    type: '1RK', 
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: 4, 
    title: 'Luxury 3BHK Apartment', 
    price: 35000, 
    location: { 
      latitude: 28.457826, 
      longitude: 77.097359,
      address: 'Golf Course Road'
    },
    type: '3BHK', 
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: 5, 
    title: 'Budget 1BHK for Students', 
    price: 10000, 
    location: { 
      latitude: 28.453901, 
      longitude: 77.022784,
      address: 'College Street'
    },
    type: '1BHK', 
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
];

export async function getAllListings(queries = []) {
  try {
    if (!DATABASES.MAIN || !COLLECTIONS.LISTINGS) {
      return getFallbackListings(queries);
    }

    const safeQueries = queries.filter(query => {
      if (query.method === 'orderDesc' || query.method === 'orderAsc') {
        if (['createdAt', 'updatedAt'].includes(query.attribute) && 
            !fieldExists(query.attribute, DATABASES.MAIN, COLLECTIONS.LISTINGS)) {
          return false;
        }
      }
      return true;
    });

    const response = await databases.listDocuments(
      DATABASES.MAIN,
      COLLECTIONS.LISTINGS,
      safeQueries
    );
    
    return response;
  } catch (error) {
    if (import.meta.env.DEV) {
      return getFallbackListings(queries);
    }
    
    throw error;
  }
}

function fieldExists(field, databaseId, collectionId) {
  const commonFields = [
    '$id', '$createdAt', '$updatedAt', 'title', 'description', 
    'price', 'rent', 'address', 'type', 'status', 'userId'
  ];
  
  return commonFields.includes(field);
}

function getFallbackListings(queries = []) {
  let filteredData = FALLBACK_LISTINGS.map(item => ({
    ...item,
    address: item.address || item.location?.address || 'Unknown'
  }));
  
  const enhancedData = filteredData.map((item, index) => ({
    ...item,
    userId: index < 3 ? 'user123' : 'otherUser',
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    status: index % 3 === 0 ? 'Booked' : 'Listed'
  }));
  
  let sortField = 'createdAt';
  let sortDirection = 'desc';
  let limit = enhancedData.length;
  let offset = 0;
  let userIdFilter = null;
  
  queries.forEach(query => {
    if (query.method === 'search' && query.attribute === 'address') {
      const term = query.values?.[0]?.toLowerCase?.();
      if (term) {
        filteredData = filteredData.filter(item => {
          const addr = (item.address || item.location?.address || '').toLowerCase();
          return addr.includes(term);
        });
      }
      return;
    }

    if (query.method === 'equal' && query.attribute === 'type') {
      filteredData = filteredData.filter(item => item.type === query.values[0]);
    }
    if (query.method === 'equal' && query.attribute === 'userId') {
      userIdFilter = query.values[0];
      filteredData = enhancedData.filter(item => item.userId === userIdFilter);
    }
    if (query.method === 'greaterThanEqual' && query.attribute === 'price') {
      filteredData = filteredData.filter(item => (item.rent || item.price) >= query.values[0]);
    }
    if (query.method === 'lessThanEqual' && query.attribute === 'price') {
      filteredData = filteredData.filter(item => (item.rent || item.price) <= query.values[0]);
    }
    if (query.method === 'orderDesc') {
      sortField = query.attribute;
      sortDirection = 'desc';
    }
    if (query.method === 'orderAsc') {
      sortField = query.attribute;
      sortDirection = 'asc';
    }
    if (query.method === 'limit') {
      limit = query.values;
    }
    if (query.method === 'offset') {
      offset = query.values;
    }
    if (query.method === 'equal' && query.attribute === 'isAvailable') {
      filteredData = filteredData.filter(item => item.isAvailable === query.values[0]);
    }
  });
  
  if (userIdFilter) {
    filteredData = enhancedData.filter(item => item.userId === userIdFilter);
  }
  
  filteredData.sort((a, b) => {
    if (sortDirection === 'desc') {
      return a[sortField] < b[sortField] ? 1 : -1;
    } else {
      return a[sortField] > b[sortField] ? 1 : -1;
    }
  });
  
  const total = filteredData.length;
  const paginatedData = filteredData.slice(offset, offset + limit);
  
  return {
    documents: paginatedData,
    total: total,
    limit: limit,
    offset: offset
  };
}

export async function getListingById(id) {
  try {
    if (!DATABASES.MAIN || !COLLECTIONS.LISTINGS) {
      return getFallbackListingById(id);
    }
    
    const document = await databases.getDocument(
      DATABASES.MAIN,
      COLLECTIONS.LISTINGS,
      id
    );
    
    return processListingDocument(document);
  } catch (error) {
    if (import.meta.env.DEV) {
      return getFallbackListingById(id);
    }
    
    throw error;
  }
}

function getFallbackListingById(id) {
  const fallbackListing = FALLBACK_LISTINGS.find(item => item.id == id);
  if (fallbackListing) {
    return {
      ...fallbackListing,
      description: 'This is a fallback description for development mode. In production, this would come from the database.',
      amenities: ['WiFi', 'Parking', 'AC'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
      ],
      ownerNumber: '9876543210'
    };
  }
  
  throw new Error('Listing not found');
}

export async function getListingsByUserId(userId, limit = 10, offset = 0) {
  try {
    if (!DATABASES.MAIN || !COLLECTIONS.LISTINGS) {
      return getFallbackUserListings(limit, offset);
    }
    
    const response = await databases.listDocuments(
      DATABASES.MAIN,
      COLLECTIONS.LISTINGS,
      [
        Query.equal('userId', userId),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
    
    return response;
  } catch (error) {
    if (import.meta.env.DEV) {
      return getFallbackUserListings(limit, offset);
    }
    
    throw error;
  }
}

function getFallbackUserListings(limit = 10, offset = 0) {
  const fallbackData = [
    { 
      $id: 'mock1',
      title: 'My Listed 1BHK Apartment', 
      price: 15000, 
      status: 'Listed',
      type: '1BHK',
    },
    { 
      $id: 'mock2',
      title: 'My 2BHK for Rent', 
      price: 22000, 
      status: 'Booked',
      type: '2BHK',
    },
    { 
      $id: 'mock3',
      title: 'Studio Apartment Near Metro', 
      price: 12000, 
      status: 'Listed',
      type: 'Studio',
    },
    { 
      $id: 'mock4',
      title: 'Luxury 3BHK with Balcony', 
      price: 35000, 
      status: 'Listed',
      type: '3BHK',
    },
    { 
      $id: 'mock5',
      title: 'Bachelor Pad in City Center', 
      price: 18000, 
      status: 'Booked',
      type: '1BHK',
    },
    { 
      $id: 'mock6',
      title: 'Family House with Garden', 
      price: 45000, 
      status: 'Listed',
      type: '4BHK',
    },
    { 
      $id: 'mock7',
      title: 'Student Accommodation', 
      price: 8000, 
      status: 'Listed',
      type: 'PG',
    },
    { 
      $id: 'mock8',
      title: 'Penthouse with Rooftop', 
      price: 60000, 
      status: 'Listed',
      type: 'Penthouse',
    },
    { 
      $id: 'mock9',
      title: 'Affordable 2BHK for Family', 
      price: 20000, 
      status: 'Listed',
      type: '2BHK',
    },
    { 
      $id: 'mock10',
      title: 'Single Room with Attached Bath', 
      price: 7000, 
      status: 'Booked',
      type: '1RK',
    },
    { 
      $id: 'mock11',
      title: 'Spacious 3BHK in Gated Society', 
      price: 30000, 
      status: 'Listed',
      type: '3BHK',
    },
    { 
      $id: 'mock12',
      title: 'Budget 1BHK for Students', 
      price: 10000, 
      status: 'Listed',
      type: '1BHK',
    },
    { 
      $id: 'mock13',
      title: 'Modern Apartment with Gym Access', 
      price: 25000, 
      status: 'Listed',
      type: '2BHK',
    },
    { 
      $id: 'mock14',
      title: 'Serviced Apartment for Professionals', 
      price: 32000, 
      status: 'Booked',
      type: '2BHK',
    },
    { 
      $id: 'mock15',
      title: 'Independent Floor in Residential Area', 
      price: 28000, 
      status: 'Listed',
      type: '3BHK',
    }
  ];
  
  const paginatedData = fallbackData.slice(offset, offset + limit);
  
  return { 
    documents: paginatedData,
    total: fallbackData.length,
    limit: limit,
    offset: offset
  };
}

function processListingDocument(document) {
  const processedDoc = {...document};
  
  if (processedDoc.images && Array.isArray(processedDoc.images)) {
    processedDoc.images = processedDoc.images.filter(image => image);
  }
  
  return processedDoc;
}

export async function createListing(flatData, onProgress) {
  try {
    if (!DATABASES.MAIN || !COLLECTIONS.LISTINGS) {
      throw new Error('Application not properly configured for data storage');
    }
    
    const imageIds = [];
    const imageFiles = flatData.images || [];
    
    for (const imageFile of imageFiles) {
      try {
        if (onProgress) {
          onProgress(imageFile.name, 0);
        }
        
        const response = await storage.createFile(
          STORAGE.IMAGES,
          ID.unique(),
          imageFile,
          ['*'],
          onProgress ? (progress) => {
            onProgress(imageFile.name, progress.progress);
          } : undefined
        );
        
        imageIds.push(response.$id);
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }
    
    let videoId = null;
    if (flatData.video) {
      try {
        if (onProgress) {
          onProgress(flatData.video.name, 0);
        }
        
        const response = await storage.createFile(
          STORAGE.VIDEOS,
          ID.unique(),
          flatData.video,
          ['*'],
          onProgress ? (progress) => {
            onProgress(flatData.video.name, progress.progress);
          } : undefined
        );
        
        videoId = response.$id;
      } catch (err) {
        console.error('Error uploading video:', err);
      }
    }
    
    const listingData = {
      title: flatData.title,
      rent: parseFloat(flatData.rent),
      address: flatData.address,
      type: flatData.type,
      description: flatData.description,
      amenities: flatData.amenities || [],
      googleMapLink: flatData.googleMapLink || null,
      latitude: flatData.latitude || null,
      longitude: flatData.longitude || null,
      images: imageIds,
      video: videoId,
      isAvailable: flatData.isAvailable !== false,
      userId: flatData.userId || 'anonymous',
      createdAt: new Date().toISOString(),
      ownerNumber: flatData.ownerNumber || null,
    };
    
    const response = await databases.createDocument(
      DATABASES.MAIN,
      COLLECTIONS.LISTINGS,
      ID.unique(),
      listingData
    );
    
    return response;
  } catch (error) {
    throw error;
  }
}

export const flatsDb = {
  getAllFlats: async (queries = []) => {
    try {
      const validQueries = queries.filter(q => q !== undefined && q !== null);
      
      const response = await databases.listDocuments(
        DATABASES.MAIN,
        COLLECTIONS.LISTINGS,
        validQueries
      );
      
      return response;
    } catch (error) {
      throw new Error('Failed to fetch listings');
    }
  },
  getFlat: getListingById,
  getUserFlats: getListingsByUserId,
  createFlat: createListing,
};
