import mongoose from "mongoose";

export default class UsersGoalsRepository {
    constructor(usersGoalsModel, usersSessionsModel, goalsModel) {
        this.usersGoalsModel = usersGoalsModel;
        this.usersSessionsModel = usersSessionsModel;
        this.goalsModel = goalsModel;
    }

    async saveUserGoal(uid, gid) {
        try {
            let newUserGoal = new this.usersGoalsModel({ user: uid, goal: gid }).save();
            return newUserGoal;
        } catch (error) {
            throw error;
        }
    };

    async getGoalsWithStatus(userId) {
        // 1. Obtener todos los goals ordenados por posición
        const allGoals = await this.goalsModel.find().sort({ position: 1 }).lean();

        // 2. Obtener los userGoals del usuario con populate de goal para acceder a position
        const userGoals = await this.usersGoalsModel.find({ user: userId }).populate("goal").lean();

        // 3. Separar completados e in-progress
        const completedUserGoals = userGoals.filter(ug => ug.finnish);
        const inProgressUserGoals = userGoals.filter(ug => !ug.finnish);

        const completedGoalIds = new Set(completedUserGoals.map(ug => ug.goal._id.toString()));
        const inProgressGoalIds = new Set(inProgressUserGoals.map(ug => ug.goal._id.toString()));

        // 4. Determinar desbloqueados
        const unlockedGoalIds = new Set();

        if (completedUserGoals.length === 0) {
            // Caso inicial: desbloqueamos los 3 primeros
            const firstThree = allGoals.slice(0, 3);
            firstThree.forEach(g => unlockedGoalIds.add(g._id.toString()));
        } else {
            // Agregamos los ya iniciados y completados como desbloqueados
            [...completedGoalIds, ...inProgressGoalIds].forEach(id => unlockedGoalIds.add(id));

            // Si hay menos de 3 desbloqueados, desbloquear goals más próximos en posición
            const totalUnlocked = unlockedGoalIds.size;
            if (totalUnlocked < 3) {
                // Filtrar goals que aún no están desbloqueados ni completados
                const unavailableGoalIds = new Set([...completedGoalIds, ...unlockedGoalIds]);

                const remainingGoals = allGoals.filter(g => !unavailableGoalIds.has(g._id.toString())).sort((a, b) => a.position - b.position);

                let toAdd = 3 - unlockedGoalIds.size;
                for (const goal of remainingGoals) {
                    if (toAdd <= 0) break;
                    unlockedGoalIds.add(goal._id.toString());
                    toAdd--;
                }
            }
        }

        // 5. Crear un mapa de userGoals para referencia rápida
        const userGoalsMap = new Map(userGoals.map(ug => [ug.goal._id.toString(), ug]));

        // 6. Construir respuesta con status por goal
        const result = allGoals.map(goal => {
            const goalId = goal._id.toString();
            const userGoal = userGoalsMap.get(goalId);

            let status = "locked";
            if (userGoal?.finnish) {
                status = "completed";
            } else if (userGoal && !userGoal.finnish) {
                status = "in_progress";
            } else if (unlockedGoalIds.has(goalId)) {
                status = "unlocked";
            }

            return {
                ...goal,
                status
            };
        });

        return result;
    }

    async getUserGoals(userId) {
    try {
        //trae el desafío del usuario que tenga e lcampo finnish en nulo, es decir sin terminar
        const userGoals = await this.usersGoalsModel.find({ user: userId, finnish: null }).populate('goal');
        return userGoals;
    } catch (error) {
        console.error('Error getting user goals:', error);
        throw error;
    }
}

    async getUserGoal(uid, gid) {
    try {
        const userGoal = await this.usersGoalsModel.find({user: uid, goal: gid}).populate('goal');
        return userGoal;
    } catch (error) {
        console.error('Error getting user goal by ID:', error);
        throw error;
    }
}

    async deleteUserGoal(ugid) {
    try {
        await this.usersGoalsModel.findByIdAndDelete(ugid);
        return;
    } catch (error) {
        throw error;
    }
};

updateUserGoal = async (uid, gid, newDistance) => {
    const userGoal = await this.usersGoalsModel.findOne({
        user: uid,
        goal: gid,
        finnish: null
    }).populate("goal");

    const updatedDistance = (userGoal.distance === null ? 0 : userGoal.distance) + newDistance;
    const updateData = { distance: updatedDistance };

    if (updatedDistance >= userGoal.goal.distance) {
        updateData.finnish = new Date();
    }

    await this.usersGoalsModel.updateOne(
        { _id: userGoal._id },
        { $set: updateData }
    );

    return {
        message: updatedDistance >= userGoal.goal.distance
            ? "Objetivo completado con éxito"
            : "Distancia actualizada, pero aún falta para la meta",
        updatedDistance
    };
};

