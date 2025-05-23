import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
// import NetInfo from '@react-native-community/netinfo';

// Import API service and config
import apiService from './services/api.service';

// Import your other screens
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MapScreen from './screens/MapScreen';
import WelcomeScreen from './screens/Welcome';
import ChallengesScreen from './screens/ChallengesScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

//appStyles
import { appStyles } from './styles/appStyles';

const Stack = createNativeStackNavigator();

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  //const [debugMode, setDebugMode] = useState(false);
  // Add new state variables for signup
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [userNameIsValid, setUserNameIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);
  const [firstNameIsValid, setFirstNameIsValid] = useState(true);
  const [lastNameIsValid, setLastNameIsValid] = useState(true);
  const [emailIsValid, setEmailIsValid] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

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

  const handleLogin = async (navigation) => {
    try {
      setError(''); // Clear previous errors
      setIsLoading(true);

      // Use the apiService instead of direct axios call
      const response = await apiService.login(username, password);

      const { token } = response.data;//Backend devuelve la sig info de usuario: id, userName, status, firstName, lastName, email, lastLogin, range, height, weight, age, avatar, country, token
      const { id } = response.data;

      // Store the token securely
      await AsyncStorage.setItem('userToken', token);//Guardamos tanto el token como el id
      await AsyncStorage.setItem('userId', id);

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
      if (err.status === 401) {
        setError(err.message);
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const handleSignup = async (navigation) => {
    try {
      setUserNameIsValid(true);
      setPasswordIsValid(true);
      setFirstNameIsValid(true);
      setLastNameIsValid(true);
      setEmailIsValid(true);
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


      const userNameRegex = /^([a-zA-Z0-9]{1,15})$/ //Simple validation reg ex that requires 1-15 alphanumeric characters
      const passwordRegex = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{4,6})$/ //Validates a strong password. It must be between 4 and 6 characters, contain at least one digit and one alphabetic character, and must not contain special characters
      const firstNameRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/ // Person's name (first, last, or both) in any letter case. Although not perfect, this expression will filter out many incorrect name formats (especially numerics and invalid special characters).
      const lastNameRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/
      const emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/ // matchs: john-smith@example.com | john.smith@example.com | john_smith@x-ample.com
      if (!userNameRegex.test(username)) return setUserNameIsValid(false);
      if (!passwordRegex.test(password)) return setPasswordIsValid(false);
      if (!firstNameRegex.test(firstName)) return setFirstNameIsValid(false);
      if (!lastNameRegex.test(lastName)) return setLastNameIsValid(false);
      if (!emailRegex.test(email)) return setEmailIsValid(false);


      const response = await apiService.signup(username, password, firstName, lastName, email);

      console.log('Signup response:', response.data);

      const { token } = response.data;//Backend devuelve la sig info de usuario: id, userName, status, firstName, lastName, email, lastLogin, range, height, weight, age, avatar, country, token
      const { id } = response.data;

      await AsyncStorage.setItem('userToken', token);//Guardamos tanto el token como el id
      await AsyncStorage.setItem('userId', id);

      setIsLoggedIn(true);
      setError('');
      toggleAuthMode();
      // Force navigation to Welcome screen and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });

    } catch (err) {
      console.error('Signup error:', err);

      if (err.status === 401) {
        setError(err.message);
      } else {
        setError(err.data?.error || 'Error al registrarse');
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
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#467d2a" />
        </View>
      ) : (
        <Stack.Navigator initialRouteName={isLoggedIn ? 'Welcome' : 'Login'}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {({ navigation }) => (
              <View style={appStyles.container}>
                <Image
                  source={require('./assets/fondo.jpg')}
                  style={appStyles.backgroundImage}
                />
                <ScrollView contentContainerStyle={appStyles.scrollContainer}>
                  <Image
                    source={require('./assets/logo-login.png')}
                    style={appStyles.logo}
                    resizeMode="contain"
                    onLongPress={toggleDebugMode}
                  />
                  <Text style={appStyles.title}>{isSignupMode ? 'Crear Cuenta' : 'Bienvenido'}</Text>
                  {error ? <Text style={appStyles.errorText}>{error}</Text> : null}

                  {!fieldsVisible && (
                    <TouchableOpacity
                      style={appStyles.button}
                      onPress={() => setFieldsVisible(true)}
                    >
                      <Text style={appStyles.buttonText}>{isSignupMode ? 'Registrarse' : 'Ingresar'}</Text>
                    </TouchableOpacity>
                  )}

                  {fieldsVisible && (
                    <>
                      {isSignupMode && (
                        <>
                          <TextInput
                            style={appStyles.input}
                            placeholder="Nombre"
                            placeholderTextColor="#ccc"
                            value={firstName}
                            onChangeText={setFirstName}
                          />
                          {!firstNameIsValid && (
                            <Text style={appStyles.errorText}>Por favor no uses números ni carácteres especiales.</Text>
                          )}
                          <TextInput
                            style={appStyles.input}
                            placeholder="Apellido"
                            placeholderTextColor="#ccc"
                            value={lastName}
                            onChangeText={setLastName}
                          />
                          {!lastNameIsValid && (
                            <Text style={appStyles.errorText}>Por favor no uses números ni carácteres especiales.</Text>
                          )}
                          <TextInput
                            style={appStyles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#ccc"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                          {!emailIsValid && (
                            <Text style={appStyles.errorText}>Por favor ingresa una dirección de email válida.</Text>
                          )}
                        </>
                      )}

                      <TextInput
                        style={appStyles.input}
                        placeholder={isSignupMode ? "Nombre de usuario" : "Nombre de usuario o correo"}
                        placeholderTextColor="#ccc"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                      {!userNameIsValid && (
                        <Text style={appStyles.errorText}>Por favor ingresa hasta 15 carácteres alfanuméricos, recuerda que no debe estar en uso.</Text>
                      )}
                      <TextInput
                        style={appStyles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#ccc"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                      {!passwordIsValid && (
                        <Text style={appStyles.errorText}>Por favor ingresa entre 4 y 6 carácteres alfanuméricos (al menos una letra y un número). No uses carácteres especiales.</Text>
                      )}

                      {isSignupMode && (
                        <TextInput
                          style={appStyles.input}
                          placeholder="Confirmar contraseña"
                          placeholderTextColor="#ccc"
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                      )}

                      <TouchableOpacity
                        style={appStyles.button}
                        onPress={() => isSignupMode ? handleSignup(navigation) : handleLogin(navigation)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={appStyles.buttonText}>{isSignupMode ? 'Registrarse' : 'Ingresar'}</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={appStyles.socialContainer}>
                    {!isSignupMode && (
                      <TouchableOpacity style={appStyles.socialButton}>
                        <Text style={appStyles.buttonText}>Continuar con Google</Text>
                      </TouchableOpacity>
                    )}

                    <Text style={appStyles.createAccountText}>
                      {isSignupMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                      <TouchableOpacity onPress={toggleAuthMode}>
                        <Text style={appStyles.createAccountLink}>
                          {isSignupMode ? 'Inicia sesión aquí' : 'Crea una aquí'}
                        </Text>
                      </TouchableOpacity>
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </Stack.Screen>

          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}


