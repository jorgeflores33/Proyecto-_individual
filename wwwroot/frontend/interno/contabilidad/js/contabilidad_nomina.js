// =========================================
// API
// =========================================

const API_TRABAJADORES =
"/api/trabajadores/";

const API_ASISTENCIA =
"/api/asistencia/";

const API_NOMINA =
"/api/nomina/";


// =========================================
// VARIABLES
// =========================================

let trabajadores = [];

let asistencias = [];

let nominas = [];


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
// ABRIR MODAL
// =========================================

async function abrirModal() {

    document.getElementById(
        "modalNomina"
    ).style.display =
    "flex";

    await cargarTrabajadores();
}


// =========================================
// CERRAR MODAL
// =========================================

function cerrarModal() {

    document.getElementById(
        "modalNomina"
    ).style.display =
    "none";
}


// =========================================
// CARGAR TRABAJADORES
// =========================================

async function cargarTrabajadores() {

    const response =
    await fetch(API_TRABAJADORES);

    trabajadores =
    await response.json();

    let html =
    `<option value="">Seleccionar</option>`;

    trabajadores.forEach(t => {

        html += `

            <option value="${t.id_trabajador}">

                ${t.nombre}

            </option>
        `;
    });

    document.getElementById(
        "trabajador"
    ).innerHTML = html;
}


// =========================================
// CARGAR NOMINA
// =========================================

async function cargarNomina() {

    const response =
    await fetch(API_NOMINA);

    nominas =
    await response.json();

    renderTabla();
}


// =========================================
// RENDER
// =========================================

function renderTabla() {

    let html = "";

    if (!nominas.length) {

        html = `

            <tr>

                <td colspan="5">

                    Sin nóminas

                </td>

            </tr>
        `;
    }

    else {

        nominas.forEach(n => {

            html += `

                <tr>

                    <td>
                        ${n.nombre_trabajador || ""}
                    </td>

                    <td>
                        ${n.dias_trabajados}
                    </td>

                    <td>

                        $${Number(
                            n.sueldo_base
                        ).toFixed(2)}

                    </td>

                    <td>

                        $${Number(
                            n.total_pago
                        ).toFixed(2)}

                    </td>

                    <td>

                        <button
                            class="btn-print"
                            onclick="imprimirNomina(${n.id_nomina})"
                        >
                            🖨
                        </button>

                    </td>

                </tr>
            `;
        });
    }

    document.getElementById(
        "tablaNomina"
    ).innerHTML = html;
}


// =========================================
// GENERAR NOMINA
// =========================================

async function generarNomina() {

    const id_trabajador =
    document.getElementById(
        "trabajador"
    ).value;

    const fechaInicio =
    document.getElementById(
        "fechaInicio"
    ).value;

    const fechaFin =
    document.getElementById(
        "fechaFin"
    ).value;


    if (

        !id_trabajador
        ||
        !fechaInicio
        ||
        !fechaFin

    ) {

        alert(
            "Completa todos los campos"
        );

        return;
    }


    // =====================================
    // ASISTENCIAS
    // =====================================

    const responseAsistencia =
    await fetch(API_ASISTENCIA);

    asistencias =
    await responseAsistencia.json();


    // =====================================
    // FILTRAR
    // =====================================

    const asistenciasTrabajador =

        asistencias.filter(a => {

            return (

                Number(a.id_trabajador)
                ===
                Number(id_trabajador)

                &&

                a.fecha >= fechaInicio

                &&

                a.fecha <= fechaFin
            );
        });


    const diasTrabajados =
    asistenciasTrabajador.length;


    // =====================================
    // TRABAJADOR
    // =====================================

    const trabajador =

        trabajadores.find(t =>

            Number(t.id_trabajador)
            ===
            Number(id_trabajador)
        );


    const data = {

        id_trabajador,

        id_asistencia:

        asistenciasTrabajador[0]
        ?.id_asistencia || null,

        sueldo_base:
        trabajador.salario,

        dias_trabajados:
        diasTrabajados
    };


    // =====================================
    // INSERT
    // =====================================

    await fetch(

        API_NOMINA,

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


    alert(
        "Nómina generada"
    );

    cerrarModal();

    cargarNomina();
}


// =========================================
// IMPRIMIR NOMINA
// =========================================

async function imprimirNomina(
    id_nomina
) {

    const nomina =

        nominas.find(n =>

            Number(n.id_nomina)
            ===
            Number(id_nomina)
        );

    if (!nomina) {

        return;
    }


    const responseAsistencia =
    await fetch(API_ASISTENCIA);

    const asistencias =
    await responseAsistencia.json();


    const detalle =

        asistencias.filter(a =>

            Number(a.id_trabajador)
            ===
            Number(nomina.id_trabajador)
        );


    let filas = "";

    detalle.forEach(a => {

        let estado = "";

        if (

            a.hora_entrada
            >
            "08:30:00"

        ) {

            estado = "RETARDO";
        }

        filas += `

            <tr>

                <td>${a.fecha}</td>

                <td>${a.hora_entrada || "-"}</td>

                <td>${a.hora_salida || "-"}</td>

                <td>${estado}</td>

            </tr>
        `;
    });


    const ventana =
    window.open("", "_blank");


    ventana.document.write(`

        <html>

        <head>

            <title>
                Nómina
            </title>

            <style>

                body {

                    font-family: Arial;
                    padding: 40px;
                }

                table {

                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {

                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }

                h1, h2, h3 {

                    text-align: center;
                }

            </style>

        </head>

        <body>

            <h1>
                PAPELERÍA LABORANTE
            </h1>

            <h2>
                RECIBO DE NÓMINA
            </h2>

            <hr>

            <p>

                <strong>
                    Trabajador:
                </strong>

                ${nomina.nombre_trabajador}

            </p>

            <p>

                <strong>
                    Días Trabajados:
                </strong>

                ${nomina.dias_trabajados}

            </p>

            <p>

                <strong>
                    Sueldo Base:
                </strong>

                $${nomina.sueldo_base}

            </p>

            <p>

                <strong>
                    Total Pago:
                </strong>

                $${nomina.total_pago}

            </p>

            <h3>
                DETALLE DE ASISTENCIA
            </h3>

            <table>

                <thead>

                    <tr>

                        <th>
                            Fecha
                        </th>

                        <th>
                            Entrada
                        </th>

                        <th>
                            Salida
                        </th>

                        <th>
                            Estado
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${filas}

                </tbody>

            </table>

            <br><br>

            <p>

                Fecha:
                ${new Date().toLocaleDateString()}

            </p>

            <br><br><br>

            <center>

                _______________________

                <br>

                Firma del Trabajador

            </center>

        </body>

        </html>
    `);

    ventana.document.close();

    ventana.print();
}


// =========================================
// INIT
// =========================================

window.onload = function () {

    cargarNomina();
};