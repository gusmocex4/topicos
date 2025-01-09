import mongoose from 'mongoose';

const bromaSchema = new mongoose.Schema({
    texto: { 
        type: String, 
        required: true 
    }, // Texto del chiste (requerido)
    autor: { 
        type: String, 
        default: 'Se perdió en el Ávila como Led' 
    }, // Autor del chiste (opcional)
    puntaje: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 10 
    }, // Puntaje del chiste (requerido, entre 1 y 10)
    categoria: { 
        type: String, 
        required: true, 
        enum: ['Dad joke', 'Humor Negro', 'Chistoso', 'Malo'] 
    } // Lista de categorías permitidas
}, { timestamps: true }); // Añade marcas de tiempo (createdAt, updatedAt)

// Modelo de Mongoose para la colección "Broma"
const Broma = mongoose.model('Broma', bromaSchema);

export { Broma };