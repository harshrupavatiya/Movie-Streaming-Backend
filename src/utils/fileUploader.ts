import { v2 as cloudinary } from "cloudinary";

interface ICloudinaryOptions {
  height?: number;
  folder?: string;
  quality?: number;
  resource_type?: "auto" | "image" | "video" | "raw" | undefined;
}

export const uploadImageToCloudinary = async (
  filePath: string,
  options: Partial<ICloudinaryOptions> = {}
): Promise<any> => {
  try {
    // Set default values
    const defaultOptions: ICloudinaryOptions = {
      resource_type: "auto",
    };

    // Merge user-provided options with defaults
    const uploadOptions = { ...defaultOptions, ...options };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result;
  } catch (error) {
    throw error;
  }
};
