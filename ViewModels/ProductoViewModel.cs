using System.ComponentModel.DataAnnotations;
namespace Papeleria.ViewModels;
public sealed class ProductoViewModel
{
    [Required, MaxLength(50)] public string codigo { get; set; } = "";
    [Required, MaxLength(120)] public string nombre { get; set; } = "";
    [Range(0, double.MaxValue)] public decimal precio { get; set; }
    [Range(1, int.MaxValue)] public int id_categoria { get; set; }
    [MaxLength(1000)] public string? descripcion { get; set; }
    [MaxLength(500)] public string? imagen_url { get; set; }
}
