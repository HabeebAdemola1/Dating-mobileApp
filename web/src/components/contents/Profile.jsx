import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import { FiUser, FiCamera, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Cloudinary } from '@cloudinary/url-gen';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [datingData, setDatingData] = useState(null);
  const [hasDatingProfile, setHasDatingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [datingPics, setDatingPics] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser, formState: { errors: userErrors } } = useForm();
  const { register: registerDating, handleSubmit: handleDatingSubmit, reset: resetDating, formState: { errors: datingErrors } } = useForm();

  // Cloudinary configuration
  const cld = new Cloudinary({ cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME } });

  // Fetch user and dating profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view profile', {
            style: { background: '#F6643BFF', color: 'white' },
          });
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data.user);
        resetUser(response.data.user);
        console.log(response.data.user)
        if (response.data.user.picture) {
          setProfilePic(response.data.user.picture);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to fetch user data', {
          style: { background: '#F6643BFF', color: 'white' },
        });
      }
    };

    const fetchDatingData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dating/getdating`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.exists) {
          setDatingData(response.data.data);
          setHasDatingProfile(true);
          resetDating({
            genotype: response.data.data.genotype,
            religion: response.data.data.religion,
            bio: response.data.data.bio,
            bloodGroup: response.data.data.bloodGroup,
          });
          setDatingPics(response.data.data.pictures || []);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(error.response?.data?.message || 'Failed to fetch dating profile', {
            style: { background: '#F6643BFF', color: 'white' },
          });
        }
      }
    };

    fetchUserData();
    fetchDatingData();
  }, [resetUser, resetDating]);

  // Handle profile picture upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle dating pictures upload
  const handleDatingPicsUpload = (e) => {
    const files = Array.from(e.target.files);
    if (datingPics.length + files.length > 15) {
      toast.error('Maximum 15 pictures allowed', {
        style: { background: '#F6643BFF', color: 'white' },
      });
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDatingPics((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove dating picture
  const removeDatingPic = (index) => {
    setDatingPics((prev) => prev.filter((_, i) => i !== index));
  };

  // Update user profile
  const onUserSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updates = { ...data, picture: profilePic };
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.profile);
      toast.success('Profile updated successfully', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update dating profile
  const onDatingSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...data, pictures: datingPics };
      const url = hasDatingProfile
        ? `${import.meta.env.VITE_BACKEND_URL}/api/dating/updatedating`
        : `${import.meta.env.VITE_BACKEND_URL}/api/dating/createdating`;
      const method = hasDatingProfile ? axios.put : axios.post;
      const response = await method(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDatingData(response.data.data);
      setHasDatingProfile(true);
      toast.success(hasDatingProfile ? 'Dating profile updated!' : 'Dating profile created!', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save dating profile', {
        style: { background: '#F6643BFF', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* User Profile Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: '#F6643BFF' }}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">User Profile</h2>
            {userData ? (
              <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...registerUser('email', { required: 'Email is required' })}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#F6643BFF' }}
                  />
                  {userErrors.email && <p className="text-red-500 text-xs">{userErrors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    {...registerUser('phoneNumber', { required: 'Phone number is required' })}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                  {userErrors.phoneNumber && <p className="text-red-500 text-xs">{userErrors.phoneNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    {...registerUser('fullname')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    {...registerUser('age')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#F6643BFF' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    {...registerUser('occupation')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    {...registerUser('gender')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <select
                    {...registerUser('maritalStatus')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#F6643BFF' }}
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest 1</label>
                  <input
                    type="text"
                    {...registerUser('interest1')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest 2</label>
                  <input
                    type="text"
                    {...registerUser('interest2')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <input
                    type="text"
                    {...registerUser('nationality')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State of Origin</label>
                  <input
                    type="text"
                    {...registerUser('stateOfOrigin')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Location</label>
                  <input
                    type="text"
                    {...registerUser('currentLocation')}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    {profilePic && (
                      <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <label className="cursor-pointer bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 flex items-center">
                      <FiCamera className="mr-2" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </motion.button>
              </form>
            ) : (
              <p className="text-center text-gray-600">Loading user data...</p>
            )}
          </div>

          {/* Dating Profile Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: '#F6643BFF' }}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Dating Profile</h2>
            <form onSubmit={handleDatingSubmit(onDatingSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Genotype</label>
                <select
                  {...registerDating('genotype', { required: 'Genotype is required' })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  
                >
                  <option value="">Select Genotype</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="SS">SS</option>
                  <option value="AC">AC</option>
                </select>
                {datingErrors.genotype && <p className="text-red-500 text-xs">{datingErrors.genotype.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Religion</label>
                <select
                  {...registerDating('religion', { required: 'Religion is required' })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  
                >
                  <option value="">Select Religion</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Islam">Islam</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Other">Other</option>
                </select>
                {datingErrors.religion && <p className="text-red-500 text-xs">{datingErrors.religion.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  {...registerDating('bio')}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  {...registerDating('bloodGroup', { required: 'Blood group is required' })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {datingErrors.bloodGroup && <p className="text-red-500 text-xs">{datingErrors.bloodGroup.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pictures (Max 15)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {datingPics.map((pic, index) => (
                    <div key={index} className="relative">
                      <img src={pic} alt={`Dating ${index}`} className="w-16 h-16 object-cover rounded" />
                      <button
                        onClick={() => removeDatingPic(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 flex items-center">
                  <FiCamera className="mr-2" />
                  Upload Pictures
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDatingPicsUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : hasDatingProfile ? 'Update Dating Profile' : 'Create Dating Profile'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;