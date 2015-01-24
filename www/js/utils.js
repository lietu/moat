define([], function () {
    var Utils = Object.create(null);

    Utils.extend = function extend(cls, extension) {
        var object = Object.create(cls);

        // Copy properties
        for (var key in extension) {
            if (extension.hasOwnProperty(key) || object[key] === "undefined") {
                object[key] = extension[key];
            }
        }

        object.super = function _super() {
            return cls;
        };

        return object;
    };

    /**
     * @see http://stackoverflow.com/a/7228322
     * @param min
     * @param max
     * @returns {number}
     */
    Utils.randbetween = function randbetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    return Utils;
});