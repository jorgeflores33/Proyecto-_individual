// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Categorias
{
    public int id_categoria { get; set; }
    public string nombre_categoria { get; set; } = string.Empty;
}
