import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const getColorForIntensity = (count) => {
    if (count === 0) return '#eee';
    if (count < 3) return '#c6e48b';
    if (count < 6) return '#7bc96f';
    if (count < 9) return '#239a3b';
    return '#196127';
};

const HeatmapCalendar = ({ data, startDate, endDate }) => {
    const [selectedDay, setSelectedDay] = useState(null);

    const groupByWeeks = (data, startDate, endDate) => {
        const days = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            const match = data.find(item => item.date === dateStr);
            days.push({ date: dateStr, count: match?.count || 0 });
            current.setDate(current.getDate() + 1);
        }

        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        return weeks;
    };

    const renderDay = (value) => {
        const color = getColorForIntensity(value.count);
        return (
            <Pressable
                key={value.date}
                onPress={() => setSelectedDay(value)}
                style={[styles.dayCell, { backgroundColor: color }]}
            />
        );
    };

    const weeks = groupByWeeks(data, new Date(startDate), new Date(endDate));

    return (
        <View>
            <View style={styles.labelsRow}>
                {dayLabels.map((label, i) => (
                    <Text key={i} style={styles.dayLabel}>{label}</Text>
                ))}
            </View>
            {weeks.map((week, i) => (
                <View key={i} style={styles.weekRow}>
                    {week.map(day => renderDay(day))}
                </View>
            ))}
            <Modal visible={!!selectedDay} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.tooltipBox}>
                        <Text style={styles.tooltipText}>Fecha: {new Date(selectedDay?.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</Text>
                        <Text style={styles.tooltipText}>Distancia: {selectedDay?.count} kmts</Text>
                        <Pressable onPress={() => setSelectedDay(null)}>
                            <Text style={styles.closeButton}>Cerrar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    weekRow: { flexDirection: 'row', marginVertical: 2 },
    dayCell: { width: 20, height: 20, margin: 1, borderRadius: 3 },
    labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    dayLabel: { width: 20, textAlign: 'center', fontSize: 10 },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
    },
    tooltipBox: {
        backgroundColor: 'white', padding: 15, borderRadius: 8, alignItems: 'center'
    },
    tooltipText: { fontSize: 14 },
    closeButton: { marginTop: 10, color: 'blue' }
});

export default HeatmapCalendar;