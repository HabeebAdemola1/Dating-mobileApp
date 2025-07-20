// import { useEffect, useState } from 'react';
// import axios from 'axios';

// import { FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'react-toastify';
// const Home = () => {
//   const [posts, setPosts] = useState([]);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [commentContent, setCommentContent] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [statusOpen, setStatusOpen] = useState(false)
//   const [postOpen, setPostOpen] = useState(false)

//   const toggleModal = () => {
//     setStatusOpen(!statusOpen)
//   }

//   const togglePostModal= () => {
//     setPostOpen(!postOpen)
//   }
//     // Fetch posts on mount
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           toast.error('Please log in to view posts', {
//             style: { background: '#F6643BFF', color: 'white' },
//           });
//           return;
//         }
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/post/allposts`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPosts(response.data.validPost);
//         console.log(response.data.validPost)
//         toast.success('Meet new people!', {
//           style: { background: '#F6643BFF', color: 'white' },
//         });
//       } catch (error) {
//         console.error(error);
//         toast.error(error.response?.data?.message || 'An error occurred while fetching posts', {
//           style: { background: '#F6643BFF', color: 'white' },
//         });
//       }
//     };
//     fetchPosts();
//   }, []);

//   // Handle like/unlike
//   const handleLike = async (postId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/like`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId ? { ...post, likes: response.data.likes } : post
//         )
//       );
//       toast.success('Like updated!');
//     } catch (error) {
//         console.log(error)
//       toast.error(error.response?.data?.message || 'Failed to update like');
//     }
//   };

//   // Handle share
//   const handleShare = async (postId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/share`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId ? { ...post, shares: response.data.shares } : post
//         )
//       );
//       toast.success('Post shared!', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to share post', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     }
//   };

//   // Handle comment submission
//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!commentContent.trim()) return;

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${selectedPost._id}/comment`,
//         { content: commentContent },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === selectedPost._id ? { ...post, comments: response.data.comments } : post
//         )
//       );
//       setCommentContent('');
//       toast.success('Comment added!', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     } catch (error) {
//         console.log(error)
//       toast.error(error.response?.data?.message || 'Failed to add comment', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     }
//   };

//   // Open comment modal
//   const openCommentModal = (post) => {
//     setSelectedPost(post);
//     setIsModalOpen(true);
//   };

//   // Close comment modal
//   const closeCommentModal = () => {
//     setIsModalOpen(false);
//     setSelectedPost(null);
//     setCommentContent('');
//   };

//   // Check if user has liked the post
//   const hasLiked = (post, userId) => {
//     return post.likes?.some((like) => like.userId.toString() === userId);
//   };

//   // Assume userId is stored in token or fetched from backend
//   const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth setup

//   return (
//     <div className="min-h-screen  p-4 sm:p-6">
//       {/* Statuses (Circular) */}
//       <div className="flex space-x-4 overflow-x-auto pb-4">
//         {posts
//           ?.filter((post) => post.isStatus)
//           .map((post) => (
//             <motion.div
//               key={post._id}
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.3 }}
//               className="flex-shrink-0"
//             >
//               <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-300 transition-all duration-200">
//                 {post.media ? (
//                   <>
//                      <img
//                     src={post.media.url}
//                     alt="Status"
//                     className="w-full h-full object-cover"
//                      onClick={toggleModal}
//                   />
//                   <h4 className='text-black font-bold'>{post.userId?.fullname}</h4>

//                   </>
               
                
//                 ) : (
//                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
//                     {post.content.slice(0, 10)}...
//                   </div>
//                 )}
//                    {statusOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
//                 <img
//                   src={post.media.url}
//                   alt="Status"
//                   className="w-full h-auto max-h-[80vh] object-contain"
//                   onClick={toggleModal}
//                 />
//                 <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
//                 <button
//                   onClick={toggleModal}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           )}
//               </div>
//             </motion.div>
//           ))}
//       </div>

//       <div className="max-full mx-auto mt-6 space-y-6">
//         {posts
//           ?.filter((post) => !post.isStatus)
//           .map((post) => (
//             <motion.div
//               key={post._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="bg-white p-4 sm:p-6 rounded-xl shadow-md border" 
//             >
//               <div className="flex items-center space-x-3 mb-4">
//                 <img src={post.userId?.picture} className="w-10 h-10 bg-gray-300 rounded-full"/>

//                 <div>
//                   <p className="font-semibold text-sm sm:text-base text-gray-800">
                
//                      {post.userId.fullname || "unknown"}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(post.createdAt).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
     
//               {post.content && (
//                 <p className="text-sm sm:text-base text-gray-700 mb-4">{post.content}</p>
//               )}
//               {post.media && (
//                 <img
//                   src={post.media}
//                   alt="Post media"
//                   className="w-full h-60 rounded-md mb-4 object-cover"
//                    onClick={togglePostModal}
//                 />
//               )}
//               <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
//                 <span>{post.likes?.length} Likes</span>
//                 <span>{post.comments?.length} Comments</span>
//                 <span>{post.shares?.length} Shares</span>
//               </div>

//                                    {postOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
//                 <img
//                   src={post.media}
//                   alt="Status"
//                   className="w-full h-auto max-h-[80vh] object-contain"
//                   onClick={togglePostModal}
//                 />
//                 <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
//                 <button
//                   onClick={togglePostModal}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           )}
//               <div className="flex space-x-2 border-t pt-2" >
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => handleLike(post._id)}
//                   className={`flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
//                     hasLiked(post, currentUserId) ? 'text-orange-500' : 'text-gray-600'
//                   }`}
//                 >
//                   <FiHeart className="mr-2" size={20} />
//                   Like
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => openCommentModal(post)}
//                   className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
//                 >
//                   <FiMessageSquare className="mr-2" size={20} />
//                   Comment
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => handleShare(post._id)}
//                   className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
//                 >
//                   <FiShare2 className="mr-2" size={20} />
//                   Share
//                 </motion.button>
//               </div>
//             </motion.div>
//           ))}
//         {posts.filter((post) => !post.isStatus).length === 0 && (
//           <p className="text-center text-gray-600">No posts available.</p>
//         )}
//       </div>

