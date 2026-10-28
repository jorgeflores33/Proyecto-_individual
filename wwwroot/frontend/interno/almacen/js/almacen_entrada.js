// APIs
const API_PRODUCTOS =
"/api/productos/";

const API_SUCURSALES =
"/api/sucursales/";

const API_PRODUCTOS_SUCURSAL =
"/api/productos-sucursal/";


// LISTAS
let listaProductos = [];
let listaSucursales = [];
let listaRegistros = [];


// LOGIN
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

// NAVEGAR
function ir(pagina) {

    window.location.href = pagina;
}


// CARGAR DATOS
async function cargarDatos() {

    try {

        const resProductos =
        await fetch(API_PRODUCTOS);

        const resSucursales =
        await fetch(API_SUCURSALES);

        const resRegistros =
        await fetch(API_PRODUCTOS_SUCURSAL);


        listaProductos =
        await resProductos.json();

        listaSucursales =
        await resSucursales.json();

        listaRegistros =
        await resRegistros.json();


        cargarProductos();

        cargarSucursales();

        cargarTabla();

    }

    catch (error) {

        console.error(error);

        alert(
            "Error cargando datos"
        );
    }
}


// PRODUCTOS
function cargarProductos() {

    let html = `

        <option value="">
            Seleccionar producto
        </option>
    `;


    listaProductos.forEach(p => {

        html += `

            <option value="${p.id_producto}">
                ${p.nombre}
            </option>
        `;
    });


    document.getElementById(
        "producto"
    ).innerHTML = html;
}


// SUCURSALES
function cargarSucursales() {

    let html = `

        <option value="">
            Seleccionar sucursal
        </option>
    `;


    listaSucursales.forEach(s => {

        html += `

            <option value="${s.id_sucursal}">
                ${s.nombre}
            </option>
        `;
    });


    document.getElementById(
        "sucursal"
    ).innerHTML = html;
}


// TABLA
function cargarTabla() {

    let html = "";


    if (!listaRegistros.length) {

        html = `

            <tr>

                <td colspan="3">
                    No hay entradas
                </td>

            </tr>
        `;
    }

    else {

        listaRegistros.forEach(r => {

            const producto =
            listaProductos.find(p =>

                Number(p.id_producto)
                ===
                Number(r.id_producto)
            );


            const sucursal =
            listaSucursales.find(s =>

                Number(s.id_sucursal)
                ===
                Number(r.id_sucursal)
            );


            html += `

                <tr>

                    <td>
                        ${producto ? producto.nombre : ""}
                    </td>

                    <td>
                        ${sucursal ? sucursal.nombre : ""}
                    </td>

                    <td>
                        ${r.existencia}
                    </td>

                </tr>
            `;
        });
    }


    document.getElementById(
        "tablaRegistros"
    ).innerHTML = html;
}


// ABRIR MODAL
function abrirModal() {

    limpiar();

    document.getElementById(
        "modalEntrada"
    ).style.display = "flex";
}


// CERRAR MODAL
function cerrarModal() {

    document.getElementById(
        "modalEntrada"
    ).style.display = "none";
}


// LIMPIAR
function limpiar() {

    document.getElementById(
        "producto"
    ).value = "";

    document.getElementById(
        "sucursal"
    ).value = "";

    document.getElementById(
        "cantidad"
    ).value = "";
}


// GUARDAR
async function guardar() {

    try {

        const id_producto =
        document.getElementById(
            "producto"
        ).value;


        const id_sucursal =
        document.getElementById(
            "sucursal"
        ).value;


        const cantidad =
        Number(
            document.getElementById(
                "cantidad"
            ).value
        );


        // VALIDAR
        if (
            !id_producto
            ||
            !id_sucursal
            ||
            cantidad <= 0
        ) {

            alert(
                "Completa los datos"
            );

            return;
        }


        // BUSCAR EXISTENCIA
        const resExistencia =
        await fetch(
            `${API_PRODUCTOS_SUCURSAL}/${id_producto}/${id_sucursal}`
        );


        // EXISTE
        if (resExistencia.ok) {

            const data =
            await resExistencia.json();


            const nuevaExistencia =

                Number(data.existencia)
                +
                cantidad;


            // UPDATE
            const respuestaGuardado = await fetch(
                `${API_PRODUCTOS_SUCURSAL}/${id_producto}/${id_sucursal}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify({

                        existencia:
                        nuevaExistencia
                    })
                }
            );
            if (!respuestaGuardado.ok) throw new Error("El servidor rechazó la entrada de inventario");
        }

        // NO EXISTE
        else {

            const respuestaGuardado = await fetch(
                API_PRODUCTOS_SUCURSAL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify({

                        id_producto:
                        parseInt(id_producto),

                        id_sucursal:
                        parseInt(id_sucursal),

                        existencia:
                        cantidad
                    })
                }
            );
            if (!respuestaGuardado.ok) throw new Error("El servidor rechazó la entrada de inventario");
        }


        alert(
            "Entrada registrada correctamente"
        );


        cerrarModal();

        cargarDatos();

    }

    catch (error) {

        console.error(error);

        alert(
            "Error al guardar"
        );
    }
}


// INICIO
window.onload =
cargarDatos;