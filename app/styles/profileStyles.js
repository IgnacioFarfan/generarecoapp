import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    shareIconContainer: {
        position: 'absolute',
        top: 40,
        right: 10,
        zIndex: 2,
    },
    profileTitle: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    profileInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    info: {
        fontSize: 18,
        color: 'white',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#467d2a',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
        borderWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'black',  // Changed to black
        fontSize: 18,
        textAlign: 'center',
    },
    chartContainer: {
        marginTop: 0,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        width: '80%',
    },
    chartTitle: {
        fontSize: 20,
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
        marginTop: 20,
    },
    rangeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    rangeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'white',  // Added white background
        borderRadius: 20,
        marginHorizontal: 2,      // Added small margin between buttons
    },
    activeRangeButton: {
        backgroundColor: '#467d2a',
    },
    activeButtonText: {
        color: 'white',
    },
    lastRunsContainer: {
        marginTop: 20,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#467d2a',
        width: '80%',
        minHeight: 40, // Add minimum height so it doesn't collapse completely
    },
    lastRunsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    lastRunsTitle: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
    runItem: {
        backgroundColor: '#467d2a',
        padding: 8,
        borderRadius: 5,
        marginVertical: 5,
    },
    runText: {
        color: 'white',
        fontSize: 14,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        color: 'white',
        fontSize: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: 'black',
        marginLeft: 5,
    },
    visible: {
        display: 'flex',
    },
    hidden: {
        display: 'none',
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
        width: '80%',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#467d2a',
    },
    tabText: {
        color: 'white',
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: 'bold',
    },
    treeContainer: {
        width: '80%',
        backgroundColor: 'transparent', // Changed from rgba(255, 255, 255, 0.8) to transparent
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginVertical: 10,
    },
    treeImage: {
        width: 250,
        height: 250,
        marginVertical: 10,
    },
    treeProgressText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white', // Changed from #467d2a to white for better visibility on transparent background
        marginTop: 10,
    },
    treeDescription: {
        textAlign: 'center',
        marginTop: 10,
        color: 'white', // Changed from #555 to white for better visibility on transparent background
        fontSize: 14,
        paddingHorizontal: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
    },
    logoutButtonText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
    },
});