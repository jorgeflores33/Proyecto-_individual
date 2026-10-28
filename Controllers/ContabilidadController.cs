using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
[Authorize(Roles="admin,contabilidad")]
public class ContabilidadController : Controller
{
    [HttpGet]
    public IActionResult Clientes() => View();

    [HttpGet]
    public IActionResult Facturas() => View();

    [HttpGet]
    public IActionResult Horarios() => View();

    [HttpGet]
    public IActionResult Index() => View();

    [HttpGet]
    public IActionResult Nomina() => View();

    [HttpGet]
    public IActionResult Proveedores() => View();
}
