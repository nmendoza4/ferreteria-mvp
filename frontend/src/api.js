
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export async function obtenerProductos(token) {
  const respuesta = await fetch(`${API_URL}/api/v1/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    throw new Error(`Error al consultar productos: ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function crearProducto(producto, token) {
  const respuesta = await fetch(`${API_URL}/api/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.detail || `Error al crear: ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function actualizarProducto(id, producto, token) {
  const respuesta = await fetch(`${API_URL}/api/v1/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.detail || `Error al actualizar: ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function eliminarProducto(id, token) {
  const respuesta = await fetch(`${API_URL}/api/v1/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.detail || `Error al eliminar: ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function registrarVenta(items, token) {
  const respuesta = await fetch(`${API_URL}/api/v1/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(
      error.detail || `Error al registrar venta: ${respuesta.status}`
    );
  }

  return respuesta.json();
}

export async function obtenerVentas(token) {
  const respuesta = await fetch(`${API_URL}/api/v1/sales`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(
      error.detail || `Error al consultar ventas: ${respuesta.status}`
    );
  }

  return respuesta.json();
}
