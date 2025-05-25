import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getProfile, getDatingProfile } from '../constants/api';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';

const { width } = Dimensions.get('window');

export default function SeeAllMyProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [datingProfile, setDatingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('SeeAllMyProfile.js: Token:', token || 'No token');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Authentication Error',
            text: 'Please log in to view your profile',
          });
          router.push('/login');
          return;
        }

        // Fetch user profile
        const profileResponse = await getProfile(token);
        console.log('SeeAllMyProfile.js: Profile Response:', profileResponse.data);
        if (!profileResponse.data.user) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Profile Not Found',
            text: 'Failed to load profile details',
          });
          setError('Profile details not found');
          return;
        }

        // Check token expiration
        if (profileResponse.data.verificationTokenExpiresAt) {
          const expirationDate = new Date(profileResponse.data.verificationTokenExpiresAt);
          const currentDate = new Date();
          if (expirationDate < currentDate) {
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Session Expired',
              text: 'Your session has expired. Please log in again.',
            });
            await AsyncStorage.removeItem('token');
            router.push('/login');
            return;
          }
        }

        setProfile(profileResponse.data.user);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Profile Loaded',
          text: 'This is your profile page',
        });

        // Fetch dating profile
        const datingProfileResponse = await getDatingProfile(token);
        console.log('SeeAllMyProfile.js: Dating Profile Response:', datingProfileResponse.data);
        if (datingProfileResponse.data.data) {
          setDatingProfile(datingProfileResponse.data.data);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Dating Profile Loaded',
            text: 'This is your dating profile page',
          });
        }
      } catch (error) {
        console.error('SeeAllMyProfile.js: Fetch Error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || 'An error occurred while loading profile';
        setError(errorMessage);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          text: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F29718FF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/dashboard')}>
          <Text style={styles.retryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: datingProfile?.picture || profile.picture || 'https://via.placeholder.com/600x200?text=Cover+Image' }}
            style={styles.coverImage}
          />
          <Image
            source={{ uri: profile?.picture || 'https://via.placeholder.com/150?text=Profile' }}
            style={styles.profilePicture}
          />
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.fullName}>{profile?.fullname || 'Not set'}</Text>
          <Text style={styles.email}>{profile?.email || 'Not set'}</Text>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{profile?.age || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{profile?.phoneNumber || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Occupation:</Text>
            <Text style={styles.value}>{profile?.occupation || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{profile?.gender || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Marital Status:</Text>
            <Text style={styles.value}>{profile?.maritalStatus || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Interests:</Text>
            <Text style={styles.value}>
              {profile?.interest1 && profile?.interest2
                ? `${profile.interest1}, ${profile.interest2}`
                : 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nationality:</Text>
            <Text style={styles.value}>{profile?.nationality || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>State of Origin:</Text>
            <Text style={styles.value}>{profile?.stateOfOrigin || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Location:</Text>
            <Text style={styles.value}>{profile?.currentLocation || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Unique Number:</Text>
            <Text style={styles.value}>{profile?.uniqueNumber || 'Not set'}</Text>
          </View>
        </View>

        {/* Dating Profile */}
        {datingProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dating Profile</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Genotype:</Text>
              <Text style={styles.value}>{datingProfile.genotype || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Religion:</Text>
              <Text style={styles.value}>{datingProfile.religion || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bio:</Text>
              <Text style={styles.value}>{datingProfile.bio || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Blood Group:</Text>
              <Text style={styles.value}>{datingProfile.bloodGroup || 'Not set'}</Text>
            </View>
            {datingProfile.picture && (
              <Image source={{ uri: datingProfile.picture }} style={styles.datingProfileImage} />
            )}
          </View>
        )}

        {/* Edit Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/myprofile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/editdatingprofile')}
          >
            <Text style={styles.editButtonText}>Edit Dating Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 20,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  coverContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#E4E6EB',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFF',
    position: 'absolute',
    bottom: -60,
    left: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  profileInfo: {
    marginTop: 70,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C2526',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#65676B',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2526',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#65676B',
    width: 150,
  },
  value: {
    fontSize: 16,
    color: '#1C2526',
    flex: 1,
  },
  datingProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  editButton: {
    backgroundColor: '#0B9C2BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});