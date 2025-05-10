import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground, SafeAreaView, Platform, StatusBar } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import apiService from './services/api.service';

const ResultScreen = ({ navigation, route }) => {
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
        const getUserData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    setToken(storedToken);
                    try {
                        const decoded = jwtDecode(storedToken);
                        if (decoded && decoded.id) {
                            setUserId(decoded.id);
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
        <SafeAreaView style={styles.safeArea}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.viewShotContainer}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <ImageBackground 
                        source={require('./assets/fondo4.jpg')} 
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    >
                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>Resumen de Actividad</Text>
                            <View style={styles.resultContainer}>
                                <Text style={styles.resultText}>Kilómetros: <Text style={styles.highlight}>{kilometers.toFixed(2)} km</Text></Text>
                                <Text style={styles.resultText}>Tiempo: <Text style={styles.highlight}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')} min</Text></Text>
                                <Text style={styles.resultText}>Ritmo Promedio: <Text style={styles.highlight}>{avgMinutes}:{avgSeconds.toString().padStart(2, '0')} min/km</Text></Text>
                                <Text style={styles.resultText}>Velocidad: <Text style={styles.highlight}>{avgSpeed ? avgSpeed.toFixed(2) : (kilometers > 0 ? (kilometers / (time / 3600)).toFixed(2) : '0.00')} km/h</Text></Text>
                                <Text style={styles.resultText}>Calorías: <Text style={styles.highlight}>{calories || Math.round((8 * 70 * (time / 3600)))} kcal</Text></Text>
                                <Text style={styles.resultText}>Fecha: <Text style={styles.highlight}>{moment().format('DD/MM/YYYY HH:mm')}</Text></Text>
                            </View>

                            <MapView
                                ref={mapRef}
                                style={styles.map}
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

                            <TouchableOpacity style={styles.button} onPress={() => setShowParciales(!showParciales)}>
                                <Text style={styles.buttonText}>{showParciales ? 'Ocultar Parciales' : 'Mostrar Parciales'}</Text>
                            </TouchableOpacity>

                            {showParciales && (
                                <ScrollView style={styles.parcialesContainer} nestedScrollEnabled={true}>
                                    {parciales.map((parcial, index) => (
                                        <Text key={index} style={styles.parcialText}>
                                            Km {parcial.km}: {parcial.time}
                                        </Text>
                                    ))}
                                </ScrollView>
                            )}

                            <TouchableOpacity style={styles.button} onPress={shareResults}>
                                <Text style={styles.buttonText}>Compartir Resultados</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
                                <Text style={styles.buttonText}>Volver al Perfil</Text>
                            </TouchableOpacity>
                            
                            {/* Add padding view to ensure content is fully visible */}
                            <View style={styles.bottomPadding} />
                        </View>
                    </ImageBackground>
                </ScrollView>
            </ViewShot>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingTop: 40,
        paddingBottom: 20,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
        textAlign: 'center',
    },
    resultContainer: {
        backgroundColor: 'rgba(70, 125, 42, 0.8)',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        marginBottom: 20,
        width: '90%',
        alignSelf: 'center',
    },
    resultText: {
        fontSize: 16,
        marginVertical: 5,
        color: 'white',
    },
    highlight: {
        fontWeight: 'bold',
        color: 'white',
    },
    map: {
        height: 300,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    parcialesContainer: {
        maxHeight: 150,
        marginTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 5,
        width: '90%',
        alignSelf: 'center',
    },
    parcialText: {
        fontSize: 14,
        marginVertical: 3,
        color: '#555',
    },
    button: {
        backgroundColor: '#467d2a',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 8,
        width: '90%',
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    viewShotContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bottomPadding: {
        height: 100, // Adjust this value as needed
    },
});

export default ResultScreen;
