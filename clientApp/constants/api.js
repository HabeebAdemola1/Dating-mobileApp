import axios from "axios"
import Constants from "expo-constants"

const API_URL = Constants.expoConfig.extra.apiUrl


const api = axios.create({
    baseURL: API_URL
})



export const signup = (email, password) => api.post('/api/signup', {email, password})
export const login = (email, password) => api.post('/api/login', {email, password})

export const getProfile = (token) => api.get('/api/profile', {headers: {Authorization: token}});

export const updateProfile = (token, updates) => api.put('/api/profile', updates, {headers : {Authorization: token}} )



export default api