//       {/* Comment Modal */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.8, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.8, y: 20 }}
//               className="bg-white rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Comments</h3>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   onClick={closeCommentModal}
//                   className="text-orange-500 hover:text-orange-600"
//                 >
//                   <FiShare2 size={24} />
//                 </motion.button>
//               </div>
//               {selectedPost?.comments.length > 0 ? (
//                 <div className="space-y-3 mb-4">
//                   {selectedPost.comments.map((comment) => (
//                     <div key={comment._id} className="border-b pb-2" >
//                       <p className="font-semibold text-sm text-gray-800">
                      
//                         User {comment?.userId?.fullname || "unknown"}
//                       </p>
//                       <p className="text-sm text-gray-600">{comment.content}</p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(comment.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-600 mb-4">No comments yet.</p>
//               )}
//               <form onSubmit={handleCommentSubmit} className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={commentContent}
//                   onChange={(e) => setCommentContent(e.target.value)}
//                   placeholder="Add a comment..."
//                   className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
           
//                 />
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   type="submit"
//                   className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
//                 >
//                   Post
//                 </motion.button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Home;







// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'react-toastify';

// const Home = () => {
//   const [posts, setPosts] = useState([]);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [commentContent, setCommentContent] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [statusOpen, setStatusOpen] = useState(null); // Changed to store post ID
//   const [postOpen, setPostOpen] = useState(null); // Changed to store post ID

