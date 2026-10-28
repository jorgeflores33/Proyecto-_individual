using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = null;
});
builder.Services.AddDbContext<PapeleriaContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("PapeleriaConnection")));
builder.Services.AddScoped<VentasService>();
builder.Services.AddScoped<InventarioService>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.Cookie.Name = "Papeleria.Session";
        o.Cookie.HttpOnly = true;
        o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        o.Cookie.SameSite = SameSiteMode.Strict;
        o.ExpireTimeSpan = TimeSpan.FromHours(8);
        o.LoginPath = "/Home/Index";
        o.AccessDeniedPath = "/Home/Index";
        o.Events.OnRedirectToLogin = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api")) { ctx.Response.StatusCode = 401; return Task.CompletedTask; }
            ctx.Response.Redirect(ctx.RedirectUri); return Task.CompletedTask;
        };
        o.Events.OnRedirectToAccessDenied = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api")) { ctx.Response.StatusCode = 403; return Task.CompletedTask; }
            ctx.Response.Redirect(ctx.RedirectUri); return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();
var app = builder.Build();
if (args.Length > 0 && args[0] == "seed-admin")
{
    using var scope = app.Services.CreateScope();
    await InicioSeguro.CrearAdministradorAsync(scope.ServiceProvider);
    return;
}
if (!app.Environment.IsDevelopment()) { app.UseExceptionHandler("/Home/Error"); app.UseHsts(); }
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
// Defensa complementaria contra peticiones cross-origin no autorizadas.
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.StartsWithSegments("/api") &&
        ctx.Request.Method is not ("GET" or "HEAD" or "OPTIONS") &&
        ctx.Request.Headers.TryGetValue("Origin", out var origins) &&
        !string.Equals(origins.ToString(), $"{ctx.Request.Scheme}://{ctx.Request.Host}", StringComparison.OrdinalIgnoreCase))
    { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return; }
    await next();
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapGet("/index.html", () => Results.Redirect("/Home/Index"));
app.Run();
