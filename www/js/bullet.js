define(["utils", "animatedactor"], function(Utils, AnimatedActor) {
    var Bullet = Utils.extend(AnimatedActor, {
        cls: "Bullet",
        animation: "bullet",
        animations: {
            "bullet": {id: "bullet", frame: [16, 19], speed: 0.5}
        },

        initialize: function initialize(game, callback) {
            this.super().initialize.call(this, game, function() {
                this.direction = [0, 0];
                this.velocity = 0;

                this.game.playSound("shoot");

                callback(this)
            }.bind(this));
        },

        setData: function setData(data) {
            this.super().setData.call(this, data);
            this.direction = data.direction;
            this.velocity = data.velocity;
        },

        update: function update(time_elapsed) {
            var speed = this.velocity * (time_elapsed / 1000.0);

            var velocity = [
                this.direction[0] * speed,
                this.direction[1] * speed
            ];

            this.sprite.position.x += velocity[0];
            this.sprite.position.y += velocity[1];
        }
    });

    return Bullet;
});