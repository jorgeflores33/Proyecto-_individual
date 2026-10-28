const API_TRASPASOS =
"/api/traspasos/";

const API_DETALLE =
"/api/detalle-traspasos/";

const API_PRODUCTOS =
"/api/productos/";

const API_SUCURSALES =
"/api/sucursales/";

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
// ======================================
// INIT
// ======================================
window.onload = () => {

    cargarTabla();

    cargarSucursales();

    generarFolio();

    agregarProducto();
};



// ======================================
// GENERAR FOLIO
// ======================================
function generarFolio() {

    document.getElementById(
        "folio"
    ).value =
    "TRS-" + Date.now();
}



// ======================================
// TABLA
// ======================================
async function cargarTabla() {

    const res =
    await fetch(API_TRASPASOS);

    const traspasos =
    await res.json();

    const sucRes =
    await fetch(API_SUCURSALES);

    const sucursales =
    await sucRes.json();

    const tabla =
    document.getElementById(
        "tablaTraspasos"
    );

    tabla.innerHTML = "";


    traspasos.forEach(t => {

        const origen =
        sucursales.find(s =>
            s.id_sucursal ==
            t.id_sucursal_origen
        );

        const destino =
        sucursales.find(s =>
            s.id_sucursal ==
            t.id_sucursal_destino
        );

        tabla.innerHTML += `

            <tr>

                <td>
                    TRS-${t.id_traspaso}
                </td>

                <td>
                    ${
                        new Date(
                            t.fecha
                        ).toLocaleString()
                    }
                </td>

                <td>
                    ${origen?.nombre || "N/A"}
                </td>

                <td>
                    ${destino?.nombre || "N/A"}
                </td>

                <td>

                    <button onclick="imprimir(${t.id_traspaso})">
                        🖨
                    </button>

                    <button onclick="eliminar(${t.id_traspaso})">
                        🗑
                    </button>

                </td>

            </tr>
        `;
    });
}



// ======================================
// SUCURSALES
// ======================================
async function cargarSucursales() {

    const res =
    await fetch(API_SUCURSALES);

    const data =
    await res.json();

    const origen =
    document.getElementById("origen");

    const destino =
    document.getElementById("destino");

    origen.innerHTML =
    `<option value="">Sucursal origen</option>`;

    destino.innerHTML =
    `<option value="">Sucursal destino</option>`;


    data.forEach(s => {

        origen.innerHTML += `
            <option value="${s.id_sucursal}">
                ${s.nombre}
            </option>
        `;

        destino.innerHTML += `
            <option value="${s.id_sucursal}">
                ${s.nombre}
            </option>
        `;
    });
}



// ======================================
// AGREGAR PRODUCTO
// ======================================
async function agregarProducto() {

    const res =
    await fetch(API_PRODUCTOS);

    const productos =
    await res.json();

    const div =
    document.createElement("div");

    div.className = "producto";


    div.innerHTML = `

        <div class="buscador-container">

            <input
                type="text"
                class="buscarProducto"
                placeholder="Buscar por código o nombre"
            >

            <div class="resultados"></div>

        </div>

        <input
            type="number"
            class="cantidadInput"
            placeholder="Cantidad"
        >

        <button onclick="this.parentNode.remove()">
            ❌
        </button>
    `;


    document.getElementById(
        "productos"
    ).appendChild(div);


    // INPUT
    const input =
    div.querySelector(
        ".buscarProducto"
    );

    const resultados =
    div.querySelector(
        ".resultados"
    );


    // BUSCAR
    input.addEventListener(
        "input",
        () => {

            const texto =
            input.value.toLowerCase();

            resultados.innerHTML = "";


            if (texto.length < 1)
                return;


            const filtrados =
            productos.filter(p =>

                p.nombre
                .toLowerCase()
                .includes(texto)

                ||

                p.codigo
                .toLowerCase()
                .includes(texto)
            );


            filtrados.forEach(p => {

                const item =
                document.createElement("div");

                item.className =
                "resultado-item";

                item.innerHTML = `
                    <strong>
                        ${p.codigo}
                    </strong>
                    -
                    ${p.nombre}
                `;


                item.onclick = () => {

                    input.value =
                    `${p.codigo} - ${p.nombre}`;

                    input.dataset.id =
                    p.id_producto;

                    resultados.innerHTML = "";
                };

                resultados.appendChild(item);
            });
        }
    );
}



