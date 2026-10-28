using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
[Authorize(Roles="admin")]
public class AdministradorController : Controller
{
    [HttpGet]
    public IActionResult Categorias() => View();

    [HttpGet]
    public IActionResult Index() => View();

    [HttpGet]
    public IActionResult Productos() => View();

    [HttpGet]
    public IActionResult Sucursales() => View();

    [HttpGet]
    public IActionResult Trabajadores() => View();

    [HttpGet]
    public IActionResult Usuarios() => View();
}
