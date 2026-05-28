# Documentación del Proyecto Final: MediQueue

Este documento describe el alcance del sistema, las tecnologías utilizadas y explica en detalle las 5 estructuras de datos implementadas desde cero, junto con su justificación en la arquitectura del software.

---

## 1. Alcance del Sistema (MediQueue)

**MediQueue** es una plataforma web inteligente de gestión hospitalaria, atención de consultas y despacho de emergencias médicas en tiempo real. El sistema cuenta con dos portales diferenciados por roles:

### Portal del Paciente (Privado)
- **Autenticación Real**: Registro e inicio de sesión integrados con Firebase.
- **Buscador de Especialistas**: Permite buscar doctores y especialidades médicas con predicción de palabras clave.
- **Reserva de Citas**: Reserva turnos descontando de forma segura la disponibilidad de cupos mediante transacciones de base de datos.
- **Consulta Médica General**: Permite unirse a la cola de espera cronológica para recibir atención remota.
- **Emergencia de Urgencia**: Permite solicitar una ambulancia en una zona específica, clasificando la gravedad del paciente para una asignación prioritaria.
- **Chat de Soporte**: Canal de comunicación directa y en tiempo real con operadores médicos.

### Portal Médico/Administrador (Privado)
- **Cola de Consulta**: Visualización interactiva y atención de pacientes en la cola general mediante una fila cronológica FIFO.
- **Manejo de Triage**: Visualización estructurada de solicitudes de emergencias, priorizando automáticamente a los pacientes críticos sobre los leves.
- **Despacho y Trazado de Rutas**: Despacho de ambulancias desde centros de salud calculando la ruta geográfica óptima (más corta) en un mapa interactivo.
- **Expedientes Clínicos**: Visualización de historias clínicas con sistema de historial de navegación que permite retroceder y consultar expedientes revisados previamente.

---

## 2. Tecnologías Utilizadas

- **Frontend**:
  - **React (Vite)**: Biblioteca declarativa para la construcción de interfaces de usuario robustas y reactivas.
  - **SASS (SCSS Modules)**: Estilización CSS modular para mantener un diseño limpio, desacoplado y profesional.
  - **React Router DOM**: Orquestación y protección de rutas en el lado del cliente (rutas públicas, protegidas de usuario y de administrador).
  - **Leaflet & React-Leaflet**: Biblioteca interactiva para renderizar mapas cartográficos dinámicos y trazar rutas.
  - **Lucide React**: Biblioteca de iconos de alta fidelidad.
- **Backend y Base de Datos**:
  - **Firebase Authentication**: Gestión de usuarios y credenciales de acceso seguro.
  - **Firebase Firestore**: Base de datos de documentos NoSQL en tiempo real para sincronización de chat, mapa y estados de colas.
  - **Transacciones de Firestore (o Emulador)**: Control de concurrencia y atomicidad para la reserva de turnos (evita la sobreventa de citas).
  - **Conector de Emulador Local**: Arquitectura híbrida que permite correr la app al 100% de forma autónoma (usando `localStorage` para persistencia y listeners emulados de tiempo real) si las llaves de producción no están configuradas, facilitando la calificación directa.

---

## 3. Estructuras de Datos Implementadas y Justificación

Para cumplir con los estándares académicos, se desarrollaron clases personalizadas para 5 estructuras de datos fundamentales en JavaScript, evitando el uso de atajos nativos (como `.push`/`.pop` sobre arreglos ordinarios en las lógicas del negocio).

### A. Lineales (2 estructuras)

#### 1. Pila (Stack) - [Ver código](src/helpers/dataStructures/Stack.js)
- **Lógica**: Último en Entrar, Primero en Salir (LIFO - Last In, First Out).
- **Caso de uso**: Historial de navegación y revisión de expedientes médicos.
- **Justificación**: Cuando un médico se encuentra atendiendo consultas en el dashboard, suele saltar de un expediente de paciente a otro. Implementar una pila permite que el sistema registre cada expediente consultado (operación `push`). Si el médico desea volver al expediente clínico anterior, realiza un `pop` de la pila actual para recuperar el estado previo sin recargar la página.

#### 2. Cola (Queue) - [Ver código](src/helpers/dataStructures/Queue.js)
- **Lógica**: Primero en Entrar, Primero en Salir (FIFO - First In, First Out).
- **Caso de uso**: Cola de espera para consultas generales de pacientes.
- **Justificación**: La ética hospitalaria y el flujo ordenado exigen que los pacientes que buscan atención médica general sean atendidos de forma estrictamente cronológica. El uso de la cola asegura que el primer paciente en reportar sus síntomas (`enqueue`) sea el primero en ser llamado por el médico de turno (`dequeue`), garantizando un servicio justo.

---

### B. Jerárquicas (2 estructuras)

#### 3. Trie (Árbol de Prefijos) - [Ver código](src/helpers/dataStructures/Trie.js)
- **Lógica**: Árbol de búsqueda de caminos de caracteres donde cada nodo representa una letra.
- **Caso de uso**: Motor de búsqueda predictivo y autocompletado de médicos y especialidades.
- **Justificación**: Escribir términos de salud extensos o nombres de doctores puede ser tedioso. El Trie nos permite indexar nombres ("Mendoza", "Restrepo") y especialidades ("Cardiología", "Pediatría"). Al ingresar caracteres en la barra de búsqueda, el Trie localiza el prefijo común en tiempo $O(L)$ (donde $L$ es la longitud de la consulta de búsqueda) y recupera instantáneamente todos los objetos correspondientes en el subárbol, ofreciendo autocompletado en milisegundos.

#### 4. Min-Heap (Montículo Mínimo / Cola de Prioridad) - [Ver código](src/helpers/dataStructures/Heap.js)
- **Lógica**: Árbol binario completo donde la raíz contiene el elemento con el valor de prioridad numérica más bajo.
- **Caso de uso**: Cola de Prioridad del Triage de Emergencias Médicas.
- **Justificación**: En urgencias, los pacientes no pueden ser atendidos por orden de llegada (FIFO). Un paciente con un infarto (Código Rojo - Prioridad 1) debe ser atendido antes que un paciente con dolor de garganta (Código Verde - Prioridad 4). El Min-Heap almacena las solicitudes de ambulancia y mantiene al paciente más crítico en el tope (`peek`). Esto permite un acceso de costo constante $O(1)$ a la emergencia más grave y reestructura el árbol en $O(\log n)$ tras despachar al paciente (`extractMin`).

---

### C. Redes (1 estructura)

#### 5. Grafo (Graph) - [Ver código](src/helpers/dataStructures/Graph.js)
- **Lógica**: Estructura de vértices (nodos) y aristas con pesos, resuelta mediante el **Algoritmo de Dijkstra**.
- **Caso de uso**: Planificación y optimización de rutas de ambulancias.
- **Justificación**: La ciudad está dividida en distritos, centrales de ambulancias, y zonas residenciales. Modelamos esta red urbana como un grafo no dirigido donde los vértices representan localizaciones con coordenadas de mapa reales y las aristas son las calles con peso de distancia/tiempo de viaje. Al despachar una ambulancia, aplicamos el algoritmo de Dijkstra (apoyado en nuestro `MinHeap` personalizado para mayor eficiencia) para obtener el camino de menor resistencia temporal, dibujando la línea de ruta roja exacta sobre el mapa interactivo de Leaflet.