// ======================================
// GUARDAR
// ======================================
async function guardar() {
    const origen = parseInt(document.getElementById("origen").value);
    const destino = parseInt(document.getElementById("destino").value);
    if (!origen || !destino || origen === destino) {
        alert("Selecciona sucursales diferentes");
        return;
    }
    const detalles = [...document.querySelectorAll(".producto")].map(fila => ({
        id_producto: parseInt(fila.querySelector(".buscarProducto").dataset.id),
        cantidad: parseInt(fila.querySelector(".cantidadInput").value)
    })).filter(x => x.id_producto && x.cantidad > 0);
    if (detalles.length === 0) { alert("Agrega productos y cantidades"); return; }
    try {
        const respuesta = await fetch(API_TRASPASOS, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_sucursal_origen: origen, id_sucursal_destino: destino, detalles })
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) { alert(resultado.detalle || "No se pudo realizar el traspaso"); return; }
        alert("Traspaso realizado correctamente");
        cerrarModal();
        cargarTabla();
        limpiar();
    } catch (error) { alert("Error de conexión: " + error.message); }
}


// ======================================
// ELIMINAR
// ======================================
async function eliminar(id) {
    alert("No se eliminan traspasos confirmados. Para corregir existencias registra un movimiento de ajuste.");
}


// ======================================
// IMPRIMIR
// ======================================
async function imprimir(id) {

    const traspasoRes =
    await fetch(
        `${API_TRASPASOS}${id}`
    );

    const traspaso =
    await traspasoRes.json();


    const sucRes =
    await fetch(API_SUCURSALES);

    const sucursales =
    await sucRes.json();


    const prodRes =
    await fetch(API_PRODUCTOS);

    const productos =
    await prodRes.json();


    const detRes =
    await fetch(API_DETALLE);

    const detalles =
    await detRes.json();


    const origen =
    sucursales.find(s =>
        s.id_sucursal ==
        traspaso.id_sucursal_origen
    );

    const destino =
    sucursales.find(s =>
        s.id_sucursal ==
        traspaso.id_sucursal_destino
    );


    let filas = "";

    detalles.forEach(d => {

        if (
            d.id_traspaso === id
        ) {

            const producto =
            productos.find(p =>
                p.id_producto ==
                d.id_producto
            );

            filas += `

                <tr>

                    <td>
                        ${producto?.codigo || ""}
                    </td>

                    <td>
                        ${producto?.nombre || ""}
                    </td>

                    <td>
                        ${d.cantidad}
                    </td>

                </tr>
            `;
        }
    });


    const ventana =
    window.open("", "_blank");


    ventana.document.write(`

        <html>

        <head>

            <title>
                Traspaso
            </title>

            <style>

                body {

                    font-family: Arial;

                    padding: 20px;
                }

                .contenedor {

                    border: 2px solid #000;

                    padding: 15px;
                }

                .titulo {

                    text-align: center;

                    font-size: 22px;

                    font-weight: bold;

                    margin-bottom: 20px;
                }

                .datos {

                    display: flex;

                    justify-content: space-between;

                    margin-bottom: 20px;
                }

                .box {

                    width: 48%;

                    border: 1px solid #000;

                    padding: 10px;
                }

                table {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 20px;
                }

                th, td {

                    border: 1px solid #000;

                    padding: 8px;

                    text-align: center;
                }

                .firmas {

                    margin-top: 80px;

                    display: flex;

                    justify-content: space-between;
                }

                .firma {

                    width: 40%;

                    text-align: center;
                }

                .linea {

                    border-top: 1px solid black;

                    margin-top: 50px;
                }

            </style>

        </head>

        <body>

            <div class="contenedor">

                <div class="titulo">
                    TRASPASO ENTRE SUCURSALES
                </div>

                <p>
                    <strong>Folio:</strong>
                    TRS-${traspaso.id_traspaso}
                </p>

                <p>
                    <strong>Fecha:</strong>
                    ${
                        new Date(
                            traspaso.fecha
                        ).toLocaleString()
                    }
                </p>


                <div class="datos">

                    <div class="box">

                        <strong>
                            ENVÍA
                        </strong>

                        <hr>

                        ${origen?.nombre || ""}

                    </div>


                    <div class="box">

                        <strong>
                            RECIBE
                        </strong>

                        <hr>

                        ${destino?.nombre || ""}

                    </div>

                </div>


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
                                Cantidad
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${filas}

                    </tbody>

                </table>


                <div class="firmas">

                    <div class="firma">

                        <div class="linea"></div>

                        ENVÍA

                    </div>


                    <div class="firma">

                        <div class="linea"></div>

                        RECIBE

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);

    ventana.document.close();

    ventana.print();
}



// ======================================
// MODAL
// ======================================
function abrirModal() {

    document.getElementById(
        "modal"
    ).style.display = "flex";
}


function cerrarModal() {

    document.getElementById(
        "modal"
    ).style.display = "none";
}



// ======================================
// LIMPIAR
// ======================================
function limpiar() {

    document.getElementById(
        "productos"
    ).innerHTML = "";

    agregarProducto();

    generarFolio();
}



// ======================================
// UTILIDADES
// ======================================
function ir(ruta) {

    window.location.href = ruta;
}


function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}