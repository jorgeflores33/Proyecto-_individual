// 🔥 APIs
const API_PRODUCTOS =
"/api/productos/";

const API_CATEGORIAS =
"/api/categorias/";


// 📦 LISTA GLOBAL
let listaProductos = [];


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


// 🚀 NAVEGAR
function ir(pagina) {

    window.location.href = pagina;
}


// 🚀 CARGAR PRODUCTOS
async function cargarProductos() {

    try {

        const resProductos =
        await fetch(API_PRODUCTOS);

        const resCategorias =
        await fetch(API_CATEGORIAS);


        // 🔥 VALIDAR
        if (!resProductos.ok) {

            throw new Error(
                "Falló API PRODUCTOS"
            );
        }

        if (!resCategorias.ok) {

            throw new Error(
                "Falló API CATEGORIAS"
            );
        }


        // 🔥 JSON
        const productos =
        await resProductos.json();

        const categorias =
        await resCategorias.json();


        // 🔥 COMBINAR
        productos.forEach(p => {

            const categoria =
            categorias.find(c =>

                Number(c.id_categoria)
                ===
                Number(p.id_categoria)
            );

            p.nombre_categoria =
            categoria
            ?
            categoria.nombre
            :
            "Sin categoría";
        });


        listaProductos =
        productos;

        renderizar(
            productos
        );

        cargarCategorias();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// 🔥 CARGAR CATEGORIAS
async function cargarCategorias() {

    try {

        const res =
        await fetch(API_CATEGORIAS);

        const data =
        await res.json();


        let html = `
            <option value="">
                Seleccionar categoría
            </option>
        `;


        data.forEach(c => {

            html += `
                <option value="${c.id_categoria}">
                    ${c.nombre}
                </option>
            `;
        });


        document.getElementById(
            "categoria"
        ).innerHTML = html;

    }

    catch (error) {

        console.error(error);
    }
}


// 🔍 BUSCADOR
document.getElementById(
    "buscador"
)?.addEventListener(
    "input",
    function () {

        const texto =
        this.value.toLowerCase();


        const filtrados =
        listaProductos.filter(p =>

            (p.nombre || "")
            .toLowerCase()
            .includes(texto)

            ||

            (p.codigo || "")
            .toLowerCase()
            .includes(texto)

            ||

            (p.nombre_categoria || "")
            .toLowerCase()
            .includes(texto)
        );


        renderizar(
            filtrados
        );
    }
);


// 🧠 RENDER
function renderizar(data) {

    let html = "";


    if (!data.length) {

        html = `
            <tr>
                <td colspan="6">
                    Sin productos
                </td>
            </tr>
        `;
    }

    else {

        data.forEach(p => {

            html += `

                <tr>

                    <td>${p.codigo || ""}</td>

                    <td>${p.nombre || ""}</td>

                    <td>$${p.precio || 0}</td>

                    <td>${p.nombre_categoria}</td>

                    <td>

                        <img
                            src="${p.imagen_url || ''}"
                            width="50"
                        >

                    </td>

                    <td>

                        <button
                            onclick="editar(${p.id_producto})"
                        >
                            ✏️
                        </button>

                        <button
                            onclick="eliminar(${p.id_producto})"
                        >
                            🗑
                        </button>

                    </td>

                </tr>
            `;
        });
    }


    document.getElementById(
        "tablaProductos"
    ).innerHTML = html;
}


// 🔥 ABRIR MODAL
function abrirModal() {

    limpiar();

    document.getElementById(
        "modalProducto"
    ).style.display = "flex";
}


// ❌ CERRAR MODAL
function cerrarModal() {

    document.getElementById(
        "modalProducto"
    ).style.display = "none";
}


// 🧹 LIMPIAR
function limpiar() {

    document.getElementById(
        "id"
    ).value = "";

    document.getElementById(
        "codigo"
    ).value = "";

    document.getElementById(
        "nombre"
    ).value = "";

    document.getElementById(
        "descripcion"
    ).value = "";

    document.getElementById(
        "precio"
    ).value = "";

    document.getElementById(
        "imagen"
    ).value = "";

    document.getElementById(
        "preview"
    ).src = "";

    document.getElementById(
        "categoria"
    ).value = "";
}


// 👁 PREVIEW
document.getElementById(
    "imagen"
)?.addEventListener(
    "input",
    function () {

        document.getElementById(
            "preview"
        ).src = this.value;
    }
);


// 💾 GUARDAR PRODUCTO
async function guardarProducto() {

    const id =
    document.getElementById(
        "id"
    ).value;


    const data = {

        codigo:
        document.getElementById(
            "codigo"
        ).value,

        nombre:
        document.getElementById(
            "nombre"
        ).value,

        descripcion:
        document.getElementById(
            "descripcion"
        ).value,

        precio:
        parseFloat(
            document.getElementById(
                "precio"
            ).value
        ),

        imagen_url:
        document.getElementById(
            "imagen"
        ).value,

        id_categoria:
        parseInt(
            document.getElementById(
                "categoria"
            ).value
        )
    };


    // 🔥 VALIDAR
    if (
        !data.codigo
        ||
        !data.nombre
    ) {

        alert(
            "Completa los campos obligatorios"
        );

        return;
    }


    const url =
    id
    ?
    `${API_PRODUCTOS}${id}`
    :
    API_PRODUCTOS;


    const method =
    id
    ?
    "PUT"
    :
    "POST";


    try {

        const res =
        await fetch(url, {

            method: method,

            headers: {
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(data)
        });


        if (!res.ok) {

            const error =
            await res.text();

            alert(error);

            return;
        }


        cerrarModal();

        cargarProductos();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// ✏️ EDITAR
async function editar(id) {

    try {

        const res =
        await fetch(
            `${API_PRODUCTOS}${id}`
        );

        const p =
        await res.json();


        document.getElementById(
            "id"
        ).value =
        p.id_producto;

        document.getElementById(
            "codigo"
        ).value =
        p.codigo || "";

        document.getElementById(
            "nombre"
        ).value =
        p.nombre || "";

        document.getElementById(
            "descripcion"
        ).value =
        p.descripcion || "";

        document.getElementById(
            "precio"
        ).value =
        p.precio || "";

        document.getElementById(
            "imagen"
        ).value =
        p.imagen_url || "";

        document.getElementById(
            "categoria"
        ).value =
        p.id_categoria || "";


        document.getElementById(
            "preview"
        ).src =
        p.imagen_url || "";


        document.getElementById(
            "modalProducto"
        ).style.display =
        "flex";
    }

    catch (error) {

        console.error(error);

        alert(
            "Error al cargar producto"
        );
    }
}


// 🗑 ELIMINAR
async function eliminar(id) {

    if (
        !confirm(
            "¿Eliminar producto?"
        )
    ) {
        return;
    }


    try {

        const res =
        await fetch(
            `${API_PRODUCTOS}${id}`,
            {
                method: "DELETE"
            }
        );


        if (!res.ok) {

            const error =
            await res.text();

            alert(error);

            return;
        }


        cargarProductos();

    }

    catch (error) {

        console.error(error);

        alert(
            "Error al eliminar producto"
        );
    }
}


// 🚀 INICIO
window.onload =
cargarProductos;