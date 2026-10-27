"use strict";

const { resolve } = require("path");
// Importar readline para entrada por consola
const readline = require("readline");

// Crear interfaz para leer y escribir en consola
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function preguntar(pregunta)
{
    return new Promise((resolve) => 
    {
        rl.question(pregunta, (respuesta) => 
        {
            resolve(respuesta);
        })
    });
}
const cerrar = () => rl.close();

module.exports = {preguntar, cerrar};