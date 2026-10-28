// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Sucursales
{
    public int id_sucursal { get; set; }
    public string nombre_sucursal { get; set; } = string.Empty;
    public string direccion { get; set; } = string.Empty;
    public string? telefono { get; set; }
    public int? id_encargado { get; set; }
    public DateTime fecha_registro { get; set; }
    public string estatus { get; set; } = string.Empty;
}
