var core;
(function (core) {
    var utils;
    (function (utils) {
        function stuff() {
            return 1;
        }
        utils.stuff = stuff;
    })(utils = core.utils || (core.utils = {}));
})(core || (core = {}));
var display;
(function (display) {
    var Sprite = (function () {
        function Sprite() {
        }
        return Sprite;
    }());
    display.Sprite = Sprite;
})(display || (display = {}));
//# sourceMappingURL=module1.js.map