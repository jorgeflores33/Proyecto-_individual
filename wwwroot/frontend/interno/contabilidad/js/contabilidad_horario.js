// =========================================
// API
// =========================================

const API_ASISTENCIA =
"/api/asistencia";

const API_TRABAJADORES =
"/api/trabajadores";


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
// VARIABLES
// =========================================

let trabajadores = [];

let asistencias = [];


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

function abrirModal() {

    document.getElementById(
        "modalHorario"
    ).style.display = "flex";


    // =====================================
    // FECHA ACTUAL
    // =====================================

    const hoy =
    new Date()
    .toISOString()
    .split("T")[0];


    document.getElementById(
        "fecha"
    ).value = hoy;
}


// =========================================
// CERRAR MODAL
// =========================================

function cerrarModal() {

    document.getElementById(
        "modalHorario"
    ).style.display = "none";
}


// =========================================
// CARGAR TRABAJADORES
// =========================================

async function cargarTrabajadores() {

    try {

        const response =
        await fetch(
            API_TRABAJADORES
        );

        trabajadores =
        await response.json();


        let html = `

            <option value="">

                Seleccionar trabajador

            </option>
        `;


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

    catch(error) {

        console.error(error);

        alert(
            "Error cargando trabajadores"
        );
    }
}


// =========================================
// LLENAR SUCURSAL
// =========================================

function llenarSucursal() {

    const id =
    document.getElementById(
        "trabajador"
    ).value;


    const trabajador =
    trabajadores.find(t =>

        Number(t.id_trabajador)

        ===

        Number(id)
    );


    document.getElementById(
        "sucursal"
    ).value =

        trabajador?.area
        ||
        "";
}


// =========================================
// CARGAR ASISTENCIA
// =========================================

async function cargarAsistencia() {

    try {

        const response =
        await fetch(
            API_ASISTENCIA
        );

        asistencias =
        await response.json();


        renderTabla();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error cargando asistencia"
        );
    }
}
// =========================================
// FORMATEAR HORA
// =========================================

function formatearHora(hora) {

    if (!hora) {

        return "-";
    }

    // 🔥 SI VIENE NUMÉRICO
    if (!isNaN(hora)) {

        const segundos = Number(hora);

        const h =
        String(
            Math.floor(segundos / 3600)
        ).padStart(2, "0");

        const m =
        String(
            Math.floor(
                (segundos % 3600) / 60
            )
        ).padStart(2, "0");

        const s =
        String(
            segundos % 60
        ).padStart(2, "0");

        return `${h}:${m}:${s}`;
    }

    // 🔥 SI YA VIENE TEXTO
    return hora;
}
// =========================================
// RENDER TABLA
// =========================================

function renderTabla() {

    let html = "";


    if (!asistencias.length) {

        html = `

            <tr>

                <td colspan="5">

                    Sin registros

                </td>

            </tr>
        `;
    }

    else {

        asistencias.forEach(a => {


            const trabajador =
            trabajadores.find(t =>

                Number(t.id_trabajador)

                ===

                Number(a.id_trabajador)
            );


            html += `

                <tr>

                    <td>

                        ${trabajador?.nombre || ""}

                    </td>

                    <td>

                        ${trabajador?.area || ""}

                    </td>

                    <td>

                        ${formatearHora(a.hora_entrada)}

                    </td>

                    <td>

                        ${formatearHora(a.hora_salida)}

                    </td>

                    <td>

                        ${

                            a.estado === "ACTIVO"

                            ?

                            `

                                <button
                                    class="btn-salida"
                                    onclick="registrarSalida(${a.id_asistencia})"
                                >

                                    🚪 Registrar Salida

                                </button>
                            `

                            :

                            "FINALIZADO"
                        }

                    </td>

                </tr>
            `;
        });
    }


    document.getElementById(
        "tablaAsistencia"
    ).innerHTML = html;
}


// =========================================
// GUARDAR ASISTENCIA
// =========================================

async function guardarAsistencia() {

    try {

        const data = {

            id_trabajador:
            Number(

                document.getElementById(
                    "trabajador"
                ).value
            ),

            fecha:
            document.getElementById(
                "fecha"
            ).value,

            hora_entrada:
            document.getElementById(
                "entrada"
            ).value,

            hora_salida:
            document.getElementById(
                "salida"
            ).value,

            estado:
            "ACTIVO"
        };


        console.log(data);


        const response =
        await fetch(

            API_ASISTENCIA,

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

        console.log(result);


        alert(
            "Asistencia registrada"
        );


        cerrarModal();

        cargarAsistencia();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error registrando asistencia"
        );
    }
}


// =========================================
// REGISTRAR SALIDA
// =========================================

async function registrarSalida(
    id_asistencia
) {

    try {

        const asistencia =
        asistencias.find(a =>

            Number(a.id_asistencia)

            ===

            Number(id_asistencia)
        );


        if (!asistencia) {

            alert(
                "Asistencia no encontrada"
            );

            return;
        }


        const horaSalida =

            new Date()
            .toLocaleTimeString(
                "es-MX",
                {
                    hour12: false
                }
            );


        const body = {

            id_trabajador:
            asistencia.id_trabajador,

            fecha:
            asistencia.fecha,

            hora_entrada:
            asistencia.hora_entrada,

            hora_salida:
            horaSalida,

            estado:
            "FINALIZADO"
        };


        await fetch(

            `${API_ASISTENCIA}/${id_asistencia}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(
                    body
                )
            }
        );


        alert(
            "Salida registrada"
        );


        cargarAsistencia();

    }

    catch(error) {

        console.error(error);

        alert(
            "Error registrando salida"
        );
    }
}


// =========================================
// INIT
// =========================================

window.onload = async function () {

    await cargarTrabajadores();

    await cargarAsistencia();
};