define(["utils", "actor"], function (Utils, Actor) {
    var AnimatedActor = Utils.extend(Actor, {
        initialize: function initialize(game, callback) {
            Actor.initialize.call(this, game, function () {
                this.loadAnimations(function () {
                    callback(this);
                }.bind(this));
            }.bind(this));
        },

        setup: function setup() {
            this.sprite = this._anim[this.animation];

            this.sprite.loop = true;
            this.sprite.animationSpeed = this.animations[this.animation].speed;

            this.sprite.anchor.x = 0;
            this.sprite.anchor.y = 0;

            this.sprite.position.x = 200;
            this.sprite.position.y = 200;

            this.game.stage.addChild(this.sprite);

            this.sprite.play();
        }
    });

    return AnimatedActor;
});