//   // Fetch posts on mount
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           toast.error('Please log in to view posts', {
//             style: { background: '#F6643BFF', color: 'white' },
//           });
//           return;
//         }
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/post/allposts`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPosts(response.data.validPost);
//         console.log('Fetched posts:', response.data.validPost);
//         toast.success('Meet new people!', {
//           style: { background: '#F6643BFF', color: 'white' },
//         });
//       } catch (error) {
//         console.error(error);
//         toast.error(error.response?.data?.message || 'An error occurred while fetching posts', {
//           style: { background: '#F6643BFF', color: 'white' },
//         });
//       }
//     };
//     fetchPosts();
//   }, []);

//   // Handle like/unlike
//   const handleLike = async (postId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/like`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId ? { ...post, likes: response.data.likes } : post
//         )
//       );
//       toast.success('Like updated!');
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || 'Failed to update like');
//     }
//   };

//   // Handle share
//   const handleShare = async (postId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/share`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId ? { ...post, shares: response.data.shares } : post
//         )
//       );
//       toast.success('Post shared!', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to share post', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     }
//   };

//   // Handle comment submission
//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!commentContent.trim()) return;

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/post/${selectedPost._id}/comment`,
//         { content: commentContent },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === selectedPost._id ? { ...post, comments: response.data.comments } : post
//         )
//       );
//       setCommentContent('');
//       toast.success('Comment added!', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || 'Failed to add comment', {
//         style: { background: '#F6643BFF', color: 'white' },
//       });
//     }
//   };

//   // Open comment modal
//   const openCommentModal = (post) => {
//     setSelectedPost(post);
//     setIsModalOpen(true);
//   };

//   // Close comment modal
//   const closeCommentModal = () => {
//     setIsModalOpen(false);
//     setSelectedPost(null);
//     setCommentContent('');
//   };

//   // Check if user has liked the post
//   const hasLiked = (post, userId) => {
//     return post.likes?.some((like) => like.userId.toString() === userId);
//   };

//   // Toggle status modal
//   const toggleStatusModal = (postId) => {
//     setStatusOpen(statusOpen === postId ? null : postId);
//   };

//   // Toggle post modal
//   const togglePostModal = (postId) => {
//     setPostOpen(postOpen === postId ? null : postId);
//   };

//   // Filter statuses to show only those within 24 hours
//   const isStatusActive = (post) => {
//     const createdAt = new Date(post.createdAt);
//     const now = new Date();
//     const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
//     return post.isStatus && hoursDiff <= 24;
//   };


//   const currentUserId = localStorage.getItem('userId'); 

//   return (
//     <div className="min-h-screen p-4 sm:p-6">
//       {/* Statuses (Circular) */}
//       <div className="flex space-x-4 overflow-x-auto pb-4">
//         {posts
//           ?.filter(isStatusActive)
//           .map((post) => (
//             <motion.div
//               key={post._id}
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.3 }}
//               className="flex-shrink-0"
//             >
//               <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-300 transition-all duration-200">
//                 {post.media?.url ? (
//                   post.media.type === 'video' ? (
//                     <video
//                       src={post.media.url}
//                       className="w-full h-full object-cover"
//                       onClick={() => toggleStatusModal(post._id)}
//                       muted
//                       loop
//                       autoPlay
//                     />
//                   ) : (
//                     <img
//                       src={post.media.url}
//                       alt="Status"
//                       className="w-full h-full object-cover"
//                       onClick={() => toggleStatusModal(post._id)}
//                     />
//                   )
//                 ) : (
//                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
//                     {post.content.slice(0, 10)}...
//                   </div>
//                 )}
//                 <h4 className="text-black font-bold text-center text-xs mt-1">{post.userId?.fullname}</h4>
//               </div>
//               {statusOpen === post._id && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
//                     {post.media?.url ? (
//                       post.media.type === 'video' ? (
//                         <video
//                           src={post.media.url}
//                           controls
//                           className="w-full h-auto max-h-[80vh] object-contain"
//                         />
//                       ) : (
//                         <img
//                           src={post.media.url}
//                           alt="Status"
//                           className="w-full h-auto max-h-[80vh] object-contain"
//                         />
//                       )
//                     ) : (
//                       <div className="text-center text-gray-600">{post.content}</div>
//                     )}
//                     <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
//                     <button
//                       onClick={() => toggleStatusModal(post._id)}
//                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           ))}
//       </div>

//       <div className="max-w-full mx-auto mt-6 space-y-6">
//         {posts
//           ?.filter((post) => !isStatusActive(post))
//           .map((post) => (
//             <motion.div
//               key={post._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="bg-white p-4 sm:p-6 rounded-xl shadow-md border"
//             >
//               <div className="flex items-center space-x-3 mb-4">
//                 <img
//                   src={post.userId?.picture}
//                   className="w-10 h-10 bg-gray-300 rounded-full"
//                   alt="User profile"
//                 />
//                 <div>
//                   <p className="font-semibold text-sm sm:text-base text-gray-800">
//                     {post.userId?.fullname || 'unknown'}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(post.createdAt).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//               {post.content && (
//                 <p className="text-sm sm:text-base text-gray-700 mb-4">{post.content}</p>
//               )}
//               {post.media?.url && (
//                 post.media.type === 'video' ? (
//                   <video
//                     src={post.media.url}
//                     controls
//                     className="w-full h-60 rounded-md mb-4 object-cover"
//                     onClick={() => togglePostModal(post._id)}
//                   />
//                 ) : (
//                   <img
//                     src={post.media.url}
//                     alt="Post media"
//                     className="w-full h-60 rounded-md mb-4 object-cover"
//                     onClick={() => togglePostModal(post._id)}
//                   />
//                 )
//               )}
//               <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
//                 <span>{post.likes?.length} Likes</span>
//                 <span>{post.comments?.length} Comments</span>
//                 <span>{post.shares?.length} Shares</span>
//               </div>
//               {postOpen === post._id && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
//                     {post.media?.url ? (
//                       post.media.type === 'video' ? (
//                         <video
//                           src={post.media.url}
//                           controls
//                           className="w-full h-auto max-h-[80vh] object-contain"
//                         />
//                       ) : (
//                         <img
//                           src={post.media.url}
//                           alt="Post media"
//                           className="w-full h-auto max-h-[80vh] object-contain"
//                         />
//                       )
//                     ) : (
//                       <div className="text-center text-gray-600">{post.content}</div>
//                     )}
//                     <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
//                     <button
//                       onClick={() => togglePostModal(post._id)}
//                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 </div>
//               )}
//               <div className="flex space-x-2 border-t pt-2">
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => handleLike(post._id)}
//                   className={`flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
//                     hasLiked(post, currentUserId) ? 'text-orange-500' : 'text-gray-600'
//                   }`}
//                 >
//                   <FiHeart className="mr-2" size={20} />
//                   Like
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => openCommentModal(post)}
//                   className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
//                 >
//                   <FiMessageSquare className="mr-2" size={20} />
//                   Comment
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => handleShare(post._id)}
//                   className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
//                 >
//                   <FiShare2 className="mr-2" size={20} />
//                   Share
//                 </motion.button>
//               </div>
//             </motion.div>
//           ))}
//         {posts.filter((post) => !isStatusActive(post)).length === 0 && (
//           <p className="text-center text-gray-600">No posts available.</p>
//         )}
//       </div>

