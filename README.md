<!-- filepath: c:\Users\amanr\OneDrive\Desktop\RentEasy\README.md -->
# RentEasy - React Rental Property Platform

This project is a modern, responsive web application for browsing and listing rental properties, inspired by Airbnb's design principles. It utilizes React, Vite, TailwindCSS, Framer Motion, and Appwrite for the backend.

## Features

*   Property Listings & Search
*   Location-based Filtering (Near Me)
*   User Authentication (Email/Phone)
*   Property Management Dashboard
*   Flat Detail Pages with Galleries & Reviews
*   Clean, Minimalist UI

## Tech Stack

*   **Frontend:** React, Vite
*   **Styling:** TailwindCSS
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Backend:** Appwrite (Auth, Database, Storage)
*   **Geolocation:** Browser Geolocation API

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up your Appwrite instance and configure environment variables (see `.env.example`).
4.  Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory based on `.env.example` and fill in your Appwrite project details.

```
VITE_APPWRITE_ENDPOINT=YOUR_APPWRITE_ENDPOINT
VITE_APPWRITE_PROJECT_ID=YOUR_APPWRITE_PROJECT_ID
# Add other variables as needed (e.g., collection IDs, bucket IDs)
```
```

### c:\Users\amanr\OneDrive\Desktop\RentEasy\.gitignore

Add `.env` to the ignore list.

````ignore
// filepath: c:\Users\amanr\OneDrive\Desktop\RentEasy\.gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Environment variables
.env
.env.*
!.env.example

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?