import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiHeart, FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
const ForgotPassword = () => {
      const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Forgot password</h2>
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
              'Send Reset Link'
            )}
          </motion.button>
        </form>
      
      </div>
      <ToastContainer />
    </motion.div>
      
    </div>
  )
}

export default ForgotPassword
