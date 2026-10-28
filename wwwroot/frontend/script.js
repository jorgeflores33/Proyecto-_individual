const API = "/api/usuarios";

/* ==============================
   🔥 MODAL LOGIN
============================== */

document.getElementById("btnLogin").addEventListener("click", function () {
    document.getElementById("loginModal").style.display = "flex";
});

// cerrar modal al hacer click fuera
window.addEventListener("click", function (e) {

    const modal =
    document.getElementById("loginModal");

    if (e.target === modal) {

        modal.style.display = "none";
    }
});

/* ==============================
   🔐 LOGIN - ASP.NET CORE MVC / SQL SERVER
============================== */

document.getElementById("submitLogin").addEventListener("click", async function (e) {

    e.preventDefault();

    // 🔥 AQUÍ ESTABA EL ERROR
    const usuario =
    document.getElementById("usuario").value;

    const password =
    document.getElementById("password").value;

    if (!usuario || !password) {

        alert("Completa los campos");

        return;
    }

    try {

        const res = await fetch(`${API}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                usuario,
                password
            })
        });

        const data = await res.json();

        console.log("LOGIN:", data);

        if (!res.ok) {
            alert(data.detalle || data.mensaje || "No se pudo iniciar sesión. Falta conectar la API de C#.");
            return;
        }

        if (!data.usuario) {

            alert("Credenciales incorrectas");

            return;
        }

        const user = data.usuario;

        // 🔥 GUARDAR SESIÓN COMPLETA
        localStorage.setItem(
            "usuario",
            user.usuario
        );

        localStorage.setItem(
            "id_usuario",
            user.id_usuario
        );

        localStorage.setItem(
            "rol",
            user.rol
        );

        localStorage.setItem(
            "id_trabajador",
            user.id_trabajador || ""
        );

        localStorage.setItem(
            "id_cliente",
            user.id_cliente || ""
        );

        document.getElementById(
            "loginModal"
        ).style.display = "none";

        // 🚀 REDIRECCIÓN POR ROL
        redirectByRole(user.rol);

    }

    catch (error) {

        console.error(error);

        alert(
            "Error de conexión con el servidor"
        );
    }
});

/* ==============================
   🚀 REDIRECCIÓN POR ROL
============================== */

function redirectByRole(rol) {

    switch (rol) {

        // 🔥 TODOS LOS INTERNOS
        case "admin":
        case "cajero":
        case "almacen":
        case "contabilidad":

            window.location.href =
            "/Interno/Index";

            break;


        // 🌐 CLIENTE
        case "cliente":

            window.location.href =
            "/Externo/Productos";

            break;


        // ❌ DEFAULT
        default:

            window.location.href =
            "/Home/Index";
    }
}

/* ==============================
   🔥 NAVEGACIÓN EXTERNA
============================== */

function irProductos() {

    window.location.href =
    "/Externo/Productos";
}

function irCategoria(categoria) {

    window.location.href =
    `/Externo/Productos?categoria=${encodeURIComponent(categoria)}`;
}

/* ==============================
   🔗 EVENTOS DE NAVEGACIÓN
============================== */

window.onload = function () {

    // menú principal
    document.getElementById("btnAcerca")?.addEventListener("click", () => {

        window.location.href =
        "/Externo/Acerca";
    });

    document.getElementById("btnProductos")?.addEventListener("click", () => {

        window.location.href =
        "/Externo/Productos";
    });

    document.getElementById("btnInicio")?.addEventListener("click", () => {

        window.location.href =
        "/Home/Index";
    });

    document.getElementById("btnContacto")?.addEventListener("click", () => {

        window.location.href =
        "/Externo/Contacto";
    });

    document.getElementById("btnCarrito")?.addEventListener("click", () => {

        window.location.href =
        "/Externo/Pago";
    });

    // botón hero productos
    const btnHero =
    document.querySelector(".btn.products");

    if (btnHero) {

        btnHero.addEventListener(
            "click",
            irProductos
        );
    }
};

/* ==============================
   🔐 LOGOUT GLOBAL
============================== */

function logout() {

    // La sesión real se invalida en el servidor antes de redirigir.
    fetch("/api/usuarios/logout", { method: "POST", credentials: "same-origin" })
        .catch(error => console.warn("No fue posible confirmar el cierre de sesión.", error))
        .finally(() => {
            localStorage.removeItem("usuario");
            localStorage.removeItem("id_usuario");
            localStorage.removeItem("rol");
            localStorage.removeItem("id_trabajador");
            localStorage.removeItem("id_cliente");
            window.location.href = "/Home/Index";
        });
}