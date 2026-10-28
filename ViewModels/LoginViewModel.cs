using System.ComponentModel.DataAnnotations;
namespace Papeleria.ViewModels;
public sealed class LoginViewModel
{
    [Required, MinLength(3)] public string usuario { get; set; } = "";
    [Required] public string password { get; set; } = "";
}
