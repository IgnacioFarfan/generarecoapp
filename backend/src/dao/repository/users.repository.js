export default class UsersRepository {
    constructor(model) {
        this.usersModel = model;
    }

    getAllUsers = async () => {
        const users = await this.usersModel.find({}).lean();
        return users;
    };

    getUser = async (id) => {
        let user = await this.usersModel.findOne({ $or: [{ userName: id }, { email: id }, { idGoogle: id }] });
        return user;
    };

    getUserById = async (uid) => {
        let user = await this.usersModel.findById(uid);
        return user;
    };

    saveUser = async (user) => {
        let newUser = new this.usersModel(user).save();
        return newUser;
    };

    updateUser = async (uid, userUpdated) => {
        await this.usersModel.findByIdAndUpdate(uid, userUpdated);
        const user = await this.usersModel.findById(uid)
        return user;
    };

    updateUserPassword = async (uid, newPassword) => {
        const user = await this.usersModel.findByIdAndUpdate(uid, {password: newPassword});
        return user;
    };
/* 
    updateUserAvatar = async (uid, newAvatarUrl) => {
        const user = await this.usersModel.findByIdAndUpdate(uid, {avatar: newAvatarUrl});
        return user;
    };

    updateUserLastLogin = async (uid, lastLogin) => {
        const user = await this.usersModel.findByIdAndUpdate(uid, {lastLogin: lastLogin});
        return user;
    }; */

    updateUserStatus = async (uid) => {
        const userStatus = await this.usersModel.findById(uid).select('status');
        const user = await this.usersModel.findByIdAndUpdate(uid, { status: !userStatus.status });
        return user;
    };
    
    updateUserField = async (id, keyToUpdate, valueToUpdate) => {
        const user = await this.getUserById(id)
        let obj = {};
        obj[keyToUpdate] = valueToUpdate;
        await this.usersModel.findByIdAndUpdate({ _id: id }, obj);
        return;
    };

    updateUserTotalKilometers = async (uid, distance) => {
        const result = await this.usersModel.updateOne(
            { _id: uid },
            { $inc: { totalKilometers: distance } }
        );
        return result;
    };

    updateUserMedal = async (uid, medal) => {
        await this.usersModel.findByIdAndUpdate(uid, {medal: parseInt(medal)});
        return;
    };
}
