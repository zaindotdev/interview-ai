import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ErrorResponse } from "./response";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToStorage = async (buffer: Buffer): Promise<UploadApiResponse> => {
  try {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        },
      );
      stream.end(buffer);
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary", error);
    throw new ErrorResponse("Failed to upload file");
  }
};
