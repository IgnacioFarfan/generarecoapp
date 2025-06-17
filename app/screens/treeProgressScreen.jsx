import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { profileStyles } from '../styles/profileStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import { getTreeImage } from '../tools/getTreeImage';

const TreeProgressScreen = () => {
    const navigation = useNavigation();

    const [userTotalDistance, setUserTotalDistance] = useState(0);

    useEffect(() => {
        async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            const totalDistance = await apiService.getUserTotalDistance(userId);
            setUserTotalDistance(totalDistance.data.totalKilometers)
        }
        getUserData();
    }, []);

    return (
        <View style={profileStyles.treeContainer}>
            <Text style={profileStyles.chartTitle}>Tu Progreso</Text>
            <Image
                source={getTreeImage(userTotalDistance)}
                style={profileStyles.treeImage}
                resizeMode="contain"
            />
            <Text style={profileStyles.treeProgressText}>
                {userTotalDistance.toFixed(2)} / 100 km ({Math.min(Math.floor((userTotalDistance / 100) * 100), 100)}%)
            </Text>
            <Text style={profileStyles.treeDescription}>
                ¡Tu actividad está ayudando a que este árbol crezca! Completa 100 km para verlo en su máximo esplendor.
            </Text>
        </View>
    );
}


export default TreeProgressScreen;