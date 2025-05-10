import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from './services/api.service';

const ChallengesScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [userGoals, setUserGoals] = useState([]);
  const [kilometers, setKilometers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const challengeLevels = {
    beginner: {
      title: 'Nivel Semilla (Principiante)',
      subtitle: 'Cada paso echa raíces',
      challenges: [
        {
          id: 'beginner-1',
          title: '1 Desafío de Bienvenida – "Primer Brote"',
          description: 'Completa una sesión de 10 minutos corriendo o caminando.',
          note: 'Todo gran árbol empieza con una pequeña raíz. Da tu primer paso y empieza a crecer.',
          goal: { time: 10 },
          icon: require('./assets/Iconos/icono primer brote.png')
        },
        {
          id: 'beginner-2',
          title: '2 Desafío por Distancia "Senderos Verdes"',
          description: 'Corre 15-25 km en una semana (ritmo menor a 7 min/km).',
          note: 'Cada paso que das deja huella en el planeta. Aumenta tu resistencia y ayuda a reforestar más áreas con este desafío.',
          goal: { distance: 15, speedAvg: 7 },
          icon: require('./assets/Iconos/icono blanco senderos verdes.png')
        },
        {
          id: 'beginner-3',
          title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
          description: 'Acumula 15 km en una semana.',
          note: 'Mantente en movimiento, mejora tu resistencia y contribuye al planeta al mismo tiempo.',
          goal: { distance: 15 },
          icon: require('./assets/Iconos/icono blanco rumbo al bosque.png')
        },
        {
          id: 'beginner-4',
          title: '4 Desafío por Tiempo "Raíces en Movimiento"',
          description: 'Corre durante 90 minutos en una semana.',
          note: 'La constancia es clave para que un bosque crezca fuerte. Dedica tu tiempo a la naturaleza y siembra el cambio con cada minuto.',
          goal: { time: 90 },
          medal: 'Semilla',
          icon: require('./assets/Iconos/icono blanco raices en movimiento.png')
        }
      ]
    },
    intermediate: {
      title: 'Nivel Brote Fuerte (Intermedio)',
      subtitle: 'Tu esfuerzo empieza a dar frutos',
      challenges: [
        {
          id: 'intermediate-1',
          title: '1 Desafío de Bienvenida – "Raíces Firmes"',
          description: 'Corre 5 km en una sesión.',
          note: 'Tu crecimiento ya comenzó. Es momento de fortalecer tus raíces con tu primera carrera.',
          goal: { distance: 5 },
          icon: require('./assets/Iconos/icono raices firmes.png')
        },
        {
          id: 'intermediate-2',
          title: '2 Desafío por Distancia "Senderos Verdes"',
          description: 'Corre 26-50 km en una semana (ritmo menor a 5 min/km).',
          note: 'Supera tus límites, mejora tu ritmo y disfruta del camino mientras cuidas de tu bienestar y del planeta.',
          goal: { distance: 26, speedAvg: 5 },
          icon: require('./assets/Iconos/icono senderos verdes.png')
        },
        {
          id: 'intermediate-3',
          title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
          description: 'Acumula 40 km en una semana.',
          note: 'Mantén el ritmo y sigue sumando kilómetros. Cada esfuerzo te hace más fuerte y más conectado con la naturaleza.',
          goal: { distance: 40 },
          icon: require('./assets/Iconos/icono blanco rumbo al bosque.png')
        },
        {
          id: 'intermediate-4',
          title: '4 Desafío por Tiempo "Raíces en Movimiento"',
          description: 'Corre durante 240 minutos en una semana.',
          note: 'Corre con propósito. Cada minuto en movimiento refuerza tu conexión con la naturaleza y el impacto positivo que puedes generar.',
          goal: { time: 240 },
          medal: 'Brote Fuerte',
          icon: require('./assets/Iconos/icono blanco raices en movimiento.png')
        }
      ]
    },
    advanced: {
      title: 'Nivel Árbol Ancestral (Avanzado)',
      subtitle: 'Eres parte del bosque',
      challenges: [
        {
          id: 'advanced-1',
          title: '1 Desafío de Bienvenida – "Primer Árbol"',
          description: 'Corre 10 km en una sesión.',
          note: 'Ya eres parte del bosque, pero cada árbol comienza con un esfuerzo. Supera este primer desafío y deja tu huella.',
          goal: { distance: 10 },
          icon: require('./assets/Iconos/icono primer arbol.png')
        },
        {
          id: 'advanced-2',
          title: '2 Desafío por Distancia "Senderos Verdes"',
          description: 'Corre más de 50 km en una semana (ritmo menor a 3 min/km).',
          note: 'Mantén tu ritmo constante y fortalece tu compromiso con tu salud y con el cuidado del entorno.',
          goal: { distance: 50, speedAvg: 3 },
          icon: require('./assets/Iconos/icono senderos verdes.png')
        },
        {
          id: 'advanced-3',
          title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
          description: 'Acumula 70 km en una semana.',
          note: 'Lleva tu hábito al siguiente nivel. Con cada km, no solo mejoras tu bienestar, sino que también aportas al cuidado del medio ambiente.',
          goal: { distance: 70 },
          icon: require('./assets/Iconos/icono blanco rumbo al bosque.png')
        },
        {
          id: 'advanced-4',
          title: '4 Desafío por Tiempo "Raíces en Movimiento"',
          description: 'Corre durante 420 minutos en una semana.',
          note: 'Corre con propósito. Cada minuto en movimiento refuerza tu conexión con la naturaleza y el impacto positivo que puedes generar.',
          goal: { time: 420 },
          medal: 'Árbol Ancestral',
          icon: require('./assets/Iconos/icono blanco raices en movimiento.png')
        }
      ]
    }
  };

  useEffect(() => {
    fetchUserGoals();
    loadKilometers();
    loadCompletedChallenges();
  }, []);

  const fetchUserGoals = async () => {
    try {
      setLoading(true);
      
      // First check if we have a user ID
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found, trying to get user data first');
        // Try to get user data first to ensure we have a user ID
        const userResponse = await apiService.getUser();
        if (userResponse && userResponse.data) {
          let extractedUserId;
          if (Array.isArray(userResponse.data) && userResponse.data.length > 0) {
            extractedUserId = userResponse.data[0]._id;
          } else if (userResponse.data._id) {
            extractedUserId = userResponse.data._id;
          }
          
          if (extractedUserId) {
            await AsyncStorage.setItem('userId', extractedUserId);
            console.log('User ID saved from user data:', extractedUserId);
          }
        }
      }
      
      const response = await apiService.getUserGoals();
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

  const renderCurrentChallenge = () => {
    const challenge = getCurrentChallenge();
    const progress = getProgress(challenge);
    const isSelected = selectedChallenge === challenge.id;
    const isCompleted = completedChallenges.includes(challenge.id);
    
    return (
      <View style={styles.currentChallengeContainer}>
        <View style={styles.iconContainer}>
          <Image 
            source={challenge.icon} 
            style={[
              styles.challengeIcon, 
              { tintColor: progress >= 100 ? '#FFD962' : '#467d2a' }
            ]} 
            resizeMode="contain"
          />
          
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{Math.round(progress)}%</Text>
          </View>
        </View>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          <Text style={styles.challengeNote}>{challenge.note}</Text>
          
          {challenge.medal && (
            <Text style={styles.medalText}>Medalla: {challenge.medal}</Text>
          )}
          
          <Text style={styles.progressText}>{Math.round(progress)}% completado</Text>
          
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>¡Completado!</Text>
            </View>
          ) : !isSelected ? (
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => startChallenge(challenge)}
            >
              <Text style={styles.buttonText}>Iniciar Desafío</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('./assets/fondo3.jpg')} style={styles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Desafíos</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.levelSelector}>
          <TouchableOpacity
            style={[
              styles.levelButton,
              activeLevel === 'beginner' && styles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('beginner')}
          >
            <Text
              style={[
                styles.levelButtonText,
                activeLevel === 'beginner' && styles.levelButtonTextSelected,
              ]}
            >
              Principiante
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.levelButton,
              activeLevel === 'intermediate' && styles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('intermediate')}
          >
            <Text
              style={[
                styles.levelButtonText,
                activeLevel === 'intermediate' && styles.levelButtonTextSelected,
              ]}
            >
              Intermedio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.levelButton,
              activeLevel === 'advanced' && styles.levelButtonSelected,
            ]}
            onPress={() => setActiveLevel('advanced')}
          >
            <Text
              style={[
                styles.levelButtonText,
                activeLevel === 'advanced' && styles.levelButtonTextSelected,
              ]}
            >
              Avanzado
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>{challengeLevels[activeLevel].title}</Text>
          <Text style={styles.levelSubtitle}>{challengeLevels[activeLevel].subtitle}</Text>
        </View>

        {renderCurrentChallenge()}
        
        <View style={styles.progressIndicator}>
          {challengeLevels[activeLevel].challenges.map((challenge, index) => (
            <View 
              key={challenge.id} 
              style={[
                styles.progressDot,
                completedChallenges.includes(challenge.id) && styles.progressDotCompleted,
                getCurrentChallenge().id === challenge.id && styles.progressDotCurrent
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 5,
  },
  levelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  levelButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
  },
  levelButtonSelected: {
    backgroundColor: '#467d2a',
    borderColor: '#467d2a',
  },
  levelButtonText: {
    color: 'black',
    fontSize: 16,
  },
  levelButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  levelHeader: {
    marginBottom: 15,
    width: '100%',
  },
  levelTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  levelSubtitle: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    marginTop: 5,
  },
  currentChallengeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative', // For positioning the progress badge
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#467d2a',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  challengeIcon: {
    width: 120,
    height: 120,
    tintColor: '#467d2a', // Default color
  },
  grayIcon: {
    position: 'absolute',
    opacity: 0.3, // Make it semi-transparent
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    width: '100%',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#467d2a',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  challengeNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  medalText: {
    fontSize: 16,
    color: '#467d2a',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#467d2a',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  },
  completedBadge: {
    backgroundColor: '#467d2a',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  completedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  progressDotCompleted: {
    backgroundColor: '#467d2a',
  },
  progressDotCurrent: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#467d2a',
  },
  progressBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#467d2a',
    elevation: 3,
  },
  progressBadgeText: {
    color: '#467d2a',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ChallengesScreen;
