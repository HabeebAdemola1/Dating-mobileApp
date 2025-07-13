/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

const JoinGroup = ({ userId, setView, setCurrentGroup, socket }) => {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState([]);

  // Debounced search function to reduce API calls
  const fetchGroups = debounce(async (searchQuery) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/search?query=${searchQuery}`
      );
      setGroups(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to search groups");
    }
  }, 300);

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      fetchGroups(query);
    } else {
      setGroups([]); // Clear results when query is empty
    }
    return () => fetchGroups.cancel(); // Cleanup debounced function
  }, [query]);

  // Handle group join request
  const handleJoin = async (groupId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/groups/sendJoinRequest`, {
        groupId,
        userId,
      });
      socket.emit("sendJoinRequest", { groupId, userId });
      toast.success("Join request sent!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send join request");
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-[#1E3A8A] text-white">
      <h1 className="text-2xl font-bold mb-8 mt-10 text-center text-[#F97316]">Join Group</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Search Groups</label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 pl-10 rounded bg-gray-800 text-white border-none focus:ring-2 focus:ring-[#F97316]"
            placeholder="Search by name or unique number"
            aria-label="Search groups by name or unique number"
          />
        </div>
      </div>
      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group._id}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-[#F97316]">
                {group.name}#{group.uniqueNumber}
              </h3>
              <p className="text-sm capitalize">{group.type}</p>
            </div>
            <button
              onClick={() => handleJoin(group._id)}
              className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C] transition-colors"
              aria-label={`Join ${group.name} group`}
            >
              Join
            </button>
          </div>
        ))}
        {query && groups.length === 0 && (
          <p className="text-gray-400">No groups found</p>
        )}
      </div>
      <button
        onClick={() => setView("home")}
        className="mt-4 text-[#F97316] hover:underline"
        aria-label="Back to community home"
      >
        Back
      </button>
    </div>
  );
};

JoinGroup.propTypes = {
  userId: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  setCurrentGroup: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired, // Socket.IO instance
};

export default JoinGroup;