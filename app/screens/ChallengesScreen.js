import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { challengesStyles } from '../styles/challengesStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import FooterScreen from './FooterScreen';
import { iconMap } from '../content/challengesIconMap';
import Icon from 'react-native-vector-icons/Ionicons';


const ChallengesScreen = () => {
  const navigation = useNavigation();

  const [userGoals, setUserGoals] = useState([]);

  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [speedAvg, setSpeedAvg] = useState(0);

  const [uid, setUid] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserId() {
      const { userId } = await getUserTokenAndId(navigation);
      fetchUserGoal(userId)
      setUid(userId)
    }
    fetchUserId()
  }, []);

  async function fetchUserGoal(userId) {
    setLoading(true);
    try {
      // trae los desafíos del usuario con campos de estado para poder renderizar en el front status: 
      // "locked", "unlocked", "in_progress", "completed"
      // El usuario no podrá suscribirse a más de un desafío a la vez
      const response = await apiService.getGoalsWithStatus(userId);
      console.log('user goals:', response.data);

      if (response && response.data) setUserGoals(response.data);

      if (response.data.length > 0) {
        response.data.forEach(async ug => {

          if (ug.status === 'in_progress') {
            // trae el progreso en porcentaje, distancia total y velocidad. Tomando las sesiones desde 
            // la fecha de inicio de la meta hasta el momento
            const userGoalStats = await apiService.getUserGoalsStats(userId, ug._id);
            console.log(userGoalStats.data);

            if (userGoalStats && typeof userGoalStats === 'object') {
              setProgress(userGoalStats.data.progressPercent);
              setDistance(userGoalStats.data.totalDistance);
              setSpeedAvg(userGoalStats.data.avgSpeed);
              setTime(userGoalStats.data.totalTime);
            }

            if (userGoalStats.data.progressPercent >= 100) {
              const date = new Date().toISOString()
              //actualizo el userGoal como terminado añadiendo la fecha al campo Finnish que en principio está nulo
              const finnishChallenge = await apiService.updateFinnishUserGoal(userId, ug._id, date);
              console.log(finnishChallenge.data);
              if (finnishChallenge.data) {


                Alert.alert(
                  'Felicitaciones!',
                  'Completaste tu meta! Nuevos desafíos te esperan!',
                  [{ text: 'Aceptar', onPress: () => fetchUserGoal(uid) }]
                );

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

  const renderGoalItem = (goal) => {
    switch (goal.status) {
      case 'unlocked':
        return (
          <View key={goal._id} style={challengesStyles.goalContainer}>
            <View style={challengesStyles.iconContainer}>
              <Image
                source={iconMap[goal._id]}
                style={challengesStyles.challengeIcon}
                resizeMode="contain"
              />
            </View>

            <View style={challengesStyles.levelHeader}>
              <Text style={challengesStyles.levelTitle}>{goal.title}</Text>
              <Text style={challengesStyles.levelSubtitle}>{goal.description}</Text>
            </View>

            <TouchableOpacity style={challengesStyles.button} onPress={() => startChallenge(goal._id)} >
              <Text style={challengesStyles.buttonText}>Iniciar Desafío</Text>
            </TouchableOpacity>
          </View>
        );

      case 'in_progress':
        return (
          <View key={goal._id} style={challengesStyles.goalContainer}>

            <TouchableOpacity
              style={challengesStyles.deleteButton}
              onPress={() => confirmDeleteUserGoal(goal._id)}
            >
              <Text style={challengesStyles.deleteButtonText}>x</Text>
            </TouchableOpacity>

            <View style={challengesStyles.iconContainer}>
              <Image
                source={iconMap[goal._id]}
                style={[challengesStyles.challengeIcon, { tintColor: progress >= 100 ? '#FFD962' : '#467d2a' }]}
                resizeMode="contain"
              />
              <View style={challengesStyles.progressBadge}>
                <Text style={challengesStyles.progressBadgeText}>{Math.round(progress)}%</Text>
              </View>
            </View>

            <View style={challengesStyles.challengeContainer}>
              <Text style={challengesStyles.challengeTitle}>{goal.title}</Text>
              <Text style={challengesStyles.challengeDescription}>{goal.description}</Text>
              <Text style={challengesStyles.challengeNote}>{goal.note}</Text>

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
          <View key={goal._id} style={challengesStyles.goalContainer}>
            <View style={challengesStyles.iconContainer}>
              <Image
                source={iconMap[goal._id]}
                style={[challengesStyles.challengeIcon, { tintColor: progress >= 100 ? '#FFD962' : '#467d2a' }]}
                resizeMode="contain"
              />
              <View style={challengesStyles.progressBadge}>
                <Text style={challengesStyles.progressBadgeText}>{Math.round(progress)}%</Text>
              </View>
            </View>

            <View style={challengesStyles.levelHeader}>
              <Text style={challengesStyles.levelTitle}>{goal.title}</Text>
            </View>

            <TouchableOpacity style={challengesStyles.button}>
              <Text style={challengesStyles.buttonText}>Completado!</Text>
            </TouchableOpacity>
          </View>
        );

      case 'locked':
        return (
          <View key={goal._id} style={challengesStyles.goalContainer}>
            <View style={challengesStyles.iconContainer}>
              <Image
                source={iconMap[goal._id]}
                style={[challengesStyles.challengeIcon, { tintColor: 'rgb(124, 124, 124)' }]}
                resizeMode="contain"
              />
              <View style={challengesStyles.progressBadge}>
                <Icon name="lock-closed" size={20} color="black" />
              </View>
            </View>

            <View style={challengesStyles.levelHeader}>
              <Text style={challengesStyles.levelTitle}>{goal.title}</Text>
            </View>

            <TouchableOpacity style={challengesStyles.button}>
              <Text style={challengesStyles.buttonText}>Bloqueado</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };


  return (
    <ImageBackground source={require('../assets/fondo3.jpg')} style={challengesStyles.container} resizeMode="cover">
      <Text style={challengesStyles.title}>Desafíos</Text>

      <ScrollView contentContainerStyle={challengesStyles.scrollContainer}>
        {error ? <Text style={challengesStyles.errorText}>{error}</Text> : null}
        {userGoals.length > 0 && userGoals.map(renderGoalItem)}
      </ScrollView>

      <FooterScreen />

    </ImageBackground>
  );
};

export default ChallengesScreen;
