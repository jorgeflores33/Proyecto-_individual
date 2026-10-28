using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize(Roles="admin,cajero")]
public sealed class ApiCajaController(PapeleriaContext db) : ControllerBase
{
    [HttpGet("apertura-caja")][HttpGet("apertura-caja/{id:int}")]
    public async Task<IActionResult> Aperturas(int? id=null)
    {
        var s=ApiUtil.Sucursal(User);
        var x=await db.Caja.AsNoTracking().Where(c=>User.IsInRole("admin")||c.id_sucursal==s)
            .OrderByDescending(c=>c.id_caja).Select(c=>new{c.id_caja,id_apertura=c.id_caja,c.id_sucursal,c.id_usuario,
               c.monto_inicial,c.monto_final,c.fecha_apertura,c.fecha_corte,estado=c.fecha_corte==null?"ABIERTA":"CERRADA"}).ToListAsync();
        return id.HasValue?x.FirstOrDefault(x=>x.id_caja==id) is {} v?Ok(v):NotFound():Ok(x);
    }
    [HttpPost("apertura-caja")]
    public async Task<IActionResult> Abrir([FromBody]JsonElement j)
    {
        var su=ApiUtil.Entero(j,"id_sucursal")??ApiUtil.Sucursal(User);
        if(su<=0||(!User.IsInRole("admin")&&su!=ApiUtil.Sucursal(User)))return Forbid();
        var monto=ApiUtil.Decimal(j,"monto_inicial")??-1;
        if(monto<0)return BadRequest(new{detalle="Monto inicial no válido."});
        if(await db.Caja.AnyAsync(c=>c.id_sucursal==su&&c.fecha_corte==null))return Conflict(new{detalle="Ya existe una caja abierta."});
        var c=new Caja{id_sucursal=su,id_usuario=ApiUtil.IdUsuario(User),monto_inicial=monto,fecha_apertura=DateTime.Now};
        db.Caja.Add(c);try{await db.SaveChangesAsync();return Ok(new{id_apertura=c.id_caja,c.id_caja,estado="ABIERTA"});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpGet("corte-caja")]
    public async Task<IActionResult> Cortes()
    {
        var su=ApiUtil.Sucursal(User);
        return Ok(await db.Caja.AsNoTracking().Where(c=>c.fecha_corte!=null&&(User.IsInRole("admin")||c.id_sucursal==su))
            .OrderByDescending(c=>c.fecha_corte).Select(c=>new{id_corte=c.id_caja,id_apertura=c.id_caja,c.id_usuario,c.id_sucursal,c.fecha_corte,c.monto_inicial,c.monto_final,estado="CERRADA"}).ToListAsync());
    }
    [HttpPost("corte-caja")]
    public async Task<IActionResult> Cortar([FromBody]JsonElement j)
    {
        var id=ApiUtil.Entero(j,"id_apertura")??ApiUtil.Entero(j,"id_caja")??0;
        var c=await db.Caja.FindAsync(id);if(c==null)return NotFound();
        if(!User.IsInRole("admin")&&c.id_sucursal!=ApiUtil.Sucursal(User))return Forbid();
        if(c.fecha_corte!=null)return Conflict(new{detalle="Caja cerrada previamente."});
        // Recibe el importe EFECTIVO contado, no el total de cobros con tarjeta.
        var final=ApiUtil.Decimal(j,"efectivo")??ApiUtil.Decimal(j,"monto_final")??-1;
        if(final<0)return BadRequest(new{detalle="Se requiere el efectivo contado."});
        c.monto_final=final;c.fecha_corte=DateTime.Now;
        try{await db.SaveChangesAsync();return Ok(new{id_corte=c.id_caja,id_apertura=c.id_caja,c.monto_final,c.fecha_corte});}
        catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpPut("apertura-caja/{id:int}")]
    public async Task<IActionResult> CierreLegado(int id,[FromBody]JsonElement j)
    {
        var c=await db.Caja.FindAsync(id);if(c==null)return NotFound();
        if(c.fecha_corte==null)return Conflict(new{detalle="Primero registra el corte con efectivo contado."});
        return Ok(new{id_apertura=id,estado="CERRADA"});
    }
    [HttpDelete("apertura-caja/{id:int}")][Authorize(Roles="admin")]
    public IActionResult NoEliminar(int id)=>Conflict(new{detalle="No se eliminan aperturas con fines de auditoría; cierra la caja mediante corte."});
}
