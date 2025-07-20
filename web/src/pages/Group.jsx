/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
// import CommunityHome from "../components/group/CommunityHome";
// import CreateGroup from "../components/group/CreatedGroup";
// import GroupChat from "../components/group/GroupChat";
// import JoinGroup from "../components/group/JoinGroup";

// const Group = () => {
//   const [userId, setUserId] = useState(null);
//   const [groups, setGroups] = useState([]);
//   const [currentGroup, setCurrentGroup] = useState(null);
//   const [view, setView] = useState("home");
//   const [socket, setSocket] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Fetch userId and user's groups
//     const initialize = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Please log in to access groups");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // Fetch userId
//         const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const userId = userResponse.data.data?.userId; 
//         setUserId(userId);

//         // Fetch user's groups
//         const groupsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/user`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const userGroups = groupsResponse.data;
//         setGroups(userGroups);

   
//         if (userGroups.length > 0) {
//           setCurrentGroup(userGroups[0]); 
//           setView("chat");
//         }

//         // Initialize Socket.IO
//         const socketInstance = io(`${import.meta.env.VITE_BACKEND_URL}`, {
//           reconnection: true,
//           reconnectionAttempts: 5,
//         });
//         setSocket(socketInstance);

//         socketInstance.on("connect_error", () => {
//           toast.error("Failed to connect to the server");
//         });

//         setIsLoading(false);

//         // Cleanup socket
//         return () => {
//           socketInstance.disconnect();
//         };
//       } catch (error) {
//         toast.error(error.response?.data?.error || "Failed to initialize");
//         localStorage.removeItem("token");
//         setIsLoading(false);
//       }
//     };

//     initialize();
//   }, []);

