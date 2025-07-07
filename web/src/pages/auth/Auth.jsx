import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiHeart, FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Signup Component
const Signup = ({ onSwitchToLogin, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        email,
        password,
        phoneNumber,
        confirmPassword
      });
      localStorage.setItem('token', response.data.token);
      toast.success('Welcome to your journey of love! Signup successful!', {
        position: 'top-right',
        autoClose: 3000,
        className: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
      });
      setEmail('');
      setPassword('');
      setPhoneNumber('')
      setConfirmPassword('')
      onAuthSuccess();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Try again!', {
        position: 'top-right',
        autoClose: 3000,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex items-center justify-center p-4"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md border border-opacity-50" style={{ borderColor: '#F6643BFF' }}>
        <div className="flex justify-center mb-6">
          <FiHeart className="text-4xl text-pink-500 animate-pulse" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Join Our Dating Community</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiMail className="mr-2 text-orange-500" /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiMail className="mr-2 text-orange-500" /> Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiLock className="mr-2 text-orange-500" /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiLock className="mr-2 text-orange-500" /> confirm Password
            </label>
            <input
              type="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(246, 100, 59, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader className="animate-spin mr-2" size={20} />
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>
        <p className="mt-5 text-sm text-center text-gray-600">
          Already a member?{' '}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              onSwitchToLogin();
              navigate('/login');
            }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Log In
          </motion.button>
        </p>
      </div>
      <ToastContainer />
    </motion.div>
  );
};

// Login Component
const Login = ({ onSwitchToSignup, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      toast.success('Welcome back! Ready to find love?', {
        position: 'top-right',
        autoClose: 3000,
        className: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
      });
      setEmail('');
      setPassword('');
      onAuthSuccess();
      navigate('/landingpage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Try again!', {
        position: 'top-right',
        autoClose: 3000,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex items-center justify-center p-4"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md border border-opacity-50" style={{ borderColor: '#F6643BFF' }}>
        <div className="flex justify-center mb-6">
          <FiHeart className="text-4xl text-pink-500 animate-pulse" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Log In to Find Love</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiMail className="mr-2 text-orange-500" /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
              <FiLock className="mr-2 text-orange-500" /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(246, 100, 59, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader className="animate-spin mr-2" size={20} />
            ) : (
              'Log In'
            )}
          </motion.button>
        </form>
        <p className="mt-5 text-sm text-center text-gray-600">
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              onSwitchToSignup();
              navigate('/forgot-password');
            }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Forgot-Password?
          </motion.button>
          </p>
        <p className="mt-5 text-sm text-center text-gray-600">
          New to our community?{' '}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              onSwitchToSignup();
              navigate('/signup');
            }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Sign Up
          </motion.button>
        </p>
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export { Signup, Login };