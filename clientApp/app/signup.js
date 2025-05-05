import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signup } from '../constants/api'; // Adjusted from '../constants/api'
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Debug import and state
  console.log('Signup.js: signup:', signup);
  console.log('Signup.js: State:', { email, password, confirmPassword, phoneNumber });

  const handleSignup = async () => {
    if (loading) return;

    if (!email || !password || !confirmPassword || !phoneNumber) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: 'Please fill all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: 'Passwords do not match',
      });
      return;
    }

    setLoading(true);
    try {
      if (!signup) {
        throw new Error('signup is undefined. Check import path.');
      }
      const payload = { email, password, confirmPassword, phoneNumber };
      console.log('Signup.js: Sending:', payload);
      const response = await signup(email, password, confirmPassword, phoneNumber);
      console.log('Signup.js: Signup response:', response.data);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        text: 'Successfully signed up, please log in',
      });
      router.push('/login');
    } catch (error) {
      console.error('Signup.js: Signup Error:', error.response?.data || error.message);
      let errorMessage = 'Signup failed';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Check your network or server status.';
      } else if (error.response?.data?.error || error.response?.data?.message) {
        errorMessage = error.response.data.error || error.response.data.message;
      }
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#6b7280"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholderTextColor="#6b7280"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor="#6b7280"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor="#6b7280"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 9,
    marginBottom: 16,
    borderRadius: 15,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
    placeholderTextColor: '#6b7280',
  },
  button: {
    backgroundColor: '#F6643B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  loginText: {
    paddingTop: 10,
    color: '#3b82f6',
    fontSize: 14,
  },
});