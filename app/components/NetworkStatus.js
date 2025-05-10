import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
// Uncomment after installing NetInfo
// import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [visible, setVisible] = useState(false);
  const translateY = new Animated.Value(-50);

  // Uncomment after installing NetInfo
  /*
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      if (!state.isConnected) {
        setVisible(true);
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (visible) {
        // If we're connected but the banner is visible, hide it after a delay
        setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setVisible(false));
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [visible]);
  */

  // For now, return null until NetInfo is installed
  return null;

  /*
  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: isConnected ? '#4CAF50' : '#F44336',
          transform: [{ translateY }]
        }
      ]}
    >
      <Text style={styles.text}>
        {isConnected 
          ? 'Conexión a internet restablecida' 
          : 'Sin conexión a internet'}
      </Text>
    </Animated.View>
  );
  */
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatus;
