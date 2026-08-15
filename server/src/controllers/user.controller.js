import {updateProfile, getPublicProfile} from "../services/user.service.js";

export const getMe = (req,res)=>{
    res.status(200).json({success:true, data:{user:req.user}, message:"Current user profile"});
}

export const updateMe = async (req,res,next)=>{
    try{
        const updatedUser = await updateProfile(req.user.id, req.body);
        res.status(200).json({success:true, data:{user:updatedUser}, message:"Profile updated successfully"});
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req,res,next)=>{
    try{
        const user = await getPublicProfile(req.params.id);
        res.status(200).json({success:true, data:{user}, message:"User public profile fetched successfully"});
    } catch (error) {
        next(error);    
    }
}