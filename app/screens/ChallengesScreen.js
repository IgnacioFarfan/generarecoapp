import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { challengesStyles } from '../styles/challengesStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import FooterScreen from './FooterScreen';
import Icon from 'react-native-vector-icons/Ionicons';


const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);// estado apr arefrescar al pantalla deslizando para abajo con el dedo

  const [userGoals, setUserGoals] = useState([]);

  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [speedAvg, setSpeedAvg] = useState(0);

  const [uid, setUid] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setRefreshing(true); // Iniciamos el indicador de refresco
    setError(null); // Limpiamos cualquier error previo

    try {
      const { userId } = await getUserTokenAndId(navigation);
      setUid(userId);
      fetchUserGoal(userId);
    } catch (err) {
      console.error("Error al cargar los datos:", err);
      setError("No se pudieron cargar los datos. Intenta de nuevo.");
    } finally {
      setRefreshing(false); // Detenemos el indicador de refresco SIEMPRE
    }
  }, [navigation]);

  useEffect(() => {
    loadData()
  }, [loadData]);

  async function fetchUserGoal(userId) {
    setLoading(true);
    try {
      // trae los desafíos del usuario con campos de estado para poder renderizar en el front status: 
      // "locked", "unlocked", "in_progress", "completed"
      // El usuario no podrá suscribirse a más de un desafío a la vez
      const response = await apiService.getGoalsLevelsMedals(userId);
      //console.log('user goals:', response.data);

      let goalsCompletedPositions = [];
      const userMedal = await apiService.getUserMedal(userId);

      response.data.forEach(userGoal => {
        if (userGoal.type === 'goal' && userGoal.data.status === 'completed') {
          goalsCompletedPositions.push(userGoal.data.position)
        }
      })

      // Ordenamos las posiciones completadas
      goalsCompletedPositions.sort((a, b) => a - b);

      // Set para evitar posiciones duplicadas
      const uniquePositions = new Set(goalsCompletedPositions);
      //console.log('metas completas set:', uniquePositions);

      // Calculamos cuántos bloques completos de 4 metas tiene
      let completedMedals = 0;
      let block = 0;

      while (true) {
        const start = block * 4 + 1; // posición inicial del bloque (1, 5, 9, ...)

        // Verificamos si el usuario completó TODAS las metas de este bloque
        const blockCompleted = Array.from({ length: 4 }, (_, i) => start + i).every(pos => uniquePositions.has(pos));

        if (blockCompleted) {
          completedMedals++; // puede obtener una nueva medalla
          block++;
        } else {
          break; // apenas un bloque no está completo, cortamos
        }
      }
      console.log('bloque de 4 metas completas:', block);
      console.log('medallas completas:', completedMedals);

      // Comparamos con la medalla actual
      const currentMedal = parseInt(userMedal.data.userMedal); // Por ejemplo, 1

      if (completedMedals > currentMedal) {
        const newMedal = completedMedals;
        console.log(`Otorgar nueva medalla: ${newMedal}`);

        // Actualizamos la nueva medalla al usuario
        await apiService.updateUserMedal(userId, newMedal);
        Alert.alert(
          'Felicidades!',
          'Ganaste una medalla!',
          [{ text: 'Aceptar', onPress: () => fetchUserGoal(userId) }]
        );
      }

      if (response && response.data) setUserGoals(response.data);

      if (response.data.length > 0) {
        response.data.forEach(async ug => {

          if (ug.type === 'goal') {
            if (ug.data.status === 'in_progress') {
              // trae el progreso en porcentaje, distancia total y velocidad. Tomando las sesiones desde 
              // la fecha de inicio de la meta hasta el momento
              const userGoalStats = await apiService.getUserGoalsStats(userId, ug.data._id);
              console.log('userGoals estadísticas:', userGoalStats.data);

              if (userGoalStats && typeof userGoalStats === 'object') {
                setProgress(userGoalStats.data.progressPercent);
                setDistance(userGoalStats.data.totalDistance);
                setSpeedAvg(userGoalStats.data.avgSpeed);
                setTime(userGoalStats.data.totalTime);
              }

              if (userGoalStats.data.progressPercent >= 100) {
                const date = new Date().toISOString()
                //actualizo el userGoal como terminado añadiendo la fecha al campo Finnish que en principio está nulo
                const finnishChallenge = await apiService.updateFinnishUserGoal(userId, ug.data._id, date);
                console.log('updated finnished challenge:', finnishChallenge.data);
                if (finnishChallenge.data) {
                  Alert.alert(
                    'Felicitaciones!',
                    'Completaste tu meta! Nuevos desafíos te esperan!',
                    [{ text: 'Aceptar', onPress: () => fetchUserGoal(userId) }]
                  );

                }
              }
            }

          }

        });
      }
    } catch (err) {
      console.error('Error fetching user goals:', err);
      setError('No se pudieron cargar los desafíos. Vuelvea intentarlo más tarde.');
    } finally {
      setLoading(false);
    }
  }

  const startChallenge = async (gid) => {
    try {
      setLoading(true);
      //retorna true si existe esa meta o false caso contrario. El usuario no debería tener más de una meta en curso.
      const userGoalExist = await apiService.checkUserGoalExist(uid, gid);

      if (userGoalExist.data) {
        Alert.alert(
          '¡Atención!',
          'Ya tienes un desafío en curso',
          [{ text: 'Aceptar' }]
        );
        return
      }

      const response = await apiService.saveUserGoal(uid, gid);

      if (response && response.data && response.data._id) {
        console.log('Meta guardada con éxito, ID:', response.data._id);

        Alert.alert(
          '¡Desafío iniciado!',
          'Has comenzado un nuevo desafío. ¡Buena suerte!',
          [{ text: 'Comenzar', onPress: () => handleStartChallenge() }]
        );
      }
    } catch (err) {
      console.error('Error starting challenge:', err);

      let errorMessage = 'No se pudo iniciar el desafío. Inténtalo de nuevo.';

      if (err.status === 500) {
        errorMessage = 'Error en el servidor. Por favor, inténtalo más tarde.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    fetchUserGoal(uid)
    navigation.navigate('Map')
  }

  const confirmDeleteUserGoal = async (gid) => {
    try {
      Alert.alert(
        '¡Atención!',
        'Seguro quieres eliminar tu desafío?',
        [
          { text: 'Aceptar', onPress: () => deleteUserGoal(gid) },
          { text: 'Cancelar' }
        ]
      );
    } catch (err) {
      console.error('Error fetching user goals:', err);
    }
  }

  const deleteUserGoal = async (gid) => {
    setLoading(true);
    try {
      // borra el desafío con el id del modelo Goals y el id de usuario para que le usuario pueda abandonar el desafío en cualquier momento
      const response = await apiService.deleteUserGoal(uid, gid);
      console.log('user goal deleted:', response.data);

      if (response && response.status === 200) fetchUserGoal(uid);

    } catch (err) {
      console.error('Error fetching user goals:', err);
      setError('No se pudieron cargar los desafíos');
    } finally {
      setLoading(false);
    }
  }

  const renderGoalItem = (item, index) => {
    switch (item.type) {
      case 'level':
        return (
          <View key={index} style={challengesStyles.goalContainer}>
            <View style={challengesStyles.levelHeader}>
              <Text style={challengesStyles.levelTitle}>{item.data.name}</Text>
              <Text style={challengesStyles.levelSubtitle}>{item.data.note}</Text>
            </View>
          </View>
        );

      case 'goal':
        switch (item.data.status) {
          case 'unlocked':
            return (
              <View key={item.data._id} style={challengesStyles.goalContainer}>
                <View style={challengesStyles.iconContainer}>
                  <Image
                    source={{ uri: item.data.icon }}
                    style={challengesStyles.challengeIcon}
                    resizeMode="contain"
                  />
                </View>

                <View style={challengesStyles.levelHeader}>
                  <Text style={challengesStyles.levelTitle}>{item.data.title}</Text>
                  <Text style={challengesStyles.levelSubtitle}>{item.data.description}</Text>
                </View>

                <TouchableOpacity style={challengesStyles.button} onPress={() => startChallenge(item.data._id)} >
                  <Text style={challengesStyles.buttonText}>Iniciar Desafío</Text>
                </TouchableOpacity>
              </View>
            );

          case 'in_progress':
            return (
              <View key={item.data._id} style={challengesStyles.goalContainer}>

                <TouchableOpacity
                  style={challengesStyles.deleteButton}
                  onPress={() => confirmDeleteUserGoal(item.data._id)}
                >
                  <Text style={challengesStyles.deleteButtonText}>x</Text>
                </TouchableOpacity>

                <View style={challengesStyles.iconContainer}>
                  <Image
                    source={{ uri: item.data.icon }}
                    style={[challengesStyles.challengeIcon, { tintColor: progress >= 100 ? '#FFD962' : '#467d2a' }]}
                    resizeMode="contain"
                  />
                  <View style={challengesStyles.progressBadge}>
                    <Text style={challengesStyles.progressBadgeText}>{Math.round(progress)}%</Text>
                  </View>
                </View>

                <View style={challengesStyles.challengeContainer}>
                  <Text style={challengesStyles.challengeTitle}>{item.data.title}</Text>
                  <Text style={challengesStyles.challengeDescription}>{item.data.description}</Text>
                  <Text style={challengesStyles.challengeNote}>{item.data.note}</Text>

                  <View style={challengesStyles.progressTextContainer}>
                    <View>
                      <Text style={challengesStyles.progressText}>Dist: {distance} kms</Text>
                      <Text style={challengesStyles.progressText}>Vel prom: {speedAvg.toFixed(2)} km/h</Text>
                    </View>
                    <View>
                      <Text style={challengesStyles.progressText}>Tiempo: {time} segs</Text>
                      <Text style={challengesStyles.progressText}>Completado: {progress}%</Text>
                    </View>
                  </View>

                </View>
                <TouchableOpacity style={challengesStyles.button}>
                  <Text style={challengesStyles.buttonText}>En progreso</Text>
                </TouchableOpacity>
              </View>
            );

          case 'completed':
            return (
              <View key={item.data._id} style={challengesStyles.goalContainer}>
                <View style={challengesStyles.iconContainer}>
                  <Image
                    source={{ uri: item.data.icon }}
                    style={[challengesStyles.challengeIcon, { tintColor: '#FFD962' }]}
                    resizeMode="contain"
                  />
                  <View style={challengesStyles.progressBadge}>
                    <Text style={challengesStyles.progressBadgeText}>100%</Text>
                  </View>
                </View>

                <View style={challengesStyles.levelHeader}>
                  <Text style={challengesStyles.levelTitle}>{item.data.title}</Text>
                </View>

                <TouchableOpacity style={challengesStyles.button}>
                  <Text style={challengesStyles.buttonText}>Completado!</Text>
                </TouchableOpacity>
              </View>
            );

          case 'locked':
            return (
              <View key={item.data._id} style={challengesStyles.goalContainer}>
                <View style={challengesStyles.iconContainer}>
                  <Image
                    source={{ uri: item.data.icon }}
                    style={[challengesStyles.challengeIcon, { tintColor: 'rgb(124, 124, 124)' }]}
                    resizeMode="contain"
                  />
                  <View style={challengesStyles.progressBadge}>
                    <Icon name="lock-closed" size={20} color="black" />
                  </View>
                </View>

                <View style={challengesStyles.levelHeader}>
                  <Text style={challengesStyles.levelTitle}>{item.data.title}</Text>
                </View>

                <TouchableOpacity style={challengesStyles.button}>
                  <Text style={challengesStyles.buttonText}>Bloqueado</Text>
                </TouchableOpacity>
              </View>
            );

          default:
            return null;
        }

      case 'medal':
        switch (item.data.medalStatus) {
          case true:
            return (
              <View key={index} style={challengesStyles.goalContainer}>
                <Image
                  source={{ uri: item.data.icon }}
                  style={challengesStyles.challengeIcon}
                  resizeMode="contain"
                />
                <Text style={challengesStyles.levelTitle}>Medalla: {item.data.name}</Text>
              </View>
            );

          case false:
            return (
              <View key={index} style={challengesStyles.goalContainer}>
                <Image
                  source={{ uri: item.data.icon }}
                  style={[challengesStyles.challengeIcon, { tintColor: 'rgb(124, 124, 124)' }]}
                  resizeMode="contain"
                />
                <Text style={challengesStyles.levelTitle}>{item.data.name}</Text>
                <Text style={challengesStyles.buttonText}>Medalla bloqueada</Text>
              </View>
            );

          default:
            return null;
        }

      default:
        return null;
    }

  };


  return (
    <ImageBackground source={require('../assets/fondo3.jpg')} style={challengesStyles.container} resizeMode="cover">
      <Text style={challengesStyles.title}>Desafíos</Text>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        contentContainerStyle={[challengesStyles.scrollContainer, challengesStyles.goalContainer]}>
        {error ? <Text style={challengesStyles.errorText}>{error}</Text> : null}

        {userGoals.length > 0 && userGoals.map(renderGoalItem)}

      </ScrollView>

      <FooterScreen />

    </ImageBackground>
  );
};

export default ChallengesScreen;
