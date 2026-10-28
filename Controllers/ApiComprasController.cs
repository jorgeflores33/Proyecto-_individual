using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize(Roles="admin,almacen,contabilidad")]
public sealed class ApiComprasController(PapeleriaContext db) : ControllerBase
{
    [HttpGet("pedidos")]
    public async Task<IActionResult> Pedidos() => Ok(await db.Pedidos.AsNoTracking().OrderByDescending(p=>p.id_pedido).ToListAsync());
    [HttpGet("pedidos/{id:int}")]
    public async Task<IActionResult> Pedido(int id)
    {
        var p=await db.Pedidos.AsNoTracking().FirstOrDefaultAsync(p=>p.id_pedido==id);
        return p==null?NotFound():Ok(p);
    }
    [HttpPost("pedidos")]
    public async Task<IActionResult> CrearPedido([FromBody]JsonElement j)
    {
        // Pedidos = órdenes a proveedores, no pedidos de clientes.
        var prov=ApiUtil.Entero(j,"id_proveedor")??0;var suc=ApiUtil.Entero(j,"id_sucursal")??ApiUtil.Sucursal(User);
        if(prov<=0||suc<=0)return BadRequest(new{detalle="Un pedido requiere proveedor y sucursal."});
        var p=new Pedidos{id_proveedor=prov,id_sucursal=suc,fecha=DateOnly.FromDateTime(DateTime.Today),estado="PENDIENTE"};
        db.Pedidos.Add(p);try{await db.SaveChangesAsync();return Ok(p);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpGet("detalle-pedidos")][HttpGet("detalle_pedidos")]
    public async Task<IActionResult> Detalles()=>Ok(await db.Detalle_Pedidos.AsNoTracking().ToListAsync());
    [HttpPost("detalle-pedidos")]
    public async Task<IActionResult> DetallePedido([FromBody]JsonElement j)
    {
        var id=ApiUtil.Entero(j,"id_pedido")??0;var p=await db.Pedidos.FirstOrDefaultAsync(x=>x.id_pedido==id);
        if(p==null||p.estado!="PENDIENTE")return BadRequest(new{detalle="Pedido no encontrado o finalizado."});
        var precio=ApiUtil.Decimal(j,"precio_estimado")??0;var producto=ApiUtil.Entero(j,"id_producto")??0;var cantidad=ApiUtil.Entero(j,"cantidad")??0;
        if(producto<=0||cantidad<=0||precio<0)return BadRequest(new{detalle="Producto, cantidad y precio estimado son obligatorios."});
        var d=new Detalle_Pedidos{id_pedido=id,id_producto=producto,cantidad=cantidad,precio_estimado=precio};
        db.Detalle_Pedidos.Add(d);try{await db.SaveChangesAsync();return Ok(d);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpGet("facturas-proveedores")]
    public async Task<IActionResult> Facturas()=>Ok(await db.Facturas_Proveedores.AsNoTracking().OrderByDescending(x=>x.id_factura).ToListAsync());
    [HttpPost("facturas-proveedores")]
    public async Task<IActionResult> CrearFactura([FromBody]JsonElement j)
    {
        var prov=ApiUtil.Entero(j,"id_proveedor")??0;var suc=ApiUtil.Entero(j,"id_sucursal")??ApiUtil.Sucursal(User);
        var folio=ApiUtil.Texto(j,"folio");
        if(prov<=0||suc<=0||string.IsNullOrWhiteSpace(folio))return BadRequest(new{detalle="Proveedor, sucursal y folio requeridos."});
        var f=new Facturas_Proveedores{id_proveedor=prov,id_sucursal=suc,folio=folio,estado="BORRADOR",fecha=DateOnly.FromDateTime(DateTime.Today)};
        db.Facturas_Proveedores.Add(f);try{await db.SaveChangesAsync();return Ok(f);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPost("detalle-facturas-proveedores")]
    public async Task<IActionResult> AgregarFacturaDetalle([FromBody]JsonElement j)
    {
        var id=ApiUtil.Entero(j,"id_factura")??0;
        var factura=await db.Facturas_Proveedores.FirstOrDefaultAsync(f=>f.id_factura==id);
        if(factura==null||factura.estado!="BORRADOR")return BadRequest(new{detalle="La factura debe estar en BORRADOR."});
        var precio=ApiUtil.Decimal(j,"precio_unitario")??-1;var cantidad=ApiUtil.Entero(j,"cantidad")??0;
        if(precio<0||cantidad<=0)return BadRequest(new{detalle="Cantidad y precio inválidos."});
        var d=new Detalle_Facturas_Proveedores{id_factura=id,id_producto=ApiUtil.Entero(j,"id_producto")??0,cantidad=cantidad,precio_unitario=precio};
        db.Detalle_Facturas_Proveedores.Add(d);try{await db.SaveChangesAsync();return Ok(d);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPost("facturas-proveedores/{id:int}/recibir")]
    public async Task<IActionResult> RecibirFactura(int id)
    {
        try{await db.Database.ExecuteSqlInterpolatedAsync($"EXEC dbo.sp_RecibirFacturaProveedor @id_factura={id}");return Ok(new{id_factura=id,estado="RECIBIDA"});}
        catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
}
