/* Gestión de Interfaz de Usuario (UI) */

const NOMBRES_APLICADORES = [
    "Dr. Carlos Ruiz",
    "Dra. Maria López",
    "Tec. Juan Pérez",
    "Ing. Roberto Gómez"
];


function obtenerEdadEnMeses(fechaNacimientoStr) {
    const fechaNacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let meses = (hoy.getFullYear() - fechaNacimiento.getFullYear()) * 12;
    meses += hoy.getMonth() - fechaNacimiento.getMonth();
    return meses <= 0 ? 0 : meses;
}

function cambiarPestana(idPestana) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const pestana = document.getElementById(idPestana);
    if (pestana) pestana.classList.add('active');

    const botonActivo = document.getElementById(`nav-${idPestana}`);
    if (botonActivo) botonActivo.classList.add('active');

    if (idPestana === 'inventario') renderizarInventario();
    if (idPestana === 'trazabilidad') renderizarCadena();

    actualizarInsigniaIntegridad();
}

function actualizarInsigniaIntegridad() {
    const insignia = document.getElementById('integrity-badge');
    if (!insignia) return;

    const listaMaestra = obtenerRegistroMaestro();
    let todasValidas = true;

    listaMaestra.forEach(crotal => {
        const cadena = obtenerCadenaBovino(crotal);
        if (!cadena.esCadenaValida()) todasValidas = false;
    });

    insignia.className = `integrity-badge ${todasValidas ? 'valid' : 'invalid'}`;
    insignia.innerHTML = todasValidas ? '✅ Blockchains Íntegros' : '⚠️ Cadena Manipulada';
}

function renderizarInventario() {
    const contenedorLista = document.getElementById('inventory-list');
    if (!contenedorLista) return;
    contenedorLista.innerHTML = '';

    if (registroBovinos.length === 0) {
        contenedorLista.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay bovinos registrados.</p>';
        return;
    }

    registroBovinos.forEach(bovino => {
        const edad = obtenerEdadEnMeses(bovino.fechaNacimiento);
        const tarjeta = document.createElement('div');
        tarjeta.className = 'cow-card';
        tarjeta.innerHTML = `
            <div class="cow-info">
                <strong>${bovino.crotal}</strong> 
                <span class="badge ${bovino.sexo}">${bovino.sexo.toUpperCase()}</span>
                <p>${bovino.raza} | ${bovino.peso} kg | ${edad} meses</p>
                <div class="vaccine-list">
                    ${bovino.vacunas.length > 0 ? bovino.vacunas.map(v => `<span class="vaccine-tag">${v.nombre}</span>`).join('') : 'Sin operaciones'}
                </div>
            </div>
            <div class="cow-actions">
                <button onclick="abrirModalVacunas('${bovino.crotal}')" class="btn-small">Agregar Bloque</button>
            </div>
        `;
        contenedorLista.appendChild(tarjeta);
    });
}

