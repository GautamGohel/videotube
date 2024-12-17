import {v2 as cloudinary} from "cloudinary"
import fs from "fs"//file system for file handling

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localfilepath)=>{
  try {
    if(!localfilepath) return null;
    const response=await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"})
    console.log("file has been uploaded successfully",response.url)
    return response
  } catch (error) {
    await fs.promises.unlink(localfilepath);//remove the local temp saved file if upload failed
    return null
  }
}

export {uploadOnCloudinary}