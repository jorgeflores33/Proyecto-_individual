const API =
"/api/trabajadores/";

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


// 🚀 CARGAR
async function cargar() {

    try {

        const res =
        await fetch(API);

        if (!res.ok) {

            throw new Error(
                "Error al cargar trabajadores"
            );
        }

        const data =
        await res.json();


        let html = "";


        if (!data.length) {

            html = `
                <tr>
                    <td colspan="6">
                        Sin trabajadores
                    </td>
                </tr>
            `;
        }

        else {

            data.forEach(t => {

                html += `
                    <tr>

                        <td>
                            ${t.id_trabajador}
                        </td>

                        <td>
                            ${t.nombre || ""}
                        </td>

                        <td>
                            ${t.fecha_nacimiento || ""}
                        </td>

                        <td>
                            ${t.area || ""}
                        </td>

                        <td>
                            $${t.salario || 0}
                        </td>

                        <td>

                            <button
                                onclick="editar(${t.id_trabajador})"
                            >
                                ✏️
                            </button>

                            <button
                                onclick="eliminar(${t.id_trabajador})"
                            >
                                🗑
                            </button>

                        </td>

                    </tr>
                `;
            });
        }


        document.getElementById(
            "tablaTrabajadores"
        ).innerHTML = html;

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// 🔥 ABRIR MODAL
function abrirModal() {

    limpiar();

    idEditar = null;

    document.getElementById(
        "tituloModal"
    ).innerText =
    "Nuevo Trabajador";

    document.getElementById(
        "modalTrabajador"
    ).style.display =
    "flex";
}


// ❌ CERRAR
function cerrarModal() {

    document.getElementById(
        "modalTrabajador"
    ).style.display =
    "none";
}


// 🧹 LIMPIAR
function limpiar() {

    document.getElementById(
        "nombre"
    ).value = "";

    document.getElementById(
        "fecha"
    ).value = "";

    document.getElementById(
        "area"
    ).value = "";

    document.getElementById(
        "salario"
    ).value = "";
}


// 💾 GUARDAR
async function guardar() {

    const data = {

        nombre:
        document.getElementById(
            "nombre"
        ).value,

        fecha_nacimiento:
        document.getElementById(
            "fecha"
        ).value || null,

        area:
        document.getElementById(
            "area"
        ).value || null,

        salario:
        parseFloat(
            document.getElementById(
                "salario"
            ).value
        ) || 0
    };


    console.log(
        "JSON ENVIADO:",
        data
    );


    // 🔥 VALIDAR
    if (!data.nombre) {

        alert(
            "El nombre es obligatorio"
        );

        return;
    }


    // 🔥 URL
    const url =
    idEditar
    ?
    `${API}${idEditar}`
    :
    API;


    // 🔥 METODO
    const method =
    idEditar
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


        // 🔥 ERROR BACKEND
        if (!res.ok) {

            const error =
            await res.text();

            console.error(error);

            alert(error);

            return;
        }


        const resultado =
        await res.json();

        console.log(
            "GUARDADO:",
            resultado
        );


        cerrarModal();

        cargar();

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

        idEditar = id;


        const res =
        await fetch(
            `${API}${id}`
        );

        if (!res.ok) {

            throw new Error(
                "Error al cargar trabajador"
            );
        }


        const t =
        await res.json();


        document.getElementById(
            "nombre"
        ).value =
        t.nombre || "";

        document.getElementById(
            "fecha"
        ).value =
        t.fecha_nacimiento || "";

        document.getElementById(
            "area"
        ).value =
        t.area || "";

        document.getElementById(
            "salario"
        ).value =
        t.salario || "";


        document.getElementById(
            "tituloModal"
        ).innerText =
        "Editar Trabajador";


        document.getElementById(
            "modalTrabajador"
        ).style.display =
        "flex";

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// 🗑 ELIMINAR
async function eliminar(id) {

    if (
        !confirm(
            "¿Eliminar trabajador?"
        )
    ) {
        return;
    }


    try {

        const res =
        await fetch(
            `${API}${id}`,
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


        cargar();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// 🚀 INICIO
window.onload = cargar;