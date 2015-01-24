define([
    "pixi", "fpsmeter", "sockjs", "player", "bullet", "utils"
], function (PIXI, FPSMeter, SockJS, Player, Bullet, Utils) {

    var assets = {
        "boy-crouch": {src: "assets/images/Boycrouch.png"},
        "boy-idle": {src: "assets/images/BoyIdle.png"},
        "boy-jump": {src: "assets/images/Boyjump.png"},
        "boy-run": {src: "assets/images/Boyrun.png"},
        "bullet": {src: "assets/images/bullet-anim.png"},
        "start": {category: "general", src: "assets/sounds/MetalHit.mp3"},
        "shoot": {category: "sfx", src: "assets/sounds/8bit_gunloop_explosion.mp3"},
        "died": {category: "sfx", src: "assets/sounds/died.mp3"},
        "death_1": {category: "sfx", src: "assets/sounds/death_1.mp3"},
        "death_2": {category: "sfx", src: "assets/sounds/death_2.mp3"},
    };

    var volumes = {
        "general": 0.1,
        "sfx": 0.1
    };

    var actorClasses = {
        "Player": Player,
        "Bullet": Bullet,
    };

    var Game = function () {
        this.initialize();
    };

    Game.prototype = {
        initialize: function initialize() {
            this.backgroundColor = 0xcccccc;
            this.queue = null;
            this.lastTick = null;
            this.iteration = null;
            this.playerId = null;
            this.objects = [];

            this.initPixi();

            this.meter = new FPSMeter({
                show: 'fps',
                toggleOn: 'click',
                theme: 'colorful',
                smoothing: 3,
                graph: 1
            });
        },

        initPixi: function initPixi() {
            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(this.backgroundColor, true);
            this.stage.click = this.onClick.bind(this);
            this.stage.touchstart = this.onClick.bind(this);

            // create a renderer instance.
            this.renderer = PIXI.autoDetectRenderer(640, 480, {
                antialiasing: false,
                transparent: false,
                resolution: window.devicePixelRatio
            });

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);
        },

        start: function start() {
            this.queue = new createjs.LoadQueue(true);
            this.queue.installPlugin(createjs.Sound);
            this.queue.on("progress", this._loadProgress, this);
            this.queue.on("complete", this._loadComplete, this);

            var manifest = [];
            for (var key in assets) {
                var item = assets[key];
                item.id = key;
                manifest.push(item);
            }

            this.queue.loadManifest(manifest);
        },

        setup: function setup() {
            this.lastTick = this.getTime();
            this.iteration = 0;

            this.playSound("start");

            this._connect();
        },

        playSound: function playSound(id) {
            var sound = createjs.Sound.play(id);
            var category = assets[id].category;

            if (!volumes[category]) {
                throw new Error("No volume for category " + category);
            }

            sound.volume = volumes[category];
        },

        tick: function tick() {
            this.iteration += 1;
            var start = this.getTime();
            var tickTime = start - this.lastTick;

            this.update(tickTime, this.iteration);
            this.renderer.render(this.stage);

            this.lastTick = this.getTime();
            this.meter.tick();
            window.requestAnimationFrame(this.tick.bind(this));
        },

        update: function (elapsedTime, iteration) {
            for (var id in this.objects) {
                var obj = this.objects[id];
                obj.update(elapsedTime);
            }
        },

        getImage: function getImage(id) {
            var res = this.queue.getResult(id);
            if (!res) {
                throw new Error("Invalid image ID " + id);
            }
            return res.src;
        },

        getTime: function getTime() {
            return (typeof performance !== "undefined" ? performance.now() : Date.now());
        },

        onClick: function onClick(mouseData) {
            var position = mouseData.global;

            var data = {
                "type": "shoot",
                "x": position.x,
                "y": position.y
            };

            this.sock.send(JSON.stringify(data));
        },

        died: function died() {
            var data = {
                "type": "requestRespawn"
            };

            this.playSound("died");

            this.sock.send(JSON.stringify(data));
        },

        _connect: function _connect() {
            // Make sure that when we connect all objects are gone
            for (var id in this.objects) {
                var actor = this.objects[id];

                actor.remove();
                delete this.objects[id];
            }

            var url = "/api/game";
            this.sock = new SockJS(url);
            this.sock.onopen = this._onOpen.bind(this);
            this.sock.onmessage = this._onMessage.bind(this);
            this.sock.onclose = this._onClose.bind(this);
        },

        _onOpen: function _onOpen(event) {
            console.log("Connection established");
        },

        _onMessage: function _onOpen(event) {
            var messages = JSON.parse(event.data);
            try {
                //console.log("Got " + messages.length + " updates");
                messages.forEach(function (message) {
                    try {
                        if (message.id) {
                            this._processActorUpdate(message);
                        } else if (message.playerId) {
                            this.playerId = message.playerId;
                        }
                    } catch (err) {
                        console.log("Caught " + err + " when processing message");
                        console.log(err.stack);
                        console.dir(message);
                    }
                }.bind(this));
            } catch (err) {
                console.log("Caught " + err + " when processing messages");
                console.log(err.stack);
                console.dir(messages);
            }
        },

        _processActorUpdate: function _processActorUpdate(message) {
            var id = message.id;
            var actor = this.objects[id];
            if (message.deleted) {
                if (this.playerId === id) {
                    this.died();
                }

                if (actor) {
                    if (actor.cls === "Player" && this.playerId !== id) {
                        var sound = 'death_' + Utils.randbetween(1, 2);
                        this.playSound(sound);
                    }
                    actor.remove();
                    delete this.objects[id];
                }

            } else {
                if (!actor) {
                    if (!actorClasses[message.class]) {
                        throw new Error("Unknown actor class " + message.class);
                    }

                    var cls = actorClasses[message.class];
                    actor = cls.create(this, function(actor) {
                        actor.setup();
                        actor.setData(message);
                    });

                    this.objects[id] = actor;
                } else {
                    actor.setData(message);
                }

            }
        },

        _onClose: function _onOpen(event) {
            console.log("Connection to server severed", event);
            setTimeout(function () {
                console.log("Reconnecting...");
                this._connect();
            }.bind(this), 500);
        },

        _loadProgress: function _loadProgress(event) {
            var pct = (event.loaded * 100);
            console.log('Load progress: ' + pct + "%");
        },

        _loadComplete: function _loadComplete() {
            this.setup();
            this.tick();
        }
    };

    return new Game();
});