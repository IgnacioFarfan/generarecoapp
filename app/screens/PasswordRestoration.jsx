import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import API service and config
import apiService from '../services/api.service';

//appStyles
import { appStyles } from '../styles/appStyles';

export default function PasswordRestoration() {
    const navigation = useNavigation();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordIsValid, setPasswordIsValid] = useState(true);
    const [emailIsValid, setEmailIsValid] = useState(true);

    const handlePassRestoration = async () => {
        try {
            setPasswordIsValid(true);
            setEmailIsValid(true);
            
            if (!password || !email || !confirmPassword) return setError('Por favor complete todos los campos');
            if (password !== confirmPassword) return setError('Las contraseñas no coinciden');

            setError('');
            setIsLoading(true);

            //Validates a strong password. It must be between 4 and 6 characters, contain at least one digit and one alphabetic character, 
            // and must not contain special characters
            const passwordRegex = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{4,6})$/
            // matchs: john-smith@example.com | john.smith@example.com | john_smith@x-ample.com
            const emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/

            if (!emailRegex.test(email)) return setEmailIsValid(false);
            if (!passwordRegex.test(password)) return setPasswordIsValid(false);

            const response = await apiService.restorePass(email, password);
            if (response) {
                setError('');

                Alert.alert(
                    'Restauración exitosa.',
                    'Entra a tu correo y activa el nuevo password ingresado.',
                    [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (err) {
            console.log('Solicitud error:', err);

            if (err.status === 401) {
                setError(err.message);
            } else {
                setError(err.data?.error || 'Error al enviar la solicitud');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    }

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
                    />
                    <Text style={appStyles.title}>Restaurar password</Text>
                    {error ? <Text style={appStyles.errorText}>{error}</Text> : null}

                    <>
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
                            onPress={() => handlePassRestoration()}
                            disabled={isLoading}
                        >
                            <Text style={appStyles.buttonText}>Restaurar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBackToLogin}>
                            <Text style={appStyles.createAccountLink}>Volver</Text>
                        </TouchableOpacity>
                    </>
                </View>}
        </>
    );
}
