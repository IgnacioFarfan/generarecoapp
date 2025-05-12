import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api.config';
import { jwtDecode } from 'jwt-decode';

// Create axios instance with base URL
// We'll set the baseURL dynamically for each request
const apiClient = axios.create({
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track which URL is currently working
let currentApiUrl = null;
let isCheckingUrls = false;

// Function to check which API URL is accessible
const checkApiUrls = async () => {
  if (isCheckingUrls) return currentApiUrl || apiConfig.publicApiUrl;
  
  isCheckingUrls = true;
  
  try {
    // Try local URL first
    console.log('Trying local API URL:', apiConfig.localApiUrl);
    await axios.get(`${apiConfig.localApiUrl}/api`, { timeout: 3000 });
    console.log('Local API URL is accessible');
    currentApiUrl = apiConfig.localApiUrl;
  } catch (localError) {
    console.log('Local API URL failed:', localError.message);
    
    try {
      // Try public URL as fallback
      console.log('Trying public API URL:', apiConfig.publicApiUrl);
      await axios.get(`${apiConfig.publicApiUrl}/api`, { timeout: 3000 });
      console.log('Public API URL is accessible');
      currentApiUrl = apiConfig.publicApiUrl;
    } catch (publicError) {
      console.log('Public API URL failed:', publicError.message);
      // If both fail, default to public URL
      currentApiUrl = apiConfig.publicApiUrl;
    }
  }
  
  isCheckingUrls = false;
  return currentApiUrl;
};

// Add request interceptor to include auth token and set the correct baseURL
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the working API URL
      if (!currentApiUrl) {
        currentApiUrl = await checkApiUrls();
      }
      
      // Set the baseURL for this request
      config.baseURL = currentApiUrl;
      
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Check if token is expired
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired, removing');
            await AsyncStorage.removeItem('userToken');
          } else {
            // Token is valid, add it to headers
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          await AsyncStorage.removeItem('userToken');
        }
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If the request failed due to network issues, try the other URL
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      console.log('Network error detected, trying alternative URL');
      
      // Switch to the other URL
      currentApiUrl = currentApiUrl === apiConfig.localApiUrl 
        ? apiConfig.publicApiUrl 
        : apiConfig.localApiUrl;
      
      // Retry the request with the new URL
      const originalRequest = error.config;
      originalRequest.baseURL = currentApiUrl;
      
      try {
        return await axios(originalRequest);
      } catch (retryError) {
        console.log('Retry with alternative URL also failed');
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error) => {
  if (!error.response) {
    // Network error or server not reachable
    return {
      error: true,
      status: 0,
      message: 'Cannot connect to server. Please check your internet connection.',
      originalError: error
    };
  }
  
  return {
    error: true,
    status: error.response.status,
    message: error.response.data?.error || 'An error occurred',
    originalError: error
  };
};

// API service methods
const apiService = {
  // Auth methods
  login: async (email, password) => {
    try {
      // Log the full URL being requested
      console.log('Login URL:', `${apiConfig.apiUrl}${apiConfig.endpoints.login}`);
      console.log('Login payload:', { email, password });
      
      const response = await apiService.retryRequest(
        () => apiClient.post(apiConfig.endpoints.login, { email, password }),
        3 // max retries
      );
      
      // Save the user ID from the response
      if (response.data && response.data.user && response.data.user._id) {
        await AsyncStorage.setItem('userId', response.data.user._id);
        console.log('User ID saved:', response.data.user._id);
      } else if (response.data && response.data._id) {
        await AsyncStorage.setItem('userId', response.data._id);
        console.log('User ID saved:', response.data._id);
      }
      
      return response;
    } catch (error) {
      console.error('Login error details:', error);
      throw handleApiError(error);
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Register payload:', userData);
      
      const response = await apiService.retryRequest(
        () => apiClient.post(apiConfig.endpoints.register, userData),
        3 // max retries
      );
      
      return response;
    } catch (error) {
      console.error('Register error details:', error);
      throw handleApiError(error);
    }
  },
  
  // Expose the URL checking function
  checkApiUrls: checkApiUrls,
  
  getUser: async () => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUser);
      
      // Save the user ID from the response
      if (response.data) {
        let userId;
        if (Array.isArray(response.data) && response.data.length > 0) {
          userId = response.data[0]._id;
        } else if (response.data._id) {
          userId = response.data._id;
        }
        
        if (userId) {
          await AsyncStorage.setItem('userId', userId);
          console.log('User ID saved from getUser:', userId);
        }
      }
      
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  updateUser: async (userData) => {
    try {
      return await apiClient.put(apiConfig.endpoints.updateUser, userData);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Session methods
  saveSession: async (sessionData) => {
    try {
      // Log the data being sent
      console.log('API Service - saveSession data:', sessionData);
      
      // Use apiClient instead of direct axios call to leverage the URL resolution
      const response = await apiClient.post(apiConfig.endpoints.saveSession, sessionData);
      return response;
    } catch (error) {
      console.error('API Service - saveSession error:', error);
      if (error.response) {
        console.error('API Service - Error response:', error.response.status, error.response.data);
      }
      throw handleApiError(error);
    }
  },
  
  getUserSessions: async (userId) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserSessions(userId));
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getUserTotalDistance: async (userId) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserTotalDistance(userId));
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getUserStats: async (userId, period = 'week') => {
    try {
      // Validate period
      const validPeriods = ['day', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        period = 'week'; // Default to week if invalid period
      }
      
      // Use the correct endpoint format based on the API config
      const endpoint = apiConfig.endpoints.getUserStats(userId, period);
      console.log('Fetching stats with endpoint:', endpoint);
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error(`Error fetching user stats for period ${period}:`, error);
      // Return a default response structure to prevent errors
      return { 
        data: { 
          totalDistance: 0,
          avgSpeed: 0,
          totalTime: 0
        } 
      };
    }
  },
  
  // Retry mechanism for API calls
  retryRequest: async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        lastError = error;
        
        // Only retry on network errors, not on 4xx status codes
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error; // Don't retry client errors
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next attempt (exponential backoff)
        delay *= 2;
      }
    }
    
    throw lastError; // All retries failed
  },
  
  // Add more API methods as needed
  checkEndpoints: async () => {
    const endpoints = [
      { name: 'Login', url: `${apiConfig.apiUrl}${apiConfig.endpoints.login}` },
      { name: 'Register', url: `${apiConfig.apiUrl}${apiConfig.endpoints.register}` },
      { name: 'Get User', url: `${apiConfig.apiUrl}${apiConfig.endpoints.getUser}` }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        // Try a HEAD request first to avoid data transfer
        await axios.head(endpoint.url, { timeout: 3000 });
        results.push({ ...endpoint, exists: true, error: null });
      } catch (error) {
        results.push({ 
          ...endpoint, 
          exists: error.response?.status !== 404, 
          error: error.message,
          status: error.response?.status 
        });
      }
    }
    
    return results;
  },
  
  // Goal methods
  saveGoal: async (goalData) => {
    try {
      console.log('API Service - Saving goal with data:', goalData);
      
      // Asegurarse de que los datos tienen el formato correcto
      const formattedGoalData = {
        distance: goalData.distance !== undefined ? Number(goalData.distance) : 0,
        speedAvg: goalData.speedAvg !== undefined ? Number(goalData.speedAvg) : null,
        time: goalData.time !== undefined ? Number(goalData.time) : null
      };
      
      const response = await apiClient.post(apiConfig.endpoints.saveGoal, formattedGoalData);
      console.log('API Service - Goal saved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('API Service - Error saving goal:', error);
      if (error.response) {
        console.error('API Service - Error response:', error.response.status, error.response.data);
      }
      throw handleApiError(error);
    }
  },
  
  getUserGoals: async () => {
    try {
      // First try to get userId from AsyncStorage
      let userId = await AsyncStorage.getItem('userId');
      
      // If not found, try to get it from the user token
      if (!userId) {
        console.log('User ID not found in AsyncStorage, trying to get from token');
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          try {
            const decoded = jwtDecode(token);
            userId = decoded.id || decoded._id || decoded.userId;
            
            if (userId) {
              // Save it for future use
              await AsyncStorage.setItem('userId', userId);
              console.log('User ID extracted from token and saved:', userId);
            }
          } catch (decodeError) {
            console.error('Error decoding token to get user ID:', decodeError);
          }
        }
      }
      
      if (!userId) {
        // If still not found, try to get it from the user API
        console.log('Trying to get user ID from user API');
        const userResponse = await apiClient.get(apiConfig.endpoints.getUser);
        
        if (userResponse.data) {
          if (Array.isArray(userResponse.data) && userResponse.data.length > 0) {
            userId = userResponse.data[0]._id;
          } else if (userResponse.data._id) {
            userId = userResponse.data._id;
          }
          
          if (userId) {
            await AsyncStorage.setItem('userId', userId);
            console.log('User ID from API saved:', userId);
          }
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      console.log('Getting goals for user ID:', userId);
      const response = await apiClient.get(`/api/usersgoals/getusergoals/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting user goals:', error);
      throw error;
    }
  },
  
  assignGoalToUser: async (goalId) => {
    try {
      console.log('API Service - Assigning goal to user, goalId:', goalId);
      
      // Obtener el token del usuario
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No se encontró token de usuario');
      }
      
      // Decodificar el token para obtener el ID del usuario
      // Nota: Esto asume que el token es un JWT con el ID del usuario
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Formato de token inválido');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload._id || payload.userId;
      
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario del token');
      }
      
      console.log('API Service - User ID extracted from token:', userId);
      
      // Hacer la solicitud para asignar la meta al usuario
      const response = await apiClient.post(apiConfig.endpoints.assignGoalToUser, {
        userId: userId,
        goalId: goalId
      });
      
      console.log('API Service - Goal assigned successfully:', response.data);
      return response;
    } catch (error) {
      console.error('API Service - Error assigning goal to user:', error);
      if (error.response) {
        console.error('API Service - Error response:', error.response.status, error.response.data);
      }
      throw handleApiError(error);
    }
  },
  
  updateUserGoal: async (goalId, newDistance) => {
    try {
      // Get user ID from token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
      
      return await apiClient.put(apiConfig.endpoints.updateUserGoal, {
        uid: userId,
        gid: goalId,
        newDistance
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  updateUserGoalProgress: async (userId, challengeId, distance, time) => {
    try {
      const response = await apiClient.post('/api/usersgoals/update-progress', {
        userId,
        challengeId,
        distance,
        time
      });
      return response;
    } catch (error) {
      console.error('Error updating user goal progress:', error);
      throw error;
    }
  },
};

export default apiService;
