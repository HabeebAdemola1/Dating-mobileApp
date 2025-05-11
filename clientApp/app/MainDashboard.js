import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getProfile, updateProfile } from '../constants/api';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { TextInput } from 'react-native';


export default function MainDashboard() {
  const router = useRouter();
  const scale = useSharedValue(1);
    const [user, setUser] = useState(null);
    const [fullname, setFullname] = useState('');
    const [age, setAge] = useState('');
    const [occupation, setOccupation] = useState('');
    const [stateOfOrigin, setStateOfOrigin] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [picture, setPicture] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('discover'); 
    const [isEditing, setIsEditing] = useState(false); 
      const [modalVisible, setModalVisible] = useState(false);
      const [selectedUser, setSelectedUser] = useState(null)




  
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
    
//       const handleUpdate = async () => {
//         if (loading) return;
    
//         setLoading(true);
//         try {
//           const token = await AsyncStorage.getItem('token');
//           if (!token) {
//             Alert.alert('Error', 'Please log in to update your profile');
//             router.push('/login');
//             return;
//           }
    
//           const updates = {
//             fullname,
//             age: parseInt(age) || 0,
//             occupation,
//             stateOfOrigin,
//             currentLocation,
//             picture,
//           };
//           console.log('Dashboard.js: Sending updates:', updates);
//           const response = await updateProfile(token, updates);
//           console.log('Dashboard.js: Update response:', response.data);
//           Toast.show({
//             type: ALERT_TYPE.SUCCESS,
//             title: 'Successfully updated',
//             text: 'Profile updated successfully',
//           });
//           setIsEditing(false); // Exit edit mode after successful update
//         } catch (error) {
//           console.error('Dashboard.js: Update Error:', error.response?.data || error.message);
//           Toast.show({
//             type: ALERT_TYPE.DANGER,
//             title: 'Error',
//             text: error.response?.data?.error || 'Failed to update profile',
//           });
//         } finally {
//           setLoading(false);
//         }
//       };
// const handlePressUser = (user) => {
//   setModalVisible(true)
//   setSelectedUser(user)
// }

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

  // Animation for card press
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Bounce effect on load
  useEffect(() => {
    scale.value = withSpring(1.05, { damping: 3 }, () => {
      scale.value = withTiming(1, { duration: 200 });
    });
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(1.1);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleCardPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>

      {/* Profile Preview */}
      <Animated.View entering={FadeIn.duration(1000)}>
        <View style={styles.profileSection}>
          <Image
            source={ user?.picture }
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>{user?.fullname || 'Not set'}</Text>
            <Text style={styles.profileAge}>{age || "not set" }</Text>
          </View>
          <TouchableOpacity
                onPress={() => router.push("/myprofile")}
          >
             <Text style={styles.editButton}
            > Edit profile</Text>
          </TouchableOpacity>
       
        </View>
      </Animated.View>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.cardRow}
        >
          <Animated.View
            style={[styles.card, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            asChild
          >
            <TouchableOpacity onPress={() => handleCardPress('/matches')}>
              <Text style={styles.cardTitle}>Matches</Text>
              <Text style={styles.cardCount}>12</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[styles.card, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            asChild
          >
            <TouchableOpacity onPress={() => handleCardPress('/messages')}>
              <Text style={styles.cardTitle}>Messages</Text>
              <Text style={styles.cardCount}>5</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.cardRow}
        >
          <Animated.View
            style={[styles.card, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            asChild
          >
            <TouchableOpacity onPress={() => handleCardPress('/settings')}>
              <Text style={styles.cardTitle}>Settings</Text>
              <Text style={styles.cardCount}>0</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F6643BFF',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#F6643BFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileAge: {
    fontSize: 14,
    color: '#666',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: (width - 60) / 2, // Two cards per row with padding
    height: 150,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#F6643BFF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardCount: {
    fontSize: 16,
    color: '#666',
  },

  editButton:{
    backgroundColor: '#F6643BFF',
    color:"white",
    padding:"5",
    borderRadius: 10,
    marginLeft: 30
  }
});