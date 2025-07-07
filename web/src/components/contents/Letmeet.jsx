
// import React, { useState, useEffect, useRef } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };
//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }
//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="text-red-500 p-4">
//           <h2>Something went wrong.</h2>
//           <p>{this.state.error?.message}</p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const LetsMeet = () => {
//   const [users, setUsers] = useState([]);
//   const [currentUserIndex, setCurrentUserIndex] = useState(0);
//   const [hasLetsMeet, setHasLetsMeet] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [userGender, setUserGender] = useState('')
//   const [isImageModalOpen, setisImageModalOpen] = useState(false)
//   const [formData, setFormData] = useState({
//     height: '', faith: '', smoke: '', drink: '', personality: '', education: '', career: '', ethnicity: '', pictures: [],    gender: '',
//   });
//   const scrollRef = useRef(null);
//   const lastScrollY = useRef(0);

//   // Sample dropdown options
//   const heightOptions = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '7\'0"'];
//   const faithOptions = ['Actively Practising', 'Occasionally Practising', 'Strictly Practising', 'Not Practising'];
//   const smokeDrinkOptions = ['Yes', 'No'];
//   const personalityOptions = ['Adventurous', 'Ambitious', 'Calm', 'Creative', 'Extroverted', 'Introverted', 'Optimistic', 'Witty'];
//   const educationOptions = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Doctorate'];
//   const careerOptions = ['Doctor', 'Engineer', 'Teacher', 'Lawyer', 'Entrepreneur', 'Artist', 'Accountant', 'IT Professional'];
//   const ethnicityOptions = ['Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Edo', 'Ibibio', 'Tiv', 'Kanuri'];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const token = localStorage.getItem('token');
//         console.log('Token:', token); // Debug log
//         console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL); // Debug log
//         if (!token) {
//           console.log('No token found, opening modal');
//           toast.error('Please log in to continue');
//           setHasLetsMeet(false);
//           setIsModalOpen(true);
//           setIsLoading(false);
//           return;
//         }

//         const userProfileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
//           method:'GET',
//           headers: {Authorization: `Bearer ${token}`}
//         })

//         const userProfileData = await userProfileResponse.json()
//         console.log('user data', userProfileData)

//             if (userProfileResponse.status === 200 && userProfileData.status) {
//           setUserGender(userProfileData.data?.gender || '');
//         } else {
//           console.log('Failed to fetch user gender, opening modal');
//           toast.error('Failed to fetch user profile');
//           setHasLetsMeet(false);
//           setIsModalOpen(true);
//           setIsLoading(false);
//           return;
//         }

//         // Check if user has a Let's Meet profile
//         const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/check-profile`, {
//           method: 'GET',
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const profileData = await profileResponse.json();
//         console.log('Check profile response:', { status: profileResponse.status, data: profileData }); // Debug log

//         if (profileResponse.status === 200 && profileData.status && profileData.hasProfile) {
//           console.log('User has Let\'s Meet profile, fetching users');
//           setHasLetsMeet(true);
//           setIsModalOpen(false);

//           // Fetch other users' profiles
//           const usersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getletsmeet`, {
//             method: 'GET',
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           const usersData = await usersResponse.json();
//           console.log('Get letsmeet response:', { status: usersResponse.status, data: usersData }); // Debug log

