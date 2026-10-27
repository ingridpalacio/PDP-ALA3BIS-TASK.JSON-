"use strict";

const fs = require("fs");
const path = require("path");
const { preguntar } = require("./io.js");

const rutaTareas = path.join(__dirname, "tasks.json");
//revisar que este todo 
const listaDeTareas = [];
// Estados que acepta el archivo JSON.
const estadosJSON = [
    "PENDING",
    "IN-PROGRESS",
    "FINISHED",
    "CANCELED"
];

// Convierte los estados del JSON al formato que usa tu programa.
function convertirEstadoInterno(estado) {
    switch (estado) {
        case "PENDING":
            return "Pendiente";
        case "IN-PROGRESS":
            return "En curso";
        case "FINISHED":
            return "Terminada";
        case "CANCELED":
            return "Cancelada";
    }
}

// Comprueba que una fecha sea válida.
function fechaValida(fecha) {
    return typeof fecha === "string" &&
        fecha.trim() !== "" &&
        !Number.isNaN(Date.parse(fecha));
}

// Comprueba que una tarea cumpla con el formato solicitado.
function validarTareaJSON(tarea, indice) {
    const numero = indice + 1;

    if (tarea === null || typeof tarea !== "object" ||
        Array.isArray(tarea)) {
        throw new Error(`La tarea ${numero} no es un objeto válido.`);
    }

    if (typeof tarea.titulo !== "string" ||
        tarea.titulo.trim() === "") {
        throw new Error(`La tarea ${numero} tiene un título inválido.`);
    }

    if (tarea.descripcion !== null &&
        typeof tarea.descripcion !== "string") {
        throw new Error(`La descripción de la tarea ${numero} es inválida.`);
    }

    if (!estadosJSON.includes(tarea.estado)) {
        throw new Error(`El estado de la tarea ${numero} es inválido.`);
    }

    if (!fechaValida(tarea.creacion)) {
        throw new Error(`La fecha de creación de la tarea ${numero} es inválida.`);
    }

    if (tarea.ultimaEdicion !== null &&
        !fechaValida(tarea.ultimaEdicion)) {
        throw new Error(`La última edición de la tarea ${numero} es inválida.`);
    }

    if (tarea.vencimiento !== null &&
        !fechaValida(tarea.vencimiento)) {
        throw new Error(`El vencimiento de la tarea ${numero} es inválido.`);
    }

    if (![1, 2, 3].includes(tarea.dificultad)) {
        throw new Error(`La dificultad de la tarea ${numero} debe ser 1, 2 o 3.`);
    }
}

// Lee las tareas del archivo y las carga en memoria.
function cargarTareas() {
    try {
        const contenido = fs.readFileSync(rutaTareas, "utf8");
        const tareasJSON = JSON.parse(contenido);

        if (!Array.isArray(tareasJSON)) {
            throw new Error("El archivo debe contener un array de tareas.");
        }

        // Validamos todas las tareas antes de cargarlas.
        tareasJSON.forEach(validarTareaJSON);

        // Transformamos las tareas al formato de tu programa actual.
        listaDeTareas.length = 0;

        tareasJSON.forEach((tarea, indice) => {
            listaDeTareas.push({
                Id: indice + 1,
                Titulo: tarea.titulo,
                Descripcion: tarea.descripcion,
                Estado: convertirEstadoInterno(tarea.estado),
                Fecha: new Date(tarea.creacion),
                UltimaEdicion: tarea.ultimaEdicion === null
                    ? null : new Date(tarea.ultimaEdicion),
                Vencimiento: tarea.vencimiento === null
                    ? null : new Date(tarea.vencimiento),
                Dificultad: "⭐".repeat(tarea.dificultad)
            });
        });

        console.log(
            `Se cargaron correctamente ${listaDeTareas.length} tareas.`
        );

        return true;

    } catch (error) {
        console.error("Error al cargar tasks.json:", error.message);
        return false;
    }
}
// Convierte los estados internos al formato que exige el JSON.
function convertirEstadoJSON(estado) {
    switch (estado) {
        case "Pendiente":
            return "PENDING";
        case "En curso":
            return "IN-PROGRESS";
        case "Terminada":
            return "FINISHED";
        case "Cancelada":
            return "CANCELED";
        default:
            throw new Error(`Estado desconocido: ${estado}`);
    }
}

