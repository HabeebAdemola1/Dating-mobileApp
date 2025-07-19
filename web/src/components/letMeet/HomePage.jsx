/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import axios from 'axios';


const HomePage = ({ users, currentUserIndex, showDetails, setShowDetails, userGender, isLoading, handleXButton, handleMarkButton, handleImageClick, isImageModalOpen, selectedImage, setIsImageModalOpen }) => {
  useEffect(() => {
    if (users.length > 0 && currentUserIndex < users.length) {
      const user = users[currentUserIndex];
      if (user?.userId?._id) {
        axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/viewprofile`,
          { viewedUserId: user.userId._id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).catch((error) => console.error('View profile error:', error));
      }
    }
  }, [users, currentUserIndex]);

  if (isLoading) {
    return <div className="text-gray-700 text-center">Loading...</div>;
  }
  if (!userGender) {
    return <div className="text-gray-700 text-center">Please ensure your profile has a gender</div>;
  }
  if (users.length === 0 || currentUserIndex >= users.length) {
    return <div className="text-gray-700 text-center">No users found</div>;
  }
  const user = users[currentUserIndex];
  if (!user?.userId) {
    return <div className="text-gray-700 text-center">No user found</div>;
  }

  return (
    <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <img
        src={user.pictures[0] || 'https://via.placeholder.com/400'}
        alt="User"
        className="w-full h-96 object-cover"
      />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.userId?.fullname || 'Unknown'}, {user.userId.age || 'N/A'}
        </h2>
        <p className="text-gray-600">Nationality: {user.userId.nationality || 'N/A'}</p>
        <p className="text-gray-600">Faith: {user.faith || 'N/A'}</p>
        <p className="text-gray-600">Career: {user.career || 'N/A'}</p>
        {showDetails && (
          <div className="mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-4 mb-4">
              {user.pictures.slice(1).map((pic, index) => (
                pic && (
                  <img
                    key={index}
                    src={pic || 'https://via.placeholder.com/100'}
                    alt={`User Pic ${index + 2}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                    onClick={() => handleImageClick(pic || 'https://via.placeholder.com/100')}
                  />
                )
              ))}
            </div>
            <div className="flex flex-wrap gap-6">
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">📏</span> Height: <span className="font-medium text-gray-600 ml-1">{user.height || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🚬</span> Smoke: <span className="font-medium text-gray-600 ml-1">{user.smoke || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">♂️</span> Gender: <span className="font-medium text-gray-600 ml-1">{user.userId?.gender || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">💍</span> Marital Status: <span className="font-medium text-gray-600 ml-1">{user.userId?.maritalStatus || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🎨</span> Interests: <span className="font-medium text-gray-600 ml-1">{user.userId?.interest1 || 'N/A'}, {user.userId?.interest2 || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🏡</span> State of Origin: <span className="font-medium text-gray-600 ml-1">{user.userId?.stateOfOrigin || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🍺</span> Drink: <span className="font-medium text-gray-600 ml-1">{user.drink || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">😄</span> Personality: <span className="font-medium text-gray-600 ml-1">{user.personality || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🎓</span> Education: <span className="font-medium text-gray-600 ml-1">{user.education || 'N/A'}</span>
              </p>
              <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <span className="mr-3 text-xl">🌍</span> Ethnicity: <span className="font-medium text-gray-600 ml-1">{user.ethnicity || 'N/A'}</span>
              </p>
            </div>
            {isImageModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
                <img
                  src={selectedImage}
                  alt="Enlarged User"
                  className="max-w-3xl max-h-3xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleXButton}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
          >
            X
          </button>
          <button
            onClick={handleMarkButton}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;