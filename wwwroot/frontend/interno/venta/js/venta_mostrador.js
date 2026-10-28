// =========================================
// VENTA MOSTRADOR
// =========================================


// =========================================
// APIs
// =========================================

const API_PRODUCTOS =
"/api/productos";

const API_PRODUCTOS_SUCURSAL =
"/api/productos-sucursal";

const API_VENTAS =
"/api/ventas";

const API_DETALLE =
"/api/detalle-ventas";

const API_CLIENTES =
"/api/clientes";

const API_FACTURAS =
"/api/facturas-clientes";

const API_APERTURA_CAJA =
"/api/apertura-caja";

const API_SUCURSALES =
"/api/sucursales";

const API_CORREO =
"/api/correo";

const API_FACTURA_PDF =
"/api/facturas-clientes/pdf";
// =========================================
// LOGIN
// =========================================

const usuario =
localStorage.getItem("usuario");

const rol =
localStorage.getItem("rol");

const idUsuario =
localStorage.getItem("id_usuario");


// =========================================
// VALIDAR SESIÓN
// =========================================

if (

    !usuario
    ||
    !rol
    ||
    !idUsuario

) {

    alert(
        "Sesión no iniciada"
    );

    window.location.href =
    "/Home/Index";
}


// =========================================
// VARIABLES
// =========================================

let productos = [];

let productosVenta = [];

let clientes = [];

let ventas = [];

let ventasDelCorte = [];

let clienteSeleccionado = null;

let cajaActual = null;

let panelVentasAbierto = false;

let ventaEditando = null;


// =========================================
// INIT
// =========================================

window.onload = async function () {

    await cargarCajaActiva();

    await cargarProductos();

    await cargarClientes();

    renderTablaVenta();

    calcularTotales();
};


// =========================================
// CARGAR CAJA
// =========================================

async function cargarCajaActiva() {

    try {

        const response =
        await fetch(
            API_APERTURA_CAJA
        );

        const data =
        await response.json();

        if (
            !Array.isArray(data)
            ||
            data.length === 0
        ) {

            alert(
                "No hay caja aperturada"
            );

            return;
        }

        const abiertas =
        data.filter(c =>
            c.estado === "ABIERTA"
        );

        if (
            abiertas.length === 0
        ) {

            alert(
                "No hay caja ABIERTA"
            );

            return;
        }

        cajaActual =
        abiertas[abiertas.length - 1];

        document.getElementById(
            "cajeroActual"
        ).value =

            cajaActual.nombre_trabajador
            ||
            cajaActual.usuario
            ||
            "CAJERO";

        document.getElementById(
            "sucursalActual"
        ).value =

            cajaActual.nombre_sucursal
            ||
            "MATRIZ";

        document.getElementById(
            "estadoCaja"
        ).value =
        cajaActual.estado;
    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando caja"
        );
    }
}


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

        alert(
            "Error cargando productos"
        );
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

    }

    catch(error) {

        console.error(error);
    }
}


// =========================================
// BUSCADOR CLIENTES
// =========================================

document.getElementById(
    "clienteVenta"
).addEventListener(
    "keyup",
    buscarCliente
);


// =========================================
// BUSCAR CLIENTE
// =========================================

function buscarCliente() {

    const texto =

        document.getElementById(
            "clienteVenta"
        )
        .value
        .toLowerCase();


    if (!texto) {

        document.getElementById(
            "resultadosClientes"
        ).innerHTML = "";

        clienteSeleccionado = null;

        return;
    }


    if (
        texto === "mostrador"
    ) {

        clienteSeleccionado = null;

        document.getElementById(
            "resultadosClientes"
        ).innerHTML = "";

        return;
    }


    const filtrados =
    clientes.filter(cliente =>

        (
            cliente.nombre
            ||
            ""
        )
        .toLowerCase()
        .includes(texto)

        ||

        (
            cliente.rfc
            ||
            ""
        )
        .toLowerCase()
        .includes(texto)

        ||

        (
            cliente.correo
            ||
            ""
        )
        .toLowerCase()
        .includes(texto)
    );


    renderResultadosClientes(
        filtrados
    );
}


// =========================================
// RENDER CLIENTES
// =========================================

function renderResultadosClientes(data) {

    let html = "";

    if (
        data.length === 0
    ) {

        html = `

            <div class="resultado-item">

                Cliente no encontrado

            </div>
        `;

        document.getElementById(
            "resultadosClientes"
        ).innerHTML = html;

        return;
    }


    data.forEach(cliente => {

        html += `

            <div
                class="resultado-item"
                onclick="seleccionarCliente(${cliente.id_cliente})"
            >

                <strong>

                    ${cliente.nombre}

                </strong>

                <br>

                RFC:
                ${cliente.rfc || "SIN RFC"}

                <br>

                ${cliente.correo || ""}

            </div>
        `;
    });


    document.getElementById(
        "resultadosClientes"
    ).innerHTML = html;
}


// =========================================
// SELECCIONAR CLIENTE
// =========================================

