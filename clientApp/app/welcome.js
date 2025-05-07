import React from 'react';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet, ImageBackground, Pressable } from 'react-native';
import im from "../assets/images/dating1.png"
import { useRoute } from '@react-navigation/native';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={styles.Container}>
    <ImageBackground 
      source={im}
      resizeMode='cover'
      style={styles.image}>
    <Text style={styles.title}>get a match for yourself</Text>
    <Link  href="/signup"
     style={{marginHorizontal:'auto'}} asChild>
    <TouchableOpacity onPress={() => router.push("/landingpage")} style={styles.button} >
      <Text style={styles.buttonText}>
        Next
      </Text>
    </TouchableOpacity>
         
    </Link>
    </ImageBackground>
  
  </View>
  );
}

const styles = StyleSheet.create({
  Container:{
    flex:1,
    flexDirection: 'column',
    position:"relative"
  },
  title:{
    color:'black',
    fontSize:30,
    fontWeight:'bold',
    textAlign: 'center',
 
    marginBottom: 20
  },
  Link:{
    color:'white',
    fontSize:42,
    fontWeight:'bold',
    textAlign: 'center',
    textDecorationLine:"underline",
  
    padding: 4,
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  button:{
    height:50,
    borderRadius:15,
    padding:6,
    marginTop:90,
    justifyContent:"center",
    backgroundColor:'#fff'
  },
  buttonText:{
    color:'black',
    fontSize:16,
    fontWeight:'bold',
    textAlign: 'center',

    padding: 4,
 
  },
  image:{
    width:'100%',
    height:'100%',
    flex:1,
    resizeMode:"cover",
    justifyContent:'center'
  }
})