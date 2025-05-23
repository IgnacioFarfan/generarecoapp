import { StyleSheet } from 'react-native';

export const challengesStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 5,
        borderRadius: 5,
    },
    levelSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    levelButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
    },
    levelButtonSelected: {
        backgroundColor: '#467d2a',
        borderColor: '#467d2a',
    },
    levelButtonText: {
        color: 'black',
        fontSize: 16,
    },
    levelButtonTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    levelHeader: {
        marginBottom: 15,
        width: '100%',
    },
    levelTitle: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
    },
    levelSubtitle: {
        fontSize: 16,
        color: 'white',
        fontStyle: 'italic',
        marginTop: 5,
    },
    currentChallengeContainer: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative', // For positioning the progress badge
    },
    iconWrapper: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#467d2a',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    challengeIcon: {
        width: 120,
        height: 120,
        tintColor: '#467d2a', // Default color
    },
    grayIcon: {
        position: 'absolute',
        opacity: 0.3, // Make it semi-transparent
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        width: '100%',
    },
    challengeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#467d2a',
        marginBottom: 8,
    },
    challengeDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    challengeNote: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    medalText: {
        fontSize: 16,
        color: '#467d2a',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    progressText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#467d2a',
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    },
    completedBadge: {
        backgroundColor: '#467d2a',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    completedText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
    },
    progressDotCompleted: {
        backgroundColor: '#467d2a',
    },
    progressDotCurrent: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#467d2a',
    },
    progressBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#467d2a',
        elevation: 3,
    },
    progressBadgeText: {
        color: '#467d2a',
        fontWeight: 'bold',
        fontSize: 12,
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
    }
});