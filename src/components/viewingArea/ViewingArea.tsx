"use client"
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  use,
} from "react"
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  TransformControls,
} from "@react-three/drei"
import { ProductInScene, useProductStore } from "@/store/useProductStore"
import { useGLTF, Box, Center, Html } from "@react-three/drei"
import * as THREE from "three"
import {
  Physics,
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
  useSpringJoint,
} from "@react-three/rapier"

import * as RAPIER from "@dimforge/rapier3d-compat"
import { RigidBodyType } from "@dimforge/rapier3d-compat"
import { useControls } from "leva"

export default function ViewingArea() {
  const dummyRef = useRef<THREE.Mesh>(null) as React.RefObject<THREE.Mesh>
  const setSelectedId = useProductStore((s) => s.setSelectedId)
  const { selectedRigidBodyRef, setSelectedRigidBodyRef } = useProductStore(
    (s) => s
  )

  const onBgClick = useCallback(() => {
    // Handle background click
    console.log("Background clicked")
    setSelectedId(null)
    setSelectedRigidBodyRef(null)
  }, [setSelectedId, setSelectedRigidBodyRef])

  const gravity = useRef<[number, number, number]>([0, -9.81, 0])

  const { phyDebug } = useControls({
    phyDebug: true,
  })

  return (
    <div className="w-full h-full relative">
      <span className="absolute"> Gravity {gravity.current[1]} </span>

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
          <Physics debug={phyDebug} gravity={gravity.current}>
            {/* <PlacedModels /> */}
            <AllModels />
            <CuboidCollider position={[0, -0.5, 0]} args={[20, 0.5, 20]} />
            {/* <TestModel /> */}
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
        {/* <DynamicPivotControls dummyObject={dummyRef} /> */}
      </Canvas>
    </div>
  )
}

function AllModels() {
  const placed = useProductStore((s) => s.placed)
  const { selectedRigidBodyRef } = useProductStore((s) => s)
  return (
    <>
      {placed.map((item) => (
        <ModelItem key={item.sceneId} item={item} />
      ))}

      {selectedRigidBodyRef && (
        <SpringTransformsControls
          key={(selectedRigidBodyRef.current.userData as { id: string }).id}
          modelRbRef={selectedRigidBodyRef}
        />
      )}
    </>
  )
}

function ModelItem({ item }: { item: ProductInScene }) {
  const rbRef = useRef<RapierRigidBody>(
    null
  ) as React.RefObject<RapierRigidBody>

  const setSelectedId = useProductStore((s) => s.setSelectedId)
  const setSelectedRigidBodyRef = useProductStore(
    (s) => s.setSelectedRigidBodyRef
  )

  const url = `https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/${item.product.id}/model.glb`
  // console.log("Loading model from URL:", url)
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    return clone
  }, [item.product.id, scene])

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      setSelectedId(item.product.id)
      setSelectedRigidBodyRef(rbRef)
      console.log("Clicked on model", useProductStore.getState())
    },
    [item, rbRef, setSelectedId, setSelectedRigidBodyRef]
  )

  return (
    <>
      <RigidBody
        ref={rbRef}
        colliders="hull"
        position={[0, 5, 0]}
        userData={{ id: item.product.name + "-" + item.sceneId }}
      >
        <Center>
          <primitive object={clonedScene} onClick={onClick} />
        </Center>
        <ResetOutOfBounds rbRef={rbRef} />
      </RigidBody>
    </>
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
  console.log("Loading model from URL:", url)
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
    <RigidBody ref={rbRef} colliders="hull" position={[0, 5, 0]}>
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

function TestModel() {
  const [connected, setConnected] = React.useState(false)
  const modelRbRef = useRef<any>(null)
  const testModelRef = useRef<THREE.Group>(null)

  const testUrl =
    "https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage/56e53753-6301-47ff-b400-c8cd5412b9ab/model.glb"

  const { scene } = useGLTF(testUrl)

  return (
    <>
      {connected && (
        <SpringTransformsControls
          connected={connected}
          modelRbRef={modelRbRef}
        />
      )}

      <RigidBody ref={modelRbRef} colliders="hull" position={[0, 1, 0]}>
        <Center>
          <primitive
            ref={testModelRef}
            object={scene}
            scale={0.5}
            position={[0, 0, 0]}
          />
        </Center>

        <Html center position={[0, 1.5, 0]}>
          <button
            className="backdrop-blur-sm shadow-md bg-accent/50 hover:bg-accent/80 px-2 py-1 rounded-full text-sm"
            onClick={() => setConnected(!connected)}
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </Html>
      </RigidBody>
    </>
  )
}

function SpringTransformsControls({
  modelRbRef,
}: {
  modelRbRef: React.RefObject<RapierRigidBody>
  // connected: boolean
}) {
  console.log("Render SpringTransformsControls")
  const restLength = 0.5
  const stiffness = 1
  const damping = 1
  const anchorPos = useRef(new THREE.Vector3())
  anchorPos.current.y += 2

  const anchorDummy = useRef<THREE.Object3D>(
    null
  ) as React.RefObject<THREE.Object3D>
  const tconRef = useRef<any>(null)
  const anchorRbRef = useRef<RapierRigidBody>(
    null
  ) as React.RefObject<RapierRigidBody>

  useEffect(() => {
    const anchor = anchorDummy.current
    const anchorRb = anchorRbRef.current
    const body = modelRbRef.current

    if (body && anchorRb && anchor) {
      const pos = body.translation()
      anchorPos.current.copy(pos)
      anchorPos.current.y += 1
      anchor.position.copy(anchorPos.current)
      anchorRb.setTranslation(anchor.position, true)
      anchorRb.setRotation(anchor.quaternion, true)

      console.log("Attach joint", body.userData)
    }
  }, [])

  const onTconChange = useCallback(() => {
    if (!anchorRbRef.current || !anchorDummy.current) return
    anchorRbRef.current.setNextKinematicTranslation(
      anchorDummy.current.position
    )
    anchorRbRef.current.setNextKinematicRotation(anchorDummy.current.quaternion)
    modelRbRef.current?.wakeUp()
  }, [tconRef, anchorDummy, modelRbRef.current])

  const topX = 0.5
  const topZ = 0.5

  const botX = 0.3
  const botZ = 0.3

  useSpringJoint(anchorRbRef, modelRbRef, [
    [-topX, 0, topZ],
    [-botX, 0.2, botZ],
    restLength,
    stiffness,
    damping,
  ])

  useSpringJoint(anchorRbRef, modelRbRef, [
    [-topX, 0, -topZ],
    [-botX, 0.2, -botZ],
    restLength,
    stiffness,
    damping,
  ])

  useSpringJoint(anchorRbRef, modelRbRef, [
    [topX, 0, -topZ],
    [botX, 0.2, -botZ],
    restLength,
    stiffness,
    damping,
  ])

  useSpringJoint(anchorRbRef, modelRbRef, [
    [topX, 0, topZ],
    [botX, 0.2, botZ],
    restLength,
    stiffness,
    damping,
  ])

  return (
    <>
      <group ref={anchorDummy}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>

      <TransformControls
        object={anchorDummy}
        ref={tconRef}
        onChange={onTconChange}
      />

      <RigidBody
        ref={anchorRbRef}
        type="kinematicPosition"
        colliders={false}
      ></RigidBody>
    </>
  )
}
