using Microsoft.EntityFrameworkCore;
using Papeleria.Data;
using Papeleria.Models;

namespace Papeleria.Services;
public sealed class InventarioService(PapeleriaContext db)
{
    public async Task<Movimiento_Almacen> RegistrarAsync(string tipo,int producto,int cantidad,int? origen,int? destino,string? motivo)
    {
        if(cantidad<=0||producto<=0)throw new ArgumentException("Producto o cantidad inválida.");
        if(tipo is not ("TRASPASO" or "AJUSTE_ENTRADA" or "AJUSTE_SALIDA")) throw new ArgumentException("Solo se permiten ajustes y traspasos por esta ruta.");
        if(tipo=="TRASPASO"&&(origen==null||destino==null||origen==destino))throw new ArgumentException("Origen y destino deben ser sucursales diferentes.");
        if(tipo=="AJUSTE_ENTRADA")origen=null;
        if(tipo=="AJUSTE_SALIDA")destino=null;
        if((tipo=="AJUSTE_ENTRADA"&&destino==null)||(tipo=="AJUSTE_SALIDA"&&origen==null))throw new ArgumentException("Sucursal obligatoria.");
        var m=new Movimiento_Almacen{tipo_movimiento=tipo,id_producto=producto,cantidad=cantidad,id_sucursal_origen=origen,id_sucursal_destino=destino,observaciones=motivo,fecha=DateTime.Now};
        db.Movimiento_Almacen.Add(m);
        await db.SaveChangesAsync(); // El trigger en SQL Server valida y actualiza las existencias.
        return m;
    }
}
