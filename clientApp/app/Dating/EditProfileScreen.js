import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import updateProfile from "../../constants/api"

import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';

const { width, height } = Dimensions.get('window');

export default function EditProfileScreen() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Permission Denied',
          text: 'Please grant permission to access the media library.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const formData = new FormData();

        const mimeType = asset.mimeType || 'image/jpeg';
        const fileExtension = mimeType.split('/')[1] || 'jpg';

        formData.append('file', {
          uri: asset.uri,
          type: mimeType,
          name: `profile.${fileExtension}`,
        });
        formData.append('upload_preset', 'essential');

        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dc0poqt9l/image/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setPicture(response.data.secure_url);

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          text: 'Image uploaded successfully',
        });
      }
    } catch (error) {
      console.error('EditProfileScreen.js: Image Upload Error:', {
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

  const updateNormalProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          text: 'Authentication required',
        });
        return;
      }
      const profileData = {
        fullname,
        age: age ? parseInt(age) : null,
        occupation,
        stateOfOrigin,
        currentLocation,
        picture,
      };
      await updateProfile(token, profileData);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        text: 'Profile updated successfully',
      });
      router.back();
    } catch (error) {
      console.error('EditProfileScreen.js: Update Profile Error:', error.response?.data || error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={fullname}
            onChangeText={setFullname}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#888"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Occupation"
            placeholderTextColor="#888"
            value={occupation}
            onChangeText={setOccupation}
          />
          <TextInput
            style={styles.input}
            placeholder="State of Origin"
            placeholderTextColor="#888"
            value={stateOfOrigin}
            onChangeText={setStateOfOrigin}
          />
          <TextInput
            style={styles.input}
            placeholder="Current Location"
            placeholderTextColor="#888"
            value={currentLocation}
            onChangeText={setCurrentLocation}
          />
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {picture ? 'Change Profile Picture' : 'Upload Profile Picture'}
            </Text>
          </TouchableOpacity>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.previewImage} />
          ) : null}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#F6643BFF' }]}
              onPress={updateNormalProfile}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#666' }]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingVertical: 20,
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BBB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
    height: 48,
    width: width * 0.9,
  },
  imageButton: {
    backgroundColor: '#F6643BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});