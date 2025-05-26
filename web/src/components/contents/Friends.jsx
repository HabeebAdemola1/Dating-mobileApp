/* eslint-disable react/no-unescaped-entities */
// File: C:\Users\HomePC\Desktop\reactNative\DatingApp\frontend\src\components\Friends.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMyFriends = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/myfriends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(response.data.data.friends);
      } catch (error) {
        console.error('Fetch friends error:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch friends');
      }
    };
    fetchMyFriends();
  }, []);

  const openModal = (friend) => {
    setSelectedFriend(friend);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
        Friends ({friends.length})
      </h2>
      {friends.length === 0 ? (
        <p className="text-sm sm:text-base text-gray-500">No friends yet.</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow border cursor-pointer hover:bg-gray-50"
              style={{ borderColor: '#F6643BFF' }}
              onClick={() => openModal(friend)}
            >
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full overflow-hidden">
                {friend.picture ? (
                  <img
                    src={friend.picture}
                    alt={friend.fullname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>
              <span className="text-sm sm:text-base text-gray-800">{friend.fullname}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {isModalOpen && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedFriend.fullname}'s Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              {selectedFriend.picture && (
                <img
                  src={selectedFriend?.picture}
                  alt={selectedFriend.fullname}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <p><strong>Email:</strong> {selectedFriend?.email || 'N/A'}</p>
              <p><strong>Age:</strong> {selectedFriend?.age || 'N/A'}</p>
              <p><strong>Gender:</strong> {selectedFriend?.gender || 'N/A'}</p>
              <p><strong>Nationality:</strong> {selectedFriend?.nationality || 'N/A'}</p>
              <p><strong>State of Origin:</strong> {selectedFriend?.stateOfOrigin || 'N/A'}</p>
              <p><strong>Occupation:</strong> {selectedFriend?.occupation || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {selectedFriend?.maritalStatus || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedFriend?.phoneNumber || 'N/A'}</p>
              <p><strong>Location:</strong> {selectedFriend?.currentLocation || 'N/A'}</p>
              <p><strong>Interests:</strong> {selectedFriend.interest1 || 'N/A'}, {selectedFriend?.interest2 || 'N/A'}</p>
              <p><strong>Religion:</strong> {selectedFriend?.religion || 'N/A'}</p>
              <p><strong>Genotype:</strong> {selectedFriend.genotype || 'N/A'}</p>
              <p><strong>Blood Group:</strong> {selectedFriend.bloodGroup || 'N/A'}</p>
              <p><strong>Bio:</strong> {selectedFriend.bio || 'No bio provided'}</p>
              <p><strong>Admirers:</strong> {selectedFriend.admirersCount || 0}</p>
              {selectedFriend.pictures?.length > 0 && (
                <div>
                  <strong>Photos:</strong>
                  <div className="flex space-x-2 mt-2">
                    {selectedFriend.pictures.map((pic, index) => (
                      <img
                        key={index}
                        src={pic}
                        alt={`Photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-[#F6643BFF] text-white py-2 rounded-lg hover:bg-[#e55a35]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;