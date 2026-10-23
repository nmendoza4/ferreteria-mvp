
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";

function Material({ color, metalness = 0, roughness = 0.45 }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
    />
  );
}

function Martillo() {
  return (
    <group rotation={[0.15, 0, -0.18]}>
      {/* Mango de madera */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.105, 0.14, 1.75, 20]} />
        <Material color="#9a5428" roughness={0.65} />
      </mesh>

      {/* Extremo inferior del mango */}
      <mesh position={[0, -1.08, 0]}>
        <cylinderGeometry args={[0.145, 0.15, 0.16, 20]} />
        <Material color="#62351e" />
      </mesh>

      {/* Cabeza metálica */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.15, 0.38, 0.42]} />
        <Material color="#94a3b8" metalness={0.85} roughness={0.23} />
      </mesh>

      {/* Cara del martillo */}
      <mesh position={[0.59, 0.78, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 24]} />
        <Material color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Destornillador() {
  return (
    <group rotation={[0, 0, -0.2]}>
      {/* Mango plástico */}
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.23, 0.2, 0.8, 24]} />
        <Material color="#dc2626" roughness={0.38} />
      </mesh>

      {/* Aro del mango */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.08, 24]} />
        <Material color="#1e293b" />
      </mesh>

      {/* Varilla metálica */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 1.15, 16]} />
        <Material color="#cbd5e1" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Punta */}
      <mesh position={[0, 1.14, 0]}>
        <coneGeometry args={[0.065, 0.18, 4]} />
        <Material color="#e2e8f0" metalness={0.95} />
      </mesh>
    </group>
  );
}

function Tubo() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Tubo hueco */}
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 2.1, 40, 1, true]} />
        <Material color="#94a3b8" metalness={0.72} roughness={0.28} />
      </mesh>

      {/* Borde superior */}
      <mesh position={[0, 1.04, 0]}>
        <torusGeometry args={[0.43, 0.07, 12, 40]} />
        <Material color="#cbd5e1" metalness={0.8} roughness={0.22} />
      </mesh>

      {/* Borde inferior */}
      <mesh position={[0, -1.04, 0]}>
        <torusGeometry args={[0.43, 0.07, 12, 40]} />
        <Material color="#64748b" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Tornillo() {
  return (
    <group rotation={[0.25, 0, -0.5]}>
      {/* Cuerpo */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.105, 0.07, 1.35, 16]} />
        <Material color="#a8b2c1" metalness={0.95} roughness={0.22} />
      </mesh>

      {/* Cabeza */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.25, 0.23, 0.18, 6]} />
        <Material color="#d1d5db" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Marcas de rosca aproximadas */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, -0.58 + i * 0.13, 0]}>
          <torusGeometry args={[0.102, 0.025, 6, 16]} />
          <Material color="#64748b" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Balde() {
  return (
    <group>
      {/* Cuerpo */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.62, 0.43, 1.25, 40, 1]} />
        <Material color="#16a34a" roughness={0.32} />
      </mesh>

      {/* Tapa */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.625, 0.625, 0.09, 40]} />
        <Material color="#e2e8f0" metalness={0.25} roughness={0.35} />
      </mesh>

      {/* Asa */}
      <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.43, 0.035, 10, 32, Math.PI]} />
        <Material color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Etiqueta frontal */}
      <mesh position={[0, 0, 0.445]}>
        <boxGeometry args={[0.62, 0.4, 0.025]} />
        <Material color="#f8fafc" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Caja() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.6, 1.35, 1.2]} />
        <Material color="#b87942" roughness={0.82} />
      </mesh>

      {/* Cinta de embalaje */}
      <mesh position={[0, 0.681, 0]}>
        <boxGeometry args={[0.19, 0.018, 1.21]} />
        <Material color="#e7c995" roughness={0.65} />
      </mesh>

      <mesh position={[0, 0, 0.608]}>
        <boxGeometry args={[0.19, 1.35, 0.018]} />
        <Material color="#e7c995" roughness={0.65} />
      </mesh>
    </group>
  );
}

function ModeloProducto({ nombre = "" }) {
  const texto = nombre.toLowerCase();

  if (texto.includes("martillo")) return <Martillo />;
  if (texto.includes("destornillador")) return <Destornillador />;

  if (
    texto.includes("tubo") ||
    texto.includes("cañeria") ||
    texto.includes("cañería") ||
    texto.includes("tuberia") ||
    texto.includes("tubería")
  ) {
    return <Tubo />;
  }

  if (texto.includes("tornillo") || texto.includes("clavo")) {
    return <Tornillo />;
  }

  if (
    texto.includes("pintura") ||
    texto.includes("balde")
  ) {
    return <Balde />;
  }

  if (texto.includes("herramienta")) return <Martillo />;

  return <Caja />;
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

      <div className="h-72 w-full">
        <Canvas
          shadows
          camera={{ position: [3, 2.5, 4.5], fov: 42 }}
        >
          <color attach="background" args={["#0f172a"]} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 6, 5]}
            intensity={2.2}
            castShadow
          />
          <Environment preset="warehouse" />

          <group rotation={[0.08, -0.35, 0]}>
            <ModeloProducto nombre={nombre} />
          </group>

          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.4}
            scale={5}
            blur={2}
          />

          <OrbitControls
            makeDefault
            enableZoom
            minDistance={2}
            maxDistance={8}
          />
        </Canvas>
      </div>

      <p className="text-center text-sm text-slate-300">
        Arrastra para girar el modelo y utiliza la rueda del ratón para
        acercar o alejar.
      </p>
    </section>
  );
}
