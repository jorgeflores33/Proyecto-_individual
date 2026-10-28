// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Areas
{
    public int id_area { get; set; }
    public string nombre_area { get; set; } = string.Empty;
}
