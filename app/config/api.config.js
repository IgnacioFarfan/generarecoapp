// Export the active configuration
export default {
  // Define specific endpoints
  endpoints: {
    // user endpoints
    login: '/users/login',
    register: '/users/signin',
    restorePass: '/users/forgot',
    googleSignup: '/users/gstrategy',
    getUsers: '/users/getusers',
    getUser: (uid) => `/users/getuser/${uid}`,
    deactivateUser: (uid) => `/users/deactivateuser/${uid}`,
    getUserTotalDistance: (userId) => `/users/getusertotaldistance/${userId}`,
    getUserMedal: (userId) => `/users/getusermedal/${userId}`,
    updateUserMedal: (userId, newMedal) => `/users/updateusermedal/${userId}/${newMedal}`,
    
    updateUserTotalKilometers: (uid, distance) => `/users/updateusertotaldistance/${uid}/${distance}`,
    updateUserPassword: `/users/updateuserpassword`,
    updateUser: '/users/updateuser',
    
    // Session endpoints
    saveSession: '/sessions/savesession',
    getUserSessions: (userId) => `/sessions/getuserssessions/${userId}`,
    getUserStatsByPeriod: (userId, period) => `/sessions/getuserstats/${userId}/${period}`,
    getUserTotalTime: (uid) => `/sessions/getusertotaltime/${uid}`,
    getUserTotalKmts: (uid) => `/sessions/getusertotalkmts/${uid}`,
    getUserTotalVelocity: (uid) => `/sessions/getusertotalvelocity/${uid}`,
    getUserTotalSessions: (uid) => `/sessions/getusertotalsessions/${uid}`,
    getUserPeriodDataSpeedAvg: (uid, period) => `/sessions/getuserdataspeedavg/${uid}/${period}`,
    getUserPeriodDataTime: (uid, period) => `/sessions/getuserdatatime/${uid}/${period}`,
    getUserPeriodDataDistance: (uid, period) => `/sessions/getuserdatadistance/${uid}/${period}`,
    getUserPeriodContributionData: (uid, period) => `/sessions/getuserdatacontribution/${uid}/${period}`,
    
    // Goal endpoints
    saveGoal: '/goals/savegoal',
    getGoals: '/goals/getgoals',
    getGoalById: (goalId) => `/goals/getgoalbyid/${goalId}`,
    assignGoalToUser: '/goals/assigngoaltouser',
    getGoalsByUserLevel: (userId) => `/goals/getgoalsbyuserlevel/${userId}`,
    checkAndUpgradeUserLevel: (userId) => `/goals/checkandupgradeuserlevel/${userId}`,
    
    // User Goals endpoints
    saveUserGoal: (userId, goalId) => `/usersgoals/saveusergoal/${userId}/${goalId}`,
    getUserGoals: (userId) => `/usersgoals/getusergoals/${userId}`,
    getGoalsLevelsMedals: (uid) => `/usersgoals/getgoalslevelsmedals/${uid}`,
    getUserMedalProgress: (uid) => `/usersgoals/getusermedalprogress/${uid}`,
    deleteUserGoal: (uid, gid) => `/usersgoals/deleteusergoal/${uid}/${gid}`,// _id del modelo Goals, no del modelo de userGoals
    getUserGoalsStats: (userId, ugid) => `/usersgoals/getusergoalstats/${userId}/${ugid}`,// _id del modelo Goals, no del modelo de userGoals
    updateFinnishUserGoal: (uid, ugid, date) => `/usersgoals/updatefinnishusergoal/${uid}/${ugid}/${date}`,// actualiza el userGoal del usuario colocando la fecha en el campo finnish. dando por finalizado el desafío
    checkUserGoalExist: (uid, gid) => `/usersgoals/checkusergoalexist/${uid}/${gid}`,
    updateUserGoal: '/usersgoals/updateusergoal',
    updateGoalProgress: '/usersgoals/update-progress',
  }
};
