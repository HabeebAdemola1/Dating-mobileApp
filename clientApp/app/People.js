import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image,ScrollView, Pressable, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getallusers } from '@/constants/api';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

export default function People() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log("Fetched token:", token);

        if (!token) {
          throw new Error('No token found in AsyncStorage');
        }

        const response = await getallusers(token);
        console.log("API Response Data:", response);

        if (!response?.data) {
          throw new Error('No data returned from API');
        }

        setUsers(response.data);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Meet New People",
          description: "Successfully fetched",
          
        });
      } catch (error) {
        console.error("Error fetching users:", error.message, error.response?.data || error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          description: error.message || "An error occurred while fetching users",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePressUser = (user) => {
    setSelectedUser(user),
    setModalVisible(true)
  }

  const renderUser = ({ item, index }) => (
    <TouchableOpacity 
    onPress={() => handlePressUser(item)}
    style={styles.userItem}>
        <Image 
            source= {{uri: item.picture || `https://i.pravatar.cc/150?img=${index}`}}
            resizeMode='cover'
            style={styles.userImage}
            />
          <View style={styles.info}>
          <Text style={styles.userName}>{item.fullname || 'Unknown'}</Text>
          <Text style={styles.userEmail}>{item.email || 'No email'}</Text>

          </View>

   
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF7300FF" />
      ) : users && users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />
      ) : (
        <Text style={styles.emptyText}>No users available</Text>
      )}
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
                     source={{uri: selectedUser.picture || `https://i.pravatar.cc/150?img=${users?.indexOf(selectedUser)}`}}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  userItem: {
    flexDirection: 'row', // Align image and text in a row
    alignItems: 'center', // Vertically center the image and text
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
    width: 40, // Fixed size for the image
    height: 40,
    borderRadius: 20, // Half of width/height to make it circular
    marginRight: 12, // Space between image and text
  },
  userInfo: {
    flex: 1, // Take remaining space
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
    flexDirection: "column"
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
    margin: 16
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonClose:{
      flexDirection:'row',
    
  },
  closeButton: {
    backgroundColor: '#F6643BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 15,
    
  
  },
  closeButton1: {
    backgroundColor: '#0B9C2BFF',
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
});