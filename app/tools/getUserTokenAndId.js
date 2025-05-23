import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserTokenAndId = async (navigation) => {
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {//Si no hay token, no está logueado
        navigation.navigate('Login');
        return;
    }

    const userId = await AsyncStorage.getItem('userId');    

    return { token, userId }
}