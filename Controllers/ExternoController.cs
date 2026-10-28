using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
public class ExternoController : Controller
{
    [HttpGet]
    public IActionResult Acerca() => View();

    [HttpGet]
    public IActionResult Contacto() => View();

    [HttpGet]
    public IActionResult DetalleSucursal() => View();

    [HttpGet]
    public IActionResult Pago() => View();

    [HttpGet]
    public IActionResult Productos() => View();
}
