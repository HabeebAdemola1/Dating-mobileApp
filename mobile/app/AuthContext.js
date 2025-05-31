import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getAllPost } from '../constants/api';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Checking auth:', { token, storedUserId });
        if (token && storedUserId) {
          try {
            await getAllPost(token);
            setIsAuthenticated(true);
            setUserId(storedUserId);
            router.replace('/allposts');
          } catch (error) {
            console.error('Token verification failed:', error);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            setIsAuthenticated(false);
            setUserId(null);
            router.replace('/index');
          }
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          router.replace('/index');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/index');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token, userId) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      setIsAuthenticated(true);
      setUserId(userId);
      router.replace('/allposts');
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to save authentication data',
      });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      setIsAuthenticated(false);
      setUserId(null);
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthProvider as default
export default AuthProvider;