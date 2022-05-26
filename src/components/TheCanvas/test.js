import React, {
    useState,
    useEffect,
    useRef
  } from "https://cdn.skypack.dev/react";
  import ReactDOM from "https://cdn.skypack.dev/react-dom";
  
  import Matter from "https://cdn.skypack.dev/matter-js";
  
  console.clear();
  
  const LOGO = "";
  
  function App() {
    const [intro, setIntro] = useState(false);
  
    return (
      <div className="app" onClick={() => setIntro(false)}>
        <div className="logo" data-intro={intro}>
          <img src={LOGO} />
        </div>
        <JellyBoard show={!intro} />
      </div>
    );
  }
  
  const COLORS = {
    BUN: "#48534D",
    PATTY: "#805126",
    CHEESE: "#F8C742",
    PICKLES: "#89BD47",
    LETTUCE: "#27B047",
    BOARD: "#fb9300",
    WHEELS: "#f54748",
    PLATFORM: "#343f56"
  };
  
  const {
    Engine,
    Render,
    Mouse,
    MouseConstraint,
    Runner,
    Body,
    Bodies,
    Composite,
    Composites,
    Constraint
  } = Matter;
  
  function makeChain({
    color,
    links = 5,
    x = 0,
    y = 0,
    width = 380,
    height = 30,
    options = {}
  }) {
    var group = Body.nextGroup(true);
    var linkWidth = width / links;
    var chain = Composites.stack(x, y, links, 1, 10, 10, function (x, y) {
      return Bodies.rectangle(x - linkWidth, y, linkWidth, height, {
        collisionFilter: { group: group },
        chamfer: 5,
        ...options,
        render: {
          fillStyle: color,
          ...options?.render
        }
      });
    });
  
    Composites.chain(chain, 0.35, 0, -0.35, 0, {
      stiffness: 1,
      length: 0,
      render: {
        fillStyle: null,
        strokeStyle: "transparent"
      }
    });
  
    return chain;
  }
  
  function makeRamps() {
    return [
      Bodies.rectangle(-300, 100, 600, 20, {
        isStatic: true,
        angle: Math.PI * 0.1
      }),
      Bodies.rectangle(300, 220, 600, 20, {
        isStatic: true,
        angle: -Math.PI * 0.1
      }),
      Bodies.rectangle(-300, 350, 600, 20, {
        isStatic: true,
        angle: Math.PI * 0.1
      })
    ];
  }
  
  function makeBridge() {
    var group = Body.nextGroup(true);
  
    var bridge = Composites.stack(0, 290, 11, 1, 0, 0, function (x, y) {
      return Bodies.rectangle(x - 100, y, 100, 20, {
        collisionFilter: { group: group },
        chamfer: 10,
        render: {
          fillStyle: COLORS.PLATFORM
        }
      });
    });
  
    Composites.chain(bridge, 0.25, 0, -0.25, 0, {
      stiffness: 0.2,
      length: 40,
      render: {
        visible: false
      }
    });
  
    return [
      bridge,
      Bodies.rectangle(-600, 540, 220, 500, {
        isStatic: true,
        chamfer: { radius: 20 },
        render: {
          fillStyle: COLORS.PLATFORM
        }
      }),
      Bodies.rectangle(600, 540, 220, 500, {
        isStatic: true,
        chamfer: { radius: 20 },
        render: {
          fillStyle: COLORS.PLATFORM
        }
      }),
      Constraint.create({
        pointA: { x: -490, y: 300 },
        bodyB: bridge.bodies[0],
        pointB: { x: -50, y: 0 },
        length: 2,
        stiffness: 0.9
      }),
      Constraint.create({
        pointA: { x: 490, y: 300 },
        bodyB: bridge.bodies[bridge.bodies.length - 1],
        pointB: { x: 50, y: 0 },
        length: 2,
        stiffness: 0.9
      }),
      Bodies.polygon(490, 300, 3, 100)
    ];
  }
  
  function Board(xx, yy, width, height, wheelSize) {
    var Body = Matter.Body,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint;
  
    var group = Body.nextGroup(true),
      wheelBase = 20,
      wheelAOffset = -width * 0.4 + wheelBase,
      wheelBOffset = width * 0.4 - wheelBase,
      wheelYOffset = 30;
  
    var car = Composite.create({ label: "Car" }),
      body = Bodies.rectangle(xx, yy, width, height, {
        collisionFilter: {
          group: group
        },
        chamfer: {
          radius: height * 0.5
        },
        render: {
          fillStyle: COLORS.BOARD
        },
        density: 0.0002
      });
  
    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
      collisionFilter: {
        group: group
      },
      render: {
        fillStyle: COLORS.WHEELS
      },
      friction: 0.8
    });
  
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
      collisionFilter: {
        group: group
      },
      render: {
        fillStyle: COLORS.WHEELS
      },
      friction: 0.8
    });
  
    var axelA = Constraint.create({
      bodyB: body,
      pointB: { x: wheelAOffset, y: wheelYOffset },
      bodyA: wheelA,
      stiffness: 1,
      length: 0
    });
  
    var axelB = Constraint.create({
      bodyB: body,
      pointB: { x: wheelBOffset, y: wheelYOffset },
      bodyA: wheelB,
      stiffness: 1,
      length: 0
    });
  
    Composite.addBody(car, body);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
  
    document.addEventListener("keydown", function (e) {
      let accelX = 0;
      let accelY = 0;
      let speedX = 2;
      let speedY = 5;
      switch (e.key) {
        case "ArrowLeft":
          accelX = -speedX;
          break;
        case "ArrowRight":
          accelX = speedX;
          break;
        case "ArrowUp":
          accelY = -speedY;
          break;
        case "ArrowDown":
          accelY = speedY;
          break;
      }
  
      console.log({ accelX, accelY });
      Body.setVelocity(wheelB, {
        x: wheelB.velocity.x + accelX,
        y: wheelB.velocity.y + accelY
      });
      Body.setVelocity(wheelA, {
        x: wheelA.velocity.x + accelX,
        y: wheelA.velocity.y + accelY
      });
  
      // Body.setVelocity(body, {
      //   x: body.velocity.x,
      //   y: body.velocity.y + accelY
      // });
      // Body.setAngularVelocity(wheelB, wheelB.angularVelocity + accelX);
      // Body.setAngle(wheelB, wheelB.angle + speed);
    });
  
    return car;
  }
  
  function JellyBoard({ show }) {
    const canvas = useRef();
    const world = useRef();
    const engineRef = useRef();
  
    useEffect(() => {
      if (show && canvas.current && !world.current) {
        // create an engine
        var engine = Engine.create();
        engineRef.current = engine;
        world.current = engine.world;
  
        console.log("Creating world!");
  
        // create a renderer
        var render = Render.create({
          canvas: canvas.current,
          engine: engine,
          options: {
            width: 1000,
            height: 800,
            background: "transparent",
            //showAngleIndicator: true,
            //showCollisions: true,
            showVelocity: true,
            showAxes: false,
            wireframes: false
          }
        });
  
        // add mouse control
        var mouse = Mouse.create(render.canvas),
          mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
              stiffness: 0.2,
              render: {
                visible: false
              }
            }
          });
  
        Composite.add(engine.world, mouseConstraint);
  
        // keep the mouse in sync with rendering
        render.mouse = mouse;
  
        // run the renderer
        Render.run(render);
  
        Render.lookAt(render, {
          min: { x: -700, y: 0 },
          max: { x: 700, y: 800 }
        });
  
        // create runner
        var runner = Runner.create();
  
        // run the engine
        Runner.run(runner, engine);
  
        return () => {
          Runner.stop();
          Engine.destroy();
        };
      }
    }, [show, canvas, world]);
  
    useEffect(() => {
      if ((show, world.current)) {
        init();
      }
    }, [show, world.current]);
  
    function init() {
      var ground = Bodies.rectangle(0, 800, 2000, 30, { isStatic: true });
  
      // add all of the bodies to the world
      Composite.add(world.current, [ground]);
  
      Composite.add(world.current, makeBridge());
  
      var board = Board(-200, 0, 150, 30, 30);
      Composite.add(world.current, [board]);
    }
  
    function reset() {
      Composite.clear(world.current);
      init();
    }
  
    return (
      <div>
        <div className="controls">
          <span>Control with Arrow Keys.</span>
          <button onClick={reset}>Reset</button>
        </div>
  
        <canvas ref={canvas} width="500" height="500" />
      </div>
    );
  }
  
  ReactDOM.render(<App />, document.querySelector("#app"));
  