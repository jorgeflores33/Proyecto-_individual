// 🔥 APIs
const API_PEDIDOS =
"/api/pedidos";

const API_CLIENTES =
"/api/clientes";

const API_DETALLE =
"/api/detalle_pedidos";

const API_PRODUCTOS =
"/api/productos";


// 🔒 VALIDAR LOGIN
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


// 🚀 CARGAR PEDIDOS
async function cargarPedidos() {

    try {

        const [
            resPedidos,
            resClientes
        ] = await Promise.all([

            fetch(API_PEDIDOS),
            fetch(API_CLIENTES)
        ]);


        const pedidos =
        await resPedidos.json();

        const clientes =
        await resClientes.json();


        // 🔥 AGREGAR NOMBRE CLIENTE
        pedidos.forEach(p => {

            const cliente =
            clientes.find(c =>
                c.id_cliente === p.id_cliente
            );

            p.nombre_cliente =
            cliente
            ?
            cliente.nombre
            :
            "Cliente";
        });


        renderTabla(
            pedidos
        );
    }

    catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );

        alert(
            "Error al cargar pedidos"
        );
    }
}


// 🧠 RENDER TABLA
function renderTabla(data) {

    let html = "";


    if (!data.length) {

        html = `
            <tr>
                <td colspan="6">
                    No hay pedidos
                </td>
            </tr>
        `;
    }


    else {

        data.forEach(p => {

            html += `

                <tr>

                    <td>
                        ${p.folio || ""}
                    </td>

                    <td>
                        ${formatearFecha(p.fecha)}
                    </td>

                    <td>
                        ${p.nombre_cliente}
                    </td>

                    <td>
                        ${p.direccion || ""}
                    </td>

                    <td>
                        ${p.telefono || ""}
                    </td>

                    <td>

                        <button
                            onclick="verPDF(${p.id_pedido})"
                        >
                            👁
                        </button>

                        <button
                            onclick="generarPDF(${p.id_pedido})"
                        >
                            📄
                        </button>

                    </td>

                </tr>
            `;
        });
    }


    document.getElementById(
        "tablaPedidos"
    ).innerHTML = html;
}


// 🔍 FILTRO
document.getElementById(
    "buscador"
).addEventListener(
    "input",
    filtrar
);

document.getElementById(
    "filtroFecha"
).addEventListener(
    "change",
    filtrar
);


// 🔍 FILTRAR
async function filtrar() {

    const texto =
    document.getElementById(
        "buscador"
    ).value.toLowerCase();

    const fecha =
    document.getElementById(
        "filtroFecha"
    ).value;


    try {

        const [
            resPedidos,
            resClientes
        ] = await Promise.all([

            fetch(API_PEDIDOS),
            fetch(API_CLIENTES)
        ]);


        const pedidos =
        await resPedidos.json();

        const clientes =
        await resClientes.json();


        pedidos.forEach(p => {

            const cliente =
            clientes.find(c =>
                c.id_cliente === p.id_cliente
            );

            p.nombre_cliente =
            cliente
            ?
            cliente.nombre
            :
            "Cliente";
        });


        const filtrados =
        pedidos.filter(p =>

            (p.folio || "")
            .toLowerCase()
            .includes(texto)

            &&

            (
                !fecha
                ||
                (p.fecha || "")
                .includes(fecha)
            )
        );


        renderTabla(
            filtrados
        );
    }

    catch (error) {

        console.error(error);
    }
}


// 📄 VER MODAL PDF
async function verPDF(id) {

    try {

        const [
            resPedido,
            resDetalle,
            resProductos,
            resClientes
        ] = await Promise.all([

            fetch(`${API_PEDIDOS}/${id}`),
            fetch(API_DETALLE),
            fetch(API_PRODUCTOS),
            fetch(API_CLIENTES)
        ]);


        const p =
        await resPedido.json();

        const detalles =
        await resDetalle.json();

        const productos =
        await resProductos.json();

        const clientes =
        await resClientes.json();


        // 🔥 CLIENTE
        const cliente =
        clientes.find(c =>
            c.id_cliente === p.id_cliente
        );


        // 🔥 DETALLES PEDIDO
        const detallePedido =
        detalles.filter(d =>
            d.id_pedido === p.id_pedido
        );


        // 🔥 DATOS PDF
        document.getElementById(
            "pdfFolio"
        ).innerText =
        p.folio || "";

        document.getElementById(
            "pdfCliente"
        ).innerText =
        cliente
        ?
        cliente.nombre
        :
        "Cliente";

        document.getElementById(
            "pdfDireccion"
        ).innerText =
        p.direccion || "";

        document.getElementById(
            "pdfTelefono"
        ).innerText =
        p.telefono || "";

        document.getElementById(
            "pdfFecha"
        ).innerText =
        formatearFecha(
            p.fecha
        );


        // 🔥 TABLA DETALLE
        let detalleHTML = "";


        detallePedido.forEach(d => {

            const producto =
            productos.find(prod =>
                prod.id_producto === d.id_producto
            );


            detalleHTML += `

                <tr>

                    <td>
                        ${
                            producto
                            ?
                            producto.nombre
                            :
                            "Producto"
                        }
                    </td>

                    <td>
                        ${d.cantidad}
                    </td>

                    <td>
                        $${d.precio_unitario}
                    </td>

                    <td>
                        $${d.subtotal}
                    </td>

                </tr>
            `;
        });


        document.getElementById(
            "pdfDetalle"
        ).innerHTML =
        detalleHTML;


        // 🔥 MOSTRAR MODAL
        document.getElementById(
            "modalPDF"
        ).style.display =
        "flex";
    }

    catch (error) {

        console.error(error);

        alert(
            "Error al cargar pedido"
        );
    }
}


// 📄 GENERAR PDF REAL
async function generarPDF(id) {

    try {

        const res =
        await fetch(

            `${API_PEDIDOS}/${id}/pdf`,

            {
                method: "POST"
            }
        );


        const data =
        await res.json();


        if (data.ok) {

            alert(
                "✔ PDF generado correctamente"
            );

            // 🔥 OPCIONAL ABRIR PDF
            if (data.url) {

                window.open(

                    `/api/${data.url}`,

                    "_blank"
                );
            }
        }

        else {

            alert(
                "❌ Error al generar PDF"
            );
        }
    }

    catch (error) {

        console.error(error);

        alert(
            "Error de conexión con backend"
        );
    }
}


// ❌ CERRAR MODAL
function cerrarModal() {

    document.getElementById(
        "modalPDF"
    ).style.display =
    "none";
}


// 🖨 IMPRIMIR
function imprimir() {

    window.print();
}


// 📅 FORMATO FECHA
function formatearFecha(fecha) {

    if (!fecha) {

        return "";
    }

    return new Date(
        fecha
    ).toLocaleString();
}


// 🚀 INIT
window.onload =
cargarPedidos;