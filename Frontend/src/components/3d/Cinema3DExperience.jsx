import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function Cinema3DExperience() {
  const containerRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // Dynamic Colored Accent Point Lights (BookMyTrip Red & Gold)
    const rubyLight = new THREE.PointLight(0xf84464, 4.0, 15);
    rubyLight.position.set(3, -2, 3);
    scene.add(rubyLight);

    const goldLight = new THREE.PointLight(0xfbbf24, 3.5, 15);
    goldLight.position.set(-3, 3, 3);
    scene.add(goldLight);

    // 4. Create Master 3D Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Texture Generator for Ticket Surface (Golden Holographic VIP Ticket)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Luxurious gradient background
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#1c1c24');
    grad.addColorStop(0.35, '#2e1c24');
    grad.addColorStop(0.7, '#1e1c26');
    grad.addColorStop(1, '#121217');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Gold borders & accents
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 964, 452);

    ctx.strokeStyle = 'rgba(248, 68, 100, 0.6)';
    ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, 932, 420);

    // Ticket Stub Perforation Line
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 8;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(720, 30);
    ctx.lineTo(720, 482);
    ctx.stroke();
    ctx.setLineDash([]);

    // Typography & Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('BOOKMYTRIP', 80, 110);

    ctx.fillStyle = '#F84464';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('VIP 3D CINEMA PASS', 80, 160);

    ctx.fillStyle = '#FBBF24';
    ctx.font = '600 24px monospace';
    ctx.fillText('ADMIT ONE  •  DOLBY ATMOS  •  IMAX LASER', 80, 210);

    // Row, Seat & Audi Badges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(80, 250, 580, 140);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 250, 580, 140);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('AUDITORIUM', 110, 290);
    ctx.fillText('ROW', 330, 290);
    ctx.fillText('SEAT', 480, 290);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('AUDI 1', 110, 350);
    ctx.fillText('VIP', 330, 350);
    ctx.fillText('A-01', 480, 350);

    // Barcode / QR Simulation on Stub
    ctx.fillStyle = '#FFFFFF';
    for (let x = 760; x < 940; x += 12) {
      const barW = Math.random() > 0.4 ? 6 : 3;
      ctx.fillRect(x, 100, barW, 280);
    }
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('#VIP-2026-X9', 760, 420);

    const ticketTexture = new THREE.CanvasTexture(canvas);
    ticketTexture.needsUpdate = true;

    // 5. 3D VIP Ticket Mesh
    const ticketGeo = new THREE.BoxGeometry(4.2, 2.1, 0.08);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }), // Right edge (Gold)
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }), // Left edge (Gold)
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }), // Top edge
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }), // Bottom edge
      new THREE.MeshStandardMaterial({
        map: ticketTexture,
        metalness: 0.45,
        roughness: 0.25,
        bumpScale: 0.02
      }), // Front face with texture
      new THREE.MeshStandardMaterial({
        color: 0x181822,
        metalness: 0.8,
        roughness: 0.3
      }) // Back face
    ];

    const ticketMesh = new THREE.Mesh(ticketGeo, materials);
    ticketMesh.castShadow = true;
    rootGroup.add(ticketMesh);

    // 6. 3D Floating Holographic Cinema Ring
    const ringGeo = new THREE.TorusGeometry(2.9, 0.04, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf84464,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x770020,
      emissiveIntensity: 0.3
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    rootGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(3.3, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x664400,
      emissiveIntensity: 0.3
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 3.5;
    ringMesh2.rotation.x = -Math.PI / 5;
    rootGroup.add(ringMesh2);

    // 7. Ambient Stardust Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 10;
      particlePos[i + 1] = (Math.random() - 0.5) * 8;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 8. Mouse / Touch Interactivity & Orbiting Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.15;
    let targetRotationY = -0.35;
    let mouseNormX = 0;
    let mouseNormY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      mouseNormX = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        targetRotationY += deltaX * 0.009;
        targetRotationX += deltaY * 0.009;
        prevMouseX = clientX;
        prevMouseY = clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. Smooth Render Loop (60 FPS)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Idle float oscillation
      if (!isDragging) {
        targetRotationY += 0.003;
        rootGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;
      }

      // Parallax mouse tilt
      const hoverTiltX = mouseNormY * 0.2;
      const hoverTiltY = mouseNormX * 0.2;

      // Smooth interpolation (slerp / lerp)
      rootGroup.rotation.x += (targetRotationX + hoverTiltX - rootGroup.rotation.x) * 0.08;
      rootGroup.rotation.y += (targetRotationY + hoverTiltY - rootGroup.rotation.y) * 0.08;

      // Orbiting decorative rings
      ringMesh1.rotation.z = elapsed * 0.25;
      ringMesh2.rotation.z = -elapsed * 0.2;

      // Slowly pulse colored point lights
      rubyLight.position.x = Math.sin(elapsed * 1.2) * 4;
      rubyLight.position.y = Math.cos(elapsed * 1.2) * 3;
      goldLight.position.x = -Math.sin(elapsed * 0.9) * 4;
      goldLight.position.y = -Math.cos(elapsed * 0.9) * 3;

      // Slow particle drift
      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      domElement.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      ticketGeo.dispose();
      materials.forEach((m) => m.dispose());
      ticketTexture.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none flex items-center justify-center">
      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        className={`w-full h-[320px] sm:h-[380px] lg:h-[420px] cursor-grab active:cursor-grabbing transition-transform ${
          isInteracting ? 'scale-[1.02]' : 'scale-100'
        }`}
        title="Click and drag to rotate the 3D VIP Ticket"
      />

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[11px] font-bold shadow-lg shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Interactive 3D • Click & Drag to Rotate</span>
        </div>
      </div>
    </div>
  );
}
