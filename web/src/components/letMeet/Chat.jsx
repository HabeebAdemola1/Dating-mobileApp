/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
  auth: {
    token: localStorage.getItem('token'), // Assuming token is stored in localStorage
  },
});

const Chat = ({ userId, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Join conversation room
    socket.emit('joinConversation', { conversationId });

    // Fetch conversation history
    const fetchConversation = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getconversation/${conversationId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessages(response.data.data.messages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch conversation');
      }
    };
    fetchConversation();

    // Listen for new messages
    socket.on('receiveMessage', ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    // Handle errors
    socket.on('error', ({ message }) => {
      setError(message);
    });

    // Cleanup on unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('error');
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!content.trim()) return;
    socket.emit('sendMessage', { conversationId, content });
    setContent('');
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="h-64 overflow-y-auto mb-4 border p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}
          >
            <p className="font-semibold">{msg.senderName}</p>
            <p className="bg-gray-100 inline-block p-2 rounded">{msg.content}</p>
            <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;