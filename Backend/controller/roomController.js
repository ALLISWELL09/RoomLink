import rooms from "../models/rooms.model.js";
import { v2 as cloudinary } from 'cloudinary';
import purchase from "../models/booking.model.js";



export const createRoom = async (req, res) => {

    const { title, description, location, price, available, rating, gender, amenities, creatorId: bodyCreatorId } = req.body
    // Get owner ID from middleware
    const ownerId = req.ownerId;

    console.log('Creating room with owner ID:', ownerId);
    console.log('Request body:', req.body);

    try {
        // Validate required fields
        if (!title || !description || !location || !price || !available || !rating || !gender || !amenities) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Log owner ID status but don't require it
        if (!ownerId) {
            console.warn('Owner ID is missing in the request, but continuing anyway');
            // We'll continue without the owner ID
        } else {
            console.log('Using owner ID:', ownerId);
        }

        // Uploading Image
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const image = req.files.image;

        // Allowed file formats
        const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedFormats.includes(image.mimetype)) {
            return res.status(400).json({ error: "Invalid File Format. Only PNG and JPG are allowed" });
        }

        // Upload to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
        console.log('Cloudinary response:', cloudResponse);

        if (!cloudResponse || cloudResponse.error) {
            return res.status(400).json({ error: "Error uploading file to Cloudinary" });
        }

        // Create room details object
        const roomDetails = {
            title,
            description,
            location,
            price,
            available,
            rating,
            gender,
            amenities,
            image: {
                public_id: cloudResponse.public_id,
                url: cloudResponse.url
            }
        };

        // Only add creatorId if it exists
        if (ownerId) {
            roomDetails.creatorId = ownerId;
        }

        console.log('Creating room with details:', roomDetails);

        // Create the room in the database
        const newRoom = await rooms.create(roomDetails);
        console.log('Room created successfully:', newRoom);

        res.status(200).json({
            message: "Room Created Successfully",
            room: newRoom
        });
    }
    catch (err) {
        console.error('Error creating room:', err);

        // Provide more specific error messages
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: "Validation Error",
                details: err.message
            });
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }



}

