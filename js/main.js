// Esperamos a que todo el HTML se cargue
console.log("Running V2.0.11");


document.addEventListener('DOMContentLoaded', () => {

    const perritoContainer = document.getElementById('perrito-container');
    const perritoImg = document.getElementById('perrito');
    let isAnimating = false;

    console.log("El perrito está listo, esperando conexión...");

    // --- CONEXIÓN AL SERVIDOR WEBSOCKET ---
    const socket = new WebSocket('ws://localhost:8080/');

    socket.onopen = (event) => {
      console.log('✅ WebSocket connection established.');
    
      try {
        // Convert the JavaScript subscription object to a JSON string
        const messageString = JSON.stringify(subscriptionRequest);
    
        // Send the subscription request to the server
        socket.send(messageString);
        console.log('-> Subscription request sent:', messageString);
      } catch (error) {
        console.error('❌ Failed to send subscription request:', error);
      }
    };

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
        'doRandom': () => doRandom(),
        'doWalk': hacerPaseo // Esta es más compleja, la dejamos separada
    };

    // Obtenemos una lista de todas las acciones posibles, excluyendo las que no queremos que sean aleatorias.
    const randomActions = Object.keys(actionHandlers).filter(accion =>
        !['doHello', 'doCelebrate'].includes(accion)
    );

    // --- MANEJADOR DE MENSAJES (Ahora muy simple) ---
// --- MANEJADOR DE MENSAJES (CORREGIDO Y MEJORADO) ---
socket.onmessage = function(event) {
    console.log("Datos brutos recibidos del servidor:", event.data);

    try {
        // 1. Parseamos el JSON que llega.
        const messageData = JSON.parse(event.data);

        // 2. Comprobamos si el mensaje tiene la estructura esperada de Streamer.bot.
        //    Buscamos la acción dentro del objeto 'data' anidado.
        if (messageData && messageData.data && messageData.data.action) {
            
            // Extraemos la acción y el payload de datos para más claridad.
            const accion = messageData.data.action;
            const payload = messageData.data; // Contiene la acción y cualquier otro dato como 'username'.

            console.log("Recibida acción válida:", accion);

            // Buscamos el manejador correspondiente a la acción.
            const handler = actionHandlers[accion];
            
            if (handler) {
                // Ejecutamos el manejador y le pasamos todo el payload.
                // Así, funciones como doHello(data) recibirán { action: 'doHello', username: '...' }
                handler(payload);
            } else {
                console.log(`Acción desconocida, no se encontró manejador para: ${accion}`);
            }
        }
        // Si el mensaje no tiene la estructura esperada, simplemente se ignora.

    } catch (error) {
        console.error("Error al procesar el mensaje. ¿Quizás no era un JSON válido?", error);
        console.log("El mensaje que causó el error fue:", event.data); // Muy útil para depurar
    }
};

    // Inicia el comportamiento aleatorio del perrito.
// Se ejecutará una acción cada 20 a 60 segundos (20000 a 60000 milisegundos).
iniciarComportamientoAleatorio(120000, 240000);

    const subscriptionRequest = {
      request: "Subscribe",
      id: "my-custom-event-subscription",
      events: {
        General: ["Custom"]
      }
    };


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
    console.log("Iniciando paseo en dos fases...");

    const anchoPerrito = perritoContainer.offsetWidth;
    const posicionActual = perritoContainer.offsetLeft;
    const mitadDePantalla = window.innerWidth / 2;
    
    let nuevaPosicion;
    let direccionScale;

    // Se decide la dirección del paseo (esta lógica no cambia)
    if (posicionActual < mitadDePantalla) {
        // Ir a la derecha
        nuevaPosicion = window.innerWidth - anchoPerrito - 50; 
        direccionScale = 'scaleX(1)';
    } else {
        // Ir a la izquierda
        nuevaPosicion = 50;
        direccionScale = 'scaleX(-1)';
    }
    
    // --- FASE 1: Preparación (Duración: 2200ms) ---
    // Se activa el GIF de caminar y se ajusta la dirección, pero el perrito aún no se mueve.
    console.log("Fase 1: Preparando para caminar.");
    perritoImg.style.transform = direccionScale;
    perritoImg.src = 'images/walk.gif';

    // --- FASE 2: Caminata (Duración: 5000ms) ---
    // Usamos setTimeout para esperar 2200ms antes de iniciar el movimiento.
    setTimeout(() => {
        console.log("Fase 2: ¡Comienza el movimiento!");
        // Este cambio en 'left' activa la transición de 5 segundos de tu CSS.
        perritoContainer.style.left = nuevaPosicion + 'px';
    }, 2300);

    // --- FINAL DE LA ACCIÓN ---
    // La duración total de la animación es 2200ms + 5000ms = 7200ms.
    // Después de ese tiempo total, el perrito vuelve a sentarse.
    setTimeout(() => {
        console.log("El paseo ha terminado.");
        perritoImg.src = 'images/sit.gif';
        perritoImg.style.transform = 'scaleX(1)'; // Reseteamos la dirección
        isAnimating = false;
    }, 7300); 
}

    // --- FUNCIÓN DE COMPORTAMIENTO ALEATORIO ---
function doRandom() {


        // 1. Selecciona una acción al azar de la lista.
        const randomAction = randomActions[Math.floor(Math.random() * accionesAleatorias.length)];
        console.log(`Comportamiento aleatorio: Ejecutando '${randomAction}'`);

        // 2. Llama a la función manejadora para esa acción.
        // Pasamos un objeto vacío por si la función espera algún dato (como 'doWalk').
        actionHandlers[accionAleatoria]({});
}

});










