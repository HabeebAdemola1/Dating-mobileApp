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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch userId and user's groups
    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access groups");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch userId
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = userResponse.data.data?.userId; 
        setUserId(userId);

        // Fetch user's groups
        const groupsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userGroups = groupsResponse.data;
        setGroups(userGroups);

   
        if (userGroups.length > 0) {
          setCurrentGroup(userGroups[0]); 
          setView("chat");
        }

        // Initialize Socket.IO
        const socketInstance = io(`${import.meta.env.VITE_BACKEND_URL}`, {
          reconnection: true,
          reconnectionAttempts: 5,
        });
        setSocket(socketInstance);

        socketInstance.on("connect_error", () => {
          toast.error("Failed to connect to the server");
        });

        setIsLoading(false);

        // Cleanup socket
        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to initialize");
        localStorage.removeItem("token");
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Consolidated loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Show login prompt if no userId
  if (!userId) {
    return (
      <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
        Please log in to access groups.
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
        <CreateGroup
          userId={userId}
          setView={setView}
          setGroups={setGroups}
          setCurrentGroup={setCurrentGroup}
        />
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

Group.propTypes = {};

export default Group;










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

//         // Prioritize user-created groups (where user is admin)
//         if (userGroups.length > 0) {
//           const createdGroup = userGroups.find((group) => group.admins.includes(userId)) || userGroups[0];
//           setCurrentGroup(createdGroup);
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

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#1E3A8A] text-white flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

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
//         <CommunityHome
//           userId={userId}
//           setView={setView}
//           setCurrentGroup={setCurrentGroup}
//           groups={groups}
//         />
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