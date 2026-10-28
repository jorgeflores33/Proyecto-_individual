// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Detalle_Ventas
{
    public int id_detalle { get; set; }
    public int id_venta { get; set; }
    public int id_producto { get; set; }
    public int cantidad { get; set; }
    public decimal precio_unitario { get; set; }
    public decimal subtotal { get; set; }
}