// Convierte la dificultad representada con estrellas a un número.
function convertirDificultadJSON(dificultad) {
    if ([1, 2, 3].includes(dificultad)) {
        return dificultad;
    }

    if (typeof dificultad === "string") {
        const cantidad = Array.from(dificultad)
            .filter(caracter => caracter === "⭐").length;

        if ([1, 2, 3].includes(cantidad)) {
            return cantidad;
        }
    }

    throw new Error("La dificultad debe ser 1, 2 o 3.");
}

// Convierte una fecha al formato del archivo JSON.
// Si no existe una fecha, devuelve null.
function formatearFechaJSON(fecha) {
    if (fecha === null || fecha === undefined) {
        return null;
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        throw new Error("Se intentó guardar una fecha inválida.");
    }

    const dosDigitos = numero => String(numero).padStart(2, "0");

    return `${fechaConvertida.getFullYear()}-${dosDigitos(fechaConvertida.getMonth() + 1)}-${dosDigitos(fechaConvertida.getDate())}T${dosDigitos(fechaConvertida.getHours())}:${dosDigitos(fechaConvertida.getMinutes())}:${dosDigitos(fechaConvertida.getSeconds())}`;
}

// Guarda las tareas actuales en el archivo tasks.json.
function guardarTareas() {
    try {
        // Convertimos las tareas al formato solicitado por la consigna.
        const tareasJSON = listaDeTareas.map(tarea => ({
            titulo: tarea.Titulo,
            descripcion: tarea.Descripcion === null ||
                tarea.Descripcion === undefined ||
                tarea.Descripcion.trim() === ""
                ? null
                : tarea.Descripcion,
            estado: convertirEstadoJSON(tarea.Estado),
            creacion: formatearFechaJSON(tarea.Fecha),
            ultimaEdicion: formatearFechaJSON(tarea.UltimaEdicion),
            vencimiento: formatearFechaJSON(tarea.Vencimiento),
            dificultad: convertirDificultadJSON(tarea.Dificultad)
        }));

        // Antes de escribir, verificamos que las tareas sean válidas.
        tareasJSON.forEach(validarTareaJSON);

        // Escribimos la lista en el archivo original.
        fs.writeFileSync(
            rutaTareas,
            JSON.stringify(tareasJSON, null, 4),
            "utf8"
        );

        console.log("Las tareas se guardaron correctamente.");
        return true;

    } catch (error) {
        console.error("Error al guardar las tareas:", error.message);
        return false;
    }
}
function crearTarea(titulo, descripcion, vencimiento, dificultad) {
    return {
        Id: listaDeTareas.length + 1,
        Titulo: titulo,
        Descripcion: descripcion,
        Estado: "Pendiente",
        Fecha: new Date(),
        UltimaEdicion: new Date(),
        Vencimiento: vencimiento,
        Dificultad: dificultad
    };
}

function convertirFecha(fechaIngresada) {
    if (fechaIngresada.trim() === "") {
        return null;
    }

    const partes = fechaIngresada.split("/");
    if (partes.length !== 3) {
        return undefined;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const anio = Number(partes[2]);
    const fecha = new Date(anio, mes, dia);

    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes || fecha.getDate() !== dia) {
        return undefined;
    }

    return fecha;
}

function mostrarFecha(fecha) {
    if (!fecha) {
        return "Sin datos";
    }

    return new Date(fecha).toLocaleDateString();
}

async function agregarTarea() {
    
    console.log(`Estas creando una nueva tarea.`);


    let titulo = await preguntar("1.Ingrese el titulo:");
    while (titulo.trim().length === 0 || titulo.length > 100) {
        console.log("ERROR. El titulo es obligatorio y debe tener hasta 100 caracteres.\n");
        titulo = await preguntar("1.Ingrese el titulo:");
    }

    let descripcion = await preguntar("2. Ingrese la descripcion:");
    while (descripcion.length > 500) {
        console.log("ERROR. La descripcion debe tener hasta 500 caracteres.\n");
        descripcion = await preguntar("2. Ingrese la descripcion:");
    }

    let dificultad = await seleccionarDificultad();

    let vencimiento = await preguntar("Fecha de vencimiento DD/MM/AAAA (Enter para omitir): ");
    vencimiento = convertirFecha(vencimiento);
    while (vencimiento === undefined) {
        vencimiento = await preguntar("Fecha invalida. Ingrese DD/MM/AAAA o presione Enter: ");
        vencimiento = convertirFecha(vencimiento);
    }

    listaDeTareas.push(
    crearTarea(titulo, descripcion, vencimiento, dificultad)
);

guardarTareas();

console.log("Tarea agregada a la lista.");
    
}

