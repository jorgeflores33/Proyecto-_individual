using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Papeleria.Models;

namespace Papeleria.Controllers;

public sealed class HomeController : Controller
{
    [AllowAnonymous]
    [HttpGet]
    public IActionResult Index() => View();

    [AllowAnonymous]
    [HttpGet]
    public IActionResult Privacy() => View();

    [AllowAnonymous]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    [HttpGet]
    public IActionResult Error() => View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
