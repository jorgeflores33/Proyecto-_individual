// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Proveedores
{
    public int id_proveedor { get; set; }
    public string nombre_proveedor { get; set; } = string.Empty;
    public string? telefono { get; set; }
    public string? correo { get; set; }
    public string direccion { get; set; } = string.Empty;
    public string? RFC { get; set; }
    public string folio { get; set; } = string.Empty;
}
