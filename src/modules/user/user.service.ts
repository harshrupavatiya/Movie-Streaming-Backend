import mongoose from "mongoose";
import User from "./user.model";

export const getUserById = async (id: mongoose.Types.ObjectId) => {
  return User.findOne({ _id: id, isActive: true, isDeleted: false });
};
