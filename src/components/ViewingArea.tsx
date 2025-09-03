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
import { useGLTF, Box } from "@react-three/drei"
import * as THREE from "three"
import {
  Physics,
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier"
import { RigidBodyType } from "@dimforge/rapier3d-compat"

export default function ViewingArea() {
  const dummyRef = useRef<THREE.Mesh>(null) as React.RefObject<THREE.Mesh>
  const setSelected = useProductStore((s) => s.setSelected)
  const onBgClick = useCallback(() => {
    // Handle background click
    console.log("Background clicked")
    setSelected(null)
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
          <Physics debug gravity={[0, -9.81 * 0.2, 0]}>
            <PlacedModels />
            <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
          </Physics>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls enableDamping makeDefault />

        <mesh ref={dummyRef}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>

        <ContactShadows
          opacity={1}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color="#0000dd"
        />
        <DynamicPivotControls dummyObject={dummyRef} />
      </Canvas>
    </div>
  )
}

function DynamicPivotControls({
  dummyObject,
}: {
  dummyObject: React.RefObject<THREE.Object3D>
}) {
  const bounds = useRef(
    new THREE.Box3(
      new THREE.Vector3(-10, 0, -10),
      new THREE.Vector3(10, 10, 10)
    )
  )

  const selectedId = useProductStore((s) => s.selectedId)
  const selectedNode = useProductStore((s) => s.selectedNode)
  const updateTransform = useProductStore((s) => s.updateTransform)
  const selectedRigidBody = useProductStore((s) => s.selectedRigidBody)

  const onMouseDown = useCallback(() => {
    if (!selectedRigidBody) return
    // make it kinematic while dragging so we can drive it
    selectedRigidBody.setBodyType(RigidBodyType.KinematicPositionBased, true)
  }, [selectedRigidBody])

  const onMouseUp = useCallback(() => {
    if (!selectedNode || !selectedId || !selectedRigidBody) return

    // persist transform to store
    updateTransform(selectedId, {
      position: selectedNode.position.toArray(),
      rotation: selectedNode.rotation.toArray(),
      scale: selectedNode.scale.toArray(),
    })

    // apply last known dummy transform to RB
    if (dummyObject.current) {
      selectedRigidBody.setTranslation(dummyObject.current.position, true)
      selectedRigidBody.setRotation(dummyObject.current.quaternion, true)
    }

    // return to dynamic so physics takes over again
    selectedRigidBody.setBodyType(RigidBodyType.Dynamic, true)

    console.log("Mouse up event", useProductStore.getState())
  }, [selectedId, selectedNode, updateTransform, selectedRigidBody])

  const onChange = useCallback(() => {
    if (!selectedRigidBody || !dummyObject.current) return

    dummyObject.current.position.clamp(bounds.current.min, bounds.current.max)

    const pos = dummyObject.current.position
    const quat = dummyObject.current.quaternion

    selectedRigidBody.setNextKinematicTranslation(pos)
    selectedRigidBody.setNextKinematicRotation(quat)

    console.log("Transform changed", pos, quat)
  }, [selectedRigidBody])

  if (!selectedNode || !selectedId) return null

  return (
    <TransformControls
      object={dummyObject.current!}
      onChange={onChange}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
    />
  )
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
  const rbRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const setSelected = useProductStore((s) => s.setSelected)
  const setSelectedNode = useProductStore((s) => s.setSelectedNode)
  const setSelectedMaterials = useProductStore((s) => s.setSelectedMaterials)
  const setSelectedRigidBody = useProductStore((s) => s.setSelectedRigidBody)

  const url = `https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/${item.product.id}/model.glb`
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.position.random()
    return clone
  }, [item.product.id, scene])

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      // collect all unique materials
      const materials: Record<
        string,
        THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
      > = {}
      clonedScene.traverse((obj: any) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(
              (
                mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
              ) => {
                materials[mat.uuid] = mat
              }
            )
          } else {
            materials[obj.material.uuid] = obj.material
          }
        }
      })

      setSelected(item.product.id)
      setSelectedNode(clonedScene)
      setSelectedMaterials(Object.values(materials)) // store array of materials
      if (rbRef.current) setSelectedRigidBody(rbRef.current)
      console.log("Clicked on model", useProductStore.getState())
    },
    [clonedScene, item.product.id, setSelected]
  )

  return (
    <RigidBody ref={rbRef} colliders="hull">
      <primitive object={clonedScene} onClick={onClick} />
    </RigidBody>
  )
}
