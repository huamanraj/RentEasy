import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter import, it's in main.jsx
import Home from './pages/Home';
import FlatDetailsPage from './pages/FlatDetailsPage';
import PostFlat from './pages/PostFlat';
import EditFlat from './pages/EditFlat';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // Keep Login page route if needed as a fallback/direct access
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoute'; // Import ProtectedRoute
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flat/:id" element={<FlatDetailsPage />} />
            <Route path="/login" element={<Login />} /> {/* Keep if direct login page is desired */}
            <Route path="/google-login" element={<Login />} /> {/* This route handles Google OAuth redirect */}

            {/* Protected Routes */}
            <Route
              path="/post-flat"
              element={
                <ProtectedRoute>
                  <PostFlat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-flat/:id"
              element={
                <ProtectedRoute>
                  <EditFlat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;