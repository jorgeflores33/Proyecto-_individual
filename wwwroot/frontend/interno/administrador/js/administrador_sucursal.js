// 🔥 API
const API =
"/api/sucursales";


// ✏️ EDITANDO
let editandoId = null;


// 🔐 VALIDAR LOGIN
const rol = localStorage.getItem("rol");

// 🔐 LOGIN
if (!localStorage.getItem("rol")) {

    window.location.href =
    "/Home/Index";
}


// 🔓 LOGOUT
function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}

// 🚀 CARGAR SUCURSALES
async function cargarSucursales() {

    try {

        const res =
        await fetch(API);

        const sucursales =
        await res.json();


        let html = "";


        // ❌ SIN REGISTROS
        if (!sucursales.length) {

            html = `
                <tr>
                    <td colspan="4">
                        Sin registros
                    </td>
                </tr>
            `;
        }


        // ✅ CON DATOS
        else {

            sucursales.forEach(s => {

                html += `

                    <tr>

                        <td>
                            ${s.nombre || ""}
                        </td>

                        <td>
                            ${s.direccion || ""}
                        </td>

                        <td>
                            ${s.telefono || ""}
                        </td>

                        <td>

                            <button
                                class="btn-editar"
                                onclick="editar(${s.id_sucursal})"
                            >
                                ✏️
                            </button>

                            <button
                                class="btn-eliminar"
                                onclick="eliminar(${s.id_sucursal})"
                            >
                                🗑
                            </button>

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaSucursales"
        ).innerHTML = html;
    }

    catch (err) {

        console.error(err);

        alert(
            "Error al cargar sucursales"
        );
    }
}


// 🔥 MODAL
function abrirModal() {

    document.getElementById(
        "modalSucursal"
    ).style.display = "flex";
}


// ❌ CERRAR
function cerrarModal() {

    document.getElementById(
        "modalSucursal"
    ).style.display = "none";

    limpiar();
}


// ✏️ EDITAR
async function editar(id) {

    try {

        const res =
        await fetch(
            `${API}/${id}`
        );

        const data =
        await res.json();


        editandoId = id;


        document.getElementById(
            "nombre"
        ).value =
        data.nombre || "";

        document.getElementById(
            "direccion"
        ).value =
        data.direccion || "";

        document.getElementById(
            "telefono"
        ).value =
        data.telefono || "";


        abrirModal();
    }

    catch (err) {

        console.error(err);

        alert(
            "Error al obtener sucursal"
        );
    }
}


// 💾 GUARDAR
async function guardar() {

    const nombre =
    document.getElementById(
        "nombre"
    ).value;

    const direccion =
    document.getElementById(
        "direccion"
    ).value;

    const telefono =
    document.getElementById(
        "telefono"
    ).value;


    if (
        !nombre
        ||
        !direccion
        ||
        !telefono
    ) {

        alert(
            "Todos los campos son obligatorios"
        );

        return;
    }


    const data = {

        nombre,
        direccion,
        telefono
    };


    const url =
    editandoId
    ?
    `${API}/${editandoId}`
    :
    API;


    const method =
    editandoId
    ?
    "PUT"
    :
    "POST";


    try {

        await fetch(url, {

            method: method,

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify(data)
        });


        cerrarModal();

        cargarSucursales();
    }

    catch (err) {

        console.error(err);

        alert(
            "Error al guardar sucursal"
        );
    }
}


// 🗑 ELIMINAR
async function eliminar(id) {

    if (
        !confirm(
            "¿Eliminar sucursal?"
        )
    ) {
        return;
    }


    try {

        await fetch(
            `${API}/${id}`,
            {
                method: "DELETE"
            }
        );

        cargarSucursales();
    }

    catch (err) {

        console.error(err);

        alert(
            "Error al eliminar sucursal"
        );
    }
}


// 🧹 LIMPIAR
function limpiar() {

    editandoId = null;

    document.getElementById(
        "nombre"
    ).value = "";

    document.getElementById(
        "direccion"
    ).value = "";

    document.getElementById(
        "telefono"
    ).value = "";
}


// 🔙 REGRESAR
function regresar() {

    window.location.href =
    "/Administrador/Index";
}


// 🚀 INICIO
window.onload =
cargarSucursales;