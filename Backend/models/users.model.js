
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    mobile_no:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    profile_pic:{
       public_id:{
        type:String,
        required:true
       },
       url:{
        type:String,
        required:true
       }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

})

const Users = mongoose.model("Users", userSchema);
export default Users;