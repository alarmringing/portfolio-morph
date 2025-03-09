import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

export default function MorphingText() {
  const textRef = useRef<THREE.Mesh>(null)


  useFrame((state) => {
    if (!textRef.current) return
    
    // Add a gentle floating animation
    textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    textRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  })
  
  return (
    <Center>
      <Text3D
        ref={textRef}
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.5}
        height={0.1}
        curveSegments={2}
        bevelEnabled
        bevelThickness={0.01}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={2}
      >
        Jihee
        <meshStandardMaterial 
          color="white" 
          metalness={0.3}
          roughness={0.2}
        />
      </Text3D>
    </Center>
  )
} 