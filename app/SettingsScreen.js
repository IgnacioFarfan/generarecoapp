import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import apiService from './services/api.service';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('Usuario');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('no especificar');
  const [experience, setExperience] = useState('Principiante'); // Default value
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [range, setRange] = useState('Principiante');
  const [country, setCountry] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
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
          console.log('User ID from token:', userId);
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
        
        // Store user ID for later use
        setUserId(userData._id || '');
        
        // If user already has complete profile data, go directly to Profile
        if (userData.age && userData.weight && userData.height) {
          console.log('User already has complete profile, navigating to Profile');
          navigation.navigate('Profile', userData);
        } else {
          // Otherwise, populate the form with any existing data
          setName(userData.name || userData.firstName || 'Usuario');
          setUserName(userData.userName || '');
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setEmail(userData.email || '');
          setRange(userData.range || 'Principiante');
          setCountry(userData.country || '');
          setAge(userData.age || '');
          setWeight(userData.weight || '');
          setHeight(userData.height || '');
          setGender(userData.gender || 'Male');
          setExperience(userData.experience || 'Beginner');
        }
      } catch (err) {
        console.error('Fetch settings error:', err);
        if (err.response) {
          console.log('Error response:', err.response.status, err.response.data);
        }
        if (err.response?.status === 401) navigation.navigate('Login');
        setError('Failed to load settings');
      }
    };
    
    fetchSettings();
  }, [navigation]);

  const handleDone = async () => {
    // Validate only the fields shown on this screen
    if (!height || !weight || !age || !gender || !experience) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      
      // Log the current userId state to debug
      console.log('Current userId state:', userId);
      
      // First, get the current user data to ensure we have the user ID
      const response = await apiService.getUser();
      
      console.log('API response data:', JSON.stringify(response.data));
      
      // Check if response.data is an array or object and extract user ID accordingly
      let uid;
      if (Array.isArray(response.data) && response.data.length > 0) {
        // If it's an array, use the first user's ID
        uid = response.data[0]._id;
        console.log('Found user ID in array:', uid);
      } else if (response.data && response.data._id) {
        // If it's an object with _id property
        uid = response.data._id;
        console.log('Found user ID in object:', uid);
      } else if (userId) {
        // Use the existing userId state if available
        uid = userId;
        console.log('Using existing userId state:', uid);
      }
      
      if (!uid) {
        console.error('Failed to get user ID from response:', response.data);
        setError('No se pudo obtener el ID de usuario');
        return;
      }
      
      // Create update object with only the fields we want to update
      const userSettings = {
        uid: uid,
        height,
        weight,
        age,
        gender,
        experience
      };

      // Add country if we have it
      if (country) {
        userSettings.country = country;
      }

      console.log('Sending update with data:', userSettings);

      await apiService.updateUser(userSettings);
      
      navigation.navigate('Profile', userSettings);
    } catch (err) {
      console.error('Save settings error:', err);
      if (err.response) {
        console.log('Error response:', err.response.status, err.response.data);
        if (err.response.data && typeof err.response.data === 'string') {
          setError(err.response.data.includes('ID de usuario') ? 
            'No se pudo identificar el usuario' : 'Error al guardar configuración');
        } else {
          setError('Error al guardar configuración');
        }
      } else {
        setError('Error al guardar configuración');
      }
    }
  };

  return (
    <ImageBackground source={require('./assets/fondo.jpg')} style={styles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ajustes</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.settingsContainer}>
          <Text style={styles.subtitle}>Edad</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Ingresa tu edad"
            placeholderTextColor="black"
            keyboardType="numeric"
          />
          <Text style={styles.subtitle}>Peso</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Ingresa tu peso"
            placeholderTextColor="black"
            keyboardType="numeric"
          />
          <Text style={styles.subtitle}>Altura</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Ingresa tu altura"
            placeholderTextColor="black"
            keyboardType="numeric"
          />
          <Text style={styles.subtitle}>Género:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Masculino" value="masculino" />
              <Picker.Item label="Femenino" value="femenino" />
              <Picker.Item label="No especificar" value="no especificar" />
            </Picker>
          </View>

          <Text style={styles.subtitle}>Experiencia:</Text>
          <View style={styles.experienceContainer}>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experience === 'Principiante' && styles.experienceButtonSelected,
              ]}
              onPress={() => setExperience('Principiante')}
            >
              <Text
                style={[
                  styles.experienceButtonText,
                  experience === 'Principiante' && styles.experienceButtonTextSelected,
                ]}
              >
                Principiante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experience === 'Avanzado' && styles.experienceButtonSelected,
              ]}
              onPress={() => setExperience('Avanzado')}
            >
              <Text
                style={[
                  styles.experienceButtonText,
                  experience === 'Avanzado' && styles.experienceButtonTextSelected,
                ]}
              >
                Avanzado
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.experienceButton,
                experience === 'Experto' && styles.experienceButtonSelected,
              ]}
              onPress={() => setExperience('Experto')}
            >
              <Text
                style={[
                  styles.experienceButtonText,
                  experience === 'Experto' && styles.experienceButtonTextSelected,
                ]}
              >
                Experto
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  settingsContainer: {
    width: '90%',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginTop: 10,
  },
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,
    backgroundColor: 'white',
    color: 'black',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
    color: 'black',
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  experienceButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  experienceButtonSelected: {
    backgroundColor: '#467d2a', // Optional: Change background when selected
    borderColor: '#467d2a',
  },
  experienceButtonText: {
    color: 'black',
    fontSize: 16,
  },
  experienceButtonTextSelected: {
    color: 'white', // Optional: Change text color when selected
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#467d2a',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 5,
    width: '90%',
  },
});

export default SettingsScreen;
