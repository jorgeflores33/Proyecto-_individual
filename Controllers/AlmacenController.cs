using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
[Authorize(Roles="admin,almacen")]
public class AlmacenController : Controller
{
    [HttpGet]
    public IActionResult Entrada() => View();

    [HttpGet]
    public IActionResult Index() => View();

    [HttpGet]
    public IActionResult Inventario() => View();

    [HttpGet]
    public IActionResult Pedidos() => View();

    [HttpGet]
    public IActionResult Salida() => View();

    [HttpGet]
    public IActionResult Traspasos() => View();
}
