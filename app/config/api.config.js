// Export the active configuration
export default {
  // Define specific endpoints
  endpoints: {
    // Auth endpoints
    login: '/users/login',
    register: '/users/signin',  
    getUsers: '/users/getusers',
    getUser: (uid) => `/users/getuser/${uid}`,
    updateUser: '/users/updateuser',
    
    // Session endpoints
    saveSession: '/sessions/savesession',
    getUserSessions: (userId) => `/sessions/getuserssessions/${userId}`,
    getUserTotalDistance: (userId) => `/sessions/getusertotaldistance/${userId}`,
    getUserStats: (userId, period) => `/sessions/getuserstats/${userId}/${period}`,
    
    // Goal endpoints
    saveGoal: '/goals/savegoal',
    getGoals: '/goals/getgoals',
    getGoalById: (goalId) => `/goals/getgoalbyid/${goalId}`,
    assignGoalToUser: '/goals/assigngoaltouser',
    
    // User Goals endpoints
    saveUserGoal: (userId, goalId) => `/usersgoals/saveusergoal/${userId}/${goalId}`,
    getUserGoals: (userId) => `/usersgoals/getusergoals/${userId}`,
    updateUserGoal: '/usersgoals/updateusergoal',
    updateGoalProgress: '/usersgoals/update-progress',
  }
};
