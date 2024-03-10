import mongoose from "mongoose";
const Schema = mongoose.Schema;

const droneSchema = new Schema({
    drone_id: {
        type: String,
        required: true,
        unique: true
    },
    drone_type: {
        type: String,
        required: true
    },
    make_name: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    site: {
        type: Schema.Types.ObjectId,
        ref: 'Site',
        required: true
    },
    deleted_by: {
        type: String,
        default:"NA"
    },    
}, {
    timestamps: true 
});

const Drone = mongoose.model('Drone', droneSchema);

export default Drone;