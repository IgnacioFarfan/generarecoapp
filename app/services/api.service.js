import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api.config';
import { jwtDecode } from 'jwt-decode';
import { saveUserTokenAndId } from '../tools/saveUserTokenAndId'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "http://192.168.100.48:5000/api"
});

// Add request interceptor to include auth token and set the correct baseURL
apiClient.interceptors.request.use(
  async (config) => {
    try {
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
      console.log('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Server Error:', error.response.data);
    } else if (error.request) {
      console.log('No Response:', error.request);
    } else {
      console.log('Error:', error.message);
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
      message: 'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.',
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
      const response = await apiClient.post(apiConfig.endpoints.login, { email, password })
      if (response.data && response.data.id) {
        await saveUserTokenAndId(response.data.token, response.data.id)
        console.log('User ID saved:', response.data.id, 'user token saved:', response.data.token);
      }
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  signup: async (username, password, firstName, lastName, email) => {
    try {
      const response = await apiClient.post(apiConfig.endpoints.register, { username, password, firstName, lastName, email })

      if (response.data && response.data.id) {
        await saveUserTokenAndId(response.data.token, response.data.id)
        console.log('User ID saved:', response.data.id, 'user token saved:', response.data.token);
      }
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  googleSignup: async (googleId, firstName, lastName, email) => {
    try {
      const response = await apiClient.post(apiConfig.endpoints.googleSignup, { googleId, firstName, lastName, email })
      if (response.data && response.data._id) {
        await saveUserTokenAndId(response.data.token, response.data.id)
        console.log('User ID saved:', response.data.id, 'user token saved:', response.data.token);
      }
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUser: async (userId) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUser(userId));

      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserTotalDistance: async (userId) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUserTotalDistance(userId));
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserTotalTime: async (uid) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserTotalTime(uid));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserTotalVelocity: async (uid) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserTotalVelocity(uid));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserTotalSessions: async (uid) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserTotalSessions(uid));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserPeriodDataSpeedAvg: async (uid, period) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserPeriodDataSpeedAvg(uid, period));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserPeriodDataTime: async (uid, period) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserPeriodDataTime(uid, period));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserPeriodDataDistance: async (uid, period) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserPeriodDataDistance(uid, period));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserPeriodContributionData: async (uid, period) => {
    try {
      return await apiClient.get(apiConfig.endpoints.getUserPeriodContributionData(uid, period));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUsers: async () => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUsers);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserMedal: async (userId) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUserMedal(userId));
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateUserMedal: async (userId, newMedal) => {
    try {
      const response = await apiClient.put(apiConfig.endpoints.updateUserMedal(userId, newMedal));
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
      console.log('API Service - saveSession error:', error);
      if (error.response) {
        console.log('API Service - Error response:', error.response.status, error.response.data);
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

  getUserStatsByPeriod: async (userId, period = 'week') => {
    try {
      // Validate period
      const validPeriods = ['day', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        period = 'week'; // Default to week if invalid period
      }

      const response = await apiClient.get(apiConfig.endpoints.getUserStatsByPeriod(userId, period));
      return response;
    } catch (error) {
      console.log(`Error fetching user stats for period ${period}:`, error);
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

  saveUserGoal: async (uid, gid) => {
    try {
      const response = await apiClient.post(apiConfig.endpoints.saveUserGoal(uid, gid));
      return response;
    } catch (error) {
      console.log('API Service - Error saving goal:', error);
      throw handleApiError(error);
    }
  },

  getUserGoals: async (userId) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUserGoals(userId));
      return response;
    } catch (error) {
      console.log('Error getting user goals:', error);
      throw error;
    }
  },

  getGoalsLevelsMedals: async (uid) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getGoalsLevelsMedals(uid));
      return response;
    } catch (error) {
      console.log('Error getting user goals:', error);
      throw error;
    }
  },

  checkUserGoalExist: async (uid, gid) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.checkUserGoalExist(uid, gid));
      return response;
    } catch (error) {
      console.log('Error getting user goals:', error);
      throw error;
    }
  },
  getGoalsByUserLevel: async (userId) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getGoalsByUserLevel(userId));
      return response;
    } catch (error) {
      console.log('Error getting user goals:', error);
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
      console.log('API Service - Error assigning goal to user:', error);
      if (error.response) {
        console.log('API Service - Error response:', error.response.status, error.response.data);
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
      const response = await apiClient.post('/usersgoals/update-progress', {
        userId,
        challengeId,
        distance,
        time
      });
      return response;
    } catch (error) {
      console.log('Error updating user goal progress:', error);
      throw error;
    }
  },
  getGoals: async () => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getGoals());
      return response;
    } catch (error) {
      console.log('Error getting goals:', error);
      throw error;
    }
  },
  deleteUserGoal: async (uid, gid) => {
    try {
      const response = await apiClient.delete(apiConfig.endpoints.deleteUserGoal(uid, gid));
      return response;
    } catch (error) {
      console.log('Error getting user goals:', error);
      throw error;
    }
  },
  getUserGoalsStats: async (userId, ugid) => {
    try {
      const response = await apiClient.get(apiConfig.endpoints.getUserGoalsStats(userId, ugid));
      return response;
    } catch (error) {
      console.log('Error getting user goals stats:', error);
      throw error;
    }
  },
  updateFinnishUserGoal: async (uid, ugid, date) => {
    try {
      const response = await apiClient.put(apiConfig.endpoints.updateFinnishUserGoal(uid, ugid, date));
      return response;
    } catch (error) {
      console.log('Error updating user goal:', error);
      throw error;
    }
  },
  updateUserTotalKilometers: async (uid, distance) => {
    try {
      const response = await apiClient.put(apiConfig.endpoints.updateUserTotalKilometers(uid, distance));
      return response;
    } catch (error) {
      console.log('Error getting user total kilometers:', error);
      throw error;
    }
  },

  updateUserPassword: async (userData) => {
    try {
      const response = await apiClient.put(apiConfig.endpoints.updateUserPassword, userData);
      return response;
    } catch (error) {
      console.log('Error actualizando password:', error);
      throw error;
    }
  },

  checkAndUpgradeUserLevel: async (userId) => {
    try {
      const response = await apiClient.put(apiConfig.endpoints.checkAndUpgradeUserLevel(userId));
      return response;
    } catch (error) {
      console.log('Error getting user total kilometers:', error);
      throw error;
    }
  }
};

export default apiService;
