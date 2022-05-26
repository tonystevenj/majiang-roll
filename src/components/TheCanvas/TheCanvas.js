import Matter from 'matter-js'
import { useEffect, useRef } from 'react'
const {
    Engine,
    Events,
    Render,
    Runner,
    MouseConstraint,
    Mouse,
    World,
    Constraint,
    Composite,
    Body,
    Bodies
} = Matter;


export default (props) => {
    const firstRender = useRef(true);
    const canvas = useRef();

    // World size
    const width = 800;
    const height = 600;

    // create engine
    const engineRef = useRef(Engine.create());
    const engine = engineRef.current;
    const world = engine.world;

    // Parameters
    const nbBalls = 3; // set ball amount
    const BUMPERS_ROWS = 20; // set bumper_row
    const BUMPERS_COLS = 15; // set bumper_column


    const init = () => {
        console.log("Called");

        world.gravity.y = 0.5;
        world.gravity.y = 4;

        // create renderer
        const render = Render.create({
            element: canvas.current,
            engine,
            options: {
                width,
                height,
                showVelocity: true,
                wireframes: false
            }
        });
        Render.run(render);

        // create runner
        const runner = Runner.create();
        Runner.run(runner, engine);

        /* Create collision groups */
        const ballCategory = 0x0001;
        const keyNoteCategory = 0x0002;

        /* Create bodies */
        const frame = [
            Bodies.rectangle(0, height / 2, 3, height, {
                isStatic: true,
                label: "frame",
                render: {
                    fillStyle: "dae5ed",
                    lineWidth: 3
                }
            }),
            Bodies.rectangle(width, height / 2, 3, height, {
                isStatic: true,
                label: "frame",
                render: {
                    fillStyle: "dae5ed",
                    lineWidth: 3
                }
            })
        ];

        const bumpers = []
        for (let row = 0; row < BUMPERS_ROWS; row++) {
            for (let col = 0; col < BUMPERS_COLS; col++) {
                const x = col * (width / BUMPERS_COLS);
                const xoffset = row % 2 ? 0 : width / BUMPERS_COLS / 2;
                const y = 20 + row * (height / BUMPERS_ROWS);
                bumpers.push(
                    Bodies.circle(x + xoffset, y, 5, {
                        isStatic: true,
                        label: "bumper",
                        render: {
                            fillStyle: "1c92db",
                            lineWidth: 3
                        }
                    })
                );
            }
        }

        const balls = [];
        for (let x = 0; x < nbBalls; x++) {
            balls.push(
                Bodies.circle(x * (width / nbBalls), Math.random() * 100, 10, {
                    label: "ball",
                    render: { fillStyle: "#9293aa" }
                })
            );
        }

        /* Add bodies to world */
        Composite.add(world, [...frame, ...bumpers, ...balls]);

        let noteKeys = [];
        let notesByKey = {};
        let notes = ["C4#", "E4", "G4#", "B4"];
        function updateKeyNotes() {
            Composite.remove(world, noteKeys);
            const nbNotesKeys = notes.length;
            notesByKey = [];

            for (
                let x = width / (nbNotesKeys * 2);
                x < width;
                x += width / nbNotesKeys
            ) {
                noteKeys.push(
                    Bodies.rectangle(x, height, width / nbNotesKeys, 100, {
                        isStatic: true,
                        label: "noteKey",
                        isSensor: true,
                        render: { fillStyle: "#9293aa", strokeStyle: "green" }
                    })
                );
            }
            Composite.add(world, noteKeys);

            notesByKey = {};
            for (let i = 0; i < noteKeys.length; i++) {
                notesByKey[noteKeys[i].id] = notes[i];
            }
        }
        updateKeyNotes();

        // an example of using collisionStart event on an engine
        Events.on(engine, "collisionStart", function (event) {
            var pairs = event.pairs;

            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                let shouldSound = false;
                let id;

                if (pair.bodyB.label === "noteKey") {
                    id = pair.bodyB.id;
                    pair.bodyB.render.fillStyle = "#F00";
                    shouldSound = true;
                }

                if (shouldSound && synth) {
                    const note = notesByKey[id];
                    synth.play(note, 0.5, 0, 1.5);
                    console.log(synth.notes);
                }
            }
        });

        Events.on(engine, "collisionEnd", function (event) {
            var pairs = event.pairs;

            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair.bodyB.label === "noteKey") {
                    pair.bodyB.render.fillStyle = "#9293aa";
                }
            }
        });

        let synth;

        function resetBall(ball, force) {
            if (ball.position.y > height + 30 || force) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                Body.set(ball, "position", { x, y });
                Body.set(ball, "velocity", { x: 0, y: 0 });
            }
        }

        Events.on(render, "afterRender", () => {
            balls.forEach((ball, i) => resetBall(ball, false));
        });

        const CHORDS = [
            ["G4", "B4", "D4", "F4#"], // G
            ["D4", "F4#", "A4", "C4#"], // D
            ["A4", "D4#", "E4", "G4#"], // Am
            ["A4", "D4#", "E4", "G4#"], // Am
            ["G4", "B4", "D4", "F4#"], // G
            ["D4", "F4#", "A4", "C4#"], // D
            ["C4", "E4#", "G4", "B4"], // C
            ["C4", "E4#", "G4", "B4"] // C
        ];
        let currentChord = -1;

        function updateChord() {
            currentChord = (currentChord + 1) % CHORDS.length;
            notes = CHORDS[currentChord];
            updateKeyNotes();
            //balls.forEach((ball, i) => resetBall(ball, true));
        }
        updateChord();

        setInterval(() => {
            updateChord();
        }, 3000);

    }

    useEffect(() => {
        if (!firstRender.current) return;
        firstRender.current = false;
        init()
    }, [])

    return <div>
        <div ref={canvas} width="500" height="500" />
    </div>
}