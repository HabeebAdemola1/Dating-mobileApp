import axios from 'axios';
import Constants from 'expo-constants';

const API_URL ="http://192.168.67.127:1010";
console.log('api.js: API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    if (error.message.includes('Network Error')) {
      console.error('API Network Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        message: error.response.data.message
      });
    }
    return Promise.reject(error);
  }
);

export const signup = (email, password, confirmPassword, phoneNumber) =>
  api.post('/api/auth/signup', { email, password, confirmPassword, phoneNumber });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getProfile = (token) =>
  api.get('/api/auth/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (token, updates) =>
  api.put('/api/auth/dashboard', updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getallusers = (token) => {
 return api.get('/api/auth/getall', {
    headers: {Authorization: `Bearer ${token}`}
  })

}

export const createdatingProfile = async (token, datingProfileData) => {
  return api.post('/api/dating/createdating', datingProfileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const getDatingProfile = (token) => {
  return api.get("/api/dating/getdating", {
    headers: {Authorization: `Bearer ${token}`}
  })

}

export const createYourPost = (token,   postData) => {
  return api.post("/api/post/createpost",   postData, {
    headers: {Authorization: `Bearer ${token}`}

  })
}


export const getMyPost = (token) => {
  return api.get("/api/post/getpost", {
    headers: {Authorization: `Bearer ${token}`}
  })
}


// export const getAllPost = (token) => {
//   return api.get("/api/post/allposts", {
//      headers: {Authorization: `Bearer ${token}`}
//   })
// }

export const getAllPost = (token, after = null) =>
  api.get(`/api/post/allposts${after ? `?after=${after}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const likePost = (token, postId) =>
  api.post(`/api/post/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sharePost = (token, postId) =>
  api.post(`/api/post/${postId}/share`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const commentPost = (token, postId, content) =>
  api.post(`/api/post/${postId}/comment`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });



export const inviteUser = (token, recipientId) =>
  api.post(
    '/api/dating/invite',
    { senderId: recipientId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const respondToInvite = (token, senderProfileId, action) =>
  api.post(
    '/api/dating/respond',
    { senderProfileId, action },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getMyAdmirers = (token) =>
  api.get('/api/dating/getmyadmirers', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyFriends = (token) =>
  api.get('/api/dating/myfriends', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMessages = (token, friendId) =>
  api.get(`/api/dating/messages/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendMessage = (token, receiverId, content) =>
  api.post(
    '/api/dating/messages',
    { receiverId, content },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getConversations = (token) =>
  api.get('/api/dating/conversations', {
    headers: { Authorization: `Bearer ${token}` },
  });


export default api;