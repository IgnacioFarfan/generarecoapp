import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ImageBackground, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { profileStyles } from '../styles/profileStyles'
import InfoProgressScreen from './infoProgressScreen';
import TreeProgressScreen from './treeProgressScreen';
import FooterScreen from './FooterScreen';

const ProgressScreen = () => {

    const [activeTab, setActiveTab] = useState('tree'); // 'info' o 'tree'
    
    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        try {
            const message = `https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox ¡Hola! Estoy usando la app de Generar ECO. ¡Únete a mí en esta aventura!`;
            await Share.share({ message });
        } catch (error) {
            Alert.alert('Error', 'No se pudo compartir el mensaje.');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/fondo3.jpg')}
            style={profileStyles.container}
            resizeMode="cover"
        >
            <TouchableOpacity style={profileStyles.shareIconContainer} onPress={handleShare}>
                <Icon name="share-social" size={30} color="white" />
            </TouchableOpacity>

            <View style={profileStyles.tabContainer}>
                <TouchableOpacity
                    style={[profileStyles.tab, activeTab === 'tree' ? profileStyles.activeTab : null]}
                    onPress={() => setActiveTab('tree')}
                >
                    <Text style={[profileStyles.tabText, activeTab === 'tree' ? profileStyles.activeTabText : null]}>Progreso</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[profileStyles.tab, activeTab === 'info' ? profileStyles.activeTab : null]}
                    onPress={() => setActiveTab('info')}
                >
                    <Text style={[profileStyles.tabText, activeTab === 'info' ? profileStyles.activeTabText : null]}>Info</Text>
                </TouchableOpacity>
            </View>
            
            {activeTab === 'info' ? <InfoProgressScreen /> : <TreeProgressScreen />}


            <FooterScreen />
        </ImageBackground>
    );
};

export default ProgressScreen;