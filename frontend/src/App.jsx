
import { useEffect, useState } from "react";
import "./App.css";
import Reportes from "./Reportes";
import Product3DViewer from "./components/Product3DViewer";

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  registrarVenta,
  obtenerVentas,
} from "./api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const FORMULARIO_VACIO = {
  name: "",
  price: "",
  stock: "",
  image_url: null,
};

function formatoBs(valor) {
  return Number(valor || 0).toLocaleString("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function App() {
  const [vista, setVista] = useState("inventario");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState("admin");
  const [contrasena, setContrasena] = useState("");

  const [productos, setProductos] = useState([]);
  const [producto3D, setProducto3D] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState({ ...FORMULARIO_VACIO });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [ventas, setVentas] = useState([]);
  const [itemsVenta, setItemsVenta] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [registrandoVenta, setRegistrandoVenta] = useState(false);

  // Cargar productos desde la API
  async function cargarProductos(jwt = token) {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerProductos(jwt);

      if (!Array.isArray(datos)) {
        throw new Error("La respuesta de productos no es válida.");
      }

      setProductos(datos);

      // Mantener actualizado el producto seleccionado para el visor 3D.
      setProducto3D((actual) => {
        if (!actual) return null;

        return datos.find(
          (producto) => Number(producto.id) === Number(actual.id)
        ) ?? null;
      });
    } catch (e) {
      setError(e.message || "No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }

  // Cargar historial de ventas
  async function cargarVentas(jwt = token) {
    setCargandoVentas(true);
    setError("");

    try {
      const datos = await obtenerVentas(jwt);

      if (!Array.isArray(datos)) {
        throw new Error("La respuesta del historial no es válida.");
      }

      setVentas(datos);
    } catch (e) {
      setError(e.message || "No se pudieron consultar las ventas.");
    } finally {
      setCargandoVentas(false);
    }
  }

  // Iniciar sesión
  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const urlLogin = API_URL + "/api/v1/auth/login";

      const respuesta = await fetch(urlLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usuario.trim(),
          password: contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "Usuario o contraseña incorrectos."
        );
      }

      if (!datos.access_token) {
        throw new Error("La API no devolvió un token de acceso.");
      }

      setContrasena("");
      setToken(datos.access_token);
      setVista("inventario");
      setMensaje("Sesión iniciada correctamente.");

      await cargarProductos(datos.access_token);
    } catch (e) {
      setError(e.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (token) {
      cargarProductos(token);
    }
  }, [token]);

  // Preparar formulario de nuevo producto
  function prepararNuevo() {
    setEditando(null);
    setNuevo({ ...FORMULARIO_VACIO });
    setMostrarFormulario(true);
    setMensaje("");
    setError("");
  }

  // Preparar edición de producto
  function prepararEdicion(producto) {
    setEditando(producto.id);
    setNuevo({
      name: producto.name ?? "",
      price: String(producto.price ?? ""),
      stock: String(producto.stock ?? 0),
      image_url: producto.image_url ?? null,
    });
    setMostrarFormulario(true);
    setMensaje("");
    setError("");
  }

  // Crear o actualizar producto
  async function guardarProducto(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const nombre = nuevo.name.trim();
    const precio = Number(nuevo.price);
    const stock = Number(nuevo.stock);

    if (nombre.length < 2 || nombre.length > 100) {
      setError("El nombre debe tener entre 2 y 100 caracteres.");
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setError("El precio debe ser mayor que cero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un entero igual o mayor que cero.");
      return;
    }

    const datos = {
      name: nombre,
      price: precio,
      stock,
      image_url: nuevo.image_url || null,
    };

    setGuardando(true);

    try {
      if (editando !== null) {
        await actualizarProducto(editando, datos, token);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(datos, token);
        setMensaje("Producto registrado correctamente.");
      }

      setMostrarFormulario(false);
      setEditando(null);
      setNuevo({ ...FORMULARIO_VACIO });
      await cargarProductos(token);
    } catch (e) {
      setError(e.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  // Eliminar producto
  async function borrarProducto(id) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");

    try {
      await eliminarProducto(id, token);
      setMensaje("Producto eliminado correctamente.");
      await cargarProductos(token);
    } catch (e) {
      setError(e.message || "No se pudo eliminar el producto.");
    }
  }

  // Agregar producto a la venta
  function agregarItemVenta(productoId) {
    const id = Number(productoId);
    const producto = productos.find((p) => Number(p.id) === id);

    if (!producto) {
      setError("No se encontró el producto seleccionado.");
      return;
    }

    if (Number(producto.stock) <= 0) {
      setError("Este producto no tiene existencias.");
      return;
    }

    setError("");
    setMensaje("");

    setItemsVenta((actuales) => {
      const existente = actuales.find(
        (item) => Number(item.product_id) === id
      );

      if (existente) {
        if (Number(existente.quantity) >= Number(producto.stock)) {
          setError("La cantidad supera las existencias disponibles.");
          return actuales;
        }

        return actuales.map((item) =>
          Number(item.product_id) === id
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        );
      }

      return [...actuales, { product_id: id, quantity: 1 }];
    });
  }

  // Cambiar cantidad de un producto
  function cambiarCantidad(productoId, cantidad) {
    const id = Number(productoId);
    const producto = productos.find((p) => Number(p.id) === id);
    const nuevaCantidad = Number(cantidad);

    if (!producto) return;

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }

    if (nuevaCantidad > Number(producto.stock)) {
      setError("Stock disponible: " + producto.stock + ".");
      return;
    }

    setError("");

    setItemsVenta((actuales) =>
      actuales.map((item) =>
        Number(item.product_id) === id
          ? { ...item, quantity: nuevaCantidad }
          : item
      )
    );
  }

  // Quitar producto de la venta
  function quitarItemVenta(productoId) {
    const id = Number(productoId);

    setItemsVenta((actuales) =>
      actuales.filter((item) => Number(item.product_id) !== id)
    );

    setError("");
  }

  // Calcular el total de la venta
  const totalVenta = itemsVenta.reduce((total, item) => {
    const producto = productos.find(
      (p) => Number(p.id) === Number(item.product_id)
    );

    const precio = Number(producto?.price) || 0;
    const cantidad = Number(item.quantity) || 0;

    return total + precio * cantidad;
  }, 0);

  // Registrar venta
  async function confirmarVenta() {
    if (itemsVenta.length === 0) {
      setError("Agrega al menos un producto a la venta.");
      return;
    }

    for (const item of itemsVenta) {
      const producto = productos.find(
        (p) => Number(p.id) === Number(item.product_id)
      );

      if (!producto || Number(item.quantity) > Number(producto.stock)) {
        const nombreProducto = producto
          ? producto.name
          : "uno de los productos";

        setError(
          "No hay existencias suficientes para " +
            nombreProducto +
            ". Actualiza el inventario e inténtalo de nuevo."
        );
        return;
      }
    }

    const confirmar = window.confirm(
      "¿Registrar la venta por " + formatoBs(totalVenta) + "?"
    );

    if (!confirmar) return;

    setRegistrandoVenta(true);
    setError("");
    setMensaje("");

    try {
      const resultado = await registrarVenta(itemsVenta, token);

      setMensaje(
        "Venta #" +
          resultado.id +
          " registrada correctamente. Total: " +
          formatoBs(resultado.total) +
          "."
      );

      setItemsVenta([]);
      await cargarProductos(token);
      await cargarVentas(token);
    } catch (e) {
      setError(e.message || "No se pudo registrar la venta.");
    } finally {
      setRegistrandoVenta(false);
    }
  }

  // Abrir módulo de ventas
  async function abrirVentas() {
    setVista("ventas");
    setMostrarFormulario(false);
    setMensaje("");
    setError("");
    await cargarVentas(token);
  }

  // Cerrar sesión
  function cerrarSesion() {
    setToken("");
    setProductos([]);
    setVentas([]);
    setItemsVenta([]);
    setProducto3D(null);
    setMensaje("");
    setError("");
    setBusqueda("");
    setMostrarFormulario(false);
    setEditando(null);
    setNuevo({ ...FORMULARIO_VACIO });
    setVista("inventario");
  }

  // Buscar productos
  const termino = busqueda.trim().toLowerCase();

  const filtrados = productos.filter((producto) =>
    String(producto.name ?? "").toLowerCase().includes(termino)
  );

  // Estadísticas del inventario
  const totalUnidades = productos.reduce(
    (total, producto) => total + (Number(producto.stock) || 0),
    0
  );

  const valorInventario = productos.reduce(
    (total, producto) =>
      total +
      (Number(producto.price) || 0) * (Number(producto.stock) || 0),
    0
  );

  const productosStockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 && Number(producto.stock) <= 5
  );

  const productosSinStock = productos.filter(
    (producto) => Number(producto.stock) === 0
  );

  // Pantalla de inicio de sesión
  if (!token) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={iniciarSesion}>
          <h1>🔧 FerreStock</h1>
          <p>Inicia sesión para administrar tu inventario.</p>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          <label>
            Usuario
            <input
              required
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
            />
          </label>

          <label>
            Contraseña
            <input
              required
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </label>

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🔧 FerreStock</h2>
        <p className="menu-title">MENÚ PRINCIPAL</p>

        <button
          type="button"
          className={vista === "inventario" ? "menu-active" : "menu-item"}
          onClick={() => {
            setVista("inventario");
            setMensaje("");
            setError("");
          }}
        >
          📦 Inventario
        </button>

        <button
          type="button"
          className={vista === "ventas" ? "menu-active" : "menu-item"}
          onClick={abrirVentas}
        >
          🛒 Ventas
        </button>

        <button
          type="button"
          className={vista === "reportes" ? "menu-active" : "menu-item"}
          onClick={() => {
            setVista("reportes");
            setMostrarFormulario(false);
            setMensaje("");
            setError("");
          }}
        >
          📊 Reporte
        </button>

        <button
          type="button"
          className="menu-item"
          onClick={() =>
            setMensaje(
              "La sección Configuración estará disponible próximamente."
            )
          }
        >
          ⚙️ Configuración
        </button>

        <div className="sidebar-footer">Sistema de inventario</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>
              {vista === "reportes"
                ? "Reportes"
                : vista === "ventas"
                  ? "Ventas"
                  : "Inventario"}
            </h1>

            <p>
              {vista === "reportes"
                ? "Consulta el estado y valor de tu inventario"
                : vista === "ventas"
                  ? "Registra ventas y consulta el historial"
                  : "Administra los productos de tu ferretería"}
            </p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </header>

        {mensaje && (
          <div className="alert-success" role="status">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {vista === "reportes" ? (
          <Reportes productos={productos} />
        ) : vista === "ventas" ? (
          <section className="inventory">
            <div className="inventory-header">
              <div>
                <h2>Nueva venta</h2>
                <p>Selecciona productos y sus cantidades</p>
              </div>

              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setItemsVenta([]);
                  setMensaje("");
                  setError("");
                }}
                disabled={itemsVenta.length === 0 || registrandoVenta}
              >
                Limpiar venta
              </button>
            </div>

            <label>
              Seleccionar producto
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    agregarItemVenta(e.target.value);
                  }
                }}
              >
                <option value="">Selecciona un producto...</option>
                {productos
                  .filter((producto) => Number(producto.stock) > 0)
                  .map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.name} — {formatoBs(producto.price)} — Stock:{" "}
                      {producto.stock}
                    </option>
                  ))}
              </select>
            </label>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio unitario</th>
                    <th>Stock</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {itemsVenta.map((item) => {
                    const producto = productos.find(
                      (p) => Number(p.id) === Number(item.product_id)
                    );

                    if (!producto) return null;

                    return (
                      <tr key={item.product_id}>
                        <td>{producto.name}</td>
                        <td>{formatoBs(producto.price)}</td>
                        <td>{producto.stock}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max={producto.stock}
                            value={item.quantity}
                            aria-label={"Cantidad de " + producto.name}
                            onChange={(e) =>
                              cambiarCantidad(
                                item.product_id,
                                e.target.value
                              )
                            }
                            style={{ width: "80px" }}
                          />
                        </td>
                        <td>
                          {formatoBs(
                            Number(producto.price) * Number(item.quantity)
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              quitarItemVenta(item.product_id)
                            }
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {itemsVenta.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        Aún no agregaste productos a esta venta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="inventory-header">
              <h2>Total: {formatoBs(totalVenta)}</h2>

              <button
                type="button"
                onClick={confirmarVenta}
                disabled={registrandoVenta || itemsVenta.length === 0}
              >
                {registrandoVenta ? "Registrando..." : "Registrar venta"}
              </button>
            </div>

            <div className="inventory-header">
              <div>
                <h2>Historial de ventas</h2>
                <p>Ventas guardadas en la base de datos</p>
              </div>

              <button
                type="button"
                className="cancel-button"
                onClick={() => cargarVentas(token)}
                disabled={cargandoVentas}
              >
                {cargandoVentas ? "Actualizando..." : "Actualizar historial"}
              </button>
            </div>

            {cargandoVentas ? (
              <p>Cargando ventas...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>N.º</th>
                      <th>Fecha</th>
                      <th>Productos</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.id}>
                        <td>#{venta.id}</td>
                        <td>
                          {venta.sale_date
                            ? new Date(venta.sale_date).toLocaleString("es-BO")
                            : "—"}
                        </td>
                        <td>
                          {Array.isArray(venta.details)
                            ? venta.details
                                .map(
                                  (detalle) =>
                                    "ID " +
                                    detalle.product_id +
                                    " × " +
                                    detalle.quantity
                                )
                                .join(", ")
                            : "—"}
                        </td>
                        <td>{formatoBs(venta.total)}</td>
                      </tr>
                    ))}

                    {ventas.length === 0 && (
                      <tr>
                        <td colSpan="4">No hay ventas registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <>
            {productosSinStock.length > 0 && (
              <div className="alert-error" role="alert">
                🚨 Hay {productosSinStock.length} producto(s) sin stock.
                Revisa la lista para reponerlos.
              </div>
            )}

            {productosStockBajo.length > 0 && (
              <div className="alert-error" role="alert">
                ⚠️ Hay {productosStockBajo.length} producto(s) con stock
                bajo (5 unidades o menos).
              </div>
            )}

            <section className="stats">
              <article className="stat-card">
                <span>Total de productos</span>
                <strong>{productos.length}</strong>
              </article>

              <article className="stat-card">
                <span>Unidades en stock</span>
                <strong>{totalUnidades}</strong>
              </article>

              <article className="stat-card">
                <span>Valor del inventario</span>
                <strong>{formatoBs(valorInventario)}</strong>
              </article>
            </section>

            {/* Visor 3D del proyecto */}
            <Product3DViewer producto={producto3D} />

            <section className="inventory">
              <div className="inventory-header">
                <div>
                  <h2>Lista de productos</h2>
                  <p>Información consultada desde la base de datos</p>
                </div>

                <button type="button" onClick={prepararNuevo}>
                  + Nuevo producto
                </button>
              </div>

              {mostrarFormulario && (
                <form className="product-form" onSubmit={guardarProducto}>
                  <label>
                    Nombre del producto
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={nuevo.name}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, name: e.target.value })
                      }
                      placeholder="Ej. Destornillador"
                    />
                  </label>

                  <label>
                    Precio (Bs.)
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={nuevo.price}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    Stock
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={nuevo.stock}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, stock: e.target.value })
                      }
                      placeholder="0"
                    />
                  </label>

                  <div className="form-actions">
                    <button type="submit" disabled={guardando}>
                      {guardando
                        ? "Guardando..."
                        : editando !== null
                          ? "Guardar cambios"
                          : "Guardar producto"}
                    </button>

                    <button
                      type="button"
                      className="cancel-button"
                      disabled={guardando}
                      onClick={() => {
                        setMostrarFormulario(false);
                        setEditando(null);
                        setNuevo({ ...FORMULARIO_VACIO });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <input
                className="search"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔎 Buscar producto..."
                aria-label="Buscar productos"
              />

              {cargando ? (
                <p>Cargando productos...</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtrados.map((producto) => (
                        <tr key={producto.id}>
                          <td>#{producto.id}</td>
                          <td>
                            <strong>{producto.name}</strong>
                          </td>
                          <td>{formatoBs(producto.price)}</td>
                          <td>{Number(producto.stock) || 0}</td>
                          <td>
                            <span
                              className={
                                Number(producto.stock) === 0
                                  ? "badge-empty"
                                  : Number(producto.stock) <= 5
                                    ? "badge-low"
                                    : "badge-ok"
                              }
                            >
                              {Number(producto.stock) <= 0
                                ? "Agotado"
                                : Number(producto.stock) <= 5
                                  ? "Stock bajo"
                                  : "Disponible"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => prepararEdicion(producto)}
                            >
                              Editar
                            </button>{" "}

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => setProducto3D(producto)}
                            >
                              Ver en 3D
                            </button>{" "}

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => borrarProducto(producto.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filtrados.length === 0 && (
                        <tr>
                          <td colSpan="6">No se encontraron productos.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="table-footer">
                Mostrando {filtrados.length} de {productos.length} producto(s)
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
