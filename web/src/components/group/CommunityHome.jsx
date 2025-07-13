/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
  import { IconPlus, IconUsersGroup } from "@tabler/icons-react";
  const CommunityHome = ({ userId, setView, setCurrentGroup }) => (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-[#F97316]">Community</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="bg-[#F97316] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-[#EA580C]"
            onClick={() => setView('create')}
          >
            <IconPlus className="w-12 h-12 mb-2" />
            <h2 className="text-xl font-semibold">Create a Group</h2>
            <p>Create your own community and invite members.</p>
          </div>
          <div
            className="bg-[#F97316] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-[#EA580C]"
            onClick={() => setView('join')}
          >
            <IconUsersGroup className="w-12 h-12 mb-2" />
            <h2 className="text-xl font-semibold">Join a Group</h2>
            <p>Search and join existing communities.</p>
          </div>
        </div>
      </div>
    );
export default CommunityHome