async function seleccionarDificultad(dificultadAnterior) {
    
    let respuesta = await preguntar("Dificultad [1] Fácil [2] Medio [3] Difícil (Enter para mantener):");
    if (respuesta.trim() === "") {
        return dificultadAnterior || "⭐";
    }

    let opcion = parseInt(respuesta, 10);

    while (Number.isNaN(opcion) || opcion < 1 || opcion > 3) {
        console.log("ERROR. Opcion incorrecta! Vuelva a intentarlo:");
        respuesta = await preguntar("Dificultad [1] Fácil [2] Medio [3] Difícil:");
        opcion = parseInt(respuesta, 10);
    }

    switch (opcion) {
        case 1: return "⭐";
        case 2: return "⭐⭐";
        case 3: return "⭐⭐⭐";
    }
}

async function seleccionarEstado()
{
    let opcion = parseInt(await preguntar("Estado ([1] Pendiente / [2] En curso / [3] Terminada / [4] Cancelada):"), 10);
    
        while(Number.isNaN(opcion) || opcion <1 || opcion>4)
        {
            console.log("ERROR. Opcion incorrecta! Vuelva a intentarlo: \n");
            opcion = parseInt(await preguntar("Estado ([1] Pendiente / [2] En curso / [3] Terminada / [4] Cancelada):"), 10);
        }

        switch(opcion)
        {
            case 1:
                return "Pendiente";
            case 2:
                return "En curso";
            case 3:
                return "Terminada";
            case 4:
                return "Cancelada";   
        }
}


async function mostrarTareas(filtro)
{
    let verTareas = listaDeTareas;
    if(listaDeTareas.length === 0)
    {
        console.log("ERROR. Debe agregar al menos una tarea. \n");
    }
    else
    {
        if(filtro !== 1)
        {
            verTareas = listaDeTareas.filter(tarea => tarea.Estado === filtro);
        }

        if (verTareas.length === 0) {
            console.log("No hay tareas que coincidan con ese filtro.\n");
            return;
        }

        console.log("Estas son tus tareas.");
        verTareas.forEach(tarea => 
        {
            console.log(`${tarea.Id} ${tarea.Titulo}\n`); 
        });

        await verTareaEspecifica(verTareas);
    }
}

async function verTareaEspecifica(tareasDisponibles = listaDeTareas)
{
    let idIngresado, opcion;

    console.log(`
            ¿Deseas ver los detalles de alguna?
            Introduce el numero para verla o 0 para volver.
            `);

                idIngresado = parseInt(await preguntar("Numero: "),10);
                    if(idIngresado === 0)
                    {
                        return;
                    }else
                    {

                            let tareaElegida = tareasDisponibles.find(tarea =>Number(tarea.Id) === idIngresado);

                            while(!tareaElegida)
                            {
                                console.log("ERROR. Ese numero no existe, vuelva a intentarlo: \n");
                                idIngresado = parseInt(await preguntar("Numero: "),10);
                                if(idIngresado === 0)
                                {
                                    return;
                                }
                                
                                tareaElegida = tareasDisponibles.find(tarea =>Number(tarea.Id) === idIngresado);
                            }

                            console.log('Esta es la tarea que elegiste.\n');

                            console.log("Titulo: ", tareaElegida.Titulo);
                            console.log("Descripcion: ", tareaElegida.Descripcion || "Sin datos");
                            console.log("Estado: ", tareaElegida.Estado);
                            console.log("Dificultad: ", tareaElegida.Dificultad);
                            console.log("Vencimiento: ", mostrarFecha(tareaElegida.Vencimiento));
                            console.log("Creacion: ", mostrarFecha(tareaElegida.Fecha));
                            console.log("Ultima edicion: ", mostrarFecha(tareaElegida.UltimaEdicion));

                            console.log("Si deseas editarla, presiona 1, o presiona 0 para volver.\n");

                            opcion = parseInt(await preguntar("Ingrese una opcion:"),10);
                                while(Number.isNaN(opcion) || opcion<0 || opcion>1)
                                {
                                    console.log("ERROR. Esa opcion no existe, vuelva a intentarlo: \n");
                                    opcion = parseInt(await preguntar("Ingrese una opcion:"),10);
                                }
                            if(opcion === 0)
                            {
                                return;
                            }
                            else
                            {
                                await modificarTarea(tareaElegida.Titulo, tareaElegida.Id);
                            }

                    }

                    

}


