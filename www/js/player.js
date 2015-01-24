define(["utils", "animatedactor"], function(Utils, AnimatedActor) {

    var Player = Utils.extend(AnimatedActor, {
        cls: "Player",
        animation: "idle",

        animations: {
            "idle": {id: "boy-idle", frame: [32, 32], speed: 0.1}
        },

        update: function update(time_elapsed) {
            // var speed = time_elapsed / 1000;
        }
    });

    return Player;
});