//           if (usersResponse.status === 200 && usersData.status) {
//             const oppositeGender = userGender === 'Male' ? 'Female' : userGender === 'Female' ? 'Male'  : '';
//             const filteredUsers =  usersData.data.filter(user => user.userId?.gender === oppositeGender)
//             setUsers(filteredUsers || []);
//             console.log('Filtered users:', filteredUsers);
//           } else {
//             toast.error(usersData.message || 'Failed to fetch users');
//             setUsers([]);
//           }
//         } else {
//           console.log('No Let\'s Meet profile, opening modal');
//           setHasLetsMeet(false);
//           setIsModalOpen(true);
//           toast.error(profileData.message || 'Please create your Let\'s Meet profile');
//         }
//       } catch (error) {
//         console.error('Fetch error:', error.message); // Debug log
//         console.log('Fetch failed, opening modal');
//         toast.error('Failed to fetch data: ' + error.message);
//         setHasLetsMeet(false);
//         setIsModalOpen(true);
//       } finally {
//         setIsLoading(false);
//         console.log('State after fetch:', { hasLetsMeet, isModalOpen, isLoading }); // Debug log
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;
//       if (currentScrollY < lastScrollY.current && currentScrollY < 100) {
//         setShowDetails(true);
//       }
//       lastScrollY.current = currentScrollY;
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleXButton = () => {
//     if (currentUserIndex < users.length - 1) {
//       setCurrentUserIndex(currentUserIndex + 1);
//       setShowDetails(false);
//     } else {
//       toast.info('No user found');
//     }
//   };

//   const handleMarkButton = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const user = users[currentUserIndex];
//       if (!user?.userId?._id) {
//         toast.error('Invalid user data');
//         return;
//       }
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendrequest`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ recipientId: user.userId._id }),
//       });
//       const data = await response.json();
//       console.log('Send request response:', data); // Debug log
//       if (data.status) {
//         toast.success('Request sent successfully!');
//         handleXButton();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error('Mark button error:', error);
//       toast.error('Failed to send request');
//     }
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (formData.pictures.length + files.length > 5) {
//       toast.error('Maximum of 5 pictures allowed');
//       return;
//     }
//     const newPictures = files.map((file) => {
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(file);
//       });
//     });
//     Promise.all(newPictures).then((base64Images) => {
//       setFormData({ ...formData, pictures: [...formData.pictures, ...base64Images] });
//     });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.pictures.length < 3) {
//       toast.error('At least 3 pictures are required');
//       return;
//     }
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         toast.error('Please log in to continue');
//         return;
//       }
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/createletsmeet`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });
//       const data = await response.json();
//       console.log('Create profile response:', data); // Debug log
//       if (data.status) {
//         setHasLetsMeet(true);
//         setIsModalOpen(false);
//         setUserGender(formData.gender)
//         toast.success('Profile created successfully!');
//         // Fetch other users' profiles
//         const usersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getletsmeet`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const usersData = await usersResponse.json();
//         console.log('Refetch users response:', usersData); // Debug log
//         if (usersData.status) {
//           setUsers(usersData.data || []);
//           console.log(usersData, "your let meet data!!!!")
//         } else {
//           toast.error(usersData.message);
//         }
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error('Form submit error:', error);
//       toast.error('Failed to create profile');
//     }
//   };

