
import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios"
import AdmirersPage from '../letMeet/AdmirersPage';
import ChatPage from '../letMeet/ChatPage';
import ProfilePage from "../letMeet/ProfilePage"
import HomePage from '../letMeet/HomePage.jsx';
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
  const [selectedImage, setSelectedImage] = useState(''); 
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
  const [activePage, setActivePage] = useState('home'); 

  const [admirersData, setAdmirersData] = useState({ pending: [], sent: [], accepted: [] });
  const [chatData, setChatData] = useState({ chatList: [], compliments: [], viewers: [] });
  const [userProfile, setUserProfile] = useState(null);

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
            const oppositeGender = userProfileData.user.gender === 'Male' ? 'Female' : userProfileData.user?.gender === 'Female' ? 'Male' : '';
            const filteredUsers = usersData.data.filter(user => user.userId?.gender === oppositeGender);
            setUsers(filteredUsers || []);
            console.log('Filtered users:', filteredUsers);
          } else {
            toast.error(usersData.message || 'Failed to fetch users');
            setUsers([]);
          }
       
            // Fetch data for Admirers page
          const [pendingResponse, sentResponse, acceptedResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getmyadmirers`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getotheradmirer`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getaccepted`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setAdmirersData({
            pending: pendingResponse.data.data?.admirers || [],
            sent: sentResponse.data.data?.admirers || [],
            accepted: acceptedResponse.data.data?.accepted || [],
          });

        
        } else {
          console.log('No Let\'s Meet profile, opening modal');
          setHasLetsMeet(false);
          setIsModalOpen(true);
          toast.error(profileData.message || 'Please create your Let\'s Meet profile');
        }
      } catch (error) {
        console.error('Fetch error:', error.message);
        console.log('Fetch failed, opening modal', error);
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


  useEffect(()=> {
    const fetchOtherMeetData = async() => {
      try {
          //fetch data for chat page 
               const [chatListResponse, complimentsResponse, viewersResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getchatlist`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getcompliments`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getviewers`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setChatData({
            chatList: chatListResponse.data.data?.chatList || [],
            compliments: complimentsResponse.data.data?.compliments || [],
            viewers: viewersResponse.data.data?.viewers || [],
          });
      } catch (error) {
        console.log(error)
      }
    }
    fetchOtherMeetData()
  }, [])

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
        const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/invite`,
        { recipientId: user.userId._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        toast.success('Invitation sent successfully!');
        handleXButton();
      } else {
        toast.error(response.data.message);
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
           if (usersResponse.status === 200 || usersResponse.status === 304 && usersData.status) {
            // Use fetched gender directly to avoid timing issue
            const oppositeGender = userProfileData.user.gender === 'Male' ? 'Female' : userProfileData.user?.gender === 'Female' ? 'Male' : '';
            const filteredUsers = usersData.data.filter(user => user.userId?.gender === oppositeGender);
            setUsers(filteredUsers || []);
            console.log('Filtered users:', filteredUsers);
          } else {
            toast.error(usersData.message || 'Failed to fetch users');
            setUsers([]);
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
    const handleRespondInvitation = async (senderProfileId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/respond`,
        { senderProfileId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        toast.success(`Invitation ${action}ed successfully!`);
        // Refresh admirers data
        const pendingResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getmyadmirers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const acceptedResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getaccepted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmirersData({
          ...admirersData,
          pending: pendingResponse.data.data?.admirers || [],
          accepted: acceptedResponse.data.data?.accepted || [],
        });
        // Refresh chat list if accepted
        if (action === 'accept') {
          const chatListResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getchatlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setChatData({ ...chatData, chatList: chatListResponse.data.data?.chatList || [] });
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Respond invitation error:', error);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  const handleSendCompliment = async (recipientId, message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/sendcompliment`,
        { recipientId, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        toast.success('Compliment sent successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Send compliment error:', error);
      toast.error('Failed to send compliment');
    }
  };

  const handleUnmatch = async (matchedUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/unmatch`,
        { matchedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        toast.success('Unmatched successfully!');
        // Refresh accepted invitations and chat list
        const acceptedResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getaccepted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatListResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/letsmeet/getchatlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmirersData({ ...admirersData, accepted: acceptedResponse.data.data?.accepted || [] });
        setChatData({ ...chatData, chatList: chatListResponse.data.data?.chatList || [] });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Unmatch error:', error);
      toast.error('Failed to unmatch');
    }
  };




  const renderContent = () => {
    if (!hasLetsMeet) {
      return (
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
      );
    }
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            users={users}
            currentUserIndex={currentUserIndex}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            userGender={userGender}
            isLoading={isLoading}
            handleXButton={handleXButton}
            handleMarkButton={handleMarkButton}
            handleImageClick={handleImageClick}
            isImageModalOpen={isImageModalOpen}
            selectedImage={selectedImage}
            setIsImageModalOpen={setIsImageModalOpen}
          />
        );
      case 'admirers':
        return (
          <AdmirersPage
            admirersData={admirersData}
            handleRespondInvitation={handleRespondInvitation}
            handleUnmatch={handleUnmatch}
          />
        );
      case 'chat':
        return (
          <ChatPage
            chatData={chatData}
            userProfile={userProfile}
            handleSendCompliment={handleSendCompliment}
          />
        );
      case 'profile':
        return <ProfilePage userProfile={userProfile} formData={formData} />;
      default:
        return <div>Page not found</div>;
    }
  };


  // const renderUserCard = () => {
  //   if (isLoading) {
  //     return <div className="text-gray-700 text-center">Loading...</div>;
  //   }
  //   if (!userGender) {
  //     return <div className="text-gray-700 text-center">Please ensure your profile has a gender</div>;
  //   }
  //   if (users.length === 0 || currentUserIndex >= users.length) {
  //     return <div className="text-gray-700 text-center">No user found</div>;
  //   }
  //   const user = users[currentUserIndex];
  //   if (!user?.userId) {
  //     return <div className="text-gray-700 text-center">No user found</div>;
  //   }



  return (
    // <ErrorBoundary>
    //   <div className="min-h-screen bg-gray-100 py-10">
    //     <ToastContainer position="top-right" autoClose={3000} />
    //     {isLoading ? (
    //       <div className="text-gray-700 text-center">Loading...</div>
    //     ) : hasLetsMeet ? (
    //       <div ref={scrollRef}>{renderUserCard()}</div>
    //     ) : (
    //       <div className="flex justify-center items-center min-h-screen">
    //         {isModalOpen && (
    //           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    //             <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
    //               <div className="flex justify-between items-center mb-6">
    //                 <h2 className="text-2xl font-bold text-gray-900">Create Let's Meet Profile</h2>
    //                 <button
    //                   onClick={() => setIsModalOpen(false)}
    //                   className="text-gray-600 hover:text-gray-900"
    //                 >
    //                   Close
    //                 </button>
    //               </div>
    //               <form onSubmit={handleFormSubmit}>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Height</label>
    //                   <select
    //                     value={formData.height}
    //                     onChange={(e) => setFormData({ ...formData, height: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Height</option>
    //                     {heightOptions.map((height) => (
    //                       <option key={height} value={height}>{height}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Faith</label>
    //                   <select
    //                     value={formData.faith}
    //                     onChange={(e) => setFormData({ ...formData, faith: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Faith</option>
    //                     {faithOptions.map((faith) => (
    //                       <option key={faith} value={faith}>{faith}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Smoke</label>
    //                   <select
    //                     value={formData.smoke}
    //                     onChange={(e) => setFormData({ ...formData, smoke: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Option</option>
    //                     {smokeDrinkOptions.map((option) => (
    //                       <option key={option} value={option}>{option}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Drink</label>
    //                   <select
    //                     value={formData.drink}
    //                     onChange={(e) => setFormData({ ...formData, drink: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Option</option>
    //                     {smokeDrinkOptions.map((option) => (
    //                       <option key={option} value={option}>{option}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Personality</label>
    //                   <select
    //                     value={formData.personality}
    //                     onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Personality</option>
    //                     {personalityOptions.map((personality) => (
    //                       <option key={personality} value={personality}>{personality}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Education</label>
    //                   <select
    //                     value={formData.education}
    //                     onChange={(e) => setFormData({ ...formData, education: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Education</option>
    //                     {educationOptions.map((education) => (
    //                       <option key={education} value={education}>{education}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Career</label>
    //                   <select
    //                     value={formData.career}
    //                     onChange={(e) => setFormData({ ...formData, career: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Career</option>
    //                     {careerOptions.map((career) => (
    //                       <option key={career} value={career}>{career}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Ethnicity</label>
    //                   <select
    //                     value={formData.ethnicity}
    //                     onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
    //                     className="w-full p-2 border rounded"
    //                     required
    //                   >
    //                     <option value="">Select Ethnicity</option>
    //                     {ethnicityOptions.map((ethnicity) => (
    //                       <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
    //                     ))}
    //                   </select>
    //                 </div>
    //                 <div className="mb-4">
    //                   <label className="block text-gray-700">Pictures (3-5 required)</label>
    //                   <input
    //                     type="file"
    //                     accept="image/*"
    //                     multiple
    //                     onChange={handleImageUpload}
    //                     className="w-full p-2 border rounded"
    //                   />
    //                   <div className="flex flex-wrap gap-2 mt-2">
    //                     {formData.pictures.map((pic, index) => (
    //                       <img key={index} src={pic} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
    //                     ))}
    //                   </div>
    //                 </div>
    //                 <button
    //                   type="submit"
    //                   className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
    //                 >
    //                   Create Profile
    //                 </button>
    //               </form>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     )}
    //   </div>
    // </ErrorBoundary>

          <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-10 relative">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-4xl mx-auto">{renderContent()}</div>
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-4">
          <button
            onClick={() => setActivePage('home')}
            className={`flex flex-col items-center ${activePage === 'home' ? 'text-orange-500' : 'text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 01-6-6 6 6 0 016-6 6 6 0 016 6 6 6 0 01-6 6z" />
            </svg>
            <span>Home</span>
          </button>
          <button
            onClick={() => setActivePage('admirers')}
            className={`flex flex-col items-center ${activePage === 'admirers' ? 'text-orange-500' : 'text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-9a9 9 0 100 18 9 9 0 000-18z" clipRule="evenodd" />
            </svg>
            <span>Admirers</span>
          </button>
          <button
            onClick={() => setActivePage('chat')}
            className={`flex flex-col items-center ${activePage === 'chat' ? 'text-orange-500' : 'text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-2.263-.292L3.5 18.5l1.792-4.837A8.841 8.841 0 013 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
            </svg>
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActivePage('profile')}
            className={`flex flex-col items-center ${activePage === 'profile' ? 'text-orange-500' : 'text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LetsMeet;























































































