/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getProfile, updateProfile } from '../constants/api';
import { useRouter } from 'expo-router';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Home from './Home';
import Profile from './myprofile';
import MainDashboard from "./MainDashboard";
import People from "./People";
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient'; 

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [interest1, setInterest1] = useState('');
  const [interest2, setInterest2] = useState('');
  const [nationality, setNationality] = useState('');
  const [picture, setPicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
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
        gender,
        maritalStatus,
        interest1,
        interest2,
        nationality,
      };
      console.log('Dashboard.js: Sending updates:', updates);
      const response = await updateProfile(token, updates);
      console.log('Dashboard.js: Update response:', response.data);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Successfully updated',
        text: 'Profile updated successfully',
      });
      setIsEditing(false);
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

  const isProfileUpdated = () => {
    return (
      fullname.trim() !== '' ||
      age.trim() !== '' ||
      occupation.trim() !== '' ||
      stateOfOrigin.trim() !== '' ||
      currentLocation.trim() !== '' ||
      picture.trim() !== '' ||
      gender.trim() !== '' ||
      maritalStatus.trim() !== '' ||
      interest1.trim() !== '' ||
      interest2.trim() !== '' ||
      nationality.trim() !== ''
    );
  };

  const nationalities = [
    { label: "Select your country", value: '' },
    { label: "Nigeria", value: 'Nigeria' },
    { label: "Ghana", value: 'Ghana' },
    { label: "United States", value: 'United States' },
    { label: "Canada", value: 'Canada' },
    { label: "Kenya", value: 'Kenya' },
    { label: "South Africa", value: 'South Africa' },
    { label: "United Kingdom", value: 'United Kingdom' },
    { label: "Australia", value: 'Australia' },
    { label: "India", value: 'India' },
    { label: "Brazil", value: 'Brazil' },
  ];

  const genderSelect = ['Male', 'Female'];

  const maritalstatus = ['Single', 'Married', 'Divorced', 'Widow'];

  const interests = ['Reading', 'Traveling', 'Sports', 'Music', 'Cooking'];

  const renderProfileForm = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <LinearGradient
        colors={[ '#F0E6DFFF', '#F0E6DFFF']}
        style={styles.formGradient}
      >
        <Text style={styles.title}>Update Your Profile</Text>
        {picture ? (
          <Image source={{ uri: picture }} style={styles.profileImage} />
        ) : null}
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.disabledButton]}
          onPress={pickImage}
          disabled={loading}
        >
          <LinearGradient
            colors={[ '#ff8e53', '#DCD2CCFF']}
            style={styles.gradientButton}
          >
            <Text style={styles.uploadButtonText}>Upload Picture</Text>
          </LinearGradient>
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
        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioGroupHorizontal}>
          {genderSelect.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOptionHorizontal}
              onPress={() => {
                console.log('Gender updated:', option);
                setGender(option);
              }}
              disabled={loading}
            >
              <View style={[
                styles.radioCircle,
                gender === option && styles.radioCircleSelected
              ]}>
                {gender === option && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Marital Status</Text>
        <View style={styles.radioGroupHorizontal}>
          {maritalstatus.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOptionHorizontal}
              onPress={() => {
                console.log('Marital Status updated:', option);
                setMaritalStatus(option);
              }}
              disabled={loading}
            >
              <View style={[
                styles.radioCircle,
                maritalStatus === option && styles.radioCircleSelected
              ]}>
                {maritalStatus === option && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Interest 1</Text>
        <View style={styles.radioGroupHorizontal}>
          {interests.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOptionHorizontal}
              onPress={() => {
                console.log('Interest 1 updated:', option);
                setInterest1(option);
              }}
              disabled={loading}
            >
              <View style={[
                styles.radioCircle,
                interest1 === option && styles.radioCircleSelected
              ]}>
                {interest1 === option && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Interest 2</Text>
        <View style={styles.radioGroupHorizontal}>
          {interests.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOptionHorizontal}
              onPress={() => {
                console.log('Interest 2 updated:', option);
                setInterest2(option);
              }}
              disabled={loading}
            >
              <View style={[
                styles.radioCircle,
                interest2 === option && styles.radioCircleSelected
              ]}>
                {interest2 === option && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Occupation"
          value={occupation}
          onChangeText={setOccupation}
          placeholderTextColor="#6b7280"
          editable={!loading}
        />
        <Text style={styles.label}>Country</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nationality}
            onValueChange={(itemValue) => {
              console.log('Nationality updated:', itemValue);
              setNationality(itemValue);
            }}
            enabled={!loading}
            style={styles.picker}
          >
            {nationalities.map((state) => (
              <Picker.Item key={state.value} label={state.label} value={state.value} />
            ))}
          </Picker>
        </View>
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
          <LinearGradient
            colors={[ '#ff8e53', '#ff8e53']}
            style={styles.gradientButton}
          >
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );

  const renderProfileView = () => (
    <>
      <Text style={styles.title}>Update your Profile</Text>
      {picture ? (
        <Image source={{ uri: picture }} style={styles.profileImage} />
      ) : null}
      <Text style={styles.profileText}>Full Name: {fullname || 'Not set'}</Text>
      <Text style={styles.profileText}>Age: {age || 'Not set'}</Text>
      <Text style={styles.profileText}>Gender: {gender || 'Not set'}</Text>
      <Text style={styles.profileText}>Marital Status: {maritalStatus || 'Not set'}</Text>
      <Text style={styles.profileText}>Interest 1: {interest1 || 'Not set'}</Text>
      <Text style={styles.profileText}>Interest 2: {interest2 || 'Not set'}</Text>
      <Text style={styles.profileText}>Occupation: {occupation || 'Not set'}</Text>
      <Text style={styles.profileText}>Country: {nationality || 'Not set'}</Text>
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
        return <MainDashboard />;
      case 'friends':
        return <People />;
      case 'report':
        return <Home isDarkTheme={false} />;
      case 'profile':
        return <MainDashboard />;
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
        <View style={styles.navBar}>
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
            onPress={() => setActiveTab('friends')}
          >
            <MaterialIcons
              name="people"
              size={24}
              color={activeTab === 'friends' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Friends</Text>
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
            onPress={() => setActiveTab('profile')}
          >
            <MaterialIcons
              name="home"
              size={24}
              color={activeTab === 'profile' ? '#16a34a' : '#6b7280'}
            />
            <Text style={styles.navText}>Profile</Text>
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
  formContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formGradient: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: 'black',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  uploadButton: {
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 44,
  },
  uploadButtonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  updateButton: {
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: "#ff8e53"
  },
  updateButtonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontWeight: '600',
    padding:"5"
  },
  disabledButton: {
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioOptionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    backgroundColor: '#ff8e53',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#ff8e53',
  },
  radioText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
});