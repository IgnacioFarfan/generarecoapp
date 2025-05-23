
import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, ImageBackground, Share, BackHandler, Image } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import apiService from '../services/api.service';
import { profileStyles } from '../styles/profileStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const screenWidth = Dimensions.get('window').width;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, age, weight, height, range, comingFromSettings } = route.params || {};

  const [kilometers, setKilometers] = useState(0);
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [activityData, setActivityData] = useState({ week: [], month: [], year: [], total: [], });
  const [lastRuns, setLastRuns] = useState([]);
  const [selectedRange, setSelectedRange] = useState('week');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
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
    async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            setUserId(userId)
            fetchUserData(userId);
        }
        getUserData();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      // Get user data using the API service      
      const userResponse = await apiService.getUser(uid);

      if (userResponse.data) {
        setUserData(userResponse.data);
      }

      // Get total distance
      const distanceResponse = await apiService.getUserTotalDistance(uid);


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
          const statsResponse = await apiService.getUserStats(uid, period);

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
        const sessionsResponse = await apiService.getUserSessions(uid);

        if (sessionsResponse.data) {
          // Ensure we have an array of sessions
          const sessionsArray = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [sessionsResponse.data];

          console.log('Sessions array:', sessionsArray);

          // Sessions are already sorted newest first from the backend
          // Just take the first 3 (most recent)
          const recentSessions = sessionsArray.slice(0, 3);

          console.log('Recent sessions to display:', recentSessions);

          setLastRuns(recentSessions);
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
  const renderRunItem = useCallback(({ item }) => {
    console.log('Rendering session item:', JSON.stringify(item));

    // Format the date - the sessionDate is definitely in the data
    let formattedDate = 'N/A';
    try {
      if (item.sessionDate) {
        formattedDate = moment(new Date(item.sessionDate)).format('YYYY-MM-DD HH:mm');
        console.log('Formatted date:', formattedDate, 'from:', item.sessionDate);
      }
    } catch (e) {
      console.error('Error formatting date:', e, 'for date value:', item.sessionDate);
    }

    // Format distance and speed
    const distance = parseFloat(item.distance) || 0;
    const speed = parseFloat(item.speedAvg) || 0;

    return (
      <View style={profileStyles.runItem}>
        <Text style={profileStyles.runText}>
          Fecha: {formattedDate}
        </Text>
        <Text style={profileStyles.runText}>
          Kilómetros: {distance.toFixed(2)} km
        </Text>
        <Text style={profileStyles.runText}>
          Velocidad: {speed.toFixed(2)} km/h
        </Text>
      </View>
    );
  }, []);


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
      case 0: return require('../assets/tree/progreso Árbol.png');
      case 1: return require('../assets/tree/progreso Árbol 1.png');
      case 2: return require('../assets/tree/progreso Árbol 2.png');
      case 3: return require('../assets/tree/progreso Árbol 3.png');
      case 4: return require('../assets/tree/progreso Árbol 4.png');
      case 5: return require('../assets/tree/progreso Árbol 5.png');
      case 6: return require('../assets/tree/progreso Árbol 6.png');
      case 7: return require('../assets/tree/progreso Árbol 7.png');
      case 8: return require('../assets/tree/progreso Árbol 8.png');
      case 9: return require('../assets/tree/progreso Árbol 9.png');
      case 10: return require('../assets/tree/progreso Árbol 10.png');
      default: return require('../assets/tree/progreso Árbol.png');
    }
  };

  // Add this function near your other handler functions
  const handleLogout = async () => {
    try {
      // Clear the stored token and ID
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
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
      source={isProfileVisible ? require('../assets/fondo3.jpg') : require('../assets/fondo4.jpg')}
      style={profileStyles.container}
      resizeMode="cover"
    >
      <TouchableOpacity style={profileStyles.shareIconContainer} onPress={handleShare}>
        <Icon name="share-social" size={30} color="white" />
      </TouchableOpacity>

      {isProfileVisible ? (
        <>
          <View style={profileStyles.tabContainer}>
            <TouchableOpacity
              style={[profileStyles.tab, activeTab === 'chart' ? profileStyles.activeTab : null]}
              onPress={() => setActiveTab('chart')}
            >
              <Text style={[profileStyles.tabText, activeTab === 'chart' ? profileStyles.activeTabText : null]}>Gráfico</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[profileStyles.tab, activeTab === 'tree' ? profileStyles.activeTab : null]}
              onPress={() => setActiveTab('tree')}
            >
              <Text style={[profileStyles.tabText, activeTab === 'tree' ? profileStyles.activeTabText : null]}>Progreso</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'chart' ? (
            <>
              <Text style={profileStyles.chartTitle}>Nivel de Actividad Acumulada</Text>
              <View style={profileStyles.chartContainer}>
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

              <View style={profileStyles.rangeButtons}>
                <TouchableOpacity
                  onPress={() => handleRangeChange('week')}
                  style={[
                    profileStyles.rangeButton,
                    selectedRange === 'week' ? profileStyles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    profileStyles.buttonText,
                    selectedRange === 'week' ? profileStyles.activeButtonText : null
                  ]}>Semana</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('month')}
                  style={[
                    profileStyles.rangeButton,
                    selectedRange === 'month' ? profileStyles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    profileStyles.buttonText,
                    selectedRange === 'month' ? profileStyles.activeButtonText : null
                  ]}>Mes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('year')}
                  style={[
                    profileStyles.rangeButton,
                    selectedRange === 'year' ? profileStyles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    profileStyles.buttonText,
                    selectedRange === 'year' ? profileStyles.activeButtonText : null
                  ]}>Año</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRangeChange('total')}
                  style={[
                    profileStyles.rangeButton,
                    selectedRange === 'total' ? profileStyles.activeRangeButton : null
                  ]}
                >
                  <Text style={[
                    profileStyles.buttonText,
                    selectedRange === 'total' ? profileStyles.activeButtonText : null
                  ]}>Total</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={profileStyles.treeContainer}>
              <Text style={profileStyles.chartTitle}>Tu Progreso</Text>
              <Image
                source={getTreeImage()}
                style={profileStyles.treeImage}
                resizeMode="contain"
              />
              <Text style={profileStyles.treeProgressText}>
                {kilometers.toFixed(2)} / 100 km ({Math.min(Math.floor((kilometers / 100) * 100), 100)}%)
              </Text>
              <Text style={profileStyles.treeDescription}>
                ¡Tu actividad está ayudando a que este árbol crezca! Completa 100 km para verlo en su máximo esplendor.
              </Text>
            </View>
          )}

          <View style={profileStyles.lastRunsContainer}>
            <TouchableOpacity onPress={toggleLastRuns} style={profileStyles.lastRunsHeader}>
              <Text style={profileStyles.lastRunsTitle}>Últimos Entrenamientos</Text>
              <Icon
                name={lastRunsExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            {/* Always render the FlatList but conditionally show/hide it */}
            <View style={lastRunsExpanded ? profileStyles.visible : profileStyles.hidden}>
              <FlatList
                data={lastRuns}
                renderItem={renderRunItem}
                keyExtractor={keyExtractor}
              />
            </View>
          </View>

          <TouchableOpacity style={profileStyles.button} onPress={handleDone}>
            <Icon name="play" size={30} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={profileStyles.profileTitle}>Perfil de usuario</Text>
          <View style={profileStyles.profileInfoContainer}>
            <Text style={profileStyles.info}>Nombre: {userData.firstName || name}</Text>
            <Text style={profileStyles.info}>Edad: {userData.age || age}</Text>
            <Text style={profileStyles.info}>Peso: {userData.weight || weight} kg</Text>
            <Text style={profileStyles.info}>Altura: {userData.height || height} mts</Text>
            <Text style={profileStyles.info}>Kilómetros recorridos: {kilometers.toFixed(2)} km</Text>
            <Text style={profileStyles.info}>Rango: {userData.range || range}</Text>

            {/* Back button */}
            <TouchableOpacity style={profileStyles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-back" size={30} color="black" />
              <Text style={profileStyles.backButtonText}>Regresar</Text>
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity style={profileStyles.logoutButton} onPress={handleLogout}>
              <Icon name="log-out" size={30} color="white" />
              <Text style={profileStyles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={profileStyles.bottomNav}>
        <TouchableOpacity style={profileStyles.navItem} onPress={handleProfilePress}>
          <Icon name="person-circle" size={30} color="white" />
          <Text style={profileStyles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.navItem} onPress={handleChallenges}>
          <Icon name="trophy" size={30} color="white" />
          <Text style={profileStyles.navText}>Desafíos</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default ProfileScreen;