//       {/* Comment Modal */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.8, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.8, y: 20 }}
//               className="bg-white rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold text-gray-800">Comments</h3>
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   onClick={closeCommentModal}
//                   className="text-orange-500 hover:text-orange-600"
//                 >
//                   <FiShare2 size={24} />
//                 </motion.button>
//               </div>
//               {selectedPost?.comments.length > 0 ? (
//                 <div className="space-y-3 mb-4">
//                   {selectedPost.comments.map((comment) => (
//                     <div key={comment._id} className="border-b pb-2">
//                       <p className="font-semibold text-sm text-gray-800">
//                         User {comment?.userId?.fullname || 'unknown'}
//                       </p>
//                       <p className="text-sm text-gray-600">{comment.content}</p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(comment.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-600 mb-4">No comments yet.</p>
//               )}
//               <form onSubmit={handleCommentSubmit} className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={commentContent}
//                   onChange={(e) => setCommentContent(e.target.value)}
//                   placeholder="Add a comment..."
//                   className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 />
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   type="submit"
//                   className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
//                 >
//                   Post
//                 </motion.button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Home;



























































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
  const [statusOpen, setStatusOpen] = useState(null);
  const [postOpen, setPostOpen] = useState(null);
  const [isCommentLoading, setIsCommentLoading] = useState(false); // Added for comment loading
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Added for user profile modal
  const [selectedUser, setSelectedUser] = useState(null); // Added for user profile data
  const [userMediaType, setUserMediaType] = useState('images'); // Added to toggle images/videos
  const [userPosts, setUserPosts] = useState([]); // Added for user’s posts

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
        console.log('Fetched posts:', response.data.validPost);
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
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      toast.success('Like updated!');
    } catch (error) {
      console.log(error);
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
      setUserPosts((prevPosts) =>
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

    setIsCommentLoading(true);
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
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPost._id ? { ...post, comments: response.data.comments } : post
        )
      );
      setCommentContent('');
      toast.success('Comment added!', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to add comment', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } finally {
      setIsCommentLoading(false);
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

  // Toggle status modal
  const toggleStatusModal = (postId) => {
    setStatusOpen(statusOpen === postId ? null : postId);
  };

  // Toggle post modal
  const togglePostModal = (postId) => {
    setPostOpen(postOpen === postId ? null : postId);
  };

  // Filter statuses to show only those within 24 hours
  const isStatusActive = (post) => {
    const createdAt = new Date(post.createdAt);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return post.isStatus && hoursDiff <= 24;
  };

  // Fetch user profile and posts
  const fetchUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch user details
      const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId }, // Assume endpoint supports userId query param
      });
      const userData = userResponse.data.data;

      // Fetch Let's Meet profile
      const letsMeetResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/check-profile`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });
      const letsMeetData = letsMeetResponse.data.hasProfile ? letsMeetResponse.data.profile : {};

      // Fetch user posts
      const postsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/post/allposts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });
      setUserPosts(postsResponse.data.validPost || []);

      setSelectedUser({ ...userData, letsMeet: letsMeetData });
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to fetch user profile', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    }
  };

  const currentUserId = localStorage.getItem('userId');

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Statuses (Circular) */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {posts
          ?.filter(isStatusActive)
          .map((post) => (
            <motion.div
              key={post._id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-300 transition-all duration-200">
                {post.media?.url ? (
                  post.media.type === 'video' ? (
                    <video
                      src={post.media.url}
                      className="w-full h-full object-cover"
                      onClick={() => toggleStatusModal(post._id)}
                      muted
                      loop
                      autoPlay
                    />
                  ) : (
                    <img
                      src={post.media.url}
                      alt="Status"
                      className="w-full h-full object-cover"
                      onClick={() => toggleStatusModal(post._id)}
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                    {post.content.slice(0, 10)}...
                  </div>
                )}
                <h4 className="text-black font-bold text-center text-xs mt-1">{post.userId?.fullname}</h4>
              </div>
              {statusOpen === post._id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
                    {post.media?.url ? (
                      post.media.type === 'video' ? (
                        <video
                          src={post.media.url}
                          controls
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                      ) : (
                        <img
                          src={post.media.url}
                          alt="Status"
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                      )
                    ) : (
                      <div className="text-center text-gray-600">{post.content}</div>
                    )}
                    <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
                    <button
                      onClick={() => toggleStatusModal(post._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
      </div>

      <div className="max-w-full mx-auto mt-6 space-y-6">
        {posts
          ?.filter((post) => !isStatusActive(post))
          .map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-md border"
            >
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={post.userId?.picture}
                  className="w-10 h-10 bg-gray-300 rounded-full"
                  alt="User profile"
                />
                <div>
                  <p
                    className="font-semibold text-sm sm:text-base text-gray-800 cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => fetchUserProfile(post.userId?._id)}
                  >
                    {post.userId?.fullname || 'unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {post.content && (
                <p className="text-sm sm:text-base text-gray-700 mb-4">{post.content}</p>
              )}
              {post.media?.url && (
                post.media.type === 'video' ? (
                  <video
                    src={post.media.url}
                    controls
                    className="w-full h-60 rounded-md mb-4 object-cover"
                    onClick={() => togglePostModal(post._id)}
                  />
                ) : (
                  <img
                    src={post.media.url}
                    alt="Post media"
                    className="w-full h-60 rounded-md mb-4 object-cover"
                    onClick={() => togglePostModal(post._id)}
                  />
                )
              )}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>{post.likes?.length} Likes</span>
                <span>{post.comments?.length} Comments</span>
                <span>{post.shares?.length} Shares</span>
              </div>
              {postOpen === post._id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="relative bg-white rounded-lg p-4 max-w-lg w-full">
                    {post.media?.url ? (
                      post.media.type === 'video' ? (
                        <video
                          src={post.media.url}
                          controls
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                      ) : (
                        <img
                          src={post.media.url}
                          alt="Post media"
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                      )
                    ) : (
                      <div className="text-center text-gray-600">{post.content}</div>
                    )}
                    <h4 className="text-black font-bold text-center mt-2">{post.userId?.fullname}</h4>
                    <button
                      onClick={() => togglePostModal(post._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <div className="flex space-x-2 border-t pt-2">
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
        {/* {posts.filter((post) => !isStatusActive(post)).length === 0 && (
          <p className="text-center text-gray-600">No posts available.</p>
        )} */}
        {posts.filter((post) => !isStatusActive(post)).length === 0 && (
  <div className="flex justify-center items-center py-8">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-1 border-4 border-[#1E3A8A] border-b-transparent rounded-full animate-spin animation-delay-150"></div>
    </div>
  </div>
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
              className="bg-white rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto relative"
            >
              <button
                onClick={closeCommentModal}
                className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
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
                    <div key={comment._id} className="border-b pb-2">
                      <p className="font-semibold text-sm text-gray-800">
                        {comment.userId?.fullname || 'Anonymous'}
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
                  disabled={isCommentLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center w-16"
                  disabled={isCommentLoading}
                >
                  {isCommentLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    'Post'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedUser && (
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
              className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
              <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <img
                  src={selectedUser.picture || 'https://via.placeholder.com/150'}
                  alt="User profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-orange-500 object-cover"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedUser.fullname || 'Unknown'}</h2>
                  <p className="text-gray-600">{selectedUser.nationality || 'N/A'}</p>
                  <p className="text-gray-600">{selectedUser.currentLocation || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">User Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p className="text-gray-600">
                    <span className="font-semibold">Gender:</span> {selectedUser.gender || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Marital Status:</span> {selectedUser.maritalStatus || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Interests:</span> {selectedUser.interest1 || 'N/A'}, {selectedUser.interest2 || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">State of Origin:</span> {selectedUser.stateOfOrigin || 'N/A'}
                  </p>
                </div>
              </div>
              {selectedUser.letsMeet && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Let's Meet Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p className="text-gray-600">
                      <span className="font-semibold">Height:</span> {selectedUser.letsMeet.height || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Faith:</span> {selectedUser.letsMeet.faith || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Smoke:</span> {selectedUser.letsMeet.smoke || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Drink:</span> {selectedUser.letsMeet.drink || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Personality:</span> {selectedUser.letsMeet.personality || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Education:</span> {selectedUser.letsMeet.education || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Career:</span> {selectedUser.letsMeet.career || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Ethnicity:</span> {selectedUser.letsMeet.ethnicity || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              <div className="border-t pt-4 mt-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setUserMediaType('images')}
                    className={`text-sm font-semibold ${userMediaType === 'images' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => setUserMediaType('videos')}
                    className={`text-sm font-semibold ${userMediaType === 'videos' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
                  >
                    Videos
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userPosts
                    .filter((post) => post.media?.url && post.media.type === (userMediaType === 'images' ? 'image' : 'video'))
                    .map((post) => (
                      <div key={post._id} className="relative">
                        {post.media.type === 'video' ? (
                          <video
                            src={post.media.url}
                            controls
                            className="w-full h-40 rounded-md object-cover"
                          />
                        ) : (
                          <img
                            src={post.media.url}
                            alt="User media"
                            className="w-full h-40 rounded-md object-cover"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 flex justify-between">
                          <span>{post.likes?.length} Likes</span>
                          <span>{post.comments?.length} Comments</span>
                          <span>{post.shares?.length} Shares</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(post._id)}
                            className={`flex-1 flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                              hasLiked(post, currentUserId) ? 'text-orange-500' : 'text-gray-600'
                            }`}
                          >
                            <FiHeart className="mr-1" size={16} />
                            Like
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openCommentModal(post)}
                            className="flex-1 flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                          >
                            <FiMessageSquare className="mr-1" size={16} />
                            Comment
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShare(post._id)}
                            className="flex-1 flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
                          >
                            <FiShare2 className="mr-1" size={16} />
                            Share
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  {userPosts.filter((post) => post.media?.url && post.media.type === (userMediaType === 'images' ? 'image' : 'video')).length === 0 && (
                    <p className="text-gray-600 text-center col-span-full">No {userMediaType} uploaded.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;