function seleccionarCliente(idCliente) {

    const cliente =
    clientes.find(c =>

        Number(c.id_cliente)
        ===
        Number(idCliente)
    );


    if (!cliente) {

        alert(
            "Cliente no encontrado"
        );

        return;
    }

    clienteSeleccionado =
    cliente;

    document.getElementById(
        "clienteVenta"
    ).value =
    cliente.nombre;

    document.getElementById(
        "resultadosClientes"
    ).innerHTML = "";

    document.getElementById(
        "facturaRFCVista"
    ).value =

        cliente.rfc
        ||
        "";

    document.getElementById(
        "facturaCorreoVista"
    ).value =

        cliente.correo
        ||
        "";
}


// =========================================
// BUSCAR PRODUCTOS
// =========================================

document.getElementById(
    "buscarProducto"
).addEventListener(
    "keyup",
    function () {

        const texto =
        this.value.toLowerCase();

        if (!texto) {

            document.getElementById(
                "resultadosBusqueda"
            ).innerHTML = "";

            return;
        }

        const filtrados =
        productos.filter(p =>

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

        renderResultadosProductos(
            filtrados
        );
    }
);


// =========================================
// RENDER PRODUCTOS
// =========================================

function renderResultadosProductos(data) {

    let html = "";

    data.forEach(producto => {

        const precio =

            parseFloat(
                producto.precio || 0
            ).toFixed(2);

        html += `

            <div
                class="resultado-item"
                onclick="agregarProducto(${producto.id_producto})"
            >

                <b>
                    ${producto.codigo}
                </b>

                -

                ${producto.nombre}

                -

                $ ${precio}

            </div>
        `;
    });

    document.getElementById(
        "resultadosBusqueda"
    ).innerHTML = html;
}


// =========================================
// AGREGAR PRODUCTO
// =========================================

async function agregarProducto(idProducto) {

    try {

        if (!cajaActual) {

            alert(
                "No hay caja activa"
            );

            return;
        }

        const validar =
        await fetch(

            `${API_PRODUCTOS_SUCURSAL}/validar/${usuario}/${idProducto}`
        );

        const stock =
        await validar.json();

        if (!stock.existe) {

            alert(
                "Producto sin existencia en sucursal"
            );

            return;
        }

        const producto =
        productos.find(p =>

            Number(p.id_producto)
            ===
            Number(idProducto)
        );

        if (!producto) {

            alert(
                "Producto no encontrado"
            );

            return;
        }

        const existe =
        productosVenta.find(p =>

            Number(p.id_producto)
            ===
            Number(idProducto)
        );

        if (existe) {

            if (
                existe.cantidad + 1 >
                stock.stock
            ) {

                alert(
                    "Stock insuficiente"
                );

                return;
            }

            existe.cantidad++;

            existe.subtotal =
            existe.cantidad *
            existe.precio;
        }

        else {

            productosVenta.push({

                id_producto:
                producto.id_producto,

                codigo:
                producto.codigo,

                nombre:
                producto.nombre,

                precio:
                parseFloat(
                    producto.precio || 0
                ),

                cantidad: 1,

                subtotal:
                parseFloat(
                    producto.precio || 0
                )
            });
        }

        renderTablaVenta();

        calcularTotales();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error agregando producto"
        );
    }
}


// =========================================
// TABLA VENTA
// =========================================

function renderTablaVenta() {

    let html = "";

    if (
        productosVenta.length === 0
    ) {

        html = `

            <tr>

                <td colspan="6">

                    Sin productos

                </td>

            </tr>
        `;
    }

    else {

        productosVenta.forEach((p, index) => {

            html += `

                <tr>

                    <td>
                        ${p.codigo}
                    </td>

                    <td>
                        ${p.nombre}
                    </td>

                    <td>

                        <input
                            type="number"
                            min="1"
                            value="${p.cantidad}"
                            onchange="cambiarCantidad(${index}, this.value)"
                        >

                    </td>

                    <td>

                        $ ${p.precio.toFixed(2)}

                    </td>

                    <td>

                        $ ${p.subtotal.toFixed(2)}

                    </td>

                    <td>

                        <button
                            onclick="eliminarProducto(${index})"
                        >
                            X
                        </button>

                    </td>

                </tr>
            `;
        });
    }

    document.getElementById(
        "tablaVenta"
    ).innerHTML = html;
}


// =========================================
// CAMBIAR CANTIDAD
// =========================================

function cambiarCantidad(index, cantidad) {

    cantidad =
    parseInt(cantidad);

    if (
        isNaN(cantidad)
        ||
        cantidad <= 0
    ) {

        return;
    }

    productosVenta[index].cantidad =
    cantidad;

    productosVenta[index].subtotal =

        productosVenta[index].precio
        *
        cantidad;

    renderTablaVenta();

    calcularTotales();
}


// =========================================
// ELIMINAR PRODUCTO
// =========================================

function eliminarProducto(index) {

    productosVenta.splice(
        index,
        1
    );

    renderTablaVenta();

    calcularTotales();
}


