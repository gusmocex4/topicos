import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import { Broma } from './broma.js';

const app= express()
const port=3005
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
    console.log('api corriendo en http://localhost:3005')
    connectDB()
})

// Ruta para crear una nueva broma
app.post('/bromas:parametro', async (req, res) => {
    
    
    try {
        const nuevaBroma = new Broma(req.body);
        await nuevaBroma.save();
        res.status(201).json(nuevaBroma);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para obtener todas las bromas
app.get('/bromas', async (req, res) => {
    try {
        const bromas = await Broma.find();
        res.json(bromas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener una broma por ID
app.get('/bromas/:id', async (req, res) => {
    try {
        const broma = await Broma.findById(req.params.id);
        if (!broma) {
            return res.status(404).json({ message: 'Broma no encontrada' });
        }
        res.json(broma);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar una broma por ID
app.put('/bromas/:id', async (req, res) => {
    try {
        const bromaActualizada = await Broma.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bromaActualizada) {
            return res.status(404).json({ message: 'Broma no encontrada' });
        }
        res.json(bromaActualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para eliminar una broma por ID
app.delete('/bromas/:id', async (req, res) => {
    try {
        await Broma.findByIdAndDelete(req.params.id);
        res.json({ message: 'Broma eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/chistes/categoria/:categoria', async (req, res) => {
    const categoria = req.params.categoria;

    try {
        const cantidad = await Chiste.countDocuments({ categoria: categoria });

        if (cantidad === 0) {
            return res.status(404).send(<h1>Error: No hay chistes en la categoría "${categoria}".</h1>);
        }

        res.send(<h1>Cantidad de chistes en la categoría "${categoria}": ${cantidad}</h1>);
    } catch (error) {
        res.status(500).send('<h1>Error al obtener la cantidad de chistes.</h1>');
    }
});



app.get('/chistes/puntaje/:puntaje', async (req, res) => {
    const puntaje = parseInt(req.params.puntaje);

    try {
        const chistes = await Chiste.find({ puntaje: puntaje });

        if (chistes.length === 0) {
            return res.status(404).send(<h1>Error: No hay chistes con el puntaje ${puntaje}.</h1>);
        }

        // Crear un string HTML para mostrar los chistes
        let htmlResponse = '<h1>Chistes con puntaje ' + puntaje + ':</h1><ul>';
        chistes.forEach(chiste => {
            htmlResponse += <li>${chiste.texto} - ${chiste.categoria}</li>;
        });
        htmlResponse += '</ul>';

        res.send(htmlResponse);
    } catch (error) {
        res.status(500).send('<h1>Error al obtener los chistes.</h1>');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
