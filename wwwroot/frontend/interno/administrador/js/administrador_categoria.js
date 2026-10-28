// 🔥 API
const API = "/api/categorias";
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

// 📦 LISTA GLOBAL
let categorias = [];

// ✏️ ID EDITAR
let editId = null;


// 🚀 INICIO
window.onload = () => {

    cargarCategorias();
};


// 🚀 CARGAR CATEGORÍAS
function cargarCategorias() {

    fetch(API)

    .then(res => res.json())

    .then(data => {

        categorias = data;

        mostrarCategorias();
    })

    .catch(error => {

        console.error(error);

        alert(
            "Error al cargar categorías"
        );
    });
}


// 🔥 ABRIR MODAL
function abrirModal() {

    document.getElementById("modal")
    .style.display = "block";
}


// ❌ CERRAR MODAL
function cerrarModal() {

    document.getElementById("modal")
    .style.display = "none";

    limpiarFormulario();
}


// 💾 GUARDAR
function guardarCategoria() {

    let nombre =
    document.getElementById(
        "nombre_categoria"
    ).value;


    if (nombre === "") {

        alert(
            "El nombre es obligatorio"
        );

        return;
    }


    const data = {

        nombre: nombre
    };


    // ✏️ EDITAR
    if (editId !== null) {

        fetch(`${API}/${editId}`, {

            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify(data)

        })

        .then(res => res.json())

        .then(() => {

            cerrarModal();

            cargarCategorias();
        })

        .catch(error => {

            console.error(error);

            alert(
                "Error al actualizar"
            );
        });
    }


    // ➕ CREAR
    else {

        fetch(API, {

            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify(data)

        })

        .then(res => res.json())

        .then(() => {

            cerrarModal();

            cargarCategorias();
        })

        .catch(error => {

            console.error(error);

            alert(
                "Error al crear"
            );
        });
    }
}


// 📊 MOSTRAR TABLA
function mostrarCategorias() {

    let tabla =
    document.getElementById(
        "tablaCategorias"
    );

    tabla.innerHTML = "";


    categorias.forEach(cat => {

        tabla.innerHTML += `

            <tr>

                <td>
                    ${cat.id_categoria}
                </td>

                <td>
                    ${cat.nombre}
                </td>

                <td>

                    <button
                        class="btn-editar"
                        onclick="editarCategoria(${cat.id_categoria})"
                    >
                        ✏️
                    </button>

                    <button
                        class="btn-eliminar"
                        onclick="eliminarCategoria(${cat.id_categoria})"
                    >
                        🗑
                    </button>

                </td>

            </tr>
        `;
    });
}


// ✏️ EDITAR
function editarCategoria(id) {

    fetch(`${API}/${id}`)

    .then(res => res.json())

    .then(cat => {

        abrirModal();

        document.getElementById(
            "nombre_categoria"
        ).value = cat.nombre;

        editId = cat.id_categoria;
    })

    .catch(error => {

        console.error(error);

        alert(
            "Error al cargar categoría"
        );
    });
}


// 🗑 ELIMINAR
function eliminarCategoria(id) {

    if (
        !confirm(
            "¿Seguro que deseas eliminar esta categoría?"
        )
    ) {
        return;
    }


    fetch(`${API}/${id}`, {

        method: "DELETE"

    })

    .then(res => res.json())

    .then(() => {

        cargarCategorias();
    })

    .catch(error => {

        console.error(error);

        alert(
            "Error al eliminar"
        );
    });
}


// 🧹 LIMPIAR
function limpiarFormulario() {

    document.getElementById(
        "nombre_categoria"
    ).value = "";

    editId = null;
}