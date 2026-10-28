// =========================================
// API
// =========================================
const API_CLIENTES =
"/api/clientes/";

const API_COTIZACIONES =
"/api/cotizaciones/";

const API_DETALLE =
"/api/detalle-cotizaciones/";

const API_PRODUCTOS =
"/api/productos/";

const API_PEDIDOS =
"/api/pedidos/";

const API_DETALLE_PEDIDOS =
"/api/detalle-pedidos/";


// =========================================
// LOGIN
// =========================================

const rol =
localStorage.getItem("rol");

if (!rol) {

    window.location.href =
    "/Home/Index";
}


// =========================================
// LOGOUT
// =========================================

function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}


// =========================================
// VARIABLES
// =========================================

let cotizaciones = [];

let productos = [];

let clientes = [];

let detalleCotizacion = [];


// =========================================
// CARGAR PRODUCTOS
// =========================================

async function cargarProductos() {

    try {

        const response =
        await fetch(
            API_PRODUCTOS
        );

        productos =
        await response.json();

    }

    catch(error) {

        console.error(error);
    }
}

// =========================================
// CARGAR CLIENTES
// =========================================

async function cargarClientes() {

    try {

        const response =
        await fetch(
            API_CLIENTES
        );

        clientes =
        await response.json();


        let options = `

            <option value="">

                MOSTRADOR

            </option>
        `;


        clientes.forEach(cliente => {

            options += `

                <option
                    value="${cliente.id_cliente}"
                >

                    ${cliente.nombre}

                </option>
            `;
        });


        document.getElementById(
            "cliente"
        ).innerHTML = options;
    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando clientes"
        );
    }
}

// =========================================
// CARGAR COTIZACIONES
// =========================================

async function cargarCotizaciones() {

    try {

        const response =
        await fetch(
            API_COTIZACIONES
        );

        cotizaciones =
        await response.json();

        renderTabla(
            cotizaciones
        );

    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando cotizaciones"
        );
    }
}


// =========================================
// RENDER TABLA
// =========================================

function renderTabla(data) {

    let html = "";


    if (!data.length) {

        html = `

            <tr>

                <td colspan="5">

                    Sin cotizaciones

                </td>

            </tr>
        `;
    }

    else {

        data.forEach(c => {

            html += `

                <tr>

                    <td>

                        ${c.folio || ""}

                    </td>

                    <td>

                        ${formatearFecha(c.fecha)}

                    </td>

                    <td>

                        ${
                            c.nombre_cliente
                            ||
                            "MOSTRADOR"
                        }

                    </td>

                    <td>

                        <button
                            onclick="pasarAPedido(${c.id_cotizacion})"
                        >

                            📦 PASAR A PEDIDO

                        </button>

                    </td>

                    <td>

                        <button
                            onclick="imprimirCotizacion(${c.id_cotizacion})"
                        >

                            🖨️ IMPRIMIR

                        </button>

                    </td>

                </tr>
            `;
        });
    }

    document.getElementById(
        "tablaCotizaciones"
    ).innerHTML = html;
}


// =========================================
// ABRIR MODAL
// =========================================

async function abrirModal() {

    modoEdicion = false;

    idEditando = null;

    detalleCotizacion = [];

    document.getElementById(
        "modal"
    ).style.display =
    "flex";


    document.getElementById(
        "folio"
    ).value =

        "COT-" + Date.now();


    document.getElementById(
        "fecha"
    ).value =

        new Date()
        .toISOString()
        .split("T")[0];


    document.getElementById(
        "cliente"
    ).value = "";


    renderDetalle();
}


// =========================================
// CERRAR MODAL
// =========================================

function cerrarModal() {

    document.getElementById(
        "modal"
    ).style.display =
    "none";
}


// =========================================
// AGREGAR PRODUCTO
// =========================================

function agregarProducto() {

    let options = "";

    productos.forEach(p => {

        options += `

            <option value="${p.id_producto}">

                ${p.codigo}
                -
                ${p.nombre}

            </option>
        `;
    });


    detalleCotizacion.push({

        id_producto: "",

        descripcion: "",

        cantidad: 1,

        precio: 0,

        subtotal: 0
    });


    renderDetalle();
}


// =========================================
// RENDER DETALLE
// =========================================