// =========================================
// CALCULAR TOTALES
// =========================================

function calcularTotales() {

    let total = 0;

    productosVenta.forEach(p => {

        total += p.subtotal;
    });

    const subtotal =
    total / 1.16;

    const iva =
    total - subtotal;

    document.getElementById(
        "subtotalVenta"
    ).innerText =

        "$ " +
        subtotal.toFixed(2);

    document.getElementById(
        "ivaVenta"
    ).innerText =

        "$ " +
        iva.toFixed(2);

    document.getElementById(
        "totalVenta"
    ).innerText =

        "$ " +
        total.toFixed(2);

    calcularCambio();
}


// =========================================
// CAMBIO
// =========================================

document.getElementById(
    "pagoCliente"
).addEventListener(
    "keyup",
    calcularCambio
);

function calcularCambio() {

    const pago =

        parseFloat(

            document.getElementById(
                "pagoCliente"
            ).value

            || 0
        );

    let total = 0;

    productosVenta.forEach(p => {

        total += p.subtotal;
    });

    const cambio =
    pago - total;

    document.getElementById(
        "cambioVenta"
    ).innerText =

        "$ " +
        cambio.toFixed(2);
}
// =========================================
// TOGGLE VENTAS CORTE
// =========================================

async function toggleVentasCorte() {

    const panel =
    document.getElementById(
        "panelVentasCorte"
    );

    if (panelVentasAbierto) {

        panel.classList.remove(
            "activo"
        );

        panelVentasAbierto = false;

        return;
    }

    panel.classList.add(
        "activo"
    );

    panelVentasAbierto = true;

    await cargarVentasCorte();
}
// =========================================
// CARGAR VENTAS CORTE
// =========================================

async function cargarVentasCorte() {

    try {

        const response =
        await fetch(
            API_VENTAS
        );

        ventasDelCorte =
        await response.json();


        // =====================================
        // FILTRAR SOLO CAJA ACTUAL
        // =====================================

        ventasDelCorte =
        ventasDelCorte.filter(v =>

            Number(v.id_usuario)
            ===
            Number(cajaActual.id_usuario)
        );


        let html = "";


        // =====================================
        // SIN VENTAS
        // =====================================

        if (
            ventasDelCorte.length === 0
        ) {

            html = `

                <tr>

                    <td colspan="4">

                        No hay ventas

                    </td>

                </tr>
            `;
        }

        else {

            ventasDelCorte.forEach(v => {

                html += `

                    <tr>

                        <td>

                            ${v.folio || ""}

                        </td>

                        <td>

                            ${
                                v.nombre_cliente
                                ||
                                "MOSTRADOR"
                            }

                        </td>

                        <td>

                            $ ${
                                Number(
                                    v.total || 0
                                ).toFixed(2)
                            }

                        </td>

                        <td>

                            <button
                                class="btn-editar-venta"
                                onclick="editarVenta(${v.id_venta})"
                            >
                                ✏️
                            </button>

                            <button
                                class="btn-eliminar-venta"
                                onclick="eliminarVenta(${v.id_venta})"
                            >
                                🗑️
                            </button>

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaVentasCorte"
        ).innerHTML = html;

    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando ventas"
        );
    }
}
// =========================================
// ELIMINAR VENTA
// =========================================

async function eliminarVenta(idVenta) {

    const confirmar =
    confirm(
        "¿Eliminar venta?"
    );

    if (!confirmar) {

        return;
    }

    try {

        await fetch(

            `${API_VENTAS}/${idVenta}`,

            {
                method: "DELETE"
            }
        );

        await cargarVentasCorte();

        alert(
            "Venta eliminada"
        );
    }

    catch(error) {

        console.error(error);

        alert(
            "Error eliminando venta"
        );
    }
}
// =========================================
// COBRAR
// =========================================

async function cobrarVenta() {

    try {

        if (
            productosVenta.length === 0
        ) {

            alert(
                "Agrega productos"
            );

            return;
        }

        if (!cajaActual) {

            alert(
                "No hay caja activa"
            );

            return;
        }

        const formaPago =
        document.getElementById(
            "formaPago"
        ).value;

        if (
            formaPago ===
            "Seleccionar"
        ) {

            alert(
                "Selecciona forma de pago"
            );

            return;
        }

        let total = 0;

        productosVenta.forEach(p => {

            total += p.subtotal;
        });

        const ventaData = {
            folio:

                ventaEditando
                ?
                window.folioVentaEditando
                :
                undefined,
            id_cliente:
            clienteSeleccionado
            ?
            clienteSeleccionado.id_cliente
            :
            null,

            id_usuario:
            cajaActual.id_usuario,

            id_sucursal:
            cajaActual.id_sucursal,

            tipo_venta:
            "MOSTRADOR",

            forma_pago:
            formaPago,

            total:
            total
        };

        let responseVenta;


        // =====================================
        // EDITAR VENTA
        // =====================================

        if (ventaEditando) {

            responseVenta =
            await fetch(

                `${API_VENTAS}/${ventaEditando}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        ventaData
                    )
                }
            );
        }


        // =====================================
        // NUEVA VENTA
        // =====================================

        else {

            responseVenta =
            await fetch(

                API_VENTAS,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        ventaData
                    )
                }
            );
        }

        const venta =
        await responseVenta.json();

        if (!venta.id_venta) {

            alert(
                venta.detail
                ||
                venta.mensaje
                ||
                "Error creando venta"
            );

            return;
        }

        // =====================================
        // ELIMINAR DETALLES ANTERIORES
        // =====================================

        if (ventaEditando) {

            await fetch(

                `${API_DETALLE}/venta/${ventaEditando}`,

                {

                    method: "DELETE"
                }
            );
        }


        // =====================================
        // INSERTAR NUEVOS DETALLES
        // =====================================

        for (const p of productosVenta) {

            const respuestaDetalle = await fetch(

                API_DETALLE,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify({

                        id_venta:
                        venta.id_venta,

                        id_producto:
                        p.id_producto,

                        cantidad:
                        p.cantidad,

                        precio_unitario:
                        p.precio
                    })
                }
            );
            if (!respuestaDetalle.ok) {
                const errorDetalle = await respuestaDetalle.json().catch(() => ({}));
                alert(errorDetalle.detalle || "No se guardó el detalle de la venta.");
                return;
            }
        }

        // Seguridad: cobrar solo cuando todos los detalles quedaron guardados
        // y SQL Server confirmó la venta/descontó inventario.
        const confirmarResponse = await fetch(`/api/ventas/${venta.id_venta}/confirmar`, {
            method: "POST"
        });
        if (!confirmarResponse.ok) {
            const errorVenta = await confirmarResponse.json().catch(() => ({}));
            alert(errorVenta.detalle || "No se pudo confirmar la venta; revisa existencias.");
            return;
        }

        imprimirTicket(
            venta,
            total
        );

        if (

            clienteSeleccionado
            &&

            clienteSeleccionado.nombre
            !== "MOSTRADOR"
        ) {

            abrirModalFacturacion(
                venta,
                total
            );
        }
        window.productosFactura = [...productosVenta];
        productosVenta = [];

        renderTablaVenta();

        calcularTotales();

        document.getElementById(
            "buscarProducto"
        ).value = "";

        document.getElementById(
            "resultadosBusqueda"
        ).innerHTML = "";

        alert(
            "Venta registrada"
        );
        ventaEditando = null;
    }

    catch(error) {

        console.error(error);

        alert(
            "Error al cobrar"
        );
    }
}


