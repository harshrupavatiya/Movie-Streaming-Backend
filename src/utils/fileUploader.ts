import { v2 as cloudinary } from "cloudinary";

interface ICloudinaryOptions {
  height?: number;
  folder?: string;
  quality?: number;
  resource_type?: "auto" | "image" | "video" | "raw" | undefined;
  timeout?: number; 
}

export const uploadImageToCloudinary = async (
  filePath: string,
  options: ICloudinaryOptions = {}
): Promise<any> => {
  try {
    console.log("111");
    // Set default values
    const defaultOptions: ICloudinaryOptions = {
      resource_type: "auto",
      // timeout: 300000, // 2 minutes
    };

    console.log("222");
    // Merge user-provided options with defaults
    const uploadOptions = { ...defaultOptions, ...options };

    console.log("333");
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    console.log("444", result);
    return result;
  } catch (error) {
    console.log("error : ", error);
    throw error;
  }
};
