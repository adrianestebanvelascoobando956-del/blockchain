/**
 * Representa un bloque individual en la cadena.
 */
class Bloque {
    constructor(indice, tipo, datos, hashPrevio = '', rol = 'SISTEMA') {
        this.indice = indice;
        this.marcaTiempo = new Date().toLocaleString();
        this.tipo = tipo; // 'REGISTRO' o 'VACUNACION'
        this.datos = datos; // Objeto con la información
        this.rol = rol; // Rol que generó el bloque
        this.hashPrevio = hashPrevio;
        this.hash = this.crearHash();
    }

    /**
     * Calcula el hash SHA256 del bloque.
     */
    crearHash() {
        const contenido = this.indice + this.marcaTiempo + this.tipo + JSON.stringify(this.datos) + this.rol + this.hashPrevio;
        return CryptoJS.SHA256(contenido).toString();
    }
}

/**
 * Gestiona una cadena de bloques persistente para cada bovino.
 */
class CadenaBloques {
    constructor(genesis, claveAlmacenamiento = 'vacaChain') {
        this.claveAlmacenamiento = claveAlmacenamiento;
        const cadenaGuardada = localStorage.getItem(this.claveAlmacenamiento);

        if (cadenaGuardada) {
            this.cadena = JSON.parse(cadenaGuardada).map(b => {
                const bloque = new Bloque(b.indice, b.tipo, b.datos, b.hashPrevio, b.rol);
                bloque.marcaTiempo = b.marcaTiempo;
                bloque.hash = b.hash;
                return bloque;
            });
        } else {
            this.cadena = [this.crearBloqueGenesis(genesis)];
            this.guardar();
        }
    }

    crearBloqueGenesis(genesis) {
        return new Bloque(0, 'GENESIS', { info: genesis });
    }

    obtenerUltimoBloque() {
        return this.cadena[this.cadena.length - 1];
    }

    /**
     * Añade un nuevo bloque a la cadena tras validación.
     */
    agregarBloque(tipo, datos, rol) {
        const ultimoBloque = this.obtenerUltimoBloque();
        const nuevoBloque = new Bloque(
            ultimoBloque.indice + 1,
            tipo,
            datos,
            ultimoBloque.hash,
            rol
        );

        this.cadena.push(nuevoBloque);
        this.guardar();
        return nuevoBloque;
    }

    guardar() {
        localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(this.cadena));
    }

    /**
     * Verifica la integridad de la cadena completa.
     */
    esCadenaValida() {
        for (let i = 1; i < this.cadena.length; i++) {
            const bloqueActual = this.cadena[i];
            const bloqueAnterior = this.cadena[i - 1];

            // Validar hash actual regenerándolo
            const contenido =
                bloqueActual.indice +
                bloqueActual.marcaTiempo +
                bloqueActual.tipo +
                JSON.stringify(bloqueActual.datos) +
                bloqueActual.rol +
                bloqueActual.hashPrevio;

            const hashRecalculado = CryptoJS.SHA256(contenido).toString();

            if (bloqueActual.hash !== hashRecalculado) return false;
            if (bloqueActual.hashPrevio !== bloqueAnterior.hash) return false;
        }
        return true;
    }
}
