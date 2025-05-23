import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Alert, Modal } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import seedIcon from '../seed.png';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { tips } from '../content/mapFitnessTips'
// import LinearGradient from 'react-native-linear-gradient'; // Removed
import { mapScreenStyles } from '../styles/mapScreenStyles';
import { customNightMap } from '../styles/customMapStyle';

// Import API service
import apiService from '../services/api.service';
import { getUserTokenAndId } from '../tools/getUserTokenAndId';

const Speedometer = ({ speed }) => {
    return (
        <View style={mapScreenStyles.speedometerContainer}>
            <Text style={mapScreenStyles.speedometerText}>Velocidad: {speed.toFixed(2)} km/h</Text>
        </View>
    );
};

const getRandomTip = () => {
    return tips[Math.floor(Math.random() * tips.length)];
};

const MapScreen = () => {
    const navigation = useNavigation();
    const [initialRegion, setInitialRegion] = useState(null);
    const [userId, setUserId] = useState(null);
    //const [token, setToken] = useState(null);

    // Get user token and ID on component mount
    useEffect(() => {
        async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            setUserId(userId)
        }
        getUserData();
    }, []);

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                // Set a closer zoom level for better visibility
                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.01, // Smaller value = more zoomed in (was 0.0922)
                    longitudeDelta: 0.01, // Smaller value = more zoomed in (was 0.0421)
                };
                setInitialRegion(region);
                setMarkerPosition({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.log('Geolocation error:', error);
                // If there's an error, set a default region but with a visual indicator
                Alert.alert(
                    "Error de ubicación",
                    "No se pudo obtener tu ubicación actual. Verifica los permisos de ubicación.",
                    [{ text: "OK" }]
                );
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }, []);


    const [kilometer, setKilometer] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [tipsModalVisible, setTipsModalVisible] = useState(false);
    const [tip, setTip] = useState('');
    const [countdownVisible, setCountdownVisible] = useState(false);
    const [realGps, setRealGps] = useState(true);
    const mapViewRef = useRef(null);

    // Add a state to track if we should follow the user location
    const [followUserLocation, setFollowUserLocation] = useState(true);

    const finishRun = async () => {
        try {
            // Calculate average speed
            const avgSpeed = kilometer > 0 ? (kilometer / (seconds / 3600)) : 0;

            // Estimate calories burned (simple formula)
            // MET value for running ~7-10 depending on speed
            const MET = 8;
            const userWeight = await AsyncStorage.getItem('userWeight') || 70; // Default to 70kg if not set
            const caloriesBurned = (MET * parseFloat(userWeight) * (seconds / 3600));

            // Prepare session data for backend
            const sessionData = {
                uid: userId,
                distance: parseFloat(kilometer.toFixed(2)),
                speedAvg: parseFloat(avgSpeed.toFixed(2)),
                heartRateAvg: 0, // Would need heart rate monitor integration
                calories: Math.round(caloriesBurned),
                time: seconds
            };

            // Get the selected challenge
            const selectedChallenge = await AsyncStorage.getItem('selectedChallenge');

            // Save session to backend
            const response = await apiService.saveSession(sessionData);
            console.log('Session saved to backend:', response.data);

            // Update challenge progress if there's an active challenge
            if (selectedChallenge) {
                try {
                    console.log('Selected challenge:', selectedChallenge);

                    // Get the actual goal ID from the selected challenge
                    // This assumes selectedChallenge is the actual MongoDB ObjectId
                    // If it's not, we need to look up the actual goal ID

                    // Update the user's goal progress
                    await apiService.updateUserGoalProgress(userId, selectedChallenge, parseFloat(kilometer.toFixed(2)), seconds);
                    console.log('Challenge progress updated');
                } catch (error) {
                    console.error('Error updating challenge progress:', error);
                    // Don't show an alert to the user, just log the error
                }
            }

            // Still save locally for the result screen
            const runData = {
                date: moment().format('YYYY-MM-DD'),
                time: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`,
                kilometers: kilometer.toFixed(2),
                pace: kilometer > 0 ? (seconds / kilometer / 60).toFixed(2) : 0,
                pathCoordinates: pathCoordinates.filter(coord =>
                    coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number'
                ),
            };

            navigation.navigate('ResultScreen', {
                kilometers: parseFloat(kilometer.toFixed(2)),
                time: seconds,
                pathCoordinates: runData.pathCoordinates,
                avgSpeed: parseFloat(avgSpeed.toFixed(2)),
                calories: Math.round(caloriesBurned)
            });
        } catch (error) {
            console.error('Error storing session data:', error);
            Alert.alert('Error', 'No se pudo guardar los datos de la sesión');
        }
    };

    const generateRandomSpeed = () => {
        return Math.random() * 20;
    };

    const updateMarkerPosition = (position) => {
        if (!position || typeof position.latitude !== 'number' || typeof position.longitude !== 'number') {
            console.warn('Invalid position provided to updateMarkerPosition:', position);
            return;
        }

        setMarkerPosition(position);
        setPathCoordinates((prevCoords) => [...prevCoords, position]);

        // Only animate the camera if we're in running mode
        if (mapViewRef.current && isRunning) {
            mapViewRef.current.animateCamera({
                center: position,
                pitch: 45, // Increased pitch for better perspective (was 2)
                heading: 0, // North-up orientation
                altitude: 500, // Add some altitude for perspective
                zoom: 17, // Higher zoom level for better visibility
            }, { duration: 1000 });
        }
    };

    const incrementKilometer = (speed) => {
        const distanceInKm = speed / 3600;
        setKilometer((prevKilometer) => prevKilometer + distanceInKm);
    };

    const incrementSeconds = () => {
        setSeconds((prevSeconds) => prevSeconds + 1);
    };

    const startChronometer = () => {
        setCountdown(10);
        setCountdownVisible(true);
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(countdownInterval);
                    setIsRunning(true);
                    setSeconds(0);
                    setKilometer(0);
                    setPathCoordinates([]);
                    setTipsModalVisible(false);
                    setCountdownVisible(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopChronometer = () => {
        setIsRunning(false);
        finishRun();
    };

    useEffect(() => {
        let watchId = null;

        // Start watching position regardless of whether a session is running
        watchId = Geolocation.watchPosition(
            (position) => {
                const newPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                // Always update marker position
                setMarkerPosition(newPosition);

                // Only add to path coordinates if running
                if (isRunning) {
                    setPathCoordinates((prevCoords) => [...prevCoords, newPosition]);
                    const speed = position.coords.speed !== null ? position.coords.speed * 3.6 : 0;
                    setCurrentSpeed(speed);
                    incrementKilometer(speed);
                    incrementSeconds();
                }

                // Animate camera if following user location
                if (followUserLocation && mapViewRef.current) {
                    mapViewRef.current.animateCamera({
                        center: newPosition,
                        pitch: 45,
                        heading: 0,
                        altitude: 500,
                        zoom: 17,
                    }, { duration: 1000 });
                }
            },
            (error) => console.log('Watch position error:', error),
            { enableHighAccuracy: true, distanceFilter: 5, interval: 1000 }
        );

        return () => {
            if (watchId) Geolocation.clearWatch(watchId);
        };
    }, [followUserLocation, isRunning]);

    const kilometerText = kilometer.toFixed(2);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const currentSpeedText = currentSpeed.toFixed(2);

    const showTips = () => {
        setTip(getRandomTip());
        setTipsModalVisible(true);
    };

    const viewRunHistory = async () => {
        try {
            const existingRuns = await AsyncStorage.getItem('runs');
            const runsArray = existingRuns ? JSON.parse(existingRuns) : [];
            navigation.navigate('HistoryScreen', { runs: runsArray });
        } catch (error) {
            console.error('Error retrieving run history:', error);
            Alert.alert('Error', 'No se pudo cargar el historial de recorridos.');
        }
    };

    // Navigation handlers
    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleChallengesPress = () => {
        navigation.navigate('Challenges');
    };

    const handleNewsPress = () => {
        Alert.alert('Noticias', 'Sección de noticias próximamente');
    };

    // Add this function to center the map on the current location
    const centerMapOnUser = () => {
        if (mapViewRef.current && markerPosition) {
            mapViewRef.current.animateCamera({
                center: markerPosition,
                pitch: 45,
                heading: 0,
                altitude: 500,
                zoom: 17,
            }, { duration: 1000 });

            // Enable following user location
            setFollowUserLocation(true);
        }
    };

    // Add a function to handle map drag (to disable following)
    const handleMapDrag = () => {
        setFollowUserLocation(false);
    };

    return (
        <View style={mapScreenStyles.container}>
            <View style={mapScreenStyles.topGradient}>
                <View style={mapScreenStyles.infoContainer}></View>

                <View style={mapScreenStyles.tableContainer}>
                    <Text style={mapScreenStyles.tableHeader}>Tiempo  Distancia   Velocidad</Text>
                    <Text style={mapScreenStyles.tableRow}>{`${minutes}:${remainingSeconds.toString().padStart(2, '0')}          ${kilometerText} km           ${currentSpeedText} km/h`}</Text>
                </View>

                {/* Media control buttons commented out
                <View style={mapScreenStyles.row}>
                    <TouchableOpacity style={mapScreenStyles.button}>
                        <Icon name="play-back-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={mapScreenStyles.button}>
                        <Icon name="play-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={mapScreenStyles.button}>
                        <Icon name="stop-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={mapScreenStyles.button}>
                        <Icon name="play-forward-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                */}
            </View>

            {initialRegion ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={mapScreenStyles.map}
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    followsUserLocation={followUserLocation}
                    showsMyLocationButton={false}
                    ref={mapViewRef}
                    onPanDrag={handleMapDrag}
                    customMapStyle={customNightMap}
                >
                    {pathCoordinates.length > 0 && (
                        <Polyline coordinates={pathCoordinates} strokeColor="green" strokeWidth={4} />
                    )}
                    {markerPosition && (
                        <Marker
                            coordinate={markerPosition}
                            title="Punto de ubicación"
                            description="Esta es la ubicación en movimiento."
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <Image source={seedIcon} style={{ width: 50, height: 50 }} />
                        </Marker>
                    )}
                </MapView>
            ) : (
                <View>
                    <View style={mapScreenStyles.loadingContainer}>
                        <Text style={mapScreenStyles.loadingText}>Obteniendo ubicación...</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[
                    mapScreenStyles.centerMapButton,
                    followUserLocation ? mapScreenStyles.centerMapButtonActive : {}
                ]}
                onPress={centerMapOnUser}
            >
                <Icon
                    name="locate"
                    size={24}
                    color={followUserLocation ? "#FFFFFF" : "#457d2b"} // Changed from #457b2f to #457d2b
                />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={tipsModalVisible}
                onRequestClose={() => setTipsModalVisible(false)}
            >
                <View style={mapScreenStyles.modalContainer}>
                    <View style={mapScreenStyles.modalView}>
                        <Text style={mapScreenStyles.modalText}>Consejo para correr:</Text>
                        <Text>{tip}</Text>
                        <TouchableOpacity
                            style={mapScreenStyles.startButton}
                            onPress={() => {
                                setTipsModalVisible(false);
                                startChronometer();
                            }}
                            disabled={countdown > 0}
                        >
                            <Text style={mapScreenStyles.buttonText}>{countdown > 0 ? `Listo (${countdown})` : 'Iniciar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={countdownVisible}>
                <View style={mapScreenStyles.countdownModalContainer}>
                    <Text style={mapScreenStyles.countdownText}>{countdown > 0 ? countdown : 0}</Text>
                </View>
            </Modal>

            <TouchableOpacity
                style={mapScreenStyles.floatingButton}
                onPress={isRunning ? stopChronometer : showTips}
                disabled={countdown > 0 && !isRunning}
            >
                <Text style={mapScreenStyles.buttonText}>{isRunning ? 'Terminar' : countdown > 0 ? `Iniciar` : 'Iniciar'}</Text>
            </TouchableOpacity>

            <View style={mapScreenStyles.bottomNav}>
                <TouchableOpacity style={mapScreenStyles.navItem} onPress={handleProfilePress}>
                    <Icon name="rocket" size={30} color="#FFFFFF" />
                    <Text style={mapScreenStyles.navText}>Progreso</Text>
                </TouchableOpacity>

                <TouchableOpacity style={mapScreenStyles.navItem} onPress={handleChallengesPress}>
                    <Icon name="trophy" size={30} color="#FFFFFF" />
                    <Text style={mapScreenStyles.navText}>Desafíos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MapScreen;
