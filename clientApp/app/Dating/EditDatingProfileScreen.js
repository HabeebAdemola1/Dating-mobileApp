import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createdatingProfile, getDatingProfile } from '../../constants/api.js';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';

const { width, height } = Dimensions.get('window');

export default function EditDatingProfileScreen() {
  const router = useRouter();
  const [genotype, setGenotype] = useState('');
  const [religion, setReligion] = useState('');
  const [bio, setBio] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [admirers, setAdmirer] = useState('');
  const [pictures, setPictures] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDatingProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Token not found',
            text: 'Please log in to access your dating profile',
          });
          return;
        }
        const response = await getDatingProfile(token);
        if (!response || !response.data) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Data not fetched',
            text: 'Failed to load dating profile',
          });
          return;
        }
        setGenotype(response.data?.genotype || '');
        setReligion(response.data?.religion || '');
        setBio(response.data?.bio || '');
        setBloodGroup(response.data?.bloodGroup || '');
        setAdmirer(response.data?.admirers || '');
        setPictures(response.data?.pictures || '');
        setPicture(response.data?.picture || '');
      } catch (error) {
        console.error('EditDatingProfileScreen.js: Fetch Dating Profile Error:', error.response?.data || error.message);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          text: error.response?.data?.error || 'Failed to load dating profile',
        });
      }
    };
    fetchDatingProfile();
  }, []);

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
      console.error('EditDatingProfileScreen.js: Image Upload Error:', {
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

  const createDatingProfile = async () => {
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
      const datingProfileData = {
        genotype,
        religion,
        bio,
        bloodGroup,
        admirers,
        pictures,
        picture,
      };
      const response = await createdatingProfile(token, datingProfileData);
      setGenotype(response.data?.genotype || '');
      setReligion(response.data?.religion || '');
      setBio(response.data?.bio || '');
      setBloodGroup(response.data?.bloodGroup || '');
      setAdmirer(response.data?.admirers || '');
      setPictures(response.data?.pictures || '');
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        text: 'Dating profile created/updated successfully',
      });
      router.back();
    } catch (error) {
      console.error('EditDatingProfileScreen.js: Create Dating Profile Error:', error.response?.data || error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: error.response?.data?.error || 'Failed to create/update dating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Edit Dating Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Genotype"
            placeholderTextColor="#888"
            value={genotype}
            onChangeText={setGenotype}
          />
          <TextInput
            style={styles.input}
            placeholder="Religion"
            placeholderTextColor="#888"
            value={religion}
            onChangeText={setReligion}
          />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Bio"
            placeholderTextColor="#888"
            value={bio}
            onChangeText={setBio}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Blood Group"
            placeholderTextColor="#888"
            value={bloodGroup}
            onChangeText={setBloodGroup}
          />
          <TextInput
            style={styles.input}
            placeholder="Admirers"
            placeholderTextColor="#888"
            value={admirers}
            onChangeText={setAdmirer}
          />
          <TextInput
            style={styles.input}
            placeholder="Additional Pictures (URLs)"
            placeholderTextColor="#888"
            value={pictures}
            onChangeText={setPictures}
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
              onPress={createDatingProfile}
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