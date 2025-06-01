import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getallusers, inviteUser, getMyAdmirers, respondToInvite } from '@/constants/api';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { router } from 'expo-router';

export default function People() {
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [admirers, setAdmirers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to logout',
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!token || !storedUserId) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Not authenticated',
          });
          logout();
          return;
        }
        setUserId(storedUserId);

        // Fetch all users
        const usersResponse = await getallusers(token);
        if (!usersResponse?.data) {
          throw new Error('No users data returned');
        }
        // Filter out current user
        const filteredUsers = usersResponse.data.filter(
          (user) => user._id !== storedUserId
        );
        setUsers(filteredUsers);

        // Fetch pending invitations
        const admirersResponse = await getMyAdmirers(token);
        if (admirersResponse?.data?.data?.admirers) {
          setAdmirers(admirersResponse.data.data.admirers);
        }

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Meet New People',
          textBody: 'Successfully fetched',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: error.message || 'An error occurred',
        });
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddFriend = async (recipientId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await inviteUser(token, recipientId);
      setUsers((prev) => prev.filter((user) => user._id !== recipientId));
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Friend request sent',
      });
    } catch (error) {
      console.error('Invite error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.response?.data?.message || 'Failed to send request',
      });
    }
  };

  const handleRespond = async (senderProfileId, action) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await respondToInvite(token, senderProfileId, action);
      setAdmirers((prev) =>
        prev.filter((admirer) => admirer.id !== senderProfileId)
      );
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: `Invitation ${action}ed`,
      });
    } catch (error) {
      console.error('Respond error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.response?.data?.message || 'Failed to respond',
      });
    }
  };

  const handleReject = (userId) => {
    setUsers((prev) => prev.filter((user) => user._id !== userId));
    Toast.show({
      type: ALERT_TYPE.INFO,
      title: 'Rejected',
      textBody: 'User removed from list',
    });
  };

  const handlePressUser = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderUser = ({ item, index }) => (
    <TouchableOpacity onPress={() => handlePressUser(item)} style={styles.userItem}>
      <Image
        source={{ uri: item.picture || `https://i.pravatar.cc/150?img=${index}` }}
        resizeMode="cover"
        style={styles.userImage}
      />
      <View style={styles.info}>
        <Text style={styles.userName}>{item.fullname || 'Unknown'}</Text>
        <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
        <View style={styles.buttonClose}>
          <Pressable
            onPress={() => handleAddFriend(item._id)}
            style={styles.addFriendButton}
          >
            <Text style={styles.closeButtonText}>Add</Text>
          </Pressable>
          <Pressable
            onPress={() => handleReject(item._id)}
            style={styles.rejectFriendButton}
          >
            <Text style={styles.closeButtonText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAdmirer = ({ item, index }) => (
    <View style={styles.userItem}>
      <Image
        source={{ uri: item.picture || `https://i.pravatar.cc/150?img=${index}` }}
        resizeMode="cover"
        style={styles.userImage}
      />
      <View style={styles.info}>
        <Text style={styles.userName}>{item.fullname || 'Unknown'}</Text>
        <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
        <View style={styles.buttonClose}>
          <Pressable
            onPress={() => handleRespond(item.id, 'accept')}
            style={styles.addFriendButton}
          >
            <Text style={styles.closeButtonText}>Accept</Text>
          </Pressable>
          <Pressable
            onPress={() => handleRespond(item.id, 'reject')}
            style={styles.rejectFriendButton}
          >
            <Text style={styles.closeButtonText}>Decline</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF7300" />
      ) : (
        <>
          {admirers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Invitations</Text>
              <FlatList
                data={admirers}
                renderItem={renderAdmirer}
                keyExtractor={(item) => item.id || Math.random().toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No pending invitations</Text>}
              />
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover People</Text>
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item._id || Math.random().toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
            />
          </View>
        </>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedUser?.fullname || 'User'} Details
                </Text>
              </View>
              {selectedUser && (
                <View style={styles.modalContent}>
                  <Image
                    source={{
                      uri: selectedUser.picture || `https://i.pravatar.cc/150?img=${users?.indexOf(selectedUser) || 0}`,
                    }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.modalUserName}>{selectedUser.fullname}</Text>
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
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/seeAllMyProfile?id=${selectedUser?._id}`);
                  }}
                  style={styles.closeButton1}
                >
                  <Text style={styles.closeButtonText}>View Profile</Text>
                </Pressable>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 16,
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
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  buttonClose: {
    flexDirection: 'row',
  },
  closeButton: {
    backgroundColor: '#F6643B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 15,
  },
  closeButton1: {
    backgroundColor: '#0B9C2B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addFriendButton: {
    backgroundColor: '#0B9C2B',
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 15,
  },
  rejectFriendButton: {
    backgroundColor: '#474B48',
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 15,
  },
});