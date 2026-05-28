MediQueue — Documento Final de Proyecto
Curso: Estructura de Datos y Algoritmos II
Institución: UAO
Autor: Luis Felipe Murillo
Fecha: Mayo 2026

1. Alcance del sistema
MediQueue es una aplicación web de gestión hospitalaria que simula los flujos reales de atención médica en tres áreas principales: atención al paciente, administración médica y despacho de emergencias.
El sistema fue diseñado para demostrar el uso práctico de estructuras de datos dentro de un dominio real, donde cada estructura resuelve un problema concreto del negocio hospitalario.
1.1 Portal del paciente
El portal del paciente permite:

Registro e inicio de sesión con autenticación real.
Búsqueda de médicos por nombre o especialidad con autocompletado.
Reserva de citas con verificación de disponibilidad en tiempo real.
Ingreso a la cola general de consultas (orden de llegada).
Solicitud de ambulancia con registro de nivel de urgencia.
Acceso al chat de soporte.
Visualización del mapa de rutas hospitalarias.

1.2 Portal médico / administrador
El portal médico permite:

Visualización y gestión de la cola de urgencias ordenada por prioridad.
Visualización y gestión de la cola general de consultas por orden de llegada.
Navegación entre expedientes clínicos de pacientes con historial de consultas previas.
Despacho de ambulancias con cálculo de ruta óptima.
Acceso al chat institucional.
Visualización del mapa con rutas activas.

1.3 Módulos transversales

Chat en tiempo real: canal compartido entre pacientes y médicos con suscripción a Firebase Firestore.
Mapas interactivos: visualización de nodos urbanos (hospital, estaciones, zonas) con Leaflet y cálculo de ruta mínima.
Autenticación: login y registro real con Firebase Authentication, diferenciando roles de paciente y médico.
Modo demo local: si no hay configuración de Firebase, el sistema entra en modo demo con datos semilla y emulación de autenticación usando localStorage.


2. Tecnologías utilizadas
2.1 Frontend
TecnologíaVersiónRolReact18Librería de interfaz de usuarioVite6Bundler y servidor de desarrolloReact Router DOM7Enrutamiento de la SPASASS (módulos CSS)—Estilos por componenteLucide React—Iconografía
2.2 Backend y datos
TecnologíaRolFirebase AuthenticationLogin, registro y gestión de sesiónFirebase FirestoreBase de datos en tiempo realFirebase (BaaS)Reemplaza un servidor tradicional; toda la lógica de persistencia corre en los servidores de Google
2.3 Mapas y visualización
TecnologíaRolLeafletMotor de mapas interactivosReact LeafletIntegración de Leaflet con React
2.4 Infraestructura y despliegue
TecnologíaRolNetlifyDespliegue del frontendGitHubControl de versiones y entrega
2.5 Herramientas de desarrollo
HerramientaRolESLintAnálisis estático del códigoGitControl de versiones

3. Arquitectura del software
MediQueue es una SPA (Single Page Application) organizada en capas:
src/
├── helpers/dataStructures/   # Estructuras de datos implementadas desde cero
├── context/                  # Estado global (Auth y Hospital)
├── pages/                    # Vistas principales por rol
├── components/               # Componentes reutilizables
├── hooks/                    # Custom hooks (useAuth, useChat)
├── routes/                   # Definición de rutas (App, User, Admin)
├── firebase.js               # Capa de datos y servicios
├── App.jsx                   # Raíz de la aplicación
└── main.jsx                  # Punto de entrada
El flujo de la aplicación es:

main.jsx monta la app con StrictMode.
App.jsx envuelve todo en AuthProvider, HospitalProvider y BrowserRouter.
AppRoutes.jsx decide qué rutas mostrar según el rol del usuario autenticado.
HospitalContext.jsx inicializa todas las estructuras de datos al cargar la aplicación.
Cada página consume las estructuras y servicios a través del contexto.


4. Estructuras de datos implementadas
Todas las estructuras están implementadas manualmente en src/helpers/dataStructures/, sin librerías externas. Su uso no es decorativo: cada una resuelve un problema específico del dominio hospitalario.

