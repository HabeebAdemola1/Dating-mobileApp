import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
  


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getProfile, updateProfile } from '../constants/api';
import { useRouter } from 'expo-router';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Home from './Home';
import Profile from './MyProfile';
import MainDashboard from "./MainDashboard"
import People from "./People"

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover'); // State for navigation
  const [isEditing, setIsEditing] = useState(false); // State to toggle between view and edit modes
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard.js: getProfile:', getProfile);
    console.log('Dashboard.js: updateProfile:', updateProfile);

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Dashboard.js: Token:', token || 'No token');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            text: 'Failed to log in to your dashboard',
          });
          router.push('/login');
          return;
        }
        const response = await getProfile(token);
        console.log('Dashboard.js: Profile response:', response.data);
        setUser(response.data);
        setFullname(response.data?.fullname || '');
        setAge(response.data?.age ? String(response.data.age) : '');
        setOccupation(response.data?.occupation || '');
        setStateOfOrigin(response.data?.stateOfOrigin || '');
        setCurrentLocation(response.data?.currentLocation || '');
        setPicture(response.data?.picture || '');
      } catch (error) {
        console.error('Dashboard.js: Fetch Profile Error:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);



  
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Permission Denied',
          text: 'Please grant permission to access the media library.',
        });
        return;
      }
  
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions as fallback
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const formData = new FormData();
  
        // Dynamically set the MIME type and file extension
        const mimeType = asset.mimeType || 'image/jpeg'; // Fallback to JPEG
        const fileExtension = mimeType.split('/')[1] || 'jpg';
  
        formData.append('file', {
          uri: asset.uri,
          type: mimeType,
          name: `profile.${fileExtension}`,
        });
        formData.append('upload_preset', 'essential');
  
        // Make the upload request to Cloudinary
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dc0poqt9l/image/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
        // Set the uploaded image URL
        setPicture(response.data.secure_url);
  
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          text: 'Image uploaded successfully',
        });
      }
    } catch (error) {
      // Log detailed error information
      console.error('Dashboard.js: Image Upload Error:', {
        message: error.message,
        response: error.response?.data,
        request: error.request,
      });
  
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: 'Failed to upload image. Please try again.',
      });
    }
  };

  const handleUpdate = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in to update your profile');
        router.push('/login');
        return;
      }

      const updates = {
        fullname,
        age: parseInt(age) || 0,
        occupation,
        stateOfOrigin,
        currentLocation,
        picture,
      };
      console.log('Dashboard.js: Sending updates:', updates);
      const response = await updateProfile(token, updates);
      console.log('Dashboard.js: Update response:', response.data);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Successfully updated',
        text: 'Profile updated successfully',
      });
      setIsEditing(false); // Exit edit mode after successful update
    } catch (error) {
      console.error('Dashboard.js: Update Error:', error.response?.data || error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if the profile is considered "updated"
  const isProfileUpdated = () => {
    return (
      fullname.trim() !== '' ||
      age.trim() !== '' ||
      occupation.trim() !== '' ||
      stateOfOrigin.trim() !== '' ||
      currentLocation.trim() !== '' ||
      picture.trim() !== ''
    );
  };

  // Render the profile form
  const renderProfileForm = () => (
    <>
      <Text style={styles.title}>Update Your Profile</Text>
      {picture ? (
        <Image source={{ uri: picture }} style={styles.profileImage} />
      ) : null}
      <TouchableOpacity
        style={[styles.uploadButton, loading && styles.disabledButton]}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={styles.uploadButtonText}>Upload Picture</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullname}
        onChangeText={setFullname}
        placeholderTextColor="#6b7280"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        placeholderTextColor="#6b7280"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Occupation"
        value={occupation}
        onChangeText={setOccupation}
        placeholderTextColor="#6b7280"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="State of Origin"
        value={stateOfOrigin}
        onChangeText={setStateOfOrigin}
        placeholderTextColor="#6b7280"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Location"
        value={currentLocation}
        onChangeText={setCurrentLocation}
        placeholderTextColor="#6b7280"
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.updateButtonText}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>
    </>
  );

  // Render the profile view
  const renderProfileView = () => (
    <>
      <Text style={styles.title}>Your Profile</Text>
      {picture ? (
        <Image source={{ uri: picture }} style={styles.profileImage} />
      ) : null}
      <Text style={styles.profileText}>Full Name: {fullname || 'Not set'}</Text>
      <Text style={styles.profileText}>Age: {age || 'Not set'}</Text>
      <Text style={styles.profileText}>Occupation: {occupation || 'Not set'}</Text>
      <Text style={styles.profileText}>State of Origin: {stateOfOrigin || 'Not set'}</Text>
      <Text style={styles.profileText}>Current Location: {currentLocation || 'Not set'}</Text>
      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={() => setIsEditing(true)}
        disabled={loading}
      >
        <Text style={styles.updateButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </>
  );

  // Render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text>Log out</Text>
            </TouchableOpacity>
            {isEditing || !isProfileUpdated() ? renderProfileForm() : renderProfileView()}
          </>
        );

      case 'explore':
        return < MainDashboard />
      case  'discover':
        return < People />
      case 'report':
        return <Home isDarkTheme={false} />;
      case 'settings':
        return <Profile />;
      default:
        return <Text>Unknown Tab</Text>;
    }
  };

  if (!user && activeTab === 'dashboard') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        {renderContent()}
        {/* Bottom Navigation Bar */}
        <View style={styles.navBar}>
        <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('discover')}
          >
            <MaterialIcons
              name="people"
              size={24}
              color={activeTab === 'discover' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('dashboard')}
          >
            <MaterialIcons
              name="home"
              size={24}
              color={activeTab === 'dashboard' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('explore')}
          >
            <MaterialIcons
              name="explore"
              size={24}
              color={activeTab === 'explore' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('report')}
          >
            <MaterialIcons
              name="report"
              size={24}
              color={activeTab === 'report' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Report</Text>
          </TouchableOpacity>
      
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('settings')}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={activeTab === 'settings' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 16,
    alignSelf: 'center',
  },
  uploadButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 44,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#F6643BFF', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    minHeight: 44,
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 4,
  },
  profileText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
});