//   const renderUserCard = () => {
//     if (isLoading) {
//       return <div className="text-gray-700 text-center">Loading...</div>;
//     }
//     if (users.length === 0 || currentUserIndex >= users.length) {
//       return <div className="text-gray-700 text-center">No user found</div>;
//     }
//     const user = users[currentUserIndex];
//     if (!user?.userId) {
//       return <div className="text-gray-700 text-center">No user found</div>;
//     }
//     return (
//       <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
//         <img
//           src={user.pictures[0] || 'https://via.placeholder.com/400'}
//           alt="User"
//           className="w-full h-96 object-cover"
//         />
//         <div className="p-6">
//           <h2 className="text-2xl font-bold text-gray-900">
//             {user?.userId?.fullname|| 'Unknown'}, {user.userId.age || 'N/A'}
//           </h2>
//           <p className="text-gray-600">Nationality: {user.userId.nationality || 'N/A'}</p>
//           <p className="text-gray-600">Religion: {user.datingId?.religion || 'not disclosed'}</p>
//           <p className="text-gray-600">genotype: {user.datingId?.genotype || 'not disclosed'}</p>
        
        
//           <p className="text-gray-600">Faith: {user.faith || 'N/A'}</p>
//           <p className="text-gray-600">Career: {user.career || 'N/A'}</p>
// {showDetails && (
//   <div className="mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg overflow-hidden">
//     {/* Left Column: Images */}
//     <div className="flex flex-wrap space-y-4 space-x-19 mb-4">
//       <img
//         src={user.pictures[1] || 'https://via.placeholder.com/100'}
//         alt="User Secondary"
//         className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
//         onClick={() => handleImageClick(user.pictures[1] || 'https://via.placeholder.com/100')}
//       />
//       {user.pictures[2] && (
//         <img
//           src={user.pictures[2] || 'https://via.placeholder.com/100'}
//           alt="User Tertiary"
//           className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
//           onClick={() => handleImageClick(user.pictures[2] || 'https://via.placeholder.com/100')}
//         />
//       )}
//     </div>
//     {/* Right Column: Details */}
//     <div className="flex flex-wrap items-center justify-between gap-6">
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">📏</span> Height: <span className="font-medium text-gray-600 ml-1">{user.height || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🚬</span> Smoke: <span className="font-medium text-gray-600 ml-1">{user.smoke || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">♂️</span> Gender: <span className="font-medium text-gray-600 ml-1">{user.userId?.gender || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">💍</span> Marital Status: <span className="font-medium text-gray-600 ml-1">{user.userId?.maritalStatus || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🎨</span> Interests: <span className="font-medium text-gray-600 ml-1">{user.userId?.interest1 || 'N/A'}, {user.userId?.interest2 || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🏡</span> State of Origin: <span className="font-medium text-gray-600 ml-1">{user.userId?.stateOfOrigin || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">📍</span> Current Location: <span className="font-medium text-gray-600 ml-1">{user.userId?.currentLocation || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🍺</span> Alcohol: <span className="font-medium text-gray-600 ml-1">{user.drink || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">😄</span> Personality: <span className="font-medium text-gray-600 ml-1">{user.personality || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🎓</span> Education: <span className="font-medium text-gray-600 ml-1">{user.education || 'N/A'}</span>
//       </p>
//       <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
//         <span className="mr-3 text-xl">🌍</span> Ethnicity: <span className="font-medium text-gray-600 ml-1">{user.ethnicity || 'N/A'}</span>
//       </p>
//     </div>
//     {/* Image Modal */}
//     {isImageModalOpen && (
//       <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
//         <img
//           src={selectedImage}
//           alt="Enlarged User"
//           className="max-w-3xl max-h-3xl object-contain"
//           onClick={(e) => e.stopPropagation()} // Prevent closing on image click
//         />
//       </div>
//     )}
//   </div>
// )}
//           <div className="mt-6 flex justify-between">
//             <button
//               onClick={handleXButton}
//               className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
//             >
//               X
//             </button>
//             <button
//               onClick={handleMarkButton}
//               className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
//             >
//               ✓
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <ErrorBoundary>
//       <div className="min-h-screen bg-gray-100 py-10">
//         <ToastContainer position="top-right" autoClose={3000} />
//         {isLoading ? (
//           <div className="text-gray-700 text-center">Loading...</div>
//         ) : hasLetsMeet ? (
//           <div ref={scrollRef}>{renderUserCard()}</div>
//         ) : (
//           <div className="flex justify-center items-center min-h-screen">
//             {isModalOpen && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//                 <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
//                   <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold text-gray-900">Create Let's Meet Profile</h2>
//                     <button
//                       onClick={() => setIsModalOpen(false)}
//                       className="text-gray-600 hover:text-gray-900"
//                     >
//                       Close
//                     </button>
//                   </div>
//                   <form onSubmit={handleFormSubmit}>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Height</label>
//                       <select
//                         value={formData.height}
//                         onChange={(e) => setFormData({ ...formData, height: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Height</option>
//                         {heightOptions.map((height) => (
//                           <option key={height} value={height}>{height}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Faith</label>
//                       <select
//                         value={formData.faith}
//                         onChange={(e) => setFormData({ ...formData, faith: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Faith</option>
//                         {faithOptions.map((faith) => (
//                           <option key={faith} value={faith}>{faith}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Smoke</label>
//                       <select
//                         value={formData.smoke}
//                         onChange={(e) => setFormData({ ...formData, smoke: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Option</option>
//                         {smokeDrinkOptions.map((option) => (
//                           <option key={option} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Drink</label>
//                       <select
//                         value={formData.drink}
//                         onChange={(e) => setFormData({ ...formData, drink: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Option</option>
//                         {smokeDrinkOptions.map((option) => (
//                           <option key={option} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Personality</label>
//                       <select
//                         value={formData.personality}
//                         onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Personality</option>
//                         {personalityOptions.map((personality) => (
//                           <option key={personality} value={personality}>{personality}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Education</label>
//                       <select
//                         value={formData.education}
//                         onChange={(e) => setFormData({ ...formData, education: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Education</option>
//                         {educationOptions.map((education) => (
//                           <option key={education} value={education}>{education}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Career</label>
//                       <select
//                         value={formData.career}
//                         onChange={(e) => setFormData({ ...formData, career: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Career</option>
//                         {careerOptions.map((career) => (
//                           <option key={career} value={career}>{career}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Ethnicity</label>
//                       <select
//                         value={formData.ethnicity}
//                         onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         required
//                       >
//                         <option value="">Select Ethnicity</option>
//                         {ethnicityOptions.map((ethnicity) => (
//                           <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mb-4">
//                       <label className="block text-gray-700">Pictures (3-5 required)</label>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         onChange={handleImageUpload}
//                         className="w-full p-2 border rounded"
//                       />
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {formData.pictures.map((pic, index) => (
//                           <img key={index} src={pic} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
//                         ))}
//                       </div>
//                     </div>
//                     <button
//                       type="submit"
//                       className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
//                     >
//                       Create Profile
//                     </button>
//                   </form>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default LetsMeet;






































































































































import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const LetsMeet = () => {
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [hasLetsMeet, setHasLetsMeet] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userGender, setUserGender] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Fixed typo
  const [selectedImage, setSelectedImage] = useState(''); // Added for image modal
  const [formData, setFormData] = useState({
    height: '',
    faith: '',
    smoke: '',
    drink: '',
    personality: '',
    education: '',
    career: '',
    ethnicity: '',
    pictures: [],
  });
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);

  // Sample dropdown options
  const heightOptions = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '7\'0"'];
  const faithOptions = ['Actively Practising', 'Occasionally Practising', 'Strictly Practising', 'Not Practising'];
  const smokeDrinkOptions = ['Yes', 'No'];
  const personalityOptions = ['Adventurous', 'Ambitious', 'Calm', 'Creative', 'Extroverted', 'Introverted', 'Optimistic', 'Witty'];
  const educationOptions = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Doctorate'];
  const careerOptions = ['Doctor', 'Engineer', 'Teacher', 'Lawyer', 'Entrepreneur', 'Artist', 'Accountant', 'IT Professional'];
  const ethnicityOptions = ['Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Edo', 'Ibibio', 'Tiv', 'Kanuri'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
        if (!token) {
          console.log('No token found, opening modal');
          toast.error('Please log in to continue');
          setHasLetsMeet(false);
          setIsModalOpen(true);
          setIsLoading(false);
          return;
        }

        const userProfileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfileData = await userProfileResponse.json();
        console.log('user data', userProfileData);

        if (userProfileResponse.status === 200 || userProfileResponse.status === 304 ) {
          setUserGender(userProfileData.user?.gender);
          console.log(userProfileData.user?.gender, "your gender")
        } else {
          console.log('Failed to fetch user gender, opening modal');
          toast.error('Failed to fetch user profile');
          setHasLetsMeet(false);
          setIsModalOpen(true);
          setIsLoading(false);
          return;
        }

        // Check if user has a Let's Meet profile
        const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/check-profile`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileResponse.json();
        console.log('Check profile response:', { status: profileResponse.status, data: profileData });

        if (profileResponse.status === 200 || profileResponse.status === 304 && profileData.status && profileData.hasProfile) {
          console.log('User has Let\'s Meet profile, fetching users');
          setHasLetsMeet(true);
          setIsModalOpen(false);

          // Fetch other users' profiles
          const usersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getletsmeet`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          const usersData = await usersResponse.json();
          console.log('Get letsmeet response:', { status: usersResponse.status, data: usersData });

          if (usersResponse.status === 200 || usersResponse.status === 304 && usersData.status) {
            // Use fetched gender directly to avoid timing issue
            const oppositeGender = userProfileData.user.gender === 'Male' ? 'Female' : userProfileData.user.gender === 'Female' ? 'Male' : '';
            const filteredUsers = usersData.data.filter(user => user.userId?.gender === oppositeGender);
            setUsers(filteredUsers || []);
            console.log('Filtered users:', filteredUsers);
          } else {
            toast.error(usersData.message || 'Failed to fetch users');
            setUsers([]);
          }
        } else {
          console.log('No Let\'s Meet profile, opening modal');
          setHasLetsMeet(false);
          setIsModalOpen(true);
          toast.error(profileData.message || 'Please create your Let\'s Meet profile');
        }
      } catch (error) {
        console.error('Fetch error:', error.message);
        console.log('Fetch failed, opening modal');
        toast.error('Failed to fetch data: ' + error.message);
        setHasLetsMeet(false);
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
        console.log('State after fetch:', { hasLetsMeet, isModalOpen, isLoading });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY.current && currentScrollY < 100) {
        setShowDetails(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleXButton = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setShowDetails(false);
    } else {
      toast.info('No user found');
    }
  };

  const handleMarkButton = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = users[currentUserIndex];
      if (!user?.userId?._id) {
        toast.error('Invalid user data');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId: user.userId._id }),
      });
      const data = await response.json();
      console.log('Send request response:', data);
      if (data.status) {
        toast.success('Request sent successfully!');
        handleXButton();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Mark button error:', error);
      toast.error('Failed to send request');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.pictures.length + files.length > 5) {
      toast.error('Maximum of 5 pictures allowed');
      return;
    }
    const newPictures = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(newPictures).then((base64Images) => {
      setFormData({ ...formData, pictures: [...formData.pictures, ...base64Images] });
    });
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.pictures.length < 3) {
      toast.error('At least 3 pictures are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to continue');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/createletsmeet`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Create profile response:', data);
      if (data.status) {
        setHasLetsMeet(true);
        setIsModalOpen(false);
        toast.success('Profile created successfully!');
        // Fetch other users' profiles
        const usersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getletsmeet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersResponse.json();
        console.log('Refetch users response:', usersData);
        if (usersData.status) {
          // Re-fetch user gender to ensure consistency
          const userProfileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          const userProfileData = await userProfileResponse.json();
          if (userProfileResponse.status === 200 && userProfileData.status && userProfileData.data?.gender) {
            setUserGender(userProfileData.data.gender);
            const oppositeGender = userProfileData.data.gender === 'Male' ? 'Female' : userProfileData.data.gender === 'Female' ? 'Male' : '';
            const filteredUsers = usersData.data.filter(user => user.userId?.gender === oppositeGender);
            setUsers(filteredUsers || []);
            console.log('Filtered users after profile creation:', filteredUsers);
          } else {
            toast.error('Failed to fetch user gender after profile creation');
          }
        } else {
          toast.error(usersData.message);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('Failed to create profile');
    }
  };

  const renderUserCard = () => {
    if (isLoading) {
      return <div className="text-gray-700 text-center">Loading...</div>;
    }
    if (!userGender) {
      return <div className="text-gray-700 text-center">Please ensure your profile has a gender</div>;
    }
    if (users.length === 0 || currentUserIndex >= users.length) {
      return <div className="text-gray-700 text-center">No user found</div>;
    }
    const user = users[currentUserIndex];
    if (!user?.userId) {
      return <div className="text-gray-700 text-center">No user found</div>;
    }
    return (
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={user.pictures[0] || 'https://via.placeholder.com/400'}
          alt="User"
          className="w-full h-96 object-cover"
        />
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.userId?.fullname || 'Unknown'}, {user.userId.age || 'N/A'}
          </h2>
          <p className="text-gray-600">Nationality: {user.userId.nationality || 'N/A'}</p>
          <p className="text-gray-600">Religion: {user.datingId?.religion || 'not disclosed'}</p>
          <p className="text-gray-600">genotype: {user.datingId?.genotype || 'not disclosed'}</p>
          <p className="text-gray-600">Faith: {user.faith || 'N/A'}</p>
          <p className="text-gray-600">Career: {user.career || 'N/A'}</p>
          {showDetails && (
            <div className="mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg overflow-hidden">
              <div className="flex flex-wrap space-y-4 space-x-19 mb-4">
                <img
                  src={user.pictures[1] || 'https://via.placeholder.com/100'}
                  alt="User Secondary"
                  className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                  onClick={() => handleImageClick(user.pictures[1] || 'https://via.placeholder.com/100')}
                />
                {user.pictures[2] && (
                  <img
                    src={user.pictures[2] || 'https://via.placeholder.com/100'}
                    alt="User Tertiary"
                    className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                    onClick={() => handleImageClick(user.pictures[2] || 'https://via.placeholder.com/100')}
                  />
                )}
                {user.pictures[3] && (
                  <img
                    src={user.pictures[3] || 'https://via.placeholder.com/100'}
                    alt="User Tertiary"
                    className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                    onClick={() => handleImageClick(user.pictures[3] || 'https://via.placeholder.com/100')}
                  />
                )}
                {user.pictures[4] && (
                  <img
                    src={user.pictures[4] || 'https://via.placeholder.com/100'}
                    alt="User Tertiary"
                    className="w-50 h-44 rounded-full object-cover border-4 border-indigo-200 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
                    onClick={() => handleImageClick(user.pictures[4] || 'https://via.placeholder.com/100')}
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">📏</span> Height: <span className="font-medium text-gray-600 ml-1">{user.height || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🚬</span> Smoke: <span className="font-medium text-gray-600 ml-1">{user.smoke || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">♂️</span> Gender: <span className="font-medium text-gray-600 ml-1">{user.userId?.gender || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">💍</span> Marital Status: <span className="font-medium text-gray-600 ml-1">{user.userId?.maritalStatus || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🎨</span> Interests: <span className="font-medium text-gray-600 ml-1">{user.userId?.interest1 || 'N/A'}, {user.userId?.interest2 || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🏡</span> State of Origin: <span className="font-medium text-gray-600 ml-1">{user.userId?.stateOfOrigin || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">📍</span> Current Location: <span className="font-medium text-gray-600 ml-1">{user.userId?.currentLocation || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🍺</span> Alcohol: <span className="font-medium text-gray-600 ml-1">{user.drink || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">😄</span> Personality: <span className="font-medium text-gray-600 ml-1">{user.personality || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🎓</span> Education: <span className="font-medium text-gray-600 ml-1">{user.education || 'N/A'}</span>
                </p>
                <p className="text-lg font-bold text-gray-800 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                  <span className="mr-3 text-xl">🌍</span> Ethnicity: <span className="font-medium text-gray-600 ml-1">{user.ethnicity || 'N/A'}</span>
                </p>
              </div>
              {isImageModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
                  <img
                    src={selectedImage}
                    alt="Enlarged User"
                    className="max-w-3xl max-h-3xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleXButton}
              className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
            >
              X
            </button>
            <button
              onClick={handleMarkButton}
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-10">
        <ToastContainer position="top-right" autoClose={3000} />
        {isLoading ? (
          <div className="text-gray-700 text-center">Loading...</div>
        ) : hasLetsMeet ? (
          <div ref={scrollRef}>{renderUserCard()}</div>
        ) : (
          <div className="flex justify-center items-center min-h-screen">
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Let's Meet Profile</h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Close
                    </button>
                  </div>
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700">Height</label>
                      <select
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Height</option>
                        {heightOptions.map((height) => (
                          <option key={height} value={height}>{height}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Faith</label>
                      <select
                        value={formData.faith}
                        onChange={(e) => setFormData({ ...formData, faith: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Faith</option>
                        {faithOptions.map((faith) => (
                          <option key={faith} value={faith}>{faith}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Smoke</label>
                      <select
                        value={formData.smoke}
                        onChange={(e) => setFormData({ ...formData, smoke: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Option</option>
                        {smokeDrinkOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Drink</label>
                      <select
                        value={formData.drink}
                        onChange={(e) => setFormData({ ...formData, drink: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Option</option>
                        {smokeDrinkOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Personality</label>
                      <select
                        value={formData.personality}
                        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Personality</option>
                        {personalityOptions.map((personality) => (
                          <option key={personality} value={personality}>{personality}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Education</label>
                      <select
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Education</option>
                        {educationOptions.map((education) => (
                          <option key={education} value={education}>{education}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Career</label>
                      <select
                        value={formData.career}
                        onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Career</option>
                        {careerOptions.map((career) => (
                          <option key={career} value={career}>{career}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Ethnicity</label>
                      <select
                        value={formData.ethnicity}
                        onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Ethnicity</option>
                        {ethnicityOptions.map((ethnicity) => (
                          <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Pictures (3-5 required)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.pictures.map((pic, index) => (
                          <img key={index} src={pic} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
                    >
                      Create Profile
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default LetsMeet;