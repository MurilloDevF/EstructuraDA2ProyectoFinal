# MediQueue — Entrega Final (EDA2)

Proyecto final para el curso Estructura de Datos y Algoritmos II.

## Integrantes
- Luis Felipe Murillo

## Enlaces obligatorios (rúbrica)
- Propuesta gráfica (Figma/Adobe): https://figma.com/placeholder-enlace-diseno
- Sitio desplegado (Netlify / Vercel / otra): (NO DISPONIBLE — añadir URL aquí)
- Documento final (este repositorio): [DOCUMENTACION.md](DOCUMENTACION.md)

## Resumen (lo requerido por la rúbrica)
- Plataforma web con rutas públicas y privadas, menús y páginas principales (chat y mapa incluidos).
- 5 estructuras de datos implementadas desde cero: Stack, Queue, Trie, Min-Heap, Graph.
- Autenticación y persistencia usando Firebase (o modo demo local si no hay variables).

## Estructuras de datos implementadas
- `src/helpers/dataStructures/Stack.js` — Pila (Stack)
- `src/helpers/dataStructures/Queue.js` — Cola (Queue)
- `src/helpers/dataStructures/Trie.js` — Trie (autocompletado)
- `src/helpers/dataStructures/Heap.js` — Min-Heap (cola de prioridad)
- `src/helpers/dataStructures/Graph.js` — Grafo (Dijkstra)

## Estructura mínima de carpetas (requerida por la rúbrica)
- `src/helpers`
- `src/context` o `src/Context`
- `src/pages`
- `src/components`
- `src/hooks`
- `src/routes`
- `src/firebase.js`

## Cómo ejecutar (mínimo necesario)
1. Instalar dependencias:
```bash
npm install
```
2. Crear archivo de variables de entorno a partir de `.env.example` y completar valores de Firebase si aplica.
3. Ejecutar en desarrollo:
```bash
npm run dev
```
4. Build para despliegue:
```bash
npm run build
```

## Credenciales de prueba para el profesor
Estas credenciales funcionan con el modo demo local (`localStorage`) si no hay variables de Firebase configuradas.
- Correo: `doctor@mediqueue.com`
- Contraseña: `password123`

Importante:
- Use el panel de **Iniciar Sesión**, no el de registro.
- Si el app está intentando conectarse a Firebase real con variables incorrectas, estas credenciales no existirán allí.
- Si tiene problemas, borre el `localStorage` del navegador o la clave `mediqueue_users` y recargue la página.

El profesor puede iniciar sesión con esta cuenta de médico y probar las funciones de chat, mapa y colas.

## Variables de entorno necesarias
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Se proporciona `.env.example` con estas claves.

### Cómo configurar Firebase
1. Abre https://console.firebase.google.com/ y crea un nuevo proyecto.
2. En el panel del proyecto, selecciona "Añadir app" y elige la opción Web.
3. Copia los valores del SDK de Firebase que te muestre la consola.
4. Crea un archivo `.env` en la raíz del proyecto con el mismo contenido de `.env.example`.
5. Pega cada valor en su variable correspondiente.
6. Guarda el archivo y reinicia el servidor con `npm run dev`.

Si no quieres configurar Firebase ahora, el proyecto puede funcionar en modo demo local con `localStorage` y las credenciales de prueba.

## Despliegue (resumen mínimo)
- Comando de compilación: `npm run build` (carpeta de salida: `dist`).
- En Netlify/Vercel fijar `comando de compilación` = `npm run build` y `directorio de publicación` = `dist`.

## Documentación y justificación técnica
- Ver [DOCUMENTACION.md](DOCUMENTACION.md) para el alcance del sistema, tecnologías utilizadas y explicación de las 5 estructuras de datos (requisito de la rúbrica).

## Notas adicionales exigidas por la rúbrica
- Aporte por integrante: documentar en ramas/PRs (no presente — añadir historial de ramas/PRs que muestren contribuciones).
- Backend desplegado: no aplica (se usa Firebase y modo demo local); si hay backend, añadir URL.

---
_Este README incluye exclusivamente los elementos requeridos por la rúbrica._
