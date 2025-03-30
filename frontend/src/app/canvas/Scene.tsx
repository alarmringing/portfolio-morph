import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Box() {
  return (
    <mesh>
      <boxGeometry args={[4, 4, 1]} />
      <meshStandardMaterial color="#ffffff00" />
    </mesh>
  )
}

export default function Scene() {
  return (
    <div className="h-screen w-full">
      <Canvas 
        style={{ 
          background: 'transparent',
          mixBlendMode: 'normal'
        }}
      >
        <ambientLight intensity={1.0} />
        <Box />
        <OrbitControls 
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
} 