// =========================================
// API
// =========================================
const API_CORTE =
"/api/corte-caja/";

const API_APERTURA =
"/api/apertura-caja/";

const API_VENTAS =
"/api/ventas/";

// =========================================
// LOGIN
// =========================================

const usuario =
localStorage.getItem("usuario");

const rol =
localStorage.getItem("rol");


// =========================================
// VALIDAR LOGIN
// =========================================

if (

    !usuario
    ||
    !rol

) {

    window.location.href =
    "/Home/Index";
}


// =========================================
// VARIABLES
// =========================================

let aperturaActual = null;

let ventasCorte = [];


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
// OBTENER APERTURA ACTIVA
// =========================================

async function obtenerAperturaActiva() {

    try {

        const response =
        await fetch(
            API_APERTURA
        );

        const data =
        await response.json();


        const abiertas =
        data.filter(a =>

            a.estado ===
            "ABIERTA"
        );


        if (
            abiertas.length === 0
        ) {

            return null;
        }


        aperturaActual =
        abiertas[abiertas.length - 1];

        return aperturaActual;

    }

    catch(error) {

        console.error(error);

        return null;
    }
}


// =========================================
// CARGAR CORTES
// =========================================

async function cargarCortes() {

    try {

        const response =
        await fetch(
            API_CORTE
        );

        const data =
        await response.json();


        let html = "";


        // =====================================
        // SIN DATOS
        // =====================================

        if (
            data.length === 0
        ) {

            html = `

                <tr>

                    <td colspan="6">

                        No hay cortes registrados

                    </td>

                </tr>
            `;
        }


        // =====================================
        // RECORRER
        // =====================================

        else {

            data.forEach(c => {

                html += `

                    <tr>

                        <td>

                            ${c.id_apertura}

                        </td>

                        <td>

                            CAJERO

                        </td>

                        <td>

                            SUCURSAL

                        </td>

                        <td>

                            ${
                                new Date(
                                    c.fecha
                                ).toLocaleString()
                            }

                        </td>

                        <td>

                            💵 ${
                                Number(
                                    c.efectivo || 0
                                ).toFixed(2)
                            }

                            <br>

                            💳 ${
                                Number(
                                    c.debito || 0
                                ).toFixed(2)
                            }

                            <br>

                            🏦 ${
                                Number(
                                    c.credito || 0
                                ).toFixed(2)
                            }

                            <br>

                            🔄 ${
                                Number(
                                    c.transferencia || 0
                                ).toFixed(2)
                            }

                            <br><br>

                            <strong>

                                TOTAL:

                                $ ${
                                    Number(
                                        c.total_ventas || 0
                                    ).toFixed(2)
                                }

                            </strong>

                            <br>

                            DIF:

                            $ ${
                                Number(
                                    c.diferencia || 0
                                ).toFixed(2)
                            }

                        </td>

                        <td>

                            <button
                                onclick="imprimirCorte(${c.id_corte})"
                            >
                                🧾
                            </button>

                            <button
                                onclick="eliminarCorte(${c.id_corte})"
                            >
                                🗑️
                            </button>

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaCortes"
        ).innerHTML = html;

    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando cortes"
        );
    }
}


// =========================================
// ABRIR MODAL
// =========================================

async function abrirModal() {

    const apertura =
    await obtenerAperturaActiva();


    if (!apertura) {

        alert(
            "No hay caja ABIERTA"
        );

        return;
    }


    document.getElementById(
        "modalCorte"
    ).style.display =
    "flex";


    document.getElementById(
        "usuario"
    ).value =

        apertura.usuario
        ||
        "";


    document.getElementById(
        "trabajador"
    ).value =

        apertura.nombre_trabajador
        ||
        "";


    document.getElementById(
        "sucursal"
    ).value =

        apertura.nombre_sucursal
        ||
        "";


    calcularTotalesCorte();
}


// =========================================
// CERRAR MODAL
// =========================================

function cerrarModal() {

    document.getElementById(
        "modalCorte"
    ).style.display =
    "none";
}


// =========================================
// CALCULAR TOTALES
// =========================================

async function calcularTotalesCorte() {

    try {

        const response =
        await fetch(
            API_VENTAS
        );

        const ventas =
        await response.json();


        const ventasCaja =

            ventas.filter(v =>

                Number(v.id_usuario)
                ===
                Number(
                    aperturaActual.id_usuario
                )
            );


        let efectivo = 0;
        let debito = 0;
        let credito = 0;
        let transferencia = 0;


        ventasCaja.forEach(v => {

            const total =
            Number(v.total || 0);


            if (

                v.forma_pago ===
                "EFECTIVO"

            ) {

                efectivo += total;
            }


            else if (

                v.forma_pago ===
                "TARJETA DE DÉBITO"

            ) {

                debito += total;
            }


            else if (

                v.forma_pago ===
                "TARJETA DE CRÉDITO"

            ) {

                credito += total;
            }


            else if (

                v.forma_pago ===
                "TRANSFERENCIA"

            ) {

                transferencia += total;
            }
        });


        const totalVentas =

            efectivo
            +
            debito
            +
            credito
            +
            transferencia;


        document.getElementById(
            "efectivo"
        ).value =
        efectivo.toFixed(2);


        document.getElementById(
            "debito"
        ).value =
        debito.toFixed(2);


        document.getElementById(
            "credito"
        ).value =
        credito.toFixed(2);


        document.getElementById(
            "transferencia"
        ).value =
        transferencia.toFixed(2);


        window.totalVentasCorte =
        totalVentas;

    }

    catch(error) {

        console.error(error);
    }
}


// =========================================
// GUARDAR CORTE
// =========================================

async function guardarCorte() {

    try {

        if (!aperturaActual) {

            alert(
                "No hay apertura activa"
            );

            return;
        }


        const efectivo =
        Number(

            document.getElementById(
                "efectivo"
            ).value || 0
        );


        const debito =
        Number(

            document.getElementById(
                "debito"
            ).value || 0
        );


        const credito =
        Number(

            document.getElementById(
                "credito"
            ).value || 0
        );


        const transferencia =
        Number(

            document.getElementById(
                "transferencia"
            ).value || 0
        );


        const totalVentas =

            efectivo
            +
            debito
            +
            credito
            +
            transferencia;


        const diferencia = 0;


        // =====================================
        // DATA
        // =====================================

        const data = {

            id_apertura:
            aperturaActual.id_apertura,

            efectivo,

            debito,

            credito,

            transferencia,

            total_ventas:
            totalVentas,

            diferencia
        };


        console.log(
            data
        );


        // =====================================
        // INSERT
        // =====================================

        const response =
        await fetch(

            API_CORTE,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(
                    data
                )
            }
        );


        const result =
        await response.json();


        console.log(
            result
        );


        alert(
            "Corte registrado correctamente"
        );


        // =====================================
        // CERRAR CAJA
        // =====================================

        await fetch(

            `${API_APERTURA}/${aperturaActual.id_apertura}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    estado:
                    "CERRADA"
                })
            }
        );


        cerrarModal();

        cargarCortes();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error registrando corte"
        );
    }
}




