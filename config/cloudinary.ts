// Cloudinary Configuration and Integration
import * as FileSystem from "expo-file-system";


// Environment variables for Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Unsigned uploads
export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      if (!imageUri) throw new Error("No image selected");
      
      // ✅ Validate environment variables
      if (!CLOUDINARY_CLOUD_NAME) throw new Error("Cloudinary cloud name not configured");
      if (!CLOUDINARY_UPLOAD_PRESET) throw new Error("Cloudinary upload preset not configured");
  
      console.log("Uploading image to Cloudinary...");
  
      // ✅ Convert local file to a Blob using `expo-file-system`
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) throw new Error("File does not exist");
  
      const fileUri = fileInfo.uri;
      const formData = new FormData();
  
      formData.append("file", {
        uri: fileUri,
        type: "image/jpeg", // Adjust for other types if needed
        name: "upload.jpg",
      } as any); // ✅ Fix: Use `as any` to avoid TypeScript FormData error
  
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // ✅ Now guaranteed to be string
  
      console.log("Sending request to Cloudinary...");
  
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const result = await uploadResponse.json();
      if (!result.secure_url) throw new Error("Upload failed");
  
      console.log("Cloudinary Upload Success:", result.secure_url);
      return result.secure_url; // ✅ Return uploaded image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };


// signed uploads --> soon be implemented