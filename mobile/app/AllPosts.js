import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import Modal from 'react-native-modal';
import { getAllPost } from '../constants/api';
import { LinearGradient } from 'expo-linear-gradient';

const AllPosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [statusPosts, setStatusPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Authentication token is missing',
          });
          return;
        }
        setUserId(storedUserId);

        const response = await getAllPost(token);
        console.log('Initial posts:', response.data.validPost);
        const posts = response.data.validPost || [];
        const nonStatusPosts = posts
          .filter((post) => post.isStatus === '')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const statusPosts = posts.filter((post) => post.isStatus && typeof post.isStatus === 'string' && post.isStatus.trim() !== '');
        console.log('Non-status posts:', nonStatusPosts);
        console.log('Status posts:', statusPosts);
        setAllPosts(nonStatusPosts);
        const userStatus = statusPosts.filter((post) => post.userId?._id === storedUserId);
        const otherStatuses = statusPosts.filter((post) => post.userId?._id !== storedUserId);
        setStatusPosts([...userStatus, ...otherStatuses]);
        setHasMore(response.data.hasMore);
        if (posts.length > 0) {
          setLastTimestamp(posts[posts.length - 1].createdAt);
        }

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Welcome! Posts loaded successfully.',
        });
      } catch (error) {
        console.error('Fetch error:', error);
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

    fetchData();
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await getAllPost(token, lastTimestamp);
      const newPosts = response.data.validPost || [];
      console.log('New posts:', newPosts);
      const newNonStatusPosts = newPosts
        .filter((post) => post.isStatus === '')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const newStatusPosts = newPosts.filter((post) => post.isStatus && typeof post.isStatus === 'string' && post.isStatus.trim() !== '');
      console.log('New non-status posts:', newNonStatusPosts);
      console.log('New status posts:', newStatusPosts);
      setAllPosts((prev) => [...prev, ...newNonStatusPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setStatusPosts((prev) => {
        const userStatus = newStatusPosts.filter((post) => post.userId?._id === userId);
        const otherStatuses = newStatusPosts.filter((post) => post.userId?._id !== storedUserId);
        return [...prev, ...userStatus, ...otherStatuses];
      });
      setHasMore(response.data.hasMore);
      if (newPosts.length > 0) {
        setLastTimestamp(newPosts[newPosts.length - 1].createdAt);
      }
    } catch (error) {
      console.error('Fetch more posts error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to load more posts',
      });
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastTimestamp, userId]);

  const openStatus = (post) => {
    setSelectedStatus(post);
    setTimeout(() => {
      setSelectedStatus(null);
    }, 5000);
  };

  const statusColors = {
    'Feeling happy': '#1877F2',
    'Feeling excited': '#F06292',
    'Feeling sad': '#78909C',
    'At work': '#4CAF50',
    'Celebrating': '#FF9800',
    'Traveling': '#9C27B0',
    '': '#E0E0E0',
  };

  const renderStatus = ({ item }) => (
    <TouchableOpacity key={item._id} onPress={() => openStatus(item)} style={styles.statusItem}>
      <View style={[styles.statusImageContainer, { borderColor: statusColors[item.isStatus] || '#E0E0E0' }]}>
        <Image
          source={{ uri: typeof item.userId?.picture === 'string' ? item.userId.picture : 'https://via.placeholder.com/40?text=User' }}
          style={styles.statusImage}
        />
      </View>
      <Text style={styles.statusName} numberOfLines={1}>
        {typeof item.userId?.fullname === 'string' ? item.userId.fullname : 'User'}
        
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: typeof item.userId?.picture === 'string' ? item.userId.picture : 'https://via.placeholder.com/40?text=User' }}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.profileName}>
            {typeof item.userId?.fullname === 'string' ? item.userId.fullname : 'User'}
          </Text>
          <Text style={styles.timestamp}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown time'}
          </Text>
        </View>
      </View>
      {item.content && typeof item.content === 'string' && (
        <Text style={styles.postContent}>{item.content}</Text>
      )}
      {item.media && typeof item.media === 'string' && (
        <Image source={{ uri: item.media }} style={styles.postImage} />
      )}
    </View>
  );

  if (loading && !allPosts.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28518" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <ScrollView horizontal style={styles.statusContainer} showsHorizontalScrollIndicator={false}>
          {statusPosts.map((post) => renderStatus({ item: post }))}
        </ScrollView>
        <FlatList
          data={allPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator size="small" color="#F28518" />}
          ListEmptyComponent={
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>No posts yet. Share something in your dashboard!</Text>
            </View>
          }
        />
        <Modal
          isVisible={!!selectedStatus}
          onBackdropPress={() => setSelectedStatus(null)}
          style={styles.modal}
        >
          {selectedStatus ? (
            <LinearGradient
              colors={['#1a1a1a', '#333333']}
              style={styles.statusModal}
            >
              <Image
                source={{ uri: typeof selectedStatus.userId?.picture === 'string' ? selectedStatus.userId.picture : 'https://via.placeholder.com/40?text=User' }}
                style={styles.modalProfileImage}
              />
              <Text style={styles.modalProfileName}>
                {typeof selectedStatus.userId?.fullname === 'string' ? selectedStatus.userId.fullname : 'User'}
              </Text>
              <Text style={styles.modalStatus}>
                {selectedStatus.isStatus || 'Status'}
              </Text>
              <Text style={styles.modalTimestamp}>
                {selectedStatus.createdAt ? new Date(selectedStatus.createdAt).toLocaleString() : 'Unknown time'}
              </Text>
              {selectedStatus.content && typeof selectedStatus.content === 'string' && (
                <Text style={styles.modalContent}>{selectedStatus.content}</Text>
              )}
              {selectedStatus.media && typeof selectedStatus.media === 'string' && (
                <Image source={{ uri: selectedStatus.media }} style={styles.modalImage} />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStatus(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="small" color="#F28518" />
              <Text style={styles.modalLoadingText}>Loading status...</Text>
            </View>
          )}
        </Modal>
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.4,
    borderBottomColor: '#e0e0e0',
  },
  statusItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusImageContainer: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 1 ,
    backgroundColor: '#fff',
  },
  statusImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 1,
    maxWidth: 80,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noPostsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  timestamp: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  postContent: {
    fontSize: 17,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginTop: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModal: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalLoading: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  modalProfileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  modalStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F29E18',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalTimestamp: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 16,
  },
  modalContent: {
    fontSize: 17,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#F28518',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AllPosts;