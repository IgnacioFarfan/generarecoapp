import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { settingsStyles } from '../styles/settingsStyles';
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Otro');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [range, setRange] = useState('Principiante');
  const [country, setCountry] = useState('');

  const [weightIsValid, setWeightIsValid] = useState(true);
  const [heightIsValid, setHeightIsValid] = useState(true);
  const [ageIsValid, setAgeIsValid] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [navigation]);

  const fetchSettings = async () => {
    try {
      const { userId } = await getUserTokenAndId(navigation);
      setUserId(userId)

      // Get user data from backend
      const response = await apiService.getUser(userId);
      console.log('User data from backend from SettingsScreen:', response.data);

      let userData = response.data;

      if (!userData) {
        console.error('User data not found in response');
        navigation.navigate('Login');
        return;
      }

      // If user already has complete profile data, go directly to Profile
      if (userData.age && userData.weight && userData.height) {
        navigation.navigate('Profile', userData);
      } else {
        // Otherwise, populate the form with any existing data
        //setName(userData.firstName || 'Usuario');
        //setUserName(userData.userName || '');
        //setFirstName(userData.firstName || '');
        //setLastName(userData.lastName || '');
        //setEmail(userData.email || '');
        setRange(userData.range || 'Principiante');
        setCountry(userData.country || '');
        setAge(userData.age || '');
        setWeight(userData.weight || '');
        setHeight(userData.height || '');
        setGender(userData.gender || 'Otro');
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      setError('Error inesperado');
      navigation.navigate('Login');
    }
  };

  const handleDone = async () => {
    setWeightIsValid(true);
    setHeightIsValid(true);
    setAgeIsValid(true);
    setError('');
    
    // Validate only the fields shown on this screen
    if (!height || !weight || !age || !gender || !range) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    const weightRegex = /^\d{2,3}(\.\d{1,2})?$/
    const heightRegex = /^\d{1}(\.\d{1,2})?$/    
    const ageRegex = /^\d{1,3}$/    
    if (!ageRegex.test(age)) return setAgeIsValid(false);
    if (!weightRegex.test(weight)) return setWeightIsValid(false);
    if (!heightRegex.test(height)) return setHeightIsValid(false);
      
    try {
      // First, get the current user data to ensure we have the user ID
      const response = await apiService.getUser(userId);

      console.log('API response data:', response.data);
      console.log(userId, parseFloat(height), parseFloat(weight), Number(age), gender, range );
      
      // Create update object with only the fields we want to update
      const userSettings = {
        uid: userId,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: Number(age),
        gender,
        range
      };

      // Add country if we have it
      /* if (country) {
        userSettings.country = country;
      } */
      console.log('Sending update with data:', userSettings);

      await apiService.updateUser(userSettings);

      navigation.navigate('Map', userSettings);
    } catch (err) {
      if (err.response) {
        console.log('Error response:', err.response.status, err.response.data);
        setError('Error al guardar configuración');
      }
    }
  };

  return (
    <ImageBackground source={require('../assets/fondo.jpg')} style={settingsStyles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={settingsStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={settingsStyles.title}>Ajustes</Text>
        {error ? <Text style={settingsStyles.errorText}>{error}</Text> : null}

        <View style={settingsStyles.settingsContainer}>
          <Text style={settingsStyles.subtitle}>Edad</Text>
          <TextInput
            style={settingsStyles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Ingresa tu edad"
            placeholderTextColor="black"
            keyboardType="numeric"
          />
          {!ageIsValid && (
            <Text style={settingsStyles.errorText}>Por favor ingresa solo números válidos.</Text>
          )}
          <Text style={settingsStyles.subtitle}>Peso (kgs)</Text>
          <TextInput
            style={settingsStyles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Ingresa tu peso"
            placeholderTextColor="black"
          />

          {!weightIsValid && (
            <Text style={settingsStyles.errorText}>Por favor ingresa dos números mínimo y el punto si usas decimales.</Text>
          )}

          <Text style={settingsStyles.subtitle}>Altura (mts)</Text>
          <TextInput
            style={settingsStyles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Ingresa tu altura"
            placeholderTextColor="black"
          />

          {!heightIsValid && (
            <Text style={settingsStyles.errorText}>Por favor ingresa solo un dígito y el punto si usas decimales.</Text>
          )}

          <Text style={settingsStyles.subtitle}>Género:</Text>
          <View style={settingsStyles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={settingsStyles.picker}
            >
              <Picker.Item label="Masculino" value="masculino" />
              <Picker.Item label="Femenino" value="femenino" />
              <Picker.Item label="No especificar" value="no especificar" />
            </Picker>
          </View>

          <Text style={settingsStyles.subtitle}>Perfil de deportista:</Text>
          <View style={settingsStyles.rangeContainer}>
            <TouchableOpacity
              style={[
                settingsStyles.rangeButton,
                range === 'Principiante' && settingsStyles.rangeButtonSelected,
              ]}
              onPress={() => setRange('Principiante')}
            >
              <Text
                style={[
                  settingsStyles.rangeButtonText,
                  range === 'Principiante' && settingsStyles.rangeButtonTextSelected,
                ]}
              >
                Principiante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                settingsStyles.rangeButton,
                range === 'Avanzado' && settingsStyles.rangeButtonSelected,
              ]}
              onPress={() => setRange('Avanzado')}
            >
              <Text
                style={[
                  settingsStyles.rangeButtonText,
                  range === 'Avanzado' && settingsStyles.rangeButtonTextSelected,
                ]}
              >
                Avanzado
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                settingsStyles.rangeButton,
                range === 'Experto' && settingsStyles.rangeButtonSelected,
              ]}
              onPress={() => setRange('Experto')}
            >
              <Text
                style={[
                  settingsStyles.rangeButtonText,
                  range === 'Experto' && settingsStyles.rangeButtonTextSelected,
                ]}
              >
                Experto
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={settingsStyles.doneButton} onPress={handleDone}>
            <Text style={settingsStyles.doneButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default SettingsScreen;
