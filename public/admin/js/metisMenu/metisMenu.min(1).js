/*
 * metismenu - v2.7.2
 * A jQuery menu plugin
 * https://github.com/onokumus/metismenu#readme
 *
 * Made by Osman Nuri Okumus <onokumus@gmail.com> (https://github.com/onokumus)
 * Under MIT License
 */

!function(n,i){if("function"==typeof define&&define.amd)define(["jquery"],i);else if("undefined"!=typeof exports)i(require("jquery"));else{i(n.jquery),n.metisMenu={}}}(this,function(n){"use strict";var i;i=n,i&&i.__esModule;var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n};var e=function(n){var i=!1;function t(i){var t=this,s=!1;return n(this).one(e.TRANSITION_END,function(){s=!0}),setTimeout(function(){s||e.triggerTransitionEnd(t)},i),this}var e={TRANSITION_END:"mmTransitionEnd",triggerTransitionEnd:function(t){n(t).trigger(i.end)},supportsTransitionEnd:function(){return Boolean(i)}};return i=!window.QUnit&&{end:"transitionend"},n.fn.mmEmulateTransitionEnd=t,e.supportsTransitionEnd()&&(n.event.special[e.TRANSITION_END]={bindType:i.end,delegateType:i.end,handle:function(i){if(n(i.target).is(this))return i.handleObj.handler.apply(this,arguments)}}),e}(jQuery);!function(n){var i="metisMenu",s="metisMenu",o="."+s,a=n.fn[i],r={toggle:!0,preventDefault:!0,activeClass:"active",collapseClass:"collapse",collapseInClass:"in",collapsingClass:"collapsing",triggerElement:"a",parentTrigger:"li",subMenu:"ul"},l={SHOW:"show"+o,SHOWN:"shown"+o,HIDE:"hide"+o,HIDDEN:"hidden"+o,CLICK_DATA_API:"click"+o+".data-api"},c=function(){function i(n,t){!function(n,i){if(!(n instanceof i))throw new TypeError("Cannot call a class as a function")}(this,i),this._element=n,this._config=this._getConfig(t),this._transitioning=null,this.init()}return i.prototype.init=function(){var i=this;n(this._element).find(this._config.parentTrigger+"."+this._config.activeClass).has(this._config.subMenu).children(this._config.subMenu).attr("aria-expanded",!0).addClass(this._config.collapseClass+" "+this._config.collapseInClass),n(this._element).find(this._config.parentTrigger).not("."+this._config.activeClass).has(this._config.subMenu).children(this._config.subMenu).attr("aria-expanded",!1).addClass(this._config.collapseClass),n(this._element).find(this._config.parentTrigger).has(this._config.subMenu).children(this._config.triggerElement).on(l.CLICK_DATA_API,function(t){var e=n(this),s=e.parent(i._config.parentTrigger),o=s.siblings(i._config.parentTrigger).children(i._config.triggerElement),a=s.children(i._config.subMenu);i._config.preventDefault&&t.preventDefault(),"true"!==e.attr("aria-disabled")&&(s.hasClass(i._config.activeClass)?(e.attr("aria-expanded",!1),i._hide(a)):(i._show(a),e.attr("aria-expanded",!0),i._config.toggle&&o.attr("aria-expanded",!1)),i._config.onTransitionStart&&i._config.onTransitionStart(t))})},i.prototype._show=function(i){if(!this._transitioning&&!n(i).hasClass(this._config.collapsingClass)){var t=this,s=n(i),o=n.Event(l.SHOW);if(s.trigger(o),!o.isDefaultPrevented()){s.parent(this._config.parentTrigger).addClass(this._config.activeClass),this._config.toggle&&this._hide(s.parent(this._config.parentTrigger).siblings().children(this._config.subMenu+"."+this._config.collapseInClass).attr("aria-expanded",!1)),s.removeClass(this._config.collapseClass).addClass(this._config.collapsingClass).height(0),this.setTransitioning(!0);var a=function(){t._config&&t._element&&(s.removeClass(t._config.collapsingClass).addClass(t._config.collapseClass+" "+t._config.collapseInClass).height("").attr("aria-expanded",!0),t.setTransitioning(!1),s.trigger(l.SHOWN))};e.supportsTransitionEnd()?s.height(s[0].scrollHeight).one(e.TRANSITION_END,a).mmEmulateTransitionEnd(350):a()}}},i.prototype._hide=function(i){if(!this._transitioning&&n(i).hasClass(this._config.collapseInClass)){var t=this,s=n(i),o=n.Event(l.HIDE);if(s.trigger(o),!o.isDefaultPrevented()){s.parent(this._config.parentTrigger).removeClass(this._config.activeClass),s.height(s.height())[0].offsetHeight,s.addClass(this._config.collapsingClass).removeClass(this._config.collapseClass).removeClass(this._config.collapseInClass),this.setTransitioning(!0);var a=function(){t._config&&t._element&&(t._transitioning&&t._config.onTransitionEnd&&t._config.onTransitionEnd(),t.setTransitioning(!1),s.trigger(l.HIDDEN),s.removeClass(t._config.collapsingClass).addClass(t._config.collapseClass).attr("aria-expanded",!1))};e.supportsTransitionEnd()?0==s.height()||"none"==s.css("display")?a():s.height(0).one(e.TRANSITION_END,a).mmEmulateTransitionEnd(350):a()}}},i.prototype.setTransitioning=function(n){this._transitioning=n},i.prototype.dispose=function(){n.removeData(this._element,s),n(this._element).find(this._config.parentTrigger).has(this._config.subMenu).children(this._config.triggerElement).off("click"),this._transitioning=null,this._config=null,this._element=null},i.prototype._getConfig=function(i){return i=n.extend({},r,i)},i._jQueryInterface=function(e){return this.each(function(){var o=n(this),a=o.data(s),l=n.extend({},r,o.data(),"object"===(void 0===e?"undefined":t(e))&&e);if(!a&&/dispose/.test(e)&&this.dispose(),a||(a=new i(this,l),o.data(s,a)),"string"==typeof e){if(void 0===a[e])throw new Error('No method named "'+e+'"');a[e]()}})},i}();n.fn[i]=c._jQueryInterface,n.fn[i].Constructor=c,n.fn[i].noConflict=function(){return n.fn[i]=a,c._jQueryInterface}}(jQuery)});
//# sourceMappingURL=metisMenu.js.map