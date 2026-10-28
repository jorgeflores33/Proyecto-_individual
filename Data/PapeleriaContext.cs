using Microsoft.EntityFrameworkCore;
using Papeleria.Models;

namespace Papeleria.Data;

public sealed class PapeleriaContext : DbContext
{
    public PapeleriaContext(DbContextOptions<PapeleriaContext> options) : base(options) { }

    public DbSet<Categorias> Categorias => Set<Categorias>();
    public DbSet<Areas> Areas => Set<Areas>();
    public DbSet<Marcas> Marcas => Set<Marcas>();
    public DbSet<Metodos_Pago> Metodos_Pago => Set<Metodos_Pago>();
    public DbSet<Roles> Roles => Set<Roles>();
    public DbSet<Sucursales> Sucursales => Set<Sucursales>();
    public DbSet<Trabajadores> Trabajadores => Set<Trabajadores>();
    public DbSet<Clientes> Clientes => Set<Clientes>();
    public DbSet<Proveedores> Proveedores => Set<Proveedores>();
    public DbSet<Productos> Productos => Set<Productos>();
    public DbSet<Usuarios> Usuarios => Set<Usuarios>();
    public DbSet<Ventas> Ventas => Set<Ventas>();
    public DbSet<Detalle_Ventas> Detalle_Ventas => Set<Detalle_Ventas>();
    public DbSet<Productos_Sucursal> Productos_Sucursal => Set<Productos_Sucursal>();
    public DbSet<Facturas_Proveedores> Facturas_Proveedores => Set<Facturas_Proveedores>();
    public DbSet<Detalle_Facturas_Proveedores> Detalle_Facturas_Proveedores => Set<Detalle_Facturas_Proveedores>();
    public DbSet<Facturas_Clientes> Facturas_Clientes => Set<Facturas_Clientes>();
    public DbSet<Pedidos> Pedidos => Set<Pedidos>();
    public DbSet<Detalle_Pedidos> Detalle_Pedidos => Set<Detalle_Pedidos>();
    public DbSet<Asistencia> Asistencia => Set<Asistencia>();
    public DbSet<Caja> Caja => Set<Caja>();
    public DbSet<Movimiento_Almacen> Movimiento_Almacen => Set<Movimiento_Almacen>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categorias>(e =>
        {
            e.ToTable("Categorias");
            e.HasKey(x => x.id_categoria);
            e.Property(x => x.id_categoria).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_categoria).HasMaxLength(100).IsRequired();
        });
        modelBuilder.Entity<Areas>(e =>
        {
            e.ToTable("Areas");
            e.HasKey(x => x.id_area);
            e.Property(x => x.id_area).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_area).HasMaxLength(70).IsRequired();
        });
        modelBuilder.Entity<Marcas>(e =>
        {
            e.ToTable("Marcas");
            e.HasKey(x => x.id_marca);
            e.Property(x => x.id_marca).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_marca).HasMaxLength(80).IsRequired();
        });
        modelBuilder.Entity<Metodos_Pago>(e =>
        {
            e.ToTable("Metodos_Pago");
            e.HasKey(x => x.id_metodo_pago);
            e.Property(x => x.id_metodo_pago).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_metodo).HasMaxLength(40).IsRequired();
        });
        modelBuilder.Entity<Roles>(e =>
        {
            e.ToTable("Roles");
            e.HasKey(x => x.id_rol);
            e.Property(x => x.id_rol).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_rol).HasMaxLength(40).IsRequired();
            e.Property(x => x.tipo_usuario).IsUnicode(false).HasMaxLength(1).IsRequired();
        });
        modelBuilder.Entity<Sucursales>(e =>
        {
            e.ToTable("Sucursales");
            e.HasKey(x => x.id_sucursal);
            e.Property(x => x.id_sucursal).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_sucursal).HasMaxLength(100).IsRequired();
            e.Property(x => x.direccion).HasMaxLength(200).IsRequired();
            e.Property(x => x.telefono).IsUnicode(false).HasMaxLength(15);
            e.Property(x => x.fecha_registro).HasColumnType("datetime2(0)");
            e.Property(x => x.estatus).IsUnicode(false).HasMaxLength(10).IsRequired();
        });
        modelBuilder.Entity<Trabajadores>(e =>
        {
            e.ToTable("Trabajadores");
            e.HasKey(x => x.id_trabajador);
            e.Property(x => x.id_trabajador).ValueGeneratedOnAdd();
            e.Property(x => x.nombre).HasMaxLength(100).IsRequired();
            e.Property(x => x.fecha_nacimiento).HasColumnType("date");
            e.Property(x => x.salario).HasColumnType("decimal(12,2)");
        });
        modelBuilder.Entity<Clientes>(e =>
        {
            e.ToTable("Clientes");
            e.HasKey(x => x.id_cliente);
            e.Property(x => x.id_cliente).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_cliente).HasMaxLength(120).IsRequired();
            e.Property(x => x.fecha_nacimiento).HasColumnType("date");
            e.Property(x => x.RFC).IsUnicode(false).HasMaxLength(13);
            e.Property(x => x.telefono).IsUnicode(false).HasMaxLength(15);
            e.Property(x => x.correo).IsUnicode(false).HasMaxLength(150);
            e.Property(x => x.folio).ValueGeneratedOnAddOrUpdate().IsUnicode(false).IsRequired();
        });
        modelBuilder.Entity<Proveedores>(e =>
        {
            e.ToTable("Proveedores");
            e.HasKey(x => x.id_proveedor);
            e.Property(x => x.id_proveedor).ValueGeneratedOnAdd();
            e.Property(x => x.nombre_proveedor).HasMaxLength(120).IsRequired();
            e.Property(x => x.telefono).IsUnicode(false).HasMaxLength(15);
            e.Property(x => x.correo).IsUnicode(false).HasMaxLength(150);
            e.Property(x => x.direccion).HasMaxLength(200).IsRequired();
            e.Property(x => x.RFC).IsUnicode(false).HasMaxLength(13);
            e.Property(x => x.folio).ValueGeneratedOnAddOrUpdate().IsUnicode(false).IsRequired();
        });
        modelBuilder.Entity<Productos>(e =>
        {
            e.ToTable("Productos");
            e.Property(x => x.descripcion).HasMaxLength(1000);
            e.Property(x => x.imagen_url).HasMaxLength(500);
            e.HasKey(x => x.id_producto);
            e.Property(x => x.id_producto).ValueGeneratedOnAdd();
            e.Property(x => x.nombre).HasMaxLength(120).IsRequired();
            e.Property(x => x.codigo).IsUnicode(false).HasMaxLength(50).IsRequired();
            e.Property(x => x.modelo).HasMaxLength(70);
            e.Property(x => x.precio_venta).HasColumnType("decimal(12,2)");
        });
        modelBuilder.Entity<Usuarios>(e =>
        {
            e.ToTable("Usuarios");
            e.HasKey(x => x.id_usuario);
            e.Property(x => x.id_usuario).ValueGeneratedOnAdd();
            e.Property(x => x.tipo_usuario).IsUnicode(false).HasMaxLength(1).IsRequired();
            e.Property(x => x.usuario).HasMaxLength(60).IsRequired();
            e.Property(x => x.hash_contrasena).IsUnicode(false).HasMaxLength(255).IsRequired();
        });
        modelBuilder.Entity<Ventas>(e =>
        {
            e.ToTable("Ventas", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_venta);
            e.Property(x => x.id_venta).ValueGeneratedOnAdd();
            e.Property(x => x.tipo_venta).IsUnicode(false).HasMaxLength(12).IsRequired();
            e.Property(x => x.estado).IsUnicode(false).HasMaxLength(12).IsRequired();
            e.Property(x => x.fecha).HasColumnType("datetime2(0)");
            e.Property(x => x.folio).ValueGeneratedOnAddOrUpdate().IsUnicode(false).IsRequired();
        });
        modelBuilder.Entity<Detalle_Ventas>(e =>
        {
            e.ToTable("Detalle_Ventas", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_detalle);
            e.Property(x => x.id_detalle).ValueGeneratedOnAdd();
            e.Property(x => x.precio_unitario).HasColumnType("decimal(12,2)");
            e.Property(x => x.subtotal).ValueGeneratedOnAddOrUpdate().HasColumnType("decimal(18,2)");
        });
        modelBuilder.Entity<Productos_Sucursal>(e =>
        {
            e.ToTable("Productos_Sucursal");
            e.HasKey(x => new { x.id_producto, x.id_sucursal });
        });
        modelBuilder.Entity<Facturas_Proveedores>(e =>
        {
            e.ToTable("Facturas_Proveedores", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_factura);
            e.Property(x => x.id_factura).ValueGeneratedOnAdd();
            e.Property(x => x.folio).HasMaxLength(50).IsRequired();
            e.Property(x => x.fecha).HasColumnType("date");
            e.Property(x => x.estado).IsUnicode(false).HasMaxLength(12).IsRequired();
        });
        modelBuilder.Entity<Detalle_Facturas_Proveedores>(e =>
        {
            e.ToTable("Detalle_Facturas_Proveedores", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_detalle);
            e.Property(x => x.id_detalle).ValueGeneratedOnAdd();
            e.Property(x => x.precio_unitario).HasColumnType("decimal(12,2)");
            e.Property(x => x.subtotal).ValueGeneratedOnAddOrUpdate().HasColumnType("decimal(18,2)");
        });
        modelBuilder.Entity<Facturas_Clientes>(e =>
        {
            e.ToTable("Facturas_Clientes", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_factura_cliente);
            e.Property(x => x.id_factura_cliente).ValueGeneratedOnAdd();
            e.Property(x => x.folio_factura).HasMaxLength(50).IsRequired();
            e.Property(x => x.rfc_emisor).IsUnicode(false).HasMaxLength(13).IsRequired();
            e.Property(x => x.rfc_receptor).IsUnicode(false).HasMaxLength(13).IsRequired();
            e.Property(x => x.subtotal).HasColumnType("decimal(18,2)");
            e.Property(x => x.iva).HasColumnType("decimal(18,2)");
            e.Property(x => x.total).ValueGeneratedOnAddOrUpdate().HasColumnType("decimal(18,2)");
            e.Property(x => x.fecha_emision).HasColumnType("datetime2(0)");
        });
        modelBuilder.Entity<Pedidos>(e =>
        {
            e.ToTable("Pedidos");
            e.HasKey(x => x.id_pedido);
            e.Property(x => x.id_pedido).ValueGeneratedOnAdd();
            e.Property(x => x.fecha).HasColumnType("date");
            e.Property(x => x.estado).IsUnicode(false).HasMaxLength(12).IsRequired();
        });
        modelBuilder.Entity<Detalle_Pedidos>(e =>
        {
            e.ToTable("Detalle_Pedidos");
            e.HasKey(x => x.id_detalle);
            e.Property(x => x.id_detalle).ValueGeneratedOnAdd();
            e.Property(x => x.precio_estimado).HasColumnType("decimal(12,2)");
            e.Property(x => x.subtotal).ValueGeneratedOnAddOrUpdate().HasColumnType("decimal(18,2)");
        });
        modelBuilder.Entity<Asistencia>(e =>
        {
            e.ToTable("Asistencia");
            e.HasKey(x => x.id_asistencia);
            e.Property(x => x.id_asistencia).ValueGeneratedOnAdd();
            e.Property(x => x.fecha).HasColumnType("date");
            e.Property(x => x.hora_entrada).HasColumnType("time(0)");
            e.Property(x => x.hora_salida).HasColumnType("time(0)");
            e.Property(x => x.estado).IsUnicode(false).HasMaxLength(10).IsRequired();
        });
        modelBuilder.Entity<Caja>(e =>
        {
            e.ToTable("Caja", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_caja);
            e.Property(x => x.id_caja).ValueGeneratedOnAdd();
            e.Property(x => x.fecha_apertura).HasColumnType("datetime2(0)");
            e.Property(x => x.monto_inicial).HasColumnType("decimal(12,2)");
            e.Property(x => x.fecha_corte).HasColumnType("datetime2(0)");
            e.Property(x => x.monto_final).HasColumnType("decimal(12,2)");
        });
        modelBuilder.Entity<Movimiento_Almacen>(e =>
        {
            e.ToTable("Movimiento_Almacen", tb => tb.UseSqlOutputClause(false));
            e.HasKey(x => x.id_movimiento);
            e.Property(x => x.id_movimiento).ValueGeneratedOnAdd();
            e.Property(x => x.tipo_movimiento).IsUnicode(false).HasMaxLength(15).IsRequired();
            e.Property(x => x.fecha).HasColumnType("datetime2(0)");
            e.Property(x => x.observaciones).HasMaxLength(250);
        });
    }
}
