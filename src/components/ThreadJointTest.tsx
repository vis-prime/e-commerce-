"use client"

import React, { useRef, useEffect, useState, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, TransformControls } from "@react-three/drei"
import {
  Physics,
  RigidBody,
  useFixedJoint,
  useRopeJoint,
  useSphericalJoint,
  useSpringJoint,
} from "@react-three/rapier"
import * as THREE from "three"

/**
 * Top-level wrapper to toggle demos
 */
export default function JointDemo() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [6, 6, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} debug>
            <SpringJointExample />
          </Physics>
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}

/**
 * Spring joint example
 *
 * Very similar to spherical, but joint is a spring with elasticity.
 */
function SpringJointExample() {
  const tconRef = useRef<any>(null)
  const anchorRef = useRef<any>(null)
  const anchorDummy = useRef<THREE.Mesh | null>(null)
  const bodyRef = useRef<any>(null)

  //   useRopeJoint(anchorRef, bodyRef, [[-0.5, 0, 0], [-0.5, 0.5, 0], 1])
  //   useRopeJoint(anchorRef, bodyRef, [[0.5, 0, 0], [0.5, 0.5, 0], 1])

  useSpringJoint(anchorRef, bodyRef, [
    [-0.5, 0, 0],
    [-0.5, 0, 0],
    1, // rest length
    60, // stiffness
    10, // damping
  ])

  useSpringJoint(anchorRef, bodyRef, [
    [0.5, 0, 0],
    [0.5, 0, 0],
    1, // rest length
    60, // stiffness
    10, // damping
  ])

  //   useSphericalJoint(anchorRef, bodyRef, [
  //     // Position of the joint in bodyA's local space
  //     [0, 0, 0],
  //     // Position of the joint in bodyB's local space
  //     [0, 2, 0],
  //   ])

  //   useFixedJoint(anchorRef, bodyRef, [
  //     // Position of the joint in bodyA's local space
  //     [0, 1, 0],
  //     // Orientation of the joint in bodyA's local space
  //     [0, 0, 0, 1],
  //     // Position of the joint in bodyB's local space
  //     [0, 0, 0],
  //     // Orientation of the joint in bodyB's local space
  //     [0, 0, 0, 1],
  //   ])

  //   useRopeJoint(anchorRef, bodyRef, [[0, 0, 0], [0, 0.1, 0], 1])

  useEffect(() => {
    if (!anchorRef.current || !anchorDummy.current) return
    const t = anchorRef.current.translation()
    anchorDummy.current.position.set(t.x, t.y, t.z)
    const q = anchorRef.current.rotation()
    anchorDummy.current.quaternion.set(q.x, q.y, q.z, q.w)

    tconRef.current.object = anchorDummy.current
  }, [])

  useFrame(() => {
    if (!anchorRef.current || !anchorDummy.current) return
    anchorRef.current.setNextKinematicTranslation(anchorDummy.current.position)
    anchorRef.current.setNextKinematicRotation(anchorDummy.current.quaternion)
    bodyRef.current?.wakeUp()
  })

  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[30, 1, 30]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </RigidBody>

      {/* dynamic body */}
      <RigidBody
        ref={bodyRef}
        colliders="cuboid"
        position={[3, 3, 0]}
        restitution={0.2}
      >
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="skyblue" />
        </mesh>
      </RigidBody>

      {/* kinematic anchor */}
      <RigidBody
        ref={anchorRef}
        type="kinematicPosition"
        colliders={false}
        position={[3, 6, 0]}
      />

      {/* visible dummy */}
      <mesh
        ref={anchorDummy}
        position={[3, 6, 0]}
        castShadow
        onPointerDown={(e) => e.stopPropagation()}
      >
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Transform controls for the dummy */}
      <TransformControls ref={tconRef} mode="rotate" />
    </>
  )
}
