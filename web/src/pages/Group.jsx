import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import CommunityHome from "../components/group/CommunityHome";
import CreateGroup from "../components/group/CreatedGroup"; 
import GroupChat from "../components/group/GroupChat";
import JoinGroup from "../components/group/JoinGroup";

const Group = () => {
  const [userId, setUserId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [view, setView] = useState("home");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch userId from token
    const fetchUserId = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access groups");
        // Optionally redirect to login page
        return;
      }
   

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
         
        setUserId(response.data.data.userId); 
    
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to authenticate user");
        localStorage.removeItem("token"); 
      }
    };

    fetchUserId();

    const socketInstance = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);


    socketInstance.on("connect_error", () => {
      toast.error("Failed to connect to the server");
    });

  
    return () => {
      socketInstance.disconnect();
    };
  }, []);



  if(!socket){
     console.log(" not connected to socket io")

    return (
      <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

    if (!userId ) {
    console.log("userId is not found ")

    return (
      <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1E3A8A] text-white"
      role="region"
      aria-label="Group and Community Section"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {view === "home" && (
        <CommunityHome userId={userId} setView={setView} setCurrentGroup={setCurrentGroup} />
      )}
      {view === "create" && (
        <CreateGroup userId={userId} setView={setView} setGroups={setGroups} />
      )}
      {view === "join" && (
        <JoinGroup
          userId={userId}
          setView={setView}
          setCurrentGroup={setCurrentGroup}
          socket={socket}
        />
      )}
      {view === "chat" && currentGroup && (
        <GroupChat
          userId={userId}
          group={currentGroup}
          setView={setView}
          socket={socket}
          setCurrentGroup={setCurrentGroup}
        />
      )}
    </div>
  );
};

Group.propTypes = {
 
};

export default Group;