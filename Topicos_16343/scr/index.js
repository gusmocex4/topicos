import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import { User } from './user.js';

const app= express()
const port=3007
dotenv.config()

app.use(cors({origin: '*'})) // habilitar peticiones
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({extended:false}))

const connectDB= () => {
    const {
            MONGO_USERNAME,
            MONGO_PASSWORD,
            MONGO_HOSTNAME,
            MONGO_PORT,
            MONGO_DB
    }=process.env

    const url=`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`
    mongoose.connect(url).then(()=>{
            console.log('Mongol esta corriendo')
    }).catch ((err)=>{
            console.log(err)
    })
}

app.listen(port,() => {
    console.log('api corriendo en http://localhost:3007')
    connectDB()
})

app.get('/Waza', async(req,res)=>{   // siempre se empieza con el /, y la funcion debe tener 2 valores req y res
    res.status(200).send('hola mundo, mi primera API! WAZAAAA')
})

app.get('/Julio', async(req,res)=>{   // siempre se empieza con el /, y la funcion debe tener 2 valores req y res
    res.status(200).send('bombardeen peru')
})

app.post('/mondongo',async(req,res)=>{
    try {
        var data=req.body
        var newUser =new User(data)
        await newUser.save()
        res.status(200).send('Se creo el usuario exitosamente')
    } catch (err) {
        res.status(400).send('Error al crear el usuario')
    }
})

app.get('/termo', async(req,res)=>{  
    try {
        var usuario=await User.find().exec()
        res.status(200).send(usuario)
    } catch (err) {
        res.status(400).send('Error al obtener')
    }
})