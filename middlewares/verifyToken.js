import jwt from "jsonwebtoken"
import express from "express"


export const  verifyToken = async(req, res, next) => {
    let token = req.header('authorization');

    token = token.split(' ')[1]
    if(!token){
        return res.status(401).json({
            message: "unauthorized",
            status: false
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        console.log(error)
        res.status(400).json({msg: 'Token is not valid'})
    }
}



















































// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import jwtDecode from "jwt-decode";
// import { io } from "socket.io-client";

// const Chat = () => {
//   const [chatList, setChatList] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Initialize Socket.IO and fetch chat list
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Please log in to access chats");
//       toast.error("Authentication required");
//       return;
//     }

//     let decoded;
//     try {
//       decoded = jwtDecode(token);
//     } catch (e) {
//       setError("Invalid token");
//       toast.error("Invalid token. Please log in again.");
//       localStorage.removeItem("token");
//       return;
//     }

//     // Connect to Socket.IO
//     const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
//       auth: { token },
//     });

//     newSocket.on("connect", () => {
//       console.log("Socket connected:", newSocket.id);
//       newSocket.emit("joinRoom", decoded.id);
//     });

//     newSocket.on("friendAccepted", (data) => {
//       setChatList((prev) => [
//         ...prev,
//         { user: data.userId, conversationId: data.conversationId },
//       ]);
//       toast.success(data.message);
//       console.log("Friend accepted:", data);
//     });

//     newSocket.on("newMessage", (data) => {
//       if (data.conversationId === selectedChat?.conversationId) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             content: data.content,
//             sender: data.senderId,
//             timestamp: data.timestamp,
//           },
//         ]);
//       }
//       toast.info(`New message from ${data.senderId}`);
//     });

//     newSocket.on("error", (data) => {
//       toast.error(data.message);
//       console.error("Socket error:", data.message);
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("Socket connection error:", err.message);
//       toast.error("Failed to connect to chat server");
//     });

//     setSocket(newSocket);

//     // Fetch chat list
//     const fetchChatList = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/dating/profile`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setChatList(response.data.dating.chatList);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to fetch chat list");
//         toast.error(err.response?.data?.message || "Failed to fetch chat list");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatList();

//     return () => {
//       newSocket.disconnect();
//       console.log("Socket disconnected");
//     };
//   }, []);

//   // Fetch messages for selected chat
//   const fetchMessages = async (conversationId) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/dating/conversation/${conversationId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setMessages(response.data.conversation.messages);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch messages");
//       toast.error(err.response?.data?.message || "Failed to fetch messages");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle chat selection
//   const handleSelectChat = (chat) => {
//     setSelectedChat(chat);
//     fetchMessages(chat.conversationId);
//   };

//   // Handle sending a message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !selectedChat) return;

//     try {
//       const token = localStorage.getItem("token");
//       const decoded = jwtDecode(token);
//       const recipientId = selectedChat.user;

//       socket.emit("sendMessage", {
//         conversationId: selectedChat.conversationId,
//         content: newMessage,
//         recipientId,
//       });

//       setNewMessage("");
//     } catch (err) {
//       toast.error("Failed to send message");
//       console.error("Error sending message:", err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 flex">
//       {/* Chat List */}
//       <div className="w-1/3 bg-white p-4 rounded-lg shadow-lg mr-4">
//         <h2 className="text-xl font-bold mb-4">Chats</h2>
//         {loading && <p>Loading...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {chatList.length === 0 && !loading && <p>No chats yet</p>}
//         <ul>
//           {chatList.map((chat) => (
//             <li
//               key={chat.conversationId}
//               onClick={() => handleSelectChat(chat)}
//               className={`p-2 mb-2 rounded-md cursor-pointer ${
//                 selectedChat?.conversationId === chat.conversationId
//                   ? "bg-blue-100"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               User ID: {chat.user}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Chat Window */}
//       <div className="w-2/3 bg-white p-4 rounded-lg shadow-lg">
//         {selectedChat ? (
//           <>
//             <h2 className="text-xl font-bold mb-4">
//               Chat with User {selectedChat.user}
//             </h2>
//             <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-md bg-gray-50">
//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`mb-2 ${
//                     msg.sender === jwtDecode(localStorage.getItem("token")).id
//                       ? "text-right"
//                       : "text-left"
//                   }`}
//                 >
//                   <span
//                     className={`inline-block p-2 rounded-md ${
//                       msg.sender === jwtDecode(localStorage.getItem("token")).id
//                         ? "bg-blue-500 text-white"
//                         : "bg-gray-200"
//                     }`}
//                   >
//                     {msg.content}
//                   </span>
//                   <p className="text-xs text-gray-500">
//                     {new Date(msg.timestamp).toLocaleTimeString()}
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSendMessage} className="flex">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type a message..."
//                 className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <button
//                 type="submit"
//                 className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//               >
//                 Send
//               </button>
//             </form>
//           </>
//         ) : (
//           <p>Select a chat to start messaging</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;