async function modificarTarea(tituloTarea, idTarea){

    let op=0;
    do
    {

        console.log('Estas editando la tarea ', tituloTarea);
        
            console.log(`
            ===================================
            ¿Que deseas modificar?
            [1] Titulo.
            [2] Descripcion.
            [3] Estado ([1] Pendiente / [2] En curso / [3] Terminada / [4] Cancelada).
            [4] Dificultad [1] Fácil [2] Medio [3] Difícil.
            [5] Vencimiento.
            [0] Salir.

            Nota: si deseas dejar en blanco un atributo, escribe un espacio y presiona Enter.
            ===================================`);

            op = parseInt(await preguntar("Ingrese una opcion:"), 10);

            while(Number.isNaN(op) || op<0 || op>5)
            {
                console.log("ERROR. Opcion incorrecta, vuelva a intentarlo: \n");
                op = parseInt(await preguntar("Ingrese la opción: "), 10);

            }

            let tareaEditada = listaDeTareas.find( tarea => Number(tarea.Id) === idTarea);

            switch(op)
            {

                case 1:
                    let nuevoTitulo = await preguntar("Ingrese el nuevo titulo (Enter para mantener): ");
                    if (nuevoTitulo.trim() !== "") {
                        while (nuevoTitulo.length > 100) {
                            console.log("ERROR. El titulo debe tener hasta 100 caracteres.");
                            nuevoTitulo = await preguntar("Ingrese el nuevo titulo: ");
                        }
                        tareaEditada.Titulo = nuevoTitulo;
                    }
                    tareaEditada.UltimaEdicion = new Date();
                    console.log('¡Datos guardados!.');
                break;
                case 2:
                    let nuevaDescripcion = await preguntar("Ingrese la nueva descripcion (Enter para mantener): ");
                    if (nuevaDescripcion === " ") {
                        tareaEditada.Descripcion = "";
                    } else if (nuevaDescripcion.trim() !== "") {
                        while (nuevaDescripcion.length > 500) {
                            console.log("ERROR. La descripcion debe tener hasta 500 caracteres.");
                            nuevaDescripcion = await preguntar("Ingrese la nueva descripcion: ");
                        }
                        tareaEditada.Descripcion = nuevaDescripcion;
                    }
                    tareaEditada.UltimaEdicion = new Date();
                    console.log('¡Datos guardados!.');
                break;
                case 3:
                    tareaEditada.Estado = await seleccionarEstado();
                    tareaEditada.UltimaEdicion = new Date();
                    console.log('¡Datos guardados!.');
                break;
                case 4:
                    tareaEditada.Dificultad = await seleccionarDificultad(tareaEditada.Dificultad);
                    tareaEditada.UltimaEdicion = new Date();
                    console.log('¡Datos guardados!.');
                break;
                case 5:
                    let nuevaFecha = await preguntar("Ingrese el vencimiento DD/MM/AAAA (Enter para mantener): ");
                    if (nuevaFecha === " ") {
                        tareaEditada.Vencimiento = null;
                    } else if (nuevaFecha.trim() !== "") {
                        let fechaConvertida = convertirFecha(nuevaFecha);
                        while (fechaConvertida === undefined) {
                            nuevaFecha = await preguntar("Fecha invalida. Ingrese DD/MM/AAAA: ");
                            fechaConvertida = convertirFecha(nuevaFecha);
                        }
                        tareaEditada.Vencimiento = fechaConvertida;
                    }
                    tareaEditada.UltimaEdicion = new Date();
                    console.log('¡Datos guardados!.');
                break;
            }
                        // Guardamos los cambios realizados en la tarea.
            if (op !== 0) {
                guardarTareas();
            }
    }while(op!=0);

}

async function buscarTarea() {

    let tituloBuscado;

    if(listaDeTareas.length === 0)
    {
        console.log("ERROR. Debe ingresar al menos una tarea. \n");
        return;
    }
    else
    {

        tituloBuscado = await preguntar("Introduce una palabra del titulo para buscarla: ");

        const tareasEncontradas = listaDeTareas.filter(tarea =>
            tarea.Titulo.toLowerCase().includes(tituloBuscado.toLowerCase())
        );

        if (tareasEncontradas.length === 0) {
            console.log("No hay tareas relacionadas con la busqueda.\n");
            return;
        }

        console.log("Estas son las tareas relacionadas:\n");
        tareasEncontradas.forEach(tarea => {
            console.log(`${tarea.Id} ${tarea.Titulo}\n`);
        });

        await verTareaEspecifica(tareasEncontradas);
    }

}

module.exports = {
    agregarTarea,
    mostrarTareas,
    buscarTarea,
    listaDeTareas,
    cargarTareas,
    guardarTareas
};