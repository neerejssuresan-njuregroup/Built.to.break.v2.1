/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";

export default function EmberOverlay({ active }) {
  const canvasRef = useRef(null);
  const isPastMetricsRef = useRef(false);
  const lastScrollYRef = useRef(0);

  // Scroll listener to detect if we have reached the Core Analytical Metrics (scrollytelling) or beyond
  useEffect(() => {
    const handleScroll = () => {
      const scrollytellingSec = document.getElementById("section-scrollytelling");
      if (!scrollytellingSec) return;

      const rect = scrollytellingSec.getBoundingClientRect();
      // True if the scrollytelling section top has crossed or is about to cross the viewport
      isPastMetricsRef.current = rect.top <= window.innerHeight * 0.9;
      
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;

      // If scrolling fast, shake structural parts and spawn extra debris
      if (isPastMetricsRef.current && scrollDelta > 15 && Math.random() < 0.25) {
        window.dispatchEvent(new CustomEvent("structural-rumble", { detail: { intensity: scrollDelta } }));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let particles = [];
    let fallingDebris = [];
    let flameTrails = [];
    let waterParticles = [];
    let nextDebrisId = 0;

    // Rescue Helicopter simulation state (runs twice past metrics, then done)
    const helicopter = {
      x: -180,
      y: 120,
      state: 'fly-in',
      cycleCount: 0,
      cableLen: 0,
      victimAttached: false,
      rotorAngle: 0,
      hoverTimer: 0
    };

    const colors = [
      "rgba(249, 115, 22, ", // Orange-500
      "rgba(239, 68, 68, ",  // Red-500
      "rgba(251, 191, 36, ", // Amber-400
      "rgba(220, 38, 38, ",  // Red-600
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Floating sparks/embers generator
    const createParticle = (spawnAtBottom = false) => {
      const size = Math.random() * 3.5 + 0.8;
      const x = Math.random() * canvas.width;
      const y = spawnAtBottom ? canvas.height + 20 : Math.random() * canvas.height;
      const maxAlpha = Math.random() * 0.7 + 0.3;

      return {
        x,
        y,
        size,
        vx: (Math.random() * 1.5 - 0.75), 
        vy: -(Math.random() * 2.2 + 1.2),  
        alpha: spawnAtBottom ? 0 : Math.random() * maxAlpha,
        maxAlpha,
        decay: Math.random() * 0.003 + 0.0015,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        wobbleRange: Math.random() * 1.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
      };
    };

    // Realistic Falling building parts generator
    const spawnDebris = (forceIntensity = 0) => {
      const types = [
        'brick', 'beam', 'shard', 'concrete_slab', 'glowing_chunk'
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const size = type === 'beam' 
        ? Math.random() * 16 + 10  // metallic rods/beams
        : type === 'concrete_slab'
        ? Math.random() * 14 + 10  // chunky slab fragments
        : Math.random() * 8 + 5;   // bricks/shards are smaller
        
      const x = Math.random() * canvas.width;
      const y = -40; 
      
      const vy = Math.random() * 2.5 + 2.0 + (forceIntensity * 0.04); 
      const vx = Math.random() * 2.0 - 1.0; 
      
      let color = "#18181b"; // default charred gray
      if (type === 'glowing_chunk') {
        color = "#ea580c"; // bright glowing orange
      } else if (type === 'brick') {
        color = "#7f1d1d"; // deep red-900 charred clay brick
      } else if (type === 'concrete_slab') {
        color = "#3f3f46"; // zinc-700 concrete
      } else if (type === 'shard') {
        color = "#52525b"; // zinc-600 glass/slate shard
      }

      fallingDebris.push({
        id: nextDebrisId++,
        x,
        y,
        size,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.04 - 0.02),
        type,
        color,
        onFire: type === 'glowing_chunk' || type === 'beam' || Math.random() > 0.45,
        hasRebar: type === 'concrete_slab' && Math.random() > 0.4
      });
    };

    const handleRumble = (e) => {
      const customEvent = e;
      const intensity = customEvent.detail?.intensity || 10;
      const count = Math.min(Math.floor(intensity / 15) + 1, 3);
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnDebris(intensity), i * 180);
      }
    };

    window.addEventListener("structural-rumble", handleRumble);

    // Initialize general ambient sparks
    const initialCount = active ? 40 : 15;
    for (let i = 0; i < initialCount; i++) {
      particles.push(createParticle(false));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isPastMetrics = isPastMetricsRef.current;

      // 1. SPARK EMBER FLUID PHYSICS
      const targetCount = active ? 110 : (isPastMetrics ? 45 : 12);
      if (particles.length < targetCount && Math.random() < (active ? 0.4 : 0.12)) {
        particles.push(createParticle(true));
      }

      particles = particles.filter((p) => {
        p.y += p.vy;
        p.angle += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.angle) * p.wobbleRange;

        if (p.alpha < p.maxAlpha && p.y > canvas.height - 50) {
          p.alpha += 0.04;
        } else {
          p.alpha -= p.decay;
        }

        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20 || p.alpha <= 0) {
          return false;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.size > 2.2 && (active || isPastMetrics)) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
          glow.addColorStop(0, p.color + p.alpha + ")");
          glow.addColorStop(0.3, p.color + (p.alpha * 0.4) + ")");
          glow.addColorStop(1, p.color + "0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color + p.alpha + ")";
          ctx.fill();
        }

        return true;
      });

      // 2. FALLING BUILDING DEBRIS SYSTEM (FEW ONLY, REALISTIC)
      if (isPastMetrics) {
        // Kept extremely sparse (few only) for high realism
        const spawnChance = active ? 0.015 : 0.005;
        if (Math.random() < spawnChance && fallingDebris.length < 2) {
          spawnDebris();
        }

        fallingDebris = fallingDebris.filter((d) => {
          d.y += d.vy;
          d.x += d.vx;
          d.rotation += d.rotationSpeed;

          if (d.y > canvas.height + 40) {
            return false;
          }

          if (d.onFire && Math.random() < 0.65) {
            flameTrails.push({
              x: d.x + (Math.random() * d.size - d.size / 2),
              y: d.y + (Math.random() * d.size - d.size / 2),
              size: Math.random() * 2.5 + 1.5,
              vx: (Math.random() * 1.0 - 0.5) + d.vx * 0.15,
              vy: -(Math.random() * 1.2 + 0.4),
              alpha: 0.9,
              color: colors[Math.floor(Math.random() * colors.length)],
              decay: Math.random() * 0.035 + 0.018
            });
          }

          // Render highly realistic structural fragments
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rotation);
          
          ctx.shadowColor = "rgba(239, 68, 68, 0.4)";
          ctx.shadowBlur = d.onFire ? 12 : 0;
          ctx.fillStyle = d.color;
          
          if (d.type === 'brick') {
            // Textured rectangular clay brick
            ctx.fillRect(-d.size, -d.size / 2, d.size * 2, d.size);
            // Cracks
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-d.size / 2, -d.size / 2);
            ctx.lineTo(0, d.size / 4);
            ctx.lineTo(d.size / 3, -d.size / 4);
            ctx.stroke();
          } else if (d.type === 'beam') {
            // Steel I-Beam cross-section profile
            ctx.fillRect(-d.size, -2, d.size * 2, 4);
            ctx.fillRect(-d.size, -4, 2, 8);
            ctx.fillRect(d.size - 2, -4, 2, 8);
            if (d.onFire) {
              const gradient = ctx.createLinearGradient(-d.size, 0, d.size, 0);
              gradient.addColorStop(0, "rgba(239, 68, 68, 0.95)");
              gradient.addColorStop(0.4, "rgba(249, 115, 22, 0.85)");
              gradient.addColorStop(0.8, d.color);
              ctx.fillStyle = gradient;
              ctx.fillRect(-d.size, -2, d.size * 2, 4);
            }
          } else if (d.type === 'concrete_slab') {
            // Jagged concrete block with possible rusty rebar sticking out
            ctx.beginPath();
            ctx.moveTo(-d.size, -d.size / 2);
            ctx.lineTo(d.size * 0.8, -d.size * 0.7);
            ctx.lineTo(d.size, d.size / 2);
            ctx.lineTo(-d.size * 0.7, d.size * 0.8);
            ctx.closePath();
            ctx.fill();

            // Render exposed reinforcement wire (rebar)
            if (d.hasRebar) {
              ctx.strokeStyle = "#5a5a5a";
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(d.size * 0.2, 0);
              ctx.quadraticCurveTo(d.size * 1.5, -d.size * 0.3, d.size * 1.9, d.size * 0.4);
              ctx.stroke();
              // Spark at end of rebar
              if (d.onFire) {
                ctx.fillStyle = "#f59e0b";
                ctx.beginPath();
                ctx.arc(d.size * 1.9, d.size * 0.4, 2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else if (d.type === 'shard') {
            // Glass shard, semi-transparent & shiny
            ctx.fillStyle = "rgba(161, 161, 170, 0.55)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -d.size);
            ctx.lineTo(d.size * 0.6, d.size * 0.6);
            ctx.lineTo(-d.size * 0.7, d.size * 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Pure glowing fire chunk
            ctx.fillStyle = "rgba(249, 115, 22, 1.0)";
            ctx.beginPath();
            ctx.arc(0, 0, d.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          return true;
        });

        flameTrails = flameTrails.filter((t) => {
          t.x += t.vx;
          t.y += t.vy;
          t.alpha -= t.decay;
          if (t.alpha <= 0) return false;

          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
          ctx.fillStyle = t.color + t.alpha + ")";
          ctx.fill();
          return true;
        });
      }

      // 3. CORE ANALYTICAL SCENE: MULTISTORY FIRE ACCIDENT ZONE WITH EMERGENCY VEHICLES, FIREFIGHTERS, AND HOSE
      if (isPastMetrics) {
        const height = canvas.height;
        const width = canvas.width;
        const pulse = 0.5 + Math.sin(Date.now() * 0.003) * 0.25;

        // --- BACKGROUND ELEMENT: BURNING MULTISTORY BUILDING ---
        // Let's place it on the Right Side (starting at canvas width - 260px)
        const bldX = width - 260;
        const bldW = 210;
        const bldH = 260;
        const bldY = height - bldH;

        // --- DYNAMIC HELICOPTER RESCUE PATROL (TWICE REPEAT, THEN DONE) ---
        if (helicopter.state !== 'done') {
          const targetX = bldX + 110;
          const hoverY = height - 370;

          helicopter.rotorAngle += 0.8;

          if (helicopter.state === 'fly-in') {
            helicopter.x += 2.5;
            helicopter.y += (hoverY - helicopter.y) * 0.05 + Math.sin(Date.now() * 0.005) * 0.3;

            if (helicopter.x >= targetX) {
              helicopter.x = targetX;
              helicopter.state = 'hover-rescue';
              helicopter.cableLen = 0;
              helicopter.victimAttached = false;
              helicopter.hoverTimer = 0;
            }
          } else if (helicopter.state === 'hover-rescue') {
            helicopter.x = targetX + Math.sin(Date.now() * 0.006) * 1.5;
            helicopter.y = hoverY + Math.cos(Date.now() * 0.005) * 1.0;

            if (!helicopter.victimAttached) {
              if (helicopter.cableLen < 120) {
                helicopter.cableLen += 1.5;
              } else {
                helicopter.hoverTimer++;
                if (helicopter.hoverTimer > 60) {
                  helicopter.victimAttached = true;
                }
              }
            } else {
              if (helicopter.cableLen > 0) {
                helicopter.cableLen -= 1.8;
              } else {
                helicopter.state = 'fly-out';
              }
            }
          } else if (helicopter.state === 'fly-out') {
            helicopter.x += 3.5;
            helicopter.y -= 0.8;

            if (helicopter.x > width + 180) {
              helicopter.cycleCount++;
              if (helicopter.cycleCount < 2) {
                helicopter.x = -180;
                helicopter.y = 120;
                helicopter.state = 'fly-in';
                helicopter.cableLen = 0;
                helicopter.victimAttached = false;
                helicopter.hoverTimer = 0;
              } else {
                helicopter.state = 'done';
              }
            }
          }

          // Draw the Helicopter
          if (helicopter.x > -150 && helicopter.x < width + 150) {
            ctx.save();
            ctx.translate(helicopter.x, helicopter.y);

            // Draw rescue cable and rescue payload
            if (helicopter.state === 'hover-rescue') {
              ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(0, 8);
              ctx.lineTo(0, 8 + helicopter.cableLen);
              ctx.stroke();

              const victimY = 8 + helicopter.cableLen;
              if (helicopter.cableLen > 10) {
                ctx.fillStyle = "#020202";
                ctx.beginPath();
                ctx.arc(0, victimY + 3, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(-1.5, victimY + 5, 3, 6);
                ctx.fillRect(-2.5, victimY + 11, 1, 5);
                ctx.fillRect(1.5, victimY + 11, 1, 5);

                if (helicopter.victimAttached) {
                  ctx.fillStyle = "#0c0a09";
                  ctx.beginPath();
                  ctx.arc(1.5, victimY + 4, 1.8, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillRect(0.5, victimY + 6, 2, 5);
                }
              }
            }

            // Helicopter fuselage
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.ellipse(5, 0, 22, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Tail boom
            ctx.beginPath();
            ctx.moveTo(-16, -2);
            ctx.lineTo(-44, -5);
            ctx.lineTo(-44, -8);
            ctx.lineTo(-15, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Tail fin
            ctx.beginPath();
            ctx.moveTo(-44, -5);
            ctx.lineTo(-50, -18);
            ctx.lineTo(-42, -18);
            ctx.lineTo(-40, -5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Under-skids
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(-12, 11);
            ctx.lineTo(-12, 15);
            ctx.moveTo(10, 11);
            ctx.lineTo(10, 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-18, 15);
            ctx.lineTo(18, 15);
            ctx.stroke();

            // Windshield
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.moveTo(12, -7);
            ctx.quadraticCurveTo(24, -3, 22, 4);
            ctx.lineTo(14, 5);
            ctx.closePath();
            ctx.fill();

            // Main Rotor Shaft
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, -11);
            ctx.lineTo(0, -16);
            ctx.stroke();

            // Main Rotor Blades
            ctx.save();
            ctx.translate(0, -16);
            ctx.rotate(helicopter.rotorAngle);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.65)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(44, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-44, 0);
            ctx.stroke();
            ctx.restore();

            // Tail Rotor
            ctx.save();
            ctx.translate(-47, -18);
            ctx.rotate(-helicopter.rotorAngle * 1.5);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.75)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(10, 0);
            ctx.moveTo(0, -10);
            ctx.lineTo(0, 10);
            ctx.stroke();
            ctx.restore();

            // Flashing Beacon
            const heliFlash = Math.floor(Date.now() / 100) % 3 === 0;
            if (heliFlash) {
              ctx.fillStyle = "#ef4444";
              ctx.beginPath();
              ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
              ctx.fill();

              const flare = ctx.createRadialGradient(0, -12, 0, 0, -12, 20);
              flare.addColorStop(0, "rgba(239, 68, 68, 0.85)");
              flare.addColorStop(1, "rgba(239, 68, 68, 0)");
              ctx.fillStyle = flare;
              ctx.beginPath();
              ctx.arc(0, -12, 20, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }
        }

        // Building silhouette body (dark, charred architectural structure)
        ctx.fillStyle = "#0c0c0f";
        ctx.strokeStyle = "rgba(39, 39, 42, 0.4)";
        ctx.lineWidth = 2;
        ctx.fillRect(bldX, bldY, bldW, bldH);
        ctx.strokeRect(bldX, bldY, bldW, bldH);

        // Windows rows and columns (Representing multi-story congested density)
        const rows = 5;
        const cols = 4;
        const winW = 25;
        const winH = 34;
        const winGapX = 20;
        const winGapY = 14;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = bldX + 22 + c * (winW + winGapX);
            const wy = bldY + 18 + r * (winH + winGapY);

            // Some windows are completely engulfed in flames, some are dark/smoking
            const isBurning = (r === 1 && c === 2) || (r === 2 && (c === 0 || c === 1 || c === 2)) || (r === 3 && c === 1) || (r === 0 && c === 3);
            const isSmoking = (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 3 && c === 2);

            if (isBurning) {
              // Glowing window glass backdrop
              ctx.fillStyle = "rgba(127, 29, 29, 0.8)"; // deep dark red
              ctx.fillRect(wx, wy, winW, winH);

              // Flicker fire effect inside the window
              const firePulse = 0.7 + Math.sin(Date.now() * 0.01 + r * 5 + c) * 0.3;
              const fireGrad = ctx.createLinearGradient(wx, wy + winH, wx, wy);
              fireGrad.addColorStop(0, "rgba(220, 38, 38, 1)");   // Red base
              fireGrad.addColorStop(0.55, "rgba(249, 115, 22, 1)"); // Orange heart
              fireGrad.addColorStop(1, "rgba(253, 224, 71, 0)");   // Yellow tip

              ctx.fillStyle = fireGrad;
              ctx.beginPath();
              ctx.moveTo(wx, wy + winH);
              // Draw jagged flickering flame vectors
              ctx.lineTo(wx + 2, wy + winH - 12 * firePulse);
              ctx.lineTo(wx + winW * 0.3, wy + 4 * (1 - firePulse));
              ctx.lineTo(wx + winW * 0.5, wy + winH - 8 * firePulse);
              ctx.lineTo(wx + winW * 0.75, wy + 2 * (1 - firePulse));
              ctx.lineTo(wx + winW - 2, wy + winH - 10 * firePulse);
              ctx.lineTo(wx + winW, wy + winH);
              ctx.closePath();
              ctx.fill();

              // Extra fire sparks emerging from burning windows
              if (Math.random() < 0.08) {
                particles.push({
                  x: wx + Math.random() * winW,
                  y: wy + Math.random() * winH * 0.3,
                  size: Math.random() * 2 + 1,
                  vx: -(Math.random() * 1.5 + 0.5), // drift leftwards
                  vy: -(Math.random() * 2.0 + 1.0),
                  alpha: 1.0,
                  maxAlpha: 1.0,
                  decay: Math.random() * 0.01 + 0.005,
                  color: "rgba(249, 115, 22, ",
                  wobbleSpeed: 0.02,
                  wobbleRange: 1,
                  angle: Math.random(),
                });
              }
            } else if (isSmoking) {
              // Smoking window
              ctx.fillStyle = "rgba(24, 24, 27, 0.9)"; // zinc-900 charred frame
              ctx.fillRect(wx, wy, winW, winH);
              
              // Internal subtle red smolder
              ctx.fillStyle = `rgba(220, 38, 38, ${0.15 + pulse * 0.1})`;
              ctx.fillRect(wx + 4, wy + winH - 8, winW - 8, 8);
            } else {
              // Standard dark inactive windows
              ctx.fillStyle = "#09090b";
              ctx.fillRect(wx, wy, winW, winH);
              ctx.strokeStyle = "#18181b";
              ctx.strokeRect(wx, wy, winW, winH);
            }
          }
        }

        // --- LADDER & RESCUE MISSION SILHOUETTES ---
        const ladderX = bldX + 35;
        const ladderY = height - 120;
        ctx.strokeStyle = "#1e1b4b"; // very dark navy/zinc
        ctx.lineWidth = 2.5;

        // Leaning ladder lines
        ctx.beginPath();
        ctx.moveTo(bldX - 45, height);
        ctx.lineTo(ladderX, ladderY);
        ctx.moveTo(bldX - 40, height);
        ctx.lineTo(ladderX + 4, ladderY);
        ctx.stroke();

        // Rungs of the ladder
        ctx.lineWidth = 1.2;
        const rungs = 12;
        for (let i = 0; i <= rungs; i++) {
          const ratio = i / rungs;
          const rx1 = (bldX - 45) + (ladderX - (bldX - 45)) * ratio;
          const ry1 = height + (ladderY - height) * ratio;
          const rx2 = (bldX - 40) + ((ladderX + 4) - (bldX - 40)) * ratio;
          const ry2 = height + (ladderY - height) * ratio;
          ctx.beginPath();
          ctx.moveTo(rx1, ry1);
          ctx.lineTo(rx2, ry2);
          ctx.stroke();
        }

        // Silhouette of a firefighter rescue worker on the ladder
        const climberRatio = 0.55 + Math.sin(Date.now() * 0.0004) * 0.15; // moves slowly up and down
        const cx = (bldX - 42) + (ladderX + 2 - (bldX - 42)) * climberRatio;
        const cy = height + (ladderY - height) * climberRatio - 12;

        // Draw climber silhouette body
        ctx.fillStyle = "#040405";
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 3.5, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillRect(cx - 2, cy - 4, 4, 10);      // Torso
        ctx.fillRect(cx - 5, cy, 3, 2);           // Arm reaching ladder
        ctx.fillRect(cx + 2, cy + 1, 3, 2);         // Arm guiding victim
        ctx.fillRect(cx - 2, cy + 6, 1.5, 8);     // Leg 1
        ctx.fillRect(cx + 0.5, cy + 6, 1.5, 8);   // Leg 2

        // --- GROUND ACCIDENT VEHICLES & FIREFIGHTERS ---
        // Ground line anchor
        const groundY = height;

        // 1. PARKED FIRE ENGINE (TRUCK) - Left Side
        const truckX = 50;
        const truckW = 120;
        const truckH = 42;
        const truckY = groundY - truckH;

        // Dark red/charcoal fire engine silhouette
        ctx.fillStyle = "#450a0a"; // Fire red (shaded for dark theme coherence)
        ctx.fillRect(truckX, truckY, truckW, truckH - 8);
        
        // Cab windshield cutout
        ctx.fillStyle = "#0c0a09";
        ctx.fillRect(truckX + 92, truckY + 4, 22, 14);

        // Truck chassis details & equipment panels
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(truckX + 12, truckY + 16, 26, 14); // side equipment cabinet
        ctx.fillRect(truckX + 46, truckY + 12, 32, 18); // high pressure pump panels
        
        // Rolling shutters line detail
        ctx.strokeStyle = "#44403c";
        ctx.lineWidth = 1;
        ctx.strokeRect(truckX + 14, truckY + 18, 22, 10);
        ctx.strokeRect(truckX + 48, truckY + 14, 28, 14);

        // Roof ladder mounted on truck
        ctx.strokeStyle = "#a8a29e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(truckX + 15, truckY - 4);
        ctx.lineTo(truckX + 85, truckY - 4);
        ctx.moveTo(truckX + 15, truckY - 1);
        ctx.lineTo(truckX + 85, truckY - 1);
        ctx.stroke();
        for (let l = truckX + 22; l < truckX + 85; l += 10) {
          ctx.beginPath();
          ctx.moveTo(l, truckY - 5);
          ctx.lineTo(l, truckY);
          ctx.stroke();
        }

        // Tires
        ctx.fillStyle = "#020202";
        ctx.beginPath();
        ctx.arc(truckX + 28, groundY - 5, 10, 0, Math.PI * 2);
        ctx.arc(truckX + 95, groundY - 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#27272a";
        ctx.beginPath();
        ctx.arc(truckX + 28, groundY - 5, 5, 0, Math.PI * 2);
        ctx.arc(truckX + 95, groundY - 5, 5, 0, Math.PI * 2);
        ctx.fill();

        // FLASHING LIGHTBARS (Emergency blue and red rapid LED beacons)
        const flashTick = Math.floor(Date.now() / 140) % 2 === 0;
        const s1Color = flashTick ? "rgba(59, 130, 246, " : "rgba(239, 68, 68, "; // blue vs red
        const s2Color = flashTick ? "rgba(239, 68, 68, " : "rgba(59, 130, 246, "; // red vs blue

        // Fire engine roof beacons
        ctx.fillStyle = s1Color + "1.0)";
        ctx.fillRect(truckX + 102, truckY - 4, 5, 4);
        ctx.fillStyle = s2Color + "1.0)";
        ctx.fillRect(truckX + 109, truckY - 4, 5, 4);

        // Fire engine beacon lens flares
        const flareGlow1 = ctx.createRadialGradient(truckX + 104, truckY - 2, 0, truckX + 104, truckY - 2, 35);
        flareGlow1.addColorStop(0, s1Color + "0.65)");
        flareGlow1.addColorStop(1, s1Color + "0)");
        ctx.fillStyle = flareGlow1;
        ctx.beginPath();
        ctx.arc(truckX + 104, truckY - 2, 35, 0, Math.PI * 2);
        ctx.fill();

        const flareGlow2 = ctx.createRadialGradient(truckX + 111, truckY - 2, 0, truckX + 111, truckY - 2, 35);
        flareGlow2.addColorStop(0, s2Color + "0.65)");
        flareGlow2.addColorStop(1, s2Color + "0)");
        ctx.fillStyle = flareGlow2;
        ctx.beginPath();
        ctx.arc(truckX + 111, truckY - 2, 35, 0, Math.PI * 2);
        ctx.fill();


        // 2. AMBULANCE / POLICE CRUISER - Parked center-left
        const ambX = 195;
        const ambW = 68;
        const ambH = 28;
        const ambY = groundY - ambH;

        // Vehicle silhouette
        ctx.fillStyle = "#1e293b"; // slate gray/navy police color
        ctx.fillRect(ambX, ambY, ambW, ambH - 5);
        // Cabin hood curve
        ctx.beginPath();
        ctx.moveTo(ambX + ambW - 14, ambY);
        ctx.lineTo(ambX + ambW, ambY + 12);
        ctx.lineTo(ambX + ambW, ambY + ambH - 5);
        ctx.lineTo(ambX + ambW - 14, ambY + ambH - 5);
        ctx.closePath();
        ctx.fill();

        // Wheels
        ctx.fillStyle = "#010101";
        ctx.beginPath();
        ctx.arc(ambX + 15, groundY - 4, 7, 0, Math.PI * 2);
        ctx.arc(ambX + 50, groundY - 4, 7, 0, Math.PI * 2);
        ctx.fill();

        // Flashing cruiser roof bar
        ctx.fillStyle = s2Color + "1.0)";
        ctx.fillRect(ambX + 25, ambY - 3, 6, 3);
        const ambGlow = ctx.createRadialGradient(ambX + 28, ambY - 1, 0, ambX + 28, ambY - 1, 25);
        ambGlow.addColorStop(0, s2Color + "0.55)");
        ambGlow.addColorStop(1, s2Color + "0)");
        ctx.fillStyle = ambGlow;
        ctx.beginPath();
        ctx.arc(ambX + 28, ambY - 1, 25, 0, Math.PI * 2);
        ctx.fill();


        // 3. FIREFIGHTER INDIVIDUAL SILHOUETTES (Standing near vehicles)
        const ffCount = 3;
        const ffBaseX = 175;
        for (let i = 0; i < ffCount; i++) {
          const ffx = ffBaseX + i * 16;
          const ffy = groundY - 22;

          // Drawing distinct firefighters holding hose line
          ctx.fillStyle = "#030202"; // silhouetted firefighter black
          
          // Helmet
          ctx.beginPath();
          ctx.arc(ffx, ffy - 4, 3, 0, Math.PI * 2);
          ctx.fill();
          // Helmet brim
          ctx.fillRect(ffx - 4, ffy - 3, 8, 1);

          // Body
          ctx.fillRect(ffx - 2.5, ffy - 1, 5, 12); // coat
          
          // Limbs
          ctx.fillRect(ffx - 3.5, ffy + 11, 1.8, 11); // leg 1
          ctx.fillRect(ffx + 1.2, ffy + 11, 1.8, 11); // leg 2

          // Render yellow/neon safety stripe detail reflecting light
          ctx.fillStyle = "#84cc16"; // neon lime green/yellow
          ctx.fillRect(ffx - 2.5, ffy + 3, 5, 1.5); // stripe on jacket
          ctx.fillRect(ffx - 2.5, ffy + 8, 5, 1.2); 
        }


        // --- DYNAMIC PHYSICS-BASED HIGH PRESSURE WATER JETS ---
        // Hose source starts from firefighter nozzle location
        const nozzleX = 212;
        const nozzleY = groundY - 14;
        
        // Target target area is on the building windows (around row 2 columns 1, 2 or 3)
        const targetX = bldX + 70 + Math.sin(Date.now() * 0.002) * 40; // firefighter sweep/aiming wobble
        const targetY = bldY + 80 + Math.cos(Date.now() * 0.0025) * 30;

        // Continuous spray injector
        const sprayRate = active ? 4 : 2;
        for (let s = 0; s < sprayRate; s++) {
          // Angle & power calculated to reach target in a beautiful parabolic arc
          const dx = targetX - nozzleX;
          const dy = targetY - nozzleY;
          // Random scatter representing high-velocity turbulent fire hose spray
          const spread = 0.085;
          const vx = (dx * 0.015) + (Math.random() * 2.2 - 1.1);
          const vy = (dy * 0.015) - (Math.random() * 2.0 + 3.2); // strong upward velocity

          waterParticles.push({
            x: nozzleX,
            y: nozzleY,
            vx,
            vy,
            size: Math.random() * 3.5 + 2.0,
            alpha: 1.0,
            life: 0,
            maxLife: 75 + Math.floor(Math.random() * 20),
            isSteam: false
          });
        }

        // Render water hose lines extending from the fire truck pump panel to the firefighters
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(truckX + 75, groundY - 4);
        ctx.bezierCurveTo(truckX + 110, groundY + 1, ambX - 25, groundY + 1, nozzleX - 10, groundY - 3);
        ctx.stroke();

        // Animate & update water/steam particles
        waterParticles = waterParticles.filter((wp) => {
          wp.life++;
          
          if (wp.isSteam) {
            // Steam drifts up slowly, expands, and fades out
            wp.x += wp.vx * 0.3 + (Math.random() * 0.6 - 0.3);
            wp.y += wp.vy * 0.4 - 1.2; // rising
            wp.size += 0.35;
            wp.alpha -= 0.025;
          } else {
            // Water physics: high pressure arc with gravity
            wp.x += wp.vx;
            wp.vy += 0.16; // gravity pulling jet arc down
            wp.y += wp.vy;

            // Collision check with building surface to make steam
            const isNearBuildingWidth = wp.x >= bldX - 8 && wp.x <= bldX + bldW;
            const isNearBuildingHeight = wp.y >= bldY && wp.y <= height;
            
            if (isNearBuildingWidth && isNearBuildingHeight && Math.random() < 0.6) {
              wp.isSteam = true;
              wp.vy = -1.0;
              wp.vx = Math.random() * 2.0 - 1.0;
              wp.size = 5;
              wp.maxLife = wp.life + 30; // live a bit longer as steam
            }
          }

          if (wp.life >= wp.maxLife || wp.alpha <= 0 || wp.y > height + 10) {
            return false;
          }

          // Draw the water/steam particle
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);

          if (wp.isSteam) {
            ctx.fillStyle = `rgba(228, 228, 231, ${wp.alpha * 0.28})`; // white smoke/steam
          } else {
            // High visibility water blue-white gradient
            ctx.fillStyle = `rgba(147, 197, 253, ${wp.alpha * 0.65})`; // soft blue
          }
          ctx.fill();

          return true;
        });

        // --- LAYERED FRONT RUBBLE, FIRE ACCIDENT WASTES & EMBERS ---
        // Left and right structural debris piles at the bottommost layer
        // Draw irregular layered piles of structural burnt wreckage at the bottom
        ctx.fillStyle = "#08080a"; // charred dark rubble
        ctx.strokeStyle = `rgba(127, 29, 29, ${0.45 + pulse * 0.2})`; // deep red structural heat lines
        ctx.lineWidth = 1.5;

        // Left rubble pile (under the truck / ambulance)
        ctx.beginPath();
        ctx.moveTo(-10, height);
        ctx.lineTo(20, height - 12);
        ctx.lineTo(130, height - 16);
        ctx.lineTo(250, height - 8);
        ctx.lineTo(380, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right rubble pile (beneath the burning building)
        ctx.beginPath();
        ctx.moveTo(bldX - 60, height);
        ctx.lineTo(bldX - 10, height - 28);
        ctx.lineTo(bldX + 60, height - 38);
        ctx.lineTo(bldX + bldW - 40, height - 45);
        ctx.lineTo(width + 10, height - 35);
        ctx.lineTo(width + 10, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Small flickering glowing fire vents in the rubble pile itself
        const fireRubbleX = [bldX - 15, bldX + 35, bldX + 90, bldX + 160];
        for (let f = 0; f < fireRubbleX.length; f++) {
          const rx = fireRubbleX[f];
          const rfHeight = 10 + Math.sin(Date.now() * 0.008 + f) * 5;
          ctx.beginPath();
          ctx.moveTo(rx - 3, height);
          ctx.quadraticCurveTo(rx, height - rfHeight, rx + 3, height);
          ctx.closePath();
          const rGrad = ctx.createLinearGradient(rx, height, rx, height - rfHeight);
          rGrad.addColorStop(0, "rgba(239, 68, 68, 0.85)");
          rGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.7)");
          rGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
          ctx.fillStyle = rGrad;
          ctx.fill();
        }
      }

      // 4. GLOBAL HEAT VIGNETTE (Active High Tension Overlay)
      if (active) {
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.35,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.8
        );
        grad.addColorStop(0, "rgba(239, 68, 68, 0)");
        grad.addColorStop(1, "rgba(239, 68, 68, 0.14)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Heat pulse overlay representing extreme danger state
        const time = Date.now() * 0.0015;
        const bottomPulse = 0.04 + Math.sin(time) * 0.03;
        const bottomGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 200);
        bottomGrad.addColorStop(0, `rgba(239, 68, 68, ${bottomPulse})`);
        bottomGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("structural-rumble", handleRumble);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 w-full h-full ${
        active ? "z-30 opacity-100" : "z-10 opacity-40 pointer-events-none"
      }`}
      style={{ mixBlendMode: "screen" }}
      id="canvas-ember-overlay"
    />
  );
}
