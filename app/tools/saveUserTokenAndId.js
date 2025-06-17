import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserTokenAndId = async (token, uid) => {
    if (token) await AsyncStorage.setItem('userToken', token);//Guardamos tanto el token como el id
    if (uid) await AsyncStorage.setItem('userId', uid);
    return;
}