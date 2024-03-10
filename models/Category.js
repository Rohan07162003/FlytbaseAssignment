import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    tag_name: {
        type: String,
        required: true
    },
    
    Owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    timestamps: true 
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
