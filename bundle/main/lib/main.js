/*!
 * @test/main - v1.0.0
 * Compiled Thu, 09 Nov 2017 03:30:49 UTC
 *
 * pixi-filters is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
!function (e, n) {
  "object" == typeof exports && "undefined" != typeof module ? n(exports, require("src/cool")) : "function" == typeof define && define.amd ? define(["exports", "src/cool"], n) : n(e.PIXI = {}, e.cool)
}(this, function (e, n) {
  "use strict";
  "default" in n && n.default;
  var t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {},
    o = function (e, n) {
      return n = {exports: {}}, e(n, n.exports), n.exports
    }(function (e, n) {
      var o = t && t.__extends || function () {
        var e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, n) {
          e.__proto__ = n
        } || function (e, n) {
          for (var t in n) n.hasOwnProperty(t) && (e[t] = n[t])
        };
        return function (n, t) {
          function o() {
            this.constructor = n
          }

          e(n, t), n.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o)
        }
      }();
      Object.defineProperty(n, "__esModule", {value: !0});
      var r;
      !function (e) {
        var n = function () {
        };
        e.A = n
      }(r = n.pepe || (n.pepe = {})), function (e) {
        !function (e) {
          var n = function () {
            function e() {
            }

            return e.hello = function () {
              console.log("HI!")
            }, e
          }();
          e.CoreCitizen = n
        }(e.core || (e.core = {}))
      }(r = n.pepe || (n.pepe = {}));
      var i = r.core.CoreCitizen;
      !function (e) {
        var n = function (e) {
          function n() {
            return null !== e && e.apply(this, arguments) || this
          }

          return o(n, e), n
        }(i);
        e.B = n
      }(r = n.pepe || (n.pepe = {})), function (e) {
        var n = function (e) {
          function n() {
            return null !== e && e.apply(this, arguments) || this
          }

          return o(n, e), n
        }(e.B);
        e.C = n
      }(r = n.pepe || (n.pepe = {})), function (e) {
        var n = function (e) {
          function n() {
            return null !== e && e.apply(this, arguments) || this
          }

          return o(n, e), n
        }(r.core.CoreCitizen);
        e.Nope = n
      }(n.nope || (n.nope = {}))
    }), r = function (e) {
      return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
    }(o), i = {pepe: o.pepe, nope: o.nope, default: r}, u = {Hello: n.Hello};
  e.lib1 = i, e.lib2 = u, Object.defineProperty(e, "__esModule", {value: !0})
});
//# sourceMappingURL=main.js.map
