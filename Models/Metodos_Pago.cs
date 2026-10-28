// Modelo de base de datos: nombres de propiedades conservan las columnas SQL.
// No editar manualmente sin actualizar el esquema en SQL Server.
namespace Papeleria.Models;

public sealed class Metodos_Pago
{
    public int id_metodo_pago { get; set; }
    public string nombre_metodo { get; set; } = string.Empty;
}
