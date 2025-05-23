import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { challengeLevels } from '../content/challengesLevels';
import { challengesStyles } from '../styles/challengesStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const ChallengesScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [userGoals, setUserGoals] = useState([]);
  const [kilometers, setKilometers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  useEffect(() => {
    fetchUserGoals();
    loadKilometers();
    loadCompletedChallenges();
  }, []);

  const fetchUserGoals = async () => {
    try {
      setLoading(true);

      const { userId } = await getUserTokenAndId(navigation);

      const response = await apiService.getUserGoals(userId);
      if (response && response.data && response.data.data) {
        setUserGoals(response.data.data);

        // Check for completed challenges
        const completed = [];
        response.data.data.forEach(userGoal => {
          if (userGoal.completed || userGoal.progress >= 100) {
            // Extract challenge ID from goal identifier
            if (userGoal.goal && userGoal.goal.identifier) {
              completed.push(userGoal.goal.identifier);
            }
          }
        });

        setCompletedChallenges(completed);
        await AsyncStorage.setItem('completedChallenges', JSON.stringify(completed));
      }
    } catch (err) {
      console.error('Error fetching user goals:', err);
      setError('No se pudieron cargar los desafíos');
    } finally {
      setLoading(false);
    }
  };

  const loadKilometers = async () => {
    try {
      const storedKilometers = await AsyncStorage.getItem('kilometers');
      if (storedKilometers) {
        setKilometers(parseInt(storedKilometers, 10) || 0);
      }
    } catch (err) {
      console.error('Error loading kilometers:', err);
    }
  };

  const loadCompletedChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem('completedChallenges');
      if (stored) {
        setCompletedChallenges(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading completed challenges:', err);
    }
  };

  const startChallenge = async (challenge) => {
    try {
      setLoading(true);

      // Crear un objeto de meta con valores predeterminados para evitar nulos
      const goalData = {
        // Asegurarse de que distance siempre tenga un valor positivo
        distance: challenge.goal.distance || 1, // Valor mínimo de 1 si no hay distancia
        speedAvg: challenge.goal.speedAvg || null,
        time: challenge.goal.time || null,
        challengeId: challenge.id // Store the challenge ID
      };

      // Guardar la meta en el servidor
      const response = await apiService.saveGoal(goalData);

      if (response && response.data && response.data._id) {
        console.log('Meta guardada con éxito, ID:', response.data._id);

        // Asociar la meta con el usuario
        const assignResponse = await apiService.assignGoalToUser(response.data._id);
        console.log('Meta asignada al usuario:', assignResponse.data);

        // Actualizar estado local
        setSelectedChallenge(challenge.id);
        await AsyncStorage.setItem('selectedChallenge', challenge.id);

        Alert.alert(
          '¡Desafío iniciado!',
          'Has comenzado un nuevo desafío. ¡Buena suerte!',
          [{ text: 'Comenzar', onPress: () => navigation.navigate('Map') }]
        );
      } else {
        throw new Error('No se recibió un ID de meta válido del servidor');
      }
    } catch (err) {
      console.error('Error starting challenge:', err);

      // Mostrar mensaje de error más específico
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

  const getProgress = (challenge) => {
    // Find if user has this goal
    const userGoal = userGoals.find(ug =>
      ug.goal && ug.goal.identifier === challenge.id
    );

    if (!userGoal) return 0;

    // Use the progress calculated by the backend
    return userGoal.progress || 0;
  };

  const getCurrentChallenge = () => {
    const challenges = challengeLevels[activeLevel].challenges;

    // If no challenges completed, return the first one
    if (completedChallenges.length === 0) {
      return challenges[0];
    }

    // Find the first challenge that isn't completed
    for (let i = 0; i < challenges.length; i++) {
      if (!completedChallenges.includes(challenges[i].id)) {
        return challenges[i];
      }
    }

    // If all challenges are completed, return the last one
    return challenges[challenges.length - 1];
  };

  // Navigation handlers
    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleMapPress = () => {
        navigation.navigate('Map');
    };

  const renderCurrentChallenge = () => {
    const challenge = getCurrentChallenge();
    const progress = getProgress(challenge);
    const isSelected = selectedChallenge === challenge.id;
    const isCompleted = completedChallenges.includes(challenge.id);

    return (
      <View style={challengesStyles.currentChallengeContainer}>
        <View style={challengesStyles.iconContainer}>
          <Image
            source={challenge.icon}
            style={[
              challengesStyles.challengeIcon,
              { tintColor: progress >= 100 ? '#FFD962' : '#467d2a' }
            ]}
            resizeMode="contain"
          />

          <View style={challengesStyles.progressBadge}>
            <Text style={challengesStyles.progressBadgeText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <View style={challengesStyles.challengeContainer}>
          <Text style={challengesStyles.challengeTitle}>{challenge.title}</Text>
          <Text style={challengesStyles.challengeDescription}>{challenge.description}</Text>
          <Text style={challengesStyles.challengeNote}>{challenge.note}</Text>

          {challenge.medal && (
            <Text style={challengesStyles.medalText}>Medalla: {challenge.medal}</Text>
          )}

          <Text style={challengesStyles.progressText}>{Math.round(progress)}% completado</Text>

          {isCompleted ? (
            <View style={challengesStyles.completedBadge}>
              <Text style={challengesStyles.completedText}>¡Completado!</Text>
            </View>
          ) : !isSelected ? (
            <TouchableOpacity
              style={challengesStyles.button}
              onPress={() => startChallenge(challenge)}
            >
              <Text style={challengesStyles.buttonText}>Iniciar Desafío</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={challengesStyles.button}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={challengesStyles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../assets/fondo3.jpg')} style={challengesStyles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={challengesStyles.scrollContainer}>
        <Text style={challengesStyles.title}>Desafíos</Text>
        {error ? <Text style={challengesStyles.errorText}>{error}</Text> : null}

        <View style={challengesStyles.levelSelector}>
          <TouchableOpacity
            style={[
              challengesStyles.levelButton,
              activeLevel === 'beginner' && challengesStyles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('beginner')}
          >
            <Text
              style={[
                challengesStyles.levelButtonText,
                activeLevel === 'beginner' && challengesStyles.levelButtonTextSelected,
              ]}
            >
              Principiante
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              challengesStyles.levelButton,
              activeLevel === 'intermediate' && challengesStyles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('intermediate')}
          >
            <Text
              style={[
                challengesStyles.levelButtonText,
                activeLevel === 'intermediate' && challengesStyles.levelButtonTextSelected,
              ]}
            >
              Intermedio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              challengesStyles.levelButton,
              activeLevel === 'advanced' && challengesStyles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('advanced')}
          >
            <Text
              style={[
                challengesStyles.levelButtonText,
                activeLevel === 'advanced' && challengesStyles.levelButtonTextSelected,
              ]}
            >
              Avanzado
            </Text>
          </TouchableOpacity>
        </View>

        <View style={challengesStyles.levelHeader}>
          <Text style={challengesStyles.levelTitle}>{challengeLevels[activeLevel].title}</Text>
          <Text style={challengesStyles.levelSubtitle}>{challengeLevels[activeLevel].subtitle}</Text>
        </View>

        {renderCurrentChallenge()}

        <View style={challengesStyles.progressIndicator}>
          {challengeLevels[activeLevel].challenges.map((challenge, index) => (
            <View
              key={challenge.id}
              style={[
                challengesStyles.progressDot,
                completedChallenges.includes(challenge.id) && challengesStyles.progressDotCompleted,
                getCurrentChallenge().id === challenge.id && challengesStyles.progressDotCurrent
              ]}
            />
          ))}
        </View>

        <View style={challengesStyles.bottomNav}>
          <TouchableOpacity style={challengesStyles.navItem} onPress={handleProfilePress}>
            <Icon name="person-circle" size={30} color="#FFFFFF" />
            <Text style={challengesStyles.navText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={challengesStyles.navItem} onPress={handleMapPress}>
            <Icon name="map" size={30} color="#FFFFFF" />
            <Text style={challengesStyles.navText}>Mapa</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
};

export default ChallengesScreen;
