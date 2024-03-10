import mongoose from "mongoose";
const {Schema} = mongoose;
const UserSchema= new Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type:String,
        required: true
    },
});

const User = mongoose.model('User',UserSchema);
export default User;