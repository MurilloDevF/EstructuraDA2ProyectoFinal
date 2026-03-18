import type { Persona } from '../App';

// Recibe el array de personas desde el padre (App.tsx)
interface Props {
    personas: Persona[];
}

function PersonQueue({ personas }: Props) {
    return (
        <div>
            <h2>Fila del Cajero</h2>

            {/* Si no hay personas mostramos un mensaje */}
            {personas.length === 0 && <p>No hay personas en la fila</p>}

            {/* Recorremos el array con map para mostrar cada persona
          El orden es FIFO: el primero en la lista es el primero en ser atendido */}
            {personas.map((persona, index) => (
                <div key={persona.fechaLlegada}>
                    {/* Indicamos visualmente quién es el siguiente */}
                    {index === 0 && <p>⬇ Siguiente en ser atendido</p>}

                    <p>Nombre: {persona.nombre}</p>
                    <p>Monto a retirar: ${persona.monto}</p>
                    <p>Fecha de llegada: {persona.fechaLlegada}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default PersonQueue;