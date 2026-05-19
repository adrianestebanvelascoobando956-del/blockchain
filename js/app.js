/* Lógica Principal de la Aplicación */

// Configuración de Vacunas Inmutables
const REGLAS_VACUNAS = [
    { nombre: "Calostro (Natural)", edadMin: 0, edadMax: 0.1, pesoMin: 0, sexo: "ambos", desc: "Nacimiento (Día 1)" },
    { nombre: "Fiebre Aftosa", edadMin: 2, edadMax: 200, pesoMin: 60, sexo: "ambos", desc: "Mes 2 +" },
    { nombre: "Complejo Clostridial (Triple)", edadMin: 2, edadMax: 2, pesoMin: 60, sexo: "ambos", desc: "Mes 2" },
    { nombre: "Brucelosis Bovina", edadMin: 3, edadMax: 4, pesoMin: 80, sexo: "hembra", desc: "Mes 3-4 (Solo hembras)" },
    { nombre: "Refuerzo Clostridial", edadMin: 3, edadMax: 4, pesoMin: 80, sexo: "ambos", desc: "Mes 3-4" },
    { nombre: "Rabia Silvestre", edadMin: 6, edadMax: 200, pesoMin: 240, sexo: "ambos", desc: "Mes 6 +" },
    { nombre: "Carbón Bacteridiano (Antrax)", edadMin: 6, edadMax: 200, pesoMin: 240, sexo: "ambos", desc: "Mes 6 +" },
    { nombre: "Protocolo Reproductivo (IBR/DVB)", edadMin: 12, edadMax: 200, pesoMin: 300, sexo: "hembra", desc: "Mes 12 (Hembras reemplazo)" },
    { nombre: "Vacuna Reproductiva Pre-monta", edadMin: 23, edadMax: 200, pesoMin: 320, sexo: "hembra", desc: "30 días antes de monta" }
];

/**
 * Obtiene la lista maestra de crotales registrados.
 */
const obtenerRegistroMaestro = () => {
    const lista = JSON.parse(localStorage.getItem('cowMasterList') || '[]');
    const listaUnica = [...new Set(lista)];
    if (lista.length !== listaUnica.length) {
        localStorage.setItem('cowMasterList', JSON.stringify(listaUnica));
    }
    return listaUnica;
};

/**
 * Guarda un crotal en el registro maestro.
 */
const guardarEnRegistroMaestro = (crotal) => {
    const lista = obtenerRegistroMaestro();
    const crotalLimpio = crotal.trim().toUpperCase();
    if (!lista.includes(crotalLimpio)) {
        lista.push(crotalLimpio);
        localStorage.setItem('cowMasterList', JSON.stringify(lista));
    }
};

const registroBovinos = [];

/**
 * Helper para instanciar la cadena de bloques de un bovino específico.
 */
function obtenerCadenaBovino(crotal) {
    return new CadenaBloques(`Génesis Bovino: ${crotal}`, `vacaChain_${crotal}`);
}

/**
 * Sincroniza el estado en memoria con las cadenas de bloques almacenadas.
 */
function sincronizarRegistro() {
    registroBovinos.length = 0;
    const listaMaestra = obtenerRegistroMaestro();

    listaMaestra.forEach(crotal => {
        const cadenaBovino = obtenerCadenaBovino(crotal);
        let datosBovino = null;

        cadenaBovino.cadena.forEach(bloque => {
            if (bloque.tipo === 'REGISTRO' && bloque.datos.crotal === crotal) {
                datosBovino = { ...bloque.datos, vacunas: [], cadena: cadenaBovino };
            } else if (bloque.tipo === 'VACUNACION' && bloque.datos.crotal === crotal) {
                if (datosBovino) {
                    datosBovino.vacunas.push({
                        nombre: bloque.datos.vacuna,
                        fecha: bloque.datos.fecha,
                        aplicador: bloque.datos.aplicador
                    });
                }
            }
        });

        if (datosBovino) registroBovinos.push(datosBovino);
    });
}

function preGenerarCrotal() {
    const input = document.getElementById('Crotal');
    if (!input) return;

    let sufijo;
    let nuevoId;
    const listaMaestra = obtenerRegistroMaestro();

    do {
        sufijo = Math.floor(100 + Math.random() * 900);
        nuevoId = `VAC-${sufijo}`;
    } while (listaMaestra.includes(nuevoId));

    input.value = nuevoId;
}

function procesarRegistro(e) {
    e.preventDefault();
    const crotalInput = document.getElementById('Crotal').value.trim().toUpperCase();
    const listaMaestra = obtenerRegistroMaestro();

    if (listaMaestra.includes(crotalInput)) {
        alert(`Error: El ID ${crotalInput} ya existe.`);
        return;
    }

    const peso = parseFloat(document.getElementById('Peso').value);
    const raza = document.getElementById('Raza').value;
    const fechaNacimiento = document.getElementById('FechaNacimiento').value;
    const sexo = document.getElementById('Sexo').value;

    const datosBovino = { crotal: crotalInput, peso, raza, fechaNacimiento, sexo };

    const cadenaBovino = obtenerCadenaBovino(crotalInput);
    cadenaBovino.agregarBloque('REGISTRO', datosBovino, rolActual);

    guardarEnRegistroMaestro(crotalInput);
    sincronizarRegistro();

    document.getElementById('register-form').reset();
    preGenerarCrotal();

    alert(`Bovino registrado con éxito: ${crotalInput}.`);
    cambiarRol('2');
}

function procesarVacunacion() {
    const crotal = document.getElementById('target-crotal').value;
    const nombreVacuna = document.getElementById('vaccine-select').value;
    const aplicador = document.getElementById('applicator-name').value;

    if (!nombreVacuna || !aplicador) {
        alert('Complete todos los campos');
        return;
    }

    const datosVacuna = {
        crotal: crotal,
        vacuna: nombreVacuna,
        aplicador: aplicador,
        fecha: new Date().toLocaleString()
    };

    const cadenaBovino = obtenerCadenaBovino(crotal);
    cadenaBovino.agregarBloque('VACUNACION', datosVacuna, rolActual);

    sincronizarRegistro();
    cerrarModalVacunas();
    renderizarInventario();
    actualizarInsigniaIntegridad();
    alert('Vacunación inmutable registrada.');
}

function manejarBusqueda(e) {
    renderizarCadena(e.target.value);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    sincronizarRegistro();
    aplicarRestriccionesRol();
    actualizarInsigniaIntegridad();
    preGenerarCrotal();

    const formularioRegistro = document.getElementById('register-form');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', procesarRegistro);
    }
});
