import { StyleSheet, StatusBar } from 'react-native';

export const mapScreenStyles = StyleSheet.create({
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