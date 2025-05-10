import { Platform } from 'react-native';

// Environment-specific API configuration
const ENV = {
  dev: {
    // Local development URL (Android Emulator)
    localUrl: 'http://10.0.2.2:5000',
    // Public URL (for standalone builds)
    publicUrl: 'http://181.87.233.45:5000',
  },
  staging: {
    localUrl: 'https://staging-api.generareco.com',
    publicUrl: 'https://staging-api.generareco.com',
  },
  prod: {
    localUrl: 'https://api.generareco.com',
    publicUrl: 'https://api.generareco.com',
  }
};

// Set the active environment
const getEnvironment = () => {
  // You can use environment variables or build flags to determine this
  // For now, we'll default to 'dev'
  return ENV.dev;
};

// Export the active configuration
export default {
  // Export both URLs so we can try local first, then fall back to public
  localApiUrl: getEnvironment().localUrl,
  publicApiUrl: getEnvironment().publicUrl,
  
  // Define specific endpoints
  endpoints: {
    // Auth endpoints
    login: '/api/users/login',
    register: '/api/users/signin',  
    getUser: '/api/users/getusers',
    updateUser: '/api/users/updateuser',
    
    // Session endpoints
    saveSession: '/api/sessions/savesession',
    getUserSessions: (userId) => `/api/sessions/getuserssessions/${userId}`,
    getUserTotalDistance: (userId) => `/api/sessions/getusertotaldistance/${userId}`,
    getUserStats: (userId, period) => `/api/sessions/getuserstats/${userId}/${period}`,
    
    // Goal endpoints
    saveGoal: '/api/goals/savegoal',
    getGoals: '/api/goals/getgoals',
    getGoalById: (goalId) => `/api/goals/getgoalbyid/${goalId}`,
    assignGoalToUser: '/api/goals/assigngoaltouser',
    
    // User Goals endpoints
    saveUserGoal: (userId, goalId) => `/api/usersgoals/saveusergoal/${userId}/${goalId}`,
    getUserGoals: (userId) => `/api/usersgoals/getusergoals/${userId}`,
    updateUserGoal: '/api/usersgoals/updateusergoal',
    updateGoalProgress: '/api/usersgoals/update-progress',
  }
};
