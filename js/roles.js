/* Gestión de Roles y Accesos */

let rolActual = localStorage.getItem('vacaRole') || '1';

/**
 * Cambia el rol actual y actualiza la interfaz.
 */
function cambiarRol(rol) {
    rolActual = rol;
    localStorage.setItem('vacaRole', rol);
    aplicarRestriccionesRol();
}

/**
 * Controla la visibilidad de las opciones del menú según el rol activo.
 */
function aplicarRestriccionesRol() {
    const navRegistro = document.getElementById('nav-registro');
    const navInventario = document.getElementById('nav-inventario');
    const navTrazabilidad = document.getElementById('nav-trazabilidad');
    const selectorRol = document.getElementById('role-select');

    if (selectorRol) selectorRol.value = rolActual;

    // Mostrar todo por defecto antes de filtrar
    [navRegistro, navInventario, navTrazabilidad].forEach(el => {
        if (el) el.style.display = 'block';
    });

    switch (rolActual) {
        case '1': // Originador
            cambiarPestana('registro');
            if (navInventario) navInventario.style.display = 'none';
            if (navTrazabilidad) navTrazabilidad.style.display = 'none';
            break;

        case '2': // Agregador
            cambiarPestana('inventario');
            if (navRegistro) navRegistro.style.display = 'none';
            if (navTrazabilidad) navTrazabilidad.style.display = 'none';
            break;

        case '3': // Validador
            cambiarPestana('trazabilidad');
            if (navRegistro) navRegistro.style.display = 'none';
            if (navInventario) navInventario.style.display = 'none';
            break;
    }
}
