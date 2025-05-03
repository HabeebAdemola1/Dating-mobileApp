import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
import '../global.css'


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
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
    <Stack.Screen name="login" options={{ title: 'Log In' }} />
    <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
  </Stack>
  )
}
