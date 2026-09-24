import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

// Token sirf isi module ke andar rakha jata hai — kisi aur file mein
// direct localStorage.getItem('token') nahi likha jata. Isse token ka
// access ek hi jagah se control hota hai (single source of truth).
let currentToken = null;

export function setAuthToken(token) {
  currentToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function loadStoredToken() {
  currentToken = localStorage.getItem('token');
  return currentToken;
}

// Har request ke sath token attach karo (agar hai to)
api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Agar backend kahin bhi 401 bheje (token invalid/expire), to turant
// logout kar ke login page par bhej do — purana/ghalat token liye
// app mein ghoomte rehna security aur UX dono ke liye ghalat hai
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
