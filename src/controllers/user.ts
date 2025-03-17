import { Response } from "express";
import { AuthRequest } from "../types/api";
import { validateName, validatePassword } from "../validators/inputValidators";
import bcrypt from "bcrypt";
import { getValidUserUpdatePayload } from "../utils/getPayload";
import { UploadedFile } from "express-fileupload";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";
import { validateFileContent } from "../validators/mediaFile";
import User from "../models/user";
import { ADMIN, } from "../utils/constants";

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Extract information
    const { password, newPassword } = req.body;

    // validate both passwords old and new
    validatePassword(password);
    validatePassword(newPassword);

    // user from middleware
    const user = req.user;

    if (!user) {
      throw new Error("User not found in middleware");
    }

    // compare old password with existing password hash
    const isPasswordValid = await user?.validatePassword(password);

    // if password is not valid
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid Password" });
      return;
    }

    // hashing of new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update the password in user model
    user.password = hashedPassword;
    // saving user model
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
    return;
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
    return;
  }
};

export const editProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // get object of updating field
    const editData = getValidUserUpdatePayload(req.body);

    console.log(editData)
    // get profile image from req.files
    const file = req?.files?.image as UploadedFile;

    // if file is not present and editData also empty
    if (!file && Object.keys(editData).length === 0) {
      res
        .status(400)
        .json({ message: "Atleast one field required to update the data" });
      return;
    }

    // Upload the image to Cloudinary
    let result = null;
    if (file) {
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
    if (file && !profilePicture) {
      res
        .status(400)
        .json({ message: "Something went wrong while uploading Image" });
      return;
    }

    // add profilePicture field in editData(if profilePicture is notNull)
    if (profilePicture) {
      editData.profilePicture = profilePicture;
    }
    if (Object.keys(editData).length === 0) {
      res.status(400).json({
        message:
          "It seems like we are getting an error while updating profile Image",
      });
      return;
    }

    // get user from request(via middleware - userAuth)
    const user = req.user;

    if (!user) {
      res.status(400).json({ message: "It seems like User not found" });
      return;
    }
    console.log(editData,"line125")


    // assign updatedField to user model
    Object.assign(user, editData);
    // saving updated user model
    await user.save();
    console.log(user, "346287423")


    res.status(200).json({
      message: "User details updated successfully",
      data: { user },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getUserList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get page and limit from query parameters
    let { search = "", page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }
    if (search !== "") {
      validateName(search as string);
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    // If search params is notEmpty
    if (search !== "") {
      const searchRegExp = new RegExp(search as string, "i");
      const userList = await User.find({ name: searchRegExp })
        .select("name email contactNo subscription.plan role isActive")
        .skip(skipDocNumber)
        .limit(limitNumber);

      if (!userList || userList.length <= 0) {
        res.status(400).json({ message: "No data found" });
        return;
      }

      res.status(200).json({
        message: `User List of page: ${pageNumber}, pageSize: ${limitNumber}`,
        data: { userList },
      });
      return;
    }
    const userDocLength = await User.countDocuments();

    // If search params is Empty
    const userList = await User.find({})
      .select("name email contactNo subscription.plan role isActive")
      .skip(skipDocNumber)
      .limit(limitNumber);

      console.log(userDocLength);

    if (!userList || userList.length <= 0) {
      res.status(400).json({ message: "No data found" });
      return;
    }

    res.status(200).json({
      message: `User List of page: ${pageNumber}, pageSize: ${limitNumber}`,
      data: { userList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const createAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get user ID
    const { userId } = req.body;

    // update user details and get updated userInfo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    );

    // if userInfo is null so userId is not valid
    if (!updatedUser) {
      res.status(400).json({ message: "Invalid UserId" });
      return;
    }

    res
      .status(200)
      .json({ message: `User ${updatedUser.name} became Admin successfully.` });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const toggleUserIsActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get userId and active status
    const { userId, isActive } = req.body;

    // validate input types
    if (typeof isActive !== "boolean" || typeof userId !== "string") {
      res.status(400).json({
        message:
          "Invalid data, isActive shold be boolean and userId should be string",
      });
      return;
    }

    // update user and get updated userInfo
    const user = await User.findById(userId);

    // if userInfo is null means userId is invalid
    if (!user) {
      res.status(500).json({ message: "user not exist with given userId" });
      return;
    }

    if (user.role === "admin") {
      res
        .status(400)
        .json({ message: "Access Denied, Admin can suspend only users" });
      return;
    }

    if (user.isActive === isActive) {
      res.status(400).json({
        message: `User is already ${isActive ? "active" : "inActive"}`,
      });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res
      .status(200)
      .json({ message: `User is now ${isActive ? "active" : "inActive"}` });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getUserInfo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(400).json({ message: "user not found" });
      return;
    }

    res.status(200).json({
      message: "User Information",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          contactNo: user.contactNo,
          profilePicture: user.profilePicture,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          subscriptionPlan: user.subscription?.plan,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
