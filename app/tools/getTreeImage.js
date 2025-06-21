export const getTreeImage = (kilometers) => {
    const percentage = Math.min(Math.floor((kilometers / 100) * 10), 10);

    switch (percentage) {
        case 0: return require('../assets/tree/progreso Árbol.png');
        case 1: return require('../assets/tree/progreso Árbol 1.png');
        case 2: return require('../assets/tree/progreso Árbol 2.png');
        case 3: return require('../assets/tree/progreso Árbol 3.png');
        case 4: return require('../assets/tree/progreso Árbol 4.png');
        case 5: return require('../assets/tree/progreso Árbol 5.png');
        case 6: return require('../assets/tree/progreso Árbol 6.png');
        case 7: return require('../assets/tree/progreso Árbol 7.png');
        case 8: return require('../assets/tree/progreso Árbol 8.png');
        case 9: return require('../assets/tree/progreso Árbol 9.png');
        case 10: return require('../assets/tree/progreso Árbol 10.png');
        default: return require('../assets/tree/progreso Árbol.png');
    }
};
