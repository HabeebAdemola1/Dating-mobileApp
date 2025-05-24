import { View, Text, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { getAllPost } from '../constants/api';

const AllPosts = () => {
  const [allPosts, setAllPosts] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const FetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Authentication token is missing',
          });
          return; // Stop execution if token is missing
        }

        const response = await getAllPost(token);
        console.log(response.data.validPost, 'dat!!');
        setAllPosts(response.data.validPost || []); // Ensure it's an array

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Welcome! Posts loaded successfully.',
        });
      } catch (error) {
        console.log(error);
        const errorMessage = error.message || 'An error occurred while fetching posts';
        setError(errorMessage);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    FetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28518FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <ScrollView>
        <View>
          {allPosts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>No posts yet. Share something in your dashboard!</Text>
            </View>
          ) : (
            allPosts.map((post, index) => (
              <View key={index} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image
                    source={{
                      uri: post.userId?.picture || 'https://via.placeholder.com/40?text=User',
                    }}
                    style={styles.postProfileImage}
                  />
                  <View>
                    <Text style={styles.postProfileName}>{post.userId?.fullname || 'User'}</Text>
                    <Text style={styles.postTimestamp}>
                      {new Date(post.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                {post.isStatus && (
                  <Text style={styles.postStatus}>
                    {post.isStatus === true ? 'Active' : 'Inactive'} {/* Display meaningful text */}
                  </Text>
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
        </View>
      </ScrollView>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
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
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 18,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postProfileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postStatus: {
    fontSize: 14,
    color: '#F28518FF',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default AllPosts;