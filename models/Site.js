import mongoose from "mongoose";
const Schema = mongoose.Schema;

const siteSchema = new Schema({
    site_name: {
        type: String,
        required: true
    },
    position: {
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    },
    Owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, {
    timestamps: true 
});

const Site = mongoose.model('Site', siteSchema);

export default Site;