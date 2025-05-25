import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../constants/api';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import { Alert } from 'react-native';
import { Modal } from 'react-native';
import { Pressable, ScrollView, } from 'react-native';
const { width } = Dimensions.get('window');

export default function MainDashboard() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
   const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null)
  

  const handlePressUser= (user) => {
    setSelectedUser(user)
    setModalVisible(true)
  }

  useEffect(() => {
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
        setUser(response.data.user);
        setFullname(response.data.user?.fullname || '');
        console.log("fullname******", response.data.user.fullname)
        setAge(response.data?.age ? String(response.data.age) : '');
      } catch (error) {
        console.error('Dashboard.js: Fetch Profile Error:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
    console.log('Navigating to:', route);
    router.push(route);
  };

  const handleEditProfilePress = () => {
    console.log('Navigating to: /myprofile');
    router.push('/myprofile');
  };

  const handleDatingProfilePress = () => {
    console.log('Navigating to: /editdatingprofile');
    router.push('/editdatingprofile');
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        {/* Profile Preview */}
        <Animated.View entering={FadeIn.duration(1000)}>
          <View style={styles.profileSection}>
            <Image
              source={user?.picture ? { uri: user.picture } : require('../assets/images/dating.jpeg')}
              style={styles.profileImage}
            />
            <View>
            <TouchableOpacity onPress={() => router.push("/seeAllMyProfile")}>
                                <Text style={styles.profileName}>{user?.fullname || user?.email || 'Not set'}</Text>
              <Text style={styles.profileAge}>{user?.email || 'not set'}</Text>
              <Text style={styles.profileAge}>{user?.phoneNumber|| 'not set'}</Text>
            </TouchableOpacity>

               <TouchableOpacity onPress={handleEditProfilePress}>
              <Text style={styles.editButton}>Edit Profile</Text>
            </TouchableOpacity>
            </View>
           
          </View>
        </Animated.View>

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.cardRow}>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={() => handleCardPress('/matches')}>
                <Text style={styles.cardTitle}>Matches</Text>
                <Text style={styles.cardCount}>12</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={() => handleCardPress('/messages')}>
                <Text style={styles.cardTitle}>Messages</Text>
                <Text style={styles.cardCount}>5</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.cardRow}>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={() => handleCardPress('/settings')}>
                <Text style={styles.cardTitle}>Settings</Text>
                <Text style={styles.cardCount}>0</Text>
                </TouchableOpacity>
              </Animated.View>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={handleDatingProfilePress}>
                <Text style={styles.cardTitle}>Dating Profile</Text>
                <Text style={styles.cardCount}>edit your profile</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
               <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.cardRow}>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={() => handleCardPress('/posts')}>
                <Text style={styles.cardTitle}>your posts</Text>
                <Text style={styles.cardCount}>0</Text>
                </TouchableOpacity>
              </Animated.View>
            <Animated.View style={[styles.card, animatedStyle]} onPressIn={handlePressIn} onPressOut={handlePressOut} asChild>
              <TouchableOpacity onPress={handleDatingProfilePress}>
                <Text style={styles.cardTitle}>Dating Profile</Text>
                <Text style={styles.cardCount}>edit your profile</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

               <Modal
                   animationType='fade'
                   transparent={true}
                   visible={modalVisible}
                   onRequestClose={() => setModalVisible(false)}
                 >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <ScrollView>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>
                            {selectedUser?.fullname || 'user'} details
                          </Text>
                        </View>
                        {selectedUser && (
                          <View style={styles.modalContent}>
                            <Image 
                               source={{uri: selectedUser.picture}}
                               style={styles.modalImage}
                               resizeMode='cover'
                            />
                            <Text style={styles.modalUserName}>
                              {selectedUser.fullname}
                            </Text>
                            <Text style={styles.modalDetail}>
                              <Text style={styles.detailLabel}>Email: </Text>
                              {selectedUser.email || 'N/A'}
                            </Text>
                            <Text style={styles.modalDetail}>
                              <Text style={styles.detailLabel}>Phone: </Text>
                              {selectedUser.phoneNumber || 'N/A'}
                            </Text>
                            <Text style={styles.modalDetail}>
                              <Text style={styles.detailLabel}>Age: </Text>
                              {selectedUser.age || 'N/A'}
                            </Text>
                            <Text style={styles.modalDetail}>
                              <Text style={styles.detailLabel}>Current Location: </Text>
                              {selectedUser.currentLocation || 'N/A'}
                            </Text>
                          </View>
                      
                        )}
                        <View style={styles.buttonClose}>
                        <Pressable
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton1}
                       >
          
                          <Text style={styles.closeButtonText}>view profile</Text>
          
                        </Pressable>
                        <Pressable
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                       >
          
                          <Text style={styles.closeButtonText}>close</Text>
          
                        </Pressable>
          
                        </View>
                   
                        
                      </ScrollView>
          
                    </View>
          
                  </View>
          
                </Modal>
        </View>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    width: (width - 80) / 2,
    height: 120,
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
  editButton: {
    backgroundColor: '#F6643BFF',
    color: 'white',
    padding: 8,
    borderRadius: 10,
    marginLeft: 30,
    fontSize: 14,
    textAlign: 'center',

  },
   modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 16
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, 
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
  },

  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});