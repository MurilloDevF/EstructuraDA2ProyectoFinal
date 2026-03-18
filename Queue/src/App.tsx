import { useState } from 'react';
import PersonForm from './components/PersonForm';
import PersonQueue from './components/PersonQueue';

// ========================================
// INTERFACE - Define la estructura de una persona en la fila
// ========================================
export interface Persona {
  nombre: string;
  monto: number;        // monto a retirar en el cajero
  fechaLlegada: string; // asignada automáticamente por el sistema
}

// ========================================
// Estructura de datos que sigue el principio FIFO
// (First In First Out - Primero en entrar, primero en salir)
// Funciona como una fila de personas en un cajero:
// el primero en llegar es el primero en ser atendido
// ========================================
class Queue {
  items: Persona[] = []; // Array interno donde guardamos las personas

  // Agrega una persona al FINAL de la fila
  enqueue(persona: Persona) {
    this.items.push(persona);
  }

  // Saca y devuelve la persona del INICIO de la fila
  // Si no hay personas devuelve null
  dequeue(): Persona | null {
    return this.items.length > 0 ? this.items.shift() ?? null : null;
  }

  // Devuelve la persona del inicio SIN sacarla
  // Útil para ver quién es el siguiente sin modificar la fila
  peek(): Persona | null {
    return this.items.length > 0 ? this.items[0] : null;
  }

  // Verifica si no hay ninguna persona en la fila
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Devuelve cuántas personas hay en la fila
  size(): number {
    return this.items.length;
  }
}

// ========================================
// DATOS DE PRUEBA
// Creamos una fila con 3 personas iniciales
// para que la app no arranque vacía
// ========================================
const queueInicial = new Queue();
queueInicial.enqueue({ nombre: 'Juan Pérez', monto: 500000, fechaLlegada: new Date().toLocaleString() });
queueInicial.enqueue({ nombre: 'María López', monto: 200000, fechaLlegada: new Date().toLocaleString() });
queueInicial.enqueue({ nombre: 'Carlos Gómez', monto: 100000, fechaLlegada: new Date().toLocaleString() });

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
function App() {
  // Guardamos las personas como array para que React
  // pueda detectar los cambios y redibujar la pantalla
  const [personas, setPersonas] = useState<Persona[]>([...queueInicial.items]);

  // Instancia de la cola que persiste entre renders
  // No usamos set porque nunca reemplazamos la cola completa
  const [queue] = useState<Queue>(queueInicial);

  // Recibe una persona desde el formulario y la agrega al final de la fila
  // Luego crea una copia del array para notificar a React
  const agregarPersona = (persona: Persona) => {
    queue.enqueue(persona);
    setPersonas([...queue.items]); // copia nueva para que React redibuje
  };

  // Quita la persona que está al inicio de la fila (la atiende)
  // Luego crea una copia del array para notificar a React
  const atenderPersona = () => {
    queue.dequeue();
    setPersonas([...queue.items]); // copia nueva para que React redibuje
  };

  return (
    <div>
      <h1>Cola del Cajero Automático</h1>

      {/* Información general de la cola */}
      <p>Personas en la fila: {queue.size()}</p>
      <p>Siguiente en ser atendido: {queue.peek()?.nombre ?? 'No hay personas'}</p>

      {/* Formulario para agregar una nueva persona a la fila */}
      <PersonForm onAgregar={agregarPersona} />

      {/* Botón que atiende y saca la primera persona de la fila */}
      <button onClick={atenderPersona}>
        Atender siguiente persona (dequeue)
      </button>

      {/* Muestra todas las personas de la fila en pantalla */}
      <PersonQueue personas={personas} />
    </div>
  );
}

export default App;