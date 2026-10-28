using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize(Roles="admin,cajero,almacen,contabilidad")]
public sealed class ApiInventarioController(PapeleriaContext db,InventarioService inventario) : ControllerBase
{
    [HttpGet("productos-sucursal")][HttpGet("productos-sucursal/{id:int}")]
    public async Task<IActionResult> Existencias(int? id=null)
    {
        var q=from ps in db.Productos_Sucursal.AsNoTracking() join p in db.Productos on ps.id_producto equals p.id_producto
              select new{ps.id_producto,ps.id_sucursal,ps.existencia,producto=p.nombre,precio=p.precio_venta};
        var x=await q.OrderBy(x=>x.id_sucursal).ToListAsync();
        return Ok(id.HasValue?x.Where(x=>x.id_producto==id):x);
    }
    [HttpGet("movimientos")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> Movimientos()=>Ok(await db.Movimiento_Almacen.AsNoTracking().OrderByDescending(m=>m.id_movimiento).Take(300).ToListAsync());
    [HttpPost("movimientos")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> Registrar([FromBody]JsonElement j)
    {
        var tipo=ApiUtil.Texto(j,"tipo_movimiento")?.ToUpperInvariant()??"";
        var origen=ApiUtil.Entero(j,"id_sucursal_origen");var destino=ApiUtil.Entero(j,"id_sucursal_destino");
        // Un almacenista solo mueve existencias de su sucursal.
        if (!User.IsInRole("admin"))
        {
            var propia = ApiUtil.Sucursal(User);
            if ((tipo is "TRASPASO" or "AJUSTE_SALIDA") && origen != propia) return Forbid();
            if (tipo == "AJUSTE_ENTRADA" && destino != propia) return Forbid();
        }
        try {
            var m=await inventario.RegistrarAsync(tipo,ApiUtil.Entero(j,"id_producto")??0,ApiUtil.Entero(j,"cantidad")??0,origen,destino,ApiUtil.Texto(j,"observaciones"));
            return Ok(new{m.id_movimiento,m.tipo_movimiento,m.cantidad});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }

    [HttpGet("productos-sucursal/{producto:int}/{sucursal:int}")]
    public async Task<IActionResult> ObtenerExistencia(int producto,int sucursal)
    {
        var v=await db.Productos_Sucursal.AsNoTracking().FirstOrDefaultAsync(x=>x.id_producto==producto&&x.id_sucursal==sucursal);
        return v==null?NotFound(new{detalle="No existe registro de inventario"}):Ok(new{v.id_producto,v.id_sucursal,v.existencia});
    }
    [HttpPost("productos-sucursal")][Authorize(Roles="admin,almacen")]
    public Task<IActionResult> CrearExistencia([FromBody]JsonElement j) =>
        AjustarExistencia(ApiUtil.Entero(j,"id_producto")??0,ApiUtil.Entero(j,"id_sucursal")??0,j);
    [HttpPut("productos-sucursal/{producto:int}/{sucursal:int}")][Authorize(Roles="admin,almacen")]
    public Task<IActionResult> ActualizarExistencia(int producto,int sucursal,[FromBody]JsonElement j) => AjustarExistencia(producto,sucursal,j);
    private async Task<IActionResult> AjustarExistencia(int producto,int sucursal,JsonElement j)
    {
        var cantidad=ApiUtil.Entero(j,"existencia")??(ApiUtil.Decimal(j,"existencia")==0?0:-1);
        if(producto<=0||sucursal<=0||cantidad<0)return BadRequest(new{detalle="Producto, sucursal y existencia no negativa requeridos."});
        if(!User.IsInRole("admin")&&sucursal!=ApiUtil.Sucursal(User))return Forbid();
        // Compatibilidad con el frontend antiguo: no actualizamos la tabla de stock directamente.
        // Cada ajuste crea un movimiento trazable y el trigger modifica las existencias.
        try{
            await using var tx=await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            var actual=await db.Productos_Sucursal.FirstOrDefaultAsync(x=>x.id_producto==producto&&x.id_sucursal==sucursal);
            var diferencia=cantidad-(actual?.existencia??0);
            if(diferencia!=0)
                await inventario.RegistrarAsync(diferencia>0?"AJUSTE_ENTRADA":"AJUSTE_SALIDA",producto,Math.Abs(diferencia),
                    diferencia<0?sucursal:null,diferencia>0?sucursal:null,"Ajuste manual de inventario");
            await tx.CommitAsync();
            return Ok(new{id_producto=producto,id_sucursal=sucursal,existencia=cantidad});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }

    // Acciones del frontend original que carecen de entidades propias en la BD.
    [HttpGet("inventarios")][HttpGet("detalle-inventarios")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> InventarioCompatible()=>Ok(await db.Productos_Sucursal.AsNoTracking().Select(p=>new{p.id_producto,p.id_sucursal,p.existencia}).ToListAsync());
    [HttpGet("detalle-traspasos")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> DetalleTraspasos()=>Ok(await db.Movimiento_Almacen.AsNoTracking()
        .Where(m=>m.tipo_movimiento=="TRASPASO").Select(m=>new {id_detalle=m.id_movimiento,id_traspaso=m.id_movimiento,m.id_producto,m.cantidad}).ToListAsync());
    [HttpGet("traspasos")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> Traspasos()=>Ok(await db.Movimiento_Almacen.AsNoTracking().Where(m=>m.tipo_movimiento=="TRASPASO")
        .OrderByDescending(m=>m.id_movimiento).Select(m=>new{ id_traspaso=m.id_movimiento,m.id_sucursal_origen,m.id_sucursal_destino,m.id_producto,m.cantidad,m.fecha }).ToListAsync());
    [HttpPost("traspasos")][Authorize(Roles="admin,almacen")]
    public async Task<IActionResult> CrearTraspaso([FromBody]JsonElement j)
    {
        var origen=ApiUtil.Entero(j,"id_sucursal_origen")??0;
        var destino=ApiUtil.Entero(j,"id_sucursal_destino")??0;
        if(origen<=0||destino<=0||origen==destino)return BadRequest(new{detalle="Se requieren sucursales diferentes."});
        if(!User.IsInRole("admin")&&origen!=ApiUtil.Sucursal(User))return Forbid();
        if(!j.TryGetProperty("detalles",out var lista)||lista.ValueKind!=JsonValueKind.Array||lista.GetArrayLength()==0)
            return BadRequest(new{detalle="Agrega al menos un producto al traspaso."});
        var items=lista.EnumerateArray().Select(x=>new{Producto=ApiUtil.Entero(x,"id_producto")??0,Cantidad=ApiUtil.Entero(x,"cantidad")??0}).ToList();
        if(items.Any(i=>i.Producto<=0||i.Cantidad<=0)||items.GroupBy(i=>i.Producto).Any(g=>g.Count()>1))
            return BadRequest(new{detalle="Productos duplicados o cantidades inválidas."});
        try{
            await using var tx=await db.Database.BeginTransactionAsync();
            var registros=new List<long>();
            foreach(var x in items)
            {
                var m=await inventario.RegistrarAsync("TRASPASO",x.Producto,x.Cantidad,origen,destino,"Traspaso entre sucursales");
                registros.Add(m.id_movimiento);
            }
            await tx.CommitAsync();
            return Ok(new{mensaje="Traspaso confirmado",movimientos=registros});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("traspasos/{id:long}")][Authorize(Roles="admin")]
    public IActionResult NoBorrarTraspaso(long id)=>Conflict(new{detalle="Los movimientos de inventario son inmutables; registra un movimiento correctivo."});
}
