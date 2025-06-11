const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name: {
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
    confirm_password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
})

// Virtual property for easy admin check
userSchema.virtual('isAdmin').get(function() {
    return this.role === 'admin'
})

module.exports=mongoose.model('User',userSchema)