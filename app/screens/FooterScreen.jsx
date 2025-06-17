import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { profileStyles } from '../styles/profileStyles'

const FooterScreen = () => {
    const navigation = useNavigation();

    const handleMapPress = () => {
        navigation.navigate('Map');
    };

    const handleProgressPress = () => {
        navigation.navigate('Progress');
    };

    const handleChallengesPress = () => {
        navigation.navigate('Challenges');
    };

    return (
            <View style={profileStyles.bottomNav}>
                <TouchableOpacity style={profileStyles.navItem} onPress={handleProgressPress}>
                    <Text style={profileStyles.navText}>Progreso</Text>
                </TouchableOpacity>

                <TouchableOpacity style={profileStyles.navItem} onPress={handleMapPress}>
                    <Text style={profileStyles.navText}>Mapa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={profileStyles.navItem} onPress={handleChallengesPress}>
                    <Text style={profileStyles.navText}>Desafíos</Text>
                </TouchableOpacity>
            </View>
    );
};

export default FooterScreen;