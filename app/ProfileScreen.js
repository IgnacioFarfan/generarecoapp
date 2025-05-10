
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ImageBackground,
  Share,
  BackHandler,
  Image, // Add this import
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode'; // Correct import

// Import API service
import apiService from './services/api.service';

const screenWidth = Dimensions.get('window').width;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, age, weight, height, range, comingFromSettings } = route.params || {};

  const [kilometers, setKilometers] = useState(0);
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [activityData, setActivityData] = useState({
    week: [],
    month: [],
    year: [],
    total: [],
  });
  const [lastRuns, setLastRuns] = useState([]);
  const [selectedRange, setSelectedRange] = useState('week');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [lastRunsExpanded, setLastRunsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('tree'); // 'chart' or 'tree'

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent default back button behavior (quitting the app)
        // Instead, navigate to Map screen or show a confirmation dialog
        if (isProfileVisible) {
          navigation.navigate('Map');
        } else {
          // If in profile details view, go back to main profile view
          setIsProfileVisible(true);
        }
        return true; // Prevent default behavior
      };

      // Add back button listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Clean up the event listener when the component unmounts or loses focus
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isProfileVisible, navigation])
  );

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Get token from storage
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          navigation.navigate('Login');
          return;
        }
        
        setToken(storedToken);
        
        // Extract user ID from token
        try {
          const decoded = jwtDecode(storedToken); // Updated function call
          if (decoded && decoded.id) {
            setUserId(decoded.id);
          } else {
            console.log('Token decoded but no id found:', decoded);
          }
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, [navigation]);

  useEffect(() => {
    // Only fetch data if we have both token and userId
    if (token && userId) {
      fetchUserData();
    }
  }, [token, userId]);

  const fetchUserData = async () => {
    try {
      if (!userId) {
        console.log('Missing userId');
        return;
      }

      // Get user data using the API service
      const userResponse = await apiService.getUser();
      
      if (userResponse.data) {
        // Check if response is an array or single object
        if (Array.isArray(userResponse.data)) {
          // Find the user with matching ID in the array
          const currentUser = userResponse.data.find(user => user._id === userId);
          if (currentUser) {
            setUserData(currentUser);
          } else {
            console.log('User not found in response array');
          }
        } else {
          // If it's a single object, use it directly
          setUserData(userResponse.data);
        }
      }
      
      // Get total distance
      const distanceResponse = await apiService.getUserTotalDistance(userId);
      
      if (distanceResponse.data && distanceResponse.data.userTotalDistance) {
        setKilometers(distanceResponse.data.userTotalDistance);
      }
      
      // Get user stats for different periods
      const periods = ['day', 'week', 'month', 'year'];
      const activityStats = {
        day: [0],
        week: [0],
        month: [0],
        year: [0],
        total: [kilometers || 0],
      };

      for (const period of periods) {
        try {
          const statsResponse = await apiService.getUserStats(userId, period);
          
          if (statsResponse.data) {
            // Handle the response format from the backend
            if (statsResponse.data.totalDistance !== undefined) {
              activityStats[period] = [statsResponse.data.totalDistance];
            }
          }
        } catch (error) {
          console.error(`Error fetching stats for period ${period}:`, error);
        }
      }
      
      console.log('Activity stats:', activityStats);
      setActivityData(activityStats);
      
      // Get recent sessions
      try {
        const sessionsResponse = await apiService.getUserSessions(userId);
        
        if (sessionsResponse.data) {
          const sessionsArray = Array.isArray(sessionsResponse.data) ? 
                              sessionsResponse.data : 
                              [sessionsResponse.data];
          
          setLastRuns(sessionsArray.slice(-3).reverse());
        }
      } catch (sessionError) {
        console.error('Error fetching sessions:', sessionError);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data from API:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (comingFromSettings) {
      Alert.alert(
        'Con gran alegría',
        'Te damos la bienvenida a nuestra comunidad de deportistas y ambientalistas apasionados...',
      );
    }
  }, [comingFromSettings, kilometers]);

  const handleProfilePress = () => {
    setIsProfileVisible(false);
  };

  const handleBackPress = () => {
    setIsProfileVisible(true);
  };

  const handleDone = () => {
    navigation.navigate('Map');
  };

  const handleChallenges = () => {
    navigation.navigate('Challenges', { kilometers });
  };

  const handleShare = async () => {
    try {
      const message = `https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox ¡Hola! Estoy usando la app de Generar ECO. ¡Únete a mí en esta aventura!`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el mensaje.');
    }
  };

  const handleRangeChange = (range) => {
    // Only update the selectedRange state
    setSelectedRange(range);
    
    // Don't fetch any new data or update any other state
    // This will prevent the last runs from being affected
  };

  const toggleLastRuns = () => {
    setLastRunsExpanded(!lastRunsExpanded);
  };

  // Create a memoized key extractor function
  const keyExtractor = useCallback((item, index) => 
    item._id || item.date || `run-${index}`, []);

  // Create a memoized render item function
  const renderRunItem = useCallback(({ item }) => (
    <View style={styles.runItem}>
      <Text style={styles.runText}>
        Fecha: {moment(item.date || item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
      </Text>
      <Text style={styles.runText}>Kilómetros: {item.kilometers || item.distance} km</Text>
      {item.speedAvg && (
        <Text style={styles.runText}>Velocidad: {item.speedAvg.toFixed(2)} km/h</Text>
      )}
    </View>
  ), []); // Empty dependency array means this function won't change

  // Create a memoized chart data function to prevent unnecessary recalculations
  const getChartData = useCallback(() => {
    // Default data if nothing is selected
    const defaultData = [0, 0, 0, 0];
    
    // Return the appropriate data based on the selected range
    switch (selectedRange) {
      case 'week':
        return [
          activityData.week[0] || 0,
          activityData.month[0] || 0,
          activityData.year[0] || 0,
          activityData.total[0] || 0,
        ];
      case 'month':
        return [
          activityData.month[0] || 0,
          activityData.week[0] || 0,
          activityData.year[0] || 0,
          activityData.total[0] || 0,
        ];
      case 'year':
        return [
          activityData.year[0] || 0,
          activityData.week[0] || 0,
          activityData.month[0] || 0,
          activityData.total[0] || 0,
        ];
      case 'total':
        return [
          activityData.total[0] || 0,
          activityData.week[0] || 0,
          activityData.month[0] || 0,
          activityData.year[0] || 0,
        ];
      default:
        return defaultData;
    }
  }, [selectedRange, activityData]);

  // Add this function to determine which tree image to show based on kilometers
  const getTreeImage = () => {
    const percentage = Math.min(Math.floor((kilometers / 100) * 10), 10);
    
    switch (percentage) {
      case 0: return require('./assets/tree/progreso Árbol.png');
      case 1: return require('./assets/tree/progreso Árbol 1.png');
      case 2: return require('./assets/tree/progreso Árbol 2.png');
      case 3: return require('./assets/tree/progreso Árbol 3.png');
      case 4: return require('./assets/tree/progreso Árbol 4.png');
      case 5: return require('./assets/tree/progreso Árbol 5.png');
      case 6: return require('./assets/tree/progreso Árbol 6.png');
      case 7: return require('./assets/tree/progreso Árbol 7.png');
      case 8: return require('./assets/tree/progreso Árbol 8.png');
      case 9: return require('./assets/tree/progreso Árbol 9.png');
      case 10: return require('./assets/tree/progreso Árbol 10.png');
      default: return require('./assets/tree/progreso Árbol.png');
    }
  };

  // Add this function near your other handler functions
  const handleLogout = async () => {
    try {
      // Clear the stored token
      await AsyncStorage.removeItem('userToken');
      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  return (
    <ImageBackground
      source={isProfileVisible ? require('./assets/fondo3.jpg') : require('./assets/fondo4.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.shareIconContainer} onPress={handleShare}>
        <Icon name="share-social" size={30} color="white" />
      </TouchableOpacity>

      {isProfileVisible ? (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'chart' ? styles.activeTab : null]} 
              onPress={() => setActiveTab('chart')}
            >
              <Text style={[styles.tabText, activeTab === 'chart' ? styles.activeTabText : null]}>Gráfico</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tree' ? styles.activeTab : null]} 
              onPress={() => setActiveTab('tree')}
            >
              <Text style={[styles.tabText, activeTab === 'tree' ? styles.activeTabText : null]}>Progreso</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'chart' ? (
            <>
              <Text style={styles.chartTitle}>Nivel de Actividad Acumulada</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: ['', '', '', ''],
                    datasets: [
                      {
                        data: getChartData(),
                        color: (opacity = 1) => `rgba(70, 125, 42, ${opacity})`,
                        strokeWidth: 2,
                      },
                    ],
                  }}
                  width={screenWidth - 102}
                  height={220}
                  yAxisLabel=""
                  chartConfig={{
                    backgroundColor: 'white',
                    backgroundGradientFrom: 'white',
                    backgroundGradientTo: 'white',
                    decimalScale: 2,
                    color: (opacity = 1) => `rgba(70, 125, 42, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(70, 125, 42, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#467d2a',
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </View>

              <View style={styles.rangeButtons}>
                <TouchableOpacity
                  onPress={() => handleRangeChange('week')}
                  style={[
                    styles.rangeButton,
                    selectedRange === 'week' ? styles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    selectedRange === 'week' ? styles.activeButtonText : null
                  ]}>Semana</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('month')}
                  style={[
                    styles.rangeButton,
                    selectedRange === 'month' ? styles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    selectedRange === 'month' ? styles.activeButtonText : null
                  ]}>Mes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('year')}
                  style={[
                    styles.rangeButton,
                    selectedRange === 'year' ? styles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    selectedRange === 'year' ? styles.activeButtonText : null
                  ]}>Año</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('total')}
                  style={[
                    styles.rangeButton,
                    selectedRange === 'total' ? styles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    selectedRange === 'total' ? styles.activeButtonText : null
                  ]}>Total</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.treeContainer}>
              <Text style={styles.chartTitle}>Tu Progreso</Text>
              <Image 
                source={getTreeImage()} 
                style={styles.treeImage} 
                resizeMode="contain" 
              />
              <Text style={styles.treeProgressText}>
                {kilometers.toFixed(2)} / 100 km ({Math.min(Math.floor((kilometers / 100) * 100), 100)}%)
              </Text>
              <Text style={styles.treeDescription}>
                ¡Tu actividad está ayudando a que este árbol crezca! Completa 100 km para verlo en su máximo esplendor.
              </Text>
            </View>
          )}

          <View style={styles.lastRunsContainer}>
            <TouchableOpacity onPress={toggleLastRuns} style={styles.lastRunsHeader}>
              <Text style={styles.lastRunsTitle}>Últimos Entrenamientos</Text>
              <Icon 
                name={lastRunsExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            {/* Always render the FlatList but conditionally show/hide it */}
            <View style={lastRunsExpanded ? styles.visible : styles.hidden}>
              <FlatList
                data={lastRuns}
                renderItem={renderRunItem}
                keyExtractor={keyExtractor}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Icon name="play" size={30} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.profileTitle}>Perfil de usuario</Text>
          <View style={styles.profileInfoContainer}>
            <Text style={styles.info}>Nombre: {userData.firstName || name}</Text>
            <Text style={styles.info}>Edad: {userData.age || age}</Text>
            <Text style={styles.info}>Peso: {userData.weight || weight} kg</Text>
            <Text style={styles.info}>Altura: {userData.height || height} cm</Text>
            <Text style={styles.info}>Kilómetros recorridos: {kilometers.toFixed(2)} km</Text>
            <Text style={styles.info}>Rango: {userData.range || range}</Text>
            <Text style={styles.info}>Experiencia: {userData.experience || 'Principiante'}</Text>
            
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-back" size={30} color="black" />
              <Text style={styles.backButtonText}>Regresar</Text>
            </TouchableOpacity>
            
            {/* Logout button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="log-out" size={30} color="white" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={handleProfilePress}>
          <Icon name="person-circle" size={30} color="white" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleChallenges}>
          <Icon name="trophy" size={30} color="white" />
          <Text style={styles.navText}>Desafíos</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  shareIconContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 2,
  },
  profileTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  profileInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  info: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#467d2a',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',  // Changed to black
    fontSize: 18,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 0,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    width: '80%',
  },
  chartTitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20,
  },
  rangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  rangeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',  // Added white background
    borderRadius: 20,
    marginHorizontal: 2,      // Added small margin between buttons
  },
  activeRangeButton: {
    backgroundColor: '#467d2a',
  },
  activeButtonText: {
    color: 'white',
  },
  lastRunsContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#467d2a',
    width: '80%',
    minHeight: 40, // Add minimum height so it doesn't collapse completely
  },
  lastRunsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  lastRunsTitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  runItem: {
    backgroundColor: '#467d2a',
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  runText: {
    color: 'white',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'black',
    marginLeft: 5,
  },
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    width: '80%',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#467d2a',
  },
  tabText: {
    color: 'white',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  treeContainer: {
    width: '80%',
    backgroundColor: 'transparent', // Changed from rgba(255, 255, 255, 0.8) to transparent
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  treeImage: {
    width: 250,
    height: 250,
    marginVertical: 10,
  },
  treeProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Changed from #467d2a to white for better visibility on transparent background
    marginTop: 10,
  },
  treeDescription: {
    textAlign: 'center',
    marginTop: 10,
    color: 'white', // Changed from #555 to white for better visibility on transparent background
    fontSize: 14,
    paddingHorizontal: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
