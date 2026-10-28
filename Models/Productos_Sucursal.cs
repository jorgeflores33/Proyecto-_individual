// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Productos_Sucursal
{
    public int id_producto { get; set; }
    public int id_sucursal { get; set; }
    public int existencia { get; set; }
}
