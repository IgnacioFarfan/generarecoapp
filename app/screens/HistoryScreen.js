import { View, Text, StyleSheet, FlatList } from 'react-native';

const HistoryScreen = ({ route }) => {
    const { runs } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial de Recorridos</Text>
            {runs.length === 0 ? (
                <Text>No hay recorridos previos.</Text>
            ) : (
                <FlatList
                    data={runs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.runItem}>
                            <Text>Fecha: {item.date}</Text>
                            <Text>Tiempo: {item.time}</Text>
                            <Text>Distancia: {item.kilometers} km</Text>
                            <Text>Ritmo: {item.pace} min/km</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    runItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default HistoryScreen;