// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Clientes
{
    public int id_cliente { get; set; }
    public string nombre_cliente { get; set; } = string.Empty;
    public DateOnly? fecha_nacimiento { get; set; }
    public string? RFC { get; set; }
    public string? telefono { get; set; }
    public string? correo { get; set; }
    public string folio { get; set; } = string.Empty;
}
