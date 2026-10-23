
import "./Reportes.css";

function Reportes({ productos = [] }) {
  const totalProductos = productos.length;

  const totalUnidades = productos.reduce(
    (total, producto) => total + (Number(producto.stock) || 0),
    0
  );

  const valorInventario = productos.reduce(
    (total, producto) =>
      total +
      (Number(producto.price) || 0) *
        (Number(producto.stock) || 0),
    0
  );

  const stockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 &&
      Number(producto.stock) <= 5
  );

  const agotados = productos.filter(
    (producto) => Number(producto.stock) === 0
  );

  const moneda = (valor) =>
    valor.toLocaleString("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 2,
    });

  return (
    <section className="reportes">
      <h2>📊 Reportes de inventario</h2>
      <p>Resumen actualizado de los productos registrados.</p>

      <div className="reportes-grid">
        <article className="reporte-card">
          <span>Total de productos</span>
          <strong>{totalProductos}</strong>
        </article>

        <article className="reporte-card">
          <span>Unidades disponibles</span>
          <strong>{totalUnidades}</strong>
        </article>

        <article className="reporte-card">
          <span>Valor del inventario</span>
          <strong>{moneda(valorInventario)}</strong>
        </article>

        <article className="reporte-card">
          <span>Productos con stock bajo</span>
          <strong>{stockBajo.length}</strong>
        </article>

        <article className="reporte-card">
          <span>Productos agotados</span>
          <strong>{agotados.length}</strong>
        </article>
      </div>

      <h3>Productos que necesitan reposición</h3>

      {stockBajo.length === 0 && agotados.length === 0 ? (
        <p>Todos los productos tienen existencias suficientes.</p>
      ) : (
        <div className="reporte-tabla">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {[...agotados, ...stockBajo].map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.name}</td>
                  <td>{producto.stock}</td>
                  <td>
                    {Number(producto.stock) === 0
                      ? "Agotado"
                      : "Stock bajo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Reportes;
