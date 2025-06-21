import { VictoryChart, VictoryBar, VictoryAxis, VictoryZoomContainer } from 'victory-native';

//npm i react-native-chart-kit web: https://www.npmjs.com/package/react-native-chart-kit para el heatmap
//npm install --save victory-native@legacy ewb: https://nearform.com/open-source/victory/docs/introduction/native
//npm i react-native-calendar-heatmap https://github.com/ayooby/react-native-calendar-heatmap


const CharBar = ({ data, variable }) => {
    console.log(data, variable);

    // Filtrar datos válidos
    const filteredData = data.filter(d => {
        const yVal = d[variable];
        return typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal);
    });

    // Calcular el valor máximo para ajustar el dominio
    const maxY = Math.max(...filteredData.map(d => d[variable]), 0);
    const domainYMax = maxY === 0 ? 10 : maxY * 1.1; // evita que se vea plano si todo es 0

    const formatTick = (val) => {
        if (variable === 'time') return `${val} seg`;
        if (variable === 'distance') return `${val} km`;
        if (variable === 'speedAvg') return `${val} km/h`;
        return val;
    };


    return (
        <VictoryChart
            domain={{ y: [0, domainYMax] }}
            domainPadding={{ x: 20 }}
            width={350}
            style={{
                parent: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
                axis: {
                    stroke: '#666',
                    strokeWidth: 2,
                },
                tickLabels: {
                    fill: '#666',
                    fontSize: 12,
                    fontWeight: 'normal',
                },
            }}
            containerComponent={
                    <VictoryZoomContainer
                        zoomDimension="x"
                        zoomDomain={{ x: [0, 5] }}
                        minimumZoom={{ x: 1 }}
                    />
                }
        >
            <VictoryAxis
                style={{
                    axisLabel: {
                        fontSize: 14,
                        paddingTop: 10,
                    },
                    tickLabels: {
                        fontSize: 10,
                        angle: 90, // Ajusta el ángulo de las etiquetas
                        padding: 15,
                    },
                }}
            />
            <VictoryAxis
                dependentAxis
                tickFormat={formatTick}
                style={{
                    axisLabel: { fontSize: 14, padding: 30 },
                    tickLabels: { fontSize: 12, padding: 5 },
                }}
            />

            <VictoryBar
                data={data}
                x="x"
                y="y"
                style={{
                    data: {
                        fill: (bar, active) => (active ? '#467d2a' : '#467d2a'), // Ajusta el color de las barras
                        stroke: '#666', // Color del borde
                        strokeWidth: 2, // Grosor del borde
                    },
                }}
                animate={{ duration: 1000 }}
            />
        </VictoryChart>
    )
};

export default CharBar;