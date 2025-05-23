import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, Image, ImageBackground } from 'react-native';

import apiService from '../services/api.service';
import { SLIDES } from '../content/welcomeSlides';
import { welcomeStyles } from '../styles/welcomeStyles';
import { useNavigation } from '@react-navigation/native';
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {    
    checkUserStatus();
  }, [navigation]);

  const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        const { userId } = await getUserTokenAndId(navigation);
        
        // Get user data from backend
        const response = await apiService.getUser(userId);
        console.log('User data from backend en welcomeScreen:', response.data);
        
        let userData = response.data;
        
        // Check if user has completed profile setup (has age, weight, height)
        if (userData.age && userData.weight && userData.height) {
          // User has completed profile setup, go to Profile
          navigation.navigate('Map', userData);
        } else {
          // New user or incomplete profile, show welcome screens
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

  const handleScroll = (event) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={welcomeStyles.slide}>
      <Text style={welcomeStyles.slideText}>{item.text}</Text>
    </View>
  );

  // If still loading, don't render anything yet
  if (isLoading) {
    return (
      <View style={[welcomeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/fondo2.jpg')} style={welcomeStyles.container} resizeMode="cover">
      <View style={welcomeStyles.logoContainer}>
        <Image 
          source={require('../assets/logo-welcome1.png')} 
          style={welcomeStyles.logoImage} 
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
        style={welcomeStyles.carousel}
        ref={flatListRef}
        onScroll={handleScroll}
      />
      <TouchableOpacity style={welcomeStyles.button} onPress={() => navigation.navigate('Settings')}>
        <Text style={welcomeStyles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};



export default WelcomeScreen;
