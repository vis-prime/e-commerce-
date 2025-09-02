"use client"
import React from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export default function ViewingArea() {
  return (
    <div className=" w-full h-full relative">
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [3, 3, 3], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#202020"]} />
        <hemisphereLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <axesHelper />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  )
}
