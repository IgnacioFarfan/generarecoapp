import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// import NetInfo from '@react-native-community/netinfo';

// Import API service and config
import apiService from './services/api.service';
import apiConfig from './config/api.config';
// import NetworkStatus from './components/NetworkStatus';

// Import your other screens
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen';
import WelcomeScreen from './Welcome';
import ChallengesScreen from './ChallengesScreen';
import ResultScreen from './ResultScreen';
import HistoryScreen from './HistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  // Add new state variables for signup
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check for existing token on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          try {
            // Try to decode the token to verify it's valid
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Check if token is expired
            if (decoded.exp && decoded.exp < currentTime) {
              console.log('Token expired, removing');
              await AsyncStorage.removeItem('userToken');
              setIsLoggedIn(false);
            } else {
              // Token is valid
              console.log('Valid token found, user is logged in');
              setIsLoggedIn(true);
            }
          } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
            // If we can't decode the token, it's probably invalid
            await AsyncStorage.removeItem('userToken');
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking token:', err);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleLogin = async (navigation) => {
    try {
      setError(''); // Clear previous errors
      setIsLoading(true);
      
      // Use the apiService instead of direct axios call
      console.log('Attempting login with apiService');
      const response = await apiService.login(username, password);
      
      console.log('Login response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        setError('No token received from server');
        setIsLoading(false);
        return;
      }
      
      // Store the token securely
      await AsyncStorage.setItem('userToken', token);
      
      console.log('Login successful, token stored:', token);
      setIsLoggedIn(true);
      setError('');
      
      // Force navigation to Welcome screen and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response) {
        console.log('Error response:', err.response.status, err.response.data);
      }
      
      if (!err.response) {
        setError('No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.');
      } else if (err.response.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setIsSignupMode(true);
    setFieldsVisible(false);
    setError('');
    // Clear all fields
    setUsername('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setConfirmPassword('');
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const handleSignup = async (navigation) => {
    try {
      // Validate fields
      if (!username || !password || !firstName || !lastName || !email || !confirmPassword) {
        setError('Por favor complete todos los campos');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      setError(''); // Clear previous errors
      setIsLoading(true);
      
      console.log('Attempting signup with apiService');
      
      // Use apiService instead of direct axios call to leverage URL fallback
      const response = await axios.post(`${apiConfig.endpoints.register}`, { 
        username,
        password,
        firstName,
        lastName,
        email
      }, {
        baseURL: await apiService.checkApiUrls() // Use the URL checking mechanism
      });
      
      console.log('Signup response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        setError('No token received from server');
        setIsLoading(false);
        return;
      }
      
      // Store the token securely
      await AsyncStorage.setItem('userToken', token);
      
      console.log('Signup successful, token stored:', token);
      setIsLoggedIn(true);
      setError('');
      
      // Force navigation to Welcome screen and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle different types of errors
      if (err.response) {
        console.log('Error response:', err.response.status, err.response.data);
      }
      
      if (!err.response) {
        setError('No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.');
      } else if (err.response.status === 401) {
        setError('Error en el registro');
      } else {
        setError(err.response?.data?.error || 'Error al registrarse');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignupMode(!isSignupMode);
    setFieldsVisible(false);
    setError('');
    // Clear all fields
    setUsername('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setConfirmPassword('');
  };

  return (
    <NavigationContainer>
      <StatusBar
        translucent={true}
        barStyle="light-content"
        backgroundColor="transparent"
      />
      {/* <NetworkStatus /> */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#467d2a" />
        </View>
      ) : (
        <Stack.Navigator initialRouteName={isLoggedIn ? 'Welcome' : 'Login'}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {({ navigation }) => (
              <View style={styles.container}>
                <Image
                  source={require('./assets/fondo.jpg')}
                  style={styles.backgroundImage}
                />
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Image
                    source={require('./assets/logo-login.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    onLongPress={toggleDebugMode}
                  />
                  <Text style={styles.title}>{isSignupMode ? 'Crear Cuenta' : 'Bienvenido'}</Text>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  
                  {!fieldsVisible && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setFieldsVisible(true)}
                    >
                      <Text style={styles.buttonText}>{isSignupMode ? 'Registrarse' : 'Ingresar'}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {fieldsVisible && (
                    <>
                      {isSignupMode && (
                        <>
                          <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            placeholderTextColor="#ccc"
                            value={firstName}
                            onChangeText={setFirstName}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Apellido"
                            placeholderTextColor="#ccc"
                            value={lastName}
                            onChangeText={setLastName}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#ccc"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </>
                      )}
                      
                      <TextInput
                        style={styles.input}
                        placeholder={isSignupMode ? "Nombre de usuario" : "Nombre de usuario o correo"}
                        placeholderTextColor="#ccc"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#ccc"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                      
                      {isSignupMode && (
                        <TextInput
                          style={styles.input}
                          placeholder="Confirmar contraseña"
                          placeholderTextColor="#ccc"
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                      )}
                      
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => isSignupMode ? handleSignup(navigation) : handleLogin(navigation)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>{isSignupMode ? 'Registrarse' : 'Ingresar'}</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <View style={styles.socialContainer}>
                    {!isSignupMode && (
                      <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.buttonText}>Continuar con Google</Text>
                      </TouchableOpacity>
                    )}
                    
                    <Text style={styles.createAccountText}>
                      {isSignupMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                      <TouchableOpacity onPress={toggleAuthMode}>
                        <Text style={styles.createAccountLink}>
                          {isSignupMode ? 'Inicia sesión aquí' : 'Crea una aquí'}
                        </Text>
                      </TouchableOpacity>
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Challenges"
            component={ChallengesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResultScreen"
            component={ResultScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HistoryScreen"
            component={HistoryScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 30,
    zIndex: 1,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ffffff',
    borderWidth: 0,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: 'white',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center', // Added to center the placeholder text
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
  },
  socialButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  createAccountText: {
    color: 'white',
    fontSize: 14,
  },
  createAccountLink: {
    color: '#f5f5f5',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  debugContainer: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
});
