/* eslint-disable react/prop-types */
  import { useState,  } from "react";
  import axios from "axios";
  
  const CreateGroup = ({ userId, setView, setGroups }) => {
      const [name, setName] = useState('');
      const [type, setType] = useState('social');

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/groups/create`, { name, type, userId });
          setGroups(prev => [...prev, response.data]);
          setView('home');
        } catch (error) {
          console.error('Error creating group:', error);
        }
      };

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-8 text-center mt-10 text-[#F97316]">Create Group</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Group Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option value="social">Social</option>
                <option value="business">Business</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C]"
            >
              Create
            </button>
          </form>
          <button
            onClick={() => setView('home')}
            className="mt-4 text-[#F97316] hover:underline"
          >
            Back
          </button>
        </div>
      );
    };


    export default CreateGroup