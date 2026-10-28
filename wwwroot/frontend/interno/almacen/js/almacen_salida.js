const API_PRODUCTOS =
"/api/productos";

const API_SUCURSALES =
"/api/sucursales";

const API_PRODUCTOS_SUCURSAL =
"/api/productos-sucursal";

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

// ===============================
// INIT
// ===============================
window.onload = () => {

    cargarTabla();

    cargarProductos();

    cargarSucursales();
};



// ===============================
// TABLA
// ===============================
async function cargarTabla() {

    const res = await fetch(
        API_PRODUCTOS_SUCURSAL
    );

    const data = await res.json();

    const productosRes = await fetch(
        API_PRODUCTOS
    );

    const productos = await productosRes.json();

    const sucursalesRes = await fetch(
        API_SUCURSALES
    );

    const sucursales = await sucursalesRes.json();

    const tabla =
    document.getElementById(
        "tablaRegistros"
    );

    tabla.innerHTML = "";


    data.forEach(item => {

        const producto =
        productos.find(p =>
            p.id_producto === item.id_producto
        );

        const sucursal =
        sucursales.find(s =>
            s.id_sucursal === item.id_sucursal
        );

        tabla.innerHTML += `
            <tr>

                <td>
                    ${producto
                        ? producto.nombre
                        : "N/A"}
                </td>

                <td>
                    ${sucursal
                        ? sucursal.nombre
                        : "N/A"}
                </td>

                <td>
                    ${item.existencia}
                </td>

            </tr>
        `;
    });
}



// ===============================
// PRODUCTOS
// ===============================
async function cargarProductos() {

    const res = await fetch(
        API_PRODUCTOS
    );

    const data = await res.json();

    const select =
    document.getElementById(
        "producto"
    );

    data.forEach(producto => {

        select.innerHTML += `
            <option value="${producto.id_producto}">
                ${producto.nombre}
            </option>
        `;
    });
}



// ===============================
// SUCURSALES
// ===============================
async function cargarSucursales() {

    const res = await fetch(
        API_SUCURSALES
    );

    const data = await res.json();

    const select =
    document.getElementById(
        "sucursal"
    );

    data.forEach(sucursal => {

        select.innerHTML += `
            <option value="${sucursal.id_sucursal}">
                ${sucursal.nombre}
            </option>
        `;
    });
}



// ===============================
// MODAL
// ===============================
function abrirModal() {

    document.getElementById(
        "modalSalida"
    ).style.display = "flex";
}


function cerrarModal() {

    document.getElementById(
        "modalSalida"
    ).style.display = "none";
}



// ===============================
// GUARDAR SALIDA
// ===============================
async function guardar() {

    const id_producto =
    document.getElementById(
        "producto"
    ).value;

    const id_sucursal =
    document.getElementById(
        "sucursal"
    ).value;

    const cantidad =
    parseInt(
        document.getElementById(
            "cantidad"
        ).value
    );


    if (
        !id_producto ||
        !id_sucursal ||
        !cantidad
    ) {

        alert(
            "Completa todos los campos"
        );

        return;
    }


    // OBTENER EXISTENCIA
    const res = await fetch(
        `${API_PRODUCTOS_SUCURSAL}/${id_producto}/${id_sucursal}`
    );

    const registro = await res.json();


    if (!registro) {

        alert(
            "No existe inventario"
        );

        return;
    }


    // VALIDAR STOCK
    if (
        cantidad >
        registro.existencia
    ) {

        alert(
            "Stock insuficiente"
        );

        return;
    }


    // NUEVA EXISTENCIA
    const nuevaExistencia =
    registro.existencia - cantidad;


    // UPDATE
    const respuestaGuardado = await fetch(
        `${API_PRODUCTOS_SUCURSAL}/${id_producto}/${id_sucursal}`,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                existencia:
                nuevaExistencia
            })
        }
    );


    if (!respuestaGuardado.ok) { alert("Stock insuficiente o error del servidor"); return; }

    alert(
        "Salida registrada correctamente"
    );

    cerrarModal();

    cargarTabla();
}



// ===============================
// UTILIDADES
// ===============================
function ir(ruta) {

    window.location.href = ruta;
}


function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}