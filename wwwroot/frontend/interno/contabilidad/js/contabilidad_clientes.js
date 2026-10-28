const API = "/api/clientes";

let idEditar = null;

/* ==============================
   🔐 VALIDAR SESIÓN
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
   🚀 CARGAR CLIENTES
============================== */

function cargarClientes() {

    fetch(API)
        .then(res => res.json())
        .then(data => {

            window.listaClientes = data;

            pintarTabla(data);
        })
        .catch(error => {

            console.error(error);

            alert("Error al cargar clientes");
        });
}

/* ==============================
   🎨 PINTAR TABLA
============================== */

function pintarTabla(data) {

    let filas = "";

    data.forEach(c => {

        filas += `
            <tr>
                <td>${c.id_cliente}</td>
                <td>${c.nombre || ""}</td>
                <td>${c.telefono || ""}</td>
                <td>${c.correo || ""}</td>
                <td>${c.direccion || ""}</td>
                <td>${c.rfc || ""}</td>
                <td>${c.regimen_fiscal || ""}</td>
                <td>${c.codigo_postal || ""}</td>
                <td>${c.entidad || ""}</td>
                <td>${c.ciudad || ""}</td>
                <td>${c.folio || ""}</td>

                <td>
                    <button onclick="editar(${c.id_cliente})">
                        ✏️
                    </button>

                    <button onclick="eliminar(${c.id_cliente})">
                        🗑
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("tablaClientes").innerHTML =
        filas ||
        `
        <tr>
            <td colspan="12">
                Sin registros
            </td>
        </tr>
        `;
}

/* ==============================
   🔍 BUSCADOR
============================== */

document
    .getElementById("buscadorCliente")
    .addEventListener("input", function () {

        const texto = this.value.toLowerCase();

        const filtrados = listaClientes.filter(c =>

            (c.nombre || "")
                .toLowerCase()
                .includes(texto)

            ||

            (c.correo || "")
                .toLowerCase()
                .includes(texto)

            ||

            (c.telefono || "")
                .includes(texto)

            ||

            (c.folio || "")
                .toLowerCase()
                .includes(texto)
        );

        pintarTabla(filtrados);
    });

/* ==============================
   🔥 MODAL
============================== */

function abrirModal() {

    idEditar = null;

    limpiar();

    document.getElementById("tituloModal").innerText =
        "Nuevo Cliente";

    document.getElementById("modalCliente").style.display =
        "flex";
}

function cerrarModal() {

    document.getElementById("modalCliente").style.display =
        "none";
}

/* ==============================
   🧹 LIMPIAR FORM
============================== */

function limpiar() {

    document
        .querySelectorAll(".modal-box input, .modal-box select")
        .forEach(input => {

            input.value = "";
        });
}

/* ==============================
   💾 GUARDAR CLIENTE
============================== */

function guardarCliente() {

    const data = {

        nombre:
            document.getElementById("nombre").value,

        telefono:
            document.getElementById("telefono").value,

        correo:
            document.getElementById("correo").value,

        direccion:
            document.getElementById("direccion").value,

        rfc:
            document.getElementById("rfc").value,

        regimen_fiscal:
            document.getElementById("regimen_fiscal").value,

        codigo_postal:
            document.getElementById("cp").value,

        entidad:
            document.getElementById("estado").value,

        ciudad:
            document.getElementById("ciudad").value,

        folio:
            document.getElementById("folio").value
    };

    /* VALIDACIONES */

    if (!data.nombre) {

        alert("El nombre es obligatorio");

        return;
    }

    if (!data.telefono && !data.correo) {

        alert(
            "Debe agregar teléfono o correo"
        );

        return;
    }

    const url =
        idEditar
            ? `${API}/${idEditar}`
            : API;

    const method =
        idEditar
            ? "PUT"
            : "POST";

    fetch(url, {

        method: method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })
        .then(res => res.json())

        .then(res => {

            alert(
                res.mensaje ||
                "Guardado correctamente"
            );

            cerrarModal();

            cargarClientes();
        })

        .catch(error => {

            console.error(error);

            alert("Error al guardar");
        });
}

/* ==============================
   ✏️ EDITAR
============================== */

function editar(id) {

    idEditar = id;

    fetch(`${API}/${id}`)

        .then(res => res.json())

        .then(c => {

            document.getElementById("nombre").value =
                c.nombre || "";

            document.getElementById("telefono").value =
                c.telefono || "";

            document.getElementById("correo").value =
                c.correo || "";

            document.getElementById("direccion").value =
                c.direccion || "";

            document.getElementById("rfc").value =
                c.rfc || "";

            document.getElementById("regimen_fiscal").value =
                c.regimen_fiscal || "";

            document.getElementById("cp").value =
                c.codigo_postal || "";

            document.getElementById("estado").value =
                c.entidad || "";

            document.getElementById("ciudad").value =
                c.ciudad || "";

            document.getElementById("folio").value =
                c.folio || "";

            document.getElementById("tituloModal").innerText =
                "Editar Cliente";

            document.getElementById("modalCliente").style.display =
                "flex";
        })

        .catch(error => {

            console.error(error);

            alert("Error al cargar cliente");
        });
}

/* ==============================
   🗑 ELIMINAR
============================== */

function eliminar(id) {

    const confirmar = confirm(
        "¿Eliminar cliente?"
    );

    if (!confirmar) return;

    fetch(`${API}/${id}`, {

        method: "DELETE"

    })
        .then(res => res.json())

        .then(res => {

            alert(
                res.mensaje ||
                "Cliente eliminado"
            );

            cargarClientes();
        })

        .catch(error => {

            console.error(error);

            alert("Error al eliminar");
        });
}

/* ==============================
   🚀 INICIO
============================== */

window.onload = cargarClientes;