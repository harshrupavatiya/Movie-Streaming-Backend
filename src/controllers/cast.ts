import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import Cast from "../models/cast"; // Ensure correct import path
import Series from "../models/series";
import Movie from "../models/movie";

// Add Cast (Admin Only)
export const addCast = async (
    req: AuthRequest,
    res: Response
  ): Promise<string | any> => {
    try {
      // Check if the user is an admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const { name, age, gender , birthDate, nationality, profileImage } = req.body;
  
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          message: "Missing required fields: name.",
        });
      }
  
      // Create a new cast member
      const newCast = new Cast({
        name,
        age,
        gender,
        birthDate,
        nationality,
        profileImage,
      });
  
      await newCast.save();
  
      res.status(201).json({
        success: true,
        message: "Cast member added successfully",
        cast: newCast,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  };

// Get All Cast Names with Object ID--------------------------------------------------------------------------------
export const getAllCastNames = async (
    req: AuthRequest,
    res: Response
  ): Promise<string | any> => {
    try {
      const castList = await Cast.find({}, "_id name"); // Fetch only _id and name
  
      res.status(200).json({
        success: true,
        cast: castList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  };
  
// Update Cast (Admin Only)--------------------------------------------------------------------------------
export const updateCast = async (
    req: AuthRequest,
    res: Response
  ): Promise<string | any> => {
    try {
      // Check if the user is an admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const { castId } = req.params; // Get cast ID from URL params
      const { name, age, gender, birthDate, nationality, profileImage } = req.body;
  
      // Find and update the cast member
      const updatedCast = await Cast.findByIdAndUpdate(
        castId,
        { name, age, gender, birthDate, nationality, profileImage },
        { new: true, runValidators: true } // Return updated document and validate fields
      );
  
      if (!updatedCast) {
        return res.status(404).json({ message: "Cast member not found." });
      }
  
      res.status(200).json({
        success: true,
        message: "Cast details updated successfully",
        cast: updatedCast,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  };

  // Delete Cast (Admin Only)--------------------------------------------------------------------------------
export const deleteCast = async (
    req: AuthRequest,
    res: Response
  ): Promise<string | any> => {
    try {
      // Check if the user is an admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const { castId } = req.params; // Get cast ID from URL params
  
      // Find and delete the cast member
      const deletedCast = await Cast.findByIdAndDelete(castId);
  
      if (!deletedCast) {
        return res.status(404).json({ message: "Cast member not found." });
      }
  
      // Remove cast reference from any associated series
      await Series.updateMany(
        { "cast.castId": castId },
        { $pull: { cast: { castId } } }
      );
  
      // Remove cast reference from any associated movies
      await Movie.updateMany(
        { "cast.castId": castId },
        { $pull: { cast: { castId } } }
      );
  
      res.status(200).json({
        success: true,
        message: "Cast member deleted successfully",
        deletedCast,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  };
  