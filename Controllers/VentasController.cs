using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
[Authorize(Roles="admin,cajero")]
public class VentasController : Controller
{
    [HttpGet]
    public IActionResult AperturaCaja() => View();

    [HttpGet]
    public IActionResult CorteCaja() => View();

    [HttpGet]
    public IActionResult Cotizacion() => View();

    [HttpGet]
    public IActionResult Facturas() => View();

    [HttpGet]
    public IActionResult Index() => View();

    [HttpGet]
    public IActionResult Mostrador() => View();
}
