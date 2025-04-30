import { Client, Account, Databases, Storage, Avatars, OAuthProvider } from 'appwrite';

// Validate environment variables
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.error(
    'Missing Appwrite environment variables. Make sure VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID are set in your .env file.'
  );
}

// Create and configure client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const googleOAuthProvider = OAuthProvider.Google;

export { client, OAuthProvider };

export default client;