// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Asistencia
{
    public int id_asistencia { get; set; }
    public int id_trabajador { get; set; }
    public DateOnly fecha { get; set; }
    public TimeOnly? hora_entrada { get; set; }
    public TimeOnly? hora_salida { get; set; }
    public string estado { get; set; } = string.Empty;
}
