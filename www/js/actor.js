define(["utils", "pixi", "async"], function (Utils, PIXI, async) {
    var textures = {};

    var Actor = Utils.extend(null, {
        cls: "Actor",
        animations: {},

        create: function create(game, callback) {
            var _this = Object.create(this);
            _this.initialize(game, callback);
            return _this;
        },

        initialize: function initialize(game, callback) {
            if (this.imageId) {
                if (!textures[this.imageId]) {
                    var image = game.getImage(this.imageId);
                    textures[this.imageId] = PIXI.Texture.fromImage(image);
                }
            }

            this.game = game;
            this._anim = {};

            this.id = null;
            this.velocity_x = 0;
            this.velocity_y = 0;

            callback(this);
        },

        setup: function setup() {
            this.sprite = new PIXI.Sprite(textures[this.imageId]);

            this.sprite.anchor.x = 0;
            this.sprite.anchor.y = 0;

            this.sprite.position.x = 200;
            this.sprite.position.y = 200;

            this.game.stage.addChild(this.sprite);
        },

        setInteractive: function setInteractive(interactive) {
            this.sprite.interactive = interactive;

            if (interactive) {
                this.sprite.mouseover = this.onMouseover.bind(this);
            }
        },

        onMouseover: function onMouseover(mouseData) {
            //console.log("Hovering over player " + this.id);
        },

        setData: function setData(data) {
            this.id = data.id;
            this.velocity_x = data.velocity_x;
            this.velocity_y = data.velocity_y;
            this.sprite.position.x = data.x;
            this.sprite.position.y = data.y;
            this.sprite.rotation = data.rotation;
        },

        remove: function remove() {
            this.game.stage.removeChild(this.sprite);
        },

        update: function update(time_elapsed) {
            // To be implemented by children
        },

        loadAnimations: function loadAnimations(callback) {
            var needLoad = [];
            for (var key in this.animations) {
                if (!this._anim[key]) {
                    needLoad.push(key);
                }
            }

            async.map(needLoad, this._loadAnimation.bind(this), callback);
        },

        _loadAnimation: function _loadAnimation(id, callback) {
            var data = this.animations[id];
            var image = this.game.getImage(data.id);
            var loader = new PIXI.ImageLoader(image);
            var spriteTexture = loader.texture.baseTexture;
            var frameWidth = data.frame[0];
            var frameHeight = data.frame[1];

            var frames = [];
            loader.addEventListener("loaded", function(event) {
                var cols = Math.floor(spriteTexture.width / frameWidth);
                var rows = Math.floor(spriteTexture.height / frameHeight);

                var num = 0;

                for (var row=0; row < rows; row += 1) {
                    for (var col=0; col < cols; col += 1) {
                        num += 1;

                        var name = id + "-" + num;

                        if (!PIXI.TextureCache[name]) {
                            var texture = new PIXI.Texture(spriteTexture, {
                                x: col * frameWidth,
                                y: row * frameHeight,
                                width: frameWidth,
                                height: frameHeight
                            });

                            PIXI.TextureCache[name] = texture;
                        }

                        frames.push(name);
                    }
                }

                this._anim[id] = PIXI.MovieClip.fromFrames(frames);
                callback(null, null);
            }.bind(this));

            loader.load();
        }
    });

    return Actor;
});