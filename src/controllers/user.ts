import { Response } from "express";
import { AuthRequest, IEditDetails } from "../types/api";
import { validatePassword } from "../validators/inputValidators";
import bcrypt from "bcrypt";
import User from "../models/user";
import { isValidField } from "../validators/editUserData";
import { UploadedFile } from "express-fileupload";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";
import { validateFileContent } from "../validators/mediaFile";

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
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
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // hashing of new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update new hashed password
    const userInfo = await User.findByIdAndUpdate(
      user?._id.toString(),
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
};

export const editProfile = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    isValidField(req);

    const { name, contactNo, dateOfBirth, gender } = req.body;

    const file = req?.files?.image as UploadedFile;

    // Upload the image to Cloudinary
    let result = null;
    if(file) {
      validateFileContent(file, "image");

      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: "uploads",
        height: 800,
        quality: 100,
      });

      // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });
    }

    // getting secure url from received data from cloudinary uploader
    const profilePicture = result?.secure_url || null;

    // creating updateField options(payload)
    const editDetails: Partial<IEditDetails> = {
      ...(name && { name }),
      ...(contactNo && { contactNo }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(gender && { gender }),
      ...(profilePicture && { profilePicture }),
    };

    console.log(editDetails);

    // get user from request(via middleware - userAuth)
    const user = req.user;

    // finding user and updating its value
    const updatedUser = await User.findByIdAndUpdate(user?._id, editDetails, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "User details updated successfully",
      userData: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: all
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};
