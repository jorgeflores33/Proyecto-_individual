// Por ahora vacío, pero listo para futuro uso
console.log("Página de contacto cargada");
// 🔥 NAVEGACIÓN PRINCIPAL

document.getElementById("btnInicio").addEventListener("click", function () {
    window.location.href = "/Home/Index";
});

document.getElementById("btnProductos").addEventListener("click", function () {
    window.location.href = "/Externo/Productos";
});

document.getElementById("btnAcerca").addEventListener("click", function () {
    window.location.href = "/Externo/Acerca";
});
document.getElementById("btnContacto")?.addEventListener("click", function () {
    window.location.href = "/Externo/Contacto";
});
function verDetalleSucursal() {
    window.location.href = "/Externo/DetalleSucursal";
}