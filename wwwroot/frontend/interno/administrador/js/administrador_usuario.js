const API_USUARIOS = "/api/usuarios";
const API_TRABAJADORES = "/api/trabajadores";
const API_CLIENTES = "/api/clientes";

let idEditar = null;

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
   CARGAR USUARIOS
============================== */

async function cargarUsuarios() {

    try {

        const [
            usuariosRes,
            trabajadoresRes,
            clientesRes
        ] = await Promise.all([

            fetch(API_USUARIOS),
            fetch(API_TRABAJADORES),
            fetch(API_CLIENTES)

        ]);

        const usuarios = await usuariosRes.json();
        const trabajadores = await trabajadoresRes.json();
        const clientes = await clientesRes.json();

        let html = "";

        usuarios.forEach(u => {

            let nombreRelacion = "Sin asignar";
            let funcion = "Sin función";

            // trabajador
            if (u.id_trabajador) {

                const trabajador = trabajadores.find(
                    t => t.id_trabajador == u.id_trabajador
                );

                nombreRelacion =
                    trabajador?.nombre || "Trabajador";

                funcion = "Trabajador";
            }

            // cliente
            if (u.id_cliente) {

                const cliente = clientes.find(
                    c => c.id_cliente == u.id_cliente
                );

                nombreRelacion =
                    cliente?.nombre || "Cliente";

                funcion = "Cliente";
            }

            html += `
                <tr>

                    <td>${u.id_usuario}</td>

                    <td>${u.usuario}</td>

                    <td>${nombreRelacion}</td>

                    <td>${funcion}</td>

                    <td>${u.rol}</td>

                    <td class="acciones-tabla">

                        <button
                            class="btn-editar"
                            onclick="editar(${u.id_usuario})"
                        >
                            ✏️
                        </button>

                        <button
                            class="btn-eliminar"
                            onclick="eliminar(${u.id_usuario})"
                        >
                            🗑
                        </button>

                    </td>

                </tr>
            `;
        });

        document.getElementById("tablaUsuarios").innerHTML =
            html;

    } catch (error) {

        console.error(error);

        alert("Error al cargar usuarios");
    }
}

/* ==============================
   ABRIR MODAL
============================== */

function abrirModal() {

    idEditar = null;

    limpiar();

    document.getElementById("tituloModal").innerText =
        "Nuevo Usuario";

    document.getElementById("modalUsuario").style.display =
        "flex";

    cargarTrabajadores();

    cargarClientes();
}

/* ==============================
   CERRAR MODAL
============================== */

function cerrarModal() {

    document.getElementById("modalUsuario").style.display =
        "none";
}

/* ==============================
   LIMPIAR
============================== */

function limpiar() {

    document.getElementById("trabajador").value = "";

    document.getElementById("cliente").value = "";

    document.getElementById("usuario").value = "";

    document.getElementById("password").value = "";

    document.getElementById("rol").value = "";
}

/* ==============================
   CARGAR TRABAJADORES
============================== */

function cargarTrabajadores() {

    fetch(API_TRABAJADORES)

        .then(res => res.json())

        .then(data => {

            let html = `
                <option value="">
                    Seleccionar trabajador
                </option>
            `;

            data.forEach(t => {

                html += `
                    <option value="${t.id_trabajador}">
                        ${t.nombre}
                    </option>
                `;
            });

            document.getElementById("trabajador").innerHTML =
                html;
        });
}

/* ==============================
   CARGAR CLIENTES
============================== */

function cargarClientes() {

    fetch(API_CLIENTES)

        .then(res => res.json())

        .then(data => {

            let html = `
                <option value="">
                    Seleccionar cliente
                </option>
            `;

            data.forEach(c => {

                html += `
                    <option value="${c.id_cliente}">
                        ${c.nombre}
                    </option>
                `;
            });

            document.getElementById("cliente").innerHTML =
                html;
        });
}

/* ==============================
   GUARDAR
============================== */

function guardar() {

    const data = {

        id_trabajador:
            document.getElementById("trabajador").value || null,

        id_cliente:
            document.getElementById("cliente").value || null,

        usuario:
            document.getElementById("usuario").value,

        password:
            document.getElementById("password").value,

        rol:
            document.getElementById("rol").value
    };

    if (
        !data.usuario ||
        !data.password ||
        !data.rol
    ) {

        alert("Completa todos los campos");

        return;
    }

    if (
        !data.id_trabajador &&
        !data.id_cliente
    ) {

        alert(
            "Selecciona trabajador o cliente"
        );

        return;
    }

    const url =
        idEditar
            ? `${API_USUARIOS}/${idEditar}`
            : API_USUARIOS;

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

    .then(() => {

        alert(
            idEditar
                ? "Usuario actualizado"
                : "Usuario creado"
        );

        cerrarModal();

        cargarUsuarios();
    })

    .catch(error => {

        console.error(error);

        alert("Error al guardar");
    });
}

/* ==============================
   EDITAR
============================== */

function editar(id) {

    idEditar = id;

    cargarTrabajadores();

    cargarClientes();

    fetch(`${API_USUARIOS}/${id}`)

        .then(res => res.json())

        .then(u => {

            document.getElementById("trabajador").value =
                u.id_trabajador || "";

            document.getElementById("cliente").value =
                u.id_cliente || "";

            document.getElementById("usuario").value =
                u.usuario || "";

            document.getElementById("password").value =
                u.password || "";

            document.getElementById("rol").value =
                u.rol || "";

            document.getElementById("tituloModal").innerText =
                "Editar Usuario";

            document.getElementById("modalUsuario").style.display =
                "flex";
        });
}

/* ==============================
   ELIMINAR
============================== */

function eliminar(id) {

    if (!confirm("¿Eliminar usuario?")) return;

    fetch(`${API_USUARIOS}/${id}`, {

        method: "DELETE"

    })

    .then(() => {

        cargarUsuarios();
    });
}

/* ==============================
   INICIO
============================== */

window.onload = cargarUsuarios;