function renderDetalle() {

    let html = "";

    let total = 0;


    detalleCotizacion.forEach((d, index) => {

        total += Number(
            d.subtotal || 0
        );


        let options = "";

        productos.forEach(p => {

            options += `

                <option
                    value="${p.id_producto}"

                    ${
                        Number(p.id_producto)
                        ===
                        Number(d.id_producto)

                        ?

                        "selected"

                        :

                        ""
                    }
                >

                    ${p.codigo}
                    -
                    ${p.nombre}

                </option>
            `;
        });


        html += `

            <tr>

                <td>

                    <select
                        onchange="
                            seleccionarProducto(
                                ${index},
                                this.value
                            )
                        "
                    >

                        <option value="">

                            Seleccionar

                        </option>

                        ${options}

                    </select>

                </td>

                <td>

                    <input
                        type="number"
                        value="${d.cantidad}"
                        min="1"

                        onchange="
                            cambiarCantidad(
                                ${index},
                                this.value
                            )
                        "
                    >

                </td>

                <td>

                    <input
                        type="number"
                        value="${d.precio}"
                        step="0.01"

                        onchange="
                            cambiarPrecio(
                                ${index},
                                this.value
                            )
                        "
                    >

                </td>

                <td>

                    $${Number(
                        d.subtotal
                    ).toFixed(2)}

                </td>

            </tr>
        `;
    });


    document.getElementById(
        "detalle"
    ).innerHTML = html;


    document.getElementById(
        "total"
    ).innerText =
    total.toFixed(2);
}


// =========================================
// SELECCIONAR PRODUCTO
// =========================================

function seleccionarProducto(
    index,
    id_producto
) {

    const producto =
    productos.find(p =>

        Number(p.id_producto)
        ===
        Number(id_producto)
    );


    if (!producto) {

        return;
    }


    detalleCotizacion[index]
    .id_producto =

        producto.id_producto;


    detalleCotizacion[index]
    .descripcion =

        producto.nombre;


    detalleCotizacion[index]
    .precio =

        Number(
            producto.precio || 0
        );


    detalleCotizacion[index]
    .subtotal =

        Number(
            producto.precio || 0
        )
        *
        Number(
            detalleCotizacion[index]
            .cantidad
        );


    renderDetalle();
}


// =========================================
// CAMBIAR CANTIDAD
// =========================================

function cambiarCantidad(
    index,
    cantidad
) {

    detalleCotizacion[index]
    .cantidad =

        Number(cantidad);


    detalleCotizacion[index]
    .subtotal =

        Number(
            detalleCotizacion[index]
            .cantidad
        )
        *
        Number(
            detalleCotizacion[index]
            .precio
        );


    renderDetalle();
}


// =========================================
// CAMBIAR PRECIO
// =========================================

function cambiarPrecio(
    index,
    precio
) {

    detalleCotizacion[index]
    .precio =

        Number(precio);


    detalleCotizacion[index]
    .subtotal =

        Number(
            detalleCotizacion[index]
            .cantidad
        )
        *
        Number(precio);


    renderDetalle();
}


// =========================================
// CARGAR CLIENTES
// =========================================

async function cargarClientes() {

    try {

        const response =
        await fetch(
            API_CLIENTES
        );

        clientes =
        await response.json();


        let options = `

            <option value="">

                MOSTRADOR

            </option>
        `;


        clientes.forEach(cliente => {

            options += `

                <option
                    value="${cliente.id_cliente}"
                >

                    ${cliente.nombre}

                </option>
            `;
        });


        document.getElementById(
            "cliente"
        ).innerHTML = options;
    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando clientes"
        );
    }
}

// =========================================
// EDITAR
// =========================================

async function editarCotizacion(
    id_cotizacion
) {

    try {

        modoEdicion = true;

        idEditando =
        id_cotizacion;


        // =====================================
        // OBTENER COTIZACION
        // =====================================

        const responseCotizacion =
        await fetch(

            API_COTIZACIONES
            +
            id_cotizacion
        );

        const cotizacion =
        await responseCotizacion.json();


        // =====================================
        // OBTENER DETALLES
        // =====================================

        const responseDetalles =
        await fetch(
            API_DETALLE
        );

        const detalles =
        await responseDetalles.json();


        detalleCotizacion =
        detalles.filter(d =>

            Number(
                d.id_cotizacion
            )
            ===
            Number(id_cotizacion)
        );


        // =====================================
        // LLENAR FORM
        // =====================================

        document.getElementById(
            "modal"
        ).style.display =
        "flex";


        document.getElementById(
            "folio"
        ).value =

            cotizacion.folio || "";


        document.getElementById(
            "fecha"
        ).value =

            cotizacion.fecha
            ?
            cotizacion.fecha
            .split("T")[0]
            :
            "";


        document.getElementById(
            "cliente"
        ).value =

            cotizacion.id_cliente || "";


        renderDetalle();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando cotización"
        );
    }
}