// =========================================
// IMPRIMIR TICKET
// =========================================

function imprimirTicket(venta, total) {

    const ventana =
    window.open(
        "",
        "_blank",
        "width=350,height=900"
    );

    // =====================================
    // FECHA
    // =====================================

    const fecha = new Date();

    const fechaTexto =
        fecha.toLocaleDateString() +
        " " +
        fecha.toLocaleTimeString();

    // =====================================
    // CLIENTE
    // =====================================

    const clienteNombre =

        clienteSeleccionado
        ?
        clienteSeleccionado.nombre
        :
        "Público en General";

    // =====================================
    // CAJERO
    // =====================================

    const cajero =

        document.getElementById(
            "cajeroActual"
        ).value;

    // =====================================
    // PAGO
    // =====================================

    const pagado =
    parseFloat(

        document.getElementById(
            "pagoCliente"
        ).value
        || 0
    );

    const cambio =
    pagado - total;

    // =====================================
    // IVA
    // =====================================

    const subtotal =
    total / 1.16;

    const iva =
    total - subtotal;

    // =====================================
    // FOLIO
    // =====================================

    const folio =
    venta.folio || "SIN-FOLIO";

    // =====================================
    // PRODUCTOS
    // =====================================

    let productosHTML = "";

    productosVenta.forEach(p => {

        productosHTML += `

            <tr>

                <td class="cantidad">
                    ${p.cantidad}
                </td>

                <td class="descripcion">
                    ${p.nombre}
                </td>

                <td class="precio">
                    $${p.precio.toFixed(2)}
                </td>

                <td class="total">
                    $${p.subtotal.toFixed(2)}
                </td>

            </tr>
        `;
    });

    // =====================================
    // HTML
    // =====================================

    ventana.document.write(`

        <html>

        <head>

            <title>
                Ticket
            </title>

            <style>

                @page {

                    size: 46mm auto;

                    margin: 0;
                }

                body {

                    width: 46mm;

                    margin: 0;

                    padding: 2mm;

                    font-family: Arial, sans-serif;

                    color: #000;

                    font-size: 9px;
                }

                * {

                    box-sizing: border-box;
                }

                .center {

                    text-align: center;
                }

                .logo {

                    font-size: 22px;

                    font-weight: bold;

                    letter-spacing: 1px;

                    margin-top: 5px;
                }

                .linea {

                    border-top: 1px dashed #000;

                    margin: 6px 0;
                }

                .titulo {

                    font-size: 11px;

                    font-weight: bold;

                    text-align: center;

                    margin: 8px 0;
                }

                .info {

                    width: 100%;

                    margin-top: 5px;
                }

                .info td {

                    font-size: 9px;

                    padding: 1px 0;
                }

                table {

                    width: 100%;

                    border-collapse: collapse;
                }

                .productos th {

                    border-bottom: 1px dashed #000;

                    border-top: 1px dashed #000;

                    padding: 4px 0;

                    font-size: 8px;
                }

                .productos td {

                    padding: 3px 0;

                    vertical-align: top;

                    font-size: 8px;
                }

                .cantidad {

                    width: 10%;
                }

                .descripcion {

                    width: 46%;
                }

                .precio {

                    width: 20%;

                    text-align: right;
                }

                .total {

                    width: 24%;

                    text-align: right;
                }

                .totales {

                    margin-top: 5px;
                }

                .totales td {

                    padding: 2px 0;

                    font-size: 9px;
                }

                .grand-total {

                    font-size: 15px;

                    font-weight: bold;
                }

                .gracias {

                    text-align: center;

                    margin-top: 10px;

                    font-weight: bold;

                    font-size: 11px;
                }

                .leyenda {

                    text-align: center;

                    font-size: 8px;

                    margin-top: 5px;
                }

                .barcode {

                    text-align: center;

                    margin-top: 10px;

                    font-size: 26px;

                    letter-spacing: 1px;
                }

                .folio-barcode {

                    text-align: center;

                    font-size: 10px;

                    margin-top: 3px;
                }

                .footer {

                    text-align: center;

                    margin-top: 8px;

                    font-size: 8px;
                }

            </style>

        </head>

        <body>

            <!-- LOGO -->
            <div class="center logo">

                LABORANTE

            </div>

            <div class="linea"></div>

            <!-- TÍTULO -->
            <div class="titulo">

                TICKET DE COMPRA

            </div>

            <div class="linea"></div>

            <!-- INFO -->
            <table class="info">

                <tr>
                    <td><b>Folio:</b></td>
                    <td>${folio}</td>
                </tr>

                <tr>
                    <td><b>Fecha:</b></td>
                    <td>${fechaTexto}</td>
                </tr>

                <tr>
                    <td><b>Cajero:</b></td>
                    <td>${cajero}</td>
                </tr>

                <tr>
                    <td><b>Cliente:</b></td>
                    <td>${clienteNombre}</td>
                </tr>

            </table>

            <!-- PRODUCTOS -->
            <table class="productos">

                <thead>

                    <tr>

                        <th>CANT</th>

                        <th>DESCRIPCIÓN</th>

                        <th>P.U</th>

                        <th>TOTAL</th>

                    </tr>

                </thead>

                <tbody>

                    ${productosHTML}

                </tbody>

            </table>

            <div class="linea"></div>

            <!-- TOTALES -->
            <table class="totales">

                <tr>
                    <td>SUBTOTAL:</td>
                    <td style="text-align:right;">
                        $${subtotal.toFixed(2)}
                    </td>
                </tr>

                <tr>
                    <td>IVA (16%):</td>
                    <td style="text-align:right;">
                        $${iva.toFixed(2)}
                    </td>
                </tr>

                <tr>

                    <td class="grand-total">
                        TOTAL:
                    </td>

                    <td
                        class="grand-total"
                        style="text-align:right;"
                    >
                        $${total.toFixed(2)}
                    </td>

                </tr>

            </table>

            <div class="linea"></div>

            <!-- PAGO -->
            <table class="totales">

                <tr>
                    <td>Método Pago:</td>
                    <td style="text-align:right;">
                        ${
                            document.getElementById(
                                "formaPago"
                            ).value
                        }
                    </td>
                </tr>

                <tr>
                    <td>Pagado:</td>
                    <td style="text-align:right;">
                        $${pagado.toFixed(2)}
                    </td>
                </tr>

                <tr>
                    <td>Cambio:</td>
                    <td style="text-align:right;">
                        $${cambio.toFixed(2)}
                    </td>
                </tr>

            </table>

            <div class="linea"></div>

            <!-- MENSAJE -->
            <div class="gracias">

                ¡GRACIAS POR SU COMPRA!

            </div>

            <div class="leyenda">

                No hay cambios ni devoluciones

                <br>

                Después de 7 días de su compra

            </div>

            <!-- CÓDIGO -->
            <div class="barcode">

                ||||||||||||||||||||||||

            </div>

            <div class="folio-barcode">

                ${folio}

            </div>

            <div class="linea"></div>

            <!-- FOOTER -->
            <div class="footer">

                Síguenos en nuestras redes

                <br><br>

                @laborante.oficial

            </div>

        </body>

        </html>
    `);

    ventana.document.close();

    ventana.focus();

    ventana.print();
}
// =========================================
// ABRIR MODAL FACTURA
// =========================================

