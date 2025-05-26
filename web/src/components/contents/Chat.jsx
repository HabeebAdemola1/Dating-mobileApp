import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

export default function Chat({ onClose }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  const [conversationId, setConversationId] = useState(null);

  // Fetch userId
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data.data.userId);
      } catch (error) {
        console.error('Fetch userId error:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch user');
      }
    };
    fetchUserId();
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO:', newSocket.id);
    });

    newSocket.on('newMessage', (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, {
          content: message.content,
          sender: message.senderId,
          timestamp: message.timestamp,
        }]);
        setLastMessages((prev) => ({
          ...prev,
          [selectedFriend?.id]: message.content,
        }));
      }
    });

    newSocket.on('error', (err) => {
      console.error('Socket.IO error:', err);
      toast.error(err.message || 'Socket.IO error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, conversationId, selectedFriend]);

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
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
    fetchFriends();
  }, []);

  // Fetch last messages for friends
  useEffect(() => {
    const fetchLastMessages = async () => {
      const token = localStorage.getItem('token');
      const messages = {};
      for (const friend of friends) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/messages/${friend.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          messages[friend.id] = response.data.data.messages.slice(-1)[0]?.content || 'No messages yet';
        } catch (error) {
          messages[friend.id] = 'No messages yet';
        }
      }
      setLastMessages(messages);
    };
    if (friends.length > 0) {
      fetchLastMessages();
    }
  }, [friends]);

  // Fetch messages and conversation ID when a friend is selected
  useEffect(() => {
    if (!selectedFriend) return;
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch conversation
        const convResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const conversation = convResponse.data.data.conversations.find(conv =>
          conv.participants.some(p => p._id.toString() === selectedFriend.id)
        );
        setConversationId(conversation?._id.toString() || null);

        // Fetch messages
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/messages/${selectedFriend.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.data.messages);
      } catch (error) {
        console.error('Fetch messages error:', error);
        toast.error(error.response?.data?.message || 'No conversation found');
        setMessages([]);
        setConversationId(null);
      }
    };
    fetchMessages();
  }, [selectedFriend]);

  const openModal = (friend) => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    setIsModalOpen(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !socket) return;
    try {
      socket.emit('new message', {
        conversationId: conversationId,
        content: newMessage,
        recipientId: selectedFriend.id,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#F6643BFF' }}>
        <h2 className="text-base sm:text-lg font-bold text-gray-800">Chats ({friends.length})</h2>
        {onClose && (
          <button
            className="sm:hidden text-orange-500 hover:text-orange-600 transition-colors duration-200"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500 p-2">No friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 border-b transition-colors duration-200"
                style={{ borderColor: '#F6643BFF' }}
                onClick={() => selectFriend(friend)}
                onContextMenu={(e) => { e.preventDefault(); openModal(friend); }}
              >
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full overflow-hidden">
                  {friend.picture ? (
                    <img src={friend.picture} alt={friend.fullname} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{friend.fullname}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {lastMessages[friend.id] || 'Loading...'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedFriend && (
        <div className="p-2 border-t" style={{ borderColor: '#F6643BFF' }}>
          <h3 className="font-semibold text-sm sm:text-base">{selectedFriend.fullname}</h3>
          <div className="h-32 sm:h-40 overflow-y-auto mb-2 text-xs sm:text-sm space-y-2">
            {messages.map((msg, index) => (
              <p
                key={index}
                className={`max-w-[70%] p-2 rounded-lg ${
                  msg.sender.toString() === userId
                    ? 'bg-[#F6643BFF] text-white ml-auto'
                    : 'bg-gray-200 text-gray-800 mr-auto'
                }`}
              >
                {msg.content}
              </p>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F6643BFF' }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="bg-orange-500 text-white p-2 rounded-r-lg text-sm hover:bg-orange-600 transition-colors duration-200"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedFriend?.fullname}'s Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              {selectedFriend?.picture && (
                <img
                  src={selectedFriend.picture}
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
              <p><strong>Interests:</strong> {selectedFriend?.interest1 || 'N/A'}, {selectedFriend?.interest2 || 'N/A'}</p>
              <p><strong>Religion:</strong> {selectedFriend?.religion || 'N/A'}</p>
              <p><strong>Genotype:</strong> {selectedFriend?.genotype || 'N/A'}</p>
              <p><strong>Blood Group:</strong> {selectedFriend?.bloodGroup || 'N/A'}</p>
              <p><strong>Bio:</strong> {selectedFriend?.bio || 'No bio provided'}</p>
              <p><strong>Admirers:</strong> {selectedFriend?.admirersCount || 0}</p>
              {selectedFriend?.pictures?.length > 0 && (
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