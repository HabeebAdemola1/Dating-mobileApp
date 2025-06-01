import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { getMyFriends, getMessages, sendMessage, getConversations } from '@/constants/api';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { router } from 'expo-router';

export default function Friends() {
  const [userId, setUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const socketRef = useRef(null);

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
    // Fetch userId and initialize Socket.IO
    const initialize = async () => {
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

        // Initialize Socket.IO
        socketRef.current = io(process.env.EXPO_PUBLIC_API_URL, {
          query: { token },
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current.id);
        });

        socketRef.current.on('newMessage', ({ conversationId, content, senderId, timestamp }) => {
          if (senderId !== storedUserId && selectedFriend?.id === senderId) {
            setMessages((prev) => [
              ...prev,
              { content, sender: { _id: senderId }, timestamp },
            ]);
          }
        });

        socketRef.current.on('error', ({ message }) => {
          console.error('Socket error:', message);
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: message,
          });
        });
      } catch (error) {
        console.error('Initialization error:', error);
        logout();
      }
    };

    // Fetch friends
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await getMyFriends(token);
        if (!response?.data?.data?.friends) {
          throw new Error('No friends data returned');
        }
        setFriends(response.data.data.friends);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Friends',
          textBody: 'Friends loaded successfully',
        });
      } catch (error) {
        console.error('Error fetching friends:', error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: error.message || 'Failed to load friends',
        });
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
    fetchFriends();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const openChat = async (friend) => {
    setSelectedFriend(friend);
    setChatModalVisible(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await getMessages(token, friend.id);
      setMessages(response.data.data.messages || []);

      // Get conversation ID
      const convResponse = await getConversations(token);
      const conversation = convResponse.data.data.conversations.find((conv) =>
        conv.participants.some((p) => p._id === friend.id)
      );
      setConversationId(conversation?._id || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to load messages',
      });
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const messageData = {
        content: newMessage,
        sender: { _id: userId },
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageData]);
      await sendMessage(token, selectedFriend.id, newMessage);

      socketRef.current.emit('new message', {
        conversationId,
        content: newMessage,
        recipientId: selectedFriend.id,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to send message',
      });
    }
  };

  const renderFriend = ({ item, index }) => (
    <TouchableOpacity onPress={() => openChat(item)} style={styles.friendItem}>
      <Image
        source={{ uri: item.picture || `https://i.pravatar.cc/150?img=${index}` }}
        resizeMode="cover"
        style={styles.friendImage}
      />
      <View style={styles.info}>
        <Text style={styles.friendName}>{item.fullname || 'Unknown'}</Text>
        <Text style={styles.friendEmail}>{item.email || 'No email'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender._id === userId ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF7300" />
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id || Math.random().toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No friends yet</Text>}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModalContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>
                Chat with {selectedFriend?.fullname || 'Friend'}
              </Text>
              <TouchableOpacity
                onPress={() => setChatModalVisible(false)}
                style={styles.closeChatButton}
              >
                <Text style={styles.closeChatButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              style={styles.messageList}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
              />
              <TouchableOpacity onPress={sendChatMessage} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
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
  friendItem: {
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
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  friendEmail: {
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
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatModalContainer: {
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeChatButton: {
    backgroundColor: '#F6643B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeChatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  sentMessage: {
    backgroundColor: '#F6643BFF',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0B9C2B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});