// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Facturas_Clientes
{
    public int id_factura_cliente { get; set; }
    public int id_venta { get; set; }
    public string folio_factura { get; set; } = string.Empty;
    public string rfc_emisor { get; set; } = string.Empty;
    public string rfc_receptor { get; set; } = string.Empty;
    public int id_metodo_pago { get; set; }
    public decimal subtotal { get; set; }
    public decimal iva { get; set; }
    public decimal total { get; set; }
    public DateTime fecha_emision { get; set; }
}
