import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 30
    },
    profileContainer: {
        paddingBottom: 80
    },
    profileButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        marginTop: 20
    },
    graphsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 50
    },
    graphContributionContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.39)',
        borderRadius: 10,
        marginBottom: 30,
        width: '90%',
        alignItems: 'center',
        padding: 20
    },
    graphContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.39)',
        borderRadius: 10,
        marginBottom: 30
    },
    barContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareIconContainer: {
        position: 'absolute',
        top: 15,
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
    totalsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 70,
        marginTop: 30
    },
    totalsItemContainer: {
        borderColor: 'white',
        borderWidth: 2,
        borderRadius: 100,
        marginBottom: 30,
        marginTop: 10,
        paddingVertical: 30,
        width: 100
    },
    totalText: {
        fontWeight: '500',
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
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
        backgroundColor: 'black'
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        color: 'white',
        fontSize: 12,
    },
    backButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: 'black'
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
        width: '85%',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    tabPeriodContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginTop: 30,
        marginBottom: 10,
        width: '40%',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    infoTabContainer: {
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
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodTab: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#467d2a',
    },
    tabTextHeatMap: {
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20
    },
    tabText: {
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
    },
    tabPeriodText: {
        color: 'white',
    },
    activeTabText: {
        fontWeight: 'bold',
    },
    treeContainer: {
        width: '80%',
        backgroundColor: 'transparent',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginVertical: 30,
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
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        fontSize: 16,
        color: 'white'
    },
    medalContainer: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(92, 92, 92, 0.27)',
        borderRadius: 20,
        marginBottom: 90
    },
    medalItem: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderRadius: 16,
        padding: 10,
        alignItems: 'center',
    },
    medalIcon: {
        width: 50,
        height: 50,
        tintColor: '#467d2a', // Default color
    },
    medalTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#467d2a',
    },
    medalTitleDescription: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20
    },
    medalInfo: {
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        padding: 15
    },
    deactivateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 35,
        gap: 10
    },
    deactivateText: {
        color: 'white'
    },
    deactivateLinkButtonText: {
        color: 'red',
        textDecorationLine: 'underline'
    }
});