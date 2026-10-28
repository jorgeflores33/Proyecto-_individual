using System.ComponentModel.DataAnnotations;
namespace Papeleria.ViewModels;
public sealed class VentaViewModel
{
    public int? id_cliente { get; set; }
    [Required] public string forma_pago { get; set; } = "EFECTIVO";
    [Required] public string tipo_venta { get; set; } = "MOSTRADOR";
}
