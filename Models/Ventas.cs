// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Ventas
{
    public int id_venta { get; set; }
    public int? id_cliente { get; set; }
    public int id_usuario { get; set; }
    public int id_sucursal { get; set; }
    public int id_metodo_pago { get; set; }
    public string tipo_venta { get; set; } = string.Empty;
    public string estado { get; set; } = string.Empty;
    public DateTime fecha { get; set; }
    public string folio { get; set; } = string.Empty;
}
