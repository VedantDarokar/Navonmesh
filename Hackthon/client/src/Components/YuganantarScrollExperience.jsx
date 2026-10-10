import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useOutletContext, useNavigate } from "react-router-dom";
import "../Styles/yuganantar_experience.css";

import chronoCutoutImg from "../assets/chrono_character_cutout.png";
import epicBgImg from "../assets/yuganantar_epic_bg.jpg";
import logoImg from "../assets/namonvesh-logo.png";
import CountdownTimer from "./CountdownTimer";
import StatsStrip from "./StatsStrip";

const YuganantarScrollExperience = () => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const apertureRef = useRef(null);
  const centerGlowRef = useRef(null);
  const hudOverlayRef = useRef(null);
  const contentSectionRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [apertureOpen, setApertureOpen] = useState(false);
  const [inTunnel, setInTunnel] = useState(false);
  const [isSiteVisible, setIsSiteVisible] = useState(false);

  const outletContext = useOutletContext();
  const openRegister = outletContext?.openRegister || (() => {
    window.location.hash = "#/register";
  });

  const navigate = useNavigate();

  // Three.js internal references
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    animId: null,
    // 3D Objects
    robotGroup: null,
    robotMesh: null,
    robotVisorGlow: null,
    robotCoreGlow: null,
    groundPortal: null,
    panoramicBg: null,
    starPoints: null,
    starVelocities: null,
    starInitialZ: null,
    warpStreaks: null,
    tunnelGroup: null,
    tunnelRings: [],
    tunnelHelix: null,
    // Lerped progress for butter-smooth camera
    currentProgress: 0,
    targetProgress: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  });

  // Handle Mouse Parallax
  const handleMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    threeRef.current.mouse.targetX = x * 0.5;
    threeRef.current.mouse.targetY = y * 0.5;
  }, []);

  // Jump smoothly to website content
  const handleSkipToIntro = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ==========================================
  // THREE.JS SCENE SETUP
  // ==========================================
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const width = canvasContainer.clientWidth || window.innerWidth;
    const height = canvasContainer.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.015);
    threeRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 42); // Initial distant vantage
    threeRef.current.camera = camera;

    // 3. Renderer with high dynamic range feel
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    canvasContainer.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    const clock = new THREE.Clock();
    threeRef.current.clock = clock;

    // 4. Ambient and Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1626, 2.5);
    scene.add(ambientLight);

    // Cyan Key Light (from portal floor & cyber structures)
    const cyanLight = new THREE.PointLight(0x00f0ff, 8, 80);
    cyanLight.position.set(0, 0, 8);
    scene.add(cyanLight);

    // Warm Sun/Ancient Accent Light (matches the temple side of bg)
    const goldLight = new THREE.DirectionalLight(0xffaa44, 2.0);
    goldLight.position.set(-20, 15, 10);
    scene.add(goldLight);

    // Electric Purple Rim Light
    const purpleLight = new THREE.PointLight(0x9d4edd, 6, 60);
    purpleLight.position.set(10, 8, -5);
    scene.add(purpleLight);

    // 5. Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // ------------------------------------------
    // A. PANORAMIC CYCLORAMA BACKGROUND
    // ------------------------------------------
    textureLoader.load(epicBgImg, (bgTex) => {
      bgTex.wrapS = THREE.RepeatWrapping;
      bgTex.repeat.set(1, 1);

      // Curved backdrop cylinder behind everything
      const bgGeo = new THREE.CylinderGeometry(120, 120, 90, 64, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
      const bgMat = new THREE.MeshBasicMaterial({
        map: bgTex,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      bgMesh.position.set(0, 2, -20);
      scene.add(bgMesh);
      threeRef.current.panoramicBg = bgMesh;
    });

    // ------------------------------------------
    // B. FLOATING 3D ROBOT CHARACTER (CHRONO-TRAVELER)
    // ------------------------------------------
    const robotGroup = new THREE.Group();
    robotGroup.position.set(0, 0.5, 0);
    scene.add(robotGroup);
    threeRef.current.robotGroup = robotGroup;

    textureLoader.load(chronoCutoutImg, (robotTex) => {
      robotTex.colorSpace = THREE.SRGBColorSpace;

      // Plane aspect ratio matches character (approx 3:4)
      const robotWidth = 9.5;
      const robotHeight = 14.2;
      const robotGeo = new THREE.PlaneGeometry(robotWidth, robotHeight, 32, 32);

      // Custom Shader for metallic sheen and edge energy pulse
      const robotMat = new THREE.MeshStandardMaterial({
        map: robotTex,
        transparent: true,
        roughness: 0.25,
        metalness: 0.85,
        alphaTest: 0.05,
        emissive: new THREE.Color(0x003344),
        emissiveIntensity: 0.6,
      });

      const robotMesh = new THREE.Mesh(robotGeo, robotMat);
      robotMesh.position.set(0, 1.5, 0);
      robotGroup.add(robotMesh);
      threeRef.current.robotMesh = robotMesh;

      // Luminous Cyan Visor / Helmet Glow
      const visorGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const visorMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.9,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 6.2, 0.4);
      visorMesh.scale.set(1.4, 0.6, 0.8);
      robotGroup.add(visorMesh);
      threeRef.current.robotVisorGlow = visorMesh;

      // Backpack / Chest Temporal Core Glow
      const coreGeo = new THREE.RingGeometry(0.1, 0.9, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, 3.8, 0.3);
      robotGroup.add(coreMesh);
      threeRef.current.robotCoreGlow = coreMesh;
    });

    // ------------------------------------------
    // C. GROUND PORTAL & CHRONO-ASTROLABE RINGS
    // ------------------------------------------
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, -5.2, 0);
    portalGroup.rotation.x = -Math.PI / 2;
    robotGroup.add(portalGroup);
    threeRef.current.groundPortal = portalGroup;

    // Concentric glowing portal floor rings
    const ringRadii = [3.2, 4.8, 6.5, 8.2];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.08, r + 0.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0xd4af37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75 - idx * 0.12,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.userData = { rotSpeed: (idx % 2 === 0 ? 1 : -1) * (0.2 + idx * 0.1) };
      portalGroup.add(ringMesh);
    });

    // Portal platform center disk
    const diskGeo = new THREE.CircleGeometry(3.0, 48);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x002838,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    portalGroup.add(diskMesh);

    // ------------------------------------------
    // D. 3D PARTICLE STARFIELD (STARDUST & CHRONO-SPARKS)
    // ------------------------------------------
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount);
    const starInitialZ = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Cylindrical spread along camera corridor
      const radius = 3 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 160;

      starPositions[i3] = Math.cos(angle) * radius;
      starPositions[i3 + 1] = Math.sin(angle) * radius;
      starPositions[i3 + 2] = z;
      starInitialZ[i] = z;
      starVelocities[i] = 0.5 + Math.random() * 1.5;

      // Color mix: Cyan, Gold, White, Violet
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        // Cyan
        starColors[i3] = 0.0;
        starColors[i3 + 1] = 0.9;
        starColors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.75) {
        // Gold
        starColors[i3] = 1.0;
        starColors[i3 + 1] = 0.8;
        starColors[i3 + 2] = 0.3;
      } else {
        // White/Violet
        starColors[i3] = 0.8;
        starColors[i3 + 1] = 0.6;
        starColors[i3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);
    threeRef.current.starPoints = starPoints;
    threeRef.current.starVelocities = starVelocities;
    threeRef.current.starInitialZ = starInitialZ;

    // ------------------------------------------
    // E. HYPERSPACE STREAKS (Active during Zoom Acceleration)
    // ------------------------------------------
    const streakCount = 300;
    const streakGeo = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(streakCount * 6); // 2 vertices per line
    const streakColors = new Float32Array(streakCount * 6);

    for (let i = 0; i < streakCount; i++) {
      const idx = i * 6;
      const angle = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 25;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = -20 + Math.random() * 50;

      // Start vertex
      streakPositions[idx] = x;
      streakPositions[idx + 1] = y;
      streakPositions[idx + 2] = z;

      // End vertex (stretched along Z)
      streakPositions[idx + 3] = x * 1.05;
      streakPositions[idx + 4] = y * 1.05;
      streakPositions[idx + 5] = z - 6;

      streakColors[idx] = 0.0;
      streakColors[idx + 1] = 0.95;
      streakColors[idx + 2] = 1.0;
      streakColors[idx + 3] = 0.6;
      streakColors[idx + 4] = 0.2;
      streakColors[idx + 5] = 1.0;
    }

    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    streakGeo.setAttribute("color", new THREE.BufferAttribute(streakColors, 3));

    const streakMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0, // fades in during acceleration
      blending: THREE.AdditiveBlending,
    });
    const streakLines = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(streakLines);
    threeRef.current.warpStreaks = streakLines;

    // ------------------------------------------
    // F. 3D TIME-SPACE TUNNEL (CONCENTRIC RINGS & HELIX)
    // ------------------------------------------
    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.set(0, 0, -5);
    scene.add(tunnelGroup);
    threeRef.current.tunnelGroup = tunnelGroup;

    const ringCount = 28;
    const tunnelRings = [];

    for (let i = 0; i < ringCount; i++) {
      const ringZ = -10 - i * 5.5; // Extends back to Z = -160
      const ringRadius = 4.2 + (i % 3) * 0.4;
      const tubeRadius = 0.07;

      const tGeo = new THREE.TorusGeometry(ringRadius, tubeRadius, 16, 64);
      const isCyan = i % 2 === 0;
      const tMat = new THREE.MeshBasicMaterial({
        color: isCyan ? 0x00f0ff : (i % 4 === 1 ? 0x9d4edd : 0x10b981),
        wireframe: i % 3 === 0,
        transparent: true,
        opacity: 0.0, // Activated dynamically during tunnel phase
      });

      const ringMesh = new THREE.Mesh(tGeo, tMat);
      ringMesh.position.set(0, 0, ringZ);
      ringMesh.userData = {
        baseZ: ringZ,
        rotSpeedZ: (i % 2 === 0 ? 1 : -1) * (0.015 + Math.random() * 0.02),
        index: i,
      };
      tunnelGroup.add(ringMesh);
      tunnelRings.push(ringMesh);
    }
    threeRef.current.tunnelRings = tunnelRings;

    // Twisting Double Helix Energy Ribbon in the tunnel
    const helixCurvePoints = [];
    for (let t = 0; t < 120; t++) {
      const theta = t * 0.35;
      const r = 3.6;
      const hz = -10 - t * 1.3;
      helixCurvePoints.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, hz));
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixCurvePoints);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 120, 0.08, 8, false);
    const helixMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const helixMesh = new THREE.Mesh(helixGeo, helixMat);
    tunnelGroup.add(helixMesh);
    threeRef.current.tunnelHelix = helixMesh;

    // Singularity Beacon at the deep end of the tunnel
    const singGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const singMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const singularity = new THREE.Mesh(singGeo, singMat);
    singularity.position.set(0, 0, -165);
    tunnelGroup.add(singularity);

    // ------------------------------------------
    // ANIMATION LOOP (Butter-Smooth 60/120 FPS Lerp)
    // ------------------------------------------
    const renderLoop = () => {
      threeRef.current.animId = requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      threeRef.current.mouse.x += (threeRef.current.mouse.targetX - threeRef.current.mouse.x) * 0.05;
      threeRef.current.mouse.y += (threeRef.current.mouse.targetY - threeRef.current.mouse.y) * 0.05;

      // Smooth progress lerp (creates real cinema crane momentum)
      const curP = threeRef.current.currentProgress;
      const tgtP = threeRef.current.targetProgress;
      const nextP = curP + (tgtP - curP) * 0.09;
      threeRef.current.currentProgress = nextP;

      // ----------------------------------------------------
      // PHASE 1: Center Opening & Robot Reveal (Progress 0.00 -> 0.30)
      // ----------------------------------------------------
      // PHASE 2: Continued Zoom In on Robot (Progress 0.30 -> 0.65)
      // ----------------------------------------------------
      // PHASE 3: Zoom Acceleration & Streaks (Progress 0.65 -> 0.80)
      // ----------------------------------------------------
      // PHASE 4: Enter Time-Space Tunnel (Progress 0.80 -> 0.94)
      // ----------------------------------------------------
      // PHASE 5: Destination Reached / Conclave Reveal (Progress 0.94 -> 1.0)
      // ----------------------------------------------------

      // Camera Z movement
      let targetCamZ;
      let targetCamY;
      let targetFov;

      if (nextP < 0.35) {
        // Slow approach, character in view
        const t = nextP / 0.35;
        targetCamZ = 42 - t * 14; // 42 -> 28
        targetCamY = 1.2 + Math.sin(elapsed * 0.8) * 0.15;
        targetFov = 48 - t * 4;
      } else if (nextP < 0.68) {
        // Zooming directly toward robot chest & visor
        const t = (nextP - 0.35) / (0.68 - 0.35);
        targetCamZ = 28 - t * 24; // 28 -> 4 (extremely close to robot)
        targetCamY = 1.2 + t * 0.8;
        targetFov = 44 + t * 12; // Dynamic focal length acceleration
      } else if (nextP < 0.92) {
        // Flying right through robot nexus into the time-space tunnel!
        const t = (nextP - 0.68) / (0.92 - 0.68);
        targetCamZ = 4 - t * 85; // 4 -> -81 (deep inside tunnel!)
        targetCamY = 2.0 - t * 1.5;
        targetFov = 56 + Math.sin(t * Math.PI) * 18; // Hyperspace FOV warp
      } else {
        // Emergence at the grand Yuganantar destination
        const t = (nextP - 0.92) / (1.0 - 0.92);
        targetCamZ = -81 - t * 30; // -81 -> -111
        targetCamY = 0.5;
        targetFov = 50;
      }

      camera.position.z = targetCamZ;
      camera.position.y = targetCamY + threeRef.current.mouse.y * 1.2;
      camera.position.x = threeRef.current.mouse.x * 2.5;
      camera.fov = targetFov;
      camera.updateProjectionMatrix();

      // Look slightly ahead into the vanishing point
      camera.lookAt(0, targetCamY * 0.6, targetCamZ - 30);

      // ----------------------------------------------------
      // ROBOT KINEMATICS & VISIBILITY
      // ----------------------------------------------------
      if (robotGroup) {
        // Subtle floating breathing motion
        const hover = Math.sin(elapsed * 1.6) * 0.18;
        robotGroup.position.y = 0.5 + hover;
        // Subtle reactive tilt with camera / mouse
        robotGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.05 + threeRef.current.mouse.x * 0.12;
        robotGroup.rotation.x = hover * 0.05 - threeRef.current.mouse.y * 0.08;

        // When camera passes Z = 2, fade out robot smoothly so camera doesn't clip ugly geometry
        if (robotMesh) {
          if (nextP > 0.68) {
            const fade = Math.max(0, 1 - (nextP - 0.68) / 0.08);
            robotMesh.material.opacity = fade;
          } else {
            robotMesh.material.opacity = 1.0; // Fully visible from the first frame
          }
        }

        // Visor & Core Pulsing
        if (threeRef.current.robotVisorGlow) {
          const visorPulse = 0.7 + Math.sin(elapsed * 4.0) * 0.3;
          threeRef.current.robotVisorGlow.material.opacity = visorPulse;
        }
        if (threeRef.current.robotCoreGlow) {
          const corePulse = 0.6 + Math.cos(elapsed * 3.5) * 0.35;
          threeRef.current.robotCoreGlow.material.opacity = corePulse;
          threeRef.current.robotCoreGlow.rotation.z += 0.02;
        }

        // Rotate ground portal rings
        if (portalGroup) {
          portalGroup.children.forEach((child) => {
            if (child.userData.rotSpeed) {
              child.rotation.z += child.userData.rotSpeed * delta;
            }
          });
        }
      }

      // Rotate Panoramic Background slowly
      if (threeRef.current.panoramicBg) {
        threeRef.current.panoramicBg.rotation.y = elapsed * 0.015;
      }

      // ----------------------------------------------------
      // PARTICLES & WARP STREAKS
      // ----------------------------------------------------
      if (starPoints) {
        const positions = starPoints.geometry.attributes.position.array;
        const velMultiplier = 1.0 + Math.pow(nextP, 2.5) * 45; // Huge velocity boost with scroll

        for (let i = 0; i < starCount; i++) {
          const i3 = i * 3;
          positions[i3 + 2] += starVelocities[i] * delta * velMultiplier;

          // Wrap particles around current camera Z so starfield is perpetual
          if (positions[i3 + 2] > camera.position.z + 10) {
            positions[i3 + 2] = camera.position.z - 120;
          } else if (positions[i3 + 2] < camera.position.z - 120) {
            positions[i3 + 2] = camera.position.z + 10;
          }
        }
        starPoints.geometry.attributes.position.needsUpdate = true;
      }

      // Hyperspace Streaks Opacity (Active during rapid zoom 0.55 -> 0.85)
      if (threeRef.current.warpStreaks) {
        let streakAlpha = 0;
        if (nextP > 0.52 && nextP < 0.88) {
          streakAlpha = Math.sin(((nextP - 0.52) / (0.88 - 0.52)) * Math.PI) * 0.85;
        }
        threeRef.current.warpStreaks.material.opacity = streakAlpha;
        threeRef.current.warpStreaks.rotation.z += delta * (1.0 + nextP * 5.0);
      }

      // ----------------------------------------------------
      // TIME-SPACE TUNNEL RINGS
      // ----------------------------------------------------
      if (tunnelGroup) {
        const inTunnelZone = nextP > 0.65;
        tunnelRings.forEach((ring) => {
          ring.rotation.z += ring.userData.rotSpeedZ * (1 + nextP * 4);

          if (inTunnelZone) {
            // Rings glow brighter the closer the camera is
            const dist = Math.abs(camera.position.z - ring.position.z);
            const proximityGlow = Math.max(0, 1 - dist / 40);
            ring.material.opacity = Math.min(0.9, proximityGlow * 1.2);
            ring.scale.setScalar(1.0 + Math.sin(elapsed * 3 + ring.userData.index) * 0.05);
          } else {
            ring.material.opacity = 0;
          }
        });

        if (threeRef.current.tunnelHelix) {
          threeRef.current.tunnelHelix.rotation.z = elapsed * 0.8 + nextP * 12;
          threeRef.current.tunnelHelix.material.opacity = inTunnelZone
            ? Math.min(0.75, (nextP - 0.65) * 4)
            : 0;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      if (!canvasContainer || !threeRef.current.renderer || !threeRef.current.camera) return;
      const newW = canvasContainer.clientWidth || window.innerWidth;
      const newH = canvasContainer.clientHeight || window.innerHeight;
      threeRef.current.camera.aspect = newW / newH;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeRef.current.animId) {
        cancelAnimationFrame(threeRef.current.animId);
      }
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ==========================================
  // SCROLL TIMELINE CONTROLLER
  // Maps container scroll to progress (0.0 to 1.0)
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollableDistance = container.offsetHeight - window.innerHeight;

      if (totalScrollableDistance <= 0) return;

      // Calculate progress 0.0 to 1.0 within the pinned canvas viewport
      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));

      setScrollProgress(rawProgress);
      threeRef.current.targetProgress = rawProgress;

      // Update state flags for DOM effects
      setApertureOpen(rawProgress > 0.02);
      setInTunnel(rawProgress > 0.70);
      setIsSiteVisible(rawProgress > 0.85);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Compute CSS Center Aperture Mask parameters based on scrollProgress
  // Phase 1 (0.0 to 0.28): tiny center point expands to full screen circle
  const apertureRadiusPercent = Math.min(100, Math.pow(scrollProgress / 0.28, 1.8) * 100);
  const isApertureFullyOpen = scrollProgress >= 0.28;

  return (
    <div className="yuganantar-viewport-wrapper">
      {/* 460vh Scroll Track driving the camera journey */}
      <div className="yuganantar-scroll-track" ref={containerRef}>
        {/* Pinned 100vh Fullscreen Canvas Container */}
        <div className="yuganantar-pinned-stage">
          {/* 3D WebGL Canvas Mount */}
          <div className="yuganantar-webgl-mount" ref={canvasContainerRef} />

          {/* ---------------------------------------------------- */}
          {/* HERO BILLBOARD OVERLAY (Visible immediately at scroll 0) */}
          {/* ---------------------------------------------------- */}
          <div
            className="yuganantar-stage-hero-overlay"
            style={{
              opacity: Math.max(0, 1 - scrollProgress / 0.22),
              transform: `translateY(-${scrollProgress * 240}px) scale(${1 - scrollProgress * 0.12})`,
              pointerEvents: scrollProgress > 0.20 ? "none" : "auto",
            }}
          >
            <div className="billboard-container">
              <div className="presenter-tag">
                <span className="tag-line" />
                <span>SHRI SANT GAJANAN MAHARAJ COLLEGE OF ENGINEERING PRESENTS</span>
                <span className="tag-line" />
              </div>

              <div className="grand-title-lockup">
                <div className="title-back-glow" />
                <h1 className="title-yuganantar">YUGANANTAR</h1>
                <div className="title-edition-badge">2026 EDITION</div>
              </div>

              <h2 className="marathi-sacred-motto">ज्ञानातून नवोन्मेष, नवोन्मेषातून विकास</h2>
              <p className="epic-hero-subtext">
                Where Ancient Civilization Wisdom Converges with Futuristic Quantum Intelligence.
                Join 5,000+ Innovators, Engineers & Creators Across India in SSGMCE's Flagship Conclave.
              </p>

              {/* Event Meta Pills */}
              <div className="event-meta-bar">
                <div className="meta-pill">
                  <span className="meta-icon">⚡</span>
                  <span className="meta-text">National Symposium & Hackathon</span>
                </div>
                <div className="meta-pill">
                  <span className="meta-icon">🏛️</span>
                  <span className="meta-text">SSGMCE Campus, Shegaon</span>
                </div>
                <div className="meta-pill">
                  <span className="meta-icon">🏆</span>
                  <span className="meta-text">₹2,50,000+ Prize Pool</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="hero-cta-group">
                <button className="btn-yuganantar-primary" onClick={openRegister}>
                  <span className="btn-sparkle">✦</span>
                  <span>REGISTER FOR YUGANANTAR</span>
                  <span className="btn-arrow">→</span>
                </button>

                <button
                  className="btn-yuganantar-secondary"
                  onClick={handleSkipToIntro}
                >
                  <span>EXPLORE ARENAS</span>
                </button>
              </div>

              {/* Countdown Integration */}
              <div className="hero-countdown-wrapper">
                <CountdownTimer />
              </div>

              {/* Scroll prompt cue */}
              <div className="hero-scroll-cue">
                <span className="scroll-cue-text">SCROLL TO TRAVEL THROUGH TIME-SPACE</span>
                <div className="scroll-cue-arrow">
                  <span className="cue-arrow-down" />
                  <span className="cue-arrow-down" />
                </div>
              </div>
            </div>
          </div>

          {/* Glowing Aperture Border Ring & Sparks (Expands during zoom) */}
          {scrollProgress > 0.02 && scrollProgress < 0.45 && (
            <div
              className="aperture-rim-glow"
              style={{
                width: `${Math.max(12, apertureRadiusPercent * 2.2)}vmax`,
                height: `${Math.max(12, apertureRadiusPercent * 2.2)}vmax`,
                opacity: Math.min(1, (0.45 - scrollProgress) * 4),
              }}
            >
              <div className="aperture-electric-sparks" />
            </div>
          )}

          {/* Cinematic Radial Motion Blur & Chromatic Aberration Vignette */}
          <div
            className="yuganantar-warp-blur"
            style={{
              opacity:
                scrollProgress > 0.50 && scrollProgress < 0.92
                  ? Math.sin(((scrollProgress - 0.50) / (0.92 - 0.50)) * Math.PI) * 0.8
                  : 0,
            }}
          />

          {/* Cinematic Top/Bottom Letterbox Bars for Movie Atmosphere */}
          <div className="cinema-letterbox letterbox-top" />
          <div className="cinema-letterbox letterbox-bottom" />

          {/* Floating Live HUD Metrics */}
          <div className={`yuganantar-cinematic-hud ${scrollProgress > 0.04 ? "hud-active" : ""}`}>
            <div className="hud-metric hud-top-left">
              <span className="hud-label">CHRONO-COORDINATE</span>
              <span className="hud-value">
                {scrollProgress < 0.35
                  ? "ERA: VEDIC-ROOT [00:00:26]"
                  : scrollProgress < 0.70
                  ? "WARP ACCEL: 8.84c"
                  : scrollProgress < 0.92
                  ? "DIMENSION: 11-D NEXUS"
                  : "YUGANANTAR : REACHED"}
              </span>
            </div>

            <div className="hud-metric hud-top-right">
              <button
                className="skip-intro-btn"
                onClick={handleSkipToIntro}
                title="Direct Jump to Conclave"
              >
                EXPLORE CONCLAVE ▾
              </button>
            </div>

            <div className="hud-metric hud-bottom-center">
              <div className="timeline-progress-track">
                <div
                  className="timeline-progress-fill"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span className="timeline-caption">
                {scrollProgress < 0.28
                  ? "PHASE I • HERO CONVERGENCE"
                  : scrollProgress < 0.65
                  ? "PHASE II • TIME-TRAVELER APPROACH"
                  : scrollProgress < 0.90
                  ? "PHASE III • TIME-SPACE WARP TUNNEL"
                  : "PHASE IV • YUGANANTAR CONCLAVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SEAMLESS DESTINATION SECTION: YUGANANTAR HOMEPAGE    */}
      {/* ==================================================== */}
      <section
        className={`yuganantar-main-content-section ${isSiteVisible ? "content-revealed" : ""}`}
        ref={contentSectionRef}
        id="yuganantar-conclave"
      >

        {/* -------------------------------------------------- */}
        {/* SECTION: EVOLUTION OF CIVILIZATION (THE TIME AXIS) */}
        {/* -------------------------------------------------- */}
        <section className="civilization-evolution-strip">
          <div className="section-title-wrapper">
            <span className="super-title">THE METAVERSE OF TIME</span>
            <h2 className="section-heading">EVOLUTION OF CIVILIZATION</h2>
            <p className="section-description">
              Journey through the four great epochs that shape human thought, technological revolutions, and the ultimate destiny of artificial intelligence.
            </p>
          </div>

          <div className="epochs-grid">
            {/* Epoch 1 */}
            <div className="epoch-card epoch-ancient">
              <div className="epoch-header">
                <span className="epoch-number">EPOCH 01</span>
                <span className="epoch-era">VEDIC ERA</span>
              </div>
              <div className="epoch-glow" />
              <h3 className="epoch-title">Ancient Wisdom</h3>
              <p className="epoch-desc">
                Foundations of Indian mathematics, Vedic astronomy, sacred geometries, metallurgy, and cosmic philosophy.
              </p>
              <div className="epoch-features">
                <span>Aryabhata's Zero</span>
                <span>Astrolabes</span>
                <span>Architecture</span>
              </div>
            </div>

            {/* Epoch 2 */}
            <div className="epoch-card epoch-industrial">
              <div className="epoch-header">
                <span className="epoch-number">EPOCH 02</span>
                <span className="epoch-era">INDUSTRIAL AGE</span>
              </div>
              <div className="epoch-glow" />
              <h3 className="epoch-title">Mechanical Might</h3>
              <p className="epoch-desc">
                Steam engines, mechanical precision, electrical circuits, mass communication, and modern industrial infrastructure.
              </p>
              <div className="epoch-features">
                <span>Thermodynamics</span>
                <span>Locomotives</span>
                <span>Grid Power</span>
              </div>
            </div>

            {/* Epoch 3 */}
            <div className="epoch-card epoch-silicon">
              <div className="epoch-header">
                <span className="epoch-number">EPOCH 03</span>
                <span className="epoch-era">SILICON REVOLUTION</span>
              </div>
              <div className="epoch-glow" />
              <h3 className="epoch-title">Digital Frontier</h3>
              <p className="epoch-desc">
                Microchips, the World Wide Web, distributed cloud computing, cyber-physical automation, and ubiquitous smartphones.
              </p>
              <div className="epoch-features">
                <span>Semiconductors</span>
                <span>The Internet</span>
                <span>Cybernetics</span>
              </div>
            </div>

            {/* Epoch 4 */}
            <div className="epoch-card epoch-cyber">
              <div className="epoch-header">
                <span className="epoch-number">EPOCH 04</span>
                <span className="epoch-era">ANANTA FUTURE</span>
              </div>
              <div className="epoch-glow" />
              <h3 className="epoch-title">Chrono & Quantum AI</h3>
              <p className="epoch-desc">
                Autonomous humanoid robotics, quantum neural networks, interplanetary colonies, and timeless synthesis of mind and machine.
              </p>
              <div className="epoch-features">
                <span>Quantum Sync</span>
                <span>Autonomous Robotics</span>
                <span>Time-Space AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECTION: FLAGSHIP ARENAS LAUNCHPAD                 */}
        {/* -------------------------------------------------- */}
        <section className="flagship-arenas-section">
          <div className="section-title-wrapper">
            <span className="super-title">BATTLEGROUNDS OF EXCELLENCE</span>
            <h2 className="section-heading">FLAGSHIP ARENAS</h2>
            <p className="section-description">
              Test your mettle across hardware, software, autonomous drones, research papers, and cultural spectacles.
            </p>
          </div>

          <div className="arenas-cards-layout">
            <div className="arena-hub-card card-hackathon" onClick={() => navigate("/hackathon")}>
              <div className="card-badge">36-HOUR CHALLENGE</div>
              <div className="card-symbol">💻</div>
              <h3 className="card-title">National Hackathon 2026</h3>
              <p className="card-info">
                Non-stop rapid prototyping in AI, FinTech, Web3, Smart Cities, and Healthcare.
              </p>
              <div className="card-action">EXPLORE HACKATHON →</div>
            </div>

            <div className="arena-hub-card card-projectexpo" onClick={() => navigate("/projectexpo")}>
              <div className="card-badge">INNOVATION EXPO</div>
              <div className="card-symbol">⚙️</div>
              <h3 className="card-title">Project Expo & Startups</h3>
              <p className="card-info">
                Live demonstration of working hardware models, IoT systems, robotics, and patentable inventions.
              </p>
              <div className="card-action">VIEW PROJECT EXPO →</div>
            </div>

            <div className="arena-hub-card card-pursuit" onClick={() => navigate("/pursuit")}>
              <div className="card-badge">TECH SYMPOSIUM</div>
              <div className="card-symbol">🚀</div>
              <h3 className="card-title">Pursuit 2026</h3>
              <p className="card-info">
                National paper presentations, technical debates, coding sprints, and guest lectures from industry icons.
              </p>
              <div className="card-action">ENTER PURSUIT →</div>
            </div>

            <div className="arena-hub-card card-cultural" onClick={() => navigate("/cultural")}>
              <div className="card-badge">CELEBRITY NIGHT</div>
              <div className="card-symbol">🎭</div>
              <h3 className="card-title">Cultural & Pronite Extravaganza</h3>
              <p className="card-info">
                Battle of bands, thematic dances, drama competitions, fashion runway, and live celebrity concert.
              </p>
              <div className="card-action">JOIN CULTURAL →</div>
            </div>
          </div>
        </section>

        {/* Stats Strip Component */}
        <StatsStrip />
      </section>
    </div>
  );
};

export default YuganantarScrollExperience;
