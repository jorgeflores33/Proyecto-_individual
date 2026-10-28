// ======================================
// API
// ======================================

const API_VENTAS =
"/api/ventas/";

const API_DETALLE =
"/api/detalle-ventas/";


// ======================================
// LOGIN
// ======================================

const rol =
localStorage.getItem("rol");

if (!rol) {

    window.location.href =
    "/Home/Index";
}


// ======================================
// LOGOUT
// ======================================

function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}


// ======================================
// VARIABLES
// ======================================

let facturas = [];


// ======================================
// CARGAR FACTURAS
// ======================================

async function cargarFacturas() {

    try {

        const response =
        await fetch(
            API_VENTAS
        );

        const data =
        await response.json();


        // ==================================
        // SOLO FACTURAS
        // ==================================

        facturas = data.filter(v =>

            v.facturada === 1
            ||
            v.facturada === true
        );


        renderTabla(
            facturas
        );
    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando facturas"
        );
    }
}


// ======================================
// RENDER TABLA
// ======================================

function renderTabla(data) {

    let html = "";


    // ==================================
    // VACIO
    // ==================================

    if (!data.length) {

        html = `

            <tr>

                <td colspan="6">

                    Sin facturas registradas

                </td>

            </tr>
        `;
    }


    // ==================================
    // RECORRER
    // ==================================

    else {

        data.forEach(f => {

            html += `

                <tr>

                    <td>

                        ${f.folio || ""}

                    </td>

                    <td>

                        ${
                            f.nombre_cliente
                            ||
                            "MOSTRADOR"
                        }

                    </td>

                    <td>

                        ${f.uso_cfdi || "G03"}

                    </td>

                    <td>

                        $${parseFloat(
                            f.total || 0
                        ).toFixed(2)}

                    </td>

                    <td>

                        ${formatearFecha(
                            f.fecha
                        )}

                    </td>

                    <td>

                        <button
                            class="btn-pdf"
                            onclick="imprimirFactura(${f.id_venta})"
                        >
                            🖨️ IMPRIMIR
                        </button>

                    </td>

                </tr>
            `;
        });
    }


    document.getElementById(
        "tablaFacturas"
    ).innerHTML = html;
}


// ======================================
// BUSCADOR
// ======================================

document.getElementById(
    "buscador"
).addEventListener(
    "keyup",
    function() {

        const texto =
        this.value.toLowerCase();


        const filtrados =
        facturas.filter(f =>

            (f.folio || "")
            .toLowerCase()
            .includes(texto)

            ||

            (f.nombre_cliente || "")
            .toLowerCase()
            .includes(texto)
        );


        renderTabla(
            filtrados
        );
    }
);


// ======================================
// FILTRO FECHA
// ======================================

document.getElementById(
    "filtroFecha"
).addEventListener(
    "change",
    function() {

        const fecha =
        this.value;


        if (!fecha) {

            renderTabla(
                facturas
            );

            return;
        }


        const filtrados =
        facturas.filter(f => {

            if (!f.fecha) {

                return false;
            }

            return (

                f.fecha
                .split("T")[0]

                ===

                fecha
            );
        });


        renderTabla(
            filtrados
        );
    }
);


// ======================================
// IMPRIMIR FACTURA
// ======================================

