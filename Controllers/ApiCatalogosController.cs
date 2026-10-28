using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;
using Papeleria.Services;

namespace Papeleria.Controllers;

[ApiController]
[Route("api")]
public sealed class ApiCatalogosController(PapeleriaContext db) : ControllerBase
{
    [HttpGet("categorias")]
    [HttpGet("categorias/{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> Categorias(int? id = null)
    {
        var x = await db.Categorias.AsNoTracking().OrderBy(t=>t.nombre_categoria)
            .Select(t=>new { t.id_categoria, nombre=t.nombre_categoria, t.nombre_categoria }).ToListAsync();
        return id.HasValue ? x.FirstOrDefault(t=>t.id_categoria==id) is { } v ? Ok(v):NotFound() : Ok(x);
    }
    [HttpPost("categorias")][Authorize(Roles="admin")]
    public async Task<IActionResult> CrearCategoria([FromBody]JsonElement j)
    {
        var nombre=ApiUtil.Texto(j,"nombre")??ApiUtil.Texto(j,"nombre_categoria");
        if(string.IsNullOrWhiteSpace(nombre)) return BadRequest(new{detalle="El nombre es obligatorio."});
        var c=new Categorias{nombre_categoria=nombre}; db.Categorias.Add(c);
        try{ await db.SaveChangesAsync(); return Ok(new{c.id_categoria,nombre=c.nombre_categoria}); }
        catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("categorias/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EditarCategoria(int id,[FromBody]JsonElement j)
    {
        var c=await db.Categorias.FindAsync(id);if(c==null)return NotFound();
        c.nombre_categoria=ApiUtil.Texto(j,"nombre",ApiUtil.Texto(j,"nombre_categoria",c.nombre_categoria))!;
        try{await db.SaveChangesAsync();return Ok(new{c.id_categoria,nombre=c.nombre_categoria});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("categorias/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EliminarCategoria(int id)
    {
        var c=await db.Categorias.FindAsync(id);if(c==null)return NotFound();
        db.Categorias.Remove(c);try{await db.SaveChangesAsync();return Ok(new{mensaje="Eliminada"});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }

    [HttpGet("sucursales")][HttpGet("sucursales/{id:int}")][AllowAnonymous]
    public async Task<IActionResult> Sucursales(int? id=null)
    {
        var x=await db.Sucursales.AsNoTracking().Where(t=>t.estatus=="ACTIVA").OrderBy(t=>t.nombre_sucursal)
            .Select(t=>new{t.id_sucursal,nombre=t.nombre_sucursal,t.nombre_sucursal,t.direccion,t.telefono,t.id_encargado,t.estatus}).ToListAsync();
        return id.HasValue ? x.FirstOrDefault(t=>t.id_sucursal==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("sucursales")][Authorize(Roles="admin")]
    public async Task<IActionResult> CrearSucursal([FromBody]JsonElement j)
    {
        var n=ApiUtil.Texto(j,"nombre")??ApiUtil.Texto(j,"nombre_sucursal");var dir=ApiUtil.Texto(j,"direccion");
        if(string.IsNullOrWhiteSpace(n)||string.IsNullOrWhiteSpace(dir))return BadRequest(new{detalle="Nombre y dirección son obligatorios."});
        var s=new Sucursales{nombre_sucursal=n,direccion=dir,telefono=ApiUtil.Texto(j,"telefono"),fecha_registro=DateTime.Now,estatus="ACTIVA"};
        db.Sucursales.Add(s);try{await db.SaveChangesAsync();return Ok(new{s.id_sucursal,nombre=s.nombre_sucursal});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("sucursales/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EditarSucursal(int id,[FromBody]JsonElement j)
    {
        var s=await db.Sucursales.FindAsync(id);if(s==null)return NotFound();
        s.nombre_sucursal=ApiUtil.Texto(j,"nombre",s.nombre_sucursal)!;
        s.direccion=ApiUtil.Texto(j,"direccion",s.direccion)!;
        s.telefono=ApiUtil.Texto(j,"telefono",s.telefono);
        try{await db.SaveChangesAsync();return Ok(new{s.id_sucursal,nombre=s.nombre_sucursal});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("sucursales/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> DesactivarSucursal(int id)
    {
        var s=await db.Sucursales.FindAsync(id);if(s==null)return NotFound();s.estatus="INACTIVA";
        await db.SaveChangesAsync();return Ok(new{mensaje="Sucursal desactivada, no se eliminaron movimientos históricos."});
    }

    [HttpGet("productos")][HttpGet("productos/{id:int}")][AllowAnonymous]
    public async Task<IActionResult> Productos(int? id=null)
    {
        var x=await db.Productos.AsNoTracking().Where(t=>t.activo).OrderBy(t=>t.nombre)
           .Select(t=>new{t.id_producto,t.nombre,t.codigo,t.id_categoria,t.id_marca,t.modelo,t.descripcion,t.imagen_url,precio=t.precio_venta,t.precio_venta,t.activo}).ToListAsync();
        return id.HasValue ? x.FirstOrDefault(t=>t.id_producto==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("productos")][Authorize(Roles="admin")]
    public async Task<IActionResult> CrearProducto([FromBody]JsonElement j)
    {
        var precio=ApiUtil.Decimal(j,"precio")??ApiUtil.Decimal(j,"precio_venta")??-1;
        var idcat=ApiUtil.Entero(j,"id_categoria");var codigo=ApiUtil.Texto(j,"codigo");var nombre=ApiUtil.Texto(j,"nombre");
        if(idcat==null||precio<0||string.IsNullOrWhiteSpace(codigo)||string.IsNullOrWhiteSpace(nombre))return BadRequest(new{detalle="Código, nombre, categoría y precio válido son obligatorios."});
        var v=new Productos{nombre=nombre,codigo=codigo,id_categoria=idcat.Value,id_marca=ApiUtil.Entero(j,"id_marca"),modelo=ApiUtil.Texto(j,"modelo"),descripcion=ApiUtil.Texto(j,"descripcion"),imagen_url=ApiUtil.Texto(j,"imagen_url"),precio_venta=precio,activo=true};
        db.Productos.Add(v);try{await db.SaveChangesAsync();return Ok(new{v.id_producto,v.nombre,v.codigo,precio=v.precio_venta});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("productos/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EditarProducto(int id,[FromBody]JsonElement j)
    {
        var v=await db.Productos.FindAsync(id);if(v==null)return NotFound();
        v.codigo=ApiUtil.Texto(j,"codigo",v.codigo)!;
        v.nombre=ApiUtil.Texto(j,"nombre",v.nombre)!;
        v.id_categoria=ApiUtil.Entero(j,"id_categoria")??v.id_categoria;
        v.id_marca=ApiUtil.Entero(j,"id_marca")??v.id_marca;
        v.descripcion=ApiUtil.Texto(j,"descripcion",v.descripcion);
        v.imagen_url=ApiUtil.Texto(j,"imagen_url",v.imagen_url);
        v.modelo=ApiUtil.Texto(j,"modelo",v.modelo);
        v.precio_venta=ApiUtil.Decimal(j,"precio")??ApiUtil.Decimal(j,"precio_venta")??v.precio_venta;
        try{await db.SaveChangesAsync();return Ok(new{v.id_producto,v.nombre,precio=v.precio_venta});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("productos/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> DesactivarProducto(int id)
    {
        var p=await db.Productos.FindAsync(id);if(p==null)return NotFound();p.activo=false;
        await db.SaveChangesAsync();return Ok(new{mensaje="Producto desactivado; se conservan las ventas históricas."});
    }

    [HttpGet("clientes")][HttpGet("clientes/{id:int}")][Authorize(Roles="admin,cajero,contabilidad")]
    public async Task<IActionResult> Clientes(int? id=null)
    {
        var x=await db.Clientes.AsNoTracking().OrderBy(t=>t.nombre_cliente).Select(t=>new{t.id_cliente,nombre=t.nombre_cliente,t.nombre_cliente,t.fecha_nacimiento,t.RFC,t.telefono,t.correo,t.folio}).ToListAsync();
        return id.HasValue ? x.FirstOrDefault(t=>t.id_cliente==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("clientes")][Authorize(Roles="admin,cajero,contabilidad")]
    public async Task<IActionResult> CrearCliente([FromBody]JsonElement j)
    {
        var n=ApiUtil.Texto(j,"nombre")??ApiUtil.Texto(j,"nombre_cliente");if(string.IsNullOrWhiteSpace(n))return BadRequest(new{detalle="Nombre obligatorio."});
        var c=new Clientes{nombre_cliente=n,fecha_nacimiento=ApiUtil.Fecha(j,"fecha_nacimiento"),RFC=ApiUtil.Texto(j,"RFC")??ApiUtil.Texto(j,"rfc"),telefono=ApiUtil.Texto(j,"telefono"),correo=ApiUtil.Texto(j,"correo")};
        db.Clientes.Add(c);try{await db.SaveChangesAsync();return Ok(new{c.id_cliente,nombre=c.nombre_cliente,c.folio});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("clientes/{id:int}")][Authorize(Roles="admin,cajero,contabilidad")]
    public async Task<IActionResult> EditarCliente(int id,[FromBody]JsonElement j)
    {
        var c=await db.Clientes.FindAsync(id);if(c==null)return NotFound();
        c.nombre_cliente=ApiUtil.Texto(j,"nombre",ApiUtil.Texto(j,"nombre_cliente",c.nombre_cliente))!;
        c.telefono=ApiUtil.Texto(j,"telefono",c.telefono);c.correo=ApiUtil.Texto(j,"correo",c.correo);
        c.RFC=ApiUtil.Texto(j,"RFC",ApiUtil.Texto(j,"rfc",c.RFC));c.fecha_nacimiento=ApiUtil.Fecha(j,"fecha_nacimiento")??c.fecha_nacimiento;
        try{await db.SaveChangesAsync();return Ok(new{c.id_cliente,nombre=c.nombre_cliente});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("clientes/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EliminarCliente(int id)
    {
        var c=await db.Clientes.FindAsync(id);if(c==null)return NotFound();db.Clientes.Remove(c);
        try{await db.SaveChangesAsync();return Ok(new{mensaje="Eliminado"});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpGet("proveedores")][HttpGet("proveedores/{id:int}")][Authorize(Roles="admin,almacen,contabilidad")]
    public async Task<IActionResult> Proveedores(int? id=null)
    {
        var x=await db.Proveedores.AsNoTracking().OrderBy(t=>t.nombre_proveedor).Select(t=>new{t.id_proveedor,nombre=t.nombre_proveedor,t.nombre_proveedor,t.telefono,t.correo,t.direccion,t.RFC,t.folio}).ToListAsync();
        return id.HasValue ? x.FirstOrDefault(t=>t.id_proveedor==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("proveedores")][Authorize(Roles="admin,contabilidad")]
    public async Task<IActionResult> CrearProveedor([FromBody]JsonElement j)
    {
        var nombre=ApiUtil.Texto(j,"nombre",ApiUtil.Texto(j,"nombre_proveedor"));var dir=ApiUtil.Texto(j,"direccion");
        if(string.IsNullOrWhiteSpace(nombre)||string.IsNullOrWhiteSpace(dir))return BadRequest(new{detalle="Nombre y dirección obligatorios."});
        var s=new Proveedores{nombre_proveedor=nombre,direccion=dir,telefono=ApiUtil.Texto(j,"telefono"),correo=ApiUtil.Texto(j,"correo"),RFC=ApiUtil.Texto(j,"RFC")??ApiUtil.Texto(j,"rfc")};
        db.Proveedores.Add(s);try{await db.SaveChangesAsync();return Ok(new{s.id_proveedor,nombre=s.nombre_proveedor});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("proveedores/{id:int}")][Authorize(Roles="admin,contabilidad")]
    public async Task<IActionResult> EditarProveedor(int id,[FromBody]JsonElement j)
    {
        var s=await db.Proveedores.FindAsync(id);if(s==null)return NotFound();
        s.nombre_proveedor=ApiUtil.Texto(j,"nombre",ApiUtil.Texto(j,"nombre_proveedor",s.nombre_proveedor))!;
        s.direccion=ApiUtil.Texto(j,"direccion",s.direccion)!;s.telefono=ApiUtil.Texto(j,"telefono",s.telefono);
        s.correo=ApiUtil.Texto(j,"correo",s.correo);s.RFC=ApiUtil.Texto(j,"RFC",ApiUtil.Texto(j,"rfc",s.RFC));
        try{await db.SaveChangesAsync();return Ok(new{s.id_proveedor,nombre=s.nombre_proveedor});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("proveedores/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EliminarProveedor(int id)
    {
        var v=await db.Proveedores.FindAsync(id);if(v==null)return NotFound();db.Proveedores.Remove(v);
        try{await db.SaveChangesAsync();return Ok(new{mensaje="Eliminado"});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }

    [HttpGet("trabajadores")][HttpGet("trabajadores/{id:int}")][Authorize(Roles="admin,cajero,almacen,contabilidad")]
    public async Task<IActionResult> Trabajadores(int? id=null)
    {
        var x=await (from t in db.Trabajadores.AsNoTracking().Where(t=>t.activo) join a in db.Areas on t.id_area equals a.id_area
                     orderby t.nombre select new {t.id_trabajador,t.nombre,t.fecha_nacimiento,t.salario,area=a.nombre_area,t.id_area,t.id_sucursal,t.activo}).ToListAsync();
        if (!User.IsInRole("admin") && !User.IsInRole("contabilidad"))
        {
            var directorio=x.Select(t=>new {t.id_trabajador,t.nombre,t.area,t.id_area,t.id_sucursal,t.activo}).ToList();
            return id.HasValue ? directorio.FirstOrDefault(t=>t.id_trabajador==id) is {} d ? Ok(d) : NotFound() : Ok(directorio);
        }
        return id.HasValue ? x.FirstOrDefault(t=>t.id_trabajador==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("trabajadores")][Authorize(Roles="admin")]
    public async Task<IActionResult> CrearTrabajador([FromBody]JsonElement j)
    {
        try {
            var t=await DatosTrabajador(j,new Trabajadores());db.Trabajadores.Add(t);await db.SaveChangesAsync();return Ok(t);
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("trabajadores/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> EditarTrabajador(int id,[FromBody]JsonElement j)
    {
        var t=await db.Trabajadores.FindAsync(id);if(t==null)return NotFound();
        try{await DatosTrabajador(j,t);await db.SaveChangesAsync();return Ok(t);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    private async Task<Trabajadores> DatosTrabajador(JsonElement j,Trabajadores t)
    {
        t.nombre=ApiUtil.Texto(j,"nombre",t.nombre)!;
        t.fecha_nacimiento=ApiUtil.Fecha(j,"fecha_nacimiento")??t.fecha_nacimiento;
        t.salario=ApiUtil.Decimal(j,"salario")??t.salario;
        t.id_sucursal=ApiUtil.Entero(j,"id_sucursal")??(t.id_sucursal>0?t.id_sucursal:ApiUtil.Sucursal(User));
        if(t.id_sucursal==0) t.id_sucursal=await db.Sucursales.Select(s=>s.id_sucursal).OrderBy(id=>id).FirstOrDefaultAsync();
        var area=ApiUtil.Texto(j,"area");
        if(ApiUtil.Entero(j,"id_area") is int areaId)t.id_area=areaId;
        else if(!string.IsNullOrWhiteSpace(area)) {
            var registrado=await db.Areas.FirstOrDefaultAsync(x=>x.nombre_area==area);
            if(registrado==null){ registrado=new Areas{nombre_area=area};db.Areas.Add(registrado);await db.SaveChangesAsync();}
            t.id_area=registrado.id_area;
        }
        if(string.IsNullOrWhiteSpace(t.nombre)||t.id_area==0||t.id_sucursal==0||t.fecha_nacimiento==default||t.salario<0)
            throw new ArgumentException("Se requiere nombre, fecha de nacimiento, área y sucursal; salario no negativo.");
        t.activo=true;return t;
    }
    [HttpDelete("trabajadores/{id:int}")][Authorize(Roles="admin")]
    public async Task<IActionResult> DesactivarTrabajador(int id)
    {
        var t=await db.Trabajadores.FindAsync(id);if(t==null)return NotFound();t.activo=false;await db.SaveChangesAsync();return Ok(new{mensaje="Trabajador desactivado"});
    }
    [HttpGet("areas")][Authorize(Roles="admin,cajero,almacen,contabilidad")]
    public async Task<IActionResult> Areas()=>Ok(await db.Areas.AsNoTracking().ToListAsync());
    [HttpGet("marcas")][AllowAnonymous]
    public async Task<IActionResult> Marcas()=>Ok(await db.Marcas.AsNoTracking().ToListAsync());
    [HttpGet("metodos-pago")][Authorize(Roles="admin,cajero,contabilidad")]
    public async Task<IActionResult> Metodos()=>Ok(await db.Metodos_Pago.AsNoTracking().ToListAsync());
}
