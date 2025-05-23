import { StyleSheet } from 'react-native';

export const resultScreenStyles = StyleSheet.create({
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