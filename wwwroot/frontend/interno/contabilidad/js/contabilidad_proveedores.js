const API = "/api/proveedores";

/* ==============================
   VALIDAR SESIÓN
============================== */

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

/* ==============================
   LISTA GLOBAL
============================== */

let listaProveedores = [];

/* ==============================
   INICIO
============================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarProveedores();

        document
            .getElementById("buscadorProveedor")

            ?.addEventListener(
                "input",
                (e) => {

                    filtrar(
                        e.target.value
                    );
                }
            );
    }
);

/* ==============================
   CARGAR PROVEEDORES
============================== */

function cargarProveedores() {

    fetch(API)

        .then(res => res.json())

        .then(data => {

            listaProveedores = data;

            renderTabla(data);
        })

        .catch(error => {

            console.error(error);

            alert(
                "Error al cargar proveedores"
            );
        });
}

/* ==============================
   RENDER TABLA
============================== */

function renderTabla(data) {

    let html = "";

    if (!data.length) {

        html = `
            <tr>
                <td colspan="7">
                    Sin proveedores
                </td>
            </tr>
        `;
    }

    else {

        data.forEach(p => {

            html += `
                <tr>

                    <td>
                        ${p.id_proveedor}
                    </td>

                    <td>
                        ${p.nombre || ""}
                    </td>

                    <td>
                        ${p.telefono || ""}
                    </td>

                    <td>
                        ${p.correo || ""}
                    </td>

                    <td>
                        ${p.direccion || ""}
                    </td>

                    <td>
                        ${p.folio || ""}
                    </td>

                    <td>

                        <button
                            onclick="editar(${p.id_proveedor})"
                        >
                            ✏️
                        </button>

                        <button
                            onclick="eliminar(${p.id_proveedor})"
                        >
                            🗑
                        </button>

                    </td>

                </tr>
            `;
        });
    }

    document.getElementById(
        "tablaProveedores"
    ).innerHTML = html;
}

/* ==============================
   FILTRAR
============================== */

function filtrar(texto) {

    texto = texto.toLowerCase();

    const filtrados = listaProveedores.filter(p =>

        (p.nombre || "")
            .toLowerCase()
            .includes(texto)

        ||

        (p.correo || "")
            .toLowerCase()
            .includes(texto)

        ||

        (p.telefono || "")
            .includes(texto)

        ||

        (p.folio || "")
            .toLowerCase()
            .includes(texto)
    );

    renderTabla(filtrados);
}

/* ==============================
   ABRIR MODAL
============================== */

function abrirModal() {

    limpiar();

    document.getElementById(
        "tituloModal"
    ).innerText =
        "Nuevo Proveedor";

    document.getElementById(
        "modalProveedor"
    ).style.display =
        "flex";
}

/* ==============================
   CERRAR MODAL
============================== */

function cerrarModal() {

    document.getElementById(
        "modalProveedor"
    ).style.display =
        "none";
}

/* ==============================
   LIMPIAR
============================== */

function limpiar() {

    document.getElementById(
        "id"
    ).value = "";

    document.getElementById(
        "nombre"
    ).value = "";

    document.getElementById(
        "telefono"
    ).value = "";

    document.getElementById(
        "correo"
    ).value = "";

    document.getElementById(
        "direccion"
    ).value = "";

    document.getElementById(
        "folio"
    ).value = "";
}

/* ==============================
   GUARDAR
============================== */

function guardarProveedor() {

    const id =
        document.getElementById(
            "id"
        ).value;

    const data = {

        nombre:
            document.getElementById(
                "nombre"
            ).value,

        telefono:
            document.getElementById(
                "telefono"
            ).value,

        correo:
            document.getElementById(
                "correo"
            ).value,

        direccion:
            document.getElementById(
                "direccion"
            ).value,

        folio:
            document.getElementById(
                "folio"
            ).value
    };

    if (!data.nombre) {

        alert(
            "El nombre es obligatorio"
        );

        return;
    }

    const url =
        id
            ? `${API}/${id}`
            : API;

    const method =
        id
            ? "PUT"
            : "POST";

    fetch(url, {

        method: method,

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify(data)

    })

    .then(res => res.json())

    .then(() => {

        cerrarModal();

        cargarProveedores();

        alert(
            id
                ? "Proveedor actualizado"
                : "Proveedor creado"
        );
    })

    .catch(error => {

        console.error(error);

        alert(
            "Error al guardar"
        );
    });
}

/* ==============================
   EDITAR
============================== */

function editar(id) {

    fetch(`${API}/${id}`)

        .then(res => res.json())

        .then(p => {

            document.getElementById(
                "id"
            ).value =
                p.id_proveedor;

            document.getElementById(
                "nombre"
            ).value =
                p.nombre || "";

            document.getElementById(
                "telefono"
            ).value =
                p.telefono || "";

            document.getElementById(
                "correo"
            ).value =
                p.correo || "";

            document.getElementById(
                "direccion"
            ).value =
                p.direccion || "";

            document.getElementById(
                "folio"
            ).value =
                p.folio || "";

            document.getElementById(
                "tituloModal"
            ).innerText =
                "Editar Proveedor";

            document.getElementById(
                "modalProveedor"
            ).style.display =
                "flex";
        });
}

/* ==============================
   ELIMINAR
============================== */

function eliminar(id) {

    if (
        !confirm(
            "¿Eliminar proveedor?"
        )
    ) return;

    fetch(`${API}/${id}`, {

        method: "DELETE"

    })

    .then(() => {

        cargarProveedores();
    })

    .catch(error => {

        console.error(error);

        alert(
            "Error al eliminar"
        );
    });
}