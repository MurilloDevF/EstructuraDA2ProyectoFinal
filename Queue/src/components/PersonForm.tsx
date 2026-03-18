import { useState } from 'react';
import type { Persona } from '../App';

// Recibe la función onAgregar desde el padre (App.tsx)
// cuando el usuario llena el formulario y presiona agregar
interface Props {
    onAgregar: (persona: Persona) => void;
}

function PersonForm({ onAgregar }: Props) {
    // Un estado por cada campo del formulario
    // Empiezan vacíos y se llenan cuando el usuario escribe
    const [nombre, setNombre] = useState('');
    const [monto, setMonto] = useState('');

    // Se ejecuta cuando el usuario presiona el botón Agregar
    // Valida que todos los campos estén llenos antes de agregar
    const handleAgregar = () => {
        // Si algún campo está vacío no hacemos nada
        if (nombre === '' || monto === '') return;

        // Creamos el objeto persona con los datos del formulario
        // La fecha de llegada la asigna el sistema automáticamente
        const nuevaPersona: Persona = {
            nombre,
            monto: parseInt(monto), // convertimos string a número
            fechaLlegada: new Date().toLocaleString(), // fecha actual del sistema
        };

        // Enviamos la persona al padre para que la agregue a la cola
        onAgregar(nuevaPersona);

        // Limpiamos los campos del formulario después de agregar
        setNombre('');
        setMonto('');
    };

    return (
        <div>
            <h2>Agregar Persona a la Fila</h2>

            {/* Cada input captura un campo de la persona
          onChange actualiza el estado cada vez que el usuario escribe */}
            <input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <input
                placeholder="Monto a retirar"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
            />

            {/* Al hacer click llama handleAgregar que valida y envía al padre */}
            <button onClick={handleAgregar}>Agregar a la fila</button>
        </div>
    );
}

export default PersonForm;