/* eslint-disable @typescript-eslint/no-explicit-any */
import client from "../database/redis";
import User from "./../models/user.model";
import CustomError from "./../utils/custom-error";

class UserService {
    async getOne(userId: string) {
        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("user does not exist");

        return user;
    }

    async update(userId: string, data: UserUpdateInput) {
        let user = await User.findById(userId);
        if (!user) throw new CustomError("user does not exist");

        user = await User.findByIdAndUpdate(userId, data, { new: true });
        await client.del(userId);
        await client.setEx(userId, 83000, JSON.stringify(user));
        return user;
    }
}

export default new UserService();
