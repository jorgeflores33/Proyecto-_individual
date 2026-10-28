// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Movimiento_Almacen
{
    public long id_movimiento { get; set; }
    public int id_producto { get; set; }
    public string tipo_movimiento { get; set; } = string.Empty;
    public int cantidad { get; set; }
    public int? id_sucursal_origen { get; set; }
    public int? id_sucursal_destino { get; set; }
    public int? id_venta { get; set; }
    public int? id_factura_proveedor { get; set; }
    public DateTime fecha { get; set; }
    public string? observaciones { get; set; }
}
