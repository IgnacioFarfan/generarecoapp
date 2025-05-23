import { StyleSheet, Dimensions } from 'react-native';

export const welcomeStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    logoContainer: {
        width: '80%',
        height: Dimensions.get('window').height * 0.3, // 30% of screen height
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -100,  // Reduced from 20
        marginBottom: 5, // Reduced from 10
    },
    logoImage: {
        width: '40%',
        height: '40%',
    },
    slide: {
        width: Dimensions.get('window').width,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        padding: 20,
    },
    slideText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 25,
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 20,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    },
    carousel: {
        flexGrow: 0,
        marginBottom: 20,
    },
});