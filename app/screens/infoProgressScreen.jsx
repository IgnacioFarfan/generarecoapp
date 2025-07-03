import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment'

import apiService from '../services/api.service';
import { profileStyles } from '../styles/profileStyles'
import { getUserTokenAndId } from '../tools/getUserTokenAndId';
import ProfileScreen from './ProfileScreen';

import CharBar from './charBar';
import HeatmapCalendar from './HeatMapCalendar';

const today = moment(); // Momento actual
const dateMinus7 = moment(today).clone().subtract(7, 'days').toDate();
const dateMinus30 = moment(today).clone().subtract(30, 'days').toDate();
const endDate = today.toDate();

const InfoProgressScreen = () => {
    const navigation = useNavigation();

    const [activePeriodChartTab, setActivePeriodChartTab] = useState('week'); // 'week' o 'month'
    const [activeTab, setActiveTab] = useState('distance'); // 'distance' o 'time' o 'speedAvg'

    const [userTotalDistance, setUserTotalDistance] = useState(0);
    const [userTotalTime, setUserTotalTime] = useState(0);
    const [userTotalVelocity, setUserTotalVelocity] = useState(0);
    const [userTotalSessions, setUserTotalSessions] = useState(0);

    const [dataChart, setDataChart] = useState([]);
    const [dataContributionMap, setDataContributionMap] = useState([]);

    useEffect(() => {
        async function getUserData() {
            const { userId } = await getUserTokenAndId(navigation);
            fetchUserData(userId);
            getUserPeriodData(activeTab)
        }
        getUserData();
    }, []);

    async function getUserPeriodData(variable) {
        const { userId } = await getUserTokenAndId(navigation);
        if (activePeriodChartTab === 'week') {

            const userInfoWeekContributionData = await apiService.getUserPeriodContributionData(userId, 'week');
            console.log('datachart for contributions:', userInfoWeekContributionData.data);
            setDataContributionMap(userInfoWeekContributionData.data)

            if (variable === 'distance') {
                const userInfoWeekData = await apiService.getUserPeriodDataDistance(userId, 'week');
                console.log('datachart con distance:', userInfoWeekData.data);
                setActiveTab('distance')
                setDataChart(userInfoWeekData.data)
                return
            } else if (variable === 'time') {
                const userInfoWeekData = await apiService.getUserPeriodDataTime(userId, 'week');
                console.log('datachart con time:', dataChart);
                setActiveTab('time')
                setDataChart(userInfoWeekData.data)
                return
            } else if (variable === 'speedAvg') {
                const userInfoWeekData = await apiService.getUserPeriodDataSpeedAvg(userId, 'week');
                console.log('datachart con speedAvg:', dataChart);
                setActiveTab('speedAvg')
                setDataChart(userInfoWeekData.data)
                return
            }

        } else {

            const userInfoMonthContributionData = await apiService.getUserPeriodContributionData(userId, 'month');
            setDataContributionMap(userInfoMonthContributionData.data)

            if (variable === 'distance') {
                const userInfoMonthData = await apiService.getUserPeriodDataDistance(userId, 'month');
                setActiveTab('distance')
                setDataChart(userInfoMonthData.data)
                return
            } else if (variable === 'time') {
                const userInfoMonthData = await apiService.getUserPeriodDataTime(userId, 'month');
                setActiveTab('time')
                setDataChart(userInfoMonthData.data)
                return
            } else if (variable === 'speedAvg') {
                const userInfoMonthData = await apiService.getUserPeriodDataSpeedAvg(userId, 'month');
                setActiveTab('speedAvg')
                setDataChart(userInfoMonthData.data)
                return
            }
        }
    }

    const fetchUserData = async (uid) => {
        try {
            // Distancia total del usuario obtenida de la suma de las sesiones
            const userKilometers = await apiService.getUserTotalKmts(uid);
            if (userKilometers.data.userTotalKmts) setUserTotalDistance(userKilometers.data.userTotalKmts);
            //obtengo el tiempo total (suma de los tiempos de todas las sessiones)
            const userTime = await apiService.getUserTotalTime(uid);
            if (userTime.data.userTotalTime) setUserTotalTime(userTime.data.userTotalTime)
            //obtengo la velocidad promedio total de todas las sesiones
            const userVelocity = await apiService.getUserTotalVelocity(uid);
            if (userVelocity.data.userTotalVelocity) setUserTotalVelocity(userVelocity.data.userTotalVelocity)
            //obtengo el total de sesiones
            const userSessions = await apiService.getUserTotalSessions(uid);
            if (userSessions.data.userTotalSessions) setUserTotalSessions(userSessions.data.userTotalSessions)

        } catch (error) {
            console.error('Failed to load data from API:', error);
        }
    };

    const handleActivePeriodChart = async (period) => {
        try {
            setActivePeriodChartTab(period)
            getUserPeriodData(activeTab)
        } catch (error) {
            console.error('Failed to load data from API:', error);
        }
    };

    return (
        <ScrollView>
            <View style={profileStyles.totalsContainer}>

                <View>
                    <Text style={profileStyles.tabText}>Distancia (Ktms):</Text>
                    <View style={profileStyles.totalsItemContainer}>
                        <Text style={profileStyles.totalText}>{userTotalDistance}</Text>
                    </View>
                    <Text style={profileStyles.tabText}>Tiempo:</Text>
                    <View style={profileStyles.totalsItemContainer}>
                        <Text style={profileStyles.totalText}>{userTotalTime}</Text>
                    </View>
                </View>

                <View>
                    <Text style={profileStyles.tabText}>Vel prom (K/h):</Text>
                    <View style={profileStyles.totalsItemContainer}>
                        <Text style={profileStyles.totalText}>{userTotalVelocity.toFixed(2)}</Text>
                    </View>
                    <Text style={profileStyles.tabText}>Sesiones:</Text>
                    <View style={profileStyles.totalsItemContainer}>
                        <Text style={profileStyles.totalText}>{userTotalSessions}</Text>
                    </View>
                </View>

            </View>

            <View style={profileStyles.graphsContainer}>
                <View style={profileStyles.tabContainer}>
                    <TouchableOpacity
                        style={[profileStyles.tab, activeTab === 'distance' ? profileStyles.activeTab : null]}
                        onPress={() => getUserPeriodData('distance')}
                    >
                        <Text style={[profileStyles.tabText, activeTab === 'distance' ? profileStyles.activeTabText : null]}>Distancia</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[profileStyles.tab, activeTab === 'time' ? profileStyles.activeTab : null]}
                        onPress={() => getUserPeriodData('time')}
                    >
                        <Text style={[profileStyles.tabText, activeTab === 'time' ? profileStyles.activeTabText : null]}>Tiempo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[profileStyles.tab, activeTab === 'speedAvg' ? profileStyles.activeTab : null]}
                        onPress={() => getUserPeriodData('speedAvg')}
                    >
                        <Text style={[profileStyles.tabText, activeTab === 'speedAvg' ? profileStyles.activeTabText : null]}>Vel promedio</Text>
                    </TouchableOpacity>
                </View>

                <View style={profileStyles.tabPeriodContainer}>
                    <TouchableOpacity
                        style={[profileStyles.periodTab, activePeriodChartTab === 'week' ? profileStyles.activeTab : null]}
                        onPress={() => handleActivePeriodChart('week')}
                    >
                        <Text style={[profileStyles.tabPeriodText, activePeriodChartTab === 'week' ? profileStyles.activeTabText : null]}>Semana</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[profileStyles.periodTab, activePeriodChartTab === 'month' ? profileStyles.activeTab : null]}
                        onPress={() => handleActivePeriodChart('month')}
                    >
                        <Text style={[profileStyles.tabPeriodText, activePeriodChartTab === 'month' ? profileStyles.activeTabText : null]}>Mes</Text>
                    </TouchableOpacity>
                </View>

                <View style={profileStyles.graphContainer}>
                    <CharBar data={dataChart} variable={activeTab} />
                </View>

                <View style={profileStyles.graphContributionContainer}>
                    <Text style={profileStyles.tabTextHeatMap}>Mapa de calor de tu actividad:</Text>
                    <HeatmapCalendar
                        data={dataContributionMap}
                        startDate={activePeriodChartTab === 'week' ? dateMinus7 : dateMinus30}
                        endDate={endDate}
                    />
                </View>
            </View>
            <ProfileScreen />
        </ScrollView>
    )
}

export default InfoProgressScreen;