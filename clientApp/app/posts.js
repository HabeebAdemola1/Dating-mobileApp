import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getProfile, getMyPost, createYourPost} from '../constants/api';
import { ALERT_TYPE, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

// Status options (like Facebook's "Feeling/Activity")
const statusOptions = [
  '',
  'Feeling happy',
  'Feeling excited',
  'Feeling sad',
  'At work',
  'Celebrating',
  'Traveling',
];

export default function Posts() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState('');
  const [isStatus, setIsStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Posts.js: Token:', token || 'No token');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Authentication Error',
            text: 'Please log in to view posts',
          });
          router.push('/login');
          return;
        }

        // Check token expiration
        const profileResponse = await getProfile(token);
        console.log('Posts.js: Profile Response:', profileResponse.data);
        if (!profileResponse.data.user) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Profile Not Found',
            text: 'Failed to load profile details',
          });
          setError('Profile details not found');
          return;
        }

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

        // Fetch posts
        const postsResponse = await getMyPost(token);
        console.log('Posts.js: Posts Response:', postsResponse.data);
        if (postsResponse.data.validPost) {
          setPosts(postsResponse.data.validPost);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Posts Loaded',
            text: 'Your posts have been loaded!',
          });
        }
      } catch (error) {
        console.error('Posts.js: Fetch Error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || 'Failed to load posts';
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

    fetchData();
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
        aspect: [4, 3],
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
          name: `post.${fileExtension}`,
        });
        formData.append('upload_preset', 'essential');

        setPostLoading(true);
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dc0poqt9l/image/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        setMedia(response.data.secure_url);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          text: 'Image uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Posts.js: Image Upload Error:', error.response?.data || error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: 'Failed to upload image. Please try again.',
      });
    } finally {
      setPostLoading(false);
    }
  };

  const createPost = async () => {
    if (!content && !media && !isStatus) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Empty Post',
        text: 'Please add content, an image, or a status.',
      });
      return;
    }

    setPostLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Authentication Error',
          text: 'Please log in to create a post',
        });
        router.push('/login');
        return;
      }

      const postData = {
        content,
        media,
        isStatus,
      };

      console.log('Posts.js: Creating Post:', postData);
      const response = await createYourPost(token, postData)
     
      console.log('Posts.js: Create Post Response:', response.data);
      setPosts([response.data, ...posts]); 
      setContent('');
      setMedia('');
      setIsStatus('');
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        text: 'Post created successfully!',
      });
    } catch (error) {
      console.error('Posts.js: Create Post Error:', error.response?.data || error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: error.response?.data?.error || 'Failed to create post',
      });
    } finally {
      setPostLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.retryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Post Creation Box */}
        <View style={styles.createPostContainer}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: profile?.picture || 'https://via.placeholder.com/40?text=User',
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.fullname || 'User'}</Text>
          </View>
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#65676B"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={isStatus}
              onValueChange={(value) => setIsStatus(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a status" value="" />
              {statusOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          {media && (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: media }} style={styles.mediaImage} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => setMedia('')}
              >
                <Text style={styles.removeMediaText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickImage}
              disabled={postLoading}
            >
              <Text style={styles.actionButtonText}>Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.postButton, postLoading && styles.disabledButton]}
              onPress={createPost}
              disabled={postLoading}
            >
              <Text style={styles.actionButtonText}>
                {postLoading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts List */}
        {posts.length === 0 ? (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>No posts yet. Share something!</Text>
          </View>
        ) : (
          posts.map((post, index) => (
            <View key={index} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={{
                    uri: profile?.picture || 'https://via.placeholder.com/40?text=User',
                  }}
                  style={styles.postProfileImage}
                />
                <View>
                  <Text style={styles.postProfileName}>{profile?.fullname || 'User'}</Text>
                  
                  <Text style={styles.postTimestamp}>
                    {new Date(post.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
              {post.isStatus && (
                <Text style={styles.postStatus}>{post.isStatus}</Text>
              )}
              {post.content && (
                <Text style={styles.postContent}>{post.content}</Text>
              )}
              {post.media && (
                <Image source={{ uri: post.media }} style={styles.postMedia} />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F2F5',
    paddingBottom: 20,
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
    backgroundColor: '#F28C18FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createPostContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2526',
  },
  postInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    color: '#1C2526',
    marginBottom: 10,
    minHeight: 60,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E4E6EB',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F0F2F5',
  },
  picker: {
    height: 48,
    color: '#1C2526',
  },
  mediaPreview: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaImage: {
    width: width - 60,
    height: 200,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 5,
  },
  removeMediaText: {
    color: '#FFF',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#E4E6EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#F28918FF',
  },
  actionButtonText: {
    color: '#1C2526',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  noPostsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  noPostsText: {
    fontSize: 16,
    color: '#65676B',
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postProfileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2526',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#65676B',
  },
  postStatus: {
    fontSize: 14,
    color: '#F29E18FF',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  postContent: {
    fontSize: 16,
    color: '#1C2526',
    marginBottom: 10,
  },
  postMedia: {
    width: width - 60,
    height: 300,
    borderRadius: 10,
    marginTop: 10,
  },
});