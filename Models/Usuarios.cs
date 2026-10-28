// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Usuarios
{
    public int id_usuario { get; set; }
    public int? id_trabajador { get; set; }
    public int? id_cliente { get; set; }
    public int id_rol { get; set; }
    public string tipo_usuario { get; set; } = string.Empty;
    public string usuario { get; set; } = string.Empty;
    public string hash_contrasena { get; set; } = string.Empty;
    public bool activo { get; set; }
}
