import { Response } from 'express';
import { validatePassword } from '../validate/inputValidators';
import bcrypt from 'bcrypt';
import { getValidUserUpdatePayload } from './user.validation';
import { UploadedFile } from 'express-fileupload';
import { uploadImageToCloudinary } from '../utils/fileUploader';
import fs from 'fs';
import { validateFileContent } from '../validate/mediaFile';
import User from './user.model';
import { EPISODE, MOVIE, ADMIN } from '../../config/constants';
import { IWatchlistContent } from './user.interface';
import { AuthRequest } from '../auth';

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Extract information
    const { password, newPassword } = req.body;

    // validate both passwords old and new
    validatePassword(password);
    validatePassword(newPassword);

    // user from middleware
    const user = req.user;

    if (!user) {
      throw new Error('User not found in middleware');
    }

    // compare old password with existing password hash
    const isPasswordValid = await user?.validatePassword(password);

    // if password is not valid
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid Password' });
      return;
    }

    // hashing of new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update the password in user model
    user.password = hashedPassword;
    // saving user model
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const editProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // get object of updating field
    const editData = getValidUserUpdatePayload(req.body);

    console.log(editData);
    // get profile image from req.files
    const file = req?.files?.image as UploadedFile;

    // if file is not present and editData also empty
    if (!file && Object.keys(editData).length === 0) {
      res.status(400).json({ message: 'Atleast one field required to update the data' });
      return;
    }

    // Upload the image to Cloudinary
    let result = null;
    if (file) {
      // validating file type
      validateFileContent(file.mimetype, 'image');

      // uploading image to cloudinary
      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: 'profilePics',
        height: 800,
        quality: 100,
      });

      // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      });
    }
    // getting secure url from received data from cloudinary uploader
    const profilePicture = result?.secure_url || null;

    // if url not generated
    if (file && !profilePicture) {
      res.status(400).json({ message: 'Something went wrong while uploading Image' });
      return;
    }

    // add profilePicture field in editData(if profilePicture is notNull)
    if (profilePicture) {
      editData.profilePicture = profilePicture;
    }
    if (Object.keys(editData).length === 0) {
      res.status(400).json({
        message: 'It seems like we are getting an error while updating profile Image',
      });
      return;
    }

    // get user from AuthRequest(via middleware - userAuth)
    const user = req.user;

    if (!user) {
      res.status(400).json({ message: 'It seems like User not found' });
      return;
    }
    console.log(editData, 'line125');

    // assign updatedField to user model
    Object.assign(user, editData);
    // saving updated user model
    await user.save();
    console.log(user, '346287423');

    res.status(200).json({
      message: 'User details updated successfully',
      data: { user },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getUserList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get page and limit from query parameters
    const { search = '' } = req.query;

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const searchRegExp = new RegExp(search as string, 'i');

    const userList = await User.find({ name: searchRegExp })
      .select('name email contactNo subscription.plan role isActive')
      .skip(skipDocNumber)
      .limit(limitNumber);

    if (!userList || userList.length <= 0) {
      res.status(400).json({ message: 'No data found' });
      return;
    }

    const userCount = await User.find({
      name: searchRegExp,
    }).countDocuments();

    res.status(200).json({
      metadata: {
        totalUsers: userCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPage: Math.ceil(userCount / limitNumber),
      },
      message: `User List`,
      data: { userList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get user ID
    const { userId } = req.body;

    // update user details and get updated userInfo
    const updatedUser = await User.findByIdAndUpdate(userId, { role: ADMIN }, { new: true });

    // if userInfo is null so userId is not valid
    if (!updatedUser) {
      res.status(400).json({ message: 'Invalid UserId' });
      return;
    }

    res.status(200).json({ message: `User ${updatedUser.name} became Admin successfully.` });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const toggleUserIsActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // check user is admin
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get userId and active status
    const { userId, isActive } = req.body;

    // validate input types
    if (typeof isActive !== 'boolean' || typeof userId !== 'string') {
      res.status(400).json({
        message: 'Invalid data, isActive shold be boolean and userId should be string',
      });
      return;
    }

    // update user and get updated userInfo
    const user = await User.findById(userId);

    // if userInfo is null means userId is invalid
    if (!user) {
      res.status(500).json({ message: 'user not exist with given userId' });
      return;
    }

    if (user.role === ADMIN) {
      res.status(400).json({ message: 'Access Denied, Admin can suspend only users' });
      return;
    }

    if (user.isActive === isActive) {
      res.status(400).json({
        message: `User is already ${isActive ? 'active' : 'inActive'}`,
      });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ message: `User is now ${isActive ? 'active' : 'inActive'}` });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getUserInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(400).json({ message: 'user not found' });
      return;
    }

    res.status(200).json({
      message: 'User Information',
      data: {
        user: {
          _id: user._id,
          name: user.name,
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

// Toggle Watchlist (Add/Remove)--------------------------------------------------------------------------------
export const toggleWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }

    const { contentId, contentType } = req.body;
    const userId = req.user._id;

    if (!contentId || !contentType) {
      res.status(400).json({ message: 'Content ID and type are required' });
      return;
    }

    // Check if the content is already in the watchlist
    const isInWatchlist = req.user.watchlist.some(
      (item: IWatchlistContent) => item.contentId.toString() === contentId
    );

    if (isInWatchlist) {
      // Remove from watchlist
      await User.findByIdAndUpdate(userId, {
        $pull: { watchlist: { contentId } },
      });

      res.status(200).json({ message: 'Removed from watchlist' });
      return;
    } else {
      // Add to watchlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { watchlist: { contentId, contentType } },
      });

      res.status(201).json({ message: 'Added to watchlist' });
      return;
    }
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

// Get all watchlisted movies and series for a user--------------------------------------------------------------
export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const watchlist = await User.findById(req.user._id).select('watchlist').populate({
      path: 'watchlist.contentId',
      select: 'title poster description',
    });

    res.status(200).json({ data: { watchlist } });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

// Update Watch Progress
export const updateWatchProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existingUser = req.user;

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    //Progress will be stored in seconds(easier to calculate)
    const { contentId, contentType, progress } = req.body;

    if (!contentId || progress === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (contentType !== MOVIE && contentType !== EPISODE) {
      res.status(400).json({ message: 'Invalid content type' });
      return;
    }

    const index = existingUser.continueWatching.findIndex(
      (item: IWatchlistContent) => item.contentId.toString() === contentId
    );

    if (index !== -1) {
      // Update progress if content already exists in continue watching
      existingUser.continueWatching[index].progress = progress;
      existingUser.continueWatching[index].lastWatched = new Date();
    } else {
      // Add new entry if content is not already in continue watching
      existingUser.continueWatching.push({
        contentId,
        contentType,
        progress,
        lastWatched: new Date(),
      });
    }

    await existingUser.save();
    res.status(200).json({ message: 'Progress updated successfully' });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Get Continue Watching List
export const getContinueWatching = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const existingUser = await User.findById(user._id)
      .populate({
        path: 'continueWatching.contentId',
        select: 'title poster duration',
      })
      .sort({ 'continueWatching.lastWatched': -1 });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Continue Watching list',
      data: existingUser.continueWatching,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
