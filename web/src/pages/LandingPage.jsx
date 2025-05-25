import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiMessageSquare } from 'react-icons/fi';
import Feed from '../components/contents/Feed';
import Friends from '../components/contents/Friends';
import Chat from '../components/contents/Chat';
import { useEffect } from 'react';
import {toast} from "sonner"
import axios from 'axios';
import Home from '../components/contents/Home';
import Admirers from '../components/contents/Admirers';
// LandingPage Component
const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('newsfeed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [data, setData] = useState([])



  useEffect(() => {
    const fetchData = async() => {
        try {
            const token = localStorage.getItem("token")
            if(!token){
                toast.error("toast not found")
            }
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            }
            )
            setData(response.data.user)
            toast.success(`welcome ${response.data.user.email}`, {
                styles:{background:  '#F6643BFF', color: "white"}
            })
        } catch (error) {
            console.log(error)
            toast.error(error.message || "an error occurred ")
        }
    }
    fetchData()
  }, [])







  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;
      case 'newsfeed':
        return <Feed />;
      case 'friends':
        return <Friends />;
      case 'admirers':
        return <Admirers />;
      case 'groups':
        return <Chat onClose={() => setIsChatOpen(false)} />;
      default:
        return <Home />;
    }
  };





  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white bg-opacity-95 shadow-md p-3 sm:p-4 flex items-center justify-between fixed w-full top-0 z-30 border-b transition-all duration-300" style={{ borderColor: '#F6643BFF' }}>
        <div className="flex items-center space-x-2">
          <button
            className="sm:hidden text-orange-500 hover:text-orange-600 p-2 rounded-full transition-colors duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="text-xl sm:text-2xl font-bold text-orange-500">L<span className='font-nedium'>et's</span> M<span>eet</span></div>
          <input
            type="text"
            placeholder="Search..."
            className="p-2 ml-50 border rounded-lg w-32 sm:w-64 md:w-96 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#F6643BFF' }}
          />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            className="sm:hidden text-orange-500 hover:text-orange-600 p-2 rounded-full transition-colors duration-200"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
          </button>
          <img 
          src={data.picture}
          className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full"/>
          <span className="hidden sm:block text-sm sm:text-base">{data.fullname || data.email}</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed top-14 h-[calc(100vh-3.5rem)] bg-white shadow border-r z-20 transition-transform duration-300 transform ${
            isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 sm:w-64 sm:translate-x-0'
          }`}
          style={{ borderColor: '#F6643BFF' }}
        >
          <nav className="space-y-2 p-3 sm:pt-4">
            <button
              className="sm:hidden text-orange-500 hover:text-orange-600 p-2 w-full flex justify-end transition-colors duration-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiX size={24} />
            </button>
            <button
              onClick={() => {
                setActiveSection('home');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                activeSection === 'home' ? 'bg-gray-100' : ''
              }`}
            >
              <FiHome size={20} className="sm:mr-3" />
              <span className="text-sm sm:text-base font-medium">Home</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('newsfeed');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                activeSection === 'newsfeed' ? 'bg-gray-100' : ''
              }`}
            >
              <FiHome size={20} className="sm:mr-3" />
              <span className="text-sm sm:text-base font-medium">Feed</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('friends');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                activeSection === 'friends' ? 'bg-gray-100' : ''
              }`}
            >
              <FiUsers size={20} className="sm:mr-3" />
              <span className="text-sm sm:text-base font-medium">Friends</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('admirers');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                activeSection === 'admirers' ? 'bg-gray-100' : ''
              }`}
            >
              <FiUsers size={20} className="sm:mr-3" />
              <span className="text-sm sm:text-base font-medium">Admirers</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('groups');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                activeSection === 'groups' ? 'bg-gray-100' : ''
              }`}
            >
              <FiMessageSquare size={20} className="sm:mr-3" />
              <span className="text-sm sm:text-base font-medium">Groups</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 sm:ml-64 p-2 sm:p-4 md:mr-80">
          {renderContent()}
        </main>

        {/* Chat Sidebar (Desktop) */}
        <aside
          className="hidden md:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 bg-white shadow border-l p-4 transition-all duration-300"
          style={{ borderColor: '#F6643BFF' }}
        >
          <Chat />
        </aside>

        {/* Chat Panel (Mobile) */}
        {isChatOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-white z-30 transform transition-transform duration-300"
            style={{ borderColor: '#F6643BFF' }}
          >
            <Chat onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;