import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiUsers, FiMessageSquare, FiRss } from 'react-icons/fi';
import Feed from '../components/contents/Feed';
import Friends from '../components/contents/Friends';
import Chat from '../components/contents/Chat';
import { toast } from 'sonner';
import axios from 'axios';
import Home from '../components/contents/Home';
import Admirers from '../components/contents/Admirers';
import Profile from '../components/contents/Profile';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('newsfeed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('toast not found');
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.user);
        toast.success(`welcome ${response.data.user.email}`, {
          styles: { background: '#F6643BFF', color: 'white' },
        });
      } catch (error) {
        console.log(error);
        toast.error(error.message || 'an error occurred ');
      }
    };
    fetchData();
  }, []);

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
      case 'profile':
        return <Profile />;
      case 'groups':
        return <Chat onClose={() => setIsChatOpen(false)} />;
      default:
        return <Home />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <FiHome size={20} /> },
    { id: 'newsfeed', label: 'Feed', icon: <FiRss size={20} /> },
    { id: 'friends', label: 'Friends', icon: <FiUsers size={20} /> },
    { id: 'admirers', label: 'Admirers', icon: <FiUsers size={20} /> },
    { id: 'profile', label: 'Profile', icon: <FiMessageSquare size={20} /> },
    { id: 'groups', label: 'Groups', icon: <FiMessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="bg-white bg-opacity-95 shadow-md p-3 sm:p-4 flex items-center justify-between fixed w-full top-0 z-30 border-b transition-all duration-300"
        style={{ borderColor: '#F6643BFF' }}
      >
        <div className="flex items-center space-x-2">
          <div className="text-xl sm:text-2xl font-bold text-orange-500">
            L<span className="font-nedium">et's</span> M<span>eet</span>
          </div>
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
            alt="Profile"
            className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-300 rounded-full"
          />
          <span className="hidden sm:block text-sm sm:text-base">{data.fullname || data.email}</span>
        </div>
      </header>

      {/* Mobile Top Navigation */}
      <nav
        className="sm:hidden fixed top-14 w-full bg-white shadow-md border-b z-20 flex justify-around items-center py-2"
        style={{ borderColor: '#F6643BFF' }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              setIsChatOpen(false);
            }}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
              activeSection === item.id ? 'bg-orange-100 text-orange-500' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Layout */}
      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar (Desktop) */}
        <aside
          className="hidden sm:block fixed top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow border-r z-20"
          style={{ borderColor: '#F6643BFF' }}
        >
          <nav className="space-y-2 p-3 sm:pt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                  activeSection === item.id ? 'bg-gray-100' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-sm sm:text-base font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 sm:ml-64 p-2 sm:p-4 md:mr-80 pt-12 sm:pt-0">
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