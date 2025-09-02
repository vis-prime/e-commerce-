"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import ViewingArea from "./ViewingArea"
import EditingArea from "./EditingArea"

export default function MainEditor() {
  return (
    <div className="h-[calc(100vh-4rem)] w-screen flex flex-col md:flex-row">
      {/* Canvas pane */}
      {/* <div className=" w-full h-full relative">
        <Canvas
          className="!absolute inset-0"
          camera={{ position: [3, 3, 3], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#202020"]} />
          <hemisphereLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />

          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>

          <OrbitControls enableDamping />
        </Canvas>
      </div> */}
      <ViewingArea />

      {/* Editing pane */}
      <EditingArea />
    </div>
  )
}