function abrirModalFacturacion(
    venta,
    total
) {

    // =====================================
    // VALIDAR CLIENTE
    // =====================================

    if (!clienteSeleccionado) {

        alert(
            "La venta mostrador no requiere factura"
        );

        return;
    }

    document.getElementById(
        "modalFactura"
    ).style.display =
    "flex";


    // =====================================
    // DATOS CLIENTE
    // =====================================

    document.getElementById(
        "facturaCliente"
    ).value =

        clienteSeleccionado?.nombre
        ||
        "MOSTRADOR";


    document.getElementById(
        "facturaRFC"
    ).value =

        clienteSeleccionado?.rfc
        ||
        "XAXX010101000";


    document.getElementById(
        "facturaCorreo"
    ).value =

        clienteSeleccionado?.correo
        ||
        "";


    document.getElementById(
        "facturaRegimen"
    ).value =

        clienteSeleccionado?.regimen_fiscal
        ||
        "SIN REGIMEN";


    document.getElementById(
        "facturaDireccion"
    ).value =

        clienteSeleccionado?.direccion
        ||
        "SIN DIRECCIÓN";


    document.getElementById(
        "facturaTelefono"
    ).value =

        clienteSeleccionado?.telefono
        ||
        "SIN TELÉFONO";


    document.getElementById(
        "facturaFolioCliente"
    ).value =

        venta?.folio
        ||
        "";


    // =====================================
    // LIMPIAR CFDI
    // =====================================

    document.getElementById(
        "usoCFDI"
    ).value = "";


    // =====================================
    // VARIABLES GLOBALES
    // =====================================

    window.ventaFacturar =
    venta;

    window.totalFacturar =
    total;
}


