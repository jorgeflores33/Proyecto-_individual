using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;

namespace Papeleria.Services;
public static class InicioSeguro
{
    public static async Task CrearAdministradorAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<PapeleriaContext>();
        var usuario = Environment.GetEnvironmentVariable("PAPELERIA_ADMIN_USER");
        var clave = Environment.GetEnvironmentVariable("PAPELERIA_ADMIN_PASSWORD");
        var nombre = Environment.GetEnvironmentVariable("PAPELERIA_ADMIN_NOMBRE");
        var domicilio = Environment.GetEnvironmentVariable("PAPELERIA_SUCURSAL_DIRECCION");
        var nacimiento = Environment.GetEnvironmentVariable("PAPELERIA_ADMIN_NACIMIENTO");
        if (string.IsNullOrWhiteSpace(usuario) || string.IsNullOrWhiteSpace(nombre) ||
            string.IsNullOrWhiteSpace(domicilio) || string.IsNullOrWhiteSpace(clave) ||
            clave.Length < 12 || !DateOnly.TryParse(nacimiento, out var fechaNacimiento))
        {
            Console.Error.WriteLine("Configura PAPELERIA_ADMIN_USER, PAPELERIA_ADMIN_PASSWORD (12+ caracteres), PAPELERIA_ADMIN_NOMBRE, PAPELERIA_SUCURSAL_DIRECCION y PAPELERIA_ADMIN_NACIMIENTO (AAAA-MM-DD). No pases contraseñas en argumentos.");
            return;
        }
        if (await db.Usuarios.AnyAsync()) { Console.Error.WriteLine("Ya existen usuarios; configuración inicial deshabilitada."); return; }
        await using var tx = await db.Database.BeginTransactionAsync();
        var sucursal = await db.Sucursales.OrderBy(x => x.id_sucursal).FirstOrDefaultAsync();
        if (sucursal == null)
        {
            sucursal = new Sucursales { nombre_sucursal="MATRIZ", direccion=domicilio, estatus="ACTIVA", fecha_registro=DateTime.Now };
            db.Sucursales.Add(sucursal); await db.SaveChangesAsync();
        }
        var area = await db.Areas.FirstAsync(x => x.nombre_area == "ADMINISTRACION");
        var rol = await db.Roles.FirstAsync(x => x.nombre_rol == "ADMINISTRADOR");
        var trabajador = new Trabajadores { nombre=nombre, fecha_nacimiento=fechaNacimiento, id_sucursal=sucursal.id_sucursal, id_area=area.id_area, salario=0, activo=true };
        db.Trabajadores.Add(trabajador); await db.SaveChangesAsync();
        var u = new Usuarios { usuario=usuario, id_trabajador=trabajador.id_trabajador, id_rol=rol.id_rol, tipo_usuario="T", activo=true };
        u.hash_contrasena = new PasswordHasher<Usuarios>().HashPassword(u, clave);
        db.Usuarios.Add(u); await db.SaveChangesAsync();
        await tx.CommitAsync();
        Console.WriteLine($"Administrador creado: {usuario}. Cambia la contraseña si se compartió con alguien.");
    }
}
