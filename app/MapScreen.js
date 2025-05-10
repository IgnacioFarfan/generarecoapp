import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Alert, Modal } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import seedIcon from './seed.png';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { jwtDecode } from 'jwt-decode';
// import LinearGradient from 'react-native-linear-gradient'; // Removed

// Import API service
import apiService from './services/api.service';

const Speedometer = ({ speed }) => {
    return (
        <View style={styles.speedometerContainer}>
            <Text style={styles.speedometerText}>Velocidad: {speed.toFixed(2)} km/h</Text>
        </View>
    );
};

const tips = [
    "Para tener suficiente energía, es recomendable incorporar hidratos de carbono que aporten energía rápida en tu comida anterior al entrenamiento. Algunas opciones pueden ser: avena, arroz, pan, fruta, pasta, etc.",
    "Si tu entrenamiento es mayor a 75 minutos, puedes llevar alguna opción con hidratos de carbono para mantener tu energía, reservar tu glucógeno y, de esta forma, proteger la masa muscular. Por ejemplo: 1 banana, 1 bebida deportiva casera, un puñado pequeño de pasas de uva, bolitas de arroz, etc. Es importante que no contengan grasas, proteínas ni fibras para no generar malestar digestivo. Esto se repite si tu entrenamiento es mayor a 120 minutos.",
    "Mantén una hidratación adecuada, aproximadamente 500 cc por hora. Esto puede variar de acuerdo al clima y al tamaño corporal de cada deportista.",
    "Para acompañar tu actividad deportiva, elige frutas y verduras locales y de temporada. Estas no solo son más frescas, sino que también reducen la huella de carbono.",
    "Recuerda que el ejercicio y la alimentación adecuada están relacionados con la prevención y la disminución del riesgo de cualquier tipo de enfermedad relacionada con el envejecimiento. Está en nuestros hábitos el secreto para mantenernos jóvenes, saludables y fuertes."
];

const getRandomTip = () => {
    return tips[Math.floor(Math.random() * tips.length)];
};

const MapScreen = () => {
    const [initialRegion, setInitialRegion] = useState(null);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    
    // Get user token and ID on component mount
    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    setToken(storedToken);
                    try {
                        const decoded = jwtDecode(storedToken);
                        if (decoded && decoded.id) {
                            setUserId(decoded.id);
                            console.log('User ID found:', decoded.id);
                        }
                    } catch (error) {
                        console.error('Error decoding token:', error);
                    }
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        
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

    const navigation = useNavigation();

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
        <View style={styles.container}>
            <View style={styles.topGradient}>
                <View style={styles.infoContainer}></View>

                <View style={styles.tableContainer}>
                    <Text style={styles.tableHeader}>Tiempo  Distancia   Velocidad</Text>
                    <Text style={styles.tableRow}>{`${minutes}:${remainingSeconds.toString().padStart(2, '0')}          ${kilometerText} km           ${currentSpeedText} km/h`}</Text>
                </View>

                {/* Media control buttons commented out
                <View style={styles.row}>
                    <TouchableOpacity style={styles.button}>
                        <Icon name="play-back-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Icon name="play-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Icon name="stop-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Icon name="play-forward-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                */}
            </View>

            {initialRegion ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    followsUserLocation={followUserLocation}
                    showsMyLocationButton={false}
                    ref={mapViewRef}
                    onPanDrag={handleMapDrag}
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
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
                </View>
            )}

            <TouchableOpacity 
                style={[
                    styles.centerMapButton, 
                    followUserLocation ? styles.centerMapButtonActive : {}
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Consejo para correr:</Text>
                        <Text>{tip}</Text>
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => {
                                setTipsModalVisible(false);
                                startChronometer();
                            }}
                            disabled={countdown > 0}
                        >
                            <Text style={styles.buttonText}>{countdown > 0 ? `Listo (${countdown})` : 'Iniciar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={countdownVisible}>
                <View style={styles.countdownModalContainer}>
                    <Text style={styles.countdownText}>{countdown > 0 ? countdown : 0}</Text>
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={isRunning ? stopChronometer : showTips}
                disabled={countdown > 0 && !isRunning}
            >
                <Text style={styles.buttonText}>{isRunning ? 'Terminar' : countdown > 0 ? `Iniciar` : 'Iniciar'}</Text>
            </TouchableOpacity>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={handleProfilePress}>
                    <Icon name="person-circle" size={30} color="#FFFFFF" />
                    <Text style={styles.navText}>Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={handleChallengesPress}>
                    <Icon name="trophy" size={30} color="#FFFFFF" />
                    <Text style={styles.navText}>Desafíos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topGradient: {
        width: '100%',
        paddingTop: StatusBar.currentHeight || 20,
        backgroundColor: 'rgba(0,0,0,1)', //  black
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
    },
    button: {
        flexDirection: 'column',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    tableContainer: {
        padding: 10,
        alignItems: 'center',
    },
    tableHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tableRow: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    infoContainer: {
        padding: 10,
        alignItems: 'center',
    },
    map: {
        flex: 1,
        marginBottom: 60, // Keep space for bottom nav
    },
    floatingButton: {
        position: 'absolute',
        bottom: 100, // Adjusted to sit above nav bar
        left: '50%',
        marginLeft: -35,
        width: 70,
        height: 70,
        backgroundColor: '#457d2b', // Changed from #AEBE38 to #457d2b
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: 'rgba(0,0,0,1)', // black
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        color: 'white',
        fontSize: 12,
    },
    centerMapButton: {
        position: 'absolute',
        bottom: 140, // Moved from top:20 to bottom:140 to position it above the floating button
        right: 20,
        backgroundColor: 'white',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    centerMapButtonActive: {
        backgroundColor: '#457d2b', // Changed from #457b2f to #457d2b for consistency
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    startButton: {
        backgroundColor: '#457d2b',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
        minWidth: 100,
        alignItems: 'center',
    },
    countdownModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    countdownText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#457d2b',
    },
});

export default MapScreen;