// =========================================
// CERRAR MODAL FACTURA
// =========================================

function cerrarModalFactura() {

    document.getElementById(
        "modalFactura"
    ).style.display =
    "none";
}


// =========================================
// GENERAR FACTURA
// =========================================

async function generarFactura() {

    try {

        // =====================================
        // VALIDAR CFDI
        // =====================================

        const usoCFDI =
        document.getElementById(
            "usoCFDI"
        ).value;

        if (!usoCFDI) {

            alert(
                "Selecciona el uso CFDI"
            );

            return;
        }


        // =====================================
        // TOTALES
        // =====================================

        const total =
        Number(
            window.totalFacturar
        );

        const subtotal =
        total / 1.16;

        const iva =
        total - subtotal;


        // =====================================
        // DATA FACTURA
        // =====================================

        const facturaData = {

            id_cliente:
            clienteSeleccionado
            ?
            clienteSeleccionado.id_cliente
            :
            null,

            id_venta:
            window.ventaFacturar.id_venta,

            uso_cfdi:
            usoCFDI,

            subtotal:
            subtotal.toFixed(2),

            iva:
            iva.toFixed(2),

            total:
            total.toFixed(2)
        };


        console.log(
            "FACTURA:",
            facturaData
        );


        // =====================================
        // INSERT FACTURA
        // =====================================

        const response =
        await fetch(

            API_FACTURAS,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(
                    facturaData
                )
            }
        );


        const factura =
        await response.json();

        console.log(
            "FACTURA CREADA:",
            factura
        );

        // =====================================
        // DATA PDF
        // =====================================

        const pdfData = {

            folio:
            window.ventaFacturar?.folio || "",

            cliente:
            clienteSeleccionado?.nombre || "",

            rfc:
            clienteSeleccionado?.rfc || "",

            uso_cfdi:
            usoCFDI,

            regimen:
            clienteSeleccionado?.regimen_fiscal || "",

            direccion:
            clienteSeleccionado?.direccion || "",

            subtotal:
            subtotal,

            iva:
            iva,

            total:
            total,

            productos:
            window.productosFactura
        };


        // =====================================
        // GENERAR PDF
        // =====================================

        const pdfResponse =
        await fetch(

            API_FACTURA_PDF,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(
                    pdfData
                )
            }
        );


        const pdfResult =
        await pdfResponse.json();


        console.log(
            "PDF:",
            pdfResult
        );


        // =====================================
        // GUARDAR RUTA PDF
        // =====================================

        window.rutaFacturaPDF =
        pdfResult.ruta_pdf;


        // =====================================
        // IMPRIMIR FACTURA
        // =====================================

        imprimirFacturaCarta(

            factura,

            subtotal,

            iva,

            total,

            usoCFDI,

            productosFactura
        );


        // =====================================
        // GUARDAR RUTA PDF
        // =====================================

        window.rutaFacturaPDF =
        `facturas/factura_${window.ventaFacturar.id_venta}.pdf`;


        // =====================================
        // CERRAR MODAL
        // =====================================

        cerrarModalFactura();


        // =====================================
        // ABRIR MODAL CORREO
        // =====================================


    }

    catch(error) {

        console.error(error);

        alert(
            "Error generando factura"
        );
    }
}


// =========================================
// IMPRIMIR FACTURA CARTA
// =========================================