async function imprimirFactura(
    id_venta
) {

    try {

        // ==================================
        // OBTENER VENTA
        // ==================================

        const responseVenta =
        await fetch(

            `${API_VENTAS}${id_venta}`
        );

        const venta =
        await responseVenta.json();


        // ==================================
        // OBTENER DETALLE
        // ==================================

        const responseDetalle =
        await fetch(

            `${API_DETALLE}venta/${id_venta}`
        );

        const detalle =
        await responseDetalle.json();


        // ==================================
        // PRODUCTOS HTML
        // ==================================

        let productosHTML = "";


        detalle.forEach((p, index) => {

            productosHTML += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>

                    <td>

                        ${p.codigo || ""}

                    </td>

                    <td>

                        ${p.nombre || ""}

                    </td>

                    <td>

                        ${p.cantidad || 0}

                    </td>

                    <td>

                        $${parseFloat(
                            p.precio_unitario || 0
                        ).toFixed(2)}

                    </td>

                    <td>

                        $${parseFloat(
                            p.subtotal || 0
                        ).toFixed(2)}

                    </td>

                </tr>
            `;
        });


        // ==================================
        // SUBTOTAL
        // ==================================

        const subtotal =

            parseFloat(
                venta.subtotal || 0
            );


        // ==================================
        // IVA
        // ==================================

        const iva =

            parseFloat(
                venta.iva || 0
            );


        // ==================================
        // TOTAL
        // ==================================

        const total =

            parseFloat(
                venta.total || 0
            );


        // ==================================
        // VENTANA
        // ==================================

        const ventana =
        window.open(
            "",
            "",
            "width=1200,height=900"
        );


        // ==================================
        // HTML
        // ==================================

        ventana.document.write(`

            <html>

            <head>

                <title>

                    Factura

                </title>

                <style>

                    body {

                        font-family:
                        Arial;

                        padding:
                        40px;

                        color:
                        #000;
                    }

                    .header {

                        display:
                        flex;

                        justify-content:
                        space-between;

                        margin-bottom:
                        30px;
                    }

                    .empresa h1 {

                        margin:
                        0;
                    }

                    .titulo {

                        text-align:
                        right;
                    }

                    table {

                        width:
                        100%;

                        border-collapse:
                        collapse;

                        margin-top:
                        20px;
                    }

                    th {

                        background:
                        #0f172a;

                        color:
                        white;

                        padding:
                        10px;

                        border:
                        1px solid #000;
                    }

                    td {

                        border:
                        1px solid #000;

                        padding:
                        10px;
                    }

                    .totales {

                        width:
                        350px;

                        margin-left:
                        auto;

                        margin-top:
                        30px;
                    }

                    .right {

                        text-align:
                        right;
                    }

                    .bold {

                        font-weight:
                        bold;
                    }

                </style>

            </head>

            <body>

                <!-- ====================== -->
                <!-- HEADER -->
                <!-- ====================== -->

                <div class="header">

                    <div class="empresa">

                        <h1>

                            PAPELERÍA LABORANTE

                        </h1>

                        <p>

                            RFC:
                            XAXX010101000

                        </p>

                        <p>

                            TEL:
                            961-000-0000

                        </p>

                    </div>

                    <div class="titulo">

                        <h1>

                            FACTURA

                        </h1>

                        <p>

                            Folio:
                            ${venta.folio || ""}

                        </p>

                        <p>

                            Fecha:
                            ${formatearFecha(
                                venta.fecha
                            )}

                        </p>

                    </div>

                </div>


                <!-- ====================== -->
                <!-- CLIENTE -->
                <!-- ====================== -->

                <table>

                    <tr>

                        <td>

                            <strong>

                                CLIENTE

                            </strong>

                            <br>

                            ${
                                venta.nombre_cliente
                                ||
                                "MOSTRADOR"
                            }

                        </td>

                        <td>

                            <strong>

                                RFC

                            </strong>

                            <br>

                            ${venta.rfc || ""}

                        </td>

                    </tr>

                    <tr>

                        <td>

                            <strong>

                                DIRECCIÓN

                            </strong>

                            <br>

                            ${venta.direccion || ""}

                        </td>

                        <td>

                            <strong>

                                USO CFDI

                            </strong>

                            <br>

                            ${venta.uso_cfdi || "G03"}

                        </td>

                    </tr>

                </table>


                <!-- ====================== -->
                <!-- PRODUCTOS -->
                <!-- ====================== -->

                <table>

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


                <!-- ====================== -->
                <!-- TOTALES -->
                <!-- ====================== -->

                <table class="totales">

                    <tr>

                        <td>

                            SUBTOTAL

                        </td>

                        <td class="right">

                            $${subtotal.toFixed(2)}

                        </td>

                    </tr>

                    <tr>

                        <td>

                            IVA

                        </td>

                        <td class="right">

                            $${iva.toFixed(2)}

                        </td>

                    </tr>

                    <tr>

                        <td class="bold">

                            TOTAL

                        </td>

                        <td class="right bold">

                            $${total.toFixed(2)}

                        </td>

                    </tr>

                </table>


                <br><br><br>

                <div
                    style="
                        text-align:center;
                    "
                >

                    Gracias por su compra

                </div>

            </body>

            </html>
        `);


        // ==================================
        // IMPRIMIR
        // ==================================

        ventana.document.close();

        ventana.focus();

        ventana.print();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error imprimiendo factura"
        );
    }
}


// ======================================
// FECHA
// ======================================

function formatearFecha(fecha) {

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


// ======================================
// INIT
// ======================================

window.onload =
cargarFacturas;