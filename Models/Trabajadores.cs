// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Trabajadores
{
    public int id_trabajador { get; set; }
    public int id_sucursal { get; set; }
    public int id_area { get; set; }
    public string nombre { get; set; } = string.Empty;
    public DateOnly fecha_nacimiento { get; set; }
    public decimal salario { get; set; }
    public bool activo { get; set; }
}
