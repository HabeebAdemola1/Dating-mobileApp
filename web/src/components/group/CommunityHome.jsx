// /* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */
  import { IconPlus, IconUsersGroup } from "@tabler/icons-react";
  const CommunityHome = ({ userId, setView, setCurrentGroup }) => (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mt-8 text-center font-bold mb-10 text-[#F97316]">Community</h1>
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




// import PropTypes from "prop-types";
// import { IconUsersGroup, IconPlus } from "@tabler/icons-react";

// const CommunityHome = ({ userId, setView, setCurrentGroup }) => {
//   return (
//     <div className="container mx-auto p-4 min-h-screen bg-[#1E3A8A] text-white">
//       <h1 className="text-2xl font-bold mb-4 text-[#F97316]">Community</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <button
//           onClick={() => setView("create")}
//           className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C] flex items-center justify-center transition-colors"
//           aria-label="Create a new group"
//         >
//           <IconPlus className="w-5 h-5 mr-2" />
//           Create Group
//         </button>
//         <button
//           onClick={() => setView("join")}
//           className="bg-[#F97316] text-white px-4 py-2 rounded hover:bg-[#EA580C] flex items-center justify-center transition-colors"
//           aria-label="Join a group"
//         >
//           <IconUsersGroup className="w-5 h-5 mr-2" />
//           Join Group
//         </button>
//       </div>
//       <div className="mt-4">
//         <h2 className="text-xl font-semibold mb-2 text-[#F97316]">Your Groups</h2>
//         {/* Groups are already fetched in Group.jsx; pass them if needed */}
//         <p className="text-gray-400">Select a group from the chat view or create/join a new one.</p>
//       </div>
//     </div>
//   );
// };

// CommunityHome.propTypes = {
//   userId: PropTypes.string.isRequired,
//   setView: PropTypes.func.isRequired,
//   setCurrentGroup: PropTypes.func.isRequired,
// };

// export default CommunityHome;