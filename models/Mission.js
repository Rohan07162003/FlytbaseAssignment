import mongoose from "mongoose";
const Schema = mongoose.Schema;

const missionSchema = new Schema({
    alt: {
        type: Number,
        required: true
    },
    speed: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    waypoints: [{
        alt: {
            type: Number,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }],
    site: {
        type: Schema.Types.ObjectId,
        ref: 'Site',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
}, {
    timestamps: true 
});

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;