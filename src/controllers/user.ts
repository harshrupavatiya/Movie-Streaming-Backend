import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import { validatePassword } from "../validators/newUserData";
import bcrypt from "bcrypt";
import User from "../models/user";

export const changePassword = async(req: AuthRequest, res: Response): Promise<any> => {
    try {
        // Extract information
        const { password, newPassword } = req.body;

        // validate both passwords old and new
        validatePassword(password);
        validatePassword(newPassword);

        // user from middleware
        const user = req.user;

        // compare old password with existing password hash
        const isPasswordValid = await user?.validatePassword(password);

        // if password is not valid
        if(!isPasswordValid) {
            return res.status(400).json({message: "Invalid Password"})
        }

        // hashing of new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update new hashed password
        const userInfo = await User.findByIdAndUpdate(user?._id.toString(), {password: hashedPassword}, {new: true})

        return res.status(200).json({message: "Password updated successfully"});
    } catch(err) {
        return res.status(400).json({message: (err as Error).message})
    }
}