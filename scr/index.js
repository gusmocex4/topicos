import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { Broma } from './broma.js';

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
        await mongoose.connect(url);
        console.log('Conexión a la base de datos exitosa');
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
    }
};

connectDB();


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
                const response = await axios.get('https://icanhazdadjoke.com/');
                res.json({ joke: response.data.joke });
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


// Rutas
app.get('/bromas', async (req, res) => {
    try {
        const bromas = await Broma.find();
        res.json(bromas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.put('/bromas/:id', async (req, res) => {
    try {
        const bromaActualizada = await Broma.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bromaActualizada) {
            return res.status(404).json({ message: 'Broma no encontrada' });
        }
        res.json(bromaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.get('/bromas/categoria/:categoria', async (req, res) => {
    const categoria = req.params.categoria;

    try {
        const cantidad = await Broma.countDocuments({ categoria: categoria });

        if (cantidad === 0) {
            return res.status(404).send(`<h1>Error: No hay chistes en la categoría "${categoria}".</h1>`);
        }

        res.send(`<h1>Cantidad de chistes en la categoría "${categoria}": ${cantidad}</h1>`);
    } catch (error) {
        res.status(500).send('<h1>Error al obtener la cantidad de chistes.</h1>');
    }
});

app.get('/bromas/puntaje/:puntaje', async (req, res) => {
    const puntaje = parseInt(req.params.puntaje);

    try {
        const chistes = await Broma.find({ puntaje: puntaje });

        if (chistes.length === 0) {
            return res.status(404).send(`<h1>Error: No hay chistes con el puntaje ${puntaje}.</h1>`);
        }
        
        // Crear un string HTML para mostrar los chistes
        let htmlResponse = `<h1>Chistes con puntaje ${puntaje}:</h1><ul>`;
        chistes.forEach(chiste => {
            htmlResponse += `<li>${chiste.texto} - ${chiste.categoria}</li>`;
        });
        htmlResponse += '</ul>';
        
        res.send(htmlResponse);
    } catch (error) {
        res.status(500).send('<h1>Error al obtener los chistes.</h1>');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});