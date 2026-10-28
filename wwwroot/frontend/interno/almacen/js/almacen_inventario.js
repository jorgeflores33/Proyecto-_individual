// 🔥 APIs
const API_INVENTARIOS =
"/api/inventarios/";

const API_DETALLE =
"/api/detalle-inventarios/";

const API_SUCURSALES =
"/api/sucursales/";

const API_CATEGORIAS =
"/api/categorias/";

const API_PRODUCTOS =
"/api/productos/";

const API_PRODUCTOS_SUCURSAL =
"/api/productos-sucursal/";


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



// 🚀 CARGAR INVENTARIOS
async function cargarInventarios() {

    try {

        const [

            resInventarios,

            resSucursales,

            resCategorias

        ] = await Promise.all([

            fetch(API_INVENTARIOS),

            fetch(API_SUCURSALES),

            fetch(API_CATEGORIAS)
        ]);


        const inventarios =
        await resInventarios.json();

        const sucursales =
        await resSucursales.json();

        const categorias =
        await resCategorias.json();


        let html = "";


        // ❌ SIN DATOS
        if (!inventarios.length) {

            html = `

                <tr>

                    <td colspan="5">
                        Sin inventarios
                    </td>

                </tr>
            `;
        }


        // ✅ CON DATOS
        else {

            inventarios.forEach(i => {

                const sucursal =
                sucursales.find(s =>

                    Number(s.id_sucursal)
                    ===
                    Number(i.id_sucursal)
                );


                const categoria =
                categorias.find(c =>

                    Number(c.id_categoria)
                    ===
                    Number(i.id_categoria)
                );


                html += `

                    <tr>

                        <td>
                            ${i.folio || ""}
                        </td>

                        <td>
                            ${
                                sucursal
                                ?
                                sucursal.nombre
                                :
                                ""
                            }
                        </td>

                        <td>
                            ${
                                categoria
                                ?
                                categoria.nombre
                                :
                                ""
                            }
                        </td>

                        <td>
                            ${formatearFecha(i.fecha)}
                        </td>

                        <td>

                            <button
                                onclick="imprimir(${i.id_inventario})"
                            >
                                🧾
                            </button>

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaInventarios"
        ).innerHTML = html;
    }

    catch (error) {

        console.error(error);

        alert(
            "Error al cargar inventarios"
        );
    }
}



// 🔥 ABRIR MODAL
function abrirModal() {

    document.getElementById(
        "modal"
    ).style.display = "flex";

    cargarSelects();
}



// ❌ CERRAR
function cerrarModal() {

    document.getElementById(
        "modal"
    ).style.display = "none";

    document.getElementById(
        "tablaProductos"
    ).innerHTML = "";
}



// 🔄 CARGAR SELECTS
async function cargarSelects() {

    try {

        const [

            resSucursales,

            resCategorias

        ] = await Promise.all([

            fetch(API_SUCURSALES),

            fetch(API_CATEGORIAS)
        ]);


        const sucursales =
        await resSucursales.json();

        const categorias =
        await resCategorias.json();


        // 🔥 SUCURSALES
        let htmlSucursales = `

            <option value="">
                Sucursal
            </option>
        `;


        sucursales.forEach(s => {

            htmlSucursales += `

                <option value="${s.id_sucursal}">

                    ${s.nombre}

                </option>
            `;
        });


        document.getElementById(
            "sucursal"
        ).innerHTML = htmlSucursales;


        // 🔥 CATEGORÍAS
        let htmlCategorias = `

            <option value="">
                Categoría
            </option>
        `;


        categorias.forEach(c => {

            htmlCategorias += `

                <option value="${c.id_categoria}">

                    ${c.nombre}

                </option>
            `;
        });


        document.getElementById(
            "categoria"
        ).innerHTML = htmlCategorias;
    }

    catch (error) {

        console.error(error);
    }
}



// 🔥 EVENTOS
document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "categoria"
        ).addEventListener(
            "change",
            cargarProductosCategoria
        );

        document.getElementById(
            "sucursal"
        ).addEventListener(
            "change",
            cargarProductosCategoria
        );
    }
);



// 📦 PRODUCTOS
async function cargarProductosCategoria() {

    const categoria =
    document.getElementById(
        "categoria"
    ).value;

    const sucursal =
    document.getElementById(
        "sucursal"
    ).value;


    if (
        !categoria
        ||
        !sucursal
    ) {

        return;
    }


    try {

        const [

            resProductos,

            resProductosSucursal

        ] = await Promise.all([

            fetch(API_PRODUCTOS),

            fetch(API_PRODUCTOS_SUCURSAL)
        ]);


        const productos =
        await resProductos.json();

        const productosSucursal =
        await resProductosSucursal.json();


        // 🔥 FILTRAR
        const filtrados =
        productos.filter(p =>

            Number(p.id_categoria)
            ===
            Number(categoria)
        );


        let html = "";


        filtrados.forEach(p => {

            const existencia =
            productosSucursal.find(ps =>

                Number(ps.id_producto)
                ===
                Number(p.id_producto)

                &&

                Number(ps.id_sucursal)
                ===
                Number(sucursal)
            );


            const sistema =
            existencia
            ?
            existencia.existencia
            :
            0;


            html += `

                <tr>

                    <td>
                        ${p.codigo || ""}
                    </td>

                    <td>
                        ${p.nombre || ""}
                    </td>

                    <td id="sistema-${p.id_producto}">
                        ${sistema}
                    </td>

                    <td>

                        <input

                            type="number"

                            id="fisico-${p.id_producto}"

                            min="0"

                            value="${sistema}"

                            onkeyup="
                                calcularDiferencia(${p.id_producto})
                            "
                        >

                    </td>

                    <td
                        id="diferencia-${p.id_producto}"
                    >
                        0
                    </td>

                </tr>
            `;
        });


        document.getElementById(
            "tablaProductos"
        ).innerHTML = html;
    }

    catch (error) {

        console.error(error);

        alert(
            "Error al cargar productos"
        );
    }
}



// ➖ DIFERENCIA
function calcularDiferencia(id) {

    const sistema =
    parseInt(

        document.getElementById(
            `sistema-${id}`
        ).innerText

    ) || 0;


    const fisico =
    parseInt(

        document.getElementById(
            `fisico-${id}`
        ).value

    ) || 0;


    const diferencia =
    fisico - sistema;


    document.getElementById(
        `diferencia-${id}`
    ).innerText = diferencia;
}



// 💾 GUARDAR
async function guardar() {

    const sucursal =
    document.getElementById(
        "sucursal"
    ).value;

    const categoria =
    document.getElementById(
        "categoria"
    ).value;


    if (
        !sucursal
        ||
        !categoria
    ) {

        alert(
            "Selecciona sucursal y categoría"
        );

        return;
    }


    try {

        // 🔥 CREAR INVENTARIO
        const invRes =
        await fetch(API_INVENTARIOS, {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                folio:
                "INV-" + Date.now(),

                id_sucursal:
                parseInt(sucursal),

                id_categoria:
                parseInt(categoria)
            })
        });


        const inv =
        await invRes.json();


        // 🔥 FILAS
        const filas =
        document.querySelectorAll(
            "#tablaProductos tr"
        );


        // 🔥 GUARDAR DETALLES
        for (const f of filas) {

            const input =
            f.querySelector("input");


            const id_producto =
            input.id.split("-")[1];


            const existencia_fisica =
            parseInt(input.value) || 0;


            const existencia_sistema =
            parseInt(

                document.getElementById(
                    `sistema-${id_producto}`
                ).innerText

            ) || 0;


            const diferencia =
            existencia_fisica
            -
            existencia_sistema;


            await fetch(API_DETALLE, {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    id_inventario:
                    inv.id_inventario,

                    id_producto:
                    parseInt(id_producto),

                    existencia_sistema:
                    existencia_sistema,

                    existencia_fisica:
                    existencia_fisica,

                    diferencia:
                    diferencia
                })
            });
        }


        alert(
            "Inventario guardado correctamente"
        );

        cerrarModal();

        cargarInventarios();
    }

    catch (error) {

        console.error(error);

        alert(
            "Error al guardar inventario"
        );
    }
}



// 🧾 IMPRIMIR
async function imprimir(id) {

    const resInventario =
    await fetch(
        `${API_INVENTARIOS}${id}`
    );

    const inventario =
    await resInventario.json();


    const resDetalles =
    await fetch(
        `${API_DETALLE}inventario/${id}`
    );

    const detalles =
    await resDetalles.json();


    let filas = "";


    detalles.forEach(d => {

        filas += `

            <tr>

                <td>
                    ${d.codigo || ""}
                </td>

                <td>
                    ${d.producto || ""}
                </td>

                <td>
                    ${d.existencia_sistema}
                </td>

                <td>
                    ${d.existencia_fisica}
                </td>

                <td>
                    ${d.diferencia}
                </td>

            </tr>
        `;
    });


    const ventana =
    window.open("", "_blank");


    ventana.document.write(`

        <html>

        <head>

            <title>
                Inventario
            </title>

            <style>

                body {

                    font-family: Arial;

                    padding: 20px;
                }

                h2 {

                    text-align: center;
                }

                table {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 20px;
                }

                th, td {

                    border: 1px solid black;

                    padding: 8px;

                    text-align: center;
                }

            </style>

        </head>

        <body>

            <h2>
                INVENTARIO FÍSICO
            </h2>

            <p>
                <strong>Folio:</strong>
                ${inventario.folio}
            </p>

            <p>
                <strong>Fecha:</strong>
                ${formatearFecha(inventario.fecha)}
            </p>

            <table>

                <thead>

                    <tr>

                        <th>
                            Código
                        </th>

                        <th>
                            Producto
                        </th>

                        <th>
                            Sistema
                        </th>

                        <th>
                            Física
                        </th>

                        <th>
                            Diferencia
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${filas}

                </tbody>

            </table>

        </body>

        </html>
    `);

    ventana.document.close();

    ventana.print();
}



// 📅 FECHA
function formatearFecha(fecha) {

    if (!fecha) {

        return "";
    }

    return new Date(
        fecha
    ).toLocaleString();
}

// 📂 CARGAR FILTRO CATEGORÍAS
async function cargarFiltroCategorias() {

    try {

        const response =
        await fetch(API_CATEGORIAS);

        const categorias =
        await response.json();


        let html = `

            <option value="">
                Todas las categorías
            </option>
        `;


        categorias.forEach(c => {

            html += `

                <option value="${c.id_categoria}">

                    ${c.nombre}

                </option>
            `;
        });


        document.getElementById(
            "filtroCategoria"
        ).innerHTML = html;
    }

    catch(error) {

        console.error(error);
    }
}

// 🚀 INIT
window.onload = () => {

    cargarInventarios();

    cargarFiltroCategorias();


    // 🔍 EVENTOS
    document.getElementById(
        "buscador"
    ).addEventListener(
        "keyup",
        filtrarInventarios
    );


    document.getElementById(
        "filtroFecha"
    ).addEventListener(
        "change",
        filtrarInventarios
    );


    document.getElementById(
        "filtroCategoria"
    ).addEventListener(
        "change",
        filtrarInventarios
    );
};
// 🔍 FILTRAR INVENTARIOS
function filtrarInventarios() {

    const texto =
    document.getElementById(
        "buscador"
    ).value.toLowerCase();


    const fecha =
    document.getElementById(
        "filtroFecha"
    ).value;


    const categoria =
    document.getElementById(
        "filtroCategoria"
    ).value;


    const filas =
    document.querySelectorAll(
        "#tablaInventarios tr"
    );


    filas.forEach(fila => {

        const celdas =
        fila.querySelectorAll("td");


        if (celdas.length === 0) {

            return;
        }


        const folio =
        celdas[0]
        .innerText
        .toLowerCase();


        const categoriaTexto =
        celdas[2]
        .innerText
        .toLowerCase();


        const fechaTexto =
        celdas[3]
        .innerText;


        // 🔥 VALIDAR FECHA
        let coincideFecha = true;

        if (fecha) {

            const fechaFila =
            new Date(fechaTexto);

            const yyyy =
            fechaFila.getFullYear();

            const mm =
            String(
                fechaFila.getMonth() + 1
            ).padStart(2, "0");

            const dd =
            String(
                fechaFila.getDate()
            ).padStart(2, "0");

            const fechaFormateada =
            `${yyyy}-${mm}-${dd}`;

            coincideFecha =
            fechaFormateada === fecha;
        }


        // 🔥 VALIDAR CATEGORÍA
        let coincideCategoria = true;

        if (categoria) {

            coincideCategoria =
            categoriaTexto.includes(

                document
                .getElementById(
                    "filtroCategoria"
                )
                .selectedOptions[0]
                .text
                .toLowerCase()
            );
        }


        // 🔥 VALIDAR BUSCADOR
        const coincideTexto =
        folio.includes(texto);


        // 🔥 MOSTRAR / OCULTAR
        if (

            coincideTexto
            &&
            coincideFecha
            &&
            coincideCategoria

        ) {

            fila.style.display = "";
        }

        else {

            fila.style.display = "none";
        }
    });
}