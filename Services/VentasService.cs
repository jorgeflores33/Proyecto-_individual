using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;

namespace Papeleria.Services;
public sealed class VentasService(PapeleriaContext db)
{
    public async Task<Ventas> CrearBorradorAsync(int usuario,int sucursal,int? cliente,string metodo,string tipo)
    {
        if(usuario<=0||sucursal<=0)throw new ArgumentException("Inicia sesión como trabajador de una sucursal.");
        if(!await db.Caja.AnyAsync(c=>c.id_sucursal==sucursal&&c.fecha_corte==null))
            throw new ArgumentException("Abre la caja de la sucursal antes de cobrar.");
        var met=await db.Metodos_Pago.FirstOrDefaultAsync(x=>x.nombre_metodo==metodo.ToUpper());
        if(met==null)throw new ArgumentException("Método de pago no encontrado.");
        var v=new Ventas{ id_usuario=usuario,id_cliente=cliente,id_sucursal=sucursal,id_metodo_pago=met.id_metodo_pago,
            tipo_venta=tipo,estado="BORRADOR",fecha=DateTime.Now};
        db.Ventas.Add(v);await db.SaveChangesAsync();return v;
    }
    public async Task ConfirmarAsync(int id,int usuario,int sucursal)
    {
        var venta=await db.Ventas.AsNoTracking().FirstOrDefaultAsync(x=>x.id_venta==id);
        if(venta==null||venta.id_sucursal!=sucursal||venta.id_usuario!=usuario)throw new ArgumentException("Venta no encontrada en tu caja.");
        if(venta.estado!="BORRADOR")throw new ArgumentException("Solo se puede confirmar un borrador.");
        // SQL Server crea movimientos y descuenta stock dentro de la misma transacción.
        await db.Database.ExecuteSqlInterpolatedAsync($"EXEC dbo.sp_ConfirmarVenta @id_venta={id}");
    }
    public async Task<Detalle_Ventas> AgregarDetalleAsync(int idVenta,int idProducto,int cantidad,int usuario,int sucursal)
    {
        if(cantidad<=0)throw new ArgumentException("Cantidad inválida.");
        var venta=await db.Ventas.FirstOrDefaultAsync(v=>v.id_venta==idVenta);
        if(venta==null||venta.id_usuario!=usuario||venta.id_sucursal!=sucursal||venta.estado!="BORRADOR")
            throw new ArgumentException("Venta no disponible para modificaciones.");
        var producto=await db.Productos.FirstOrDefaultAsync(x=>x.id_producto==idProducto&&x.activo);
        if(producto==null)throw new ArgumentException("Producto inexistente o inactivo.");
        var d=new Detalle_Ventas{id_venta=idVenta,id_producto=idProducto,cantidad=cantidad,precio_unitario=producto.precio_venta};
        db.Detalle_Ventas.Add(d);await db.SaveChangesAsync();return d;
    }
}
