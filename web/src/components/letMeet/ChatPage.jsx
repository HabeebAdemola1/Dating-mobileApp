/* eslint-disable react/prop-types */
import  { useState } from 'react';
import Chat from './Chat'
// import Chat from '../contents/Chat'; 

const ChatPage = ({ chatData, userProfile, handleSendCompliment }) => {
  const [chatSubPage, setChatSubPage] = useState('chatlist');

  return (
    <div className="p-4">
      <div className="flex justify-around mb-4">
        <button
          onClick={() => setChatSubPage('chatlist')}
          className={`px-4 py-2 rounded ${chatSubPage === 'chatlist' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Chat List
        </button>
        <button
          onClick={() => setChatSubPage('compliments')}
          className={`px-4 py-2 rounded ${chatSubPage === 'compliments' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Compliments
        </button>
        <button
          onClick={() => setChatSubPage('viewers')}
          className={`px-4 py-2 rounded ${chatSubPage === 'viewers' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Viewers
        </button>
      </div>
      {chatSubPage === 'chatlist' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Chat List</h2>
          {chatData.chatList.length === 0 ? (
            <p>No chats available</p>
          ) : (
            chatData.chatList.map((chat) => (
              <div key={chat.conversationId} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={chat.picture || 'https://via.placeholder.com/50'} alt={chat.fullname} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{chat.fullname}</p>
                    <Chat userId={userProfile?._id} conversationId={chat.conversationId} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {chatSubPage === 'compliments' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Received Compliments</h2>
          {chatData.compliments.length === 0 ? (
            <p>No compliments received</p>
          ) : (
            chatData.compliments.map((compliment, index) => (
              <div key={index} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={compliment.senderPicture || 'https://via.placeholder.com/50'} alt={compliment.senderName} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{compliment.senderName}</p>
                    <p>Compliment sent to you: <strong>{compliment.message}</strong></p>
                    <p className="text-sm text-gray-500">{new Date(compliment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {chatSubPage === 'viewers' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Profile Viewers</h2>
          {chatData.viewers.length === 0 ? (
            <p>No viewers</p>
          ) : (
            chatData.viewers.map((viewer) => (
              <div key={viewer.id} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={viewer.picture || 'https://via.placeholder.com/50'} alt={viewer.fullname} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{viewer.fullname}, {viewer.age}</p>
                    <p>{viewer.gender}, {viewer.nationality}</p>
                    <p>Interests: {viewer.interest1}, {viewer.interest2}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Send a compliment..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleSendCompliment(viewer.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;