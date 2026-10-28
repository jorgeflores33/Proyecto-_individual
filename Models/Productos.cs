// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Productos
{
    public int id_producto { get; set; }
    public int id_categoria { get; set; }
    public int? id_marca { get; set; }
    public string nombre { get; set; } = string.Empty;
    public string codigo { get; set; } = string.Empty;
    public string? modelo { get; set; }
    public decimal precio_venta { get; set; }
    public string? descripcion { get; set; }
    public string? imagen_url { get; set; }
    public bool activo { get; set; }
}
