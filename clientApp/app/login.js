/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { login } from '../constants/api'
import { Alert, TextInput, TouchableOpacity, View, StyleSheet, Text } from 'react-native'
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = async() => {
        try {
            await login(email, password)  
                Toast.show({
                    type:ALERT_TYPE.SUCCESS,
                    title:'Success',
                    description:"login successful"
                })
            router.push("/dashboard")
        } catch (error) {
            Toast.show({
                type:ALERT_TYPE.DANGER,
                title:"Danger",
                description:"login failed, please try again"
            })
            router.push("/login")
            Alert.alert("Error", error.response?.data?.error || error.response?.data?.message || "login failed, please try again")
            router.push("/login")
        }
       
    }
  return (
    
        <AlertNotificationRoot>
            <View style={style.container}>
                <Text style={style.title}>Login</Text>
                <TextInput
                    style={style.input}
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize='none'
                    keyboardType='email-address'
                 />

                 <TextInput 
                    style={style.input}
                    placeholder='password'
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                    autoCapitalize='none'
                 />

                 <TouchableOpacity style={style.button} onPress={handleLogin}>
                    <Text style={style.buttonText}>
                          Login
                    </Text>
                    
                   
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => router.push("/signup")}>
                    <Text style={style.signupText}>
                        Don't have an account? Sign up
                    </Text>
                 </TouchableOpacity>
            </View>

        </AlertNotificationRoot>
      
    
  )
}


const style = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems:'center',
        padding: 16,
    },

    title:{
        fontSize:24,
        fontWeight: 'bold',
        marginBottom: 16
    },
    input: {
        width: '80%',
        borderWidth:1,
        borderColor: '#ccc',
        borderRadius: 15,
        marginBottom: 15,
        padding:9
    },
    button: {
        backgroundColor:  '#F6643BFF', 
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,

    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },

    signupText:{
        paddingTop:10
    }
})
