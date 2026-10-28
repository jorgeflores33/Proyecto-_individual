using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Papeleria.Data;
using System.Security.Claims;

namespace Papeleria.Services;
public static class ApiUtil
{
    public static string? Texto(JsonElement j, string key, string? defecto = null) =>
        j.ValueKind == JsonValueKind.Object && j.TryGetProperty(key, out var x) && x.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined) ? x.ToString().Trim() : defecto;
    public static int? Entero(JsonElement j, string key) => int.TryParse(Texto(j,key),out var n) && n > 0 ? n : null;
    public static decimal? Decimal(JsonElement j, string key) => decimal.TryParse(Texto(j,key), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var n) ? n : null;
    public static DateOnly? Fecha(JsonElement j, string key) => DateOnly.TryParse(Texto(j,key),out var d) ? d : null;
    public static int IdUsuario(ClaimsPrincipal user) => int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier),out var id) ? id : 0;
    public static int Sucursal(ClaimsPrincipal user) => int.TryParse(user.FindFirstValue("sucursal"),out var id) ? id : 0;
    public static IActionResult Error(ControllerBase c, Exception ex)
    {
        if (ex is SqlException s && s.Number is 2601 or 2627) return c.Conflict(new { detalle="El dato ya existe (restricción UNIQUE)." });
        if (ex is SqlException constraint && constraint.Number is >= 51000 and <= 51999) return c.BadRequest(new { detalle=constraint.Message });
        if (ex is SqlException fk && fk.Number == 547) return c.BadRequest(new { detalle="Operación rechazada por una restricción o relación de SQL Server." });
        if (ex is DbUpdateException de && de.InnerException is SqlException sql)
        {
            if (sql.Number is 2601 or 2627) return c.Conflict(new { detalle="Ya existe un registro con esos datos." });
            if (sql.Number is >= 51000 and <= 51999) return c.BadRequest(new { detalle=sql.Message });
            if (sql.Number is 547) return c.BadRequest(new { detalle="La operación viola una relación o una restricción de datos." });
        }
        if (ex is ArgumentException or InvalidOperationException) return c.BadRequest(new { detalle=ex.Message });
        return c.StatusCode(500,new { detalle="Error en la operación. Revisa la conexión y los registros del servidor." });
    }
}
