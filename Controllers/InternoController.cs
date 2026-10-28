using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;

/// <summary>Presentación MVC del frontend original. API y reglas de negocio pendientes.</summary>
[Authorize(Roles="admin,cajero,almacen,contabilidad")]
public class InternoController : Controller
{
    [HttpGet]
    public IActionResult Index() => View();
}
