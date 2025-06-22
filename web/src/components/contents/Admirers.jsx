import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FiUser, FiCheck, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Admirers = () => {
  const [myAdmirers, setMyAdmirers] = useState([]); 
  const [sentAdmirers, setSentAdmirers] = useState([]); 
  const [availableUsers, setAvailableUsers] = useState([]); 
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchMyAdmirers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view admirers', {
            style: { background: '#F6643BFF', color: 'white' },
          });
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/getmyadmirers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const admirers = Array.isArray(response.data.data.admirers) ? response.data.data.admirers : [];
        setMyAdmirers(admirers);
        console.log(response.data.data.admirers)
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching admirers', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };

    const fetchSentAdmirers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view sent invitations', {
            style: { background: '#F6643BFF', color: 'white' },
          });
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/getotheradmirer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSentAdmirers(response.data.data.admirers || []);
        console.log(response.data.data)
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching sent invitations', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };

    const fetchAvailableUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view available users', {
            style: { background: '#F6643BFF', color: 'white' },
          });
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/getdatingusers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Normalize data to match myAdmirers/sentAdmirers format
        const users = response.data.data.map((profile) => ({
          id: profile.userId._id,
          fullname: profile.userId.fullname,
          age: profile.userId.age,
          gender: profile.userId.gender,
          nationality: profile.userId.nationality,
          email: profile.userId.email,
          phoneNumber: profile.userId.phoneNumber,
          occupation: profile.userId.occupation,
          maritalStatus: profile.userId.maritalStatus,
          stateOfOrigin: profile.userId.stateOfOrigin,
          currentLocation: profile.userId.currentLocation,
          picture: profile.userId.picture,
          interest1: profile.userId.interest1,
          interest2: profile.userId.interest2,
        }));
        setAvailableUsers(users);
        console.log(users)
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching available users', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };

    const fetchAcceptedInvitations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/getaccepted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcceptedInvitations(response.data.data.accepted);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching accepted invitations', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };

    fetchMyAdmirers();
    fetchSentAdmirers();
    fetchAvailableUsers();
    fetchAcceptedInvitations();
  }, []);

  // Handle accept/reject invitation
  const handleRespond = async (senderProfileId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/dating/respond`,
        { senderProfileId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message, {
        style: { background: '#F6643BFF', color: 'white' },
      });
      // Update myAdmirers by removing the responded user
      setMyAdmirers((prev) => prev.filter((adm) => adm.id !== senderProfileId));
      // Add to acceptedInvitations if accepted
      if (action === 'accept') {
        const user = myAdmirers.find((adm) => adm.id === senderProfileId);
        setAcceptedInvitations((prev) => [...prev, user]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${action} invitation`, {
        style: { background: '#F6643BFF', color: 'white' },
      });
    }
  };

  // Handle send invitation
  const handleInvite = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/dating/invite`,
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message, {
        style: { background: '#F6643BFF', color: 'white' },
      });
      // Move user to sentAdmirers
      const user = availableUsers.find((u) => u.id === senderId);
      setSentAdmirers((prev) => [...prev, user]);
      setAvailableUsers((prev) => prev.filter((u) => u.id !== senderId));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send invitation', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    }
  };

  // Open user details modal
  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Filter available users to exclude myAdmirers, sentAdmirers, and acceptedInvitations
  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      !myAdmirers?.some((adm) => adm.id === user.id) &&
      !sentAdmirers?.some((adm) => adm.id === user.id) &&
      !acceptedInvitations?.some((adm) => adm.id === user.id)
  );

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Pending Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Pending Invitations</h2>
          {myAdmirers?.length > 0 ? (
            <div className="space-y-4">
              {myAdmirers.map((admirer) => (
                <motion.div
                  key={admirer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center"
                  // style={{ borderColor: '#F6643BFF' }}
                >
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openModal(admirer)}>
                    <FiUser className="text-orange-500 text-2xl" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">{admirer.fullname}</p>
                      <p className="text-xs text-gray-500">{admirer.age} years old, {admirer.gender}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRespond(admirer.id, 'accept')}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                    >
                      <FiCheck size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRespond(admirer.id, 'reject')}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    >
                      <FiX size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No pending invitations.</p>
          )}
        </motion.div>

        {/* Sent Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Sent Invitations</h2>
          {sentAdmirers.length > 0 ? (
            <div className="space-y-4">
              {sentAdmirers.map((admirer) => (
                <motion.div
                  key={admirer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-lg shadow-md border flex items-center space-x-3"
                  // style={{ borderColor: '#F6643BFF' }}
                >
                  <div className="cursor-pointer" onClick={() => openModal(admirer)}>
                    <FiUser className="text-orange-500 text-2xl" />
                    <div>
                    <img src={admirer?.picture} className='w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full ' />
                      <p className="font-semibold text-sm sm:text-base text-gray-800">{admirer.fullname}</p>
                      <p className="text-xs text-gray-500">{admirer.age} years old, {admirer.gender}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No sent invitations.</p>
          )}
        </motion.div>

        {/* Available Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Available Users</h2>
          {filteredAvailableUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredAvailableUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center"
                  // style={{ borderColor: '#F6643BFF' }}
                >
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openModal(user)}>
                    <FiUser className="text-orange-500 text-2xl" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">{user.fullname}</p>
                      <p className="text-xs text-gray-500">{user.age} years old, {user.gender}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleInvite(user.id)}
                    className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 flex items-center"
                  >
                    <FiSend className="mr-2" size={20} />
                    Invite
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No available users to invite.</p>
          )}
        </motion.div>

        {/* User Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedUser && (
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
                  <h3 className="text-lg font-bold text-gray-800">{selectedUser.fullname}’s Profile</h3>
                  <img src={selectedUser.picture} className='w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full' />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={closeModal}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Full Name:</strong> {selectedUser.fullname}</p>
                  <p><strong>Age:</strong> {selectedUser.age}</p>
                  <p><strong>Gender:</strong> {selectedUser.gender}</p>
                  <p><strong>Nationality:</strong> {selectedUser.nationality || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedUser?.phoneNumber || 'N/A'}</p>
                  <p><strong>marital-status:</strong> {selectedUser?.maritalStatus || 'N/A'}</p>
                  <p><strong>hobbies:</strong> {selectedUser?.interest1 || 'N/A'}, {selectedUser?.interest2 || 'N/A'}</p>
                  <p><strong>occupation:</strong> {selectedUser?.occupation || 'N/A'}</p>
                  <p><strong>state Of Origin:</strong> {selectedUser?.stateOfOrigin || 'N/A'}</p>
                  <p><strong>current Location:</strong> {selectedUser?.currentLocation || 'N/A'}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admirers;