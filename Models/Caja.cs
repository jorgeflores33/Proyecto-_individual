// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Caja
{
    public int id_caja { get; set; }
    public int id_sucursal { get; set; }
    public int id_usuario { get; set; }
    public DateTime fecha_apertura { get; set; }
    public decimal monto_inicial { get; set; }
    public DateTime? fecha_corte { get; set; }
    public decimal? monto_final { get; set; }
}
