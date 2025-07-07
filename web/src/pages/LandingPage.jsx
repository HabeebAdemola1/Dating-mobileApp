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
import { IconHome, IconRss, IconUsers, IconUserHeart, IconUser, IconUsersGroup, IconHeart, IconLogout } from '@tabler/icons-react';
import "../sideBar.css"
import LetsMeet from '../components/contents/Letmeet';
import Logout from '../components/contents/Logout';
import im from "../assets/download (1).jpeg"
import im1 from "../assets/download (2).jpeg"
import im2 from "../assets/download (3).jpeg"

import im3 from "../assets/3D oversized Hoodie with Sweatpants digital fashion concept design.jpeg"
import im4 from "../assets/britain.jpeg"
import im5 from "../assets/Wallpaper.jpeg"
import im6 from "../assets/download (7).jpeg"

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('newsfeed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [data, setData] = useState([]);
    const [currentAd, setCurrentAd] = useState(0);
    const [currentAd1, setCurrentAd1] = useState(0);
  const ads = [
    { id: 1, image: im, link: '#', alt: 'Advertisement 1',  text: 'Special Offer 10% Off!'  },
    { id: 2, image: im1, link: '#', alt: 'Advertisement 2',  text:  'New Arrivals Today!' },
    { id: 3, image: im2, link: '#', alt: 'Advertisement 3',  text: 'Limited Stock Sale!' },
  ];
  const ads1 = [
    { id: 4, image: im4, link: '#', alt: 'Advertisement 1',  text: 'top notch!'  },
    { id: 5, image: im3, link: '#', alt: 'Advertisement 2',  text:  'New Arrivals Today!' },
    { id: 6, image: im5, link: '#', alt: 'Advertisement 3',  text: 'Limited Stock available!' },
    { id: 7, image: im6, link: '#', alt: 'Advertisement 3',  text: 'you love it?!' },
  ];


   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prevAd) => (prevAd + 1) % ads.length);
    }, 5000); 
    return () => clearInterval(interval); 
  }, [ads.length]);
   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd1((prevAd) => (prevAd + 1) % ads1.length);
    }, 5000); 
    return () => clearInterval(interval); 
  }, [ads1.length]);

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
      case 'dating':
        return <LetsMeet />;
      case 'logout':
        return <Logout />;
    
      case 'groups':
        return <Chat onClose={() => setIsChatOpen(false)} />;
      default:
        return <Home />;
    }
  };

  const navItems = [
  { id: 'home', label: 'Home', icon: <IconHome size={24} /> },
  { id: 'newsfeed', label: 'Feed', icon: <IconRss size={24} /> },
  { id: 'friends', label: 'Friends', icon: <IconUsers size={24} /> },
  { id: 'admirers', label: 'Admirers', icon: <IconUserHeart size={24} /> },
  { id: 'profile', label: 'Profile', icon: <IconUser size={24} /> },
  { id: 'groups', label: 'Groups', icon: <IconUsersGroup size={24} /> },
  { id: 'dating', label: 'Dating', icon: <IconHeart size={24} /> },
  { id: 'logout', label: 'LogOut', icon: <IconLogout size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="bg-white bg-opacity-95 shadow-md p-3 sm:p-4 flex items-center justify-between fixed w-full top-0 z-30 border-b transition-all duration-300"
          // style={{ borderColor: '#F6643BFF' }}
      >
        <div className="flex items-center space-x-2">
          <div className="text-xl sm:text-2xl font-bold text-orange-500">
            L<span className="font-medium">et's</span> M<span>eet</span>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="p-2 ml-50 border rounded-lg w-32 sm:w-64 md:w-96 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            // style={{ borderColor: '#F6643BFF' }}
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
        // style={{ borderColor: '#F6643BFF' }}
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
      {/* <aside
      className="hidden sm:block fixed top-16 h-[calc(100vh-4rem)] w-64 bg-gray-200 shadow border-r z-20"
      style={{ borderColor: '#F6643B' }}
    >
      <nav className="space-y-2 p-3 sm:pt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 ${
              activeSection === item.id ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
          >
            <span className={`mr-3 icon ${activeSection === item.id ? 'icon-active' : 'icon-inactive'}`}>
              {item.icon}
            </span>
            <span className="text-sm sm:text-base font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside> */}


       <aside
      className="hidden sm:block fixed top-16 h-[calc(100vh-4rem)] w-64 bg-[#F0F2F5] shadow border-r z-20"
      // style={{ borderColor: '#F6643B' }}
    >
      <nav className="space-y-2 p-3 sm:pt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id, item.path)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 group ${
              activeSection === item.id
                ? 'bg-[#E7F3FF] text-[#F27618FF]'
                : 'text-[#65676B] hover:bg-[#E4E6E9]'
            }`}
            aria-label={`Navigate to ${item.label}`}
          >
            <span
              className={`mr-3 transition-colors duration-200 ${
                activeSection === item.id ? 'text-[#F27A18FF]' : 'text-[#65676B] group-hover:text-[#4B4D52]'
              }`}
            >
              {item.icon}
            </span>
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
      className="hidden md:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 bg-white shadow border-l p-4 transition-all duration-300 overflow-y-auto"
    >
       <div className="mb-6">
        <div className="relative overflow-hidden rounded-lg shadow-lg h-72"> 
          {ads1.map((ad1, index) => (
            <a
              key={ad1.id}
              href={ad1.link}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${index === currentAd1 ? 'opacity-100' : 'opacity-0'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={ad1.image} alt={ad1.alt} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-md text-sm font-medium">
                {ad1.text}
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-lg shadow-lg h-72"> 
          {ads.map((ad, index) => (
            <a
              key={ad.id}
              href={ad.link}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${index === currentAd ? 'opacity-100' : 'opacity-0'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={ad.image} alt={ad.alt} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-md text-sm font-medium">
                {ad.text}
              </div>
            </a>
          ))}
        </div>
      </div>
   
      <Chat />
    </aside>

        {/* Chat Panel (Mobile) */}
        {isChatOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-white z-30 transform transition-transform duration-300"
            // style={{ borderColor: '#F6643BFF' }}
          >
            <Chat onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;


































// import { useState, useEffect } from 'react';
// import { FiMenu, FiX, FiHome, FiUsers, FiMessageSquare, FiRss } from 'react-icons/fi';
// import Feed from '../components/contents/Feed';
// import Friends from '../components/contents/Friends';
// import Chat from '../components/contents/Chat';
// import { toast } from 'sonner';
// import axios from 'axios';
// import Home from '../components/contents/Home';
// import Admirers from '../components/contents/Admirers';
// import Profile from '../components/contents/Profile';

// import { IconHome, IconRss, IconUsers, IconUserHeart, IconUser, IconUsersGroup, IconMoon, IconSun } from '@tabler/icons-react';
// import "../sideBar.css"

// const LandingPage = () => {
//   const [activeSection, setActiveSection] = useState('newsfeed');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [data, setData] = useState([]);
//   const [isDark, setIsDark] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           toast.error('toast not found');
//         }
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setData(response.data.user);
//         toast.success(`welcome ${response.data.user.email}`, {
//           styles: { background: '#F6643B', color: 'white' },
//         });
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message || 'an error occurred ');
//       }
//     };
//     fetchData();
//   }, []);

//   const renderContent = () => {
//     switch (activeSection) {
//       case 'home':
//         return <Home />;
//       case 'newsfeed':
//         return <Feed />;
//       case 'friends':
//         return <Friends />;
//       case 'admirers':
//         return <Admirers />;
//       case 'profile':
//         return <Profile />;
//       case 'groups':
//         return <Chat onClose={() => setIsChatOpen(false)} />;
//       default:
//         return <Home />;
//     }
//   };

//   const navItems = [
//     { id: 'home', label: 'Home', icon: <IconHome size={24} /> },
//     { id: 'newsfeed', label: 'Feed', icon: <IconRss size={24} /> },
//     { id: 'friends', label: 'Friends', icon: <IconUsers size={24} /> },
//     { id: 'admirers', label: 'Admirers', icon: <IconUserHeart size={24} /> },
//     { id: 'profile', label: 'Profile', icon: <IconUser size={24} /> },
//     { id: 'groups', label: 'Groups', icon: <IconUsersGroup size={24} /> },
//   ];


//   return (
//     <div className="min-h-screen bg-[#121212]">
//       {/* Header */}
//       <header
//         className="bg-[#1C2526] bg-opacity-95 shadow-md p-3 sm:p-4 flex items-center justify-between fixed w-full top-0 z-30 border-b transition-all duration-300"
//         style={{ borderColor: '#F6643B' }}
//       >
//         <div className="flex items-center space-x-2">
//           <div className="text-xl sm:text-2xl font-bold text-[#F6643B]">
//             L<span className="font-medium text-[#E0E6ED]">et's</span> M<span className="text-[#E0E6ED]">eet</span>

//           </div>
//           <input
//             type="text"
//             placeholder="Search..."
//             className="p-2 ml-50 border rounded-lg w-32 sm:w-64 md:w-96 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#F6643B] bg-[#2E3A59] text-[#E0E6ED] placeholder-[#A3ACBF]"
//             style={{ borderColor: '#F6643B' }}
//           />
//         </div>
//         <div className="flex items-center space-x-2 sm:space-x-4">
//           <button
//             className="sm:hidden text-[#F6643B] hover:text-[#F88A5B] p-2 rounded-full transition-colors duration-200"
//             onClick={() => setIsChatOpen(!isChatOpen)}
//           >
//             {isChatOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
//           </button>
//            <button
//             className="p-2 rounded-full transition-colors duration-200 hover:text-[var(--hover-text-color)]"
//        onClick={() => setIsDark(!isDark)} 
//             aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
//           >
//             {isDark ? <IconSun size={24} /> : <IconMoon size={24}  />}
//           </button>


//           <img
//             src={data.picture}
//             alt="Profile"
//             className="w-6 sm:w-8 h-6 sm:h-8 bg-[#2E3A59] rounded-full"
//           />
//           <span className="hidden sm:block text-sm sm:text-base text-[#E0E6ED]">{data.fullname || data.email}</span>
//         </div>
//       </header>

//       {/* Mobile Top Navigation */}
//       <nav
//         className="sm:hidden fixed top-14 w-full bg-[#1C2526] shadow-md border-b z-20 flex justify-around items-center py-2"
//         style={{ borderColor: '#F6643B' }}
//       >
//         {navItems.map((item) => (
//           <button
//             key={item.id}
//             onClick={() => {
//               setActiveSection(item.id);
//               setIsChatOpen(false);
//             }}
//             className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
//               activeSection === item.id ? 'bg-[#2E3A59] text-[#F6643B]' : 'text-[#A3ACBF] hover:bg-[#28324F]'
//             }`}
//           >
//             {item.icon}
//             <span className="text-xs font-medium">{item.label}</span>
//           </button>
//         ))}
//       </nav>

