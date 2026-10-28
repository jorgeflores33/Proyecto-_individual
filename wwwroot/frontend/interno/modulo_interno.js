// 🔐 VALIDAR LOGIN

const rol = localStorage.getItem("rol");

// 🔐 LOGIN
if (!localStorage.getItem("rol")) {

    window.location.href =
    "/Home/Index";
}



// 🔥 MÓDULOS

const modAdmin = document.getElementById("modAdmin");
const modcajero = document.getElementById("modVentas");
const modAlmacen = document.getElementById("modAlmacen");
const modConta = document.getElementById("modConta");


// 🔥 BLOQUEAR SEGÚN ROL

function bloquearModulos() {

    // ADMIN → acceso total
    if (rol === "admin") {
        return;
    }

    // VENTAS
    if (rol === "cajero") {

        modAdmin.classList.add("bloqueado");
        modAlmacen.classList.add("bloqueado");
        modConta.classList.add("bloqueado");
    }

    // ALMACÉN
    else if (rol === "almacen") {

        modAdmin.classList.add("bloqueado");
        modVentas.classList.add("bloqueado");
        modConta.classList.add("bloqueado");
    }

    // CONTABILIDAD
    else if (rol === "contabilidad") {

        modAdmin.classList.add("bloqueado");
        modVentas.classList.add("bloqueado");
        modAlmacen.classList.add("bloqueado");
    }

    // OTROS
    else {

        modAdmin.classList.add("bloqueado");
        modVentas.classList.add("bloqueado");
        modAlmacen.classList.add("bloqueado");
        modConta.classList.add("bloqueado");
    }
}


// 🚀 REDIRECCIONES

function irModulo(modulo) {

    switch(modulo) {

        case "admin":
            window.location.href =
            "/Administrador/Index";
            break;

        case "ventas":
            window.location.href =
            "/Ventas/Index";
            break;

        case "almacen":
            window.location.href =
            "/Almacen/Index";
            break;

        case "contabilidad":
            window.location.href =
            "/Contabilidad/Index";
            break;
    }
}




// 🔓 LOGOUT
function logout() {

    navigator.sendBeacon("/api/usuarios/logout");
    localStorage.clear();

    window.location.href =
    "/Home/Index";
}



// 🚀 INICIO

bloquearModulos();