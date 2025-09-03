"use client"
import React, { Suspense, useEffect, useMemo, useRef, useCallback } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PivotControls,
  TransformControls,
} from "@react-three/drei"
import { ProductInScene, useProductStore } from "@/store/useProductStore"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ViewingArea() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [3, 3, 3], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <hemisphereLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <axesHelper />

        <Suspense fallback={null}>
          <PlacedModels />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls enableDamping makeDefault />

        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>

        <ContactShadows
          opacity={1}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color="#000000"
        />
        <DynamicPivotControls />
      </Canvas>
    </div>
  )
}

function DynamicPivotControls() {
  const selectedNode = useProductStore((s) => s.selectedNode)
  const updateTransform = useProductStore((s) => s.updateTransform)

  if (!selectedNode) return null

  return <TransformControls object={selectedNode} />
}

function PlacedModels() {
  const placed = useProductStore((s) => s.placed)
  const selectedId = useProductStore((s) => s.selectedId)

  return (
    <>
      {placed.map((item) => (
        <PlacedModel
          key={item.sceneId}
          item={item}
          selected={item.product.id === selectedId}
        />
      ))}
    </>
  )
}

function PlacedModel({
  item,
  selected,
}: {
  item: ProductInScene
  selected: boolean
}) {
  const setSelected = useProductStore((s) => s.setSelected)
  const setSelectedNode = useProductStore((s) => s.setSelectedNode)

  const url = `https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/${item.product.id}/model.glb`
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.position.random()
    return clone
  }, [item.product.id, scene])

  const onClick = useCallback(() => {
    setSelected(item.product.id)
    setSelectedNode(clonedScene)
  }, [clonedScene, item.product.id, setSelected])

  const content = <primitive object={clonedScene} onClick={onClick} />

  return <group onClick={onClick}>{content}</group>
}
