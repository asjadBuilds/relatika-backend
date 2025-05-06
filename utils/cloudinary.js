import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
    cloud_name: 'dkhlqq9v1', 
    api_key: '592859233998967', 
    api_secret: '9ZoOATPUqDguAApB7AWJHBwzYlE'
});

const uploadFileonCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}

export {uploadFileonCloudinary}