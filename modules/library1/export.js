"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var pepe;
(function (pepe) {
    var A = (function () {
        function A() {
        }
        return A;
    }());
    pepe.A = A;
})(pepe = exports.pepe || (exports.pepe = {}));
(function (pepe) {
    var core;
    (function (core) {
        var CoreCitizen = (function () {
            function CoreCitizen() {
            }
            CoreCitizen.hello = function () {
                console.log('HI!');
            };
            return CoreCitizen;
        }());
        core.CoreCitizen = CoreCitizen;
    })(core = pepe.core || (pepe.core = {}));
})(pepe = exports.pepe || (exports.pepe = {}));
var CoreCitizen = pepe.core.CoreCitizen;
(function (pepe) {
    var B = (function (_super) {
        __extends(B, _super);
        function B() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B;
    }(CoreCitizen));
    pepe.B = B;
})(pepe = exports.pepe || (exports.pepe = {}));
(function (pepe) {
    var C = (function (_super) {
        __extends(C, _super);
        function C() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return C;
    }(pepe.B));
    pepe.C = C;
})(pepe = exports.pepe || (exports.pepe = {}));
var nope;
(function (nope) {
    var Nope = (function (_super) {
        __extends(Nope, _super);
        function Nope() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Nope;
    }(pepe.core.CoreCitizen));
    nope.Nope = Nope;
})(nope = exports.nope || (exports.nope = {}));
