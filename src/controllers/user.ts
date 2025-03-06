import { Response } from "express";
import { AuthRequest } from "../types/api";
import { validatePassword } from "../validators/inputValidators";
import bcrypt from "bcrypt";
import { getValidUserUpdatePayload } from "../utils/getPayload";
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

    if(!user) {
      throw new Error("User not found in middleware");
    }

    // compare old password with existing password hash
    const isPasswordValid = await user?.validatePassword(password);

    // if password is not valid
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // hashing of new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update the password in user model
    user.password = hashedPassword;
    // saving user model
    await user.save();

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
    // get object of updating field
    const editData = getValidUserUpdatePayload(req.body);

    // get profile image from req.files
    const file = req?.files?.image as UploadedFile;

    // if file is not present and editData also empty
    if(!file && Object.keys(editData).length === 0 ) {
      throw new Error("Atleast one field required to update the data");
    }

    // Upload the image to Cloudinary
    let result = null;
    if(file) {
      // validating file type
      validateFileContent(file.mimetype, "image");

      // uploading image to cloudinary
      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: "profilePics",
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

    // if url not generated
    if(file && !profilePicture) {
      throw new Error("Something went wrong while uploading Image");
    }

    // add profilePicture field in editData(if profilePicture is notNull)
    if(profilePicture) {
      editData.profilePicture = profilePicture;
    }
    if(Object.keys(editData).length === 0 ) {
      throw new Error("It seems like we are getting an error while updating profile Image");
    }

    // get user from request(via middleware - userAuth)
    const user = req.user;

    if(!user) {
      throw new Error("It seems like User not found");
    }

    // assign updatedField to user model
    Object.assign(user, editData);
    // saving updated user model
    await user.save();

    return res.status(200).json({
      message: "User details updated successfully",
      data: { user },
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
