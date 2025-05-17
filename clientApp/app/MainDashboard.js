import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../constants/api';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function MainDashboard() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

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
        setUser(response.data);
        setFullname(response.data?.fullname || '');
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
    router.push(route);
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
              <Text style={styles.profileName}>{user?.fullname || 'Not set'}</Text>
              <Text style={styles.profileAge}>{age || 'not set'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/edit-profile')}>
              <Text style={styles.editButton}>Add/Edit Profile</Text>
            </TouchableOpacity>
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
              <TouchableOpacity onPress={() => router.push('/editdatingprofile')}>
                <Text style={styles.cardTitle}>Dating Profile</Text>
                <Text style={styles.cardCount}>5</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
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
    width: (width - 60) / 2,
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
  editButton: {
    backgroundColor: '#F6643BFF',
    color: 'white',
    padding: 8,
    borderRadius: 10,
    marginLeft: 30,
    fontSize: 14,
    textAlign: 'center',
  },
});