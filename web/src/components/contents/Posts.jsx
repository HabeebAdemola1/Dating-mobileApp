import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/post`;
const getToken = () => localStorage.getItem('token');

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [isStatus, setIsStatus] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setSuccess('');
  //   setIsLoading(true); // Set loading to true

  //   const formData = new FormData();
  //   formData.append('content', content);
  //   formData.append('isStatus', isStatus);
  //   if (file) formData.append('media', file);

  //   try {
  //     const response = await axios.post(`${API_URL}/createpost`, formData, {
  //       headers: {
  //         'Authorization': `Bearer ${getToken()}`,
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     setSuccess(response.data.message);
  //     setContent('');
  //     setFile(null);
  //     setIsStatus(false);
  //     onPostCreated();
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to create post');
  //   } finally {
  //     setIsLoading(false); // Reset loading state
  //   }
  // };


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setIsLoading(true); // Set loading to true

  const formData = new FormData();
  formData.append('content', content);
  formData.append('isStatus', isStatus.toString()); // Explicitly convert to string
  if (file) formData.append('media', file);

  // Log FormData entries for debugging
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    const response = await axios.post(`${API_URL}/createpost`, formData, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    setSuccess(response.data.message);
    setContent('');
    setFile(null);
    setIsStatus(false);
    onPostCreated();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create post');
  } finally {
    setIsLoading(false); // Reset loading state
  }
};
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg mb-6">
      <h2 className="text-2xl font-bold mb-4">Create Post</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 border rounded-lg"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isStatus"
            checked={isStatus}
            onChange={(e) => setIsStatus(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isStatus">Post as Status (expires in 24 hours)</label>
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
              Posting...
            </>
          ) : (
            'Post'
          )}
        </button>
      </form>
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState({}); // Object to track loading state for each action

  const fetchPosts = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, fetch: true }));
      const response = await axios.get(`${API_URL}/getpost`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      setPosts(response.data.validPosts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setIsLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    setEditingPost(post._id);
    setEditContent(post.content);
  };

  const handleUpdate = async (postId) => {
    try {
      setIsLoading((prev) => ({ ...prev, [postId]: true }));
      const response = await axios.put(
        `${API_URL}/posts/${postId}`,
        { content: editContent },
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      setPosts(posts.map((post) =>
        post._id === postId ? { ...post, content: editContent } : post
      ));
      setEditingPost(null);
      setEditContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId) => {
    try {
      setIsLoading((prev) => ({ ...prev, [postId]: true }));
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading.fetch && (
        <div className="flex justify-center mb-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
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
        </div>
      )}
      {posts.length === 0 && !isLoading.fetch ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="bg-white p-4 mb-4 shadow-md rounded-lg">
            {editingPost === post._id ? (
              <div className="space-y-4">
                <textarea
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                ></textarea>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(post._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center"
                    disabled={isLoading[post._id]}
                  >
                    {isLoading[post._id] ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center"
                    disabled={isLoading[post._id]}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-800">{post.content}</p>
                {post.media.url && (
                  post.media.type === 'video' ? (
                    <video
                      src={post.media.url}
                      controls
                      className="mt-2 max-w-full rounded-lg"
                    />
                  ) : (
                    <img
                      src={post.media.url}
                      alt="Post media"
                      className="mt-2 h-30 max-w-full rounded-lg"
                    />
                  )
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Posted by {post.userId.fullname} on {new Date(post.createdAt).toLocaleString()}
                  {post.isStatus && ' (Status)'}
                </p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center"
                    disabled={isLoading[post._id]}
                  >
                    {isLoading[post._id] ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Editing...
                      </>
                    ) : (
                      'Edit'
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
                    disabled={isLoading[post._id]}
                  >
                    {isLoading[post._id] ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const Posts = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CreatePost onPostCreated={() => window.location.reload()} />
      <PostList />
    </div>
  );
};

export default Posts;