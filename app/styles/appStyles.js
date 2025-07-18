import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
    },
    scrollContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
        paddingHorizontal: 30,
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        marginBottom: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        width: '80%',
        borderColor: '#ffffff',
        borderWidth: 0,
        marginBottom: 15,
        paddingHorizontal: 15,
        color: 'white',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.29)',
        textAlign: 'center', // Added to center the placeholder text
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
    },
    socialContainer: {
        alignItems: 'center',
    },
    socialButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    },
    createAccountTextContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    createAccountText: {
        color: 'white',
        fontSize: 14,
    },
    createAccountLink: {
        color: '#f5f5f5',
        textDecorationLine: 'underline',
    },
    forgotPassTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 5,
        borderRadius: 5,
        width: '90%',
    },
    debugContainer: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    debugText: {
        color: 'white',
        fontSize: 12,
    },
});