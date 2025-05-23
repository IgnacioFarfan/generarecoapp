

export const challengeLevels = {
    beginner: {
        title: 'Nivel Semilla (Principiante)',
        subtitle: 'Cada paso echa raíces',
        challenges: [
            {
                id: 'beginner-1',
                title: '1 Desafío de Bienvenida – "Primer Brote"',
                description: 'Completa una sesión de 10 minutos corriendo o caminando.',
                note: 'Todo gran árbol empieza con una pequeña raíz. Da tu primer paso y empieza a crecer.',
                goal: { time: 10 },
                icon: require('../assets/Iconos/icono primer brote.png')
            },
            {
                id: 'beginner-2',
                title: '2 Desafío por Distancia "Senderos Verdes"',
                description: 'Corre 15-25 km en una semana (ritmo menor a 7 min/km).',
                note: 'Cada paso que das deja huella en el planeta. Aumenta tu resistencia y ayuda a reforestar más áreas con este desafío.',
                goal: { distance: 15, speedAvg: 7 },
                icon: require('../assets/Iconos/icono blanco senderos verdes.png')
            },
            {
                id: 'beginner-3',
                title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
                description: 'Acumula 15 km en una semana.',
                note: 'Mantente en movimiento, mejora tu resistencia y contribuye al planeta al mismo tiempo.',
                goal: { distance: 15 },
                icon: require('../assets/Iconos/icono blanco rumbo al bosque.png')
            },
            {
                id: 'beginner-4',
                title: '4 Desafío por Tiempo "Raíces en Movimiento"',
                description: 'Corre durante 90 minutos en una semana.',
                note: 'La constancia es clave para que un bosque crezca fuerte. Dedica tu tiempo a la naturaleza y siembra el cambio con cada minuto.',
                goal: { time: 90 },
                medal: 'Semilla',
                icon: require('../assets/Iconos/icono blanco raices en movimiento.png')
            }
        ]
    },
    intermediate: {
        title: 'Nivel Brote Fuerte (Intermedio)',
        subtitle: 'Tu esfuerzo empieza a dar frutos',
        challenges: [
            {
                id: 'intermediate-1',
                title: '1 Desafío de Bienvenida – "Raíces Firmes"',
                description: 'Corre 5 km en una sesión.',
                note: 'Tu crecimiento ya comenzó. Es momento de fortalecer tus raíces con tu primera carrera.',
                goal: { distance: 5 },
                icon: require('../assets/Iconos/icono raices firmes.png')
            },
            {
                id: 'intermediate-2',
                title: '2 Desafío por Distancia "Senderos Verdes"',
                description: 'Corre 26-50 km en una semana (ritmo menor a 5 min/km).',
                note: 'Supera tus límites, mejora tu ritmo y disfruta del camino mientras cuidas de tu bienestar y del planeta.',
                goal: { distance: 26, speedAvg: 5 },
                icon: require('../assets/Iconos/icono senderos verdes.png')
            },
            {
                id: 'intermediate-3',
                title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
                description: 'Acumula 40 km en una semana.',
                note: 'Mantén el ritmo y sigue sumando kilómetros. Cada esfuerzo te hace más fuerte y más conectado con la naturaleza.',
                goal: { distance: 40 },
                icon: require('../assets/Iconos/icono blanco rumbo al bosque.png')
            },
            {
                id: 'intermediate-4',
                title: '4 Desafío por Tiempo "Raíces en Movimiento"',
                description: 'Corre durante 240 minutos en una semana.',
                note: 'Corre con propósito. Cada minuto en movimiento refuerza tu conexión con la naturaleza y el impacto positivo que puedes generar.',
                goal: { time: 240 },
                medal: 'Brote Fuerte',
                icon: require('../assets/Iconos/icono blanco raices en movimiento.png')
            }
        ]
    },
    advanced: {
        title: 'Nivel Árbol Ancestral (Avanzado)',
        subtitle: 'Eres parte del bosque',
        challenges: [
            {
                id: 'advanced-1',
                title: '1 Desafío de Bienvenida – "Primer Árbol"',
                description: 'Corre 10 km en una sesión.',
                note: 'Ya eres parte del bosque, pero cada árbol comienza con un esfuerzo. Supera este primer desafío y deja tu huella.',
                goal: { distance: 10 },
                icon: require('../assets/Iconos/icono primer arbol.png')
            },
            {
                id: 'advanced-2',
                title: '2 Desafío por Distancia "Senderos Verdes"',
                description: 'Corre más de 50 km en una semana (ritmo menor a 3 min/km).',
                note: 'Mantén tu ritmo constante y fortalece tu compromiso con tu salud y con el cuidado del entorno.',
                goal: { distance: 50, speedAvg: 3 },
                icon: require('../assets/Iconos/icono senderos verdes.png')
            },
            {
                id: 'advanced-3',
                title: '3 Desafío por Kilómetros "Rumbo al Bosque"',
                description: 'Acumula 70 km en una semana.',
                note: 'Lleva tu hábito al siguiente nivel. Con cada km, no solo mejoras tu bienestar, sino que también aportas al cuidado del medio ambiente.',
                goal: { distance: 70 },
                icon: require('../assets/Iconos/icono blanco rumbo al bosque.png')
            },
            {
                id: 'advanced-4',
                title: '4 Desafío por Tiempo "Raíces en Movimiento"',
                description: 'Corre durante 420 minutos en una semana.',
                note: 'Corre con propósito. Cada minuto en movimiento refuerza tu conexión con la naturaleza y el impacto positivo que puedes generar.',
                goal: { time: 420 },
                medal: 'Árbol Ancestral',
                icon: require('../assets/Iconos/icono blanco raices en movimiento.png')
            }
        ]
    }
};