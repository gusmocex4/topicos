import mongoose from 'mongoose';

const antonela=mongoose.Schema
const userSchema= new antonela({
    name:{
            type:String,
            require:true},
    role:{
        type:String,
        require:true,
        enum: ['ADMIN','PEPE','PAPA']
    }
})

const User = mongoose.model('User',userSchema)
export { User };