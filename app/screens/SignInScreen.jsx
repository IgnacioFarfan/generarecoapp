import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
// import NetInfo from '@react-native-community/netinfo';

// import * as Google from 'expo-auth-session/providers/google';
//import * as AuthSession from 'expo-auth-session';
//import * as WebBrowser from "expo-web-browser";

// Import API service and config
import apiService from '../services/api.service';

//appStyles
import { appStyles } from '../styles/appStyles';

// WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const navigation = useNavigation();

    //const [debugMode, setDebugMode] = useState(false);

    const [isSignupMode, setIsSignupMode] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                    } else {
                        // Token is valid
                        console.log('Valid token found, user is logged in');

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    }
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    // If we can't decode the token, it's probably invalid
                    await AsyncStorage.removeItem('userToken');
                }
            }
        } catch (err) {
            console.error('Error checking token:', err);
            setIsLoading(false);
        }
    };

    /* 
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.generareco'
    });
    console.log('URI de Redirección para Google:', redirectUri);
     */

    // const [request, response, promptAsync] = Google.useAuthRequest({
    //     androidClientId: process.env.EXPO_PUBLIC_ANDROID_ID,
    //     useProxy: false,
    //     redirectUri: "com.generareco:/",
    // });

    /* 
    useEffect(() => {
        console.log('request:', request);
        console.log('response:', response);
    }, [request]);
     */

    // useEffect(() => {
    //     if (response?.type === 'success') {
    //         const { authentication } = response;
    //         console.log('Token:', authentication?.accessToken);
    //         if (authentication?.accessToken) getGoogleUserInfo(authentication.accessToken)
    //     } else if (response?.type === 'error') {
    //         console.error('Error en login con Google:', response.error);
    //     }
    // }, [response]);

    // const getGoogleUserInfo = async (token) => {
    //     try {
    //         const response = await fetch("https://www.googleapis.com/userinfo/v2/me", { headers: { Authorization: `Bearer ${token}` }, },);
    //         const user = await response.json();
    //         console.log(user);
    //         if (user) {
    //             const newUser = await apiService.googleSignup(user.id, user.given_name, user.family_name, user.email);
    //             if (newUser) {
    //                 setError('');

    //                 navigation.reset({
    //                     index: 0,
    //                     routes: [{ name: 'Welcome' }],
    //                 });
    //             }
    //         }
    //     } catch (err) {
    //         console.log('Google auth error', err);
    //     }
    // }

    const handleLogin = async () => {
        try {
            setError(''); // Clear previous errors
            setIsLoading(true);

            if (!username || !password) return setError('Faltan datos');

            const response = await apiService.login(username, password);
            if (response) {
                setError('');

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
            }
        } catch (err) {
            console.log('Login error:', err);
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

    const handleSignup = async () => {
        try {
            setUserNameIsValid(true);
            setPasswordIsValid(true);
            setFirstNameIsValid(true);
            setLastNameIsValid(true);
            setEmailIsValid(true);
            // Validate fields
            if (!username || !password || !firstName || !lastName || !email || !confirmPassword) return setError('Por favor complete todos los campos');
            if (password !== confirmPassword) return setError('Las contraseñas no coinciden');

            setError(''); // Clear previous errors
            setIsLoading(true);

            //Simple validation reg ex that requires 1-15 alphanumeric characters
            const userNameRegex = /^([a-zA-Z0-9]{1,15})$/
            //Validates a strong password. It must be between 4 and 6 characters, contain at least one digit and one alphabetic character, 
            // and must not contain special characters
            const passwordRegex = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{4,6})$/
            // Person's name (first, last, or both) in any letter case. Although not perfect, this expression will filter out many incorrect 
            // name formats (especially numerics and invalid special characters).
            const firstNameRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/
            const lastNameRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/
            // matchs: john-smith@example.com | john.smith@example.com | john_smith@x-ample.com
            const emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/

            if (!firstNameRegex.test(firstName)) return setFirstNameIsValid(false);
            if (!lastNameRegex.test(lastName)) return setLastNameIsValid(false);
            if (!emailRegex.test(email)) return setEmailIsValid(false);
            if (!userNameRegex.test(username)) return setUserNameIsValid(false);
            if (!passwordRegex.test(password)) return setPasswordIsValid(false);

            const response = await apiService.signup(username, password, firstName, lastName, email);
            if (response) {
                setError('');
                toggleAuthMode();

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
            }
        } catch (err) {
            console.log('Signup error:', err);

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
        //setFieldsVisible(false);
        setError('');
        // Clear all fields
        setUserNameIsValid(true);
        setPasswordIsValid(true);
        setFirstNameIsValid(true);
        setLastNameIsValid(true);
        setEmailIsValid(true);

        setUsername('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setConfirmPassword('');
    };

    return (
        <>
            <StatusBar translucent={true} barStyle="light-content" backgroundColor="transparent" />
            {isLoading ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#467d2a" />
                </View>
                :
                <View style={appStyles.container}>
                    <Image source={require('../assets/fondo.jpg')} style={appStyles.backgroundImage} />

                    <Image
                        source={require('../assets/logo-login.png')}
                        style={appStyles.logo}
                        resizeMode="contain"
                        onLongPress={toggleDebugMode}
                    />
                    <Text style={appStyles.title}>{isSignupMode ? 'Crear Cuenta' : 'Bienvenido'}</Text>
                    {error ? <Text style={appStyles.errorText}>{error}</Text> : null}

                    {isSignupMode ?
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
                            <TextInput
                                style={appStyles.input}
                                placeholder={isSignupMode ? "Nombre de usuario" : "Nombre de usuario o correo"}
                                placeholderTextColor="#ffffff"
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
                                placeholderTextColor="#ffffff"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            {!passwordIsValid && (
                                <Text style={appStyles.errorText}>Por favor ingresa entre 4 y 6 carácteres alfanuméricos (al menos una letra y un número). No uses carácteres especiales.</Text>
                            )}
                            <TextInput
                                style={appStyles.input}
                                placeholder="Confirmar contraseña"
                                placeholderTextColor="#ffffff"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />


                            <TouchableOpacity
                                style={appStyles.button}
                                onPress={() => handleSignup()}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={appStyles.buttonText}>Registrarse</Text>
                                )}
                            </TouchableOpacity>
                        </> :
                        <>

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

                            <TouchableOpacity
                                style={appStyles.button}
                                onPress={() => handleLogin()}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={appStyles.buttonText}>Ingresar</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    }

                    <View style={appStyles.socialContainer}>
                        {/* {!isSignupMode && (
                            <TouchableOpacity style={appStyles.socialButton} onPress={() => {
                                promptAsync()
                            }}>
                                <Text style={appStyles.buttonText}>Continuar con Google</Text>
                            </TouchableOpacity>
                        )} */}
                        <View style={appStyles.createAccountTextContainer}>
                            <Text style={appStyles.createAccountText}>
                                {isSignupMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                            </Text>
                            <TouchableOpacity onPress={toggleAuthMode}>
                                <Text style={appStyles.createAccountLink}>
                                    {isSignupMode ? 'Inicia sesión aquí' : 'Crea una aquí'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
        </>
    );
}