export const getRooms = async (req,res)=>{
    try{
        const allRooms = await rooms.find();
        if(!allRooms || allRooms.length === 0){
            return res.status(404).json({error:"No Rooms Found"});
        }

        res.status(200).json(allRooms);

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
}

// Get unique locations from all rooms
export const getLocations = async (req, res) => {
    try {
        // Find all rooms and select only the location field
        const locations = await rooms.find({}, 'location');

        if (!locations || locations.length === 0) {
            return res.status(404).json({ error: "No locations found" });
        }

        // Extract unique locations
        const uniqueLocations = [...new Set(locations.map(room => room.location))];

        // Sort locations alphabetically
        uniqueLocations.sort();

        res.status(200).json(uniqueLocations);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getRoomsById = async (req,res)=>{

    const {roomId} = req.params


    try {
        const room = await rooms.findById(roomId)

        if(!room){
            return res.status(404).json({error:"Room Not Found"});
        }

        res.status(200).json({message:"Room Found",room});


        console.log(room)

    } catch (error) {

        console.log(error);
        res.status(500).json({message:"Error in getRoomsById"})

    }



}

export const updateRooms = async (req, res) => {
    const { roomId } = req.params;
    const { title, description, location, price, available, rating, gender, amenities,
            keepExistingImage, existingImageId, existingImageUrl } = req.body;
    const ownerId = req.ownerId;

    console.log('Updating room with ID:', roomId);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    try {
        // First, find the room to make sure it exists and belongs to this owner
        const existingRoom = await rooms.findOne({ _id: roomId, creatorId: ownerId });

        if (!existingRoom) {
            return res.status(404).json({
                error: "Room not found or you don't have permission to update it"
            });
        }

        // Prepare the update object
        const updateData = {
            title,
            description,
            location,
            price,
            available: available === 'true' || available === true,
            rating,
            gender,
            amenities
        };

        // Handle image update
        if (req.files && req.files.image) {
            // New image uploaded - process it
            const image = req.files.image;

            // Validate image format
            const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
            if (!allowedFormats.includes(image.mimetype)) {
                return res.status(400).json({ error: "Invalid File Format. Only PNG and JPG are allowed" });
            }

            // If there's an existing image, delete it from Cloudinary
            if (existingRoom.image && existingRoom.image.public_id) {
                try {
                    await cloudinary.uploader.destroy(existingRoom.image.public_id);
                    console.log('Deleted old image from Cloudinary:', existingRoom.image.public_id);
                } catch (cloudinaryError) {
                    console.error('Error deleting old image from Cloudinary:', cloudinaryError);
                    // Continue with the update even if deleting the old image fails
                }
            }

            // Upload new image to Cloudinary
            const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
            console.log('Cloudinary response for new image:', cloudResponse);

            if (!cloudResponse || cloudResponse.error) {
                return res.status(400).json({ error: "Error uploading file to Cloudinary" });
            }

            // Add new image data to update object
            updateData.image = {
                public_id: cloudResponse.public_id,
                url: cloudResponse.url
            };

        } else if (keepExistingImage === 'true' && existingImageId && existingImageUrl) {
            // Keep existing image - use the data from the request
            console.log('Keeping existing image:', { existingImageId, existingImageUrl });
            updateData.image = {
                public_id: existingImageId,
                url: existingImageUrl
            };
        } else {
            // No image provided and no existing image data
            return res.status(400).json({ error: "Image is required" });
        }

        console.log('Updating room with data:', updateData);

        // Update the room in the database
        const updatedRoom = await rooms.findByIdAndUpdate(
            roomId,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Room updated successfully:', updatedRoom);

        res.status(200).json({
            message: "Room Details Updated Successfully",
            room: updatedRoom
        });

    } catch (error) {
        console.error('Error updating room:', error);

        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: "Validation Error",
                details: error.message
            });
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
    }
};

export const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    const ownerId = req.ownerId;

    try {
        const room = await rooms.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room Not Found" });
        }

        // Check if the room belongs to this owner
        if (room.creatorId.toString() !== ownerId) {
            return res.status(403).json({ error: "You don't have permission to delete this room" });
        }

        if (room.image && room.image.public_id) {
            await cloudinary.uploader.destroy(room.image.public_id);
        }

        // Delete the room from the database
        await rooms.findByIdAndDelete(roomId);

        res.status(200).json({ message: "Room Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ error: "Error in deleting room" });
    }
};


export const buyRoom = async (req,res)=>{
    const {userId} = req;
    const {roomId} = req.params;
    const {paymentId, amount, duration} = req.body; // Get payment details from request body

    try {
        console.log(`Attempting to purchase room ${roomId} for user ${userId}`);
        console.log(`Payment details: paymentId=${paymentId}, amount=${amount}, duration=${duration}`);

        // Find the room
        const room = await rooms.findById(roomId);
        if(!room){
            console.log(`Room with ID ${roomId} not found`);
            return res.status(404).json({error:"Room not Found"});
        }

        // Check if room is available
        if (!room.available) {
            console.log(`Room with ID ${roomId} is not available for purchase`);
            return res.status(400).json({ error: "Room is not available for purchase" });
        }

        // Check if user already purchased this room
        const existingPurchase = await purchase.findOne({userId, roomId});
        if(existingPurchase){
            console.log(`User ${userId} has already purchased room ${roomId}`);
            return res.status(400).json({error:"User already Purchased this room"});
        }

        // Create a new purchase record in the payments collection
        const newPurchase = new purchase({
            userId,
            roomId,
            creatorId: room.creatorId, // Store the owner ID for reference
            paymentId: paymentId || null, // Link to the payment
            amount: amount || room.price, // Use the provided amount or default to room price
            duration: duration || 1 // Use the provided duration or default to 1 month
        });

        // Save the purchase
        const savedPurchase = await newPurchase.save();
        console.log(`Created new payment record: ${savedPurchase._id}`);

        // Update room availability to false (no longer available)
        room.available = false;
        await room.save();
        console.log(`Updated room ${roomId} availability to false`);

        // Return success response
        res.status(201).json({
            message: "Room Purchased Successfully",
            purchase: savedPurchase,
            room: {
                id: room._id,
                title: room.title,
                available: room.available
            }
        });

    } catch (error) {
        console.error("Error in Room Buying:", error);
        res.status(500).json({error: "Error in Room Buying", message: error.message});
    }
}

// Get rooms by owner ID
export const getOwnerRooms = async (req, res) => {
    const ownerId = req.ownerId;

    try {
        console.log(`Fetching rooms for owner ID: ${ownerId}`);

        // Log owner ID status
        if (!ownerId) {
            console.warn('Owner ID is missing in the request for getOwnerRooms');
            // Return empty array instead of error
            return res.status(200).json([]);
        }

        // Find all rooms created by this owner
        const ownerRooms = await rooms.find({ creatorId: ownerId });
        console.log(`Found ${ownerRooms.length} rooms for owner ID: ${ownerId}`);

        // Log each room's details for debugging
        if (ownerRooms.length > 0) {
            ownerRooms.forEach((room, index) => {
                console.log(`Room ${index + 1}: ID=${room._id}, Title=${room.title}, CreatorID=${room.creatorId}`);
            });
        }

        if (!ownerRooms || ownerRooms.length === 0) {
            console.log(`No rooms found for owner ID: ${ownerId}`);
            return res.status(200).json([]);
        }

        res.status(200).json(ownerRooms);

    } catch (error) {
        console.error('Error fetching owner rooms:', error);

        // Provide more specific error messages
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: "Invalid owner ID format",
                message: "The owner ID provided is not in a valid format."
            });
        }

        res.status(500).json({
            error: "Error fetching owner rooms",
            message: error.message
        });
    }
};