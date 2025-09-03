"use client"
import React, { Suspense, useEffect, useMemo, useRef, useCallback } from "react"
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  TransformControls,
} from "@react-three/drei"
import { ProductInScene, useProductStore } from "@/store/useProductStore"
import { useGLTF, Box, Center } from "@react-three/drei"
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
            <CuboidCollider position={[0, -0.5, 0]} args={[20, 0.5, 20]} />
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
  console.log("re render DynamicPivotControls")
  const selectedId = useProductStore((s) => s.selectedId)
  const selectedRigidBody = useProductStore((s) => s.selectedRigidBody)
  const updateTransform = useProductStore((s) => s.updateTransform)

  // Initialize dummy on selection
  useEffect(() => {
    if (dummyObject.current && selectedRigidBody) {
      const t = selectedRigidBody.translation()
      dummyObject.current.position.set(t.x, t.y, t.z)
      const q = selectedRigidBody.rotation()
      dummyObject.current.quaternion.set(q.x, q.y, q.z, q.w)
    }
  }, [selectedRigidBody]) // only runs when selection changes

  const onMouseDown = useCallback(() => {
    if (!dummyObject.current || !selectedRigidBody) return
    selectedRigidBody.setBodyType(RigidBodyType.KinematicPositionBased, true)

    // Make sure Rapier already knows where the dummy is
    selectedRigidBody.setNextKinematicTranslation(dummyObject.current.position)
    selectedRigidBody.setNextKinematicRotation(dummyObject.current.quaternion)
  }, [selectedRigidBody])

  const onChange = useCallback(() => {
    if (!dummyObject.current || !selectedRigidBody) return
    selectedRigidBody.setNextKinematicTranslation(dummyObject.current.position)
    selectedRigidBody.setNextKinematicRotation(dummyObject.current.quaternion)
  }, [selectedRigidBody])

  const onMouseUp = useCallback(() => {
    if (!dummyObject.current || !selectedId || !selectedRigidBody) return

    updateTransform(selectedId, {
      position: dummyObject.current.position.toArray(),
      rotation: dummyObject.current.rotation.toArray(),
      scale: dummyObject.current.scale.toArray(),
    })

    selectedRigidBody.setNextKinematicTranslation(dummyObject.current.position)
    selectedRigidBody.setNextKinematicRotation(dummyObject.current.quaternion)
    selectedRigidBody?.setBodyType(RigidBodyType.Dynamic, true)
  }, [selectedId, selectedRigidBody, updateTransform])

  if (!selectedRigidBody || !selectedId) return null

  return (
    <TransformControls
      object={dummyObject.current}
      onMouseDown={onMouseDown}
      onChange={onChange}
      onMouseUp={onMouseUp}
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
  const rbRef = useRef<RapierRigidBody>(
    null
  ) as React.RefObject<RapierRigidBody>
  const groupRef = useRef<THREE.Group>(null)
  const setSelected = useProductStore((s) => s.setSelected)
  const setSelectedNode = useProductStore((s) => s.setSelectedNode)
  const setSelectedMaterials = useProductStore((s) => s.setSelectedMaterials)
  const setSelectedRigidBody = useProductStore((s) => s.setSelectedRigidBody)

  const url = `https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/${item.product.id}/model.glb`
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
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
    <RigidBody ref={rbRef} colliders="hull" position={[0, 5, 0]} ccd>
      <arrowHelper />
      <Center>
        <primitive object={clonedScene} onClick={onClick} />
      </Center>
      <ResetOutOfBounds rbRef={rbRef} />
    </RigidBody>
  )
}

function ResetOutOfBounds({
  rbRef,
}: {
  rbRef: React.RefObject<RapierRigidBody>
}) {
  useFrame(() => {
    if (!rbRef.current) return
    const pos = rbRef.current.translation()
    if (pos.y < -5) {
      // fell below ground
      rbRef.current.setTranslation({ x: 0, y: 2, z: 0 }, true)
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      rbRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    }
  })
  return null
}
