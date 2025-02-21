import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import { validatePassword } from "../validators/newUserData";
import bcrypt from "bcrypt";
import User from "../models/user";

export const changePassword = async(req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { password, newPassword } = req.body;

        validatePassword(password);
        validatePassword(newPassword);

        const user = req.user;

        const isPasswordValid = user?.validatePassword(password);

        if(!isPasswordValid) {
            return res.status(400).json({message: "Invalid Password"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const userInfo = User.findByIdAndUpdate(user?._id.toString(), {password: hashedPassword}, {new: true})
        console.log("userInfo: ", userInfo);

        return res.status(200).json({message: "Password updated successfully"});
    } catch(err) {
        return res.status(400).json({message: (err as Error).message})
    }
}