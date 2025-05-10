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
        let userSessions = await this.sessionsModel.find({ user: uid }).lean();
        return userSessions;
    };

    getStatsByPeriod = async (uid, period) => {
        const matchStage = {
            user: new mongoose.Types.ObjectId(uid),
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

    getUserStats = async (uid, periodType) => {
        // Validate period type
        const validPeriods = ["day", "week", "month", "year"];
        if (!validPeriods.includes(periodType)) {
            periodType = "week"; // Default to week if invalid
        }
        
        const period = this.getPeriodRange(periodType);
        return await this.getStatsByPeriod(uid, period);
    };

    getUserTotalDistance = async (uid) => {
        const res = await this.sessionsModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(uid) } },
            { $group: { _id: null, totalDistance: { $sum: '$distance' } } }
        ]).exec();
        return res.length > 0 ? res[0].totalDistance : 0;
    }

};
