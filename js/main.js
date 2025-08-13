// Esperamos a que todo el HTML se cargue
console.log("¡Hola desde main.js! El guion del perrito se ha cargado correctamente.");


document.addEventListener('DOMContentLoaded', () => {

    const perritoContainer = document.getElementById('perrito-container');
    const perritoImg = document.getElementById('perrito');
    let isAnimating = false;

    console.log("El perrito está listo, esperando conexión...");

    // --- CONEXIÓN AL SERVIDOR WEBSOCKET ---
    const socket = new WebSocket('ws://localhost:8080/');

    socket.onopen = () => console.log("Conexión con Streamer.bot establecida.");
    socket.onerror = (error) => console.error("Error de WebSocket: Asegúrate de que Streamer.bot esté corriendo y el servidor WebSocket activo.", error);
    
    // --- MAPA DE ACCIONES (El nuevo "if/else if") ---
    const actionHandlers = {
        'doJump': () => ejecutarAnimacion('jump', 8000),
        'doPet': () => ejecutarAnimacion('petting', 8000),
        'doBark': () => ejecutarAnimacion('bark', 7000),
        'doSleep': () => ejecutarAnimacion('sleep', 8000),
        'doEat': () => ejecutarAnimacion('eat', 8000),
        'doDance': () => ejecutarAnimacion('dance', 8000),
        'doSniff': () => ejecutarAnimacion('sniff', 8000),
        'doKiss': () => ejecutarAnimacion('kiss', 8000),
        'doHello': (data) => doHello(data.username),
        'doCelebrate': (data) => doCelebrate(data.username),
        'doWalk': hacerPaseo // Esta es más compleja, la dejamos separada
    };

    // --- MANEJADOR DE MENSAJES (Ahora muy simple) ---
socket.onmessage = function(event) {
    // No necesitamos los logs de diagnóstico ahora, los quitamos para limpiar.
    // --- INICIO DE DIAGNÓSTICO ---
    console.log("Datos brutos recibidos del servidor:", event.data);
    console.log("El tipo de datos recibidos es:", typeof event.data);
    // --- FIN DE DIAGNÓSTICO --

    try {
        const data = JSON.parse(event.data);

        // --- ESTA ES LA LÍNEA CLAVE DE LA SOLUCIÓN ---
        // Si el objeto 'data' tiene una propiedad 'action', procesamos el mensaje.
        // Si no la tiene (como el mensaje de saludo), lo ignoramos y no hacemos nada.
        if (data && data.action) {
            const accion = data.action;
            console.log("Recibida acción válida:", accion);

            const handler = actionHandlers[accion];
            if (handler) {
                handler(data);
            } else {
                console.log(`Acción conocida pero sin manejador: ${accion}`);
            }
        }
        // Si no hay data.action, simplemente no se hace nada. Fin del problema.

    } catch (error) {
        console.log("Error al procesar el mensaje:", error);
    }
};

    // Inicia el comportamiento aleatorio del perrito.
// Se ejecutará una acción cada 20 a 60 segundos (20000 a 60000 milisegundos).
iniciarComportamientoAleatorio(20000, 60000);

    // --- FUNCIÓN GENÉRICA PARA ANIMACIONES ---
    function ejecutarAnimacion(nombreGif, duracion) {
        if (isAnimating) return;
        isAnimating = true;
        console.log(`Iniciando animación: ${nombreGif}`);
        perritoImg.src = `images/${nombreGif}.gif`;

        setTimeout(() => {
            perritoImg.src = 'images/sit.gif';
            isAnimating = false;
        }, duracion);
    }
    
    // --- FUNCIONES ESPECIALES (Las que no encajan en el patrón simple) ---

    function showDialog(texto, duracion) {
        const dialogo = document.getElementById('dialogo');
        const dialogoTexto = document.getElementById('dialogo-texto');
        dialogoTexto.textContent = texto;
        dialogo.style.opacity = '1';
        setTimeout(() => { dialogo.style.opacity = '0'; }, duracion - 500); // Ocultar un poco antes de que termine la animación
    }

    function doHello(username) {
        if (isAnimating) return;
        const nombreFinal = username ? username : "amigo";
        showDialog(`¡Hola, ${nombreFinal}!`, 8000);
        ejecutarAnimacion('hello', 8000);
    }
    
    function doCelebrate(username) {
        if (isAnimating) return;
        const nombreFinal = username ? username : "alguien increíble";
        showDialog(`¡Gracias por tu apoyo, ${nombreFinal}!`, 8000);
        ejecutarAnimacion('celebrate', 8000);
    }

    function hacerPaseo() {
        if (isAnimating) return;
        isAnimating = true;

        const posicionActual = parseInt(perritoContainer.style.left || 0);
        const mitadDePantalla = window.innerWidth / 2;
        let nuevaPosicion;
        let direccionScale;

        if (posicionActual < mitadDePantalla) {
            // Ir a la derecha
            nuevaPosicion = window.innerWidth - 150;
            direccionScale = 'scaleX(1)';
        } else {
            // Ir a la izquierda
            nuevaPosicion = 50;
            direccionScale = 'scaleX(-1)';
        }
        
        perritoImg.style.transform = direccionScale;
        perritoImg.src = 'images/walk.gif';

        setTimeout(() => { perritoContainer.style.left = nuevaPosicion + 'px'; }, 1000);

        setTimeout(() => {
            perritoImg.src = 'images/sit.gif';
            perritoImg.style.transform = 'scaleX(1)';
            isAnimating = false;
        }, 7000);
    }

    // --- FUNCIÓN DE COMPORTAMIENTO ALEATORIO ---
function iniciarComportamientoAleatorio(intervaloMin, intervaloMax) {
    // Obtenemos una lista de todas las acciones posibles, excluyendo las que no queremos que sean aleatorias.
    const accionesAleatorias = Object.keys(actionHandlers).filter(accion =>
        !['doHello', 'doCelebrate'].includes(accion)
    );

    function ejecutarAccionAleatoria() {
        // 1. Selecciona una acción al azar de la lista.
        const accionAleatoria = accionesAleatorias[Math.floor(Math.random() * accionesAleatorias.length)];
        console.log(`Comportamiento aleatorio: Ejecutando '${accionAleatoria}'`);

        // 2. Llama a la función manejadora para esa acción.
        // Pasamos un objeto vacío por si la función espera algún dato (como 'doWalk').
        actionHandlers[accionAleatoria]({});

        // 3. Programa la siguiente ejecución en un tiempo aleatorio.
        const proximoIntervalo = Math.random() * (intervaloMax - intervaloMin) + intervaloMin;
        setTimeout(ejecutarAccionAleatoria, proximoIntervalo);
    }

    // Inicia el ciclo.
    ejecutarAccionAleatoria();
}

});





