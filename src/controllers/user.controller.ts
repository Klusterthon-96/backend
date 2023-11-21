import response from "../utils/response";
import UserService from "../services/user.service";

import type { Request, Response } from "express";

class UserController {
    async getMe(req: Request, res: Response) {
        const result = await UserService.getOne(req.$user._id);
        res.status(200).send(response("user data", result));
    }

    async updateMe(req: Request, res: Response) {
        const result = await UserService.update(req.$user._id, req.body);
        res.status(200).send(response("user updated", result));
    }
}

export default new UserController();