// =========================================
// IMPRIMIR CORTE TAMAÑO CARTA
// =========================================

async function imprimirCorte(
    id_corte
) {

    try {

        // =====================================
        // OBTENER CORTE
        // =====================================

        const response =
        await fetch(

            `${API_CORTE}${id_corte}`
        );

        const corte =
        await response.json();


        // =====================================
        // TOTAL
        // =====================================

        const total =

            Number(corte.efectivo || 0)
            +
            Number(corte.debito || 0)
            +
            Number(corte.credito || 0)
            +
            Number(corte.transferencia || 0);


        // =====================================
        // FECHA
        // =====================================

        const fecha = new Date(
            corte.fecha
        ).toLocaleString();


        // =====================================
        // VENTANA
        // =====================================

        const ventana =
        window.open(
            "",
            "",
            "width=1200,height=900"
        );


        // =====================================
        // HTML
        // =====================================

        ventana.document.write(`

            <html>

            <head>

                <title>

                    Corte Caja

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

                        text-align:
                        center;

                        margin-bottom:
                        30px;
                    }

                    .header h1 {

                        margin:
                        0;

                        font-size:
                        32px;
                    }

                    .header p {

                        margin:
                        5px 0;
                    }

                    .info {

                        width:
                        100%;

                        margin-bottom:
                        30px;

                        border:
                        1px solid #000;

                        border-collapse:
                        collapse;
                    }

                    .info td {

                        border:
                        1px solid #000;

                        padding:
                        10px;
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
                        12px;

                        border:
                        1px solid #000;
                    }

                    td {

                        padding:
                        12px;

                        border:
                        1px solid #000;
                    }

                    .right {

                        text-align:
                        right;
                    }

                    .bold {

                        font-weight:
                        bold;
                    }

                    .totales {

                        margin-top:
                        40px;

                        width:
                        350px;

                        margin-left:
                        auto;
                    }

                    .footer {

                        margin-top:
                        80px;

                        text-align:
                        center;

                        font-size:
                        14px;
                    }

                    @media print {

                        @page {

                            size: letter;

                            margin: 20mm;
                        }

                        body {

                            padding:
                            0;
                        }
                    }

                </style>

            </head>

            <body>

                <!-- ===================== -->
                <!-- HEADER -->
                <!-- ===================== -->

                <div class="header">

                    <h1>

                        CORTE DE CAJA

                    </h1>

                    <p>

                        PAPELERÍA LABORANTE

                    </p>

                    <p>

                        BASE DEMO SA DE CV

                    </p>

                </div>


                <!-- ===================== -->
                <!-- INFORMACIÓN -->
                <!-- ===================== -->

                <table class="info">

                    <tr>

                        <td>

                            <strong>

                                Caja:

                            </strong>

                            GENERAL

                        </td>

                        <td>

                            <strong>

                                Fecha:

                            </strong>

                            ${fecha}

                        </td>

                    </tr>

                    <tr>

                        <td>

                            <strong>

                                Apertura:

                            </strong>

                            #${corte.id_apertura}

                        </td>

                        <td>

                            <strong>

                                Corte:

                            </strong>

                            #${corte.id_corte}

                        </td>

                    </tr>

                </table>


                <!-- ===================== -->
                <!-- TABLA -->
                <!-- ===================== -->

                <table>

                    <thead>

                        <tr>

                            <th>

                                Forma de Pago

                            </th>

                            <th>

                                Total

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td>

                                💵 Efectivo

                            </td>

                            <td class="right">

                                $ ${Number(
                                    corte.efectivo || 0
                                ).toFixed(2)}

                            </td>

                        </tr>

                        <tr>

                            <td>

                                💳 Débito

                            </td>

                            <td class="right">

                                $ ${Number(
                                    corte.debito || 0
                                ).toFixed(2)}

                            </td>

                        </tr>

                        <tr>

                            <td>

                                🏦 Crédito

                            </td>

                            <td class="right">

                                $ ${Number(
                                    corte.credito || 0
                                ).toFixed(2)}

                            </td>

                        </tr>

                        <tr>

                            <td>

                                🔄 Transferencia

                            </td>

                            <td class="right">

                                $ ${Number(
                                    corte.transferencia || 0
                                ).toFixed(2)}

                            </td>

                        </tr>

                    </tbody>

                </table>


                <!-- ===================== -->
                <!-- TOTALES -->
                <!-- ===================== -->

                <table class="totales">

                    <tr>

                        <td class="bold">

                            TOTAL VENTAS

                        </td>

                        <td class="right bold">

                            $ ${total.toFixed(2)}

                        </td>

                    </tr>

                    <tr>

                        <td>

                            DIFERENCIA

                        </td>

                        <td class="right">

                            $ ${Number(
                                corte.diferencia || 0
                            ).toFixed(2)}

                        </td>

                    </tr>

                </table>


                <!-- ===================== -->
                <!-- FOOTER -->
                <!-- ===================== -->

                <div class="footer">

                    <p>

                        Corte generado correctamente

                    </p>

                    <p>

                        PAPELERÍA LABORANTE

                    </p>

                </div>

            </body>

            </html>
        `);


        // =====================================
        // IMPRIMIR
        // =====================================

        ventana.document.close();

        ventana.focus();

        ventana.print();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error imprimiendo corte"
        );
    }
}
// =========================================
// ELIMINAR
// =========================================

async function eliminarCorte(
    id_corte
) {

    const confirmar =
    confirm(
        "¿Eliminar corte?"
    );

    if (!confirmar) {

        return;
    }

    try {

        await fetch(

            `${API_CORTE}/${id_corte}`,

            {
                method: "DELETE"
            }
        );

        cargarCortes();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error eliminando corte"
        );
    }
}


// =========================================
// INIT
// =========================================

window.onload = function () {

    cargarCortes();
};