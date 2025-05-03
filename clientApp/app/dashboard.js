// import { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
// import { useTailwind } from 'tailwind-rn';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// import { getProfile, updateProfile } from '../utils/api';

// export default function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [fullname, setFullname] = useState('');
//   const [age, setAge] = useState('');
//   const [occupation, setOccupation] = useState('');
//   const [stateOfOrigin, setStateOfOrigin] = useState('');
//   const [currentLocation, setCurrentLocation] = useState('');
//   const [picture, setPicture] = useState('');
//   const tailwind = useTailwind();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const response = await getProfile(token);
//         setUser(response.data);
//         setFullname(response.data.fullname || '');
//         setAge(response.data.age ? String(response.data.age) : '');
//         setOccupation(response.data.occupation || '');
//         setStateOfOrigin(response.data.stateOfOrigin || '');
//         setCurrentLocation(response.data.currentLocation || '');
//         setPicture(response.data.picture || '');
//       } catch (error) {
//         Alert.alert('Error', 'Failed to load profile');
//       }
//     };
//     fetchProfile();
//   }, []);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const formData = new FormData();
//       formData.append('file', {
//         uri: result.assets[0].uri,
//         type: 'image/jpeg',
//         name: 'profile.jpg',
//       });
//       formData.append('upload_preset', 'your_upload_preset'); // Replace with your Cloudinary upload preset

//       try {
//         const response = await axios.post(
//           'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', // Replace with your Cloudinary cloud name
//           formData
//         );
//         setPicture(response.data.secure_url);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to upload image');
//       }
//     }
//   };

//   const handleUpdate = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const updates = {
//         fullname,
//         age: parseInt(age) || 0,
//         occupation,
//         stateOfOrigin,
//         currentLocation,
//         picture,
//       };
//       await updateProfile(token, updates);
//       Alert.alert('Success', 'Profile updated');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update profile');
//     }
//   };

//   if (!user) {
//     return <Text>Loading...</Text>;
//   }

//   return (
//     <View style={tailwind('flex-1 p-4')}>
//       <Text style={tailwind('text-2xl font-bold mb-4')}>Your Profile</Text>
//       {picture ? (
//         <Image
//           source={{ uri: picture }}
//           style={tailwind('w-32 h-32 rounded-full mb-4')}
//         />
//       ) : null}
//       <TouchableOpacity
//         style={tailwind('bg-gray-200 p-2 rounded mb-4')}
//         onPress={pickImage}
//       >
//         <Text style={tailwind('text-center')}>Upload Picture</Text>
//       </TouchableOpacity>
//       <TextInput
//         style={tailwind('border border-gray-300 p-2 mb-4 rounded')}
//         placeholder="Full Name"
//         value={fullname}
//         onChangeText={setFullname}
//       />
//       <TextInput
//         style={tailwind('border border-gray-300 p-2 mb-4 rounded')}
//         placeholder="Age"
//         value={age}
//         onChangeText={setAge}
//         keyboardType="numeric"
//       />
//       <TextInput
//         style={tailwind('border border-gray-300 p-2 mb-4 rounded')}
//         placeholder="Occupation"
//         value={occupation}
//         onChangeText={setOccupation}
//       />
//       <TextInput
//         style={tailwind('border border-gray-300 p-2 mb-4 rounded')}
//         placeholder="State of Origin"
//         value={stateOfOrigin}
//         onChangeText={setStateOfOrigin}
//       />
//       <TextInput
//         style={tailwind('border border-gray-300 p-2 mb-4 rounded')}
//         placeholder="Current Location"
//         value={currentLocation}
//         onChangeText={setCurrentLocation}
//       />
//       <TouchableOpacity
//         style={tailwind('bg-blue-500 p-3 rounded')}
//         onPress={handleUpdate}
//       >
//         <Text style={tailwind('text-white text-center')}>Update Profile</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }