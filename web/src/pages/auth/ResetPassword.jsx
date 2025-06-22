import React from 'react'
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiHeart, FiMail, FiLock, FiLoader } from 'react-icons/fi';
const ResetPassword = () => {
      const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div>
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
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Reset password</h2>
              {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiMail className="mr-2 text-orange-500" /> New Password
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
                  <FiMail className="mr-2 text-orange-500" /> Confirm Password
                </label>
                <input
                   type="password"
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
           
              >
               
              </motion.button>
            </form>
          
          </div>
          <ToastContainer />
        </motion.div>
      
    </div>
  )
}

export default ResetPassword
