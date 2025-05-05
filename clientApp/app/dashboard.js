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
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Dashboard.js: getProfile:', getProfile);
    console.log('Dashboard.js: updateProfile:', updateProfile);

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Dashboard.js: Token:', token || 'No token');
        if (!token) {
          Alert.alert('Error', 'Please log in to view your profile');
          return;
        }
        const response = await getProfile(token); // Fixed: Use token variable
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('upload_preset', 'essential');

        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dc0poqt9l/image/upload',
          formData
        );
        setPicture(response.data.secure_url);
      }
    } catch (error) {
      console.error('Dashboard.js: Image Upload Error:', error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: 'Failed to upload image',
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
        title: 'Success',
        text: 'Profile updated successfully',
      });
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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
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
    backgroundColor: '#3b82f6',
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
});


// import React from 'react'
// import { View } from 'react-native'

// const dashboard = () => {
//   return (
//     <View>

//     </View>
//   )
// }

// export default dashboard
