import mongoose  from "mongoose";

const roomSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },

    available:{
        type:Boolean,
        required:true
    },

    rating:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    amenities:{
        type:String,
        required:true
    },
    image:{
        public_id:{
            type:String,
            required:true
           },
           url:{
            type:String,
            required:true
           }
    },
    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Owner",
        required:false // Making it optional to fix the 500 error
    }

},{ timestamps: true })

const rooms = mongoose.model("Rooms", roomSchema);
export default rooms;