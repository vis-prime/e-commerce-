"use client"
import React, { Suspense, useEffect, useMemo, useRef, useCallback } from "react"
import { Canvas, ThreeEvent } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  TransformControls,
} from "@react-three/drei"
import { ProductInScene, useProductStore } from "@/store/useProductStore"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ViewingArea() {
  const onBgClick = useCallback(() => {
    // Handle background click
    console.log("Background clicked")
  }, [])

  return (
    <div className="w-full h-full relative">
      <Canvas
        onPointerMissed={onBgClick}
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
  const selectedId = useProductStore((s) => s.selectedId)

  const selectedNode = useProductStore((s) => s.selectedNode)
  const updateTransform = useProductStore((s) => s.updateTransform)

  const onMouseUp = useCallback(() => {
    if (!selectedNode || !selectedId) return
    updateTransform(selectedId, {
      position: selectedNode.position.toArray(),
      rotation: selectedNode.rotation.toArray(),
      scale: selectedNode.scale.toArray(),
    })
    console.log("Mouse up event", useProductStore.getState())
  }, [selectedId, selectedNode, updateTransform])

  if (!selectedNode || !selectedId) return null

  return <TransformControls object={selectedNode} onMouseUp={onMouseUp} />
}

function PlacedModels() {
  const placed = useProductStore((s) => s.placed)

  return (
    <>
      {placed.map((item) => (
        <PlacedModel key={item.sceneId} item={item} />
      ))}
    </>
  )
}

function PlacedModel({ item }: { item: ProductInScene }) {
  const setSelected = useProductStore((s) => s.setSelected)
  const setSelectedNode = useProductStore((s) => s.setSelectedNode)

  const url = `https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/${item.product.id}/model.glb`
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.position.random()
    return clone
  }, [item.product.id, scene])

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      console.log(e)
      e.stopPropagation()
      setSelected(item.product.id)
      setSelectedNode(clonedScene)
    },
    [clonedScene, item.product.id, setSelected]
  )

  return <primitive object={clonedScene} onClick={onClick} />
}
