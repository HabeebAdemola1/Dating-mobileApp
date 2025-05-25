
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
export default function Chat({onClose}) {
  const [selectedChat, setSelectedChat] = useState(null);
  const chats = [
    { id: 1, name: 'Friend 1', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Friend 2', lastMessage: 'Check this out!' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#F6643BFF' }}>
        <h2 className="text-base sm:text-lg font-bold text-gray-800">Chats</h2>
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
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 border-b transition-colors duration-200"
            style={{ borderColor: '#F6643BFF' }}
            onClick={() => setSelectedChat(chat)}
          >
            <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full"></div>
            <div>
              <p className="font-semibold text-sm sm:text-base">{chat.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedChat && (
        <div className="p-2 border-t" style={{ borderColor: '#F6643BFF' }}>
          <h3 className="font-semibold text-sm sm:text-base">{selectedChat.name}</h3>
          <div className="h-32 sm:h-40 overflow-y-auto mb-2 text-xs sm:text-sm">
            <p>{selectedChat.lastMessage}</p>
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F6643BFF' }}
            />
            <button className="bg-orange-500 text-white p-2 rounded-r-lg text-sm hover:bg-orange-600 transition-colors duration-200">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
