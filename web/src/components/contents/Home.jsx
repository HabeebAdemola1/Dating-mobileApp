import { useEffect, useState } from 'react';
import axios from 'axios';

import { FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view posts', {
            style: { background: '#F6643BFF', color: 'white' },
          });
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/post/allposts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.validPost);
        console.log(response.data.validPost)
        toast.success('Meet new people!', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching posts', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };
    fetchPosts();
  }, []);

  // Handle like/unlike
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      toast.success('Like updated!');
    } catch (error) {
        console.log(error)
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  // Handle share
  const handleShare = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, shares: response.data.shares } : post
        )
      );
      toast.success('Post shared!', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share post', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/${selectedPost._id}/comment`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPost._id ? { ...post, comments: response.data.comments } : post
        )
      );
      setCommentContent('');
      toast.success('Comment added!', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } catch (error) {
        console.log(error)
      toast.error(error.response?.data?.message || 'Failed to add comment', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    }
  };

  // Open comment modal
  const openCommentModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // Close comment modal
  const closeCommentModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setCommentContent('');
  };

  // Check if user has liked the post
  const hasLiked = (post, userId) => {
    return post.likes?.some((like) => like.userId.toString() === userId);
  };

  // Assume userId is stored in token or fetched from backend
  const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth setup

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      {/* Statuses (Circular) */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {posts
          ?.filter((post) => post.isStatus)
          .map((post) => (
            <motion.div
              key={post._id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-300 transition-all duration-200">
                {post.media ? (
                  <img
                    src={post.media}
                    alt="Status"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                    {post.content.slice(0, 10)}...
                  </div>
                )}
              </div>
            </motion.div>
          ))}
      </div>

      <div className="max-full mx-auto mt-6 space-y-6">
        {posts
          .filter((post) => !post.isStatus)
          .map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md border" 
            >
              <div className="flex items-center space-x-3 mb-4">
                <img src={post.userId?.picture} className="w-10 h-10 bg-gray-300 rounded-full"/>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-gray-800">
                
                     {post.userId.fullname || "unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {post.content && (
                <p className="text-sm sm:text-base text-gray-700 mb-4">{post.content}</p>
              )}
              {post.media && (
                <img
                  src={post.media}
                  alt="Post media"
                  className="w-full h-60 rounded-md mb-4 object-cover"
                />
              )}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>{post.likes?.length} Likes</span>
                <span>{post.comments?.length} Comments</span>
                <span>{post.shares?.length} Shares</span>
              </div>
              <div className="flex space-x-2 border-t pt-2" >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post._id)}
                  className={`flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                    hasLiked(post, currentUserId) ? 'text-orange-500' : 'text-gray-600'
                  }`}
                >
                  <FiHeart className="mr-2" size={20} />
                  Like
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openCommentModal(post)}
                  className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                >
                  <FiMessageSquare className="mr-2" size={20} />
                  Comment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare(post._id)}
                  className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                >
                  <FiShare2 className="mr-2" size={20} />
                  Share
                </motion.button>
              </div>
            </motion.div>
          ))}
        {posts.filter((post) => !post.isStatus).length === 0 && (
          <p className="text-center text-gray-600">No posts available.</p>
        )}
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Comments</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={closeCommentModal}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <FiShare2 size={24} />
                </motion.button>
              </div>
              {selectedPost?.comments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment._id} className="border-b pb-2" >
                      <p className="font-semibold text-sm text-gray-800">
                      
                        User {comment?.userId?.fullname || "unknown"}
                      </p>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">No comments yet.</p>
              )}
              <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
           
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                >
                  Post
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;