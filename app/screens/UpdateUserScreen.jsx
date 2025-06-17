import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import FooterScreen from './FooterScreen';
import apiService from '../services/api.service';

import { Picker } from '@react-native-picker/picker';
import { updateUserStyles } from '../styles/updateUserStyles';

const UpdateUserScreen = () => {
    const route = useRoute();
    const { _id, userName, firstName, lastName, email, age, range, gender, height, weight } = route.params;

    const navigation = useNavigation();

    const [username, setUsername] = useState(userName);
    const [userFirstName, setFirstName] = useState(firstName);
    const [userLastName, setLastName] = useState(lastName);
    const [userEmail, setEmail] = useState(email);
    const [userAge, setUserAge] = useState(String(age));
    const [userRange, setUserRange] = useState(range);
    const [userGender, setUserGender] = useState(gender);
    const [userHeight, setUserHeight] = useState(String(height));
    const [userWeight, setUserWeight] = useState(String(weight));

    const [userPassword, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [userNameIsValid, setUserNameIsValid] = useState(true);
    const [passwordIsValid, setPasswordIsValid] = useState(true);
    const [firstNameIsValid, setFirstNameIsValid] = useState(true);
    const [lastNameIsValid, setLastNameIsValid] = useState(true);
    const [emailIsValid, setEmailIsValid] = useState(true);
    const [ageIsValid, setAgeIsValid] = useState(true);
    const [heightIsValid, setHeightIsValid] = useState(true);
    const [weightIsValid, setWeightIsValid] = useState(true);

    const [error, setError] = useState('');

    const handleUpdate = async () => {
        try {
            setUserNameIsValid(true);
            setFirstNameIsValid(true);
            setLastNameIsValid(true);
            setEmailIsValid(true);
            setAgeIsValid(true);
            setWeightIsValid(true);
            setHeightIsValid(true);

            // Validate fields
            if (!username || !userFirstName || !userLastName || !userEmail) return setError('Por favor complete todos los campos');

            const userNameRegex = /^([a-zA-Z0-9]{1,15})$/ //Simple validation reg ex that requires 1-15 alphanumeric characters
            const firstNameRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/ // Person's name (first, last, or both) in any letter case. 
            // Although not perfect, this expression will filter out many incorrect name formats (especially numerics and invalid special characters).
            const emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/ // matchs: john-smith@example.com | john.smith@example.com | john_smith@x-ample.com
            const ageRegex = /^\d{1,3}$/
            const weightRegex = /^\d{2,3}(\.\d{1,2})?$/
            const heightRegex = /^\d{1}(\.\d{1,2})?$/

            if (!userNameRegex.test(username)) return setUserNameIsValid(false);
            if (!firstNameRegex.test(userFirstName)) return setFirstNameIsValid(false);
            if (!firstNameRegex.test(userLastName)) return setLastNameIsValid(false);
            if (!emailRegex.test(userEmail)) return setEmailIsValid(false);
            if (!ageRegex.test(userAge)) return setAgeIsValid(false);
            if (!weightRegex.test(userWeight)) return setWeightIsValid(false);
            if (!heightRegex.test(userHeight)) return setHeightIsValid(false);

            const response = await apiService.updateUser({
                uid: _id,
                userName: username,
                firstName: userFirstName,
                lastName: userLastName,
                email: userEmail,
                age: userAge,
                range: userRange,
                gender: userGender,
                height: userHeight,
                weight: userWeight
            });

            console.log('usuario actualizado:', response.data);
            if (response.data) {
                Alert.alert(
                    'OK!',
                    'Se actualizaron tus datos correctamente.',
                    [
                        {
                            text: 'Aceptar', onPress: navigation.reset({
                                index: 0,
                                routes: [{ name: 'Profile' }],
                            })
                        }
                    ]
                );
            }
        } catch (err) {
            console.error('Error actualizando usuario:', err);

            if (err.status === 401) {
                setError(err.message);
            } else {
                setError(err.data?.error || 'Error actualizando usuario');
            }
        }
    };

    const handleUpdatePassword = async () => {
        setPasswordIsValid(true);
        if (!userPassword || !confirmPassword) return setError('Por favor complete todos los campos');
        if (userPassword !== confirmPassword) return setError('Las contraseñas no coinciden');

        const passwordRegex = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{4,6})$/ //Validates a strong password. It must be between 4 and 6 characters, 
        // contain at least one digit and one alphabetic character, and must not contain special characters
        if (!passwordRegex.test(userPassword)) return setPasswordIsValid(false);
        try {
            const response = await apiService.updateUserPassword({ uid: _id, newPassword: userPassword });
            if (response.data) {
                Alert.alert(
                    'Se actualizó tu contraseña correctamente.',
                    'Usa tu nuevo password en tu próximo inicio de sesión',
                    [
                        { text: 'Aceptar', onPress: navigation.navigate('Profile') }
                    ]
                );
            }
        } catch (err) {
            console.error('Error actualizando usuario:', err);

            if (err.status === 401) {
                setError(err.message);
            } else {
                setError(err.data?.error || 'Error actualizando usuario');
            }
        }

    }

    return (
        <ImageBackground source={require('../assets/fondo4.jpg')} style={updateUserStyles.container} resizeMode="cover" >
            <ScrollView contentContainerStyle={updateUserStyles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={updateUserStyles.title}>Modificar mi Perfil</Text>
                {error ? <Text style={updateUserStyles.errorText}>{error}</Text> : null}
                <Text style={updateUserStyles.subtitle}>Usuario:</Text>
                <TextInput
                    style={updateUserStyles.input}
                    placeholder={"Nombre de usuario"}
                    placeholderTextColor="#ccc"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                {
                    !userNameIsValid && (
                        <Text style={updateUserStyles.errorText}>Por favor ingresa hasta 15 carácteres alfanuméricos, recuerda que no debe estar en uso.</Text>
                    )
                }

                <Text style={updateUserStyles.subtitle}>Nombre:</Text>
                <TextInput
                    style={updateUserStyles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#ccc"
                    value={userFirstName}
                    onChangeText={setFirstName}
                />
                {!firstNameIsValid && (
                    <Text style={updateUserStyles.errorText}>Por favor no uses números ni carácteres especiales.</Text>
                )}

                <Text style={updateUserStyles.subtitle}>Apellido:</Text>
                <TextInput
                    style={updateUserStyles.input}
                    placeholder="Apellido"
                    placeholderTextColor="#ccc"
                    value={userLastName}
                    onChangeText={setLastName}
                />
                {!lastNameIsValid && (
                    <Text style={updateUserStyles.errorText}>Por favor no uses números ni carácteres especiales.</Text>
                )}

                <Text style={updateUserStyles.subtitle}>Email:</Text>
                <TextInput
                    style={updateUserStyles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#ccc"
                    value={userEmail}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {!emailIsValid && (
                    <Text style={updateUserStyles.errorText}>Por favor ingresa una dirección de email válida.</Text>
                )}

                <View style={updateUserStyles.numberInputsContainer}>
                    <View style={updateUserStyles.numberInputs}>
                        <Text style={updateUserStyles.subtitle}>Edad:</Text>
                        <TextInput
                            style={updateUserStyles.input}
                            value={userAge}
                            onChangeText={setUserAge}
                            placeholder="Edad"
                            placeholderTextColor="black"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={updateUserStyles.numberInputs}>
                        <Text style={updateUserStyles.subtitle}>Peso (kgs):</Text>
                        <TextInput
                            style={updateUserStyles.input}
                            value={userWeight}
                            onChangeText={setUserWeight}
                            placeholder="Peso"
                            placeholderTextColor="black"
                        />
                    </View>

                    <View style={updateUserStyles.numberInputs}>
                        <Text style={updateUserStyles.subtitle}>Altura (mts):</Text>
                        <TextInput
                            style={updateUserStyles.input}
                            value={userHeight}
                            onChangeText={setUserHeight}
                            placeholder="Altura"
                            placeholderTextColor="black"
                        />
                    </View>
                </View>
                {!ageIsValid && (
                    <Text style={updateUserStyles.errorText}>Edad: Por favor ingresa solo números válidos.</Text>
                )}
                {!weightIsValid && (
                    <Text style={updateUserStyles.errorText}>Peso: Por favor ingresa dos números mínimo y el punto si usas decimales.</Text>
                )}
                {!heightIsValid && (
                    <Text style={updateUserStyles.errorText}>Altura: Por favor ingresa solo un dígito y el punto si usas decimales.</Text>
                )}

                <Text style={updateUserStyles.subtitle}>Género:</Text>
                <View style={updateUserStyles.pickerContainer}>
                    <Picker selectedValue={userGender} onValueChange={(itemValue) => setUserGender(itemValue)} style={updateUserStyles.picker} >
                        <Picker.Item label="Masculino" value="masculino" />
                        <Picker.Item label="Femenino" value="femenino" />
                        <Picker.Item label="No especificar" value="no especificar" />
                    </Picker>
                </View>

                <Text style={updateUserStyles.subtitle}>Perfil deportista:</Text>
                <View style={updateUserStyles.rangeContainer}>
                    <TouchableOpacity
                        style={[updateUserStyles.rangeButton, userRange === 'Principiante' && updateUserStyles.rangeButtonSelected]}
                        onPress={() => setUserRange('Principiante')} >
                        <Text style={[updateUserStyles.rangeButtonText, userRange === 'Principiante' && updateUserStyles.rangeButtonTextSelected]} >
                            Principiante
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[updateUserStyles.rangeButton, userRange === 'Intermedio' && updateUserStyles.rangeButtonSelected]}
                        onPress={() => setUserRange('Intermedio')} >
                        <Text style={[updateUserStyles.rangeButtonText, userRange === 'Intermedio' && updateUserStyles.rangeButtonTextSelected]} >
                            Intermedio
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[updateUserStyles.rangeButton, userRange === 'Avanzado' && updateUserStyles.rangeButtonSelected]}
                        onPress={() => setUserRange('Avanzado')} >
                        <Text style={[updateUserStyles.rangeButtonText, userRange === 'Avanzado' && updateUserStyles.rangeButtonTextSelected]} >
                            Avanzado
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={updateUserStyles.doneButton} onPress={() => handleUpdate()} >
                    <Text style={updateUserStyles.doneButtonText}>Actualizar mi perfil</Text>
                </TouchableOpacity>
                <Text style={updateUserStyles.subtitle}>Cambiar contraseña</Text>
                <TextInput
                    style={updateUserStyles.input}
                    placeholder="Nueva Contraseña"
                    placeholderTextColor="#ccc"
                    secureTextEntry
                    value={userPassword}
                    onChangeText={setPassword}
                />
                {!passwordIsValid && (
                    <Text style={updateUserStyles.errorText}>Por favor ingresa entre 4 y 6 carácteres alfanuméricos (al menos una letra y un número). No uses carácteres especiales.</Text>
                )}

                <TextInput
                    style={updateUserStyles.input}
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor="#ccc"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={updateUserStyles.doneButton} onPress={() => handleUpdatePassword()}>
                    <Text style={updateUserStyles.doneButtonText}>Cambiar</Text>
                </TouchableOpacity>

            </ScrollView>
            <FooterScreen />
        </ImageBackground>
    )
}

export default UpdateUserScreen;