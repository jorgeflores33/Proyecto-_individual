// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Facturas_Proveedores
{
    public int id_factura { get; set; }
    public int id_proveedor { get; set; }
    public int id_sucursal { get; set; }
    public string folio { get; set; } = string.Empty;
    public DateOnly fecha { get; set; }
    public string estado { get; set; } = string.Empty;
}
