import moment from "moment";
import mongoose from "mongoose";

export default class SessionsRepository {
    constructor(model) {
        this.sessionsModel = model;
    }

    saveSession = async (uid, distance, speedAvg, heartRateAvg, calories, time) => {
        try {
            // Ensure all values are valid numbers
            const sessionData = {
                user: uid,
                distance: Number(distance) || 0,
                speedAvg: Number(speedAvg) || 0,
                heartRateAvg: Number(heartRateAvg) || 0,
                calories: Number(calories) || 0,
                time: Number(time) || 0
            };

            console.log("Creating session with data:", sessionData);

            // Check if uid is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(uid)) {
                console.error("Invalid user ID format:", uid);
                throw new Error("Invalid user ID format");
            }

            // Convert uid to ObjectId
            sessionData.user = new mongoose.Types.ObjectId(uid);

            // Create and save the session
            let newSession = await new this.sessionsModel(sessionData).save();
            console.log("Session saved successfully:", newSession);
            return newSession;
        } catch (error) {
            console.error("Error in sessions repository:", error);
            throw error;
        }
    };

    getUserSessions = async (uid) => {
        let userSessions = await this.sessionsModel.find({ user: uid })
            .sort({ sessionDate: -1 }) // Orden descendente por fecha (más reciente primero)
            .limit(3) // Máximo 3 resultados
            .lean();
        return userSessions;
    };

    getStatsByPeriod = async (uid, period) => {
        const matchStage = {
            user: new mongoose.Types.ObjectId(String(uid)),
            sessionDate: {
                $gte: period.start,
                $lte: period.end
            }
        };

        const stats = await this.sessionsModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: "$distance" },
                    avgSpeed: { $avg: "$speedAvg" },
                    totalTime: { $sum: "$time" }
                }
            }
        ]);

        return stats.length ? stats[0] : { totalDistance: 0, avgSpeed: 0, totalTime: 0 };
    };

    getPeriodRange = (periodType) => {
        let start, end = moment().endOf("day");

        switch (periodType) {
            case "day":
                start = moment().startOf("day");
                break;
            case "week":
                start = moment().startOf("week");
                break;
            case "month":
                start = moment().startOf("month");
                break;
            case "year":
                start = moment().startOf("year");
                break;
            default:
                // Default to week if invalid period
                start = moment().startOf("week");
                break;
        }

        return { start: start.toDate(), end: end.toDate() };
    };

    getUserStatsByPeriod = async (uid, period) => {
        // Validate period type
        const validPeriods = ["day", "week", "month", "year"];
        if (!validPeriods.includes(period)) {
            period = "week"; // Default to week if invalid
        }

        const periodType = this.getPeriodRange(period);
        return await this.getStatsByPeriod(uid, periodType);
    };

    getUserTotalDistance = async (uid) => {
        const res = await this.sessionsModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(String(uid)) } },
            { $group: { _id: null, totalDistance: { $sum: '$distance' } } }
        ]).exec();
        return res.length > 0 ? res[0].totalDistance : 0;
    }

    getUserTotalTime = async (uid) => {
        const res = await this.sessionsModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(String(uid)) } },
            { $group: { _id: null, totalTime: { $sum: '$time' } } }
        ]).exec();
        return res.length > 0 ? res[0].totalTime : 0;
    }

    getUserTotalVelocity = async (uid) => {
        const res = await this.sessionsModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(String(uid)) } },
            { $group: { _id: null, averageSpeedAvg: { $avg: '$speedAvg' } } }
        ]).exec();
        return res.length > 0 ? res[0].averageSpeedAvg : 0;
    }

    getUserTotalSessions = async (uid) => {
        const userTotalSessions = await this.sessionsModel.countDocuments({ user: uid });
        return userTotalSessions;
    }

    getUserDataSpeedAvg = async (uid, period) => {
        const dias = period === 'week' ? 7 : 30;
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - dias + 1);

        const aggregationPipeline = [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(String(uid)),
                    sessionDate: { $gte: desde, $lte: hasta }
                }
            },
            {
                $group: {
                    _id: {
                        fecha: { $dateToString: { format: "%d/%m", date: "$sessionDate" } }
                    },
                    resultado: { $avg: '$speedAvg' }
                }
            },
            {
                $sort: { "_id.fecha": 1 }
            }
        ];

        const res = await this.sessionsModel.aggregate(aggregationPipeline).exec();

        const payload = res.map(item => ({
            x: item._id.fecha,
            y: item.resultado
        }));
        console.log(payload);
        return payload
    }


    getUserDataTime = async (uid, period) => {
        const dias = period === 'week' ? 7 : 30;
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - dias + 1);

        const aggregationPipeline = [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(String(uid)),
                    sessionDate: { $gte: desde, $lte: hasta }
                }
            },
            {
                $group: {
                    _id: {
                        fecha: { $dateToString: { format: "%d/%m", date: "$sessionDate" } }
                    },
                    resultado: { $sum: '$time' }
                }
            },
            {
                $sort: { "_id.fecha": 1 }
            }
        ];

        const res = await this.sessionsModel.aggregate(aggregationPipeline).exec();

        const payload = res.map(item => ({
            x: item._id.fecha,
            y: item.resultado
        }));
        console.log(payload);
        return payload
    }

    getUserDataDistance = async (uid, period) => {
        const dias = period === 'week' ? 7 : 30;
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - dias + 1); // +1 para incluir el día actual

        const aggregationPipeline = [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(String(uid)),
                    sessionDate: { $gte: desde, $lte: hasta }
                }
            },
            {
                $group: {
                    _id: {
                        fecha: { $dateToString: { format: "%d/%m", date: "$sessionDate" } }
                    },
                    resultado: { $sum: '$distance' }
                }
            },
            {
                $sort: { "_id.fecha": 1 }
            }
        ];

        const res = await this.sessionsModel.aggregate(aggregationPipeline).exec();

        const payload = res.map(item => ({
            x: item._id.fecha,
            y: item.resultado
        }));
        console.log(payload);
        return payload
    };


    getUserPeriodContributionData = async (uid, period) => {
        const dias = period === 'week' ? 7 : 30;
        const desde = new Date();
        desde.setHours(0, 0, 0, 0); // normalizar a las 00:00
        desde.setDate(desde.getDate() - dias);

        const res = await this.sessionsModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(String(uid)),
                    sessionDate: { $gte: desde }
                }
            },
            {
                $group: {
                    _id: {
                        fecha: {
                            $dateToString: { format: "%Y-%m-%d", date: "$sessionDate" }
                        }
                    },
                    count: { $sum: "$distance" } //sumamos la distancia para que mientras más tenga en ese día cambiará a otro color
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.fecha",
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]).exec();
        console.log(res);

        return res;
    }


};
