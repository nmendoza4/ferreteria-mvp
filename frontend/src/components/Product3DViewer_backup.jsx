
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function ModeloProducto({ nombre = "" }) {
  const texto = nombre.toLowerCase();

  // Elegir una forma aproximada según el nombre.
  let forma = "caja";
  let color = "#4f46e5";

  if (
    texto.includes("martillo") ||
    texto.includes("destornillador") ||
    texto.includes("herramienta")
  ) {
    forma = "herramienta";
    color = "#f59e0b";
  } else if (
    texto.includes("tubo") ||
    texto.includes("cañeria") ||
    texto.includes("cañería")
  ) {
    forma = "tubo";
    color = "#94a3b8";
  } else if (
    texto.includes("tornillo") ||
    texto.includes("clavo")
  ) {
    forma = "tornillo";
    color = "#cbd5e1";
  } else if (
    texto.includes("pintura") ||
    texto.includes("pintura") ||
    texto.includes("balde")
  ) {
    forma = "balde";
    color = "#22c55e";
  }

  return (
    <group rotation={[0.2, 0.4, 0]}>
      {forma === "tubo" ? (
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 2.2, 32]} />
          <meshStandardMaterial color={color} metalness={0.45} roughness={0.3} />
        </mesh>
      ) : forma === "tornillo" ? (
        <group>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 1.5, 16]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.18, 6]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ) : forma === "balde" ? (
        <mesh>
          <cylinderGeometry args={[0.65, 0.45, 1.3, 32]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
      ) : forma === "herramienta" ? (
        <group>
          <mesh>
            <boxGeometry args={[0.45, 1.6, 0.45]} />
            <meshStandardMaterial color="#b45309" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.5, 0.45, 0.5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ) : (
        <mesh>
          <boxGeometry args={[1.8, 1.3, 1.1]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

export default function Product3DViewer({ producto }) {
  const nombre = producto?.name || "Producto de ejemplo";

  return (
    <section className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-3">
      <h2 className="mb-2 text-lg font-semibold text-white">
        Visor 3D del producto
      </h2>

      <p className="mb-2 text-center text-white">
        {producto
          ? `Producto seleccionado: ${nombre}`
          : "Selecciona un producto en la tabla para visualizarlo"}
      </p>

      <div className="h-64 w-full">
        <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={1} />
          <directionalLight position={[3, 5, 4]} intensity={2} />

          <ModeloProducto nombre={nombre} />

          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>

      <p className="text-center text-sm text-slate-300">
        Arrastra con el cursor para girar el modelo y utiliza la rueda del
        ratón para acercar o alejar.
      </p>
    </section>
  );
}
