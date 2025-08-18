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

    // Create asteroid-like particles
    const createAsteroidParticles = () => {
      const asteroidCount = 600;
      const asteroidGeometry = new THREE.BufferGeometry();
      const asteroidPositions = new Float32Array(asteroidCount * 3);
      const asteroidSizes = new Float32Array(asteroidCount);
      const asteroidColors = new Float32Array(asteroidCount * 3);

      for (let i = 0; i < asteroidCount; i++) {
        // Asteroid positions - scattered throughout space
        asteroidPositions[i * 3] = (Math.random() - 0.5) * 12;
        asteroidPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        asteroidPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

        // Variable sizes for asteroid realism
        asteroidSizes[i] = Math.random() * 0.08 + 0.02;

        // Asteroid colors - browns, grays, and rocky tones
        const colorVariation = Math.random();
        if (colorVariation < 0.4) {
          // Brown/orange asteroids
          asteroidColors[i * 3] = 0.6 + Math.random() * 0.3;     // Red
          asteroidColors[i * 3 + 1] = 0.4 + Math.random() * 0.2; // Green  
          asteroidColors[i * 3 + 2] = 0.2 + Math.random() * 0.1; // Blue
        } else if (colorVariation < 0.7) {
          // Gray asteroids
          const grayValue = 0.3 + Math.random() * 0.3;
          asteroidColors[i * 3] = grayValue;
          asteroidColors[i * 3 + 1] = grayValue;
          asteroidColors[i * 3 + 2] = grayValue;
        } else {
          // Metallic asteroids (slightly blue-tinted)
          asteroidColors[i * 3] = 0.4 + Math.random() * 0.2;
          asteroidColors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
          asteroidColors[i * 3 + 2] = 0.6 + Math.random() * 0.3;
        }
      }

      asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(asteroidPositions, 3));
      asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(asteroidSizes, 1));
      asteroidGeometry.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));

      const asteroidMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
      });

      return new THREE.Points(asteroidGeometry, asteroidMaterial);
    };

    // Create Saturn ring particles
    const createSaturnRings = () => {
      const ringCount = 400;
      const ringGeometry = new THREE.BufferGeometry();
      const ringPositions = new Float32Array(ringCount * 3);
      const ringColors = new Float32Array(ringCount * 3);

      for (let i = 0; i < ringCount; i++) {
        // Create ring formation
        const radius = 2 + Math.random() * 3; // Ring radius
        const angle = Math.random() * Math.PI * 2;
        
        ringPositions[i * 3] = Math.cos(angle) * radius;
        ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // Thin ring height
        ringPositions[i * 3 + 2] = Math.sin(angle) * radius;

        // Ring particle colors - icy blues and whites
        const iceVariation = Math.random();
        if (iceVariation < 0.6) {
          // Ice blue particles
          ringColors[i * 3] = 0.8 + Math.random() * 0.2;     // Red
          ringColors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // Green
          ringColors[i * 3 + 2] = 1.0;                       // Blue
        } else {
          // Pure white ice
          ringColors[i * 3] = 0.9 + Math.random() * 0.1;
          ringColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
          ringColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
        }
      }

      ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
      ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

      const ringMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
      });

      return new THREE.Points(ringGeometry, ringMaterial);
    };

    // Create and add particle systems
    const asteroidSystem = createAsteroidParticles();
    const ringSystem = createSaturnRings();
    
    scene.add(asteroidSystem);
    scene.add(ringSystem);

    // Position ring system slightly offset
    ringSystem.position.set(-3, 1, -2);
    ringSystem.rotation.x = Math.PI / 6;

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Slow rotation for asteroids
      asteroidSystem.rotation.y += 0.0005;
      asteroidSystem.rotation.x += 0.0002;
      
      // Ring system rotates like Saturn's rings
      ringSystem.rotation.z += 0.001;
      
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
      
      // More subtle mouse interaction
      asteroidSystem.rotation.x += y * 0.02;
      asteroidSystem.rotation.z += x * 0.02;
      
      ringSystem.rotation.x += y * 0.01;
      ringSystem.rotation.y += x * 0.01;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      asteroidSystem.geometry.dispose();
      asteroidSystem.material.dispose();
      ringSystem.geometry.dispose();
      ringSystem.material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />;
};

export default WebGLBackground;
