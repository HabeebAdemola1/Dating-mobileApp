
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { IconMicrophone } from "@tabler/icons-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
const GroupChat = ({ userId, group, setView, socket, setCurrentGroup }) => {
  const [messages, setMessages] = useState(group.messages);
  const [message, setMessage] = useState("");
  const [voiceNote, setVoiceNote] = useState(null);
  const [members, setMembers] = useState(group.members);
  const [admins, setAdmins] = useState(group.admins);
  const [showMembers, setShowMembers] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socket.emit("joinGroup", { groupId: group._id, userId });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("messageEdited", ({ messageId, newContent }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
        )
      );
    });
    socket.on("userJoined", ({ userId }) => {
      setMembers((prev) => [...prev, userId]);
    });
    socket.on("userRemoved", ({ userId }) => {
      setMembers((prev) => prev.filter((id) => id !== userId));
    });
    socket.on("adminAdded", ({ userId }) => {
      setAdmins((prev) => [...prev, userId]);
    });
    socket.on("groupRenamed", ({ newName }) => {
      setCurrentGroup((prev) => ({ ...prev, name: newName }));
    });
    socket.on("joinRequest", ({ groupId, userId }) => {
      if (admins.includes(userId)) {
        toast.info("New join request received!");
      }
    });
    socket.on("joinRequestResponse", ({ groupId, status }) => {
      toast[status === "accepted" ? "success" : "error"](`Join request ${status}`);
      if (status === "accepted") {
        setCurrentGroup(group);
        socket.emit("joinGroup", { groupId, userId });
      }
    });

    return () => {
      socket.emit("leaveGroup", { groupId: group._id, userId });
      socket.off("receiveMessage");
      socket.off("messageEdited");
      socket.off("userJoined");
      socket.off("userRemoved");
      socket.off("adminAdded");
      socket.off("groupRenamed");
      socket.off("joinRequest");
      socket.off("joinRequestResponse");
    };
  }, [group._id, userId, admins, setCurrentGroup, socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message || voiceNote) {
      const type = voiceNote ? "voice" : "text";
      let content = message;
      if (voiceNote) {
        // In production, upload voiceNote to a cloud service (e.g., Cloudinary) and get URL
        const formData = new FormData();
        formData.append("file", voiceNote);
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
            formData
          );
          content = response.data.url; // Backend should return the uploaded file URL
        } catch (error) {
          toast.error("Failed to upload voice note");
          return;
        }
      }
      socket.emit("sendMessage", { groupId: group._id, userId, content, type });
      setMessage("");
      setVoiceNote(null);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      socket.emit("editMessage", { groupId: group._id, messageId, newContent });
      setEditingMessageId(null);
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        setVoiceNote(e.data);
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/addMember`,
        {
          groupId: group._id,
          email: newMemberEmail,
          adminId: userId,
        }
      );
      setMembers(response.data.members);
      setNewMemberEmail("");
      toast.success("Member added successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/removeMember`,
        {
          groupId: group._id,
          userId: memberId,
          adminId: userId,
        }
      );
      setMembers(response.data.members);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove member");
    }
  };

  const handleMakeAdmin = async (memberId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/makeAdmin`,
        {
          groupId: group._id,
          userId: memberId,
          adminId: userId,
        }
      );
      setAdmins(response.data.admins);
      toast.success("Admin added successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to make admin");
    }
  };

  const handleRenameGroup = async (newName) => {
    if (!newName) {
      toast.error("Group name cannot be empty");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/rename`,
        {
          groupId: group._id,
          newName,
          adminId: userId,
        }
      );
      setCurrentGroup(response.data);
      toast.success("Group renamed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to rename group");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#F97316]">
        {group.name}#{group.uniqueNumber}
      </h1>
      <button
        onClick={() => setShowMembers(!showMembers)}
        className="mb-4 bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C]"
      >
        {showMembers ? "Hide Members" : "Show Members"}
      </button>
      {showMembers && (
        <div className="bg-gray-800 내려놓은 mb-4">
          <h2 className="text-xl font-semibold mb-2">Members</h2>
          {admins.includes(userId) && (
            <div className="mb-4">
              <input
                type="text"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Add member by email"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <button
                onClick={handleAddMember}
                className="mt-2 bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C]"
              >
                Add Member
              </button>
            </div>
          )}
          {members.map((member) => (
            <div key={member} className="flex justify-between items-center mb-2">
              <span>{member}</span> {/* Replace with user fullname/email */}
              {admins.includes(userId) && (
                <div>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Remove
                  </button>
                  {!admins.includes(member) && (
                    <button
                      onClick={() => handleMakeAdmin(member)}
                      className="bg-[#F97316] text-white px-2 py-1 rounded"
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="bg-gray-800 p-4 rounded mb-4 h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <span className="font-semibold">{msg.sender}:</span>
            {msg.type === "voice" ? (
              <audio controls src={msg.content} className="w-full" />
            ) : editingMessageId === msg._id ? (
              <input
                type="text"
                defaultValue={msg.content}
                onBlur={(e) => handleEditMessage(msg._id, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                autoFocus
              />
            ) : (
              <span>
                {msg.content} {msg.edited && "(Edited)"}
              </span>
            )}
            {msg.sender === userId && msg.type === "text" && (
              <button
                onClick={() => setEditingMessageId(msg._id)}
                className="text-[#F97316] ml-2"
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Type a message"
        />
        <button
          type="button"
          onClick={voiceNote ? stopRecording : startRecording}
          className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C]"
        >
          <IconMicrophone className="w-5 h-5" />
        </button>
        <button
          type="submit"
          className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C]"
        >
          Send
        </button>
      </form>
      {admins.includes(userId) && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="New group name"
            onBlur={(e) => handleRenameGroup(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
      )}
      <button
        onClick={() => setView("home")}
        className="mt-4 text-[#F97316] hover:underline"
      >
        Back
      </button>
    </div>
  );
};

GroupChat.propTypes = {
  userId: PropTypes.string.isRequired,
  group: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    uniqueNumber: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        sender: PropTypes.string,
        content: PropTypes.string,
        type: PropTypes.string,
        edited: PropTypes.bool,
      })
    ),
    members: PropTypes.arrayOf(PropTypes.string),
    admins: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setView: PropTypes.func.isRequired,
  socket: PropTypes.instanceOf(Socket).isRequired,
  setCurrentGroup: PropTypes.func.isRequired,
};

export default GroupChat;