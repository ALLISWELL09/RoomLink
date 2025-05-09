import mongoose from 'mongoose';

const OwnerSchema = new mongoose.Schema({

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

const owner =  mongoose.model("Owner", OwnerSchema);
export default owner;