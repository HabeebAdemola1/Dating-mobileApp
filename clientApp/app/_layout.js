import {  useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
import '../global.css'
import Home from "../app/Home"
import Welcome from "../app/Welcome";

import login from "../app/login"
import signup from "../app/signup"
import LandingPage from "./LandingPage"
import index from "../app/index"
import Myprofile from "../app/MyProfile"
import dashboard from "../app/dashboard"
import { createStackNavigator } from '@react-navigation/stack';
import MyProfile from "../app/MyProfile";
import EditDatingProfileScreen from "../app/Dating/EditDatingProfileScreen"
import EditProfileScreen from "../app/Dating/EditProfileScreen"
const Stack = createStackNavigator()
export default function Layout() {
  const router = useRouter()
  const [isAuthenticated,setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async() => {
      const token = await AsyncStorage.getItem('token')
      if(token){
        setIsAuthenticated(true)
        router.replace('/dashboard')
      }
    }

    checkAuth()
  }, [])

  return (

      <Stack.Navigator>
        <Stack.Screen
          name="index"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="landingpage"
          component={landingPage}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="signup"
          component={signup}
          options={{ title: 'Sign Up' }}
        />
        <Stack.Screen
          name="login"
          component={login}
          options={{ title: 'Log In' }}
        />
        <Stack.Screen
          name="dashboard"
          component={dashboard}
          options={{ title: 'Lets meet' }}
          sty
        />

        <Stack.Screen
        name="myprofile"
        component={MyProfile}
        
         />

         <Stack.Screen name="edit-profile" component={EditProfileScreen} />

         <Stack.Screen name="editdatingprofile" component={EditDatingProfileScreen} />
      </Stack.Navigator>
  )
}
