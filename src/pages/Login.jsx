import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  
  // Add state for inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        // Make sure name is not empty for registration
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        await register(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
         <div>
           <h2 className="mt-6 text-center text-3xl font-extrabold text-textDark">
             {isLoginView ? 'Sign in to your account' : 'Create a new account'}
           </h2>
         </div>
         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           <input type="hidden" name="remember" defaultValue="true" />
           <div className="rounded-md shadow-sm -space-y-px">
              {!isLoginView && (
                <div>
                  <label htmlFor="name-page" className="sr-only">Name</label>
                  <input id="name-page" name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
             <div>
               <label htmlFor="email-address-page" className="sr-only">Email address</label>
               <input id="email-address-page" name="email" type="email" autoComplete="email" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLoginView ? 'rounded-t-md' : ''} focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
             </div>
             <div>
               <label htmlFor="password-page" className="sr-only">Password</label>
               <input id="password-page" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
             </div>
           </div>

           <div>
             <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200" disabled={loading}>
               {loading ? 'Processing...' : (isLoginView ? 'Sign in' : 'Register')}
             </button>
           </div>
           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
         </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isLoginView ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="ml-1 font-medium text-primary hover:underline"
            >
              {isLoginView ? 'Register' : 'Sign in'}
            </button>
          </p>
       </div>
    </div>
  );
};

export default LoginPage;
