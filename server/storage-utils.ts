import { v2 as cloudinary } from "cloudinary";

/**
 * Initialize Cloudinary with environment variables
 * CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
 */
if (!process.env.CLOUDINARY_URL) {
  console.warn(
    "CLOUDINARY_URL not set. Image uploads will be disabled. Set it in .env or Render environment variables."
  );
}

/**
 * Upload an image to Cloudinary from a base64 string or URL
 * @param fileData Base64 string or URL of the image
 * @param folder Cloudinary folder to organize uploads
 * @param publicId Custom public ID (optional)
 * @returns Object containing secure_url and public_id
 */
export async function uploadImage(
  fileData: string,
  folder: string = "scope-editorial",
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "Cloudinary not configured. Set CLOUDINARY_URL environment variable."
    );
  }

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      public_id: publicId,
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("Cloudinary not configured");
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
}

/**
 * Generate a signed upload widget URL for client-side uploads
 * This allows users to upload directly from the browser
 */
export function generateUploadSignature(folder: string = "scope-editorial") {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("Cloudinary not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    cloudName: cloudinary.config().cloud_name,
    apiKey: cloudinary.config().api_key,
  };
}
