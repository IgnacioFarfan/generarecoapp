import { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ImageBackground, SafeAreaView, Platform, StatusBar } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import moment from 'moment';
import apiService from '../services/api.service';
import { resultScreenStyles } from '../styles/resultScreenStyles'
import { useNavigation } from '@react-navigation/native';

const ResultScreen = ({ route }) => {
    const navigation = useNavigation();
    const { kilometers, time, pathCoordinates, avgSpeed, calories } = route.params;
    const mapRef = useRef(null);
    const viewShotRef = useRef(null);
    const [showParciales, setShowParciales] = useState(false);
    const [parciales, setParciales] = useState([]);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [sessionSaved, setSessionSaved] = useState(false);

    const averagePace = (time > 0) ? (time / kilometers) * 60 : 0; // Average pace in seconds per kilometer
    const avgMinutes = Math.floor(averagePace / 60);
    const avgSeconds = Math.round(averagePace % 60);

    // Get user token and ID on component mount
    useEffect(() => {
        async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            setUserId(userId)
            setToken(token);
        }
        getUserData();
    }, []);

    // Verify session was saved or save it if not
    useEffect(() => {
        const checkSessionSaved = async () => {
            if (userId && token && !sessionSaved) {
                try {
                    // Check if this session was already saved by getting recent sessions
                    const response = await apiService.getUserSessions(userId);

                    const recentSessions = response.data;
                    const currentTime = new Date().getTime();

                    // Check if there's a session saved in the last 5 minutes with similar distance
                    const recentlySaved = recentSessions.some(session => {
                        const sessionTime = new Date(session.sessionDate).getTime();
                        const timeDiff = (currentTime - sessionTime) / (1000 * 60); // difference in minutes
                        const distanceDiff = Math.abs(session.distance - kilometers);

                        return timeDiff < 5 && distanceDiff < 0.1;
                    });

                    if (!recentlySaved) {
                        // Session not found, save it
                        await saveSession();
                    } else {
                        console.log('Session already saved');
                        setSessionSaved(true);
                    }
                } catch (error) {
                    console.error('Error checking session:', error);
                    // Try to save anyway
                    await saveSession();
                }
            }
        };

        checkSessionSaved();
    }, [userId, token]);

    const saveSession = async () => {
        try {
            // Validate userId exists
            if (!userId) {
                console.error('Cannot save session: User ID is missing');
                return;
            }

            // Format values exactly like in MapScreen.js
            const distance = parseFloat(kilometers.toFixed(2));
            const speed = parseFloat(avgSpeed ? avgSpeed.toFixed(2) : (kilometers > 0 ? (kilometers / (time / 3600)).toFixed(2) : '0.00'));
            const heartRate = 0;
            const sessionCalories = Math.round(calories || (8 * 70 * (time / 3600)));
            const sessionTime = time;

            // Create session data exactly like in MapScreen.js
            const sessionData = {
                uid: userId,
                distance: distance,
                speedAvg: speed,
                heartRateAvg: heartRate,
                calories: sessionCalories,
                time: sessionTime
            };

            console.log('Saving session data from ResultScreen:', sessionData);

            // Use apiService like in MapScreen.js
            const response = await apiService.saveSession(sessionData);

            console.log('Session saved to backend successfully:', response.data);
            setSessionSaved(true);
        } catch (error) {
            console.error('Error saving session:', error);

            // More detailed error logging
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }

            console.error('Failed to save session to server');
        }
    };

    useEffect(() => {
        if (pathCoordinates.length > 0) {
            const coordinates = pathCoordinates.map(coord => {
                return { latitude: coord.latitude, longitude: coord.longitude };
            });

            // Calculate parciales
            calculateParciales(coordinates);

            // Find the bounding box
            const latitudes = coordinates.map(coord => coord.latitude);
            const longitudes = coordinates.map(coord => coord.longitude);
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLong = Math.min(...longitudes);
            const maxLong = Math.max(...longitudes);

            const fitCoordinates = [
                { latitude: minLat, longitude: minLong },
                { latitude: maxLat, longitude: maxLong },
            ];

            // Fit the map to the coordinates
            mapRef.current.fitToCoordinates(fitCoordinates, {
                edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
                animated: true,
            });
        }
    }, [pathCoordinates]);

    const calculateParciales = (coordinates) => {
        const parcialesList = []; // Array to hold the parcial results
        const segmentDistance = kilometers / coordinates.length;

        let accumulatedTime = 0; // Time accumulator for each segment

        coordinates.forEach((coord, index) => {
            if (index > 0) {
                accumulatedTime += Math.round(time / coordinates.length);
                const parcialTime = Math.floor(accumulatedTime / 60);
                const parcialSeconds = accumulatedTime % 60;

                parcialesList.push({
                    km: ((index + 1) * segmentDistance).toFixed(2),
                    time: `${parcialTime}:${parcialSeconds.toString().padStart(2, '0')} min`,
                });
            }
        });

        setParciales(parcialesList);
    };

    const shareResults = async () => {
        if (viewShotRef.current) {
            try {
                const uri = await viewShotRef.current.capture();

                const shareOptions = {
                    title: 'Compartir mi Actividad',
                    message: `¡Completé ${kilometers.toFixed(2)} km en ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')} min con un ritmo promedio de ${avgMinutes}:${avgSeconds.toString().padStart(2, '0')} min/km y quemé ${calories || Math.round((8 * 70 * (time / 3600)))} calorías!`,
                    url: uri,
                };

                await Share.open(shareOptions);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        }
    };

    return (
        <SafeAreaView style={resultScreenStyles.safeArea}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={resultScreenStyles.viewShotContainer}>
                <ScrollView
                    contentContainerStyle={resultScreenStyles.scrollContainer}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <ImageBackground
                        source={require('../assets/fondo4.jpg')}
                        style={resultScreenStyles.backgroundImage}
                        resizeMode="cover"
                    >
                        <View style={resultScreenStyles.contentContainer}>
                            <Text style={resultScreenStyles.title}>Resumen de Actividad</Text>
                            <View style={resultScreenStyles.resultContainer}>
                                <Text style={resultScreenStyles.resultText}>Kilómetros: <Text style={resultScreenStyles.highlight}>{kilometers.toFixed(2)} km</Text></Text>
                                <Text style={resultScreenStyles.resultText}>Tiempo: <Text style={resultScreenStyles.highlight}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')} min</Text></Text>
                                <Text style={resultScreenStyles.resultText}>Ritmo Promedio: <Text style={resultScreenStyles.highlight}>{avgMinutes}:{avgSeconds.toString().padStart(2, '0')} min/km</Text></Text>
                                <Text style={resultScreenStyles.resultText}>Velocidad: <Text style={resultScreenStyles.highlight}>{avgSpeed ? avgSpeed.toFixed(2) : (kilometers > 0 ? (kilometers / (time / 3600)).toFixed(2) : '0.00')} km/h</Text></Text>
                                <Text style={resultScreenStyles.resultText}>Calorías: <Text style={resultScreenStyles.highlight}>{calories || Math.round((8 * 70 * (time / 3600)))} kcal</Text></Text>
                                <Text style={resultScreenStyles.resultText}>Fecha: <Text style={resultScreenStyles.highlight}>{moment().format('DD/MM/YYYY HH:mm')}</Text></Text>
                            </View>

                            <MapView
                                ref={mapRef}
                                style={resultScreenStyles.map}
                                initialRegion={{
                                    latitude: pathCoordinates[0]?.latitude || 0,
                                    longitude: pathCoordinates[0]?.longitude || 0,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                            >
                                {pathCoordinates.length > 0 && (
                                    <Polyline coordinates={pathCoordinates} strokeColor="#467d2a" strokeWidth={4} />
                                )}
                            </MapView>

                            <TouchableOpacity style={resultScreenStyles.button} onPress={() => setShowParciales(!showParciales)}>
                                <Text style={resultScreenStyles.buttonText}>{showParciales ? 'Ocultar Parciales' : 'Mostrar Parciales'}</Text>
                            </TouchableOpacity>

                            {showParciales && (
                                <ScrollView style={resultScreenStyles.parcialesContainer} nestedScrollEnabled={true}>
                                    {parciales.map((parcial, index) => (
                                        <Text key={index} style={resultScreenStyles.parcialText}>
                                            Km {parcial.km}: {parcial.time}
                                        </Text>
                                    ))}
                                </ScrollView>
                            )}

                            <TouchableOpacity style={resultScreenStyles.button} onPress={shareResults}>
                                <Text style={resultScreenStyles.buttonText}>Compartir Resultados</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={resultScreenStyles.button} onPress={() => navigation.navigate('Profile')}>
                                <Text style={resultScreenStyles.buttonText}>Volver al Perfil</Text>
                            </TouchableOpacity>

                            {/* Add padding view to ensure content is fully visible */}
                            <View style={resultScreenStyles.bottomPadding} />
                        </View>
                    </ImageBackground>
                </ScrollView>
            </ViewShot>
        </SafeAreaView>
    );
};

export default ResultScreen;
