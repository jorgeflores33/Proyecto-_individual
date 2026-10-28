using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController]
[Route("api/usuarios")]
public sealed class ApiUsuariosController(PapeleriaContext db) : ControllerBase
{
    private static string RolWeb(string nombre) => nombre.ToUpperInvariant() switch
    {
        "ADMINISTRADOR" => "admin", "CAJERO" => "cajero", "ALMACENISTA" => "almacen",
        "CONTABILIDAD" => "contabilidad", "CLIENTE" => "cliente", _ => ""
    };
    private static string RolSql(string rol) => rol.ToLowerInvariant() switch
    {
        "admin" or "administrador" => "ADMINISTRADOR", "cajero" => "CAJERO",
        "almacen" or "almacenista" => "ALMACENISTA", "contabilidad" => "CONTABILIDAD",
        "cliente" => "CLIENTE", _ => ""
    };
    [HttpPost("login")][AllowAnonymous]
    public async Task<IActionResult> Login([FromBody]JsonElement j)
    {
        if (j.ValueKind != JsonValueKind.Object) return BadRequest(new { detalle = "Envía un objeto JSON válido." });
        var nombre=ApiUtil.Texto(j,"usuario");var clave=j.TryGetProperty("password",out var pass) && pass.ValueKind==JsonValueKind.String ? pass.GetString() : null;
        if(string.IsNullOrWhiteSpace(nombre)||string.IsNullOrWhiteSpace(clave))return BadRequest(new{detalle="Usuario y contraseña obligatorios."});
        var row=await (from u in db.Usuarios join r in db.Roles on u.id_rol equals r.id_rol
                       where u.usuario==nombre && u.activo select new{user=u,rol=r.nombre_rol}).FirstOrDefaultAsync();
        if(row==null)return Unauthorized(new{detalle="Credenciales incorrectas."});
        var resultado=new PasswordHasher<Usuarios>().VerifyHashedPassword(row.user,row.user.hash_contrasena,clave);
        if(resultado==PasswordVerificationResult.Failed)return Unauthorized(new{detalle="Credenciales incorrectas."});
        var rol=RolWeb(row.rol);
        if(rol=="")return Forbid();
        var sucursal=row.user.id_trabajador.HasValue ? await db.Trabajadores.Where(t=>t.id_trabajador==row.user.id_trabajador).Select(t=>t.id_sucursal).FirstOrDefaultAsync():0;
        var claims=new List<Claim>{new(ClaimTypes.NameIdentifier,row.user.id_usuario.ToString()),new(ClaimTypes.Name,row.user.usuario),new(ClaimTypes.Role,rol),new("sucursal",sucursal.ToString())};
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,new ClaimsPrincipal(new ClaimsIdentity(claims,CookieAuthenticationDefaults.AuthenticationScheme)));
        if(resultado==PasswordVerificationResult.SuccessRehashNeeded){row.user.hash_contrasena=new PasswordHasher<Usuarios>().HashPassword(row.user,clave);await db.SaveChangesAsync();}
        return Ok(new{usuario=new{row.user.id_usuario,row.user.usuario,rol,row.user.id_trabajador,row.user.id_cliente,id_sucursal=sucursal}});
    }
    [HttpPost("registro")][AllowAnonymous]
    public async Task<IActionResult> RegistrarCliente([FromBody]JsonElement j)
    {
        if (j.ValueKind != JsonValueKind.Object) return BadRequest(new { detalle = "Envía un objeto JSON válido." });
        var nombre=ApiUtil.Texto(j,"nombre");var correo=ApiUtil.Texto(j,"correo");var usuario=ApiUtil.Texto(j,"usuario");
        var clave=j.TryGetProperty("password",out var pass) && pass.ValueKind==JsonValueKind.String ? pass.GetString() : null;
        if(string.IsNullOrWhiteSpace(nombre)||string.IsNullOrWhiteSpace(correo)||string.IsNullOrWhiteSpace(usuario)||string.IsNullOrWhiteSpace(clave)||clave.Length<12)
            return BadRequest(new{detalle="Nombre, correo, usuario y contraseña de al menos 12 caracteres requeridos."});
        try{
            await using var tx=await db.Database.BeginTransactionAsync();
            var rol=await db.Roles.FirstAsync(r=>r.nombre_rol=="CLIENTE");
            var cliente=new Clientes{nombre_cliente=nombre,correo=correo,telefono=ApiUtil.Texto(j,"telefono"),fecha_nacimiento=ApiUtil.Fecha(j,"fecha_nacimiento")};
            db.Clientes.Add(cliente);await db.SaveChangesAsync();
            var u=new Usuarios{usuario=usuario,id_cliente=cliente.id_cliente,tipo_usuario="C",id_rol=rol.id_rol,activo=true};
            u.hash_contrasena=new PasswordHasher<Usuarios>().HashPassword(u,clave);
            db.Usuarios.Add(u);await db.SaveChangesAsync();
            await tx.CommitAsync();return Ok(new{cliente.id_cliente,u.id_usuario,usuario=u.usuario,mensaje="Registro completado. Inicia sesión."});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPost("logout")][AllowAnonymous]
    public async Task<IActionResult> Logout(){await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);return Ok(new{mensaje="Sesión cerrada"});}
    [HttpGet][HttpGet("{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> Usuarios(int? id=null)
    {
        var x=await (from u in db.Usuarios.AsNoTracking().Where(u=>u.activo) join r in db.Roles on u.id_rol equals r.id_rol
                     select new{u.id_usuario,u.usuario,u.id_trabajador,u.id_cliente,r.nombre_rol,u.activo}).ToListAsync();
        var lista=x.Select(u=>new{u.id_usuario,u.usuario,u.id_trabajador,u.id_cliente,rol=RolWeb(u.nombre_rol),u.activo}).ToList();
        return id.HasValue?lista.FirstOrDefault(u=>u.id_usuario==id) is {} v?Ok(v):NotFound():Ok(lista);
    }
    [HttpPost][Authorize(Roles="admin")]
    public async Task<IActionResult> Crear([FromBody]JsonElement j)
    {
        try {
            var nombre=ApiUtil.Texto(j,"usuario");var clave=j.TryGetProperty("password",out var pass) ? pass.GetString() : null;
            var tipo=await ResolverRol(j);var idTrab=ApiUtil.Entero(j,"id_trabajador");var idCli=ApiUtil.Entero(j,"id_cliente");
            if(tipo==null||string.IsNullOrWhiteSpace(nombre)||string.IsNullOrWhiteSpace(clave)||clave.Length<12||
               (tipo.tipo_usuario=="T"&&(!idTrab.HasValue||idCli.HasValue))||
               (tipo.tipo_usuario=="C"&&(!idCli.HasValue||idTrab.HasValue)))return BadRequest(new{detalle="Usuario, rol, titular y contraseña de mínimo 12 caracteres son obligatorios."});
            var u=new Usuarios{usuario=nombre,id_trabajador=idTrab,id_cliente=idCli,id_rol=tipo.id_rol,tipo_usuario=tipo.tipo_usuario,activo=true};
            u.hash_contrasena=new PasswordHasher<Usuarios>().HashPassword(u,clave);
            db.Usuarios.Add(u);await db.SaveChangesAsync();return Ok(new{u.id_usuario,u.usuario,rol=RolWeb(tipo.nombre_rol)});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> Editar(int id,[FromBody]JsonElement j)
    {
        var u=await db.Usuarios.FindAsync(id);if(u==null)return NotFound();
        try {
            if(ApiUtil.Texto(j,"rol") is string rol && rol!=""){
                var r=await ResolverRol(j);if(r==null)return BadRequest(new{detalle="Rol inexistente."});
                u.id_rol=r.id_rol;u.tipo_usuario=r.tipo_usuario;
            }
            u.usuario=ApiUtil.Texto(j,"usuario",u.usuario)!;
            u.id_trabajador=ApiUtil.Entero(j,"id_trabajador")??u.id_trabajador;
            u.id_cliente=ApiUtil.Entero(j,"id_cliente")??u.id_cliente;
            if(u.tipo_usuario=="T")u.id_cliente=null;else u.id_trabajador=null;
            if(j.TryGetProperty("password",out var pass) && pass.ValueKind==JsonValueKind.String && pass.GetString() is string password && password.Length>0){
                if(password.Length<12)return BadRequest(new{detalle="Contraseña mínima de 12 caracteres."});
                u.hash_contrasena=new PasswordHasher<Usuarios>().HashPassword(u,password);
            }
            await db.SaveChangesAsync();return Ok(new{u.id_usuario,u.usuario});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> Desactivar(int id)
    {
        if(id==ApiUtil.IdUsuario(User))return BadRequest(new{detalle="No puedes desactivar tu propia cuenta."});
        var u=await db.Usuarios.FindAsync(id);if(u==null)return NotFound();u.activo=false;await db.SaveChangesAsync();return Ok(new{mensaje="Usuario desactivado"});
    }
    private Task<Roles?> ResolverRol(JsonElement j)
    {
        var nombre=RolSql(ApiUtil.Texto(j,"rol")??"");
        return db.Roles.FirstOrDefaultAsync(r=>r.nombre_rol==nombre);
    }
}
