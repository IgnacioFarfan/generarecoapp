import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../services/api.service';
import { profileStyles } from '../styles/profileStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      const { userId } = await getUserTokenAndId(navigation);
      fetchUserData(userId);
      console.log('render in ProfileScreen', userId);

    }
    getUserData();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const user = await apiService.getUser(uid);
      if (user.data) setUserData(user.data);
      //setLoading(false);
    } catch (error) {
      console.error('Failed to load data from API:', error);
      setLoading(false);
    }
  };

  const handleUpdatePress = () => {
    navigation.navigate('UpdateUser', userData);
  };

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
    /*  <ImageBackground
       source={require('../assets/fondo4.jpg')}
       style={profileStyles.container}
       resizeMode="cover"
     >
  */
    <View style={profileStyles.profileContainer}>
      <Text style={profileStyles.profileTitle}>Perfil de usuario</Text>
      <View style={profileStyles.profileInfoContainer}>
        <Text style={profileStyles.info}>Nombre: {userData.firstName}</Text>
        <Text style={profileStyles.info}>Email: {userData.email}</Text>
        <Text style={profileStyles.info}>Edad: {userData.age}</Text>
        <Text style={profileStyles.info}>Peso: {userData.weight} kg</Text>
        <Text style={profileStyles.info}>Altura: {userData.height} mts</Text>
        <Text style={profileStyles.info}>Fecha de registro: {new Date(userData.registerDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</Text>

        <View style={profileStyles.profileButtonsContainer}>
          <TouchableOpacity style={profileStyles.backButton} onPress={handleUpdatePress}>
            <Text style={profileStyles.backButtonText}>Modificar mi perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.logoutButton} onPress={handleLogout}>
            <Text style={profileStyles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    /*  </ImageBackground> */
  );
};

export default ProfileScreen;
