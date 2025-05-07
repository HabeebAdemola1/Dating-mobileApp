import React from 'react';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export default function Landingpage() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/images/short-video.mp4')} // Verify path
        style={styles.video}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}> Let's meet</Text>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff', // Tailwind's text-blue-700
    fontSize: 36, // Tailwind's text-4xl (approx)
    fontWeight: 'bold',
    marginBottom: 16, // Tailwind's mb-4 (4 * 4px = 16px)
  },
  signupButton: {
    backgroundColor: '#F6643BFF', // Tailwind's bg-blue-500
    paddingHorizontal: 24, // Tailwind's px-6 (6 * 4px = 24px)
    paddingVertical: 12, // Tailwind's py-3 (3 * 4px = 12px)
    borderRadius: 9999, // Tailwind's rounded-full
    marginBottom: 16, // Tailwind's mb-4
  },
  loginButton: {
    backgroundColor: '#6b7280', // Tailwind's bg-gray-500
    paddingHorizontal: 24, // Tailwind's px-6
    paddingVertical: 12, // Tailwind's py-3
    borderRadius: 9999, // Tailwind's rounded-full
  },
  buttonText: {
    color: '#ffffff', // Tailwind's text-white
    fontSize: 18, // Tailwind's text-lg (approx)
  },
});