// ========================================
// RETO: Sistema de Inventario de Productos
// Curso: Estructura de Datos y Algoritmos
// Autor: MurilloDevF
// ========================================

let productos = [
  { id: 101, nombre: "Laptop", categoria: "Electrónica", precio: 1200, stock: 5 },
  { id: 102, nombre: "Mouse", categoria: "Accesorios", precio: 25, stock: 50 },
  { id: 103, nombre: "Teclado", categoria: "Accesorios", precio: 75, stock: 30 },
  { id: 104, nombre: "Monitor", categoria: "Electrónica", precio: 300, stock: 15 },
  { id: 105, nombre: "Webcam", categoria: "Electrónica", precio: 80, stock: 20 }
];

console.log("=== SISTEMA DE INVENTARIO ===\n");
console.log("Productos iniciales:", productos.length);
console.log(productos);
console.log("\n");

// ====== 1. push() - Agregar nuevo producto ======
console.log("--- 1. PUSH ---");
productos.push({ id: 106, nombre: "Audífonos", categoria: "Accesorios", precio: 50, stock: 40 });
console.log(" Producto agregado. Total productos:", productos.length);
console.log("Último producto:", productos[productos.length - 1]);
console.log("\n");

// ====== 2. map() - Obtener solo nombres ======
console.log("--- 2. MAP ---");
let nombres = productos.map(p => p.nombre);
console.log(" Nombres de productos:", nombres);
console.log("\n");

// ====== 3. filter() - Productos con precio > 100 ======
console.log("--- 3. FILTER ---");
let productosCaros = productos.filter(p => p.precio > 100);
console.log(" Productos con precio > $100:");
productosCaros.forEach(p => console.log(`  - ${p.nombre}: $${p.precio}`));
console.log("\n");

// ====== 4. reduce() - Valor total del inventario ======
// Recibe dos parametros el acumulador y el elemento actual
//array.reduce((acumulador, elemento) => {
  // operación
 // return nuevoAcumulador;
//}, valorInicial);
console.log("--- 4. REDUCE ---");
let valorTotal = productos.reduce((total, p) => total + (p.precio * p.stock), 0);
console.log(" Valor total del inventario: $" + valorTotal.toLocaleString());
console.log("\n");

// ====== 5. find() - Encontrar producto "Monitor" ======
console.log("--- 5. FIND ---");
let monitor = productos.find(p => p.nombre === "Monitor");
console.log(" Producto encontrado:", monitor);
console.log("\n");

// ====== 6. sort() - Ordenar por precio (menor a mayor) ======
console.log("--- 6. SORT ---");
let productosOrdenados = [...productos].sort((a, b) => a.precio - b.precio);
console.log(" Productos ordenados por precio:");
productosOrdenados.forEach(p => console.log(`  ${p.nombre}: $${p.precio}`));
console.log("\n");

// ====== 7. every() - ¿Todos tienen stock > 0? ======
// El método every() verifica si todos los elementos del array cumplen con una condición específica. En este caso, se utiliza para comprobar si todos los productos tienen un stock mayor a 0. Si todos los productos cumplen esta condición, devuelve true; de lo contrario, devuelve false.
console.log("--- 7. EVERY ---");
let todosConStock = productos.every(p => p.stock > 0);
console.log(" ¿Todos los productos tienen stock? ", todosConStock);
console.log("\n");

// ====== 8. some() - ¿Hay algún producto de categoría "Ropa"? ======
// El método some() verifica si al menos un elemento del array cumple con una condición específica. En este caso, se utiliza para comprobar si hay algún producto de la categoría "Ropa". Si existe al menos uno, devuelve true; de lo contrario, devuelve false.
console.log("--- 8. SOME ---");
let hayRopa = productos.some(p => p.categoria === "Ropa");
console.log(" ¿Hay productos de categoría 'Ropa'? ", hayRopa);
console.log("\n");

// ====== 9. forEach() - Imprimir cada producto ======
// El método forEach() ejecuta una función proporcionada una vez por cada elemento del array. En este caso, se utiliza para imprimir los detalles de cada producto en el inventario, mostrando su nombre, precio y stock.xxxx
console.log("--- 9. FOREACH ---");
console.log(" Lista detallada de productos:");
productos.forEach((p, index) => {
  console.log(`  ${index + 1}. Nombre: ${p.nombre} - Precio: $${p.precio} - Stock: ${p.stock} unidades`);
});
console.log("\n");

// ====== 10. slice() - Primeros 3 productos ======
console.log("--- 10. SLICE ---");
let primerosTres = productos.slice(0, 3);
console.log(" Primeros 3 productos:");
primerosTres.forEach(p => console.log(`  - ${p.nombre}`));
console.log("\n");

// ====== 11. includes() - Verificar categoría "Electrónica" ======
console.log("--- 11. INCLUDES ---");
let categorias = productos.map(p => p.categoria);
let hayElectronica = categorias.includes("Electrónica");
console.log(" ¿Existe la categoría 'Electrónica'? ", hayElectronica);
console.log("\n");

// ====== 12. join() - Nombres separados por " | " ======
console.log("--- 12. JOIN ---");
let listaNombres = nombres.join(" | ");
console.log(" Nombres unidos:", listaNombres);
console.log("\n");

// ====== 13. reverse() - Invertir orden ======
console.log("--- 13. REVERSE ---");
let nombresInvertidos = [...nombres].reverse();
console.log(" Nombres en orden inverso:", nombresInvertidos);
console.log("\n");

// ====== 14. findIndex() - Posición del producto con id 103 ======
console.log("--- 14. FINDINDEX ---");
let indiceTeclado = productos.findIndex(p => p.id === 103);
console.log(" El producto con ID 103 está en la posición:", indiceTeclado);
console.log("Producto:", productos[indiceTeclado].nombre);
console.log("\n");

// ====== 15. at() - Último producto ======
console.log("--- 15. AT ---");
let ultimoProducto = productos.at(-1);
console.log(" Último producto del inventario:", ultimoProducto.nombre);
console.log("Detalles:", ultimoProducto);
console.log("\n");

console.log("=== FIN DEL EJERCICIO ===");
//NOTAS:
// - Se utiliza el método toLocaleString() para formatear el valor total del inventario con comas como separadores de miles, lo que mejora la legibilidad.
// - Se emplea el operador de propagación (...) para crear copias de los arrays antes de aplicar métodos como sort() y reverse(), evitando así modificar el array original.