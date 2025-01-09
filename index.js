import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { Broma } from './broma.js';
//import { Broma } from './broma.js'; // Asegúrate de que este modelo esté correctamente definido

const app = express();
const port = 3005;
dotenv.config();

// Middleware
app.use(cors({ origin: '*' })); // Habilitar peticiones cross-origin
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Conexión a la base de datos
const connectDB = async () => {
    const {
        MONGO_USERNAME,
        MONGO_PASSWORD,
        MONGO_HOSTNAME,
        MONGO_PORT,
        MONGO_DB
    } = process.env;

    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB está corriendo');
    } catch (err) {
        console.error('Error conectándose a MongoDB:', err.message);
    }
};

// Llamar a la función para conectar a la base de datos
connectDB();

// Rutas
// Ruta para crear una nueva broma
app.post('/bromas/:parametro', async (req, res) => {
    switch (req.params.parametro) {
        case 'Chuck':
            try {
                const response = await axios.get('https://api.chucknorris.io/jokes/random');
                res.json({ joke: response.data.value });
            } catch (error) {
                console.error('Error fetching joke:', error);
                res.status(500).json({ error: 'Error en traer la broma de chucknorris.io' });
            }
            break;
        case 'Dad Joke':
            try {
                const response = await axios.get('https://icanhazdadjoke.com/api');
                res.json({ joke: response.data.value });
            } catch (error) {
                console.error('Error fetching joke:', error);
                res.status(500).json({ error: 'Error en traer la broma de icanhazdadjoke' });
            }
            break;
        case 'Propio':
            try {
                const nuevaBroma = new Broma(req.body);
                await nuevaBroma.save();
                res.status(201).json(nuevaBroma);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
            break;
        default:
            res.status(404).json({ error: 'Parámetro no válido' });
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
        const bromaEliminada = await Broma.findByIdAndDelete(req.params.id);
        if (!bromaEliminada) {
            return res.status(404).json({ message: 'Broma no encontrada' });
        }
        res.json({ message: 'Broma eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});