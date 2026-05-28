# MediQueue — Proyecto Final (EDA2)

Aplicación web orientada a la gestión hospitalaria, atención médica y despacho de emergencias, desarrollada como proyecto final de Estructura de Datos y Algoritmos II.

## Integrantes
- Luis Felipe Murillo

## Enlaces de entrega
- Documento final y explicación técnica: [DOCUMENTACION.md](DOCUMENTACION.md)
- Despliegue: pendiente / no publicado en este repositorio
- Propuesta visual: pendiente / no incluida en este repositorio

## Resumen del proyecto
MediQueue es una SPA hecha con React + Vite que simula un entorno hospitalario con:
- portal del paciente,
- portal médico/administrador,
- chat de soporte,
- mapa de rutas y despacho de ambulancias,
- autenticación y persistencia con Firebase o modo demo local.

## Estructuras de datos implementadas desde cero
Las 5 estructuras principales están en `src/helpers/dataStructures/`:
- `Stack.js` — pila para historial de expedientes y navegación hacia atrás.
- `Queue.js` — cola FIFO para atención general de consultas.
- `Trie.js` — autocompletado de médicos y especialidades.
- `Heap.js` — min-heap para cola de urgencias por prioridad.
- `Graph.js` — grafo con Dijkstra para cálculo de rutas de ambulancia.

## Arquitectura relevante
- Punto de entrada: `src/main.jsx`
- Enrutado principal: `src/App.jsx`, `src/routes/AppRoutes.jsx`, `src/routes/UserRoutes.jsx`, `src/routes/AdminRoutes.jsx`
- Estado global: `src/context/AuthContext.jsx`, `src/context/HospitalContext.jsx`
- Integración con datos: `src/firebase.js`
- Componentes visuales: `src/components/`
- Páginas principales: `src/pages/`

## Cómo ejecutar el proyecto
1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en la raíz del proyecto.
   - El repositorio incluye el archivo `.env` real usado en local.
   - No existe un `.env.example` en este workspace; por eso la configuración debe hacerse en `.env`.

3. Variables requeridas:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

4. Ejecutar en desarrollo:
```bash
npm run dev
```

5. Compilar para producción:
```bash
npm run build
```

## Modo demo local
La aplicación intenta conectar con Firebase si las variables están configuradas. Si no hay configuración válida, entra en modo demo local usando `localStorage`.

Esto permite:
- autenticación simulada,
- datos semilla de médicos, colas, triage y chat,
- ejecución del proyecto sin depender de Firebase real.

## Credenciales de prueba
Para validar la aplicación sin Firebase real, puede usarse la cuenta demo de médico:
- Correo: `doctor@mediqueue.com`
- Contraseña: `password123`

Importante:
- Iniciar sesión desde el formulario de **Iniciar Sesión**.
- Si se mantiene una configuración de Firebase inválida, la cuenta demo no estará disponible en el backend real.
- Si el entorno presenta problemas, limpiar `localStorage` del navegador o la clave `mediqueue_users` y recargar la página.

## Validación técnica
El proyecto incluye pruebas manuales y verificación de compilación para las estructuras de datos en `src/helpers/dataStructures/testStructures.js`.

El build de producción se valida con `npm run build`, que genera la salida en `dist/`.

## Documentación adicional
La explicación detallada del alcance técnico, tecnologías utilizadas y justificación de cada estructura de datos está en [DOCUMENTACION.md](DOCUMENTACION.md).

## Estado real de entrega
- Proyecto funcional en entorno local.
- Modo demo local implementado.
- Firebase configurado mediante `.env`.
- Sitio desplegado no publicado en este repositorio.
