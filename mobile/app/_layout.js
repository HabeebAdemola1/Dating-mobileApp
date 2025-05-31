import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="login" options={{ title: 'Log In' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Lets Meet' }} />
      <Stack.Screen name="myprofile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="editdatingprofile" options={{ title: 'Edit Dating Profile' }} />
      <Stack.Screen name="matches" options={{ title: 'Matches' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name='seeAllMyProfile' options={{title:"My profile", }} />
      <Stack.Screen name='posts' options={{title:"Your posts", }} />
      <Stack.Screen name='allposts' options={{title:"Lets meet", }} />
    </Stack>
  );
}

