// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Marcas
{
    public int id_marca { get; set; }
    public string nombre_marca { get; set; } = string.Empty;
}
