import { describe, expect, it } from 'vitest';
import { createBurst, stepParticles, WAVES } from './Confetti';

describe('Confetti physics', () => {
  it('spawns the requested number of particles at the origin', () => {
    const particles = createBurst({
      x: 100,
      y: 200,
      count: 25,
      angle: -Math.PI / 2,
      spread: Math.PI / 4,
      minSpeed: 400,
      maxSpeed: 800,
    });
    expect(particles).toHaveLength(25);
    for (const p of particles) {
      expect(p.x).toBe(100);
      expect(p.y).toBe(200);
      expect(p.vy).toBeLessThan(0);
      expect(p.life).toBe(0);
      expect(p.maxLife).toBeGreaterThan(0);
    }
  });

  it('spawns all celebration waves exclusively from the left and right edges', () => {
    const width = 1280;
    const height = 800;
    const all = WAVES.flatMap((wave) => wave.spawn(width, height));

    expect(all.length).toBe(400);
    for (const p of all) {
      expect(p.x === 0 || p.x === width).toBe(true);
      if (p.x === 0) expect(p.vx).toBeGreaterThan(0);
      if (p.x === width) expect(p.vx).toBeLessThan(0);
    }
  });

  it('advances positions, applies gravity, and removes particles once they expire or fall off screen', () => {
    const particles = createBurst(
      { x: 50, y: 100, count: 10, angle: -Math.PI / 2, spread: 0.2, minSpeed: 500, maxSpeed: 600 },
      () => 0.5,
    );

    const afterLaunch = stepParticles(particles, 0.016, 800);
    expect(afterLaunch).toHaveLength(10);
    expect(afterLaunch[0]!.y).toBeLessThan(100);
    expect(afterLaunch[0]!.life).toBeCloseTo(0.016);

    // Simulate enough frames for every particle to expire or exit the viewport.
    let current = afterLaunch;
    for (let i = 0; i < 300; i++) {
      current = stepParticles(current, 0.03, 800);
    }
    expect(current).toHaveLength(0);
  });
});
