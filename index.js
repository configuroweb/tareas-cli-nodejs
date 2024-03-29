#!/usr/bin/env node

// Importaciones necesarias
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';

// Función para agregar tareas
async function agregarTarea(descripcion) {
    const tareas = JSON.parse(await readFile(new URL('tareas.json', import.meta.url), 'utf8'));
    const nuevaTarea = {
        id: tareas.length + 1, // Simplicidad, considera UUID para producción
        descripcion,
    };
    tareas.push(nuevaTarea);
    await writeFile(new URL('tareas.json', import.meta.url), JSON.stringify(tareas, null, 2), 'utf8');
    console.log(chalk.green('Tarea agregada con éxito'));
}

// Función para ver las tareas
async function verTareas() {
    try {
        const tareas = JSON.parse(await readFile(new URL('tareas.json', import.meta.url), 'utf8'));
        if (tareas.length === 0) {
            console.log(chalk.yellow('No hay tareas por mostrar.'));
            return;
        }
        console.log(chalk.blue('Tareas:'));
        tareas.forEach(tarea => {
            console.log(`${chalk.blue(tarea.id)}: ${chalk.green(tarea.descripcion)}`);
        });
    } catch (error) {
        console.error(chalk.red('Ocurrió un error al leer las tareas:', error));
    }
}

async function eliminarTarea(id) {
    const tareas = JSON.parse(await readFile(new URL('tareas.json', import.meta.url), 'utf8'));
    const tareasFiltradas = tareas.filter(tarea => tarea.id !== id);
    if(tareas.length === tareasFiltradas.length) {
        console.log(chalk.yellow('No se encontró la tarea.'));
        return;
    }
    await writeFile(new URL('tareas.json', import.meta.url), JSON.stringify(tareasFiltradas, null, 2), 'utf8');
    console.log(chalk.green('Tarea eliminada con éxito'));
}


async function editarTarea(id, nuevaDescripcion) {
    const tareas = JSON.parse(await readFile(new URL('tareas.json', import.meta.url), 'utf8'));
    const tareaIndex = tareas.findIndex(tarea => tarea.id === id);
    if(tareaIndex === -1) {
        console.log(chalk.yellow('No se encontró la tarea.'));
        return;
    }
    tareas[tareaIndex].descripcion = nuevaDescripcion;
    await writeFile(new URL('tareas.json', import.meta.url), JSON.stringify(tareas, null, 2), 'utf8');
    console.log(chalk.green('Tarea editada con éxito'));
}


// Configuración de Yargs
yargs(hideBin(process.argv))
  .command({
    command: 'agregar',
    describe: 'Agrega una nueva tarea',
    builder: {
      descripcion: {
        describe: 'Descripción de la tarea',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      agregarTarea(argv.descripcion);
    },
  })
  .command({
    command: 'ver',
    describe: 'Ver todas las tareas',
    handler() {
      verTareas();
    },
  })

  .command({
    command: 'eliminar',
    describe: 'Elimina una tarea',
    builder: {
        id: {
            describe: 'ID de la tarea a eliminar',
            demandOption: true,
            type: 'number',
        },
    },
    handler(argv) {
        eliminarTarea(argv.id);
    },
})
.command({
    command: 'editar',
    describe: 'Edita una tarea',
    builder: {
        id: {
            describe: 'ID de la tarea a editar',
            demandOption: true,
            type: 'number',
        },
        descripcion: {
            describe: 'Nueva descripción de la tarea',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        editarTarea(argv.id, argv.descripcion);
    },
})

  .parse(); // Asegúrate de parsear los argumentos con .parse()
