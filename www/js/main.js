(function() {
    require.config({
        baseUrl: "js/",
        paths: {
            "fpsmeter": "lib/fpsmeter/dist/fpsmeter",
            "pixi": "lib/pixi.js/bin/pixi.dev",
            "sockjs": "lib/sockjs/sockjs",
            "async": "lib/async/lib/async"
        },
        shim: {
            "fpsmeter": {
                exports: 'FPSMeter'
            }
        },
        waitSeconds: 15
    });

    require(["game"], function (game) {
        game.start();
    })
})();