    async findActiveGoalByChallenge(userId, challengeId) {
    try {
        console.log('Finding active goal for user:', userId, 'and challenge ID:', challengeId);

        // Find a user goal that matches the user ID and goal ID, and is not finished
        const userGoal = await this.usersGoalsModel.findOne({
            user: userId,
            goal: challengeId,
            finnish: null
        }).populate('goal');

        console.log('Found user goal:', userGoal);
        return userGoal;
    } catch (error) {
        console.error('Error finding active goal by challenge:', error);
        throw error;
    }
}

    async updateGoalProgress(userGoalId, distance, time) {
    try {
        const userGoal = await this.usersGoalsModel.findById(userGoalId).populate("goal");

        if (!userGoal) {
            throw new Error("User goal not found");
        }

        // Update distance and time
        const updatedDistance = (userGoal.distance || 0) + distance;
        const updatedTime = (userGoal.time || 0) + time;

        const updateData = {
            distance: updatedDistance,
            time: updatedTime
        };

        // Check if goal is completed
        if (userGoal.goal.distance && updatedDistance >= userGoal.goal.distance) {
            updateData.finnish = new Date();
        } else if (userGoal.goal.time && updatedTime >= userGoal.goal.time) {
            updateData.finnish = new Date();
        }

        await this.usersGoalsModel.updateOne(
            { _id: userGoalId },
            { $set: updateData }
        );

        return {
            updatedDistance,
            updatedTime,
            completed: !!updateData.finnish
        };
    } catch (error) {
        console.error('Error updating goal progress:', error);
        throw error;
    }
}

    async createUserGoal(userGoalData) {
    try {
        const newUserGoal = new this.usersGoalsModel(userGoalData);
        await newUserGoal.save();
        return newUserGoal;
    } catch (error) {
        console.error('Error creating user goal:', error);
        throw error;
    }
}


checkUserGoalExist = async (uid) => {//checkea solamente si el userGoal existe, si es así devuelve true
    try {
        const userGoalExist = await this.usersGoalsModel.find({ user: uid, finnish: null })
        if (userGoalExist.length > 0) {
            return true
        }
        return false;
    } catch (error) {
        console.error('Error finding goal by name:', error);
        throw error;
    }
};

//actualiza el userGoal finalizando el desafío solo agregando la fecha en el campo finnish que al principio es nulo
updateFinnishUserGoal = async (ugid, date) => {
    try {
        const updateFinnishUserGoal = await this.usersGoalsModel.findByIdAndUpdate(ugid, { finnish: date })
        return updateFinnishUserGoal;
    } catch (error) {
        console.error('Error update finnish field', error);
        throw error;
    }
};

// consigue los stats con una query con aggregate. además calcula los porcentajes según el desafío ya que cada desafío tiene sus condiciones, 
// ya sea de kmts de tiempo o velocidad
// cuando alguno de estos campos es null, no es tomado en cuenta para el cálculo. hace los cálculos sumando los campos de cada sesión 
// guardada después de la fecha de inscripción de un usuario a una meta (fecha start del userGoal)
getUserGoalsStats = async (ugid) => {
    try {                           
        const userGoal = await this.usersGoalsModel.findById(ugid).populate('user').populate('goal')

        const { user, start, goal } = userGoal;
        console.log('start:', start, 'userId:', new mongoose.Types.ObjectId(String(user._id)));
        const sessions = await this.usersSessionsModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(String(user._id)),
                    sessionDate: { $gte: start }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: "$distance" },
                    totalTime: { $sum: "$time" }, // en segundos
                    totalSpeedAvg: { $sum: "$speedAvg" },
                    count: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    avgSpeed: {
                        $cond: [
                            { $eq: ["$count", 0] },
                            0,
                            { $divide: ["$totalSpeedAvg", "$count"] }
                        ]
                    }
                }
            }
        ]);
        console.log('sessions:', sessions);

        const data = sessions[0] || {
            totalDistance: 0,
            totalTime: 0,
            avgSpeed: 0
        };

        // Calcular progreso por cada criterio presente
        let porcentajes = [];

        if (goal.distance != null) {
            const distanciaProgreso = Math.min((data.totalDistance / goal.distance) * 100, 100);
            porcentajes.push(distanciaProgreso);
        }

        if (goal.time != null) {
            const tiempoProgreso = Math.min((data.totalTime / goal.time) * 100, 100);
            porcentajes.push(tiempoProgreso);
        }

        const progresoFinal =
            porcentajes.length > 0
                ? Number((porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length).toFixed(2))
                : 0;

        console.log('array porcentajes:', porcentajes);

        console.log('distancia:', data.totalDistance, 'tiempo total:', data.totalTime, 'speedAvg:', data.avgSpeed, 'progreso final:', progresoFinal);

        const stats = {
            totalDistance: data.totalDistance,
            totalTime: data.totalTime,
            avgSpeed: data.avgSpeed,
            progressPercent: progresoFinal
        }
        return stats;
    } catch (error) {
        console.error('Error finding goal by name:', error);
        throw error;
    }
};

};
