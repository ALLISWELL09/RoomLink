import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },

})

const admin =  mongoose.model("Admin", AdminSchema);
export default admin;