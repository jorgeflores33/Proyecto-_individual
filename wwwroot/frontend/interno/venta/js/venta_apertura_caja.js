// 🔥 APIs
const API_APERTURA =
"/api/apertura-caja/";

const API_USUARIOS =
"/api/usuarios/";

const API_TRABAJADORES =
"/api/trabajadores/";

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



// 🔥 DATOS USUARIO
const rol =
localStorage.getItem(
    "rol"
);

const id_usuario =
localStorage.getItem(
    "id_usuario"
);

const id_trabajador =
localStorage.getItem(
    "id_trabajador"
);



// 🚫 VALIDAR SI YA EXISTE APERTURA
async function validarCortePendiente() {

    try {

        const response =
        await fetch(API_APERTURA);

        let aperturas =
        await response.json();


        // 🔥 SOLO DEL USUARIO
        aperturas =
        aperturas.filter(a =>

            Number(a.id_usuario)
            ===
            Number(id_usuario)
        );


        // 🚫 YA TIENE CAJA ABIERTA
        if (aperturas.length > 0) {

            alert(
                "Ya tienes una caja abierta. Debes realizar corte de caja primero."
            );

            return false;
        }

        return true;
    }

    catch(error) {

        console.error(error);

        return false;
    }
}



// 🚀 CARGAR APERTURAS
async function cargarAperturas() {

    try {

        const [

            resApertura,

            resUsuarios,

            resTrabajadores,

            resSucursales

        ] = await Promise.all([

            fetch(API_APERTURA),

            fetch(API_USUARIOS),

            fetch(API_TRABAJADORES),

            fetch(API_SUCURSALES)

        ]);


        let aperturas =
        await resApertura.json();

        const usuarios =
        await resUsuarios.json();

        const trabajadores =
        await resTrabajadores.json();

        const sucursales =
        await resSucursales.json();


        // 🔥 SOLO ADMIN VE TODO
        if (

            rol.toLowerCase()
            !==
            "admin"

        ) {

            aperturas =
            aperturas.filter(a =>

                Number(a.id_usuario)
                ===
                Number(id_usuario)
            );
        }


        let html = "";


        // ❌ SIN DATOS
        if (!aperturas.length) {

            html = `

                <tr>

                    <td colspan="7">

                        No hay aperturas

                    </td>

                </tr>
            `;
        }


        // ✅ CON DATOS
        else {

            aperturas.forEach(a => {

                const usuario =
                usuarios.find(u =>

                    Number(u.id_usuario)
                    ===
                    Number(a.id_usuario)
                );


                const trabajador =
                trabajadores.find(t =>

                    Number(t.id_trabajador)
                    ===
                    Number(a.id_trabajador)
                );


                const sucursal =
                sucursales.find(s =>

                    Number(s.id_sucursal)
                    ===
                    Number(a.id_sucursal)
                );


                html += `

                    <tr>

                        <td>
                            ${a.id_apertura}
                        </td>

                        <td>
                            ${
                                usuario
                                ?
                                usuario.usuario
                                :
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                trabajador
                                ?
                                trabajador.nombre
                                :
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                sucursal
                                ?
                                sucursal.nombre
                                :
                                "-"
                            }
                        </td>

                        <td>

                            $
                            ${
                                a.monto_inicial
                                ||
                                0
                            }

                        </td>

                        <td>

                            ${
                                formatearFecha(
                                    a.fecha
                                )
                            }

                        </td>

                        <td>

                            ${

                                rol.toLowerCase()
                                ===
                                "admin"

                                ?

                                `

                                <button
                                    onclick="
                                        eliminar(${a.id_apertura})
                                    "
                                >
                                    🗑️
                                </button>

                                `

                                :

                                "-"
                            }

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaApertura"
        ).innerHTML = html;
    }

    catch(error) {

        console.error(error);

        alert(
            "Error al cargar aperturas"
        );
    }
}



// 🔥 ABRIR MODAL
async function abrirModal() {

    document.getElementById(
        "modalCaja"
    ).style.display = "flex";

    await cargarDatosUsuario();

    await cargarSucursales();
}



// ❌ CERRAR MODAL
function cerrarModal() {

    document.getElementById(
        "modalCaja"
    ).style.display = "none";
}



// 🔥 CARGAR DATOS USUARIO
async function cargarDatosUsuario() {

    try {

        const [

            resUsuarios,

            resTrabajadores

        ] = await Promise.all([

            fetch(API_USUARIOS),

            fetch(API_TRABAJADORES)

        ]);


        const usuarios =
        await resUsuarios.json();

        const trabajadores =
        await resTrabajadores.json();


        // 🔥 USUARIO LOGUEADO
        const usuario =
        usuarios.find(u =>

            Number(u.id_usuario)
            ===
            Number(id_usuario)
        );


        // 🔥 TRABAJADOR LOGUEADO
        const trabajador =
        trabajadores.find(t =>

            Number(t.id_trabajador)
            ===
            Number(id_trabajador)
        );


        // 🔥 MOSTRAR USUARIO
        document.getElementById(
            "nombreUsuario"
        ).value =

            usuario
            ?
            usuario.usuario
            :
            "";


        // 🔥 MOSTRAR TRABAJADOR
        document.getElementById(
            "nombreTrabajador"
        ).value =

            trabajador
            ?
            trabajador.nombre
            :
            "";

    }

    catch(error) {

        console.error(error);
    }
}



// 🔥 CARGAR SUCURSALES
async function cargarSucursales() {

    try {

        const response =
        await fetch(API_SUCURSALES);

        const sucursales =
        await response.json();


        let html = `

            <option value="">
                Seleccionar sucursal
            </option>
        `;


        sucursales.forEach(s => {

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

    catch(error) {

        console.error(error);
    }
}



// 💾 GUARDAR
async function guardar() {

    // 🚫 VALIDAR APERTURA
    const puedeAbrir =
    await validarCortePendiente();

    if (!puedeAbrir) {

        return;
    }


    const sucursal =
    document.getElementById(
        "sucursal"
    ).value;

    const monto =
    document.getElementById(
        "monto"
    ).value;


    if (

        !sucursal
        ||
        monto === ""

    ) {

        alert(
            "Completa todos los campos"
        );

        return;
    }


    try {

        await fetch(API_APERTURA, {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                id_usuario:
                parseInt(
                    id_usuario
                ),

                id_trabajador:
                parseInt(
                    id_trabajador
                ),

                id_sucursal:
                parseInt(
                    sucursal
                ),

                monto_inicial:
                parseFloat(
                    monto
                )
            })
        });


        alert(
            "Caja abierta correctamente"
        );

        cerrarModal();

        cargarAperturas();
    }

    catch(error) {

        console.error(error);

        alert(
            "Error al abrir caja"
        );
    }
}



// 🗑️ ELIMINAR
async function eliminar(id) {

    if (

        rol.toLowerCase()
        !==
        "admin"

    ) {

        return;
    }


    const confirmar =
    confirm(
        "¿Eliminar apertura?"
    );


    if (!confirmar) {

        return;
    }


    try {

        await fetch(

            `${API_APERTURA}${id}`,

            {
                method: "DELETE"
            }
        );


        alert(
            "Apertura eliminada"
        );

        cargarAperturas();
    }

    catch(error) {

        console.error(error);

        alert(
            "Error al eliminar"
        );
    }
}



// 🔍 FILTRAR
function filtrar() {

    const fecha =
    document.getElementById(
        "filtroFecha"
    ).value;


    const filas =
    document.querySelectorAll(
        "#tablaApertura tr"
    );


    filas.forEach(fila => {

        const celdas =
        fila.querySelectorAll("td");


        if (!celdas.length) {

            return;
        }


        const fechaTexto =
        celdas[5].innerText;


        let mostrar = true;


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

            mostrar =
            fechaFormateada === fecha;
        }


        fila.style.display =

            mostrar
            ?
            ""
            :
            "none";
    });
}



// 📅 FORMATEAR FECHA
function formatearFecha(fecha) {

    if (!fecha) {

        return "";
    }

    return new Date(
        fecha
    ).toLocaleString();
}



// 🚀 INIT
window.onload = () => {

    cargarAperturas();
};