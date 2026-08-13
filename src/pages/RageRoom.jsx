import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Coffee, Circle, ImagePlus } from 'lucide-react';
import Matter from 'matter-js';

// SVG Data URIs for textures
const svgs = {
  plate: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><circle cx="30" cy="30" r="28" fill="white" stroke="%23ddd" stroke-width="2"/><circle cx="30" cy="30" r="20" fill="%23f9f9f9" stroke="%23eee" stroke-width="1"/></svg>',
  glass: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="60"><path d="M5,5 L35,5 L30,55 L10,55 Z" fill="rgba(200,230,255,0.4)" stroke="%23a0c8e0" stroke-width="2"/></svg>',
  monitor: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect x="5" y="5" width="70" height="40" rx="3" fill="%23333"/><rect x="8" y="8" width="64" height="34" fill="%23111"/><rect x="35" y="45" width="10" height="10" fill="%23555"/><rect x="25" y="55" width="30" height="5" fill="%23555"/></svg>',
};

const playShatterSound = () => {
  // Simple web audio synth for breaking sound
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export default function RageRoom() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const faceTextureRef = useRef(null);
  
  const [faceUrl, setFaceUrl] = useState(null);

  useEffect(() => {
    // Setup Matter.js
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Composite = Matter.Composite,
          Composites = Matter.Composites,
          Constraint = Matter.Constraint,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          Bodies = Matter.Bodies,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false
      }
    });
    renderRef.current = render;

    // Create Ragdoll (Mannequin)
    const group = Matter.Body.nextGroup(true);
    
    const headOptions = { collisionFilter: { group: group }, friction: 0.8, render: { fillStyle: '#e0cda7' } };
    const chestOptions = { collisionFilter: { group: group }, friction: 0.8, render: { fillStyle: '#555' } };
    const armOptions = { collisionFilter: { group: group }, friction: 0.8, render: { fillStyle: '#e0cda7' } };
    const legOptions = { collisionFilter: { group: group }, friction: 0.8, render: { fillStyle: '#333' } };

    const head = Bodies.circle(400, 100, 30, headOptions);
    const chest = Bodies.rectangle(400, 180, 60, 100, chestOptions);
    const leftUpperArm = Bodies.rectangle(340, 140, 20, 60, armOptions);
    const rightUpperArm = Bodies.rectangle(460, 140, 20, 60, armOptions);
    const leftLowerArm = Bodies.rectangle(340, 200, 15, 60, armOptions);
    const rightLowerArm = Bodies.rectangle(460, 200, 15, 60, armOptions);
    const leftUpperLeg = Bodies.rectangle(380, 260, 20, 60, legOptions);
    const rightUpperLeg = Bodies.rectangle(420, 260, 20, 60, legOptions);
    const leftLowerLeg = Bodies.rectangle(380, 320, 15, 60, legOptions);
    const rightLowerLeg = Bodies.rectangle(420, 320, 15, 60, legOptions);

    const ragdoll = Composite.create({
      bodies: [head, chest, leftUpperArm, rightUpperArm, leftLowerArm, rightLowerArm, leftUpperLeg, rightUpperLeg, leftLowerLeg, rightLowerLeg],
      constraints: [
        Constraint.create({ bodyA: head, pointA: { x: 0, y: 25 }, bodyB: chest, pointB: { x: 0, y: -45 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: chest, pointA: { x: -24, y: -40 }, bodyB: leftUpperArm, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: chest, pointA: { x: 24, y: -40 }, bodyB: rightUpperArm, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: leftUpperArm, pointA: { x: 0, y: 25 }, bodyB: leftLowerArm, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: rightUpperArm, pointA: { x: 0, y: 25 }, bodyB: rightLowerArm, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: chest, pointA: { x: -20, y: 40 }, bodyB: leftUpperLeg, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: chest, pointA: { x: 20, y: 40 }, bodyB: rightUpperLeg, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: leftUpperLeg, pointA: { x: 0, y: 25 }, bodyB: leftLowerLeg, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } }),
        Constraint.create({ bodyA: rightUpperLeg, pointA: { x: 0, y: 25 }, bodyB: rightLowerLeg, pointB: { x: 0, y: -20 }, stiffness: 0.6, render: { visible: false } })
      ]
    });

    // Walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#ddd' } };
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth, 50, wallOptions);
    const leftWall = Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, wallOptions);
    const rightWall = Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, wallOptions);
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -25, window.innerWidth, 50, wallOptions);

    Composite.add(world, [ragdoll, ground, leftWall, rightWall, ceiling]);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // Shattering logic
    Events.on(engine, 'collisionStart', function(event) {
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;
        
        // Calculate impact speed
        const speedA = bodyA.speed || 0;
        const speedB = bodyB.speed || 0;
        const impactSpeed = speedA + speedB;
        
        if (impactSpeed > 10) {
          if (bodyA.label === 'breakable') shatterBody(bodyA, engine);
          if (bodyB.label === 'breakable') shatterBody(bodyB, engine);
        }
      }
    });

    Render.run(render);
    
    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Make canvas resize dynamically
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 25 });
      Matter.Body.setPosition(rightWall, { x: window.innerWidth + 25, y: window.innerHeight / 2 });
      Matter.Body.setPosition(ceiling, { x: window.innerWidth / 2, y: -25 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, []);

  // Sync face texture when it changes
  useEffect(() => {
    if (!engineRef.current || !faceUrl) return;
    const world = engineRef.current.world;
    const head = world.composites[0]?.bodies[0]; // Assuming ragdoll is first composite and head is first body
    if (head) {
      head.render.sprite = {
        texture: faceUrl,
        xScale: 60 / 200,
        yScale: 60 / 200,
        xOffset: 0.5,
        yOffset: 0.5
      };
    }
  }, [faceUrl]);

  const shatterBody = (body, engine) => {
    if (body.isShattered) return;
    body.isShattered = true; // prevent multiple shatters

    playShatterSound();
    Matter.Composite.remove(engine.world, body);
    
    // Create shards
    const shards = [];
    const numShards = 5 + Math.floor(Math.random() * 5);
    const color = body.render.fillStyle;

    for (let i = 0; i < numShards; i++) {
      const offsetX = (Math.random() - 0.5) * (body.bounds.max.x - body.bounds.min.x);
      const offsetY = (Math.random() - 0.5) * (body.bounds.max.y - body.bounds.min.y);
      
      const shard = Matter.Bodies.polygon(body.position.x + offsetX, body.position.y + offsetY, 3 + Math.floor(Math.random()*3), 10 + Math.random()*15, {
        friction: 0.5,
        restitution: 0.2,
        render: { fillStyle: color }
      });
      
      // Apply explosion force
      const forceX = (Math.random() - 0.5) * 0.05;
      const forceY = (Math.random() - 0.5) * 0.05;
      Matter.Body.applyForce(shard, shard.position, { x: forceX, y: forceY });
      
      shards.push(shard);
    }
    
    Matter.Composite.add(engine.world, shards);
  };

  const spawnItem = (type) => {
    if (!engineRef.current) return;
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = 100;
    let body;

    if (type === 'plate') {
      body = Matter.Bodies.circle(x, y, 30, {
        label: 'breakable',
        restitution: 0.6,
        render: { sprite: { texture: svgs.plate }, fillStyle: '#fff' }
      });
    } else if (type === 'glass') {
      body = Matter.Bodies.rectangle(x, y, 30, 50, {
        label: 'breakable',
        restitution: 0.4,
        render: { sprite: { texture: svgs.glass }, fillStyle: '#a0c8e0' }
      });
    } else if (type === 'monitor') {
      body = Matter.Bodies.rectangle(x, y, 80, 50, {
        label: 'breakable',
        restitution: 0.2,
        density: 0.05,
        render: { sprite: { texture: svgs.monitor }, fillStyle: '#333' }
      });
    }

    if (body) {
      Matter.Composite.add(engineRef.current.world, body);
    }
  };

  const handleFaceUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a circular crop of the image to look like a face
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          
          ctx.beginPath();
          ctx.arc(100, 100, 100, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Cover crop
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setFaceUrl(url);
            }
          }, 'image/png');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative',
      backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' }}>
        <Link to="/" style={{ pointerEvents: 'auto', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: '#2b2b2b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </Link>
        
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button onClick={() => spawnItem('plate')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Circle size={18} /> Plate
          </button>
          <button onClick={() => spawnItem('glass')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Coffee size={18} /> Glass
          </button>
          <button onClick={() => spawnItem('monitor')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Monitor size={18} /> Monitor
          </button>
          
          <label className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', cursor: 'pointer', margin: 0, background: '#e07a5f', color: 'white', borderRadius: '8px', fontWeight: '500' }}>
            <ImagePlus size={18} /> Target Face
            <input type="file" accept="image/*" onChange={handleFaceUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center', color: '#999', pointerEvents: 'none', zIndex: 10 }}>
        Drag items and fling them to the walls!
      </div>

      {/* Matter.js Canvas Container */}
      <div ref={sceneRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
