import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WebGLBackground = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    const particles = new THREE.BufferGeometry();
    let particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({ color: '#22d3ee', size: 0.05 });
    const particleSystem = new THREE.Points(particles, particleMaterial);

    scene.add(particleSystem);

    const animate = () => {
      requestAnimationFrame(animate);
      particleSystem.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      particleSystem.rotation.x = y * 0.1;
      particleSystem.rotation.z = x * 0.1;
    };

    const adjustParticleCount = () => {
      const maxParticleCount = 5000;
      const minParticleCount = 100;
      const baseParticleCount = 1000;

      const distance = camera.position.z;
      const adjustedCount = Math.floor(baseParticleCount / (distance / 5));

      particleCount = Math.min(Math.max(adjustedCount, minParticleCount), maxParticleCount);

      const newPositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        newPositions[i * 3] = (Math.random() - 0.5) * 10;
        newPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        newPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
      particleSystem.geometry.dispose();
      particleSystem.geometry = particles;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    camera.addEventListener('change', adjustParticleCount);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      camera.removeEventListener('change', adjustParticleCount);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />;
};

export default WebGLBackground;
