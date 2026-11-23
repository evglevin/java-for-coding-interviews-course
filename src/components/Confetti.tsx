import { useEffect, useRef, useState } from 'react';

/** Vibrant palette with clear contrast on both light and dark themes. */
const COLORS = ['#0766ff', '#4d8eff', '#22c55e', '#f59e0b', '#fbbf24', '#f43f5e', '#a855f7', '#06b6d4'] as const;

const GRAVITY = 520;
const DRAG = 2.5;
const MAX_DT = 0.05;
const FADE_START = 0.72;
const OFFSCREEN_MARGIN = 32;

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  shape: 'rect' | 'circle';
  rotation: number;
  rotationSpeed: number;
  flipPhase: number;
  flipSpeed: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmplitude: number;
  life: number;
  maxLife: number;
}

export interface BurstOptions {
  x: number;
  y: number;
  count: number;
  /** Center launch angle in radians (-PI/2 is straight up). */
  angle: number;
  /** Total angular spread in radians. */
  spread: number;
  minSpeed: number;
  maxSpeed: number;
}

function randomBetween(min: number, max: number, random: () => number): number {
  return min + (max - min) * random();
}

export function createBurst(options: BurstOptions, random: () => number = Math.random): ConfettiParticle[] {
  const { x, y, count, angle, spread, minSpeed, maxSpeed } = options;
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    const theta = angle + (random() - 0.5) * spread;
    const speed = randomBetween(minSpeed, maxSpeed, random);
    const shape = random() < 0.2 ? 'circle' : 'rect';
    const width = shape === 'circle' ? randomBetween(5, 7.5, random) : randomBetween(6.5, 11, random);
    const height = shape === 'circle' ? width : randomBetween(4, 6.5, random);

    particles.push({
      x,
      y,
      vx: Math.cos(theta) * speed,
      vy: Math.sin(theta) * speed,
      width,
      height,
      color: COLORS[Math.floor(random() * COLORS.length)]!,
      shape,
      rotation: randomBetween(0, Math.PI * 2, random),
      rotationSpeed: randomBetween(-7, 7, random),
      flipPhase: randomBetween(0, Math.PI * 2, random),
      flipSpeed: randomBetween(6, 12, random),
      wobblePhase: randomBetween(0, Math.PI * 2, random),
      wobbleSpeed: randomBetween(3, 6, random),
      wobbleAmplitude: randomBetween(10, 26, random),
      life: 0,
      maxLife: randomBetween(2.8, 4.2, random),
    });
  }

  return particles;
}

/** Advances particles by `dt` seconds and drops any that have expired or fallen past the viewport. */
export function stepParticles(particles: ConfettiParticle[], dt: number, viewportHeight: number): ConfettiParticle[] {
  const clampedDt = Math.min(Math.max(dt, 0), MAX_DT);
  const decay = Math.exp(-DRAG * clampedDt);
  const alive: ConfettiParticle[] = [];

  for (const p of particles) {
    p.life += clampedDt;
    if (p.life >= p.maxLife) continue;

    p.vx *= decay;
    p.vy = p.vy * decay + GRAVITY * clampedDt;
    p.x += p.vx * clampedDt;
    p.y += p.vy * clampedDt;
    p.rotation += p.rotationSpeed * clampedDt;
    p.flipPhase += p.flipSpeed * clampedDt;
    p.wobblePhase += p.wobbleSpeed * clampedDt;

    if (p.y > viewportHeight + OFFSCREEN_MARGIN) continue;
    alive.push(p);
  }

  return alive;
}

function particleAlpha(p: ConfettiParticle): number {
  const progress = p.life / p.maxLife;
  if (progress <= FADE_START) return 1;
  return Math.max(0, 1 - (progress - FADE_START) / (1 - FADE_START));
}

interface Wave {
  delayMs: number;
  spawn(width: number, height: number): ConfettiParticle[];
}

function createSideCannons(
  width: number,
  height: number,
  options: {
    yRatio: number;
    countPerSide: number;
    angleFromHorizontal: number;
    spread: number;
    minSpeed: number;
    maxSpeed: number;
  },
): ConfettiParticle[] {
  const scale = Math.max(0.7, Math.min(1.35, Math.hypot(width, height) / 1450));
  const y = height * options.yRatio;
  const minSpeed = options.minSpeed * scale;
  const maxSpeed = options.maxSpeed * scale;
  return [
    ...createBurst({
      x: 0,
      y,
      count: options.countPerSide,
      angle: -options.angleFromHorizontal,
      spread: options.spread,
      minSpeed,
      maxSpeed,
    }),
    ...createBurst({
      x: width,
      y,
      count: options.countPerSide,
      angle: -Math.PI + options.angleFromHorizontal,
      spread: options.spread,
      minSpeed,
      maxSpeed,
    }),
  ];
}

export const WAVES: readonly Wave[] = [
  {
    delayMs: 0,
    spawn: (width, height) =>
      createSideCannons(width, height, {
        yRatio: 0.85,
        countPerSide: 85,
        angleFromHorizontal: Math.PI * 0.28,
        spread: Math.PI * 0.3,
        minSpeed: 1100,
        maxSpeed: 2350,
      }),
  },
  {
    delayMs: 260,
    spawn: (width, height) =>
      createSideCannons(width, height, {
        yRatio: 0.65,
        countPerSide: 65,
        angleFromHorizontal: Math.PI * 0.24,
        spread: Math.PI * 0.28,
        minSpeed: 950,
        maxSpeed: 2100,
      }),
  },
  {
    delayMs: 540,
    spawn: (width, height) =>
      createSideCannons(width, height, {
        yRatio: 0.48,
        countPerSide: 50,
        angleFromHorizontal: Math.PI * 0.2,
        spread: Math.PI * 0.28,
        minSpeed: 850,
        maxSpeed: 1900,
      }),
  },
];

/**
 * Full-screen celebratory confetti overlay. Increment `trigger` (above 0) to fire a burst.
 * Non-interactive, respects `prefers-reduced-motion`, and unmounts its canvas once settled.
 */
export function Confetti({ trigger }: { trigger: number }) {
  const [active, setActive] = useState(false);
  const [lastTrigger, setLastTrigger] = useState(trigger);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (trigger !== lastTrigger) {
    setLastTrigger(trigger);
    if (trigger > 0) setActive(true);
  }

  useEffect(() => {
    if (!active || trigger === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setActive(false);
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let particles: ConfettiParticle[] = [];
    let pendingWaves = WAVES.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const wave of WAVES) {
      const fire = () => {
        particles.push(...wave.spawn(width, height));
        pendingWaves -= 1;
      };
      if (wave.delayMs === 0) fire();
      else timers.push(setTimeout(fire, wave.delayMs));
    }

    let frameId = 0;
    let previousTime = performance.now();

    const frame = (now: number) => {
      const dt = (now - previousTime) / 1000;
      previousTime = now;

      particles = stepParticles(particles, dt, height);
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const alpha = particleAlpha(p);
        if (alpha <= 0) continue;

        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobblePhase) * p.wobbleAmplitude, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.cos(p.flipPhase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      }

      if (particles.length > 0 || pendingWaves > 0) {
        frameId = requestAnimationFrame(frame);
      } else {
        setActive(false);
      }
    };

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      for (const timer of timers) clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [active, trigger]);

  if (!active) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-60" />;
}
