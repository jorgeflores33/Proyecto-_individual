// 🔐 VALIDAR LOGIN
const rol = localStorage.getItem("rol");

if (!rol) {
    window.location.href = "/Home/Index";
}

// 🔓 LOGOUT
function logout() {
    localStorage.removeItem("rol");
    window.location.href = "/Home/Index";
}

// 🔁 NAVEGACIÓN
function ir(pagina) {
    window.location.href = pagina;
}