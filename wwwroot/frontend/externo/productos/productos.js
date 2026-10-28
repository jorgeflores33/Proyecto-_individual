// =========================================
// API
// =========================================

const API_PRODUCTOS =
"/api/productos";

const API_CATEGORIAS =
"/api/categorias";


// =========================================
// VARIABLES
// =========================================

let productos = [];

let categorias = [];

let categoriaURL = null;


// =========================================
// OBTENER CATEGORIA URL
// =========================================

function obtenerCategoria() {

    const params =
    new URLSearchParams(
        window.location.search
    );

    categoriaURL =
    params.get("categoria");
}


// =========================================
// CARGAR PRODUCTOS
// =========================================

const grid = document.getElementById("gridProductos");

async function cargarProductos() {

    try {

        const response = await fetch(
            "/api/productos"
        );

        const productos = await response.json();

        grid.innerHTML = "";

        productos.forEach(producto => {

            grid.innerHTML += `

                <div class="card-producto">

                    <img 
                        src="${producto.imagen_url}" 
                        alt="${producto.nombre}"
                    >

                    <h3>${producto.nombre}</h3>

                    <p>${producto.descripcion}</p>

                    <p><b>$${producto.precio}</b></p>

                    <button>
                        Agregar
                    </button>

                </div>

            `;
        });

    } catch (error) {

        console.log(
            "Error cargando productos",
            error
        );
    }
}

cargarProductos();

// =========================================
// CARGAR CATEGORIAS
// =========================================

async function cargarCategorias() {

    try {

        const response =
        await fetch(
            API_CATEGORIAS
        );

        categorias =
        await response.json();


        let html = `

            <option value="">

                Todas las categorías

            </option>
        `;


        categorias.forEach(c => {

            html += `

                <option value="${c.nombre}">

                    ${c.nombre}

                </option>
            `;
        });


        document.getElementById(
            "filtroCategoria"
        ).innerHTML = html;

    }

    catch(error) {

        console.error(error);
    }
}


// =========================================
// RENDER PRODUCTOS
// =========================================

function renderProductos(lista) {

    let html = "";


    // =====================================
    // SIN PRODUCTOS
    // =====================================

    if (!lista.length) {

        html = `

            <div class="sin-productos">

                No hay productos disponibles

            </div>
        `;
    }


    // =====================================
    // RECORRER
    // =====================================

    else {

        lista.forEach(p => {


            // =================================
            // IMAGEN
            // =================================

            const imagen =

                p.imagen_url
                &&
                p.imagen_url !== ""

                ?

                p.imagen_url

                :

                "https://via.placeholder.com/300x300?text=Producto";


            html += `

                <div class="card-producto">

                    <div class="imagen-producto">

                        <img
                            src="${imagen}"
                            alt="${p.nombre}"
                        >

                    </div>


                    <div class="contenido-producto">

                        <h3>

                            ${p.nombre || ""}

                        </h3>


                        <p>

                            <strong>

                                Código:

                            </strong>

                            ${p.codigo || ""}

                        </p>


                        <p>

                            <strong>

                                Categoría:

                            </strong>

                            ${p.categoria_nombre || "Sin categoría"}

                        </p>


                        <p class="precio">

                            $

                            ${Number(
                                p.precio || 0
                            ).toFixed(2)}

                        </p>


                        <button
                            class="btn-carrito"
                            onclick="agregarCarrito(${p.id_producto})"
                        >

                            🛒 Agregar al carrito

                        </button>

                    </div>

                </div>
            `;
        });
    }


    document.getElementById(
        "gridProductos"
    ).innerHTML = html;
}


// =========================================
// FILTROS
// =========================================

function aplicarFiltros() {

    let lista = [...productos];


    // =====================================
    // INPUTS
    // =====================================

    const texto =

        document.getElementById(
            "buscador"
        )?.value
        .toLowerCase()
        .trim()

        ||

        "";


    const categoriaSelect =

        document.getElementById(
            "filtroCategoria"
        )?.value

        ||

        "";


    const precio =

        document.getElementById(
            "filtroPrecio"
        )?.value

        ||

        "";


    // =====================================
    // FILTRO URL
    // =====================================

    if (categoriaURL) {

        lista = lista.filter(p =>

            (
                p.categoria_nombre
                ||
                ""
            )
            .toLowerCase()

            ===

            categoriaURL.toLowerCase()
        );
    }


    // =====================================
    // FILTRO SELECT
    // =====================================

    if (categoriaSelect) {

        lista = lista.filter(p =>

            (
                p.categoria_nombre
                ||
                ""
            )
            .toLowerCase()

            ===

            categoriaSelect.toLowerCase()
        );
    }


    // =====================================
    // BUSCADOR
    // =====================================

    if (texto) {

        lista = lista.filter(p =>

            (
                p.nombre
                ||
                ""
            )
            .toLowerCase()
            .includes(texto)

            ||

            (
                p.codigo
                ||
                ""
            )
            .toLowerCase()
            .includes(texto)
        );
    }


    // =====================================
    // FILTRO PRECIO
    // =====================================

    if (precio) {

        if (precio === "500+") {

            lista = lista.filter(p =>

                Number(p.precio) > 500
            );
        }

        else {

            const [
                min,
                max
            ] = precio
                .split("-")
                .map(Number);


            lista = lista.filter(p =>

                Number(p.precio) >= min

                &&

                Number(p.precio) <= max
            );
        }
    }


    renderProductos(lista);
}


// =========================================
// AGREGAR CARRITO
// =========================================

function agregarCarrito(
    id_producto
) {

    const producto =

        productos.find(p =>

            Number(p.id_producto)

            ===

            Number(id_producto)
        );


    if (!producto) {

        alert(
            "Producto no encontrado"
        );

        return;
    }


    let carrito =

        JSON.parse(
            localStorage.getItem(
                "carrito"
            )
        )

        ||

        [];


    // =====================================
    // VALIDAR EXISTENTE
    // =====================================

    const existente =

        carrito.find(p =>

            Number(p.id_producto)

            ===

            Number(id_producto)
        );


    if (existente) {

        existente.cantidad =
        (existente.cantidad || 1)
        + 1;
    }

    else {

        carrito.push({

            ...producto,

            cantidad: 1
        });
    }


    localStorage.setItem(

        "carrito",

        JSON.stringify(
            carrito
        )
    );


    alert(
        "Producto agregado al carrito"
    );
}


// =========================================
// EVENTOS
// =========================================

function iniciarEventos() {

    document.getElementById(
        "buscador"
    )?.addEventListener(

        "input",

        aplicarFiltros
    );


    document.getElementById(
        "filtroCategoria"
    )?.addEventListener(

        "change",

        aplicarFiltros
    );


    document.getElementById(
        "filtroPrecio"
    )?.addEventListener(

        "change",

        aplicarFiltros
    );
}


// =========================================
// INIT
// =========================================

window.onload = async function () {

    obtenerCategoria();

    iniciarEventos();

    await cargarCategorias();

    await cargarProductos();
};