import React from 'react';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet, ImageBackground, Pressable, Image } from 'react-native';
import im from "../assets/images/dating2.png";

export default function Welcome1() {
  const router = useRouter();

  // Array of placeholder images for surrounding profiles
  const profileImages = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
  ];

  return (
    <View style={styles.Container}>
      <ImageBackground 
        source={im}
        resizeMode='cover'
        style={styles.image}
      >
        {/* Surrounding Profile Pictures */}
        {profileImages.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={[
              styles.profileImage,
              // Position each image differently
              index === 0 ? { top: '15%', left: '10%' } :
              index === 1 ? { top: '10%', right: '10%' } :
              index === 2 ? { top: '40%', left: '5%' } :
              index === 3 ? { top: '35%', right: '5%' } :
              index === 4 ? { bottom: '25%', left: '15%' } :
              { bottom: '20%', right: '15%' }
            ]}
          />
        ))}

        {/* Title */}
        <Text style={styles.title}>find a perfect partner</Text>

        {/* Next Button */}
      
          <TouchableOpacity 
            onPress={() => router.push("/welcome")} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
    
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    flexDirection: 'column',
    position: "relative",
  },
  title: {
    color: 'white', // Changed to white for better contrast against the background
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add shadow for readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  Link: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: "underline",
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    height: 50,
    borderRadius: 15,
    padding: 6,
    marginTop: 90,
    justifyContent: "center",
    backgroundColor: 'rgba(0,0,0,0.75)',
        marginHorizontal: "auto"
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: "cover",
    justifyContent: 'center',
  },
  profileImage: {
    width: 70, // Size of the surrounding profile pictures
    height: 70,
    borderRadius: 35, // Half of width/height for a circle
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff', // White border for contrast
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});