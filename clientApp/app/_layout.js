import {  useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
import '../global.css'
import Home from "../app/Home"
import Welcome from "../app/welcome"
import login from "../app/login"
import signup from "../app/signup"
import landingPage from "../app/landingPage"
import index from "../app/index"
import profile from "../app/profile"
import dashboard from "../app/dashboard"
import { createStackNavigator } from '@react-navigation/stack';
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
          component={index}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="landingPage"
          component={landingPage}
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
          options={{ title: 'Dashboard' }}
        />
      </Stack.Navigator>
  )
}
