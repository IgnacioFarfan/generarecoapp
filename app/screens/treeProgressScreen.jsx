import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api.service';
import { profileStyles } from '../styles/profileStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import { getTreeImage } from '../tools/getTreeImage';
import Icon from 'react-native-vector-icons/Ionicons';

const TreeProgressScreen = () => {
    const navigation = useNavigation();

    const [userTotalDistance, setUserTotalDistance] = useState(0);
    const [userMedals, setUserMedals] = useState([]);
    const [userMedalsLength, setUserMedalsLength] = useState(null);

    useEffect(() => {
        async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            const totalDistance = await apiService.getUserTotalDistance(userId);
            setUserTotalDistance(totalDistance.data.totalKilometers)
            const medals = await apiService.getUserMedalProgress(userId);

            setUserMedalsLength(medals.data.length)
            setUserMedals(medals.data)
            //console.log('medals length:', userMedalsLength);
            console.log('medals:', userMedals);
        }
        getUserData();
    }, []);

    const renderUserMedals = (medal, index) => {
        switch (medal.medalStatus) {
            case true:
                return (
                    <>
                        <View key={medal._id}  style={profileStyles.medalInfo}>
                            <Image
                                source={{ uri: medal.icon }}
                                style={profileStyles.medalIcon}
                                resizeMode="contain"
                            />
                            <Text style={profileStyles.medalTitle}>{medal.name}</Text>
                        </View>

                        {index < userMedalsLength - 1 &&
                            <Icon key={index} name="arrow-forward-circle-outline" size={30} color="white" />
                        }
                    </>
                );

            case false:
                return (
                    <>
                        <View key={medal._id} style={profileStyles.medalInfo}>
                            <Image
                                source={{ uri: medal.icon }}
                                style={[profileStyles.medalIcon, { tintColor: 'rgb(160, 158, 158)' }]}
                                resizeMode="contain"
                            />
                            <Text style={profileStyles.medalTitle}>{medal.name}</Text>
                        </View>

                        {index < userMedalsLength - 1 &&
                            <Icon key={index + 10}  name="arrow-forward-circle-outline" size={30} color="white" />
                        }
                    </>
                );

            default:
                return null;
        }
    }

    return (
        <>
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
            <Text style={profileStyles.medalTitleDescription}>
                Tus medallas ganadas
            </Text>
            <View style={profileStyles.medalContainer}>
                {userMedals.length > 0 && userMedals.map(renderUserMedals)}
            </View>
        </>
    );
}


export default TreeProgressScreen;