// =========================================
// GUARDAR
// =========================================

async function guardar() {

    try {

        const id_cliente =

            document.getElementById(
                "cliente"
            ).value || null;


        const cotizacion = {

            id_cliente,

            folio:
            document.getElementById(
                "folio"
            ).value
        };


        // =====================================
        // CREAR O ACTUALIZAR
        // =====================================

        let response;


        if (modoEdicion) {

            response =
            await fetch(

                API_COTIZACIONES
                +
                idEditando,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        cotizacion
                    )
                }
            );
        }

        else {

            response =
            await fetch(

                API_COTIZACIONES,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        cotizacion
                    )
                }
            );
        }


        const result =
        await response.json();


        const id_cotizacion =

            modoEdicion

            ?

            idEditando

            :

            result.id_cotizacion
            ||
            result.insertId
            ||
            result.id;


        // =====================================
        // ELIMINAR DETALLES
        // =====================================

        if (modoEdicion) {

            const detallesResponse =
            await fetch(
                API_DETALLE
            );

            const detalles =
            await detallesResponse.json();


            const filtrados =
            detalles.filter(d =>

                Number(
                    d.id_cotizacion
                )
                ===
                Number(id_cotizacion)
            );


            for (const d of filtrados) {

                await fetch(

                    API_DETALLE
                    +
                    d.id_detalle,

                    {

                        method: "DELETE"
                    }
                );
            }
        }


        // =====================================
        // INSERTAR DETALLES
        // =====================================

        for (const p of detalleCotizacion) {

            await fetch(

                API_DETALLE,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify({

                        id_cotizacion,

                        id_producto:
                        p.id_producto,

                        cantidad:
                        p.cantidad,

                        precio:
                        p.precio
                    })
                }
            );
        }


        alert(

            modoEdicion

            ?

            "Cotización actualizada"

            :

            "Cotización creada"
        );


        cerrarModal();

        cargarCotizaciones();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error guardando cotización"
        );
    }
}

// =========================================
// PASAR A PEDIDO
// =========================================

async function pasarAPedido(
    id_cotizacion
) {

    try {

        // =====================================
        // OBTENER COTIZACION
        // =====================================

        const responseCot =
        await fetch(

            API_COTIZACIONES
            +
            id_cotizacion
        );

        const cotizacion =
        await responseCot.json();


        // =====================================
        // OBTENER DETALLE
        // =====================================

        const responseDetalle =
        await fetch(
            API_DETALLE
        );

        const detalles =
        await responseDetalle.json();


        const detalleFiltrado =
        detalles.filter(d =>

            Number(
                d.id_cotizacion
            )
            ===
            Number(id_cotizacion)
        );


        // =====================================
        // CREAR PEDIDO
        // =====================================

        const pedidoResponse =
        await fetch(

            API_PEDIDOS,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    id_cliente:
                    cotizacion.id_cliente,

                    folio:
                    "PED-" + cotizacion.folio,

                    direccion:
                    "PENDIENTE",

                    telefono:
                    "PENDIENTE"
                })
            }
        );


        const pedido =
        await pedidoResponse.json();


        const id_pedido =

            pedido.id_pedido
            ||
            pedido.insertId
            ||
            pedido.id;


        // =====================================
        // INSERTAR DETALLE PEDIDO
        // =====================================

        for (const d of detalleFiltrado) {

            await fetch(

                API_DETALLE_PEDIDOS,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify({

                        id_pedido,

                        id_producto:
                        d.id_producto,

                        cantidad:
                        d.cantidad,

                        precio_unitario:
                        d.precio
                    })
                }
            );
        }


        alert(
            "Pedido generado correctamente"
        );

    }

    catch(error) {

        console.error(error);

        alert(
            "Error pasando a pedido"
        );
    }
}


// =========================================
// IMPRIMIR COTIZACION
// =========================================

