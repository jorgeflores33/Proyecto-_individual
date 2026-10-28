using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize(Roles="admin,cajero")]
public sealed class ApiVentasController(PapeleriaContext db,VentasService service) : ControllerBase
{
    [HttpGet("ventas")][HttpGet("ventas/{id:int}")]
    public async Task<IActionResult> Ventas(int? id=null)
    {
        var sucursal=ApiUtil.Sucursal(User);
        var q=from v in db.Ventas.AsNoTracking() join m in db.Metodos_Pago on v.id_metodo_pago equals m.id_metodo_pago
              where User.IsInRole("admin") || v.id_sucursal==sucursal
              select new{v.id_venta,v.id_cliente,v.id_usuario,v.id_sucursal,v.fecha,v.folio,v.estado,v.tipo_venta,
                         forma_pago=m.nombre_metodo,total=db.Detalle_Ventas.Where(d=>d.id_venta==v.id_venta).Sum(d=>(decimal?)d.subtotal)??0};
        var x=await q.OrderByDescending(x=>x.id_venta).ToListAsync();
        return id.HasValue?x.FirstOrDefault(v=>v.id_venta==id) is {} vv?Ok(vv):NotFound():Ok(x);
    }
    [HttpPost("ventas")]
    public async Task<IActionResult> CrearVenta([FromBody]JsonElement j)
    {
        try {
            var venta=await service.CrearBorradorAsync(ApiUtil.IdUsuario(User),ApiUtil.Sucursal(User),ApiUtil.Entero(j,"id_cliente"),
                ApiUtil.Texto(j,"forma_pago")??"EFECTIVO",ApiUtil.Texto(j,"tipo_venta","MOSTRADOR")!.ToUpperInvariant());
            return Ok(new{venta.id_venta,venta.folio,venta.id_sucursal,venta.id_usuario,venta.estado});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("ventas/{id:int}")]
    public async Task<IActionResult> ActualizarBorrador(int id,[FromBody]JsonElement j)
    {
        var v=await db.Ventas.FindAsync(id);
        if(v==null)return NotFound();
        if(v.estado!="BORRADOR"||v.id_usuario!=ApiUtil.IdUsuario(User)||v.id_sucursal!=ApiUtil.Sucursal(User))return Conflict(new{detalle="La venta no es editable."});
        v.id_cliente=ApiUtil.Entero(j,"id_cliente");
        var met=ApiUtil.Texto(j,"forma_pago");
        if(!string.IsNullOrWhiteSpace(met)){
            var m=await db.Metodos_Pago.FirstOrDefaultAsync(m=>m.nombre_metodo==met.ToUpper());
            if(m==null)return BadRequest(new{detalle="Método de pago inválido."}); v.id_metodo_pago=m.id_metodo_pago;
        }
        try{await db.SaveChangesAsync();return Ok(new{v.id_venta,v.folio});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPost("ventas/{id:int}/confirmar")]
    public async Task<IActionResult> Confirmar(int id)
    {
        try{await service.ConfirmarAsync(id,ApiUtil.IdUsuario(User),ApiUtil.Sucursal(User));return Ok(new{id_venta=id,estado="CONFIRMADA",mensaje="Venta confirmada e inventario actualizado."});}
        catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("ventas/{id:int}")]
    public async Task<IActionResult> CancelarBorrador(int id)
    {
        var v=await db.Ventas.FindAsync(id);if(v==null)return NotFound();
        if(v.estado!="BORRADOR"||v.id_usuario!=ApiUtil.IdUsuario(User))return Conflict(new{detalle="No se pueden cancelar ventas finalizadas."});
        v.estado="CANCELADA";await db.SaveChangesAsync();return Ok(new{mensaje="Borrador cancelado"});
    }
    [HttpGet("detalle-ventas")][HttpGet("detalle-ventas/venta/{id:int}")]
    public async Task<IActionResult> Detalles(int? id=null)
    {
        var q=from d in db.Detalle_Ventas.AsNoTracking() join v in db.Ventas on d.id_venta equals v.id_venta
              where User.IsInRole("admin")||v.id_sucursal==ApiUtil.Sucursal(User)
              select new{d.id_detalle,d.id_venta,d.id_producto,d.cantidad,d.precio_unitario,d.subtotal};
        return Ok(await (id.HasValue?q.Where(d=>d.id_venta==id):q).ToListAsync());
    }
    [HttpPost("detalle-ventas")]
    public async Task<IActionResult> AgregarDetalle([FromBody]JsonElement j)
    {
        try {
            var v=ApiUtil.Entero(j,"id_venta")??0;var p=ApiUtil.Entero(j,"id_producto")??0;var c=ApiUtil.Entero(j,"cantidad")??0;
            var d=await service.AgregarDetalleAsync(v,p,c,ApiUtil.IdUsuario(User),ApiUtil.Sucursal(User));
            return Ok(new{d.id_detalle,d.id_venta,d.id_producto,d.cantidad,d.precio_unitario,d.subtotal});
        }catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpDelete("detalle-ventas/venta/{id:int}")]
    public async Task<IActionResult> BorrarDetalles(int id)
    {
        var v=await db.Ventas.FindAsync(id);if(v==null)return NotFound();
        if(v.id_usuario!=ApiUtil.IdUsuario(User)||v.estado!="BORRADOR")return Conflict(new{detalle="No se permite modificar una venta finalizada."});
        var d=await db.Detalle_Ventas.Where(x=>x.id_venta==id).ToListAsync();db.Detalle_Ventas.RemoveRange(d);
        await db.SaveChangesAsync();return Ok(new{eliminados=d.Count});
    }
}
