using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize]
public sealed class ApiPendientesController : ControllerBase
{
    [AcceptVerbs("GET", "POST")][Route("cotizaciones")][Route("detalle-cotizaciones")]
    [Route("correo")][Route("facturas-clientes/pdf")]
    public IActionResult NoDisponible() => StatusCode(501,new{detalle="Módulo pendiente: la base PAPELERIA_3FN no contiene toda la información necesaria para esta operación. No se registró ninguna transacción."});
}