async function imprimirCotizacion(
    id_cotizacion
) {

    try {

        // =====================================
        // OBTENER COTIZACION
        // =====================================

        const responseCotizacion =
        await fetch(

            API_COTIZACIONES
            +
            id_cotizacion
        );

        const cotizacion =
        await responseCotizacion.json();


        // =====================================
        // OBTENER DETALLES
        // =====================================

        const responseDetalles =
        await fetch(
            API_DETALLE
        );

        const detalles =
        await responseDetalles.json();


        const detalleFiltrado =
        detalles.filter(d =>

            Number(
                d.id_cotizacion
            )
            ===
            Number(id_cotizacion)
        );


        // =====================================
        // CLIENTE
        // =====================================

        let clienteHTML = `
            MOSTRADOR
        `;


        if (
            cotizacion.nombre_cliente
        ) {

            clienteHTML = `

                ${cotizacion.nombre_cliente}
            `;
        }


        // =====================================
        // TABLA PRODUCTOS
        // =====================================

        let detalleHTML = "";

        let total = 0;


        detalleFiltrado.forEach(d => {

            const subtotal =

                Number(d.cantidad)
                *
                Number(d.precio);


            total += subtotal;


            detalleHTML += `

                <tr>

                    <td>

                        ${d.codigo || ""}

                    </td>

                    <td>

                        ${d.nombre_producto || ""}

                    </td>

                    <td>

                        ${d.cantidad}

                    </td>

                    <td>

                        $
                        ${Number(
                            d.precio
                        ).toFixed(2)}

                    </td>

                    <td>

                        $
                        ${subtotal.toFixed(2)}

                    </td>

                </tr>
            `;
        });


        // =====================================
        // VENTANA
        // =====================================

        const ventana =
        window.open(
            "",
            "_blank"
        );


        ventana.document.write(`

            <html>

            <head>

                <title>

                    Cotización

                </title>

                <style>

                    * {

                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;

                        font-family: Arial, sans-serif;
                    }

                    body {

                        background: #e5e7eb;

                        padding: 20px;
                    }

                    .hoja-carta {

                        width: 216mm;
                        min-height: 279mm;

                        background: white;

                        margin: auto;

                        padding: 20mm;

                        box-shadow:
                        0 0 10px rgba(0,0,0,.15);
                    }

                    .header {

                        display: flex;

                        justify-content: space-between;

                        border-bottom:
                        3px solid #111827;

                        padding-bottom: 15px;

                        margin-bottom: 20px;
                    }

                    .empresa-info h1 {

                        font-size: 30px;

                        color: #111827;

                        margin-bottom: 10px;
                    }

                    .empresa-info p {

                        margin-bottom: 5px;

                        font-size: 14px;
                    }

                    .cotizacion-info {

                        text-align: right;
                    }

                    .cotizacion-info h2 {

                        font-size: 30px;

                        color: #2563eb;

                        margin-bottom: 10px;
                    }

                    .cliente-box {

                        border:
                        1px solid #d1d5db;

                        border-radius: 10px;

                        padding: 15px;

                        margin-bottom: 20px;
                    }

                    .cliente-box h3 {

                        margin-bottom: 10px;
                    }

                    .tabla {

                        width: 100%;

                        border-collapse: collapse;
                    }

                    .tabla thead {

                        background: #111827;

                        color: white;
                    }

                    .tabla th,
                    .tabla td {

                        border:
                        1px solid #d1d5db;

                        padding: 10px;

                        text-align: center;

                        font-size: 14px;
                    }

                    .tabla tbody tr:nth-child(even) {

                        background: #f9fafb;
                    }

                    .total {

                        margin-top: 20px;

                        display: flex;

                        justify-content: flex-end;
                    }

                    .total-box {

                        background: #111827;

                        color: white;

                        padding: 15px 30px;

                        border-radius: 10px;
                    }

                    .firmas {

                        margin-top: 80px;

                        display: flex;

                        justify-content: space-between;
                    }

                    .firma {

                        width: 250px;

                        text-align: center;
                    }

                    .linea {

                        border-top:
                        2px solid #111827;

                        margin-bottom: 10px;
                    }

                    @media print {

                        body {

                            background: white;

                            padding: 0;
                        }

                        .hoja-carta {

                            box-shadow: none;

                            width: 100%;

                            margin: 0;
                        }
                    }

                </style>

            </head>

            <body>

                <div class="hoja-carta">

                    <!-- ========================= -->
                    <!-- HEADER -->
                    <!-- ========================= -->

                    <div class="header">

                        <div class="empresa-info">

                            <h1>

                                PAPELERÍA FLORES

                            </h1>

                            <p>

                                Tuxtla Gutiérrez, Chiapas

                            </p>

                            <p>

                                Tel:
                                961-000-0000

                            </p>

                            <p>

                                RFC:
                                XAXX010101000

                            </p>

                        </div>


                        <div class="cotizacion-info">

                            <h2>

                                COTIZACIÓN

                            </h2>

                            <p>

                                <strong>
                                    Folio:
                                </strong>

                                ${cotizacion.folio || ""}

                            </p>

                            <p>

                                <strong>
                                    Fecha:
                                </strong>

                                ${
                                    formatearFecha(
                                        cotizacion.fecha
                                    )
                                }

                            </p>

                        </div>

                    </div>


                    <!-- ========================= -->
                    <!-- CLIENTE -->
                    <!-- ========================= -->

                    <div class="cliente-box">

                        <h3>

                            DATOS DEL CLIENTE

                        </h3>

                        <p>

                            <strong>

                                Cliente:

                            </strong>

                            ${clienteHTML}

                        </p>

                    </div>


                    <!-- ========================= -->
                    <!-- TABLA -->
                    <!-- ========================= -->

                    <table class="tabla">

                        <thead>

                            <tr>

                                <th>

                                    Código

                                </th>

                                <th>

                                    Producto

                                </th>

                                <th>

                                    Cantidad

                                </th>

                                <th>

                                    Precio

                                </th>

                                <th>

                                    Subtotal

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${detalleHTML}

                        </tbody>

                    </table>


                    <!-- ========================= -->
                    <!-- TOTAL -->
                    <!-- ========================= -->

                    <div class="total">

                        <div class="total-box">

                            <h2>

                                TOTAL:
                                $

                                ${total.toFixed(2)}

                            </h2>

                        </div>

                    </div>


                    <!-- ========================= -->
                    <!-- OBSERVACIONES -->
                    <!-- ========================= -->

                    <div
                        style="
                            margin-top: 30px;
                        "
                    >

                        <h3>

                            OBSERVACIONES

                        </h3>

                        <p>

                            Precios sujetos
                            a cambios sin
                            previo aviso.

                        </p>

                        <p>

                            Vigencia:
                            7 días.

                        </p>

                    </div>


                    <!-- ========================= -->
                    <!-- FIRMAS -->
                    <!-- ========================= -->

                    <div class="firmas">

                        <div class="firma">

                            <div class="linea"></div>

                            <p>

                                AUTORIZÓ

                            </p>

                        </div>


                        <div class="firma">

                            <div class="linea"></div>

                            <p>

                                CLIENTE

                            </p>

                        </div>

                    </div>

                </div>

            </body>

            </html>
        `);


        ventana.document.close();

        ventana.focus();

        ventana.print();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error imprimiendo cotización"
        );
    }
}

// =========================================
// FORMATEAR FECHA
// =========================================

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "";
    }

    const f =
    new Date(fecha);

    return (

        f.toLocaleDateString()

        +

        " "

        +

        f.toLocaleTimeString()
    );
}


// =========================================
// BUSCADOR
// =========================================

document.getElementById(
    "buscador"
).addEventListener(
    "keyup",
    function() {

        const texto =
        this.value.toLowerCase();


        const filtrados =
        cotizaciones.filter(c =>

            (c.folio || "")
            .toLowerCase()
            .includes(texto)
        );


        renderTabla(
            filtrados
        );
    }
);


// =========================================
// FILTRO FECHA
// =========================================

document.getElementById(
    "filtroFecha"
).addEventListener(
    "change",
    function() {

        const fecha =
        this.value;


        if (!fecha) {

            renderTabla(
                cotizaciones
            );

            return;
        }


        const filtrados =
        cotizaciones.filter(c =>

            c.fecha
            &&
            c.fecha
            .split("T")[0]
            ===
            fecha
        );


        renderTabla(
            filtrados
        );
    }
);


// =========================================
// INIT
// =========================================

window.onload = async function () {

    await cargarProductos();

    await cargarClientes();

    await cargarCotizaciones();
};