4.1 Pila — Stack.js
¿Qué es?
Una pila es una estructura de datos lineal que sigue el principio LIFO (Last In, First Out): el último elemento en entrar es el primero en salir.
Operaciones implementadas:

push(item) — agrega un elemento al tope.
pop() — elimina y retorna el elemento del tope.
peek() — consulta el tope sin eliminarlo.
isEmpty() — verifica si la pila está vacía.
size() — retorna el número de elementos.
clear() — vacía la pila.
toArray() — retorna los elementos como arreglo.

¿Por qué se usó en este proyecto?
En el panel médico, el doctor navega entre expedientes clínicos de distintos pacientes. Esta navegación tiene un comportamiento natural de "volver atrás": el médico abre el expediente de un paciente, luego otro, y puede retroceder al anterior. Este comportamiento es exactamente el que modela una pila. Cada expediente consultado se apila, y al presionar "volver" se hace pop() para regresar al anterior.
Alternativas descartadas:
Un arreglo simple podría cumplir esta función, pero la pila encapsula la lógica de acceso LIFO con una interfaz clara, previniendo accesos arbitrarios al historial y garantizando la integridad de la navegación.

4.2 Cola — Queue.js
¿Qué es?
Una cola es una estructura de datos lineal que sigue el principio FIFO (First In, First Out): el primer elemento en entrar es el primero en salir.
Operaciones implementadas:

enqueue(item) — agrega un elemento al final.
dequeue() — elimina y retorna el elemento del frente.
peek() — consulta el frente sin eliminarlo.
isEmpty() — verifica si la cola está vacía.
size() — retorna el número de elementos.
clear() — vacía la cola.
toArray() — retorna los elementos como arreglo.

¿Por qué se usó en este proyecto?
La cola general de consultas médicas funciona bajo el principio de orden de llegada: el primer paciente en registrarse es el primero en ser atendido. Este es el caso de uso natural de una cola FIFO. Cuando un paciente ingresa a la cola general, se hace enqueue(). Cuando el médico llama al siguiente paciente, se hace dequeue().
Alternativas descartadas:
Un heap podría usarse, pero introduciría una prioridad artificial en un proceso que por definición es equitativo. La cola garantiza justicia en el orden de atención.

4.3 Trie — Trie.js
¿Qué es?
Un trie (o árbol de prefijos) es una estructura de datos de árbol donde cada nodo representa un carácter. Se usa para almacenar y buscar cadenas de texto de forma eficiente, especialmente con búsquedas por prefijo.
Operaciones implementadas:

insert(word) — inserta una palabra en el trie.
search(prefix) — retorna todas las palabras que comienzan con un prefijo dado.
clear() — reinicia el trie.

¿Por qué se usó en este proyecto?
El portal del paciente incluye un buscador de médicos por nombre o especialidad con autocompletado en tiempo real. Cuando el usuario escribe "card", el sistema debe retornar instantáneamente todos los médicos cuyo nombre o especialidad comience con esas letras (por ejemplo, "Cardiología"). El trie permite hacer esta búsqueda en O(m) donde m es la longitud del prefijo, independientemente de cuántos médicos haya registrados.
Alternativas descartadas:
Una búsqueda lineal sobre un arreglo haría la búsqueda en O(n) por cada carácter escrito, lo cual degrada la experiencia a medida que crece el número de médicos. El trie es la estructura canónica para autocompletado.

4.4 Min-Heap — Heap.js
¿Qué es?
Un heap es un árbol binario completo que cumple la propiedad de heap: en un min-heap, el nodo padre siempre tiene un valor menor o igual al de sus hijos. Esto garantiza que el elemento de menor valor (mayor prioridad) esté siempre en la raíz y pueda extraerse en O(log n).
Operaciones implementadas:

