import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { settingsStyles } from '../styles/settingsStyles';
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import FooterScreen from './FooterScreen';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [error, setError] = useState('');

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Otro');

  const [weightIsValid, setWeightIsValid] = useState(true);
  const [heightIsValid, setHeightIsValid] = useState(true);
  const [ageIsValid, setAgeIsValid] = useState(true);
  
  const [uid, setUid] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, [navigation]);

  const fetchSettings = async () => {
    try {
      const { userId } = await getUserTokenAndId(navigation);
      setUid(userId)
      const response = await apiService.getUser(userId);
      console.log('User data from backend from SettingsScreen:', response.data);

      let userData = response.data;

      //setName(userData.firstName || 'Usuario');
      //setUserName(userData.userName || '');
      //setFirstName(userData.firstName || '');
      //setLastName(userData.lastName || '');
      //setEmail(userData.email || '');
      setAge(userData.age || '');
      setWeight(userData.weight || '');
      setHeight(userData.height || '');
      setGender(userData.gender || 'Otro');
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
    if (!height || !weight || !age || !gender) return setError('Por favor complete todos los campos requeridos');
    
    const weightRegex = /^\d{2,3}(\.\d{1,2})?$/
    const heightRegex = /^\d{1}(\.\d{1,2})?$/
    const ageRegex = /^\d{1,3}$/
    if (!ageRegex.test(age)) return setAgeIsValid(false);
    if (!weightRegex.test(weight)) return setWeightIsValid(false);
    if (!heightRegex.test(height)) return setHeightIsValid(false);
    
    try {
      console.log(uid, parseFloat(height), parseFloat(weight), Number(age), gender);

      // Create update object with only the fields we want to update
      const userSettings = {
        uid: uid,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: Number(age),
        gender
      };

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

          <TouchableOpacity style={settingsStyles.doneButton} onPress={handleDone}>
            <Text style={settingsStyles.doneButtonText}>Listo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={settingsStyles.doneButton} onPress={() => navigation.navigate('Map')}>
            <Text style={settingsStyles.doneButtonText}>Omitir</Text>
          </TouchableOpacity>
        </View>
        <FooterScreen />
      </ScrollView>
    </ImageBackground>
  );
};

export default SettingsScreen;
