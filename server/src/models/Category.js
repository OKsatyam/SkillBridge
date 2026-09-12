import mongoose from "mongoose";
const {Schema} = mongoose;

const categorySchema = new Schema({
    name:{type:String, required:true, unique:true, trim:true},
    slug:{type:String, required:true, unique:true, trim:true,lowercase:true},
},{ timestamps:true})

export default mongoose.model("Category", categorySchema);