function imprimirFacturaCarta(

    factura,

    subtotal,

    iva,

    total,

    usoCFDI,

    productosFactura
) {

    const ventana =
    window.open(
        "",
        "_blank"
    );


    // =====================================
    // PRODUCTOS HTML
    // =====================================

    let productosHTML = "";


    window.productosFactura.forEach((p, index) => {

        productosHTML += `

            <tr>

                <td>

                    ${index + 1}

                </td>

                <td>

                    ${p.codigo}

                </td>

                <td>

                    ${p.nombre}

                </td>

                <td>

                    ${p.cantidad}

                </td>

                <td>

                    $ ${p.precio.toFixed(2)}

                </td>

                <td>

                    $ ${p.subtotal.toFixed(2)}

                </td>

            </tr>
        `;
    });


    // =====================================
    // FECHA
    // =====================================

    const fecha =
    new Date().toLocaleString();


    // =====================================
    // HTML
    // =====================================

    ventana.document.write(`

        <html>

        <head>

            <title>

                Factura

            </title>

            <style>

                @media print {

                    body {

                        margin: 0;
                    }

                    @page {

                        size: letter;

                        margin: 15mm;
                    }
                }

                body {

                    font-family: Arial;

                    margin: 40px;

                    color: #000;
                }

                .header {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    border-bottom: 3px solid #000;

                    padding-bottom: 10px;

                    margin-bottom: 20px;
                }

                .empresa {

                    font-size: 28px;

                    font-weight: bold;
                }

                .factura-box {

                    text-align: right;
                }

                .titulo {

                    font-size: 30px;

                    font-weight: bold;
                }

                .datos {

                    width: 100%;

                    margin-top: 20px;

                    border-collapse: collapse;
                }

                .datos td {

                    padding: 8px;

                    border: 1px solid #000;

                    font-size: 13px;
                }

                .tabla {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 25px;
                }

                .tabla th {

                    background: #111827;

                    color: white;

                    padding: 10px;

                    border: 1px solid #000;

                    font-size: 13px;
                }

                .tabla td {

                    padding: 8px;

                    border: 1px solid #000;

                    font-size: 12px;
                }

                .totales {

                    width: 320px;

                    margin-left: auto;

                    margin-top: 30px;

                    border-collapse: collapse;
                }

                .totales td {

                    border: 1px solid #000;

                    padding: 10px;

                    font-size: 14px;
                }

                .footer {

                    margin-top: 50px;

                    text-align: center;

                    font-size: 13px;
                }

            </style>

        </head>

        <body>

            <!-- ================================= -->
            <!-- HEADER -->
            <!-- ================================= -->

            <div class="header">

                <div>

                    <div class="empresa">

                        PAPELERÍA LABORANTE

                    </div>

                    <div>

                        RFC: XAXX010101000

                    </div>

                    <div>

                        TEL: 961-000-0000

                    </div>

                </div>

                <div class="factura-box">

                    <div class="titulo">

                        FACTURA

                    </div>

                    <div>

                        Folio:
                        ${window.ventaFacturar?.folio || ""}

                    </div>

                    <div>

                        Fecha:
                        ${fecha}

                    </div>

                </div>

            </div>


            <!-- ================================= -->
            <!-- CLIENTE -->
            <!-- ================================= -->

            <table class="datos">

                <tr>

                    <td>

                        <b>CLIENTE</b><br>
                        ${clienteSeleccionado?.nombre || ""}

                    </td>

                    <td>

                        <b>RFC</b><br>
                        ${clienteSeleccionado?.rfc || ""}

                    </td>

                </tr>

                <tr>

                    <td>

                        <b>RÉGIMEN FISCAL</b><br>
                        ${clienteSeleccionado?.regimen_fiscal || ""}

                    </td>

                    <td>

                        <b>USO CFDI</b><br>
                        ${usoCFDI}

                    </td>

                </tr>

                <tr>

                    <td colspan="2">

                        <b>DIRECCIÓN</b><br>
                        ${clienteSeleccionado?.direccion || ""}

                    </td>

                </tr>

            </table>


            <!-- ================================= -->
            <!-- PRODUCTOS -->
            <!-- ================================= -->

            <table class="tabla">

                <thead>

                    <tr>

                        <th>#</th>

                        <th>CÓDIGO</th>

                        <th>PRODUCTO</th>

                        <th>CANT</th>

                        <th>P.U</th>

                        <th>IMPORTE</th>

                    </tr>

                </thead>

                <tbody>

                    ${productosHTML}

                </tbody>

            </table>


            <!-- ================================= -->
            <!-- TOTALES -->
            <!-- ================================= -->

            <table class="totales">

                <tr>

                    <td>

                        SUBTOTAL

                    </td>

                    <td>

                        $ ${Number(subtotal).toFixed(2)}

                    </td>

                </tr>

                <tr>

                    <td>

                        IVA

                    </td>

                    <td>

                        $ ${Number(iva).toFixed(2)}

                    </td>

                </tr>

                <tr>

                    <td>

                        <b>TOTAL</b>

                    </td>

                    <td>

                        <b>

                            $ ${Number(total).toFixed(2)}

                        </b>

                    </td>

                </tr>

            </table>


            <!-- ================================= -->
            <!-- FOOTER -->
            <!-- ================================= -->

            <div class="footer">

                Gracias por su compra

            </div>

        </body>

        </html>
    `);


    ventana.document.close();

    ventana.focus();

    ventana.print();


    // =====================================
    // ABRIR MODAL CORREO
    // =====================================

    setTimeout(() => {

        abrirModalCorreo();

    }, 1000);

}

