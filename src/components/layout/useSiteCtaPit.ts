'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

type PitOptions = {
  gravityY?: number;
  observerThreshold?: number;
  badgeSelector?: string;
};

type BodyPair = {
  body: Matter.Body;
  el: HTMLElement;
};

const SIZE_BREAKPOINTS = [
  { max: 479, size: 56 },
  { max: 767, size: 68 },
  { max: 1023, size: 100 },
  { max: Infinity, size: 120 },
] as const;

function fallbackCircleSize() {
  const w = window.innerWidth;
  for (const row of SIZE_BREAKPOINTS) {
    if (w <= row.max) return row.size;
  }
  return 120;
}

/**
 * Matter.js ball-pit for the sitewide CTA.
 * DOM badges are puppets; Matter owns motion; rAF syncs transforms.
 * One Pointer Events path for mouse + touch + pen so every device can
 * drag icons like desktop; empty pit still allows page scroll.
 */
export function useSiteCtaPit(
  pitRef: React.RefObject<HTMLElement | null>,
  options: PitOptions = {},
) {
  const {
    gravityY = 1.5,
    observerThreshold = 0.25,
    badgeSelector = '[data-pit-badge]',
  } = options;

  const startedRef = useRef(false);

  useEffect(() => {
    const container = pitRef.current;
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const badges = [
      ...container.querySelectorAll<HTMLElement>(badgeSelector),
    ].filter((el) => window.getComputedStyle(el).display !== 'none');
    if (!badges.length) return;

    const section = container.closest('section') ?? container;
    let engine: Matter.Engine | null = null;
    let runner: Matter.Runner | null = null;
    let mouse: Matter.Mouse | null = null;
    let mouseConstraint: Matter.MouseConstraint | null = null;
    let walls: Matter.Body[] = [];
    let bodies: BodyPair[] = [];
    let animFrameId: number | null = null;
    let renderActive = false;
    let isDragging = false;
    let draggedEl: HTMLElement | null = null;
    let activePointerId: number | null = null;
    let physicsCircleSize = 0;
    let destroyed = false;
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const spawnTimers: ReturnType<typeof setTimeout>[] = [];

    type MatterMouseHandlers = {
      mousedown: (e: Event) => void;
      mousemove: (e: Event) => void;
      mouseup: (e: Event) => void;
      mousewheel: EventListener;
    };

    let matterMouse: MatterMouseHandlers | null = null;

    function circleSize() {
      const measured = badges[0]?.offsetWidth ?? 0;
      return measured > 0 ? measured : fallbackCircleSize();
    }

    function getRect() {
      return container!.getBoundingClientRect();
    }

    function createWalls(width: number, height: number) {
      const wallThickness = 60;
      const inset = 20;
      const { Bodies } = Matter;
      return [
        Bodies.rectangle(
          width / 2,
          height + wallThickness / 2 - inset,
          width + wallThickness,
          wallThickness,
          { isStatic: true, friction: 0.6, label: 'floor' },
        ),
        Bodies.rectangle(
          -wallThickness / 2 + inset,
          height / 2,
          wallThickness,
          height * 3,
          { isStatic: true, friction: 0.3, label: 'wallLeft' },
        ),
        Bodies.rectangle(
          width + wallThickness / 2 - inset,
          height / 2,
          wallThickness,
          height * 3,
          { isStatic: true, friction: 0.3, label: 'wallRight' },
        ),
        Bodies.rectangle(
          width / 2,
          -height - wallThickness / 2,
          width + wallThickness,
          wallThickness,
          { isStatic: true, label: 'ceiling' },
        ),
      ];
    }

    function findElForBody(body: Matter.Body) {
      return bodies.find((item) => item.body === body)?.el ?? null;
    }

    function localPoint(clientX: number, clientY: number) {
      const rect = getRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }

    function bodyAtPoint(clientX: number, clientY: number) {
      if (!engine) return null;
      const point = localPoint(clientX, clientY);
      const hits = Matter.Query.point(
        Matter.Composite.allBodies(engine.world),
        point,
      );
      return hits.find((body) => !body.isStatic) ?? null;
    }

    function startRenderLoop() {
      if (renderActive || destroyed) return;
      renderActive = true;
      if (runner && engine) Matter.Runner.run(runner, engine);
      animFrameId = requestAnimationFrame(renderLoop);
    }

    function stopRenderLoop() {
      renderActive = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (runner && !isDragging) Matter.Runner.stop(runner);
    }

    function renderLoop() {
      if (!renderActive || destroyed) return;
      let allSettled = true;
      const size = circleSize();
      const half = size / 2;

      for (const item of bodies) {
        const { position: pos, angle } = item.body;
        item.el.style.transform = `translate3d(${pos.x - half}px, ${pos.y - half}px, 0) rotate(${angle}rad)`;
        if (item.body.speed > 0.08 || Math.abs(item.body.angularSpeed) > 0.003) {
          allSettled = false;
        }
      }

      if (allSettled && bodies.length === badges.length && !isDragging) {
        stopRenderLoop();
      } else {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (activePointerId !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const target = e.target as Element | null;
      if (target?.closest('a, button, input, textarea, select')) return;
      if (!target?.closest(badgeSelector)) return;

      const body = bodyAtPoint(e.clientX, e.clientY);
      if (!body || !matterMouse || !mouse) return;

      activePointerId = e.pointerId;
      startRenderLoop();
      try {
        container!.setPointerCapture(e.pointerId);
      } catch {
        /* older WebViews may reject capture */
      }

      e.preventDefault();
      matterMouse.mousedown(e);
    }

    function onPointerMove(e: PointerEvent) {
      if (!matterMouse || !mouse || !engine) return;

      if (activePointerId === e.pointerId) {
        e.preventDefault();
        matterMouse.mousemove(e);
        return;
      }

      if (e.pointerType !== 'mouse' || isDragging) return;
      const hovered = bodyAtPoint(e.clientX, e.clientY);
      container!.style.cursor = hovered ? 'grab' : '';
    }

    function endPointer(e: PointerEvent) {
      if (activePointerId !== e.pointerId) return;
      activePointerId = null;
      try {
        if (container!.hasPointerCapture(e.pointerId)) {
          container!.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      matterMouse?.mouseup(e);
    }

    function onPointerUp(e: PointerEvent) {
      endPointer(e);
    }

    function onPointerCancel(e: PointerEvent) {
      endPointer(e);
    }

    function setupMouseInteraction() {
      if (!engine) return;
      mouse = Matter.Mouse.create(container!);
      mouse.pixelRatio = window.devicePixelRatio || 1;

      const runtimeMouse = mouse as Matter.Mouse & MatterMouseHandlers;
      matterMouse = {
        mousedown: runtimeMouse.mousedown,
        mousemove: runtimeMouse.mousemove,
        mouseup: runtimeMouse.mouseup,
        mousewheel: runtimeMouse.mousewheel,
      };

      /* Strip Matter's own listeners — we drive one Pointer Events path. */
      const el = mouse.element;
      el.removeEventListener('mousedown', matterMouse.mousedown);
      el.removeEventListener('mousemove', matterMouse.mousemove);
      el.removeEventListener('mouseup', matterMouse.mouseup);
      el.removeEventListener('mouseout', matterMouse.mouseup);
      el.removeEventListener('wheel', matterMouse.mousewheel);
      el.removeEventListener('mousewheel', matterMouse.mousewheel);
      el.removeEventListener('DOMMouseScroll', matterMouse.mousewheel);
      el.removeEventListener('touchstart', matterMouse.mousedown);
      el.removeEventListener('touchmove', matterMouse.mousemove);
      el.removeEventListener('touchend', matterMouse.mouseup);
      el.removeEventListener('touchcancel', matterMouse.mouseup);

      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.1,
          render: { visible: false },
        },
      });

      Matter.Composite.add(engine.world, mouseConstraint);

      container!.addEventListener('pointerdown', onPointerDown, {
        passive: false,
      });
      container!.addEventListener('pointermove', onPointerMove, {
        passive: false,
      });
      container!.addEventListener('pointerup', onPointerUp);
      container!.addEventListener('pointercancel', onPointerCancel);

      Matter.Events.on(mouseConstraint, 'startdrag', (event) => {
        const body = (event as { body?: Matter.Body }).body;
        if (!body || body.isStatic) {
          (mouseConstraint as { body: Matter.Body | null }).body = null;
          mouseConstraint!.constraint.bodyB =
            undefined as unknown as Matter.Body;
          return;
        }
        isDragging = true;
        container!.style.cursor = 'grabbing';
        const badgeEl = findElForBody(body);
        if (badgeEl) {
          draggedEl = badgeEl;
          badgeEl.classList.add('is-dragging');
        }
        startRenderLoop();
      });

      Matter.Events.on(mouseConstraint, 'enddrag', () => {
        isDragging = false;
        container!.style.cursor = '';
        if (draggedEl) {
          draggedEl.classList.remove('is-dragging');
          draggedEl = null;
        }
        startRenderLoop();
      });
    }

    function startPhysics() {
      if (startedRef.current || destroyed) return;
      startedRef.current = true;

      const rect = getRect();
      physicsCircleSize = circleSize();

      engine = Matter.Engine.create();
      engine.gravity.y = gravityY;
      walls = createWalls(rect.width, rect.height);
      Matter.Composite.add(engine.world, walls);

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);
      setupMouseInteraction();

      badges.forEach((el, i) => {
        const delay = i * 120 + Math.random() * 150;
        spawnTimers.push(
          setTimeout(() => {
            if (!engine || destroyed) return;
            const currentRect = getRect();
            const size = circleSize();
            const radius = size / 2;
            const x =
              radius +
              Math.random() * Math.max(0, currentRect.width - size);
            const maxDrop = Math.max(
              radius + 10,
              currentRect.height - radius - 10,
            );
            const y = -Math.min(radius + Math.random() * 200 + i * 40, maxDrop);
            const angle = (Math.random() - 0.5) * 0.9;

            /* Match visual size so small-screen taps hit reliably. */
            const body = Matter.Bodies.circle(x, y, radius * 0.95, {
              restitution: 0.5 + Math.random() * 0.15,
              friction: 0.3,
              frictionAir: 0.015 + Math.random() * 0.01,
              density: 0.0012,
              angle,
              label: `badge-${i}`,
            });

            Matter.Body.setAngularVelocity(
              body,
              (Math.random() - 0.5) * 0.06,
            );
            Matter.Body.setVelocity(body, {
              x: (Math.random() - 0.5) * 2,
              y: 0,
            });

            Matter.Composite.add(engine!.world, body);
            bodies.push({ body, el });
            el.classList.add('is-active');
          }, delay),
        );
      });

      startRenderLoop();
    }

    function handleResize() {
      if (!engine || destroyed) return;
      const rect = getRect();
      Matter.Composite.remove(engine.world, walls);
      walls = createWalls(rect.width, rect.height);
      Matter.Composite.add(engine.world, walls);

      const nextSize = circleSize();
      if (physicsCircleSize && nextSize !== physicsCircleSize) {
        const scale = nextSize / physicsCircleSize;
        const half = nextSize / 2;
        bodies.forEach((item) => {
          Matter.Body.scale(item.body, scale, scale);
          Matter.Body.setPosition(item.body, {
            x: Math.max(
              half,
              Math.min(rect.width - half, item.body.position.x),
            ),
            y: Math.min(rect.height - half, item.body.position.y),
          });
        });
        physicsCircleSize = nextSize;
      }

      if (mouse) mouse.pixelRatio = window.devicePixelRatio || 1;
      startRenderLoop();
    }

    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stopRenderLoop();
      spawnTimers.forEach(clearTimeout);
      clearTimeout(resizeTimeout);

      container!.removeEventListener('pointerdown', onPointerDown);
      container!.removeEventListener('pointermove', onPointerMove);
      container!.removeEventListener('pointerup', onPointerUp);
      container!.removeEventListener('pointercancel', onPointerCancel);

      if (mouseConstraint && engine) {
        Matter.Events.off(mouseConstraint, 'startdrag');
        Matter.Events.off(mouseConstraint, 'enddrag');
        Matter.Composite.remove(engine.world, mouseConstraint);
        mouseConstraint = null;
      }
      mouse = null;
      matterMouse = null;
      if (runner) {
        Matter.Runner.stop(runner);
        runner = null;
      }
      if (engine) {
        Matter.Composite.clear(engine.world, false);
        Matter.Engine.clear(engine);
        engine = null;
      }
      bodies = [];
      walls = [];
      window.removeEventListener('resize', onResize);
      container!.style.cursor = '';
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startPhysics();
            observer.disconnect();
          }
        }
      },
      { threshold: observerThreshold },
    );

    observer.observe(section);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      destroy();
      startedRef.current = false;
    };
  }, [pitRef, gravityY, observerThreshold, badgeSelector]);
}
