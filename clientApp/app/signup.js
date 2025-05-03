import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signup } from '../constants/api';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignup = async () => {
        try {
            await signup(email, password);
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                description: "successfully signup, please logged in"
            })

            router.push('/login');
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Danger",
                description: "an error occurred, please try again later"
            })
            Alert.alert(
                'Error',
                error.response?.data?.error || error.response?.data?.message || 'Signup failed'
            );
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
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                     <TouchableOpacity onPress={() => router.push("/login")}>
                                    <Text style={styles.LoginText}>
                                        Already have an account? Login 
                                    </Text>
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 9,
        marginBottom: 16,
        borderRadius: 15,
    },
    button: {
        backgroundColor:  '#F6643BFF', // Matches Landing's signup button
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,

    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },

    LoginText:{
        paddingTop:10
    }
});