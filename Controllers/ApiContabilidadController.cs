using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;
using Papeleria.Services;

namespace Papeleria.Controllers;
[ApiController][Route("api")][Authorize(Roles="admin,contabilidad,cajero")]
public sealed class ApiContabilidadController(PapeleriaContext db) : ControllerBase
{
    [Authorize(Roles="admin,contabilidad")]
    [HttpGet("asistencia")][HttpGet("asistencia/{id:int}")]
    public async Task<IActionResult> Asistencia(int? id=null)
    {
        var q=db.Asistencia.AsNoTracking();
        return Ok(await (id.HasValue?q.Where(a=>a.id_asistencia==id):q).OrderByDescending(a=>a.fecha).ToListAsync());
    }
    [Authorize(Roles="admin,contabilidad")]
    [HttpPost("asistencia")]
    public async Task<IActionResult> RegistrarAsistencia([FromBody]JsonElement j)
    {
        var id=ApiUtil.Entero(j,"id_trabajador")??0;var fecha=ApiUtil.Fecha(j,"fecha")??DateOnly.FromDateTime(DateTime.Today);
        var estado=(ApiUtil.Texto(j,"estado","PRESENTE")??"PRESENTE").ToUpperInvariant();
        if(id<=0||estado is not ("PRESENTE" or "FALTA" or "PERMISO"))return BadRequest(new{detalle="Trabajador o estado inválido."});
        var entrada=TimeOnly.TryParse(ApiUtil.Texto(j,"hora_entrada"),out var en)?en:(TimeOnly?)null;
        var salida=TimeOnly.TryParse(ApiUtil.Texto(j,"hora_salida"),out var sa)?sa:(TimeOnly?)null;
        if(estado=="PRESENTE"&&!entrada.HasValue)return BadRequest(new{detalle="La asistencia PRESENTE necesita hora de entrada."});
        var a=new Asistencia{id_trabajador=id,fecha=fecha,estado=estado,hora_entrada=estado=="PRESENTE"?entrada:null,hora_salida=estado=="PRESENTE"?salida:null};
        db.Asistencia.Add(a);try{await db.SaveChangesAsync();return Ok(a);}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [HttpGet("facturas-clientes")]
    public async Task<IActionResult> FacturasClientes()=>Ok(await db.Facturas_Clientes.AsNoTracking().OrderByDescending(f=>f.id_factura_cliente).ToListAsync());
    [HttpPost("facturas-clientes")]
    public async Task<IActionResult> CrearFacturaCliente([FromBody]JsonElement j)
    {
        var id=ApiUtil.Entero(j,"id_venta")??0;
        var v=await db.Ventas.FirstOrDefaultAsync(v=>v.id_venta==id&&v.estado=="CONFIRMADA"&&v.id_cliente!=null);
        if(v==null)return BadRequest(new{detalle="Se necesita venta confirmada con cliente."});
        var metodo=ApiUtil.Entero(j,"id_metodo_pago")??v.id_metodo_pago;
        var folio=ApiUtil.Texto(j,"folio_factura");var emisor=ApiUtil.Texto(j,"rfc_emisor");var receptor=ApiUtil.Texto(j,"rfc_receptor");
        if(string.IsNullOrWhiteSpace(folio)||string.IsNullOrWhiteSpace(emisor)||string.IsNullOrWhiteSpace(receptor))return BadRequest(new{detalle="Folio y RFC emisor/receptor obligatorios."});
        var subtotal=ApiUtil.Decimal(j,"subtotal")??-1;var iva=ApiUtil.Decimal(j,"iva")??-1;
        var total=await db.Detalle_Ventas.Where(d=>d.id_venta==id).SumAsync(d=>(decimal?)d.subtotal)??0;
        if(subtotal<0||iva<0||Math.Abs(subtotal+iva-total)>0.01m)return BadRequest(new{detalle="Subtotal más IVA debe coincidir con el total de la venta."});
        var f=new Facturas_Clientes{id_venta=id,folio_factura=folio,rfc_emisor=emisor,rfc_receptor=receptor,id_metodo_pago=metodo,subtotal=subtotal,iva=iva,fecha_emision=DateTime.Now};
        db.Facturas_Clientes.Add(f);try{await db.SaveChangesAsync();return Ok(new{f.id_factura_cliente,f.folio_factura,total=subtotal+iva});}catch(Exception ex){return ApiUtil.Error(this,ex);}
    }
    [Authorize(Roles="admin,contabilidad")]
    [HttpGet("nomina")][HttpGet("nomina/{id:int}")]
    public IActionResult NominaNoImplementada(int? id=null)=>StatusCode(501,new{detalle="La base normalizada no tiene tablas de períodos, recibos y percepciones de nómina. No se generan pagos ficticios."});
}