insert(item) — inserta un elemento y reorganiza el heap.
extractMin() — extrae el elemento de menor valor (mayor prioridad).
peek() — consulta el mínimo sin extraerlo.
heapifyUp() — reorganiza hacia arriba tras una inserción.
heapifyDown() — reorganiza hacia abajo tras una extracción.
size() — retorna el número de elementos.
clear() — vacía el heap.
toArray() — retorna los elementos como arreglo.

¿Por qué se usó en este proyecto?
La cola de urgencias hospitalarias no puede funcionar por orden de llegada: un paciente en estado crítico debe ser atendido antes que uno con una herida leve, sin importar cuándo llegó. El min-heap ordena automáticamente los pacientes por nivel de urgencia, garantizando que extractMin() siempre devuelva el caso más grave. Cada vez que llega una nueva emergencia, se hace insert() y el heap se reorganiza en O(log n).
Alternativas descartadas:
Ordenar un arreglo cada vez que llega una emergencia sería O(n log n). Una lista enlazada ordenada requeriría O(n) para cada inserción. El heap es la estructura más eficiente para colas de prioridad dinámica.

4.5 Grafo con Dijkstra — Graph.js
¿Qué es?
Un grafo es una estructura compuesta por vértices (nodos) y aristas (conexiones entre nodos). En este proyecto se usa un grafo ponderado no dirigido, donde el peso de cada arista representa la distancia o tiempo entre dos puntos. El algoritmo de Dijkstra encuentra el camino de menor costo entre un origen y un destino.
Operaciones implementadas:

addVertex(id, coordinates) — agrega un nodo al grafo con sus coordenadas geográficas.
addEdge(from, to, weight) — agrega una conexión entre dos nodos con un peso.
getShortestPath(start, end) — aplica Dijkstra y retorna el camino óptimo.
getCoordinates(id) — retorna las coordenadas de un nodo.

¿Por qué se usó en este proyecto?
Cuando se despacha una ambulancia, el sistema debe calcular la ruta más rápida desde el hospital hasta la zona de emergencia, pasando por la red de calles y estaciones disponibles. El grafo modela esta red urbana y Dijkstra garantiza encontrar la ruta óptima en O((V + E) log V). La ruta resultante se dibuja sobre el mapa interactivo con Leaflet.
Alternativas descartadas:
BFS encuentra el camino con menos saltos, no el de menor distancia. Una búsqueda exhaustiva sería inviable en grafos grandes. Dijkstra es el algoritmo estándar para rutas de menor costo en grafos ponderados sin pesos negativos.

5. Integración de estructuras con la lógica del negocio
Todas las estructuras se inicializan en HospitalContext.jsx al cargar la aplicación y se conectan con los datos reales de Firebase:
EstructuraContexto de usoMétodo claveTrieBúsqueda de médicos en el portal del pacientetrie.search(prefix)QueueCola general de consultasqueue.enqueue() / queue.dequeue()MinHeapCola de urgencias por prioridadheap.insert() / heap.extractMin()StackHistorial de expedientes en el panel médicostack.push() / stack.pop()GraphCálculo de ruta de ambulancia en el mapagraph.getShortestPath()
Las estructuras no son módulos aislados de demostración: son parte activa del flujo de la aplicación. Los datos que las alimentan provienen de Firestore en tiempo real.

6. Conclusiones
MediQueue demuestra que las estructuras de datos clásicas tienen aplicaciones directas y justificadas en sistemas reales. Cada estructura fue elegida por sus propiedades algorítmicas, no por conveniencia:

La pila modela la navegación con memoria hacia atrás.
La cola garantiza equidad en la atención por orden de llegada.
El trie hace posible el autocompletado eficiente con cualquier volumen de datos.
El min-heap resuelve la priorización dinámica de emergencias.
El grafo con Dijkstra calcula rutas óptimas sobre una red de transporte real.

La integración de estas estructuras con una arquitectura moderna (React, Firebase, Leaflet) demuestra que el conocimiento de algoritmos y estructuras de datos es una herramienta de diseño de software, no solo un ejercicio académico.

DESPLIEGUE:
https://stalwart-cobbler-95af2b.netlify.app/auth