// =========================================
// ABRIR MODAL CORREO
// =========================================

function abrirModalCorreo() {

    document.getElementById(
        "modalCorreo"
    ).style.display =
    "flex";


    // =====================================
    // CORREO CLIENTE
    // =====================================

    document.getElementById(
        "correoEnviar"
    ).value =

        clienteSeleccionado?.correo
        ||
        "SIN CORREO";
}


// =========================================
// CERRAR MODAL CORREO
// =========================================

function cerrarModalCorreo() {

    document.getElementById(
        "modalCorreo"
    ).style.display =
    "none";
}


// =========================================
// ENVIAR FACTURA CORREO
// =========================================

async function enviarFacturaCorreo() {

    try {

        // =====================================
        // VALIDAR CORREO
        // =====================================

        if (
            !clienteSeleccionado?.correo
        ) {

            alert(
                "El cliente no tiene correo registrado"
            );

            return;
        }


        // =====================================
        // VALIDAR PDF
        // =====================================

        if (
            !window.rutaFacturaPDF
        ) {

            alert(
                "No existe PDF para enviar"
            );

            return;
        }


        // =====================================
        // DATA
        // =====================================

        const data = {

            correo:
            clienteSeleccionado.correo,

            ruta_pdf:
            window.rutaFacturaPDF
        };


        console.log(
            "ENVIANDO CORREO:",
            data
        );


        // =====================================
        // FETCH
        // =====================================

        const response =
        await fetch(

            `${API_CORREO}/enviar`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(data)
            }
        );


        const result =
        await response.json();


        console.log(
            result
        );


        // =====================================
        // OK
        // =====================================

        if (result.ok) {

            alert(
                "Factura enviada correctamente"
            );
        }

        else {

            alert(
                result.error
                ||
                "Error enviando factura"
            );
        }


        cerrarModalCorreo();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error enviando correo"
        );
    }
}
// =========================================
// EDITAR VENTA
// =========================================

async function editarVenta(idVenta) {

    try {

        // =====================================
        // OBTENER VENTA
        // =====================================

        const responseVenta =
        await fetch(

            `${API_VENTAS}/${idVenta}`
        );

        const venta =
        await responseVenta.json();


        // =====================================
        // OBTENER DETALLE
        // =====================================

        const responseDetalle =
        await fetch(

            `${API_DETALLE}/venta/${idVenta}`
        );

        const detalles =
        await responseDetalle.json();


        console.log(
            "DETALLES:",
            detalles
        );


        // =====================================
        // LIMPIAR VENTA ACTUAL
        // =====================================

        productosVenta = [];


        // =====================================
        // CARGAR PRODUCTOS
        // =====================================

        detalles.forEach(d => {

            productosVenta.push({

                id_producto:
                d.id_producto,

                codigo:
                d.codigo,

                nombre:
                d.nombre,

                precio:
                parseFloat(
                    d.precio_unitario
                ),

                cantidad:
                parseInt(
                    d.cantidad
                ),

                subtotal:
                parseFloat(
                    d.subtotal
                )
            });
        });


        // =====================================
        // CLIENTE
        // =====================================

        if (venta.id_cliente) {

            const cliente =
            clientes.find(c =>

                Number(c.id_cliente)
                ===
                Number(venta.id_cliente)
            );

            if (cliente) {

                clienteSeleccionado =
                cliente;

                document.getElementById(
                    "clienteVenta"
                ).value =

                    cliente.nombre;

            }
        }

        else {

            clienteSeleccionado = null;

            document.getElementById(
                "clienteVenta"
            ).value =
            "MOSTRADOR";
        }


        // =====================================
        // FORMA PAGO
        // =====================================

        document.getElementById(
            "formaPago"
        ).value =

            venta.forma_pago;


        // =====================================
        // ID VENTA EDITANDO
        // =====================================

        ventaEditando =
        venta.id_venta;
        window.folioVentaEditando = venta.folio;


        // =====================================
        // RENDER
        // =====================================

        renderTablaVenta();

        calcularTotales();


        // =====================================
        // SCROLL ARRIBA
        // =====================================

        window.scrollTo({

            top: 0,

            behavior: "smooth"
        });


        // =====================================
        // ALERT
        // =====================================

        alert(
            "Venta cargada para edición"
        );

    }

    catch(error) {

        console.error(error);

        alert(
            "Error editando venta"
        );
    }
}