import { StyleSheet } from 'react-native';

export const updateUserStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 50,
        paddingTop: 50
    },
    title: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        marginVertical: 20,
    },
    settingsContainer: {
        width: '90%',
        alignItems: 'center',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    subtitle: {
        fontSize: 15,
        color: 'white',
        marginTop: 10,
        marginBottom: 10
    },
    input: {
        width: '80%',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 15,
        backgroundColor: 'white',
        color: 'black',
        textAlign: 'center'
    },
    numberInputsContainer: {
        flexDirection: 'row',
        width: '80%'
    },
    numberInputs: {
        width: '36%'
    },
    pickerContainer: {
        width: '60%',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
        width: '100%',
        color: 'black',
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 10,
    },
    rangeButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 0,
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    rangeButtonSelected: {
        backgroundColor: '#467d2a', // Optional: Change background when selected
        borderColor: '#467d2a',
    },
    rangeButtonText: {
        color: 'black',
        fontSize: 16,
    },
    rangeButtonTextSelected: {
        color: 'white', // Optional: Change text color when selected
        fontWeight: 'bold',
    },
    doneButton: {
        backgroundColor: '#467d2a',
        padding: 15,
        borderRadius: 20,
        marginTop: 20,
        width: '50%',
        alignItems: 'center',
        marginBottom: 50
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
});