import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './services/api.service';
import { jwtDecode } from 'jwt-decode';

const SLIDES = [
  { 
    id: '1', 
    text: '¡Hola!\nBienvenido a la app de Generar ECO donde el deporte y la sostenibilidad se encuentran para alcanzar un cambio positivo tanto en tu vida, como en el planeta.',
  },
  { 
    id: '2', 
    text: 'En nuestra organización creemos que el deporte y el cuidado del medioambiente van de la mano. Por eso, te ofrecemos una plataforma donde podrás encontrar todas las herramientas que necesitas para mantener un estilo de vida activo y sostenible.',
  },
  { 
    id: '3', 
    text: 'En nuestra aplicación, podrás:\n- Cumplir tus metas deportivas generando plantaciones de nativas.\n- Participar en desafíos y retos que te motiven a ser más activo y ecológico.\n- Encontrar fácilmente espacios verdes adecuados para ejercitarte.\n- Compartir tus progresos con tus amigos y comunidad.\n¡Seamos un bosque!',
  },
];

const WelcomeScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          navigation.navigate('Login');
          return;
        }
        
        // Get user ID from token
        let userId = null;
        try {
          const decoded = jwtDecode(token);
          userId = decoded.id;
        } catch (error) {
          console.error('Error decoding token:', error);
          navigation.navigate('Login');
          return;
        }
        
        // Get user data from backend
        const response = await apiService.getUser();
        console.log('User data from backend:', response.data);
        
        let userData;
        // Handle both array and single object responses
        if (Array.isArray(response.data)) {
          // If it's an array, find the current user
          userData = response.data.find(user => user._id === userId);
        } else {
          userData = response.data;
        }
        
        if (!userData) {
          console.error('User data not found in response');
          navigation.navigate('Login');
          return;
        }
        
        // Check if user has completed profile setup (has age, weight, height)
        if (userData.age && userData.weight && userData.height) {
          // User has completed profile setup, go to Profile
          console.log('User has completed profile, navigating to Profile');
          navigation.navigate('Profile', userData);
        } else {
          // New user or incomplete profile, show welcome screens
          console.log('New user or incomplete profile, showing welcome screens');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        if (error.response && error.response.status === 401) {
          navigation.navigate('Login');
        } else {
          setIsLoading(false);
        }
      }
    };
    
    checkUserStatus();
  }, [navigation]);

  const handleScroll = (event) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.slideText}>{item.text}</Text>
    </View>
  );

  // If still loading, don't render anything yet
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('./assets/fondo2.jpg')} style={styles.container} resizeMode="cover">
      <View style={styles.logoContainer}>
        <Image 
          source={require('./assets/logo-welcome1.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
      </View>
      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        ref={flatListRef}
        onScroll={handleScroll}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  logoContainer: {
    width: '80%',
    height: Dimensions.get('window').height * 0.3, // 30% of screen height
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,  // Reduced from 20
    marginBottom: 5, // Reduced from 10
  },
  logoImage: {
    width: '40%',
    height: '40%',
  },
  slide: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 20,
  },
  slideText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 25,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  carousel: {
    flexGrow: 0,
    marginBottom: 20,
  },
});

export default WelcomeScreen;
