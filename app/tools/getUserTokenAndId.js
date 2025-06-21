import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserTokenAndId = async (navigation) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token || token === undefined) return navigation.reset({ index: 0, routes: [{ name: 'Login' }] });//Si no hay token, no está logueado

    const userId = await AsyncStorage.getItem('userId');   
    if (!userId || userId === undefined) return navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
    
    return { token, userId }
}