//   // Consolidated loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   // Show login prompt if no userId
//   if (!userId) {
//     return (
//       <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
//         Please log in to access groups.
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen bg-[#1E3A8A] text-white"
//       role="region"
//       aria-label="Group and Community Section"
//     >
//       <ToastContainer position="top-right" autoClose={3000} />
//       {view === "home" && (
//         <CommunityHome userId={userId} setView={setView} setCurrentGroup={setCurrentGroup} />
//       )}
//       {view === "create" && (
//         <CreateGroup
//           userId={userId}
//           setView={setView}
//           setGroups={setGroups}
//           setCurrentGroup={setCurrentGroup}
//         />
//       )}
//       {view === "join" && (
//         <JoinGroup
//           userId={userId}
//           setView={setView}
//           setCurrentGroup={setCurrentGroup}
//           socket={socket}
//         />
//       )}
//       {view === "chat" && currentGroup && (
//         <GroupChat
//           userId={userId}
//           group={currentGroup}
//           setView={setView}
//           socket={socket}
//           setCurrentGroup={setCurrentGroup}
//         />
//       )}
//     </div>
//   );
// };

// Group.propTypes = {};

// export default Group;



import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Group = ({ userProfile }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [joinUniqueNumber, setJoinUniqueNumber] = useState('');
  const [showGroupList, setShowGroupList] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('social');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchGroups, setSearchGroups] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState({
    createGroup: false,
    joinGroup: false,
    sendMessage: false,
    renameGroup: false,
    deleteGroup: false,
    leaveGroup: false,
  });
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token: localStorage.getItem('token'), userId: userProfile?._id },
    });

    socketRef.current.emit('join-user', { userId: userProfile?._id, token: localStorage.getItem('token') });

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setGroups(response.data.groups || []);
      })
      .catch(() => toast.error('Failed to fetch groups'));

    socketRef.current.on('group-list', async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setGroups(response.data.groups || []);
      } catch (error) {
        toast.error('Failed to update group list');
      }
    });

    socketRef.current.on('group-message', (messageData) => {
      if (messageData.groupId === selectedGroup?.uniqueNumber) {
        setMessages((prev) => [...prev, messageData]);
      } else {
        const group = groups.find((g) => g.uniqueNumber === messageData.groupId);
        toast.info(`New message in ${group?.name || 'group'}`);
      }
    });

    socketRef.current.on('typing', ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
    });

    socketRef.current.on('user-status', ({ userId, status }) => {
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          members: group.members.map((member) =>
            member._id === userId ? { ...member, status } : member
          ),
        }))
      );
    });

    socketRef.current.on('join-request', ({ uniqueNumber, userId }) => {
      if (selectedGroup?.uniqueNumber === uniqueNumber && selectedGroup.admins.includes(userProfile._id)) {
        toast.info(`New join request for ${selectedGroup.name}`);
      }
    });

    socketRef.current.on('join-request-updated', async ({ uniqueNumber, userId, status }) => {
      if (selectedGroup?.uniqueNumber === uniqueNumber) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/groups`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setGroups(response.data.groups || []);
          if (status === 'accepted' && userId === userProfile._id) {
            const newGroup = response.data.groups.find((g) => g.uniqueNumber === uniqueNumber);
            setSelectedGroup(newGroup);
            const messagesResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/groups/group-messages/${uniqueNumber}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setMessages(messagesResponse.data.messages || []);
            toast.success('Join request accepted');
          }
        } catch (error) {
          toast.error('Failed to update group');
        }
      }
    });

    socketRef.current.on('group-renamed', ({ uniqueNumber, newName }) => {
      setGroups((prev) =>
        prev.map((g) => (g.uniqueNumber === uniqueNumber ? { ...g, name: newName } : g))
      );
      if (selectedGroup?.uniqueNumber === uniqueNumber) {
        setSelectedGroup((prev) => ({ ...prev, name: newName }));
        toast.success('Group renamed');
      }
    });

    socketRef.current.on('group-deleted', ({ uniqueNumber }) => {
      setGroups((prev) => prev.filter((g) => g.uniqueNumber !== uniqueNumber));
      if (selectedGroup?.uniqueNumber === uniqueNumber) {
        setSelectedGroup(null);
        setMessages([]);
        toast.success('Group deleted');
      }
    });

    socketRef.current.on('member-left', ({ uniqueNumber, userId }) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.uniqueNumber === uniqueNumber
            ? {
                ...g,
                members: g.members.filter((m) => m._id !== userId),
                admins: g.admins.filter((id) => id !== userId),
              }
            : g
        )
      );
      if (selectedGroup?.uniqueNumber === uniqueNumber) {
        setSelectedGroup((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m._id !== userId),
          admins: prev.admins.filter((id) => id !== userId),
        }));
        toast.info('A member left the group');
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userProfile, selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (searchUsers) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/search-users?query=${searchUsers}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => setUserResults(response.data.users || []))
        .catch(() => toast.error('Failed to search users'));
    } else {
      setUserResults([]);
    }
  }, [searchUsers]);

  useEffect(() => {
    if (searchGroups) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/search-groups?query=${searchGroups}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => setGroupResults(response.data.groups || []))
        .catch(() => toast.error('Failed to search groups'));
    } else {
      setGroupResults([]);
    }
  }, [searchGroups]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup || isLoading.sendMessage) return;
    setIsLoading((prev) => ({ ...prev, sendMessage: true }));
    socketRef.current.emit(
      'send-group-message',
      {
        uniqueNumber: selectedGroup.uniqueNumber,
        content: newMessage,
        senderId: userProfile._id,
        type: 'text',
      },
      (response) => {
        setIsLoading((prev) => ({ ...prev, sendMessage: false }));
        if (response.status === 'success') {
          setNewMessage('');
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleSendVoiceMessage = async (e) => {
    const file = e.target.files[0];
    if (!file || isLoading.sendMessage) return;
    setIsLoading((prev) => ({ ...prev, sendMessage: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'essential');
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/audio/upload', formData);
      socketRef.current.emit(
        'send-group-message',
        {
          uniqueNumber: selectedGroup.uniqueNumber,
          content: response.data.secure_url,
          senderId: userProfile._id,
          type: 'voice',
        },
        (response) => {
          setIsLoading((prev) => ({ ...prev, sendMessage: false }));
          if (response.status !== 'success') {
            toast.error(response.message);
          }
        }
      );
    } catch (error) {
      setIsLoading((prev) => ({ ...prev, sendMessage: false }));
      toast.error('Failed to upload voice message');
    }
  };

  const handleCreateGroup = () => {
    if (!groupName || !['business', 'social'].includes(groupType) || isLoading.createGroup) {
      toast.error('Invalid group name or type');
      return;
    }
    setIsLoading((prev) => ({ ...prev, createGroup: true }));
    socketRef.current.emit(
      'create-group',
      { groupName, type: groupType, userId: userProfile._id, members: selectedMembers },
      (response) => {
        setIsLoading((prev) => ({ ...prev, createGroup: false }));
        if (response.status === 'success') {
          setGroups((prev) => [...prev, { uniqueNumber: response.uniqueNumber, name: groupName, type: groupType, members: selectedMembers, admins: [userProfile._id] }]);
          setSelectedGroup({ uniqueNumber: response.uniqueNumber, name: groupName, type: groupType, members: selectedMembers, admins: [userProfile._id] });
          setMessages([]);
          setIsCreateGroupModalOpen(false);
          setGroupName('');
          setGroupType('social');
          setSelectedMembers([]);
          setSearchUsers('');
          toast.success('Group created successfully!');
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleJoinGroup = (uniqueNumber) => {
    if (isLoading.joinGroup) return;
    setIsLoading((prev) => ({ ...prev, joinGroup: true }));
    socketRef.current.emit(
      'join-group-request',
      { uniqueNumber, userId: userProfile._id },
      (response) => {
        setIsLoading((prev) => ({ ...prev, joinGroup: false }));
        if (response.status === 'success') {
          toast.success('Join request sent');
          setJoinUniqueNumber('');
          setSearchGroups('');
          setIsJoinGroupModalOpen(false);
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleJoinRequest = (userId, action) => {
    socketRef.current.emit(
      'handle-join-request',
      { uniqueNumber: selectedGroup.uniqueNumber, userId, action },
      (response) => {
        if (response.status === 'success') {
          toast.success(`Join request ${action}`);
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleRenameGroup = () => {
    const newName = prompt('Enter new group name:');
    if (!newName || isLoading.renameGroup) return;
    setIsLoading((prev) => ({ ...prev, renameGroup: true }));
    socketRef.current.emit(
      'rename-group',
      { uniqueNumber: selectedGroup.uniqueNumber, newName },
      (response) => {
        setIsLoading((prev) => ({ ...prev, renameGroup: false }));
        if (response.status === 'success') {
          toast.success('Group renamed successfully');
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleDeleteGroup = () => {
    if (!window.confirm('Are you sure you want to delete this group?') || isLoading.deleteGroup) return;
    setIsLoading((prev) => ({ ...prev, deleteGroup: true }));
    socketRef.current.emit(
      'delete-group',
      { uniqueNumber: selectedGroup.uniqueNumber },
      (response) => {
        setIsLoading((prev) => ({ ...prev, deleteGroup: false }));
        if (response.status === 'success') {
          toast.success('Group deleted successfully');
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  const handleLeaveGroup = () => {
    if (!window.confirm('Are you sure you want to leave this group?') || isLoading.leaveGroup) return;
    setIsLoading((prev) => ({ ...prev, leaveGroup: true }));
    socketRef.current.emit(
      'leave-group',
      { uniqueNumber: selectedGroup.uniqueNumber, userId: userProfile._id },
      (response) => {
        setIsLoading((prev) => ({ ...prev, leaveGroup: false }));
        if (response.status === 'success') {
          setSelectedGroup(null);
          setMessages([]);
          toast.success('Left group successfully');
        } else {
          toast.error(response.message);
        }
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#1E3A8A]">
      {/* Group List */}
      <div className={`w-full md:w-1/3   shadow-lg overflow-y-auto ${showGroupList ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900"></h2>
        </div>
        {groups.map((group) => (
          <div
            key={group.uniqueNumber}
            onClick={async () => {
              setSelectedGroup(group);
              setShowGroupList(false);
              try {
                const response = await axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/group-messages/${group.uniqueNumber}`,
                  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setMessages(response.data.messages || []);
              } catch (error) {
                toast.error('Failed to load messages');
              }
            }}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedGroup?.uniqueNumber === group.uniqueNumber ? 'bg-orange-100' : ''}`}
          >
            <h3 className="font-semibold text-gray-900">{group.name} ({group.type})</h3>
            <p className="text-sm text-gray-600">
              {group.members.map((m) => `${m.fullname} (${m.status || 'offline'})`).join(', ')}
            </p>
            {group.joinRequests.some((req) => req.user._id === userProfile._id && req.status === 'pending') && (
              <p className="text-sm text-orange-500">Join request pending</p>
            )}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-4 bg-white border-b">
          <button onClick={() => setShowGroupList(!showGroupList)} className="text-orange-500">
            {showGroupList ? 'Hide Groups' : 'Show Groups'}
          </button>
        </div>
        {selectedGroup ? (
          <>
            <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedGroup.name} ({selectedGroup.type})</h2>
                <p className="text-sm text-gray-600">
                  {typingUsers.size > 0
                    ? `${Array.from(typingUsers)
                        .map((id) => groups.find((g) => g.members.some((m) => m._id === id))?.members.find((m) => m._id === id)?.fullname || 'Someone')
                        .join(', ')} typing...`
                    : ' '}
                </p>
              </div>
              <div className="flex gap-2">
                {selectedGroup.admins.includes(userProfile._id) && (
                  <>
                    <button
                      onClick={handleRenameGroup}
                      className="text-blue-500 hover:text-blue-600 flex items-center"
                      disabled={isLoading.renameGroup}
                    >
                      {isLoading.renameGroup ? (
                        <svg className="animate-spin h-5 w-5 mr-1 text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : (
                        'Rename'
                      )}
                    </button>
                    <button
                      onClick={handleDeleteGroup}
                      className="text-red-500 hover:text-red-600 flex items-center"
                      disabled={isLoading.deleteGroup}
                    >
                      {isLoading.deleteGroup ? (
                        <svg className="animate-spin h-5 w-5 mr-1 text-red-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={handleLeaveGroup}
                  className="text-red-500 hover:text-red-600 flex items-center"
                  disabled={isLoading.leaveGroup}
                >
                  {isLoading.leaveGroup ? (
                    <svg className="animate-spin h-5 w-5 mr-1 text-red-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    'Leave'
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-[#1E3A8A]">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${msg.sender._id === userProfile._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${msg.sender._id === userProfile._id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {msg.type === 'voice' ? (
                      <audio ref={audioRef} controls src={msg.content} className="max-w-full" />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className={`text-xs ${msg.sender._id === userProfile._id ? 'text-gray-200' : 'text-gray-400'} mt-1`}>
                      {new Date(msg.createdAt).toLocaleTimeString()} {msg.status === 'delivered' ? '✓✓' : '✓'} {msg.edited ? '(Edited)' : ''}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t flex items-center">
              <input
                type="file"
                accept="audio/*"
                onChange={handleSendVoiceMessage}
                className="hidden"
                id="voice-upload"
              />
              <label htmlFor="voice-upload" className="cursor-pointer p-2">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a2 2 0 00-2 2v6a2 2 0 004 0V4a2 2 0 00-2-2zM8 12a4 4 0 118 0v2a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2H8z" />
                </svg>
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  socketRef.current.emit('typing', {
                    uniqueNumber: selectedGroup.uniqueNumber,
                    userId: userProfile._id,
                    isTyping: e.target.value.length > 0,
                  });
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading.sendMessage}
              />
              <button
                onClick={handleSendMessage}
                className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600 transition flex items-center"
                disabled={isLoading.sendMessage}
              >
                {isLoading.sendMessage ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            {selectedGroup.admins.includes(userProfile._id) && selectedGroup.joinRequests.length > 0 && (
              <div className="p-4 bg-white border-t">
                <h3 className="text-sm font-semibold">Join Requests</h3>
                {selectedGroup.joinRequests.map((req) => (
                  <div key={req.user._id} className="flex items-center gap-2 mt-1">
                    <span>{req.user.fullname}</span>
                    <button
                      onClick={() => handleJoinRequest(req.user._id, 'accepted')}
                      className="text-green-500 hover:text-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleJoinRequest(req.user._id, 'rejected')}
                      className="text-red-500 hover:text-red-600"
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white bg-[#1E3A8A]">
            <p className="mb-4">Select a group to start chatting</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="bg-orange-500 text-white w-24 h-24 rounded-lg hover:bg-orange-600 transition flex items-center justify-center"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 00-1 1v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setIsJoinGroupModalOpen(true)}
                className="bg-orange-500 text-white w-24 h-24 rounded-lg hover:bg-orange-600 transition flex items-center justify-center"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0h10v10H5V5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Create Group</h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="social">Social</option>
              <option value="business">Business</option>
            </select>
            <input
              type="text"
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              placeholder="Search users to add"
              className="w-full p-2 border rounded mb-4"
            />
            {userResults.map((user) => (
              <div key={user._id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user._id)}
                  onChange={() => {
                    setSelectedMembers((prev) =>
                      prev.includes(user._id)
                        ? prev.filter((id) => id !== user._id)
                        : [...prev, user._id]
                    );
                  }}
                />
                <span>{user.fullname}</span>
              </div>
            ))}
            <button
              onClick={handleCreateGroup}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition flex items-center justify-center"
              disabled={isLoading.createGroup}
            >
              {isLoading.createGroup ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                'Create Group'
              )}
            </button>
            <button
              onClick={() => setIsCreateGroupModalOpen(false)}
              className="w-full mt-2 text-gray-600 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {isJoinGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Join Group</h2>
            <input
              type="text"
              value={searchGroups}
              onChange={(e) => setSearchGroups(e.target.value)}
              placeholder="Search by group name or unique number"
              className="w-full p-2 border rounded mb-4"
            />
            {groupResults.map((group) => (
              <div key={group.uniqueNumber} className="flex items-center justify-between mb-2">
                <span>{group.name} ({group.type}) - {group.uniqueNumber}</span>
                <button
                  onClick={() => handleJoinGroup(group.uniqueNumber)}
                  className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 flex items-center"
                  disabled={isLoading.joinGroup}
                >
                  {isLoading.joinGroup ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    'Request to Join'
                  )}
                </button>
              </div>
            ))}
            <button
              onClick={() => setIsJoinGroupModalOpen(false)}
              className="w-full mt-4 text-gray-600 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Group;