function renderizarCadena(filtroCrotal = '') {
    const visualizador = document.getElementById('blockchain-viz');
    if (!visualizador) return;
    visualizador.innerHTML = '';

    if (!filtroCrotal) {
        visualizador.innerHTML = `
            <div class="search-hero">
                <span class="search-icon">🔍</span>
                <p>Seleccione un bovino para validación técnica:</p>
                <div class="quick-cow-list" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem;">
                    ${registroBovinos.map(b => `<button onclick="document.getElementById('crotal-search').value='${b.crotal}'; renderizarCadena('${b.crotal}')" class="cow-selector-btn">${b.crotal}</button>`).join('')}
                </div>
            </div>
        `;
        return;
    }

    const bovino = registroBovinos.find(b => b.crotal.toLowerCase() === filtroCrotal.toLowerCase());
    if (!bovino) {
        visualizador.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No encontrado: "${filtroCrotal}"</p>`;
        return;
    }

    const cadenaBovino = obtenerCadenaBovino(bovino.crotal);
    const historial = cadenaBovino.cadena;
    const edad = obtenerEdadEnMeses(bovino.fechaNacimiento);

    // Cabecera de Trazabilidad
    const cabeceraEl = document.createElement('div');
    cabeceraEl.className = 'trazabilidad-pollo-header';

    const aplicadas = bovino.vacunas.map(v => v.nombre);
    const recomendadas = REGLAS_VACUNAS.filter(r => edad >= r.edadMin && edad <= r.edadMax && (r.sexo === 'ambos' || r.sexo === bovino.sexo));
    const faltantes = recomendadas.filter(r => !aplicadas.includes(r.nombre));

    cabeceraEl.innerHTML = `
        <div class="cow-id-card" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem;">
            <div class="info-principal" style="flex: 1;">
                <h2>🐄 Bovina: ${bovino.raza} (ID: ${bovino.crotal})</h2>
                <div class="cow-meta-data">
                    <p><strong>Edad actual:</strong> ${edad} meses</p>
                    <p><strong>Estado Vacunación:</strong> ${aplicadas.length}/${REGLAS_VACUNAS.length} completadas</p>
                    <p><strong>Recomendadas hoy:</strong> ${recomendadas.map(r => `<span class="${aplicadas.includes(r.nombre) ? 'valid' : 'pending'}">${r.nombre}</span>`).join(', ')}</p>
                    <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">Escanee el QR para ver el historial inmutable completo en cualquier dispositivo.</p>
                </div>
            </div>
            <div class="qr-container-inline" style="background: white; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div id="qr-trazabilidad-automatica"></div>
                <p style="text-align: center; font-size: 0.65rem; color: #666; margin-top: 0.5rem; font-weight: bold;">CÓDIGO DE ORIGEN</p>
            </div>
        </div>
        <h4>⛓️ Cadena de bloques:</h4>
    `;
    visualizador.appendChild(cabeceraEl);

    // Generar el QR automáticamente con el historial completo (Optimizado para capacidad)
    const datosHistorial = {
        id: bovino.crotal,
        raza: bovino.raza,
        h: cadenaBovino.cadena.filter(b => b.tipo !== 'GENESIS').map(b => ({
            t: b.tipo === 'REGISTRO' ? 'R' : 'V',
            d: b.datos.vacuna || '',
            f: b.marcaTiempo.split(',')[0], // Truncar para ahorrar espacio
            p: b.rol // Rol o Responsable
        })),
        ok: cadenaBovino.esCadenaValida() ? 1 : 0
    };

    setTimeout(() => {
        const contenedorQR = document.getElementById('qr-trazabilidad-automatica');
        if (contenedorQR) {
            contenedorQR.innerHTML = ''; // Limpiar previo
            new QRCode(contenedorQR, {
                text: JSON.stringify(datosHistorial),
                width: 140,
                height: 140,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L // Nivel L permite más datos
            });
        }
    }, 100);

    historial.forEach(bloque => {
        const bloqueEl = document.createElement('div');
        bloqueEl.className = `block-item ${bloque.tipo.toLowerCase()}`;
        bloqueEl.innerHTML = `
            <div class="block-header">
                <span>${bloque.tipo === 'GENESIS' ? 'Bloque #0 (Génesis)' : `Evento Bovino #${bloque.indice}`}</span>
                <span class="role-badge">ROL: ${bloque.rol}</span>
            </div>
            <div class="block-body">
                <p><strong>Fecha:</strong> ${bloque.marcaTiempo}</p>
                <p><strong>Datos:</strong> ${renderizarResumenDatosBloque(bloque)}</p>
            </div>
        `;
        visualizador.appendChild(bloqueEl);
    });

    // Footer con Integridad y JSON
    const esValida = cadenaBovino.esCadenaValida();
    const footerEl = document.createElement('div');
    footerEl.className = 'trazabilidad-footer';
    footerEl.innerHTML = `
        <div class="integrity-status">
            <span>Estado de la cadena:</span>
            <span class="${esValida ? 'text-valid' : 'text-invalid'}">${esValida ? '✅ Válida' : '⚠️ Manipulada'}</span>
        </div>
        <button class="btn-json" onclick="mostrarJSONCadenaCompleta('${bovino.crotal}')">Ver JSON ▼</button>
    `;
    visualizador.appendChild(footerEl);
}

function renderizarResumenDatosBloque(bloque) {
    if (bloque.tipo === 'GENESIS') return bloque.datos.info;
    if (bloque.tipo === 'REGISTRO') return `Registro inicial: ${bloque.datos.raza}, ${bloque.datos.peso}kg`;
    if (bloque.tipo === 'VACUNACION') return `Vacuna: ${bloque.datos.vacuna} por ${bloque.datos.aplicador}`;
    return '';
}

function mostrarJSONCadenaCompleta(crotal) {
    const cadena = obtenerCadenaBovino(crotal);
    const jsonStr = JSON.stringify(cadena.cadena, null, 2);

    const modal = document.getElementById('qr-modal');
    modal.querySelector('.modal-content').classList.add('large');
    modal.querySelector('h2').textContent = `JSON Técnico - ${crotal}`;
    document.getElementById('qr-code').innerHTML = `<pre class="json-viewer">${jsonStr}</pre>`;
    modal.style.display = 'flex';
}

// La función mostrarQR ha sido reemplazada por la generación inline en renderizarCadena

function cerrarModal() {
    document.getElementById('qr-modal').style.display = 'none';
}

function abrirModalVacunas(crotal) {
    const bovino = registroBovinos.find(b => b.crotal === crotal);
    const edad = obtenerEdadEnMeses(bovino.fechaNacimiento);
    const modal = document.getElementById('vaccine-modal');
    const select = document.getElementById('vaccine-select');
    const resumen = document.getElementById('cow-summary');

    resumen.textContent = `ID: ${bovino.crotal} | Edad: ${edad} Meses | Peso: ${bovino.peso} kg | Sexo: ${bovino.sexo}`;
    select.innerHTML = '<option value="">Seleccionar Vacuna...</option>';

    REGLAS_VACUNAS.forEach(regla => {
        const yaAplicada = bovino.vacunas.some(v => v.nombre === regla.nombre);
        const edadOk = edad >= regla.edadMin && edad <= regla.edadMax;
        const pesoOk = bovino.peso >= regla.pesoMin;
        const sexoOk = regla.sexo === "ambos" || regla.sexo === bovino.sexo;

        const opcion = document.createElement('option');
        opcion.value = regla.nombre;
        opcion.textContent = `${regla.nombre} (${regla.desc})`;

        if (yaAplicada) {
            opcion.disabled = true;
            opcion.textContent += " - [Ya aplicada]";
        } else if (!edadOk || !pesoOk || !sexoOk) {
            opcion.disabled = true;
            opcion.textContent += " - [No cumple requisitos]";
        }
        select.appendChild(opcion);
    });

    const applicatorSelect = document.getElementById('applicator-name');
    applicatorSelect.innerHTML = '<option value="">Seleccione Aplicador...</option>';
    NOMBRES_APLICADORES.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        applicatorSelect.appendChild(opt);
    });

    document.getElementById('target-crotal').value = crotal;
    modal.style.display = 'flex';
}

function cerrarModalVacunas() {
    document.getElementById('vaccine-modal').style.display = 'none';
}
