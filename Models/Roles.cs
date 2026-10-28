// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Roles
{
    public int id_rol { get; set; }
    public string nombre_rol { get; set; } = string.Empty;
    public string tipo_usuario { get; set; } = string.Empty;
}