//       {/* Main Layout */}
//       <div className="flex pt-14 sm:pt-16">
//         {/* Sidebar (Desktop) */}
//         <aside
//           className="hidden sm:block fixed top-16 h-[calc(100vh-4rem)] w-64 bg-[#1F2A44] shadow border-r z-20"
//           style={{ borderColor: '#F6643B' }}
//         >
//           <nav className="space-y-2 p-3 sm:pt-4">
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => setActiveSection(item.id)}
//                 className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 group ${
//                   activeSection === item.id
//                     ? 'bg-[#2E3A59] text-[#F6643B]'
//                     : 'text-[#A3ACBF] hover:bg-[#28324F]'
//                 }`}
//                 aria-label={`Navigate to ${item.label}`}
//               >
//                 <span
//                   className={`mr-3 icon ${activeSection === item.id ? 'icon-active' : 'icon-inactive'}`}
//                 >
//                   {item.icon}
//                 </span>
//                 <span className="text-sm sm:text-base font-medium">{item.label}</span>
//               </button>
//             ))}
//           </nav>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 ml-0 sm:ml-64 p-2 sm:p-4 md:mr-80 pt-12 sm:pt-0 bg-[#121212] text-[#E0E6ED]">
//           {renderContent()}
//         </main>

//         {/* Chat Sidebar (Desktop) */}
//         <aside
//           className="hidden md:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 bg-[#1C2526] shadow border-l p-4 transition-all duration-300"
//           style={{ borderColor: '#F6643B' }}
//         >
//           <Chat />
//         </aside>

//         {/* Chat Panel (Mobile) */}
//         {isChatOpen && (
//           <div
//             className="sm:hidden fixed inset-0 bg-[#1C2526] z-30 transform transition-transform duration-300"
//             style={{ borderColor: '#F6643B' }}
//           >
//             <Chat onClose={() => setIsChatOpen(false)} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LandingPage;