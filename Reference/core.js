/* core.js on 12 April 2011 */
(function (a, d) {
	function g(h, k, m) {
		if (m === d && h.nodeType === 1) {
			m = h.getAttribute("data-" + k);
			if (typeof m === "string") {
				try {
					m = m === "true" ? true : m === "false" ? false : m === "null" ? null : !l.isNaN(m) ? parseFloat(m) : Y.test(m) ? l.parseJSON(m) : m
				} catch (p) {}
				l.data(h, k, m)
			} else m = d
		}
		return m
	}
	function c(h) {
		for (var k in h) if (k !== "toJSON") return false;
		return true
	}
	function e() {
		return false
	}
	function b() {
		return true
	}
	function f(h, k, m) {
		var p = l.extend({}, m[0]);
		p.type = h;
		p.originalEvent = {};
		p.liveFired = d;
		l.event.handle.call(k, p);
		p.isDefaultPrevented() && m[0].preventDefault()
	}
	function j(h) {
		var k, m, p, s, u, z, J, I, L, T, aa, ma = [];
		s = [];
		u = l._data(this, "events");
		if (!(h.liveFired === this || !u || !u.live || h.target.disabled || h.button && h.type === "click")) {
			if (h.namespace) aa = RegExp("(^|\\.)" + h.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
			h.liveFired = this;
			var la = u.live.slice(0);
			for (J = 0; J < la.length; J++) {
				u = la[J];
				u.origType.replace(ua, "") === h.type ? s.push(u.selector) : la.splice(J--, 1)
			}
			s = l(h.target).closest(s, h.currentTarget);
			I = 0;
			for (L = s.length; I < L; I++) {
				T = s[I];
				for (J = 0; J < la.length; J++) {
					u = la[J];
					if (T.selector === u.selector && (!aa || aa.test(u.namespace)) && !T.elem.disabled) {
						z = T.elem;
						p = null;
						if (u.preType === "mouseenter" || u.preType === "mouseleave") {
							h.type = u.preType;
							p = l(h.relatedTarget).closest(u.selector)[0]
						}
						if (!p || p !== z) ma.push({
							elem: z,
							handleObj: u,
							level: T.level
						})
					}
				}
			}
			I = 0;
			for (L = ma.length; I < L; I++) {
				s = ma[I];
				if (m && s.level > m) break;
				h.currentTarget = s.elem;
				h.data = s.handleObj.data;
				h.handleObj = s.handleObj;
				aa = s.handleObj.origHandler.apply(s.elem, arguments);
				if (aa === false || h.isPropagationStopped()) {
					m = s.level;
					if (aa === false) k = false;
					if (h.isImmediatePropagationStopped()) break
				}
			}
			return k
		}
	}
	function o(h, k) {
		return (h && h !== "*" ? h + "." : "") + k.replace(ra, "`").replace(eb, "&")
	}
	function q(h, k, m) {
		if (l.isFunction(k)) return l.grep(h, function (s, u) {
			return !!k.call(s, u, s) === m
		});
		else if (k.nodeType) return l.grep(h, function (s) {
			return s === k === m
		});
		else if (typeof k === "string") {
			var p = l.grep(h, function (s) {
				return s.nodeType === 1
			});
			if (Tb.test(k)) return l.filter(k, p, !m);
			else k = l.filter(k, p)
		}
		return l.grep(h, function (s) {
			return l.inArray(s, k) >= 0 === m
		})
	}
	function v(h, k) {
		if (!(k.nodeType !== 1 || !l.hasData(h))) {
			var m = l.expando,
				p = l.data(h),
				s = l.data(k, p);
			if (p = p[m]) {
				var u = p.events;
				s = s[m] = l.extend({}, p);
				if (u) {
					delete s.handle;
					s.events = {};
					for (var z in u) {
						m = 0;
						for (p = u[z].length; m < p; m++) l.event.add(k, z + (u[z][m].namespace ? "." : "") + u[z][m].namespace, u[z][m], u[z][m].data)
					}
				}
			}
		}
	}
	function w(h, k) {
		if (k.nodeType === 1) {
			var m = k.nodeName.toLowerCase();
			k.clearAttributes();
			k.mergeAttributes(h);
			if (m === "object") k.outerHTML = h.outerHTML;
			else if (m === "input" && (h.type === "checkbox" || h.type === "radio")) {
				if (h.checked) k.defaultChecked = k.checked = h.checked;
				if (k.value !== h.value) k.value = h.value
			} else if (m === "option") k.selected = h.defaultSelected;
			else if (m === "input" || m === "textarea") k.defaultValue = h.defaultValue;
			k.removeAttribute(l.expando)
		}
	}
	function E(h) {
		return "getElementsByTagName" in h ? h.getElementsByTagName("*") : "querySelectorAll" in h ? h.querySelectorAll("*") : []
	}
	function A(h, k) {
		k.src ? l.ajax({
			url: k.src,
			async: false,
			dataType: "script"
		}) : l.globalEval(k.text || k.textContent || k.innerHTML || "");
		k.parentNode && k.parentNode.removeChild(k)
	}
	function B(h, k, m) {
		var p = k === "width" ? h.offsetWidth : h.offsetHeight;
		if (m === "border") return p;
		l.each(k === "width" ? sb : ib, function () {
			m || (p -= parseFloat(l.css(h, "padding" + this)) || 0);
			if (m === "margin") p += parseFloat(l.css(h, "margin" + this)) || 0;
			else p -= parseFloat(l.css(h, "border" + this + "Width")) || 0
		});
		return p
	}
	function G(h) {
		return function (k, m) {
			if (typeof k !== "string") {
				m = k;
				k = "*"
			}
			if (l.isFunction(m)) for (var p = k.toLowerCase().split(Va), s = 0, u = p.length, z, J; s < u; s++) {
				z = p[s];
				if (J = /^\+/.test(z)) z = z.substr(1) || "*";
				z = h[z] = h[z] || [];
				z[J ? "unshift" : "push"](m)
			}
		}
	}
	function x(h, k, m, p, s, u) {
		s = s || k.dataTypes[0];
		u = u || {};
		u[s] = true;
		s = h[s];
		for (var z = 0, J = s ? s.length : 0, I = h === Fa, L; z < J && (I || !L); z++) {
			L = s[z](k, m, p);
			if (typeof L === "string") if (!I || u[L]) L = d;
			else {
				k.dataTypes.unshift(L);
				L = x(h, k, m, p, L, u)
			}
		}
		if ((I || !L) && !u["*"]) L = x(h, k, m, p, "*", u);
		return L
	}
	function D(h, k, m, p) {
		if (l.isArray(k) && k.length) l.each(k, function (u, z) {
			m || Ib.test(h) ? p(h, z) : D(h + "[" + (typeof z === "object" || l.isArray(z) ? u : "") + "]", z, m, p)
		});
		else if (!m && k != null && typeof k === "object") if (l.isArray(k) || l.isEmptyObject(k)) p(h, "");
		else for (var s in k) D(h + "[" + s + "]", k[s], m, p);
		else p(h, k)
	}
	function F() {
		l(a).unload(function () {
			for (var h in Ra) Ra[h](0, 1)
		})
	}
	function R() {
		try {
			return new a.XMLHttpRequest
		} catch (h) {}
	}
	function X(h, k) {
		var m = {};
		l.each(jb.concat.apply([], jb.slice(0, k)), function () {
			m[this] = h
		});
		return m
	}
	function ea(h) {
		if (!tb[h]) {
			var k = l("<" + h + ">").appendTo("body"),
				m = k.css("display");
			k.remove();
			if (m === "none" || m === "") m = "block";
			tb[h] = m
		}
		return tb[h]
	}
	function W(h) {
		return l.isWindow(h) ? h : h.nodeType === 9 ? h.defaultView || h.parentWindow : false
	}
	var M = a.document,
		l = function () {
			function h() {
				if (!k.isReady) {
					try {
						M.documentElement.doScroll("left")
					} catch (y) {
						setTimeout(h, 1);
						return
					}
					k.ready()
				}
			}
			var k = function (y, S) {
				return new k.fn.init(y, S, s)
			},
				m = a.jQuery,
				p = a.$,
				s, u = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,
				z = /\S/,
				J = /^\s+/,
				I = /\s+$/,
				L = /\d/,
				T = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
				aa = /^[\],:{}\s]*$/,
				ma = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
				la = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
				qa = /(?:^|:|,)(?:\s*\[)+/g,
				sa = /(webkit)[ \/]([\w.]+)/,
				za = /(opera)(?:.*version)?[ \/]([\w.]+)/,
				Na = /(msie) ([\w.]+)/,
				Ua = /(mozilla)(?:.*? rv:([\w.]+))?/,
				t = navigator.userAgent,
				H = false,
				P, N = "then done fail isResolved isRejected promise".split(" "),
				O, Q = Object.prototype.toString,
				ca = Object.prototype.hasOwnProperty,
				ba = Array.prototype.push,
				na = Array.prototype.slice,
				La = String.prototype.trim,
				Da = Array.prototype.indexOf,
				Ba = {};
			k.fn = k.prototype = {
				constructor: k,
				init: function (y, S, n) {
					var r;
					if (!y) return this;
					if (y.nodeType) {
						this.context = this[0] = y;
						this.length = 1;
						return this
					}
					if (y === "body" && !S && M.body) {
						this.context = M;
						this[0] = M.body;
						this.selector = "body";
						this.length = 1;
						return this
					}
					if (typeof y === "string") if ((r = u.exec(y)) && (r[1] || !S)) if (r[1]) {
						n = (S = S instanceof k ? S[0] : S) ? S.ownerDocument || S : M;
						if (y = T.exec(y)) if (k.isPlainObject(S)) {
							y = [M.createElement(y[1])];
							k.fn.attr.call(y, S, true)
						} else y = [n.createElement(y[1])];
						else {
							y = k.buildFragment([r[1]], [n]);
							y = (y.cacheable ? k.clone(y.fragment) : y.fragment).childNodes
						}
						return k.merge(this, y)
					} else {
						if ((S = M.getElementById(r[2])) && S.parentNode) {
							if (S.id !== r[2]) return n.find(y);
							this.length = 1;
							this[0] = S
						}
						this.context = M;
						this.selector = y;
						return this
					} else return !S || S.jquery ? (S || n).find(y) : this.constructor(S).find(y);
					else if (k.isFunction(y)) return n.ready(y);
					if (y.selector !== d) {
						this.selector = y.selector;
						this.context = y.context
					}
					return k.makeArray(y, this)
				},
				selector: "",
				jquery: "1.5.1",
				length: 0,
				size: function () {
					return this.length
				},
				toArray: function () {
					return na.call(this, 0)
				},
				get: function (y) {
					return y == null ? this.toArray() : y < 0 ? this[this.length + y] : this[y]
				},
				pushStack: function (y, S, n) {
					var r = this.constructor();
					k.isArray(y) ? ba.apply(r, y) : k.merge(r, y);
					r.prevObject = this;
					r.context = this.context;
					if (S === "find") r.selector = this.selector + (this.selector ? " " : "") + n;
					else if (S) r.selector = this.selector + "." + S + "(" + n + ")";
					return r
				},
				each: function (y, S) {
					return k.each(this, y, S)
				},
				ready: function (y) {
					k.bindReady();
					P.done(y);
					return this
				},
				eq: function (y) {
					return y === -1 ? this.slice(y) : this.slice(y, +y + 1)
				},
				first: function () {
					return this.eq(0)
				},
				last: function () {
					return this.eq(-1)
				},
				slice: function () {
					return this.pushStack(na.apply(this, arguments), "slice", na.call(arguments).join(","))
				},
				map: function (y) {
					return this.pushStack(k.map(this, function (S, n) {
						return y.call(S, n, S)
					}))
				},
				end: function () {
					return this.prevObject || this.constructor(null)
				},
				push: ba,
				sort: [].sort,
				splice: [].splice
			};
			k.fn.init.prototype = k.fn;
			k.extend = k.fn.extend = function () {
				var y, S, n, r, C, K = arguments[0] || {},
					V = 1,
					Z = arguments.length,
					fa = false;
				if (typeof K === "boolean") {
					fa = K;
					K = arguments[1] || {};
					V = 2
				}
				if (typeof K !== "object" && !k.isFunction(K)) K = {};
				if (Z === V) {
					K = this;
					--V
				}
				for (; V < Z; V++) if ((y = arguments[V]) != null) for (S in y) {
					n = K[S];
					r = y[S];
					if (K !== r) if (fa && r && (k.isPlainObject(r) || (C = k.isArray(r)))) {
						if (C) {
							C = false;
							n = n && k.isArray(n) ? n : []
						} else n = n && k.isPlainObject(n) ? n : {};
						K[S] = k.extend(fa, n, r)
					} else if (r !== d) K[S] = r
				}
				return K
			};
			k.extend({
				noConflict: function (y) {
					a.$ = p;
					if (y) a.jQuery = m;
					return k
				},
				isReady: false,
				readyWait: 1,
				ready: function (y) {
					y === true && k.readyWait--;
					if (!k.readyWait || y !== true && !k.isReady) {
						if (!M.body) return setTimeout(k.ready, 1);
						k.isReady = true;
						if (!(y !== true && --k.readyWait > 0)) {
							P.resolveWith(M, [k]);
							k.fn.trigger && k(M).trigger("ready").unbind("ready")
						}
					}
				},
				bindReady: function () {
					if (!H) {
						H = true;
						if (M.readyState === "complete") return setTimeout(k.ready, 1);
						if (M.addEventListener) {
							M.addEventListener("DOMContentLoaded", O, false);
							a.addEventListener("load", k.ready, false)
						} else if (M.attachEvent) {
							M.attachEvent("onreadystatechange", O);
							a.attachEvent("onload", k.ready);
							var y = false;
							try {
								y = a.frameElement == null
							} catch (S) {}
							M.documentElement.doScroll && y && h()
						}
					}
				},
				isFunction: function (y) {
					return k.type(y) === "function"
				},
				isArray: Array.isArray ||
				function (y) {
					return k.type(y) === "array"
				},
				isWindow: function (y) {
					return y && typeof y === "object" && "setInterval" in y
				},
				isNaN: function (y) {
					return y == null || !L.test(y) || isNaN(y)
				},
				type: function (y) {
					return y == null ? String(y) : Ba[Q.call(y)] || "object"
				},
				isPlainObject: function (y) {
					if (!y || k.type(y) !== "object" || y.nodeType || k.isWindow(y)) return false;
					if (y.constructor && !ca.call(y, "constructor") && !ca.call(y.constructor.prototype, "isPrototypeOf")) return false;
					var S;
					for (S in y);
					return S === d || ca.call(y, S)
				},
				isEmptyObject: function (y) {
					for (var S in y) return false;
					return true
				},
				error: function (y) {
					throw y;
				},
				parseJSON: function (y) {
					if (typeof y !== "string" || !y) return null;
					y = k.trim(y);
					if (aa.test(y.replace(ma, "@").replace(la, "]").replace(qa, ""))) return a.JSON && a.JSON.parse ? a.JSON.parse(y) : (new Function("return " + y))();
					else k.error("Invalid JSON: " + y)
				},
				parseXML: function (y, S, n) {
					if (a.DOMParser) {
						n = new DOMParser;
						S = n.parseFromString(y, "text/xml")
					} else {
						S = new ActiveXObject("Microsoft.XMLDOM");
						S.async = "false";
						S.loadXML(y)
					}
					n = S.documentElement;
					if (!n || !n.nodeName || n.nodeName === "parsererror") k.error("Invalid XML: " + y);
					return S
				},
				noop: function () {},
				globalEval: function (y) {
					if (y && z.test(y)) {
						var S = M.head || M.getElementsByTagName("head")[0] || M.documentElement,
							n = M.createElement("script");
						if (k.support.scriptEval()) n.appendChild(M.createTextNode(y));
						else n.text = y;
						S.insertBefore(n, S.firstChild);
						S.removeChild(n)
					}
				},
				nodeName: function (y, S) {
					return y.nodeName && y.nodeName.toUpperCase() === S.toUpperCase()
				},
				each: function (y, S, n) {
					var r, C = 0,
						K = y.length,
						V = K === d || k.isFunction(y);
					if (n) if (V) for (r in y) {
						if (S.apply(y[r], n) === false) break
					} else for (; C < K;) {
						if (S.apply(y[C++], n) === false) break
					} else if (V) for (r in y) {
						if (S.call(y[r], r, y[r]) === false) break
					} else for (n = y[0]; C < K && S.call(n, C, n) !== false; n = y[++C]);
					return y
				},
				trim: La ?
				function (y) {
					return y == null ? "" : La.call(y)
				} : function (y) {
					return y == null ? "" : y.toString().replace(J, "").replace(I, "")
				},
				makeArray: function (y, S) {
					var n = S || [];
					if (y != null) {
						var r = k.type(y);
						y.length == null || r === "string" || r === "function" || r === "regexp" || k.isWindow(y) ? ba.call(n, y) : k.merge(n, y)
					}
					return n
				},
				inArray: function (y, S) {
					if (S.indexOf) return S.indexOf(y);
					for (var n = 0, r = S.length; n < r; n++) if (S[n] === y) return n;
					return -1
				},
				merge: function (y, S) {
					var n = y.length,
						r = 0;
					if (typeof S.length === "number") for (var C = S.length; r < C; r++) y[n++] = S[r];
					else for (; S[r] !== d;) y[n++] = S[r++];
					y.length = n;
					return y
				},
				grep: function (y, S, n) {
					var r = [],
						C;
					n = !! n;
					for (var K = 0, V = y.length; K < V; K++) {
						C = !! S(y[K], K);
						n !== C && r.push(y[K])
					}
					return r
				},
				map: function (y, S, n) {
					for (var r = [], C, K = 0, V = y.length; K < V; K++) {
						C = S(y[K], K, n);
						if (C != null) r[r.length] = C
					}
					return r.concat.apply([], r)
				},
				guid: 1,
				proxy: function (y, S, n) {
					if (arguments.length === 2) if (typeof S === "string") {
						n = y;
						y = n[S];
						S = d
					} else if (S && !k.isFunction(S)) {
						n = S;
						S = d
					}
					if (!S && y) S = function () {
						return y.apply(n || this, arguments)
					};
					if (y) S.guid = y.guid = y.guid || S.guid || k.guid++;
					return S
				},
				access: function (y, S, n, r, C, K) {
					var V = y.length;
					if (typeof S === "object") {
						for (var Z in S) k.access(y, Z, S[Z], r, C, n);
						return y
					}
					if (n !== d) {
						r = !K && r && k.isFunction(n);
						for (Z = 0; Z < V; Z++) C(y[Z], S, r ? n.call(y[Z], Z, C(y[Z], S)) : n, K);
						return y
					}
					return V ? C(y[0], S) : d
				},
				now: function () {
					return (new Date).getTime()
				},
				_Deferred: function () {
					var y = [],
						S, n, r, C = {
							done: function () {
								if (!r) {
									var K = arguments,
										V, Z, fa, Oa, Ia;
									if (S) {
										Ia = S;
										S = 0
									}
									V = 0;
									for (Z = K.length; V < Z; V++) {
										fa = K[V];
										Oa = k.type(fa);
										if (Oa === "array") C.done.apply(C, fa);
										else Oa === "function" && y.push(fa)
									}
									Ia && C.resolveWith(Ia[0], Ia[1])
								}
								return this
							},
							resolveWith: function (K, V) {
								if (!r && !S && !n) {
									n = 1;
									try {
										for (; y[0];) y.shift().apply(K, V)
									} catch (Z) {
										throw Z;
									} finally {
										S = [K, V];
										n = 0
									}
								}
								return this
							},
							resolve: function () {
								C.resolveWith(k.isFunction(this.promise) ? this.promise() : this, arguments);
								return this
							},
							isResolved: function () {
								return !!(n || S)
							},
							cancel: function () {
								r = 1;
								y = [];
								return this
							}
						};
					return C
				},
				Deferred: function (y) {
					var S = k._Deferred(),
						n = k._Deferred(),
						r;
					k.extend(S, {
						then: function (C, K) {
							S.done(C).fail(K);
							return this
						},
						fail: n.done,
						rejectWith: n.resolveWith,
						reject: n.resolve,
						isRejected: n.isResolved,
						promise: function (C) {
							if (C == null) {
								if (r) return r;
								r = C = {}
							}
							for (var K = N.length; K--;) C[N[K]] = S[N[K]];
							return C
						}
					});
					S.done(n.cancel).fail(S.cancel);
					delete S.cancel;
					y && y.call(S, S);
					return S
				},
				when: function (y) {
					var S = arguments.length,
						n = S <= 1 && y && k.isFunction(y.promise) ? y : k.Deferred(),
						r = n.promise();
					if (S > 1) {
						for (var C = na.call(arguments, 0), K = S, V = function (Z) {
							return function (fa) {
								C[Z] = arguments.length > 1 ? na.call(arguments, 0) : fa;
								--K || n.resolveWith(r, C)
							}
						}; S--;) if ((y = C[S]) && k.isFunction(y.promise)) y.promise().then(V(S), n.reject);
						else--K;
						K || n.resolveWith(r, C)
					} else n !== y && n.resolve(y);
					return r
				},
				uaMatch: function (y) {
					y = y.toLowerCase();
					y = sa.exec(y) || za.exec(y) || Na.exec(y) || y.indexOf("compatible") < 0 && Ua.exec(y) || [];
					return {
						browser: y[1] || "",
						version: y[2] || "0"
					}
				},
				sub: function () {
					function y(n, r) {
						return new y.fn.init(n, r)
					}
					k.extend(true, y, this);
					y.superclass = this;
					y.fn = y.prototype = this();
					y.fn.constructor = y;
					y.subclass = this.subclass;
					y.fn.init = function (n, r) {
						if (r && r instanceof k && !(r instanceof y)) r = y(r);
						return k.fn.init.call(this, n, r, S)
					};
					y.fn.init.prototype = y.fn;
					var S = y(M);
					return y
				},
				browser: {}
			});
			P = k._Deferred();
			k.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (y, S) {
				Ba["[object " + S + "]"] = S.toLowerCase()
			});
			t = k.uaMatch(t);
			if (t.browser) {
				k.browser[t.browser] = true;
				k.browser.version = t.version
			}
			if (k.browser.webkit) k.browser.safari = true;
			if (Da) k.inArray = function (y, S) {
				return Da.call(S, y)
			};
			if (z.test("\u00a0")) {
				J = /^[\s\xA0]+/;
				I = /[\s\xA0]+$/
			}
			s = k(M);
			if (M.addEventListener) O = function () {
				M.removeEventListener("DOMContentLoaded", O, false);
				k.ready()
			};
			else if (M.attachEvent) O = function () {
				if (M.readyState === "complete") {
					M.detachEvent("onreadystatechange", O);
					k.ready()
				}
			};
			return k
		}();
	(function () {
		l.support = {};
		var h = M.createElement("div");
		h.style.display = "none";
		h.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		var k = h.getElementsByTagName("*"),
			m = h.getElementsByTagName("a")[0],
			p = M.createElement("select"),
			s = p.appendChild(M.createElement("option")),
			u = h.getElementsByTagName("input")[0];
		if (!(!k || !k.length || !m)) {
			l.support = {
				leadingWhitespace: h.firstChild.nodeType === 3,
				tbody: !h.getElementsByTagName("tbody").length,
				htmlSerialize: !! h.getElementsByTagName("link").length,
				style: /red/.test(m.getAttribute("style")),
				hrefNormalized: m.getAttribute("href") === "/a",
				opacity: /^0.55$/.test(m.style.opacity),
				cssFloat: !! m.style.cssFloat,
				checkOn: u.value === "on",
				optSelected: s.selected,
				deleteExpando: true,
				optDisabled: false,
				checkClone: false,
				noCloneEvent: true,
				noCloneChecked: true,
				boxModel: null,
				inlineBlockNeedsLayout: false,
				shrinkWrapBlocks: false,
				reliableHiddenOffsets: true
			};
			u.checked = true;
			l.support.noCloneChecked = u.cloneNode(true).checked;
			p.disabled = true;
			l.support.optDisabled = !s.disabled;
			var z = null;
			l.support.scriptEval = function () {
				if (z === null) {
					var I = M.documentElement,
						L = M.createElement("script"),
						T = "script" + l.now();
					try {
						L.appendChild(M.createTextNode("window." + T + "=1;"))
					} catch (aa) {}
					I.insertBefore(L, I.firstChild);
					if (a[T]) {
						z = true;
						delete a[T]
					} else z = false;
					I.removeChild(L)
				}
				return z
			};
			try {
				delete h.test
			} catch (J) {
				l.support.deleteExpando = false
			}
			if (!h.addEventListener && h.attachEvent && h.fireEvent) {
				h.attachEvent("onclick", function I() {
					l.support.noCloneEvent = false;
					h.detachEvent("onclick", I)
				});
				h.cloneNode(true).fireEvent("onclick")
			}
			h = M.createElement("div");
			h.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
			k = M.createDocumentFragment();
			k.appendChild(h.firstChild);
			l.support.checkClone = k.cloneNode(true).cloneNode(true).lastChild.checked;
			l(function () {
				var I = M.createElement("div"),
					L = M.getElementsByTagName("body")[0];
				if (L) {
					I.style.width = I.style.paddingLeft = "1px";
					L.appendChild(I);
					l.boxModel = l.support.boxModel = I.offsetWidth === 2;
					if ("zoom" in I.style) {
						I.style.display = "inline";
						I.style.zoom = 1;
						l.support.inlineBlockNeedsLayout = I.offsetWidth === 2;
						I.style.display = "";
						I.innerHTML = "<div style='width:4px;'></div>";
						l.support.shrinkWrapBlocks = I.offsetWidth !== 2
					}
					I.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
					var T = I.getElementsByTagName("td");
					l.support.reliableHiddenOffsets = T[0].offsetHeight === 0;
					T[0].style.display = "";
					T[1].style.display = "none";
					l.support.reliableHiddenOffsets = l.support.reliableHiddenOffsets && T[0].offsetHeight === 0;
					I.innerHTML = "";
					L.removeChild(I).style.display = "none"
				}
			});
			k = function (I) {
				var L = M.createElement("div");
				I = "on" + I;
				if (!L.attachEvent) return true;
				var T = I in L;
				if (!T) {
					L.setAttribute(I, "return;");
					T = typeof L[I] === "function"
				}
				return T
			};
			l.support.submitBubbles = k("submit");
			l.support.changeBubbles = k("change");
			h = k = m = null
		}
	})();
	var Y = /^(?:\{.*\}|\[.*\])$/;
	l.extend({
		cache: {},
		uuid: 0,
		expando: "jQuery" + (l.fn.jquery + Math.random()).replace(/\D/g, ""),
		noData: {
			embed: true,
			object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			applet: true
		},
		hasData: function (h) {
			h = h.nodeType ? l.cache[h[l.expando]] : h[l.expando];
			return !!h && !c(h)
		},
		data: function (h, k, m, p) {
			if (l.acceptData(h)) {
				var s = l.expando,
					u = typeof k === "string",
					z = h.nodeType,
					J = z ? l.cache : h,
					I = z ? h[l.expando] : h[l.expando] && l.expando;
				if (!((!I || p && I && !J[I][s]) && u && m === d)) {
					if (!I) if (z) h[l.expando] = I = ++l.uuid;
					else I = l.expando;
					if (!J[I]) {
						J[I] = {};
						if (!z) J[I].toJSON = l.noop
					}
					if (typeof k === "object" || typeof k === "function") if (p) J[I][s] = l.extend(J[I][s], k);
					else J[I] = l.extend(J[I], k);
					h = J[I];
					if (p) {
						h[s] || (h[s] = {});
						h = h[s]
					}
					if (m !== d) h[k] = m;
					if (k === "events" && !h[k]) return h[s] && h[s].events;
					return u ? h[k] : h
				}
			}
		},
		removeData: function (h, k, m) {
			if (l.acceptData(h)) {
				var p = l.expando,
					s = h.nodeType,
					u = s ? l.cache : h,
					z = s ? h[l.expando] : l.expando;
				if (u[z]) {
					if (k) {
						var J = m ? u[z][p] : u[z];
						if (J) {
							delete J[k];
							if (!c(J)) return
						}
					}
					if (m) {
						delete u[z][p];
						if (!c(u[z])) return
					}
					k = u[z][p];
					if (l.support.deleteExpando || u != a) delete u[z];
					else u[z] = null;
					if (k) {
						u[z] = {};
						if (!s) u[z].toJSON = l.noop;
						u[z][p] = k
					} else if (s) if (l.support.deleteExpando) delete h[l.expando];
					else if (h.removeAttribute) h.removeAttribute(l.expando);
					else h[l.expando] = null
				}
			}
		},
		_data: function (h, k, m) {
			return l.data(h, k, m, true)
		},
		acceptData: function (h) {
			if (h.nodeName) {
				var k = l.noData[h.nodeName.toLowerCase()];
				if (k) return !(k === true || h.getAttribute("classid") !== k)
			}
			return true
		}
	});
	l.fn.extend({
		data: function (h, k) {
			var m = null;
			if (typeof h === "undefined") {
				if (this.length) {
					m = l.data(this[0]);
					if (this[0].nodeType === 1) for (var p = this[0].attributes, s, u = 0, z = p.length; u < z; u++) {
						s = p[u].name;
						if (s.indexOf("data-") === 0) {
							s = s.substr(5);
							g(this[0], s, m[s])
						}
					}
				}
				return m
			} else if (typeof h === "object") return this.each(function () {
				l.data(this, h)
			});
			var J = h.split(".");
			J[1] = J[1] ? "." + J[1] : "";
			if (k === d) {
				m = this.triggerHandler("getData" + J[1] + "!", [J[0]]);
				if (m === d && this.length) {
					m = l.data(this[0], h);
					m = g(this[0], h, m)
				}
				return m === d && J[1] ? this.data(J[0]) : m
			} else return this.each(function () {
				var I = l(this),
					L = [J[0], k];
				I.triggerHandler("setData" + J[1] + "!", L);
				l.data(this, h, k);
				I.triggerHandler("changeData" + J[1] + "!", L)
			})
		},
		removeData: function (h) {
			return this.each(function () {
				l.removeData(this, h)
			})
		}
	});
	l.extend({
		queue: function (h, k, m) {
			if (h) {
				k = (k || "fx") + "queue";
				var p = l._data(h, k);
				if (!m) return p || [];
				if (!p || l.isArray(m)) p = l._data(h, k, l.makeArray(m));
				else p.push(m);
				return p
			}
		},
		dequeue: function (h, k) {
			k = k || "fx";
			var m = l.queue(h, k),
				p = m.shift();
			if (p === "inprogress") p = m.shift();
			if (p) {
				k === "fx" && m.unshift("inprogress");
				p.call(h, function () {
					l.dequeue(h, k)
				})
			}
			m.length || l.removeData(h, k + "queue", true)
		}
	});
	l.fn.extend({
		queue: function (h, k) {
			if (typeof h !== "string") {
				k = h;
				h = "fx"
			}
			if (k === d) return l.queue(this[0], h);
			return this.each(function () {
				var m = l.queue(this, h, k);
				h === "fx" && m[0] !== "inprogress" && l.dequeue(this, h)
			})
		},
		dequeue: function (h) {
			return this.each(function () {
				l.dequeue(this, h)
			})
		},
		delay: function (h, k) {
			h = l.fx ? l.fx.speeds[h] || h : h;
			k = k || "fx";
			return this.queue(k, function () {
				var m = this;
				setTimeout(function () {
					l.dequeue(m, k)
				}, h)
			})
		},
		clearQueue: function (h) {
			return this.queue(h || "fx", [])
		}
	});
	var ha = /[\n\t\r]/g,
		ta = /\s+/,
		ga = /\r/g,
		ja = /^(?:href|src|style)$/,
		xa = /^(?:button|input)$/i,
		U = /^(?:button|input|object|select|textarea)$/i,
		da = /^a(?:rea)?$/i,
		ia = /^(?:radio|checkbox)$/i;
	l.props = {
		"for": "htmlFor",
		"class": "className",
		readonly: "readOnly",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		rowspan: "rowSpan",
		colspan: "colSpan",
		tabindex: "tabIndex",
		usemap: "useMap",
		frameborder: "frameBorder"
	};
	l.fn.extend({
		attr: function (h, k) {
			return l.access(this, h, k, true, l.attr)
		},
		removeAttr: function (h) {
			return this.each(function () {
				l.attr(this, h, "");
				this.nodeType === 1 && this.removeAttribute(h)
			})
		},
		addClass: function (h) {
			if (l.isFunction(h)) return this.each(function (L) {
				var T = l(this);
				T.addClass(h.call(this, L, T.attr("class")))
			});
			if (h && typeof h === "string") for (var k = (h || "").split(ta), m = 0, p = this.length; m < p; m++) {
				var s = this[m];
				if (s.nodeType === 1) if (s.className) {
					for (var u = " " + s.className + " ", z = s.className, J = 0, I = k.length; J < I; J++) if (u.indexOf(" " + k[J] + " ") < 0) z += " " + k[J];
					s.className = l.trim(z)
				} else s.className = h
			}
			return this
		},
		removeClass: function (h) {
			if (l.isFunction(h)) return this.each(function (I) {
				var L = l(this);
				L.removeClass(h.call(this, I, L.attr("class")))
			});
			if (h && typeof h === "string" || h === d) for (var k = (h || "").split(ta), m = 0, p = this.length; m < p; m++) {
				var s = this[m];
				if (s.nodeType === 1 && s.className) if (h) {
					for (var u = (" " + s.className + " ").replace(ha, " "), z = 0, J = k.length; z < J; z++) u = u.replace(" " + k[z] + " ", " ");
					s.className = l.trim(u)
				} else s.className = ""
			}
			return this
		},
		toggleClass: function (h, k) {
			var m = typeof h,
				p = typeof k === "boolean";
			if (l.isFunction(h)) return this.each(function (s) {
				var u = l(this);
				u.toggleClass(h.call(this, s, u.attr("class"), k), k)
			});
			return this.each(function () {
				if (m === "string") for (var s, u = 0, z = l(this), J = k, I = h.split(ta); s = I[u++];) {
					J = p ? J : !z.hasClass(s);
					z[J ? "addClass" : "removeClass"](s)
				} else if (m === "undefined" || m === "boolean") {
					this.className && l._data(this, "__className__", this.className);
					this.className = this.className || h === false ? "" : l._data(this, "__className__") || ""
				}
			})
		},
		hasClass: function (h) {
			h = " " + h + " ";
			for (var k = 0, m = this.length; k < m; k++) if ((" " + this[k].className + " ").replace(ha, " ").indexOf(h) > -1) return true;
			return false
		},
		val: function (h) {
			if (!arguments.length) {
				var k = this[0];
				if (k) {
					if (l.nodeName(k, "option")) {
						var m = k.attributes.value;
						return !m || m.specified ? k.value : k.text
					}
					if (l.nodeName(k, "select")) {
						m = k.selectedIndex;
						var p = [],
							s = k.options;
						k = k.type === "select-one";
						if (m < 0) return null;
						for (var u = k ? m : 0, z = k ? m + 1 : s.length; u < z; u++) {
							var J = s[u];
							if (J.selected && (l.support.optDisabled ? !J.disabled : J.getAttribute("disabled") === null) && (!J.parentNode.disabled || !l.nodeName(J.parentNode, "optgroup"))) {
								h = l(J).val();
								if (k) return h;
								p.push(h)
							}
						}
						if (k && !p.length && s.length) return l(s[m]).val();
						return p
					}
					if (ia.test(k.type) && !l.support.checkOn) return k.getAttribute("value") === null ? "on" : k.value;
					return (k.value || "").replace(ga, "")
				}
				return d
			}
			var I = l.isFunction(h);
			return this.each(function (L) {
				var T = l(this),
					aa = h;
				if (this.nodeType === 1) {
					if (I) aa = h.call(this, L, T.val());
					if (aa == null) aa = "";
					else if (typeof aa === "number") aa += "";
					else if (l.isArray(aa)) aa = l.map(aa, function (la) {
						return la == null ? "" : la + ""
					});
					if (l.isArray(aa) && ia.test(this.type)) this.checked = l.inArray(T.val(), aa) >= 0;
					else if (l.nodeName(this, "select")) {
						var ma = l.makeArray(aa);
						l("option", this).each(function () {
							this.selected = l.inArray(l(this).val(), ma) >= 0
						});
						if (!ma.length) this.selectedIndex = -1
					} else this.value = aa
				}
			})
		}
	});
	l.extend({
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
		attr: function (h, k, m, p) {
			if (!h || h.nodeType === 3 || h.nodeType === 8 || h.nodeType === 2) return d;
			if (p && k in l.attrFn) return l(h)[k](m);
			p = h.nodeType !== 1 || !l.isXMLDoc(h);
			var s = m !== d;
			k = p && l.props[k] || k;
			if (h.nodeType === 1) {
				var u = ja.test(k);
				if ((k in h || h[k] !== d) && p && !u) {
					if (s) {
						k === "type" && xa.test(h.nodeName) && h.parentNode && l.error("type property can't be changed");
						if (m === null) h.nodeType === 1 && h.removeAttribute(k);
						else h[k] = m
					}
					if (l.nodeName(h, "form") && h.getAttributeNode(k)) return h.getAttributeNode(k).nodeValue;
					if (k === "tabIndex") return (k = h.getAttributeNode("tabIndex")) && k.specified ? k.value : U.test(h.nodeName) || da.test(h.nodeName) && h.href ? 0 : d;
					return h[k]
				}
				if (!l.support.style && p && k === "style") {
					if (s) h.style.cssText = "" + m;
					return h.style.cssText
				}
				s && h.setAttribute(k, "" + m);
				if (!h.attributes[k] && h.hasAttribute && !h.hasAttribute(k)) return d;
				h = !l.support.hrefNormalized && p && u ? h.getAttribute(k, 2) : h.getAttribute(k);
				return h === null ? d : h
			}
			if (s) h[k] = m;
			return h[k]
		}
	});
	var ua = /\.(.*)$/,
		Ca = /^(?:textarea|input|select)$/i,
		ra = /\./g,
		eb = / /g,
		kb = /[^\w\s.|`]/g,
		Za = function (h) {
			return h.replace(kb, "\\$&")
		};
	l.event = {
		add: function (h, k, m, p) {
			if (!(h.nodeType === 3 || h.nodeType === 8)) {
				try {
					if (l.isWindow(h) && h !== a && !h.frameElement) h = a
				} catch (s) {}
				if (m === false) m = e;
				else if (!m) return;
				var u, z;
				if (m.handler) {
					u = m;
					m = u.handler
				}
				if (!m.guid) m.guid = l.guid++;
				if (z = l._data(h)) {
					var J = z.events,
						I = z.handle;
					if (!J) z.events = J = {};
					if (!I) z.handle = I = function () {
						return typeof l !== "undefined" && !l.event.triggered ? l.event.handle.apply(I.elem, arguments) : d
					};
					I.elem = h;
					k = k.split(" ");
					for (var L, T = 0, aa; L = k[T++];) {
						z = u ? l.extend({}, u) : {
							handler: m,
							data: p
						};
						if (L.indexOf(".") > -1) {
							aa = L.split(".");
							L = aa.shift();
							z.namespace = aa.slice(0).sort().join(".")
						} else {
							aa = [];
							z.namespace = ""
						}
						z.type = L;
						if (!z.guid) z.guid = m.guid;
						var ma = J[L],
							la = l.event.special[L] || {};
						if (!ma) {
							ma = J[L] = [];
							if (!la.setup || la.setup.call(h, p, aa, I) === false) if (h.addEventListener) h.addEventListener(L, I, false);
							else h.attachEvent && h.attachEvent("on" + L, I)
						}
						if (la.add) {
							la.add.call(h, z);
							if (!z.handler.guid) z.handler.guid = m.guid
						}
						ma.push(z);
						l.event.global[L] = true
					}
					h = null
				}
			}
		},
		global: {},
		remove: function (h, k, m, p) {
			if (!(h.nodeType === 3 || h.nodeType === 8)) {
				if (m === false) m = e;
				var s, u, z = 0,
					J, I, L, T, aa, ma, la = l.hasData(h) && l._data(h),
					qa = la && la.events;
				if (la && qa) {
					if (k && k.type) {
						m = k.handler;
						k = k.type
					}
					if (!k || typeof k === "string" && k.charAt(0) === ".") {
						k = k || "";
						for (s in qa) l.event.remove(h, s + k)
					} else {
						for (k = k.split(" "); s = k[z++];) {
							T = s;
							J = s.indexOf(".") < 0;
							I = [];
							if (!J) {
								I = s.split(".");
								s = I.shift();
								L = RegExp("(^|\\.)" + l.map(I.slice(0).sort(), Za).join("\\.(?:.*\\.)?") + "(\\.|$)")
							}
							if (aa = qa[s]) if (m) {
								T = l.event.special[s] || {};
								for (u = p || 0; u < aa.length; u++) {
									ma = aa[u];
									if (m.guid === ma.guid) {
										if (J || L.test(ma.namespace)) {
											p == null && aa.splice(u--, 1);
											T.remove && T.remove.call(h, ma)
										}
										if (p != null) break
									}
								}
								if (aa.length === 0 || p != null && aa.length === 1) {
									if (!T.teardown || T.teardown.call(h, I) === false) l.removeEvent(h, s, la.handle);
									delete qa[s]
								}
							} else for (u = 0; u < aa.length; u++) {
								ma = aa[u];
								if (J || L.test(ma.namespace)) {
									l.event.remove(h, T, ma.handler, u);
									aa.splice(u--, 1)
								}
							}
						}
						if (l.isEmptyObject(qa)) {
							if (k = la.handle) k.elem = null;
							delete la.events;
							delete la.handle;
							l.isEmptyObject(la) && l.removeData(h, d, true)
						}
					}
				}
			}
		},
		trigger: function (h, k, m, p) {
			var s = h.type || h;
			if (!p) {
				h = typeof h === "object" ? h[l.expando] ? h : l.extend(l.Event(s), h) : l.Event(s);
				if (s.indexOf("!") >= 0) {
					h.type = s = s.slice(0, -1);
					h.exclusive = true
				}
				if (!m) {
					h.stopPropagation();
					l.event.global[s] && l.each(l.cache, function () {
						var aa = this[l.expando];
						aa && aa.events && aa.events[s] && l.event.trigger(h, k, aa.handle.elem)
					})
				}
				if (!m || m.nodeType === 3 || m.nodeType === 8) return d;
				h.result = d;
				h.target = m;
				k = l.makeArray(k);
				k.unshift(h)
			}
			h.currentTarget = m;
			(p = l._data(m, "handle")) && p.apply(m, k);
			p = m.parentNode || m.ownerDocument;
			try {
				if (!(m && m.nodeName && l.noData[m.nodeName.toLowerCase()])) if (m["on" + s] && m["on" + s].apply(m, k) === false) {
					h.result = false;
					h.preventDefault()
				}
			} catch (u) {}
			if (!h.isPropagationStopped() && p) l.event.trigger(h, k, p, true);
			else if (!h.isDefaultPrevented()) {
				var z;
				p = h.target;
				var J = s.replace(ua, ""),
					I = l.nodeName(p, "a") && J === "click",
					L = l.event.special[J] || {};
				if ((!L._default || L._default.call(m, h) === false) && !I && !(p && p.nodeName && l.noData[p.nodeName.toLowerCase()])) {
					try {
						if (p[J]) {
							if (z = p["on" + J]) p["on" + J] = null;
							l.event.triggered = true;
							p[J]()
						}
					} catch (T) {}
					if (z) p["on" + J] = z;
					l.event.triggered = false
				}
			}
		},
		handle: function (h) {
			var k, m, p, s;
			m = [];
			var u = l.makeArray(arguments);
			h = u[0] = l.event.fix(h || a.event);
			h.currentTarget = this;
			k = h.type.indexOf(".") < 0 && !h.exclusive;
			if (!k) {
				p = h.type.split(".");
				h.type = p.shift();
				m = p.slice(0).sort();
				p = RegExp("(^|\\.)" + m.join("\\.(?:.*\\.)?") + "(\\.|$)")
			}
			h.namespace = h.namespace || m.join(".");
			s = l._data(this, "events");
			m = (s || {})[h.type];
			if (s && m) {
				m = m.slice(0);
				s = 0;
				for (var z = m.length; s < z; s++) {
					var J = m[s];
					if (k || p.test(J.namespace)) {
						h.handler = J.handler;
						h.data = J.data;
						h.handleObj = J;
						J = J.handler.apply(this, u);
						if (J !== d) {
							h.result = J;
							if (J === false) {
								h.preventDefault();
								h.stopPropagation()
							}
						}
						if (h.isImmediatePropagationStopped()) break
					}
				}
			}
			return h.result
		},
		props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
		fix: function (h) {
			if (h[l.expando]) return h;
			var k = h;
			h = l.Event(k);
			for (var m = this.props.length, p; m;) {
				p = this.props[--m];
				h[p] = k[p]
			}
			if (!h.target) h.target = h.srcElement || M;
			if (h.target.nodeType === 3) h.target = h.target.parentNode;
			if (!h.relatedTarget && h.fromElement) h.relatedTarget = h.fromElement === h.target ? h.toElement : h.fromElement;
			if (h.pageX == null && h.clientX != null) {
				k = M.documentElement;
				m = M.body;
				h.pageX = h.clientX + (k && k.scrollLeft || m && m.scrollLeft || 0) - (k && k.clientLeft || m && m.clientLeft || 0);
				h.pageY = h.clientY + (k && k.scrollTop || m && m.scrollTop || 0) - (k && k.clientTop || m && m.clientTop || 0)
			}
			if (h.which == null && (h.charCode != null || h.keyCode != null)) h.which = h.charCode != null ? h.charCode : h.keyCode;
			if (!h.metaKey && h.ctrlKey) h.metaKey = h.ctrlKey;
			if (!h.which && h.button !== d) h.which = h.button & 1 ? 1 : h.button & 2 ? 3 : h.button & 4 ? 2 : 0;
			return h
		},
		guid: 1E8,
		proxy: l.proxy,
		special: {
			ready: {
				setup: l.bindReady,
				teardown: l.noop
			},
			live: {
				add: function (h) {
					l.event.add(this, o(h.origType, h.selector), l.extend({}, h, {
						handler: j,
						guid: h.handler.guid
					}))
				},
				remove: function (h) {
					l.event.remove(this, o(h.origType, h.selector), h)
				}
			},
			beforeunload: {
				setup: function (h, k, m) {
					if (l.isWindow(this)) this.onbeforeunload = m
				},
				teardown: function (h, k) {
					if (this.onbeforeunload === k) this.onbeforeunload = null
				}
			}
		}
	};
	l.removeEvent = M.removeEventListener ?
	function (h, k, m) {
		h.removeEventListener && h.removeEventListener(k, m, false)
	} : function (h, k, m) {
		h.detachEvent && h.detachEvent("on" + k, m)
	};
	l.Event = function (h) {
		if (!this.preventDefault) return new l.Event(h);
		if (h && h.type) {
			this.originalEvent = h;
			this.type = h.type;
			this.isDefaultPrevented = h.defaultPrevented || h.returnValue === false || h.getPreventDefault && h.getPreventDefault() ? b : e
		} else this.type = h;
		this.timeStamp = l.now();
		this[l.expando] = true
	};
	l.Event.prototype = {
		preventDefault: function () {
			this.isDefaultPrevented = b;
			var h = this.originalEvent;
			if (h) if (h.preventDefault) h.preventDefault();
			else h.returnValue = false
		},
		stopPropagation: function () {
			this.isPropagationStopped = b;
			var h = this.originalEvent;
			if (h) {
				h.stopPropagation && h.stopPropagation();
				h.cancelBubble = true
			}
		},
		stopImmediatePropagation: function () {
			this.isImmediatePropagationStopped = b;
			this.stopPropagation()
		},
		isDefaultPrevented: e,
		isPropagationStopped: e,
		isImmediatePropagationStopped: e
	};
	var Wa = function (h) {
		var k = h.relatedTarget;
		try {
			if (!(k !== M && !k.parentNode)) {
				for (; k && k !== this;) k = k.parentNode;
				if (k !== this) {
					h.type = h.data;
					l.event.handle.apply(this, arguments)
				}
			}
		} catch (m) {}
	},
		bb = function (h) {
			h.type = h.data;
			l.event.handle.apply(this, arguments)
		};
	l.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function (h, k) {
		l.event.special[h] = {
			setup: function (m) {
				l.event.add(this, k, m && m.selector ? bb : Wa, h)
			},
			teardown: function (m) {
				l.event.remove(this, k, m && m.selector ? bb : Wa)
			}
		}
	});
	if (!l.support.submitBubbles) l.event.special.submit = {
		setup: function () {
			if (this.nodeName && this.nodeName.toLowerCase() !== "form") {
				l.event.add(this, "click.specialSubmit", function (h) {
					var k = h.target,
						m = k.type;
					if ((m === "submit" || m === "image") && l(k).closest("form").length) f("submit", this, arguments)
				});
				l.event.add(this, "keypress.specialSubmit", function (h) {
					var k = h.target,
						m = k.type;
					if ((m === "text" || m === "password") && l(k).closest("form").length && h.keyCode === 13) f("submit", this, arguments)
				})
			} else return false
		},
		teardown: function () {
			l.event.remove(this, ".specialSubmit")
		}
	};
	if (!l.support.changeBubbles) {
		var Ta, Cb = function (h) {
			var k = h.type,
				m = h.value;
			if (k === "radio" || k === "checkbox") m = h.checked;
			else if (k === "select-multiple") m = h.selectedIndex > -1 ? l.map(h.options, function (p) {
				return p.selected
			}).join("-") : "";
			else if (h.nodeName.toLowerCase() === "select") m = h.selectedIndex;
			return m
		},
			ob = function (h, k) {
				var m = h.target,
					p, s;
				if (!(!Ca.test(m.nodeName) || m.readOnly)) {
					p = l._data(m, "_change_data");
					s = Cb(m);
					if (h.type !== "focusout" || m.type !== "radio") l._data(m, "_change_data", s);
					if (!(p === d || s === p)) if (p != null || s) {
						h.type = "change";
						h.liveFired = d;
						l.event.trigger(h, k, m)
					}
				}
			};
		l.event.special.change = {
			filters: {
				focusout: ob,
				beforedeactivate: ob,
				click: function (h) {
					var k = h.target,
						m = k.type;
					if (m === "radio" || m === "checkbox" || k.nodeName.toLowerCase() === "select") ob.call(this, h)
				},
				keydown: function (h) {
					var k = h.target,
						m = k.type;
					if (h.keyCode === 13 && k.nodeName.toLowerCase() !== "textarea" || h.keyCode === 32 && (m === "checkbox" || m === "radio") || m === "select-multiple") ob.call(this, h)
				},
				beforeactivate: function (h) {
					h = h.target;
					l._data(h, "_change_data", Cb(h))
				}
			},
			setup: function () {
				if (this.type === "file") return false;
				for (var h in Ta) l.event.add(this, h + ".specialChange", Ta[h]);
				return Ca.test(this.nodeName)
			},
			teardown: function () {
				l.event.remove(this, ".specialChange");
				return Ca.test(this.nodeName)
			}
		};
		Ta = l.event.special.change.filters;
		Ta.focus = Ta.beforeactivate
	}
	M.addEventListener && l.each({
		focus: "focusin",
		blur: "focusout"
	}, function (h, k) {
		function m(p) {
			p = l.event.fix(p);
			p.type = k;
			return l.event.handle.call(this, p)
		}
		l.event.special[k] = {
			setup: function () {
				this.addEventListener(h, m, true)
			},
			teardown: function () {
				this.removeEventListener(h, m, true)
			}
		}
	});
	l.each(["bind", "one"], function (h, k) {
		l.fn[k] = function (m, p, s) {
			if (typeof m === "object") {
				for (var u in m) this[k](u, p, m[u], s);
				return this
			}
			if (l.isFunction(p) || p === false) {
				s = p;
				p = d
			}
			var z = k === "one" ? l.proxy(s, function (I) {
				l(this).unbind(I, z);
				return s.apply(this, arguments)
			}) : s;
			if (m === "unload" && k !== "one") this.one(m, p, s);
			else {
				u = 0;
				for (var J = this.length; u < J; u++) l.event.add(this[u], m, z, p)
			}
			return this
		}
	});
	l.fn.extend({
		unbind: function (h, k) {
			if (typeof h === "object" && !h.preventDefault) for (var m in h) this.unbind(m, h[m]);
			else {
				m = 0;
				for (var p = this.length; m < p; m++) l.event.remove(this[m], h, k)
			}
			return this
		},
		delegate: function (h, k, m, p) {
			return this.live(k, m, p, h)
		},
		undelegate: function (h, k, m) {
			return arguments.length === 0 ? this.unbind("live") : this.die(k, null, m, h)
		},
		trigger: function (h, k) {
			return this.each(function () {
				l.event.trigger(h, k, this)
			})
		},
		triggerHandler: function (h, k) {
			if (this[0]) {
				var m = l.Event(h);
				m.preventDefault();
				m.stopPropagation();
				l.event.trigger(m, k, this[0]);
				return m.result
			}
		},
		toggle: function (h) {
			for (var k = arguments, m = 1; m < k.length;) l.proxy(h, k[m++]);
			return this.click(l.proxy(h, function (p) {
				var s = (l._data(this, "lastToggle" + h.guid) || 0) % m;
				l._data(this, "lastToggle" + h.guid, s + 1);
				p.preventDefault();
				return k[s].apply(this, arguments) || false
			}))
		},
		hover: function (h, k) {
			return this.mouseenter(h).mouseleave(k || h)
		}
	});
	var Xa = {
		focus: "focusin",
		blur: "focusout",
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	};
	l.each(["live", "die"], function (h, k) {
		l.fn[k] = function (m, p, s, u) {
			var z, J = 0,
				I, L, T = u || this.selector;
			u = u ? this : l(this.context);
			if (typeof m === "object" && !m.preventDefault) {
				for (z in m) u[k](z, p, m[z], T);
				return this
			}
			if (l.isFunction(p)) {
				s = p;
				p = d
			}
			for (m = (m || "").split(" ");
			(z = m[J++]) != null;) {
				I = ua.exec(z);
				L = "";
				if (I) {
					L = I[0];
					z = z.replace(ua, "")
				}
				if (z === "hover") m.push("mouseenter" + L, "mouseleave" + L);
				else {
					I = z;
					if (z === "focus" || z === "blur") {
						m.push(Xa[z] + L);
						z += L
					} else z = (Xa[z] || z) + L;
					if (k === "live") {
						L = 0;
						for (var aa = u.length; L < aa; L++) l.event.add(u[L], "live." + o(z, T), {
							data: p,
							selector: T,
							handler: s,
							origType: z,
							origHandler: s,
							preType: I
						})
					} else u.unbind("live." + o(z, T), s)
				}
			}
			return this
		}
	});
	l.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "), function (h, k) {
		l.fn[k] = function (m, p) {
			if (p == null) {
				p = m;
				m = null
			}
			return arguments.length > 0 ? this.bind(k, m, p) : this.trigger(k)
		};
		if (l.attrFn) l.attrFn[k] = true
	});
	(function () {
		function h(t, H, P, N, O, Q) {
			O = 0;
			for (var ca = N.length; O < ca; O++) {
				var ba = N[O];
				if (ba) {
					var na = false;
					for (ba = ba[t]; ba;) {
						if (ba.sizcache === P) {
							na = N[ba.sizset];
							break
						}
						if (ba.nodeType === 1 && !Q) {
							ba.sizcache = P;
							ba.sizset = O
						}
						if (ba.nodeName.toLowerCase() === H) {
							na = ba;
							break
						}
						ba = ba[t]
					}
					N[O] = na
				}
			}
		}
		function k(t, H, P, N, O, Q) {
			O = 0;
			for (var ca = N.length; O < ca; O++) {
				var ba = N[O];
				if (ba) {
					var na = false;
					for (ba = ba[t]; ba;) {
						if (ba.sizcache === P) {
							na = N[ba.sizset];
							break
						}
						if (ba.nodeType === 1) {
							if (!Q) {
								ba.sizcache = P;
								ba.sizset = O
							}
							if (typeof H !== "string") {
								if (ba === H) {
									na = true;
									break
								}
							} else if (L.filter(H, [ba]).length > 0) {
								na = ba;
								break
							}
						}
						ba = ba[t]
					}
					N[O] = na
				}
			}
		}
		var m = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
			p = 0,
			s = Object.prototype.toString,
			u = false,
			z = true,
			J = /\\/g,
			I = /\W/;
		[0, 0].sort(function () {
			z = false;
			return 0
		});
		var L = function (t, H, P, N) {
			P = P || [];
			var O = H = H || M;
			if (H.nodeType !== 1 && H.nodeType !== 9) return [];
			if (!t || typeof t !== "string") return P;
			var Q, ca, ba, na, La, Da = true,
				Ba = L.isXML(H),
				y = [],
				S = t;
			do {
				m.exec("");
				if (Q = m.exec(S)) {
					S = Q[3];
					y.push(Q[1]);
					if (Q[2]) {
						na = Q[3];
						break
					}
				}
			} while (Q);
			if (y.length > 1 && aa.exec(t)) if (y.length === 2 && T.relative[y[0]]) ca = Ua(y[0] + y[1], H);
			else for (ca = T.relative[y[0]] ? [H] : L(y.shift(), H); y.length;) {
				t = y.shift();
				if (T.relative[t]) t += y.shift();
				ca = Ua(t, ca)
			} else {
				if (!N && y.length > 1 && H.nodeType === 9 && !Ba && T.match.ID.test(y[0]) && !T.match.ID.test(y[y.length - 1])) {
					Q = L.find(y.shift(), H, Ba);
					H = Q.expr ? L.filter(Q.expr, Q.set)[0] : Q.set[0]
				}
				if (H) {
					Q = N ? {
						expr: y.pop(),
						set: qa(N)
					} : L.find(y.pop(), y.length === 1 && (y[0] === "~" || y[0] === "+") && H.parentNode ? H.parentNode : H, Ba);
					ca = Q.expr ? L.filter(Q.expr, Q.set) : Q.set;
					if (y.length > 0) ba = qa(ca);
					else Da = false;
					for (; y.length;) {
						Q = La = y.pop();
						if (T.relative[La]) Q = y.pop();
						else La = "";
						if (Q == null) Q = H;
						T.relative[La](ba, Q, Ba)
					}
				} else ba = []
			}
			ba || (ba = ca);
			ba || L.error(La || t);
			if (s.call(ba) === "[object Array]") if (Da) if (H && H.nodeType === 1) for (t = 0; ba[t] != null; t++) {
				if (ba[t] && (ba[t] === true || ba[t].nodeType === 1 && L.contains(H, ba[t]))) P.push(ca[t])
			} else for (t = 0; ba[t] != null; t++) ba[t] && ba[t].nodeType === 1 && P.push(ca[t]);
			else P.push.apply(P, ba);
			else qa(ba, P);
			if (na) {
				L(na, O, P, N);
				L.uniqueSort(P)
			}
			return P
		};
		L.uniqueSort = function (t) {
			if (za) {
				u = z;
				t.sort(za);
				if (u) for (var H = 1; H < t.length; H++) t[H] === t[H - 1] && t.splice(H--, 1)
			}
			return t
		};
		L.matches = function (t, H) {
			return L(t, null, null, H)
		};
		L.matchesSelector = function (t, H) {
			return L(H, null, null, [t]).length > 0
		};
		L.find = function (t, H, P) {
			var N;
			if (!t) return [];
			for (var O = 0, Q = T.order.length; O < Q; O++) {
				var ca, ba = T.order[O];
				if (ca = T.leftMatch[ba].exec(t)) {
					var na = ca[1];
					ca.splice(1, 1);
					if (na.substr(na.length - 1) !== "\\") {
						ca[1] = (ca[1] || "").replace(J, "");
						N = T.find[ba](ca, H, P);
						if (N != null) {
							t = t.replace(T.match[ba], "");
							break
						}
					}
				}
			}
			N || (N = typeof H.getElementsByTagName !== "undefined" ? H.getElementsByTagName("*") : []);
			return {
				set: N,
				expr: t
			}
		};
		L.filter = function (t, H, P, N) {
			for (var O, Q, ca = t, ba = [], na = H, La = H && H[0] && L.isXML(H[0]); t && H.length;) {
				for (var Da in T.filter) if ((O = T.leftMatch[Da].exec(t)) != null && O[2]) {
					var Ba, y, S = T.filter[Da];
					y = O[1];
					Q = false;
					O.splice(1, 1);
					if (y.substr(y.length - 1) !== "\\") {
						if (na === ba) ba = [];
						if (T.preFilter[Da]) if (O = T.preFilter[Da](O, na, P, ba, N, La)) {
							if (O === true) continue
						} else Q = Ba = true;
						if (O) for (var n = 0;
						(y = na[n]) != null; n++) if (y) {
							Ba = S(y, O, n, na);
							var r = N ^ !! Ba;
							if (P && Ba != null) if (r) Q = true;
							else na[n] = false;
							else if (r) {
								ba.push(y);
								Q = true
							}
						}
						if (Ba !== d) {
							P || (na = ba);
							t = t.replace(T.match[Da], "");
							if (!Q) return [];
							break
						}
					}
				}
				if (t === ca) if (Q == null) L.error(t);
				else break;
				ca = t
			}
			return na
		};
		L.error = function (t) {
			throw "Syntax error, unrecognized expression: " + t;
		};
		var T = L.selectors = {
			order: ["ID", "NAME", "TAG"],
			match: {
				ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
				ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
				TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
				CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
				POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
				PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			},
			leftMatch: {},
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			attrHandle: {
				href: function (t) {
					return t.getAttribute("href")
				},
				type: function (t) {
					return t.getAttribute("type")
				}
			},
			relative: {
				"+": function (t, H) {
					var P = typeof H === "string",
						N = P && !I.test(H);
					P = P && !N;
					if (N) H = H.toLowerCase();
					N = 0;
					for (var O = t.length, Q; N < O; N++) if (Q = t[N]) {
						for (;
						(Q = Q.previousSibling) && Q.nodeType !== 1;);
						t[N] = P || Q && Q.nodeName.toLowerCase() === H ? Q || false : Q === H
					}
					P && L.filter(H, t, true)
				},
				">": function (t, H) {
					var P, N = typeof H === "string",
						O = 0,
						Q = t.length;
					if (N && !I.test(H)) for (H = H.toLowerCase(); O < Q; O++) {
						if (P = t[O]) {
							P = P.parentNode;
							t[O] = P.nodeName.toLowerCase() === H ? P : false
						}
					} else {
						for (; O < Q; O++) if (P = t[O]) t[O] = N ? P.parentNode : P.parentNode === H;
						N && L.filter(H, t, true)
					}
				},
				"": function (t, H, P) {
					var N, O = p++,
						Q = k;
					if (typeof H === "string" && !I.test(H)) {
						N = H = H.toLowerCase();
						Q = h
					}
					Q("parentNode", H, O, t, N, P)
				},
				"~": function (t, H, P) {
					var N, O = p++,
						Q = k;
					if (typeof H === "string" && !I.test(H)) {
						N = H = H.toLowerCase();
						Q = h
					}
					Q("previousSibling", H, O, t, N, P)
				}
			},
			find: {
				ID: function (t, H, P) {
					if (typeof H.getElementById !== "undefined" && !P) return (t = H.getElementById(t[1])) && t.parentNode ? [t] : []
				},
				NAME: function (t, H) {
					if (typeof H.getElementsByName !== "undefined") {
						for (var P = [], N = H.getElementsByName(t[1]), O = 0, Q = N.length; O < Q; O++) N[O].getAttribute("name") === t[1] && P.push(N[O]);
						return P.length === 0 ? null : P
					}
				},
				TAG: function (t, H) {
					if (typeof H.getElementsByTagName !== "undefined") return H.getElementsByTagName(t[1])
				}
			},
			preFilter: {
				CLASS: function (t, H, P, N, O, Q) {
					t = " " + t[1].replace(J, "") + " ";
					if (Q) return t;
					Q = 0;
					for (var ca;
					(ca = H[Q]) != null; Q++) if (ca) if (O ^ (ca.className && (" " + ca.className + " ").replace(/[\t\n\r]/g, " ").indexOf(t) >= 0)) P || N.push(ca);
					else if (P) H[Q] = false;
					return false
				},
				ID: function (t) {
					return t[1].replace(J, "")
				},
				TAG: function (t) {
					return t[1].replace(J, "").toLowerCase()
				},
				CHILD: function (t) {
					if (t[1] === "nth") {
						t[2] || L.error(t[0]);
						t[2] = t[2].replace(/^\+|\s*/g, "");
						var H = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(t[2] === "even" && "2n" || t[2] === "odd" && "2n+1" || !/\D/.test(t[2]) && "0n+" + t[2] || t[2]);
						t[2] = H[1] + (H[2] || 1) - 0;
						t[3] = H[3] - 0
					} else t[2] && L.error(t[0]);
					t[0] = p++;
					return t
				},
				ATTR: function (t, H, P, N, O, Q) {
					H = t[1] = t[1].replace(J, "");
					if (!Q && T.attrMap[H]) t[1] = T.attrMap[H];
					t[4] = (t[4] || t[5] || "").replace(J, "");
					if (t[2] === "~=") t[4] = " " + t[4] + " ";
					return t
				},
				PSEUDO: function (t, H, P, N, O) {
					if (t[1] === "not") if ((m.exec(t[3]) || "").length > 1 || /^\w/.test(t[3])) t[3] = L(t[3], null, null, H);
					else {
						t = L.filter(t[3], H, P, true ^ O);
						P || N.push.apply(N, t);
						return false
					} else if (T.match.POS.test(t[0]) || T.match.CHILD.test(t[0])) return true;
					return t
				},
				POS: function (t) {
					t.unshift(true);
					return t
				}
			},
			filters: {
				enabled: function (t) {
					return t.disabled === false && t.type !== "hidden"
				},
				disabled: function (t) {
					return t.disabled === true
				},
				checked: function (t) {
					return t.checked === true
				},
				selected: function (t) {
					return t.selected === true
				},
				parent: function (t) {
					return !!t.firstChild
				},
				empty: function (t) {
					return !t.firstChild
				},
				has: function (t, H, P) {
					return !!L(P[3], t).length
				},
				header: function (t) {
					return /h\d/i.test(t.nodeName)
				},
				text: function (t) {
					return "text" === t.getAttribute("type")
				},
				radio: function (t) {
					return "radio" === t.type
				},
				checkbox: function (t) {
					return "checkbox" === t.type
				},
				file: function (t) {
					return "file" === t.type
				},
				password: function (t) {
					return "password" === t.type
				},
				submit: function (t) {
					return "submit" === t.type
				},
				image: function (t) {
					return "image" === t.type
				},
				reset: function (t) {
					return "reset" === t.type
				},
				button: function (t) {
					return "button" === t.type || t.nodeName.toLowerCase() === "button"
				},
				input: function (t) {
					return /input|select|textarea|button/i.test(t.nodeName)
				}
			},
			setFilters: {
				first: function (t, H) {
					return H === 0
				},
				last: function (t, H, P, N) {
					return H === N.length - 1
				},
				even: function (t, H) {
					return H % 2 === 0
				},
				odd: function (t, H) {
					return H % 2 === 1
				},
				lt: function (t, H, P) {
					return H < P[3] - 0
				},
				gt: function (t, H, P) {
					return H > P[3] - 0
				},
				nth: function (t, H, P) {
					return P[3] - 0 === H
				},
				eq: function (t, H, P) {
					return P[3] - 0 === H
				}
			},
			filter: {
				PSEUDO: function (t, H, P, N) {
					var O = H[1],
						Q = T.filters[O];
					if (Q) return Q(t, P, H, N);
					else if (O === "contains") return (t.textContent || t.innerText || L.getText([t]) || "").indexOf(H[3]) >= 0;
					else if (O === "not") {
						H = H[3];
						P = 0;
						for (N = H.length; P < N; P++) if (H[P] === t) return false;
						return true
					} else L.error(O)
				},
				CHILD: function (t, H) {
					var P = H[1],
						N = t;
					switch (P) {
					case "only":
					case "first":
						for (; N = N.previousSibling;) if (N.nodeType === 1) return false;
						if (P === "first") return true;
						N = t;
					case "last":
						for (; N = N.nextSibling;) if (N.nodeType === 1) return false;
						return true;
					case "nth":
						P = H[2];
						var O = H[3];
						if (P === 1 && O === 0) return true;
						var Q = H[0],
							ca = t.parentNode;
						if (ca && (ca.sizcache !== Q || !t.nodeIndex)) {
							var ba = 0;
							for (N = ca.firstChild; N; N = N.nextSibling) if (N.nodeType === 1) N.nodeIndex = ++ba;
							ca.sizcache = Q
						}
						N = t.nodeIndex - O;
						return P === 0 ? N === 0 : N % P === 0 && N / P >= 0
					}
				},
				ID: function (t, H) {
					return t.nodeType === 1 && t.getAttribute("id") === H
				},
				TAG: function (t, H) {
					return H === "*" && t.nodeType === 1 || t.nodeName.toLowerCase() === H
				},
				CLASS: function (t, H) {
					return (" " + (t.className || t.getAttribute("class")) + " ").indexOf(H) > -1
				},
				ATTR: function (t, H) {
					var P = H[1];
					P = T.attrHandle[P] ? T.attrHandle[P](t) : t[P] != null ? t[P] : t.getAttribute(P);
					var N = P + "",
						O = H[2],
						Q = H[4];
					return P == null ? O === "!=" : O === "=" ? N === Q : O === "*=" ? N.indexOf(Q) >= 0 : O === "~=" ? (" " + N + " ").indexOf(Q) >= 0 : !Q ? N && P !== false : O === "!=" ? N !== Q : O === "^=" ? N.indexOf(Q) === 0 : O === "$=" ? N.substr(N.length - Q.length) === Q : O === "|=" ? N === Q || N.substr(0, Q.length + 1) === Q + "-" : false
				},
				POS: function (t, H, P, N) {
					var O = T.setFilters[H[2]];
					if (O) return O(t, P, H, N)
				}
			}
		},
			aa = T.match.POS,
			ma = function (t, H) {
				return "\\" + (H - 0 + 1)
			};
		for (var la in T.match) {
			T.match[la] = RegExp(T.match[la].source + /(?![^\[]*\])(?![^\(]*\))/.source);
			T.leftMatch[la] = RegExp(/(^(?:.|\r|\n)*?)/.source + T.match[la].source.replace(/\\(\d+)/g, ma))
		}
		var qa = function (t, H) {
			t = Array.prototype.slice.call(t, 0);
			if (H) {
				H.push.apply(H, t);
				return H
			}
			return t
		};
		try {
			Array.prototype.slice.call(M.documentElement.childNodes, 0)
		} catch (sa) {
			qa = function (t, H) {
				var P = 0,
					N = H || [];
				if (s.call(t) === "[object Array]") Array.prototype.push.apply(N, t);
				else if (typeof t.length === "number") for (var O = t.length; P < O; P++) N.push(t[P]);
				else for (; t[P]; P++) N.push(t[P]);
				return N
			}
		}
		var za, Na;
		if (M.documentElement.compareDocumentPosition) za = function (t, H) {
			if (t === H) {
				u = true;
				return 0
			}
			if (!t.compareDocumentPosition || !H.compareDocumentPosition) return t.compareDocumentPosition ? -1 : 1;
			return t.compareDocumentPosition(H) & 4 ? -1 : 1
		};
		else {
			za = function (t, H) {
				var P, N, O = [],
					Q = [];
				P = t.parentNode;
				N = H.parentNode;
				var ca = P;
				if (t === H) {
					u = true;
					return 0
				} else if (P === N) return Na(t, H);
				else if (P) {
					if (!N) return 1
				} else return -1;
				for (; ca;) {
					O.unshift(ca);
					ca = ca.parentNode
				}
				for (ca = N; ca;) {
					Q.unshift(ca);
					ca = ca.parentNode
				}
				P = O.length;
				N = Q.length;
				for (ca = 0; ca < P && ca < N; ca++) if (O[ca] !== Q[ca]) return Na(O[ca], Q[ca]);
				return ca === P ? Na(t, Q[ca], -1) : Na(O[ca], H, 1)
			};
			Na = function (t, H, P) {
				if (t === H) return P;
				for (t = t.nextSibling; t;) {
					if (t === H) return -1;
					t = t.nextSibling
				}
				return 1
			}
		}
		L.getText = function (t) {
			for (var H = "", P, N = 0; t[N]; N++) {
				P = t[N];
				if (P.nodeType === 3 || P.nodeType === 4) H += P.nodeValue;
				else if (P.nodeType !== 8) H += L.getText(P.childNodes)
			}
			return H
		};
		(function () {
			var t = M.createElement("div"),
				H = "script" + (new Date).getTime(),
				P = M.documentElement;
			t.innerHTML = "<a name='" + H + "'/>";
			P.insertBefore(t, P.firstChild);
			if (M.getElementById(H)) {
				T.find.ID = function (N, O, Q) {
					if (typeof O.getElementById !== "undefined" && !Q) return (O = O.getElementById(N[1])) ? O.id === N[1] || typeof O.getAttributeNode !== "undefined" && O.getAttributeNode("id").nodeValue === N[1] ? [O] : d : []
				};
				T.filter.ID = function (N, O) {
					var Q = typeof N.getAttributeNode !== "undefined" && N.getAttributeNode("id");
					return N.nodeType === 1 && Q && Q.nodeValue === O
				}
			}
			P.removeChild(t);
			P = t = null
		})();
		(function () {
			var t = M.createElement("div");
			t.appendChild(M.createComment(""));
			if (t.getElementsByTagName("*").length > 0) T.find.TAG = function (H, P) {
				var N = P.getElementsByTagName(H[1]);
				if (H[1] === "*") {
					for (var O = [], Q = 0; N[Q]; Q++) N[Q].nodeType === 1 && O.push(N[Q]);
					N = O
				}
				return N
			};
			t.innerHTML = "<a href='#'></a>";
			if (t.firstChild && typeof t.firstChild.getAttribute !== "undefined" && t.firstChild.getAttribute("href") !== "#") T.attrHandle.href = function (H) {
				return H.getAttribute("href", 2)
			};
			t = null
		})();
		M.querySelectorAll &&
		function () {
			var t = L,
				H = M.createElement("div");
			H.innerHTML = "<p class='TEST'></p>";
			if (!(H.querySelectorAll && H.querySelectorAll(".TEST").length === 0)) {
				L = function (N, O, Q, ca) {
					O = O || M;
					if (!ca && !L.isXML(O)) {
						var ba = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(N);
						if (ba && (O.nodeType === 1 || O.nodeType === 9)) if (ba[1]) return qa(O.getElementsByTagName(N), Q);
						else if (ba[2] && T.find.CLASS && O.getElementsByClassName) return qa(O.getElementsByClassName(ba[2]), Q);
						if (O.nodeType === 9) {
							if (N === "body" && O.body) return qa([O.body], Q);
							else if (ba && ba[3]) {
								var na = O.getElementById(ba[3]);
								if (na && na.parentNode) {
									if (na.id === ba[3]) return qa([na], Q)
								} else return qa([], Q)
							}
							try {
								return qa(O.querySelectorAll(N), Q)
							} catch (La) {}
						} else if (O.nodeType === 1 && O.nodeName.toLowerCase() !== "object") {
							ba = O;
							var Da = (na = O.getAttribute("id")) || "__sizzle__",
								Ba = O.parentNode,
								y = /^\s*[+~]/.test(N);
							if (na) Da = Da.replace(/'/g, "\\$&");
							else O.setAttribute("id", Da);
							if (y && Ba) O = O.parentNode;
							try {
								if (!y || Ba) return qa(O.querySelectorAll("[id='" + Da + "'] " + N), Q)
							} catch (S) {} finally {
								na || ba.removeAttribute("id")
							}
						}
					}
					return t(N, O, Q, ca)
				};
				for (var P in t) L[P] = t[P];
				H = null
			}
		}();
		(function () {
			var t = M.documentElement,
				H = t.matchesSelector || t.mozMatchesSelector || t.webkitMatchesSelector || t.msMatchesSelector,
				P = false;
			try {
				H.call(M.documentElement, "[test!='']:sizzle")
			} catch (N) {
				P = true
			}
			if (H) L.matchesSelector = function (O, Q) {
				Q = Q.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
				if (!L.isXML(O)) try {
					if (P || !T.match.PSEUDO.test(Q) && !/!=/.test(Q)) return H.call(O, Q)
				} catch (ca) {}
				return L(Q, null, null, [O]).length > 0
			}
		})();
		(function () {
			var t = M.createElement("div");
			t.innerHTML = "<div class='test e'></div><div class='test'></div>";
			if (!(!t.getElementsByClassName || t.getElementsByClassName("e").length === 0)) {
				t.lastChild.className = "e";
				if (t.getElementsByClassName("e").length !== 1) {
					T.order.splice(1, 0, "CLASS");
					T.find.CLASS = function (H, P, N) {
						if (typeof P.getElementsByClassName !== "undefined" && !N) return P.getElementsByClassName(H[1])
					};
					t = null
				}
			}
		})();
		L.contains = M.documentElement.contains ?
		function (t, H) {
			return t !== H && (t.contains ? t.contains(H) : true)
		} : M.documentElement.compareDocumentPosition ?
		function (t, H) {
			return !!(t.compareDocumentPosition(H) & 16)
		} : function () {
			return false
		};
		L.isXML = function (t) {
			return (t = (t ? t.ownerDocument || t : 0).documentElement) ? t.nodeName !== "HTML" : false
		};
		var Ua = function (t, H) {
			for (var P, N = [], O = "", Q = H.nodeType ? [H] : H; P = T.match.PSEUDO.exec(t);) {
				O += P[0];
				t = t.replace(T.match.PSEUDO, "")
			}
			t = T.relative[t] ? t + "*" : t;
			P = 0;
			for (var ca = Q.length; P < ca; P++) L(t, Q[P], N);
			return L.filter(O, N)
		};
		l.find = L;
		l.expr = L.selectors;
		l.expr[":"] = l.expr.filters;
		l.unique = L.uniqueSort;
		l.text = L.getText;
		l.isXMLDoc = L.isXML;
		l.contains = L.contains
	})();
	var Ub = /Until$/,
		Vb = /^(?:parents|prevUntil|prevAll)/,
		Wb = /,/,
		Tb = /^.[^:#\[\.,]*$/,
		Xb = Array.prototype.slice,
		Yb = l.expr.match.POS,
		Zb = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
	l.fn.extend({
		find: function (h) {
			for (var k = this.pushStack("", "find", h), m = 0, p = 0, s = this.length; p < s; p++) {
				m = k.length;
				l.find(h, this[p], k);
				if (p > 0) for (var u = m; u < k.length; u++) for (var z = 0; z < m; z++) if (k[z] === k[u]) {
					k.splice(u--, 1);
					break
				}
			}
			return k
		},
		has: function (h) {
			var k = l(h);
			return this.filter(function () {
				for (var m = 0, p = k.length; m < p; m++) if (l.contains(this, k[m])) return true
			})
		},
		not: function (h) {
			return this.pushStack(q(this, h, false), "not", h)
		},
		filter: function (h) {
			return this.pushStack(q(this, h, true), "filter", h)
		},
		is: function (h) {
			return !!h && l.filter(h, this).length > 0
		},
		closest: function (h, k) {
			var m = [],
				p, s, u = this[0];
			if (l.isArray(h)) {
				var z, J = {},
					I = 1;
				if (u && h.length) {
					p = 0;
					for (s = h.length; p < s; p++) {
						z = h[p];
						J[z] || (J[z] = l.expr.match.POS.test(z) ? l(z, k || this.context) : z)
					}
					for (; u && u.ownerDocument && u !== k;) {
						for (z in J) {
							p = J[z];
							if (p.jquery ? p.index(u) > -1 : l(u).is(p)) m.push({
								selector: z,
								elem: u,
								level: I
							})
						}
						u = u.parentNode;
						I++
					}
				}
				return m
			}
			z = Yb.test(h) ? l(h, k || this.context) : null;
			p = 0;
			for (s = this.length; p < s; p++) for (u = this[p]; u;) if (z ? z.index(u) > -1 : l.find.matchesSelector(u, h)) {
				m.push(u);
				break
			} else {
				u = u.parentNode;
				if (!u || !u.ownerDocument || u === k) break
			}
			m = m.length > 1 ? l.unique(m) : m;
			return this.pushStack(m, "closest", h)
		},
		index: function (h) {
			if (!h || typeof h === "string") return l.inArray(this[0], h ? l(h) : this.parent().children());
			return l.inArray(h.jquery ? h[0] : h, this)
		},
		add: function (h, k) {
			var m = typeof h === "string" ? l(h, k) : l.makeArray(h),
				p = l.merge(this.get(), m);
			return this.pushStack(!m[0] || !m[0].parentNode || m[0].parentNode.nodeType === 11 || !p[0] || !p[0].parentNode || p[0].parentNode.nodeType === 11 ? p : l.unique(p))
		},
		andSelf: function () {
			return this.add(this.prevObject)
		}
	});
	l.each({
		parent: function (h) {
			return (h = h.parentNode) && h.nodeType !== 11 ? h : null
		},
		parents: function (h) {
			return l.dir(h, "parentNode")
		},
		parentsUntil: function (h, k, m) {
			return l.dir(h, "parentNode", m)
		},
		next: function (h) {
			return l.nth(h, 2, "nextSibling")
		},
		prev: function (h) {
			return l.nth(h, 2, "previousSibling")
		},
		nextAll: function (h) {
			return l.dir(h, "nextSibling")
		},
		prevAll: function (h) {
			return l.dir(h, "previousSibling")
		},
		nextUntil: function (h, k, m) {
			return l.dir(h, "nextSibling", m)
		},
		prevUntil: function (h, k, m) {
			return l.dir(h, "previousSibling", m)
		},
		siblings: function (h) {
			return l.sibling(h.parentNode.firstChild, h)
		},
		children: function (h) {
			return l.sibling(h.firstChild)
		},
		contents: function (h) {
			return l.nodeName(h, "iframe") ? h.contentDocument || h.contentWindow.document : l.makeArray(h.childNodes)
		}
	}, function (h, k) {
		l.fn[h] = function (m, p) {
			var s = l.map(this, k, m),
				u = Xb.call(arguments);
			Ub.test(h) || (p = m);
			if (p && typeof p === "string") s = l.filter(p, s);
			s = this.length > 1 && !Zb[h] ? l.unique(s) : s;
			if ((this.length > 1 || Wb.test(p)) && Vb.test(h)) s = s.reverse();
			return this.pushStack(s, h, u.join(","))
		}
	});
	l.extend({
		filter: function (h, k, m) {
			if (m) h = ":not(" + h + ")";
			return k.length === 1 ? l.find.matchesSelector(k[0], h) ? [k[0]] : [] : l.find.matches(h, k)
		},
		dir: function (h, k, m) {
			var p = [];
			for (h = h[k]; h && h.nodeType !== 9 && (m === d || h.nodeType !== 1 || !l(h).is(m));) {
				h.nodeType === 1 && p.push(h);
				h = h[k]
			}
			return p
		},
		nth: function (h, k, m) {
			k = k || 1;
			for (var p = 0; h; h = h[m]) if (h.nodeType === 1 && ++p === k) break;
			return h
		},
		sibling: function (h, k) {
			for (var m = []; h; h = h.nextSibling) h.nodeType === 1 && h !== k && m.push(h);
			return m
		}
	});
	var Db = / jQuery\d+="(?:\d+|null)"/g,
		pb = /^\s+/,
		Eb = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		Fb = /<([\w:]+)/,
		fb = /<tbody/i,
		Jb = /<|&#?\w+;/,
		ub = /<(?:script|object|embed|option|style)/i,
		Gb = /checked\s*(?:[^=]|=\s*.checked.)/i,
		Ja = {
			option: [1, "<select multiple='multiple'>", "</select>"],
			legend: [1, "<fieldset>", "</fieldset>"],
			thead: [1, "<table>", "</table>"],
			tr: [2, "<table><tbody>", "</tbody></table>"],
			td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
			col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
			area: [1, "<map>", "</map>"],
			_default: [0, "", ""]
		};
	Ja.optgroup = Ja.option;
	Ja.tbody = Ja.tfoot = Ja.colgroup = Ja.caption = Ja.thead;
	Ja.th = Ja.td;
	if (!l.support.htmlSerialize) Ja._default = [1, "div<div>", "</div>"];
	l.fn.extend({
		text: function (h) {
			if (l.isFunction(h)) return this.each(function (k) {
				var m = l(this);
				m.text(h.call(this, k, m.text()))
			});
			if (typeof h !== "object" && h !== d) return this.empty().append((this[0] && this[0].ownerDocument || M).createTextNode(h));
			return l.text(this)
		},
		wrapAll: function (h) {
			if (l.isFunction(h)) return this.each(function (m) {
				l(this).wrapAll(h.call(this, m))
			});
			if (this[0]) {
				var k = l(h, this[0].ownerDocument).eq(0).clone(true);
				this[0].parentNode && k.insertBefore(this[0]);
				k.map(function () {
					for (var m = this; m.firstChild && m.firstChild.nodeType === 1;) m = m.firstChild;
					return m
				}).append(this)
			}
			return this
		},
		wrapInner: function (h) {
			if (l.isFunction(h)) return this.each(function (k) {
				l(this).wrapInner(h.call(this, k))
			});
			return this.each(function () {
				var k = l(this),
					m = k.contents();
				m.length ? m.wrapAll(h) : k.append(h)
			})
		},
		wrap: function (h) {
			return this.each(function () {
				l(this).wrapAll(h)
			})
		},
		unwrap: function () {
			return this.parent().each(function () {
				l.nodeName(this, "body") || l(this).replaceWith(this.childNodes)
			}).end()
		},
		append: function () {
			return this.domManip(arguments, true, function (h) {
				this.nodeType === 1 && this.appendChild(h)
			})
		},
		prepend: function () {
			return this.domManip(arguments, true, function (h) {
				this.nodeType === 1 && this.insertBefore(h, this.firstChild)
			})
		},
		before: function () {
			if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (k) {
				this.parentNode.insertBefore(k, this)
			});
			else if (arguments.length) {
				var h = l(arguments[0]);
				h.push.apply(h, this.toArray());
				return this.pushStack(h, "before", arguments)
			}
		},
		after: function () {
			if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (k) {
				this.parentNode.insertBefore(k, this.nextSibling)
			});
			else if (arguments.length) {
				var h = this.pushStack(this, "after", arguments);
				h.push.apply(h, l(arguments[0]).toArray());
				return h
			}
		},
		remove: function (h, k) {
			for (var m = 0, p;
			(p = this[m]) != null; m++) if (!h || l.filter(h, [p]).length) {
				if (!k && p.nodeType === 1) {
					l.cleanData(p.getElementsByTagName("*"));
					l.cleanData([p])
				}
				p.parentNode && p.parentNode.removeChild(p)
			}
			return this
		},
		empty: function () {
			for (var h = 0, k;
			(k = this[h]) != null; h++) for (k.nodeType === 1 && l.cleanData(k.getElementsByTagName("*")); k.firstChild;) k.removeChild(k.firstChild);
			return this
		},
		clone: function (h, k) {
			h = h == null ? false : h;
			k = k == null ? h : k;
			return this.map(function () {
				return l.clone(this, h, k)
			})
		},
		html: function (h) {
			if (h === d) return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(Db, "") : null;
			else if (typeof h === "string" && !ub.test(h) && (l.support.leadingWhitespace || !pb.test(h)) && !Ja[(Fb.exec(h) || ["", ""])[1].toLowerCase()]) {
				h = h.replace(Eb, "<$1></$2>");
				try {
					for (var k = 0, m = this.length; k < m; k++) if (this[k].nodeType === 1) {
						l.cleanData(this[k].getElementsByTagName("*"));
						this[k].innerHTML = h
					}
				} catch (p) {
					this.empty().append(h)
				}
			} else l.isFunction(h) ? this.each(function (s) {
				var u = l(this);
				u.html(h.call(this, s, u.html()))
			}) : this.empty().append(h);
			return this
		},
		replaceWith: function (h) {
			if (this[0] && this[0].parentNode) {
				if (l.isFunction(h)) return this.each(function (k) {
					var m = l(this),
						p = m.html();
					m.replaceWith(h.call(this, k, p))
				});
				if (typeof h !== "string") h = l(h).detach();
				return this.each(function () {
					var k = this.nextSibling,
						m = this.parentNode;
					l(this).remove();
					k ? l(k).before(h) : l(m).append(h)
				})
			} else return this.pushStack(l(l.isFunction(h) ? h() : h), "replaceWith", h)
		},
		detach: function (h) {
			return this.remove(h, true)
		},
		domManip: function (h, k, m) {
			var p, s, u, z = h[0],
				J = [];
			if (!l.support.checkClone && arguments.length === 3 && typeof z === "string" && Gb.test(z)) return this.each(function () {
				l(this).domManip(h, k, m, true)
			});
			if (l.isFunction(z)) return this.each(function (T) {
				var aa = l(this);
				h[0] = z.call(this, T, k ? aa.html() : d);
				aa.domManip(h, k, m)
			});
			if (this[0]) {
				p = z && z.parentNode;
				p = l.support.parentNode && p && p.nodeType === 11 && p.childNodes.length === this.length ? {
					fragment: p
				} : l.buildFragment(h, this, J);
				u = p.fragment;
				if (s = u.childNodes.length === 1 ? u = u.firstChild : u.firstChild) {
					k = k && l.nodeName(s, "tr");
					s = 0;
					for (var I = this.length, L = I - 1; s < I; s++) m.call(k ? l.nodeName(this[s], "table") ? this[s].getElementsByTagName("tbody")[0] || this[s].appendChild(this[s].ownerDocument.createElement("tbody")) : this[s] : this[s], p.cacheable || I > 1 && s < L ? l.clone(u, true, true) : u)
				}
				J.length && l.each(J, A)
			}
			return this
		}
	});
	l.buildFragment = function (h, k, m) {
		var p, s, u;
		k = k && k[0] ? k[0].ownerDocument || k[0] : M;
		if (h.length === 1 && typeof h[0] === "string" && h[0].length < 512 && k === M && h[0].charAt(0) === "<" && !ub.test(h[0]) && (l.support.checkClone || !Gb.test(h[0]))) {
			s = true;
			if (u = l.fragments[h[0]]) if (u !== 1) p = u
		}
		if (!p) {
			p = k.createDocumentFragment();
			l.clean(h, k, p, m)
		}
		if (s) l.fragments[h[0]] = u ? p : 1;
		return {
			fragment: p,
			cacheable: s
		}
	};
	l.fragments = {};
	l.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function (h, k) {
		l.fn[h] = function (m) {
			var p = [];
			m = l(m);
			var s = this.length === 1 && this[0].parentNode;
			if (s && s.nodeType === 11 && s.childNodes.length === 1 && m.length === 1) {
				m[k](this[0]);
				return this
			} else {
				s = 0;
				for (var u = m.length; s < u; s++) {
					var z = (s > 0 ? this.clone(true) : this).get();
					l(m[s])[k](z);
					p = p.concat(z)
				}
				return this.pushStack(p, h, m.selector)
			}
		}
	});
	l.extend({
		clone: function (h, k, m) {
			var p = h.cloneNode(true),
				s, u, z;
			if ((!l.support.noCloneEvent || !l.support.noCloneChecked) && (h.nodeType === 1 || h.nodeType === 11) && !l.isXMLDoc(h)) {
				w(h, p);
				s = E(h);
				u = E(p);
				for (z = 0; s[z]; ++z) w(s[z], u[z])
			}
			if (k) {
				v(h, p);
				if (m) {
					s = E(h);
					u = E(p);
					for (z = 0; s[z]; ++z) v(s[z], u[z])
				}
			}
			return p
		},
		clean: function (h, k, m, p) {
			k = k || M;
			if (typeof k.createElement === "undefined") k = k.ownerDocument || k[0] && k[0].ownerDocument || M;
			for (var s = [], u = 0, z;
			(z = h[u]) != null; u++) {
				if (typeof z === "number") z += "";
				if (z) {
					if (typeof z === "string" && !Jb.test(z)) z = k.createTextNode(z);
					else if (typeof z === "string") {
						z = z.replace(Eb, "<$1></$2>");
						var J = (Fb.exec(z) || ["", ""])[1].toLowerCase(),
							I = Ja[J] || Ja._default,
							L = I[0],
							T = k.createElement("div");
						for (T.innerHTML = I[1] + z + I[2]; L--;) T = T.lastChild;
						if (!l.support.tbody) {
							L = fb.test(z);
							J = J === "table" && !L ? T.firstChild && T.firstChild.childNodes : I[1] === "<table>" && !L ? T.childNodes : [];
							for (I = J.length - 1; I >= 0; --I) l.nodeName(J[I], "tbody") && !J[I].childNodes.length && J[I].parentNode.removeChild(J[I])
						}!l.support.leadingWhitespace && pb.test(z) && T.insertBefore(k.createTextNode(pb.exec(z)[0]), T.firstChild);
						z = T.childNodes
					}
					if (z.nodeType) s.push(z);
					else s = l.merge(s, z)
				}
			}
			if (m) for (u = 0; s[u]; u++) if (p && l.nodeName(s[u], "script") && (!s[u].type || s[u].type.toLowerCase() === "text/javascript")) p.push(s[u].parentNode ? s[u].parentNode.removeChild(s[u]) : s[u]);
			else {
				s[u].nodeType === 1 && s.splice.apply(s, [u + 1, 0].concat(l.makeArray(s[u].getElementsByTagName("script"))));
				m.appendChild(s[u])
			}
			return s
		},
		cleanData: function (h) {
			for (var k, m, p = l.cache, s = l.expando, u = l.event.special, z = l.support.deleteExpando, J = 0, I;
			(I = h[J]) != null; J++) if (!(I.nodeName && l.noData[I.nodeName.toLowerCase()])) if (m = I[l.expando]) {
				if ((k = p[m] && p[m][s]) && k.events) {
					for (var L in k.events) u[L] ? l.event.remove(I, L) : l.removeEvent(I, L, k.handle);
					if (k.handle) k.handle.elem = null
				}
				if (z) delete I[l.expando];
				else I.removeAttribute && I.removeAttribute(l.expando);
				delete p[m]
			}
		}
	});
	var qb = /alpha\([^)]*\)/i,
		Kb = /opacity=([^)]*)/,
		Lb = /-([a-z])/ig,
		vb = /([A-Z])/g,
		wb = /^-?\d+(?:px)?$/i,
		Mb = /^-?\d/,
		Nb = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		},
		sb = ["Left", "Right"],
		ib = ["Top", "Bottom"],
		lb, cb, gb, Ob = function (h, k) {
			return k.toUpperCase()
		};
	l.fn.css = function (h, k) {
		if (arguments.length === 2 && k === d) return this;
		return l.access(this, h, k, true, function (m, p, s) {
			return s !== d ? l.style(m, p, s) : l.css(m, p)
		})
	};
	l.extend({
		cssHooks: {
			opacity: {
				get: function (h, k) {
					if (k) {
						var m = lb(h, "opacity", "opacity");
						return m === "" ? "1" : m
					} else return h.style.opacity
				}
			}
		},
		cssNumber: {
			zIndex: true,
			fontWeight: true,
			opacity: true,
			zoom: true,
			lineHeight: true
		},
		cssProps: {
			"float": l.support.cssFloat ? "cssFloat" : "styleFloat"
		},
		style: function (h, k, m, p) {
			if (!(!h || h.nodeType === 3 || h.nodeType === 8 || !h.style)) {
				var s, u = l.camelCase(k),
					z = h.style,
					J = l.cssHooks[u];
				k = l.cssProps[u] || u;
				if (m !== d) {
					if (!(typeof m === "number" && isNaN(m) || m == null)) {
						if (typeof m === "number" && !l.cssNumber[u]) m += "px";
						if (!J || !("set" in J) || (m = J.set(h, m)) !== d) try {
							z[k] = m
						} catch (I) {}
					}
				} else {
					if (J && "get" in J && (s = J.get(h, false, p)) !== d) return s;
					return z[k]
				}
			}
		},
		css: function (h, k, m) {
			var p, s = l.camelCase(k),
				u = l.cssHooks[s];
			k = l.cssProps[s] || s;
			if (u && "get" in u && (p = u.get(h, true, m)) !== d) return p;
			else if (lb) return lb(h, k, s)
		},
		swap: function (h, k, m) {
			var p = {};
			for (var s in k) {
				p[s] = h.style[s];
				h.style[s] = k[s]
			}
			m.call(h);
			for (s in k) h.style[s] = p[s]
		},
		camelCase: function (h) {
			return h.replace(Lb, Ob)
		}
	});
	l.curCSS = l.css;
	l.each(["height", "width"], function (h, k) {
		l.cssHooks[k] = {
			get: function (m, p, s) {
				var u;
				if (p) {
					if (m.offsetWidth !== 0) u = B(m, k, s);
					else l.swap(m, Nb, function () {
						u = B(m, k, s)
					});
					if (u <= 0) {
						u = lb(m, k, k);
						if (u === "0px" && gb) u = gb(m, k, k);
						if (u != null) return u === "" || u === "auto" ? "0px" : u
					}
					if (u < 0 || u == null) {
						u = m.style[k];
						return u === "" || u === "auto" ? "0px" : u
					}
					return typeof u === "string" ? u : u + "px"
				}
			},
			set: function (m, p) {
				if (wb.test(p)) {
					p = parseFloat(p);
					if (p >= 0) return p + "px"
				} else return p
			}
		}
	});
	if (!l.support.opacity) l.cssHooks.opacity = {
		get: function (h, k) {
			return Kb.test((k && h.currentStyle ? h.currentStyle.filter : h.style.filter) || "") ? parseFloat(RegExp.$1) / 100 + "" : k ? "1" : ""
		},
		set: function (h, k) {
			var m = h.style;
			m.zoom = 1;
			var p = l.isNaN(k) ? "" : "alpha(opacity=" + k * 100 + ")",
				s = m.filter || "";
			m.filter = qb.test(s) ? s.replace(qb, p) : m.filter + " " + p
		}
	};
	if (M.defaultView && M.defaultView.getComputedStyle) cb = function (h, k, m) {
		var p;
		m = m.replace(vb, "-$1").toLowerCase();
		if (!(k = h.ownerDocument.defaultView)) return d;
		if (k = k.getComputedStyle(h, null)) {
			p = k.getPropertyValue(m);
			if (p === "" && !l.contains(h.ownerDocument.documentElement, h)) p = l.style(h, m)
		}
		return p
	};
	if (M.documentElement.currentStyle) gb = function (h, k) {
		var m, p = h.currentStyle && h.currentStyle[k],
			s = h.runtimeStyle && h.runtimeStyle[k],
			u = h.style;
		if (!wb.test(p) && Mb.test(p)) {
			m = u.left;
			if (s) h.runtimeStyle.left = h.currentStyle.left;
			u.left = k === "fontSize" ? "1em" : p || 0;
			p = u.pixelLeft + "px";
			u.left = m;
			if (s) h.runtimeStyle.left = s
		}
		return p === "" ? "auto" : p
	};
	lb = cb || gb;
	if (l.expr && l.expr.filters) {
		l.expr.filters.hidden = function (h) {
			var k = h.offsetHeight;
			return h.offsetWidth === 0 && k === 0 || !l.support.reliableHiddenOffsets && (h.style.display || l.css(h, "display")) === "none"
		};
		l.expr.filters.visible = function (h) {
			return !l.expr.filters.hidden(h)
		}
	}
	var Pb = /%20/g,
		Ib = /\[\]$/,
		Hb = /\r?\n/g,
		$b = /#.*$/,
		ac = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
		bc = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
		db = /^(?:GET|HEAD)$/,
		Ka = /^\/\//,
		Ga = /\?/,
		Qb = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		xb = /^(?:select|textarea)/i,
		Va = /\s+/,
		$a = /([?&])_=[^&]*/,
		mb = /(^|\-)([a-z])/g,
		nb = function (h, k, m) {
			return k + m.toUpperCase()
		},
		rb = /^([\w\+\.\-]+:)\/\/([^\/?#:]*)(?::(\d+))?/,
		hb = l.fn.load,
		Fa = {},
		ab = {},
		Sa, Ha;
	try {
		Sa = M.location.href
	} catch (yb) {
		Sa = M.createElement("a");
		Sa.href = "";
		Sa = Sa.href
	}
	Ha = rb.exec(Sa.toLowerCase());
	l.fn.extend({
		load: function (h, k, m) {
			if (typeof h !== "string" && hb) return hb.apply(this, arguments);
			else if (!this.length) return this;
			var p = h.indexOf(" ");
			if (p >= 0) {
				var s = h.slice(p, h.length);
				h = h.slice(0, p)
			}
			p = "GET";
			if (k) if (l.isFunction(k)) {
				m = k;
				k = d
			} else if (typeof k === "object") {
				k = l.param(k, l.ajaxSettings.traditional);
				p = "POST"
			}
			var u = this;
			l.ajax({
				url: h,
				type: p,
				dataType: "html",
				data: k,
				complete: function (z, J, I) {
					I = z.responseText;
					if (z.isResolved()) {
						z.done(function (L) {
							I = L
						});
						u.html(s ? l("<div>").append(I.replace(Qb, "")).find(s) : I)
					}
					m && u.each(m, [I, J, z])
				}
			});
			return this
		},
		serialize: function () {
			return l.param(this.serializeArray())
		},
		serializeArray: function () {
			return this.map(function () {
				return this.elements ? l.makeArray(this.elements) : this
			}).filter(function () {
				return this.name && !this.disabled && (this.checked || xb.test(this.nodeName) || bc.test(this.type))
			}).map(function (h, k) {
				var m = l(this).val();
				return m == null ? null : l.isArray(m) ? l.map(m, function (p) {
					return {
						name: k.name,
						value: p.replace(Hb, "\r\n")
					}
				}) : {
					name: k.name,
					value: m.replace(Hb, "\r\n")
				}
			}).get()
		}
	});
	l.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (h, k) {
		l.fn[k] = function (m) {
			return this.bind(k, m)
		}
	});
	l.each(["get", "post"], function (h, k) {
		l[k] = function (m, p, s, u) {
			if (l.isFunction(p)) {
				u = u || s;
				s = p;
				p = d
			}
			return l.ajax({
				type: k,
				url: m,
				data: p,
				success: s,
				dataType: u
			})
		}
	});
	l.extend({
		getScript: function (h, k) {
			return l.get(h, d, k, "script")
		},
		getJSON: function (h, k, m) {
			return l.get(h, k, m, "json")
		},
		ajaxSetup: function (h, k) {
			if (k) l.extend(true, h, l.ajaxSettings, k);
			else {
				k = h;
				h = l.extend(true, l.ajaxSettings, k)
			}
			for (var m in {
				context: 1,
				url: 1
			}) if (m in k) h[m] = k[m];
			else if (m in l.ajaxSettings) h[m] = l.ajaxSettings[m];
			return h
		},
		ajaxSettings: {
			url: Sa,
			isLocal: /(?:^file|^widget|\-extension):$/.test(Ha[1]),
			global: true,
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			processData: true,
			async: true,
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				text: "text/plain",
				json: "application/json, text/javascript",
				"*": "*/*"
			},
			contents: {
				xml: /xml/,
				html: /html/,
				json: /json/
			},
			responseFields: {
				xml: "responseXML",
				text: "responseText"
			},
			converters: {
				"* text": a.String,
				"text html": true,
				"text json": l.parseJSON,
				"text xml": l.parseXML
			}
		},
		ajaxPrefilter: G(Fa),
		ajaxTransport: G(ab),
		ajax: function (h, k) {
			function m(N, O, Q, ca) {
				if (za !== 2) {
					za = 2;
					qa && clearTimeout(qa);
					la = d;
					aa = ca || "";
					t.readyState = N ? 4 : 0;
					var ba, na, La;
					if (Q) {
						ca = p;
						var Da = t,
							Ba = ca.contents,
							y = ca.dataTypes,
							S = ca.responseFields,
							n, r, C, K;
						for (r in S) if (r in Q) Da[S[r]] = Q[r];
						for (; y[0] === "*";) {
							y.shift();
							if (n === d) n = ca.mimeType || Da.getResponseHeader("content-type")
						}
						if (n) for (r in Ba) if (Ba[r] && Ba[r].test(n)) {
							y.unshift(r);
							break
						}
						if (y[0] in Q) C = y[0];
						else {
							for (r in Q) {
								if (!y[0] || ca.converters[r + " " + y[0]]) {
									C = r;
									break
								}
								K || (K = r)
							}
							C = C || K
						}
						if (C) {
							C !== y[0] && y.unshift(C);
							Q = Q[C]
						} else Q = void 0
					} else Q = d;
					Q = Q;
					if (N >= 200 && N < 300 || N === 304) {
						if (p.ifModified) {
							if (n = t.getResponseHeader("Last-Modified")) l.lastModified[L] = n;
							if (n = t.getResponseHeader("Etag")) l.etag[L] = n
						}
						if (N === 304) {
							O = "notmodified";
							ba = true
						} else try {
							n = p;
							Q = Q;
							if (n.dataFilter) Q = n.dataFilter(Q, n.dataType);
							var V = n.dataTypes;
							r = {};
							var Z, fa, Oa = V.length,
								Ia, Aa = V[0],
								Ma, wa, va, oa, Ea;
							for (Z = 1; Z < Oa; Z++) {
								if (Z === 1) for (fa in n.converters) if (typeof fa === "string") r[fa.toLowerCase()] = n.converters[fa];
								Ma = Aa;
								Aa = V[Z];
								if (Aa === "*") Aa = Ma;
								else if (Ma !== "*" && Ma !== Aa) {
									wa = Ma + " " + Aa;
									va = r[wa] || r["* " + Aa];
									if (!va) {
										Ea = d;
										for (oa in r) {
											Ia = oa.split(" ");
											if (Ia[0] === Ma || Ia[0] === "*") if (Ea = r[Ia[1] + " " + Aa]) {
												oa = r[oa];
												if (oa === true) va = Ea;
												else if (Ea === true) va = oa;
												break
											}
										}
									}
									va || Ea || l.error("No conversion from " + wa.replace(" ", " to "));
									if (va !== true) Q = va ? va(Q) : Ea(oa(Q))
								}
							}
							na = Q;
							O = "success";
							ba = true
						} catch (zb) {
							O = "parsererror";
							La = zb
						}
					} else {
						La = O;
						if (!O || N) {
							O = "error";
							if (N < 0) N = 0
						}
					}
					t.status = N;
					t.statusText = O;
					ba ? z.resolveWith(s, [na, O, t]) : z.rejectWith(s, [t, O, La]);
					t.statusCode(I);
					I = d;
					if (Na) u.trigger("ajax" + (ba ? "Success" : "Error"), [t, p, ba ? na : La]);
					J.resolveWith(s, [t, O]);
					if (Na) {
						u.trigger("ajaxComplete", [t, p]);
						--l.active || l.event.trigger("ajaxStop")
					}
				}
			}
			if (typeof h === "object") {
				k = h;
				h = d
			}
			k = k || {};
			var p = l.ajaxSetup({}, k),
				s = p.context || p,
				u = s !== p && (s.nodeType || s instanceof l) ? l(s) : l.event,
				z = l.Deferred(),
				J = l._Deferred(),
				I = p.statusCode || {},
				L, T = {},
				aa, ma, la, qa, sa, za = 0,
				Na, Ua, t = {
					readyState: 0,
					setRequestHeader: function (N, O) {
						za || (T[N.toLowerCase().replace(mb, nb)] = O);
						return this
					},
					getAllResponseHeaders: function () {
						return za === 2 ? aa : null
					},
					getResponseHeader: function (N) {
						var O;
						if (za === 2) {
							if (!ma) for (ma = {}; O = ac.exec(aa);) ma[O[1].toLowerCase()] = O[2];
							O = ma[N.toLowerCase()]
						}
						return O === d ? null : O
					},
					overrideMimeType: function (N) {
						if (!za) p.mimeType = N;
						return this
					},
					abort: function (N) {
						N = N || "abort";
						la && la.abort(N);
						m(0, N);
						return this
					}
				};
			z.promise(t);
			t.success = t.done;
			t.error = t.fail;
			t.complete = J.done;
			t.statusCode = function (N) {
				if (N) {
					var O;
					if (za < 2) for (O in N) I[O] = [I[O], N[O]];
					else {
						O = N[t.status];
						t.then(O, O)
					}
				}
				return this
			};
			p.url = ((h || p.url) + "").replace($b, "").replace(Ka, Ha[1] + "//");
			p.dataTypes = l.trim(p.dataType || "*").toLowerCase().split(Va);
			if (!p.crossDomain) {
				sa = rb.exec(p.url.toLowerCase());
				p.crossDomain = !! (sa && (sa[1] != Ha[1] || sa[2] != Ha[2] || (sa[3] || (sa[1] === "http:" ? 80 : 443)) != (Ha[3] || (Ha[1] === "http:" ? 80 : 443))))
			}
			if (p.data && p.processData && typeof p.data !== "string") p.data = l.param(p.data, p.traditional);
			x(Fa, p, k, t);
			if (za === 2) return false;
			Na = p.global;
			p.type = p.type.toUpperCase();
			p.hasContent = !db.test(p.type);
			Na && l.active++ === 0 && l.event.trigger("ajaxStart");
			if (!p.hasContent) {
				if (p.data) p.url += (Ga.test(p.url) ? "&" : "?") + p.data;
				L = p.url;
				if (p.cache === false) {
					sa = l.now();
					var H = p.url.replace($a, "$1_=" + sa);
					p.url = H + (H === p.url ? (Ga.test(p.url) ? "&" : "?") + "_=" + sa : "")
				}
			}
			if (p.data && p.hasContent && p.contentType !== false || k.contentType) T["Content-Type"] = p.contentType;
			if (p.ifModified) {
				L = L || p.url;
				if (l.lastModified[L]) T["If-Modified-Since"] = l.lastModified[L];
				if (l.etag[L]) T["If-None-Match"] = l.etag[L]
			}
			T.Accept = p.dataTypes[0] && p.accepts[p.dataTypes[0]] ? p.accepts[p.dataTypes[0]] + (p.dataTypes[0] !== "*" ? ", */*; q=0.01" : "") : p.accepts["*"];
			for (Ua in p.headers) t.setRequestHeader(Ua, p.headers[Ua]);
			if (p.beforeSend && (p.beforeSend.call(s, t, p) === false || za === 2)) {
				t.abort();
				return false
			}
			for (Ua in {
				success: 1,
				error: 1,
				complete: 1
			}) t[Ua](p[Ua]);
			if (la = x(ab, p, k, t)) {
				t.readyState = 1;
				Na && u.trigger("ajaxSend", [t, p]);
				if (p.async && p.timeout > 0) qa = setTimeout(function () {
					t.abort("timeout")
				}, p.timeout);
				try {
					za = 1;
					la.send(T, m)
				} catch (P) {
					status < 2 ? m(-1, P) : l.error(P)
				}
			} else m(-1, "No Transport");
			return t
		},
		param: function (h, k) {
			var m = [],
				p = function (u, z) {
					z = l.isFunction(z) ? z() : z;
					m[m.length] = encodeURIComponent(u) + "=" + encodeURIComponent(z)
				};
			if (k === d) k = l.ajaxSettings.traditional;
			if (l.isArray(h) || h.jquery && !l.isPlainObject(h)) l.each(h, function () {
				p(this.name, this.value)
			});
			else for (var s in h) D(s, h[s], k, p);
			return m.join("&").replace(Pb, "+")
		}
	});
	l.extend({
		active: 0,
		lastModified: {},
		etag: {}
	});
	var ka = l.now(),
		Ya = /(\=)\?(&|$)|()\?\?()/i;
	l.ajaxSetup({
		jsonp: "callback",
		jsonpCallback: function () {
			return l.expando + "_" + ka++
		}
	});
	l.ajaxPrefilter("json jsonp", function (h, k, m) {
		var p = typeof h.data === "string";
		if (h.dataTypes[0] === "jsonp" || k.jsonpCallback || k.jsonp != null || h.jsonp !== false && (Ya.test(h.url) || p && Ya.test(h.data))) {
			var s, u = h.jsonpCallback = l.isFunction(h.jsonpCallback) ? h.jsonpCallback() : h.jsonpCallback,
				z = a[u];
			k = h.url;
			var J = h.data,
				I = "$1" + u + "$2",
				L = function () {
					a[u] = z;
					s && l.isFunction(z) && a[u](s[0])
				};
			if (h.jsonp !== false) {
				k = k.replace(Ya, I);
				if (h.url === k) {
					if (p) J = J.replace(Ya, I);
					if (h.data === J) k += (/\?/.test(k) ? "&" : "?") + h.jsonp + "=" + u
				}
			}
			h.url = k;
			h.data = J;
			a[u] = function (T) {
				s = [T]
			};
			m.then(L, L);
			h.converters["script json"] = function () {
				s || l.error(u + " was not called");
				return s[0]
			};
			h.dataTypes[0] = "json";
			return "script"
		}
	});
	l.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /javascript|ecmascript/
		},
		converters: {
			"text script": function (h) {
				l.globalEval(h);
				return h
			}
		}
	});
	l.ajaxPrefilter("script", function (h) {
		if (h.cache === d) h.cache = false;
		if (h.crossDomain) {
			h.type = "GET";
			h.global = false
		}
	});
	l.ajaxTransport("script", function (h) {
		if (h.crossDomain) {
			var k, m = M.head || M.getElementsByTagName("head")[0] || M.documentElement;
			return {
				send: function (p, s) {
					k = M.createElement("script");
					k.async = "async";
					if (h.scriptCharset) k.charset = h.scriptCharset;
					k.src = h.url;
					k.onload = k.onreadystatechange = function (u, z) {
						if (!k.readyState || /loaded|complete/.test(k.readyState)) {
							k.onload = k.onreadystatechange = null;
							m && k.parentNode && m.removeChild(k);
							k = d;
							z || s(200, "success")
						}
					};
					m.insertBefore(k, m.firstChild)
				},
				abort: function () {
					k && k.onload(0, 1)
				}
			}
		}
	});
	var Pa = l.now(),
		Ra;
	l.ajaxSettings.xhr = a.ActiveXObject ?
	function () {
		var h;
		if (!(h = !this.isLocal && R())) a: {
			try {
				h = new a.ActiveXObject("Microsoft.XMLHTTP");
				break a
			} catch (k) {}
			h = void 0
		}
		return h
	} : R;
	cb = l.ajaxSettings.xhr();
	l.support.ajax = !! cb;
	l.support.cors = cb && "withCredentials" in cb;
	cb = d;
	l.support.ajax && l.ajaxTransport(function (h) {
		if (!h.crossDomain || l.support.cors) {
			var k;
			return {
				send: function (m, p) {
					var s = h.xhr(),
						u, z;
					h.username ? s.open(h.type, h.url, h.async, h.username, h.password) : s.open(h.type, h.url, h.async);
					if (h.xhrFields) for (z in h.xhrFields) s[z] = h.xhrFields[z];
					h.mimeType && s.overrideMimeType && s.overrideMimeType(h.mimeType);
					if (!(h.crossDomain && !h.hasContent) && !m["X-Requested-With"]) m["X-Requested-With"] = "XMLHttpRequest";
					try {
						for (z in m) s.setRequestHeader(z, m[z])
					} catch (J) {}
					s.send(h.hasContent && h.data || null);
					k = function (I, L) {
						var T, aa, ma, la, qa;
						try {
							if (k && (L || s.readyState === 4)) {
								k = d;
								if (u) {
									s.onreadystatechange = l.noop;
									delete Ra[u]
								}
								if (L) s.readyState !== 4 && s.abort();
								else {
									T = s.status;
									ma = s.getAllResponseHeaders();
									la = {};
									if ((qa = s.responseXML) && qa.documentElement) la.xml = qa;
									la.text = s.responseText;
									try {
										aa = s.statusText
									} catch (sa) {
										aa = ""
									}
									if (!T && h.isLocal && !h.crossDomain) T = la.text ? 200 : 404;
									else if (T === 1223) T = 204
								}
							}
						} catch (za) {
							L || p(-1, za)
						}
						la && p(T, aa, la, ma)
					};
					if (!h.async || s.readyState === 4) k();
					else {
						if (!Ra) {
							Ra = {};
							F()
						}
						u = Pa++;
						s.onreadystatechange = Ra[u] = k
					}
				},
				abort: function () {
					k && k(0, 1)
				}
			}
		}
	});
	var tb = {},
		pa = /^(?:toggle|show|hide)$/,
		ya = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
		Qa, jb = [
			["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
			["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
			["opacity"]
		];
	l.fn.extend({
		show: function (h, k, m) {
			if (h || h === 0) return this.animate(X("show", 3), h, k, m);
			else {
				m = 0;
				for (var p = this.length; m < p; m++) {
					h = this[m];
					k = h.style.display;
					if (!l._data(h, "olddisplay") && k === "none") k = h.style.display = "";
					k === "" && l.css(h, "display") === "none" && l._data(h, "olddisplay", ea(h.nodeName))
				}
				for (m = 0; m < p; m++) {
					h = this[m];
					k = h.style.display;
					if (k === "" || k === "none") h.style.display = l._data(h, "olddisplay") || ""
				}
				return this
			}
		},
		hide: function (h, k, m) {
			if (h || h === 0) return this.animate(X("hide", 3), h, k, m);
			else {
				h = 0;
				for (k = this.length; h < k; h++) {
					m = l.css(this[h], "display");
					m !== "none" && !l._data(this[h], "olddisplay") && l._data(this[h], "olddisplay", m)
				}
				for (h = 0; h < k; h++) this[h].style.display = "none";
				return this
			}
		},
		_toggle: l.fn.toggle,
		toggle: function (h, k, m) {
			var p = typeof h === "boolean";
			if (l.isFunction(h) && l.isFunction(k)) this._toggle.apply(this, arguments);
			else h == null || p ? this.each(function () {
				var s = p ? h : l(this).is(":hidden");
				l(this)[s ? "show" : "hide"]()
			}) : this.animate(X("toggle", 3), h, k, m);
			return this
		},
		fadeTo: function (h, k, m, p) {
			return this.filter(":hidden").css("opacity", 0).show().end().animate({
				opacity: k
			}, h, m, p)
		},
		animate: function (h, k, m, p) {
			var s = l.speed(k, m, p);
			if (l.isEmptyObject(h)) return this.each(s.complete);
			return this[s.queue === false ? "each" : "queue"](function () {
				var u = l.extend({}, s),
					z, J = this.nodeType === 1,
					I = J && l(this).is(":hidden"),
					L = this;
				for (z in h) {
					var T = l.camelCase(z);
					if (z !== T) {
						h[T] = h[z];
						delete h[z];
						z = T
					}
					if (h[z] === "hide" && I || h[z] === "show" && !I) return u.complete.call(this);
					if (J && (z === "height" || z === "width")) {
						u.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];
						if (l.css(this, "display") === "inline" && l.css(this, "float") === "none") if (l.support.inlineBlockNeedsLayout) if (ea(this.nodeName) === "inline") this.style.display = "inline-block";
						else {
							this.style.display = "inline";
							this.style.zoom = 1
						} else this.style.display = "inline-block"
					}
					if (l.isArray(h[z])) {
						(u.specialEasing = u.specialEasing || {})[z] = h[z][1];
						h[z] = h[z][0]
					}
				}
				if (u.overflow != null) this.style.overflow = "hidden";
				u.curAnim = l.extend({}, h);
				l.each(h, function (aa, ma) {
					var la = new l.fx(L, u, aa);
					if (pa.test(ma)) la[ma === "toggle" ? I ? "show" : "hide" : ma](h);
					else {
						var qa = ya.exec(ma),
							sa = la.cur();
						if (qa) {
							var za = parseFloat(qa[2]),
								Na = qa[3] || (l.cssNumber[aa] ? "" : "px");
							if (Na !== "px") {
								l.style(L, aa, (za || 1) + Na);
								sa = (za || 1) / la.cur() * sa;
								l.style(L, aa, sa + Na)
							}
							if (qa[1]) za = (qa[1] === "-=" ? -1 : 1) * za + sa;
							la.custom(sa, za, Na)
						} else la.custom(sa, ma, "")
					}
				});
				return true
			})
		},
		stop: function (h, k) {
			var m = l.timers;
			h && this.queue([]);
			this.each(function () {
				for (var p = m.length - 1; p >= 0; p--) if (m[p].elem === this) {
					k && m[p](true);
					m.splice(p, 1)
				}
			});
			k || this.dequeue();
			return this
		}
	});
	l.each({
		slideDown: X("show", 1),
		slideUp: X("hide", 1),
		slideToggle: X("toggle", 1),
		fadeIn: {
			opacity: "show"
		},
		fadeOut: {
			opacity: "hide"
		},
		fadeToggle: {
			opacity: "toggle"
		}
	}, function (h, k) {
		l.fn[h] = function (m, p, s) {
			return this.animate(k, m, p, s)
		}
	});
	l.extend({
		speed: function (h, k, m) {
			var p = h && typeof h === "object" ? l.extend({}, h) : {
				complete: m || !m && k || l.isFunction(h) && h,
				duration: h,
				easing: m && k || k && !l.isFunction(k) && k
			};
			p.duration = l.fx.off ? 0 : typeof p.duration === "number" ? p.duration : p.duration in l.fx.speeds ? l.fx.speeds[p.duration] : l.fx.speeds._default;
			p.old = p.complete;
			p.complete = function () {
				p.queue !== false && l(this).dequeue();
				l.isFunction(p.old) && p.old.call(this)
			};
			return p
		},
		easing: {
			linear: function (h, k, m, p) {
				return m + p * h
			},
			swing: function (h, k, m, p) {
				return (-Math.cos(h * Math.PI) / 2 + 0.5) * p + m
			}
		},
		timers: [],
		fx: function (h, k, m) {
			this.options = k;
			this.elem = h;
			this.prop = m;
			if (!k.orig) k.orig = {}
		}
	});
	l.fx.prototype = {
		update: function () {
			this.options.step && this.options.step.call(this.elem, this.now, this);
			(l.fx.step[this.prop] || l.fx.step._default)(this)
		},
		cur: function () {
			if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) return this.elem[this.prop];
			var h, k = l.css(this.elem, this.prop);
			return isNaN(h = parseFloat(k)) ? !k || k === "auto" ? 0 : k : h
		},
		custom: function (h, k, m) {
			function p(z) {
				return s.step(z)
			}
			var s = this,
				u = l.fx;
			this.startTime = l.now();
			this.start = h;
			this.end = k;
			this.unit = m || this.unit || (l.cssNumber[this.prop] ? "" : "px");
			this.now = this.start;
			this.pos = this.state = 0;
			p.elem = this.elem;
			if (p() && l.timers.push(p) && !Qa) Qa = setInterval(u.tick, u.interval)
		},
		show: function () {
			this.options.orig[this.prop] = l.style(this.elem, this.prop);
			this.options.show = true;
			this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
			l(this.elem).show()
		},
		hide: function () {
			this.options.orig[this.prop] = l.style(this.elem, this.prop);
			this.options.hide = true;
			this.custom(this.cur(), 0)
		},
		step: function (h) {
			var k = l.now(),
				m = true;
			if (h || k >= this.options.duration + this.startTime) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();
				this.options.curAnim[this.prop] = true;
				for (var p in this.options.curAnim) if (this.options.curAnim[p] !== true) m = false;
				if (m) {
					if (this.options.overflow != null && !l.support.shrinkWrapBlocks) {
						var s = this.elem,
							u = this.options;
						l.each(["", "X", "Y"], function (J, I) {
							s.style["overflow" + I] = u.overflow[J]
						})
					}
					this.options.hide && l(this.elem).hide();
					if (this.options.hide || this.options.show) for (var z in this.options.curAnim) l.style(this.elem, z, this.options.orig[z]);
					this.options.complete.call(this.elem)
				}
				return false
			} else {
				h = k - this.startTime;
				this.state = h / this.options.duration;
				k = this.options.easing || (l.easing.swing ? "swing" : "linear");
				this.pos = l.easing[this.options.specialEasing && this.options.specialEasing[this.prop] || k](this.state, h, 0, 1, this.options.duration);
				this.now = this.start + (this.end - this.start) * this.pos;
				this.update()
			}
			return true
		}
	};
	l.extend(l.fx, {
		tick: function () {
			for (var h = l.timers, k = 0; k < h.length; k++) h[k]() || h.splice(k--, 1);
			h.length || l.fx.stop()
		},
		interval: 13,
		stop: function () {
			clearInterval(Qa);
			Qa = null
		},
		speeds: {
			slow: 600,
			fast: 200,
			_default: 400
		},
		step: {
			opacity: function (h) {
				l.style(h.elem, "opacity", h.now)
			},
			_default: function (h) {
				if (h.elem.style && h.elem.style[h.prop] != null) h.elem.style[h.prop] = (h.prop === "width" || h.prop === "height" ? Math.max(0, h.now) : h.now) + h.unit;
				else h.elem[h.prop] = h.now
			}
		}
	});
	if (l.expr && l.expr.filters) l.expr.filters.animated = function (h) {
		return l.grep(l.timers, function (k) {
			return h === k.elem
		}).length
	};
	var Rb = /^t(?:able|d|h)$/i,
		Ab = /^(?:body|html)$/i;
	l.fn.offset = "getBoundingClientRect" in M.documentElement ?
	function (h) {
		var k = this[0],
			m;
		if (h) return this.each(function (z) {
			l.offset.setOffset(this, h, z)
		});
		if (!k || !k.ownerDocument) return null;
		if (k === k.ownerDocument.body) return l.offset.bodyOffset(k);
		try {
			m = k.getBoundingClientRect()
		} catch (p) {}
		var s = k.ownerDocument,
			u = s.documentElement;
		if (!m || !l.contains(u, k)) return m ? {
			top: m.top,
			left: m.left
		} : {
			top: 0,
			left: 0
		};
		k = s.body;
		s = W(s);
		return {
			top: m.top + (s.pageYOffset || l.support.boxModel && u.scrollTop || k.scrollTop) - (u.clientTop || k.clientTop || 0),
			left: m.left + (s.pageXOffset || l.support.boxModel && u.scrollLeft || k.scrollLeft) - (u.clientLeft || k.clientLeft || 0)
		}
	} : function (h) {
		var k = this[0];
		if (h) return this.each(function (T) {
			l.offset.setOffset(this, h, T)
		});
		if (!k || !k.ownerDocument) return null;
		if (k === k.ownerDocument.body) return l.offset.bodyOffset(k);
		l.offset.initialize();
		var m, p = k.offsetParent,
			s = k,
			u = k.ownerDocument,
			z = u.documentElement,
			J = u.body;
		m = (u = u.defaultView) ? u.getComputedStyle(k, null) : k.currentStyle;
		for (var I = k.offsetTop, L = k.offsetLeft;
		(k = k.parentNode) && k !== J && k !== z;) {
			if (l.offset.supportsFixedPosition && m.position === "fixed") break;
			m = u ? u.getComputedStyle(k, null) : k.currentStyle;
			I -= k.scrollTop;
			L -= k.scrollLeft;
			if (k === p) {
				I += k.offsetTop;
				L += k.offsetLeft;
				if (l.offset.doesNotAddBorder && !(l.offset.doesAddBorderForTableAndCells && Rb.test(k.nodeName))) {
					I += parseFloat(m.borderTopWidth) || 0;
					L += parseFloat(m.borderLeftWidth) || 0
				}
				s = p;
				p = k.offsetParent
			}
			if (l.offset.subtractsBorderForOverflowNotVisible && m.overflow !== "visible") {
				I += parseFloat(m.borderTopWidth) || 0;
				L += parseFloat(m.borderLeftWidth) || 0
			}
			m = m
		}
		if (m.position === "relative" || m.position === "static") {
			I += J.offsetTop;
			L += J.offsetLeft
		}
		if (l.offset.supportsFixedPosition && m.position === "fixed") {
			I += Math.max(z.scrollTop, J.scrollTop);
			L += Math.max(z.scrollLeft, J.scrollLeft)
		}
		return {
			top: I,
			left: L
		}
	};
	l.offset = {
		initialize: function () {
			var h = M.body,
				k = M.createElement("div"),
				m, p, s, u = parseFloat(l.css(h, "marginTop")) || 0;
			l.extend(k.style, {
				position: "absolute",
				top: 0,
				left: 0,
				margin: 0,
				border: 0,
				width: "1px",
				height: "1px",
				visibility: "hidden"
			});
			k.innerHTML = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
			h.insertBefore(k, h.firstChild);
			m = k.firstChild;
			p = m.firstChild;
			s = m.nextSibling.firstChild.firstChild;
			this.doesNotAddBorder = p.offsetTop !== 5;
			this.doesAddBorderForTableAndCells = s.offsetTop === 5;
			p.style.position = "fixed";
			p.style.top = "20px";
			this.supportsFixedPosition = p.offsetTop === 20 || p.offsetTop === 15;
			p.style.position = p.style.top = "";
			m.style.overflow = "hidden";
			m.style.position = "relative";
			this.subtractsBorderForOverflowNotVisible = p.offsetTop === -5;
			this.doesNotIncludeMarginInBodyOffset = h.offsetTop !== u;
			h.removeChild(k);
			l.offset.initialize = l.noop
		},
		bodyOffset: function (h) {
			var k = h.offsetTop,
				m = h.offsetLeft;
			l.offset.initialize();
			if (l.offset.doesNotIncludeMarginInBodyOffset) {
				k += parseFloat(l.css(h, "marginTop")) || 0;
				m += parseFloat(l.css(h, "marginLeft")) || 0
			}
			return {
				top: k,
				left: m
			}
		},
		setOffset: function (h, k, m) {
			var p = l.css(h, "position");
			if (p === "static") h.style.position = "relative";
			var s = l(h),
				u = s.offset(),
				z = l.css(h, "top"),
				J = l.css(h, "left"),
				I = p === "absolute" && l.inArray("auto", [z, J]) > -1;
			p = {};
			var L = {};
			if (I) L = s.position();
			z = I ? L.top : parseInt(z, 10) || 0;
			J = I ? L.left : parseInt(J, 10) || 0;
			if (l.isFunction(k)) k = k.call(h, m, u);
			if (k.top != null) p.top = k.top - u.top + z;
			if (k.left != null) p.left = k.left - u.left + J;
			"using" in k ? k.using.call(h, p) : s.css(p)
		}
	};
	l.fn.extend({
		position: function () {
			if (!this[0]) return null;
			var h = this[0],
				k = this.offsetParent(),
				m = this.offset(),
				p = Ab.test(k[0].nodeName) ? {
					top: 0,
					left: 0
				} : k.offset();
			m.top -= parseFloat(l.css(h, "marginTop")) || 0;
			m.left -= parseFloat(l.css(h, "marginLeft")) || 0;
			p.top += parseFloat(l.css(k[0], "borderTopWidth")) || 0;
			p.left += parseFloat(l.css(k[0], "borderLeftWidth")) || 0;
			return {
				top: m.top - p.top,
				left: m.left - p.left
			}
		},
		offsetParent: function () {
			return this.map(function () {
				for (var h = this.offsetParent || M.body; h && !Ab.test(h.nodeName) && l.css(h, "position") === "static";) h = h.offsetParent;
				return h
			})
		}
	});
	l.each(["Left", "Top"], function (h, k) {
		var m = "scroll" + k;
		l.fn[m] = function (p) {
			var s = this[0],
				u;
			if (!s) return null;
			if (p !== d) return this.each(function () {
				if (u = W(this)) u.scrollTo(!h ? p : l(u).scrollLeft(), h ? p : l(u).scrollTop());
				else this[m] = p
			});
			else return (u = W(s)) ? "pageXOffset" in u ? u[h ? "pageYOffset" : "pageXOffset"] : l.support.boxModel && u.document.documentElement[m] || u.document.body[m] : s[m]
		}
	});
	l.each(["Height", "Width"], function (h, k) {
		var m = k.toLowerCase();
		l.fn["inner" + k] = function () {
			return this[0] ? parseFloat(l.css(this[0], m, "padding")) : null
		};
		l.fn["outer" + k] = function (p) {
			return this[0] ? parseFloat(l.css(this[0], m, p ? "margin" : "border")) : null
		};
		l.fn[m] = function (p) {
			var s = this[0];
			if (!s) return p == null ? null : this;
			if (l.isFunction(p)) return this.each(function (z) {
				var J = l(this);
				J[m](p.call(this, z, J[m]()))
			});
			if (l.isWindow(s)) {
				var u = s.document.documentElement["client" + k];
				return s.document.compatMode === "CSS1Compat" && u || s.document.body["client" + k] || u
			} else if (s.nodeType === 9) return Math.max(s.documentElement["client" + k], s.body["scroll" + k], s.documentElement["scroll" + k], s.body["offset" + k], s.documentElement["offset" + k]);
			else if (p === d) {
				s = l.css(s, m);
				u = parseFloat(s);
				return l.isNaN(u) ? s : u
			} else return this.css(m, typeof p === "string" ? p : p + "px")
		}
	});
	a.jQuery = a.$ = l
})(window);
(function (a) {
	var d = false,
		g = /xyz/.test(function () {}) ? /\b_super\b/ : /.*/,
		c = function (e, b, f) {
			f = f || e;
			for (var j in e) f[j] = typeof e[j] == "function" && typeof b[j] == "function" && g.test(e[j]) ?
			function (o, q) {
				return function () {
					var v = this._super,
						w;
					this._super = b[o];
					w = q.apply(this, arguments);
					this._super = v;
					return w
				}
			}(j, e[j]) : e[j]
		};
	jQuery.Class = function () {
		arguments.length && this.extend.apply(this, arguments)
	};
	a.extend(a.Class, {
		callback: function (e) {
			var b = jQuery.makeArray(arguments),
				f;
			e = b.shift();
			jQuery.isArray(e) || (e = [e]);
			f = this;
			return function () {
				for (var j = b.concat(jQuery.makeArray(arguments)), o, q = e.length, v = 0, w; v < q; v++) if (w = e[v]) {
					if ((o = typeof w == "string") && f._set_called) f.called = w;
					j = (o ? f[w] : w).apply(f, j || []);
					if (v < q - 1) j = !jQuery.isArray(j) || j._use_call ? [j] : j
				}
				return j
			}
		},
		getObject: function (e, b) {
			b = b || window;
			for (var f = e ? e.split(/\./) : [], j = 0; j < f.length; j++) b = b[f[j]] || (b[f[j]] = {});
			return b
		},
		newInstance: function () {
			var e = this.rawInstance(),
				b;
			if (e.setup) b = e.setup.apply(e, arguments);
			if (e.init) e.init.apply(e, a.isArray(b) ? b : arguments);
			return e
		},
		setup: function (e) {
			this.defaults = a.extend(true, {}, e.defaults, this.defaults);
			return arguments
		},
		rawInstance: function () {
			d = true;
			var e = new this;
			d = false;
			return e
		},
		extend: function (e, b, f) {
			function j() {
				if (!d) return this.constructor !== j && arguments.length ? this.extend.apply(this, arguments) : this.Class.newInstance.apply(this.Class, arguments)
			}
			if (typeof e != "string") {
				f = b;
				b = e;
				e = null
			}
			if (!f) {
				f = b;
				b = null
			}
			f = f || {};
			var o = this.prototype,
				q, v, w, E;
			d = true;
			E = new this;
			d = false;
			c(f, o, E);
			for (q in this) if (this.hasOwnProperty(q) && a.inArray(q, ["prototype", "defaults", "getObject"]) == -1) j[q] = this[q];
			c(b, this, j);
			if (e) {
				w = e.split(/\./);
				v = w.pop();
				w = o = a.Class.getObject(w.join("."));
				o[v] = j
			}
			a.extend(j, {
				prototype: E,
				namespace: w,
				shortName: v,
				constructor: j,
				fullName: e
			});
			j.prototype.Class = j.prototype.constructor = j;
			v = j.setup.apply(j, [this].concat(a.makeArray(arguments)));
			if (j.init) j.init.apply(j, v || []);
			return j
		}
	});
	jQuery.Class.prototype.callback = jQuery.Class.callback
})(jQuery);
(function (a) {
	var d = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowerUpper: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g
	},
		g = a.String = {
			strip: function (c) {
				return c.replace(/^\s+/, "").replace(/\s+$/, "")
			},
			capitalize: function (c) {
				return c.charAt(0).toUpperCase() + c.substr(1)
			},
			endsWith: function (c, e) {
				var b = c.length - e.length;
				return b >= 0 && c.lastIndexOf(e) === b
			},
			camelize: function (c) {
				c = c.split(d.undHash);
				var e = 1;
				for (c[0] = c[0].charAt(0).toLowerCase() + c[0].substr(1); e < c.length; e++) c[e] = g.capitalize(c[e]);
				return c.join("")
			},
			classize: function (c) {
				c = c.split(d.undHash);
				for (var e = 0; e < c.length; e++) c[e] = g.capitalize(c[e]);
				return c.join("")
			},
			niceName: function (c) {
				c = c.split(d.undHash);
				for (var e = 0; e < c.length; e++) c[e] = g.capitalize(c[e]);
				return c.join(" ")
			},
			underscore: function (c) {
				return c.replace(d.colons, "/").replace(d.words, "$1_$2").replace(d.lowerUpper, "$1_$2").replace(d.dash, "_").toLowerCase()
			}
		}
})(jQuery);
(function (a) {
	a.String.rsplit = function (d, g) {
		for (var c = g.exec(d), e = [], b; c != null;) {
			b = c.index;
			if (b != 0) {
				e.push(d.substring(0, b));
				d = d.slice(b)
			}
			e.push(c[0]);
			d = d.slice(c[0].length);
			c = g.exec(d)
		}
		d != "" && e.push(d);
		return e
	}
})(jQuery);
(function (a) {
	var d = jQuery.cleanData;
	a.cleanData = function (g) {
		for (var c = 0, e;
		(e = g[c]) != null; c++) a(e).triggerHandler("destroyed");
		d(g)
	}
})(jQuery);
(function (a) {
	var d = function (B, G, x) {
		var D;
		if (G.indexOf(">") == 0) {
			G = G.substr(1);
			D = function (F) {
				F.target === B ? x.apply(this, arguments) : F.handled = null
			}
		}
		a(B).bind(G, D || x);
		return function () {
			a(B).unbind(G, D || x);
			B = G = x = D = null
		}
	},
		g = function (B, G, x, D) {
			a(B).delegate(G, x, D);
			return function () {
				a(B).undelegate(G, x, D);
				B = x = D = G = null
			}
		},
		c = function (B, G, x, D) {
			return D ? g(B, D, G, x) : d(B, G, x)
		},
		e = function (B) {
			return function () {
				return B.apply(null, [a(this)].concat(Array.prototype.slice.call(arguments, 0)))
			}
		},
		b = /\./g,
		f = /_?controllers?/ig,
		j = /[^\w]/,
		o = /^(>?default\.)|(>)/,
		q = /\{([^\}]+)\}/g,
		v = /^(?:(.*?)\s)?([\w\.\:>]+)$/;
	a.Class.extend("jQuery.Controller", {
		init: function () {
			if (!(!this.shortName || this.fullName == "jQuery.Controller")) {
				this._fullName = a.String.underscore(this.fullName.replace(b, "_").replace(f, ""));
				this._shortName = a.String.underscore(this.shortName.replace(b, "_").replace(f, ""));
				var B = this,
					G = this._fullName,
					x;
				a.fn[G] || (a.fn[G] = function (D) {
					var F = a.makeArray(arguments),
						R = typeof D == "string" && a.isFunction(B.prototype[D]),
						X = F[0];
					this.each(function () {
						var ea = a.data(this, "controllers");
						if (ea = ea && ea[G]) R ? ea[X].apply(ea, F.slice(1)) : ea.update.apply(ea, F);
						else B.newInstance.apply(B, [this].concat(F))
					});
					return this
				});
				if (!a.isArray(this.listensTo)) throw "listensTo is not an array in " + this.fullName;
				this.actions = {};
				for (x in this.prototype) if (a.isFunction(this.prototype[x])) this._isAction(x) && (this.actions[x] = this._getAction(x));
				this.onDocument && new this(document.documentElement)
			}
		},
		hookup: function (B) {
			return new this(B)
		},
		_isAction: function (B) {
			if (j.test(B)) return true;
			else {
				B = B.replace(o, "");
				return a.inArray(B, this.listensTo) > -1 || a.event.special[B] || a.Controller.processors[B]
			}
		},
		_getAction: function (B, G) {
			q.lastIndex = 0;
			if (!G && q.test(B)) return null;
			var x = (G ? B.replace(q, function (D, F) {
				return a.Class.getObject(F, G).toString()
			}) : B).match(v);
			return {
				processor: this.processors[x[2]] || w,
				parts: x
			}
		},
		processors: {},
		listensTo: []
	}, {
		setup: function (B, G) {
			var x, D, F = this.Class;
			B = B.jquery ? B[0] : B;
			this.element = a(B).addClass(F._fullName);
			(a.data(B, "controllers") || a.data(B, "controllers", {}))[F._fullName] = this;
			this._bindings = [];
			this.options = a.extend(a.extend(true, {}, F.defaults), G);
			for (x in F.actions) {
				D = F.actions[x] || F._getAction(x, this.options);
				this._bindings.push(D.processor(B, D.parts[2], D.parts[1], this.callback(x), this))
			}
			this.called = "init";
			var R = e(this.callback("destroy"));
			this.element.bind("destroyed", R);
			this._bindings.push(function () {
				R.removed = true;
				a(B).unbind("destroyed", R)
			});
			return this.element
		},
		bind: function (B, G, x) {
			if (typeof B == "string") {
				x = G;
				G = B;
				B = this.element
			}
			return this._binder(B, G, x)
		},
		_binder: function (B, G, x, D) {
			if (typeof x == "string") x = e(this.callback(x));
			this._bindings.push(c(B, G, x, D));
			return this._bindings.length
		},
		delegate: function (B, G, x, D) {
			if (typeof B == "string") {
				D = x;
				x = G;
				G = B;
				B = this.element
			}
			return this._binder(B, x, D, G)
		},
		update: function (B) {
			a.extend(this.options, B)
		},
		destroy: function () {
			if (this._destroyed) throw this.Class.shortName + " controller instance has been deleted";
			var B = this,
				G = this.Class._fullName;
			this._destroyed = true;
			this.element.removeClass(G);
			a.each(this._bindings, function (D, F) {
				a.isFunction(F) && F(B.element[0])
			});
			delete this._actions;
			var x = this.element.data("controllers");
			x && x[G] && delete x[G];
			this.element = null
		},
		find: function (B) {
			return this.element.find(B)
		},
		_set_called: true
	});
	var w = function (B, G, x, D, F) {
		F = F.Class;
		if (F.onDocument && !/^Main(Controller)?$/.test(F.shortName)) x = x ? "#" + F._shortName + " " + x : "#" + F._shortName;
		return c(B, G, e(D), x)
	},
		E = a.Controller.processors,
		A = function (B, G, x, D) {
			return c(window, G.replace(/window/, ""), e(D))
		};
	a.each("change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset windowresize resize windowscroll scroll select submit dblclick focusin focusout load unload ready hashchange mouseenter mouseleave".split(" "), function (B, G) {
		E[G] = w
	});
	a.each(["windowresize", "windowscroll", "load", "ready", "unload", "hashchange"], function (B, G) {
		E[G] = A
	});
	E.ready = function (B, G, x, D) {
		a(e(D))
	};
	a.fn.mixin = function () {
		var B = a.makeArray(arguments);
		return this.each(function () {
			for (var G = 0; G < B.length; G++) new B[G](this)
		})
	};
	a.fn.controllers = function () {
		var B = a.makeArray(arguments),
			G = [],
			x;
		this.each(function () {
			if (x = a.data(this, "controllers")) for (var D in x) {
				var F = x[D],
					R;
				if (!(R = !B.length)) a: {
					for (R = 0; R < B.length; R++) if (typeof B[R] == "string" ? F.Class._shortName == B[R] : F instanceof B[R]) {
						R = true;
						break a
					}
					R = false
				}
				R && G.push(F)
			}
		});
		return G
	};
	a.fn.controller = function () {
		return this.controllers.apply(this, arguments)[0]
	}
})(jQuery);
(function (a) {
	a.Controller.getFolder = function () {
		return a.String.underscore(this.fullName.replace(/\./g, "/")).replace("/Controllers", "")
	};
	a.Controller.prototype.calculateHelpers = function (d) {
		var g = {};
		if (d) if (a.isArray(d)) for (var c = 0; c < d.length; c++) a.extend(g, d[c]);
		else a.extend(g, d);
		else {
			if (this._default_helpers) g = this._default_helpers;
			d = window;
			c = this.Class.fullName.split(/\./);
			for (var e = 0; e < c.length; e++) {
				typeof d.Helpers == "object" && a.extend(g, d.Helpers);
				d = d[c[e]]
			}
			typeof d.Helpers == "object" && a.extend(g, d.Helpers);
			this._default_helpers = g
		}
		return g
	};
	a.Controller.prototype.view = function (d, g, c) {
		if (!d) throw Error("no view was provided");
		d = "gs/views/" + this.Class._shortName + "/" + d + a.View.ext;
		g = g || this;
		c = this.calculateHelpers.call(this, c);
		return a.View(d, g, c)
	}
})(jQuery);
(function () {
	jQuery.fn.compare = function (a) {
		try {
			a = a.jquery ? a[0] : a
		} catch (d) {
			return null
		}
		if (window.HTMLElement) {
			var g = HTMLElement.prototype.toString.call(a);
			if (g == "[xpconnect wrapped native prototype]" || g == "[object XULElement]") return null
		}
		if (this[0].compareDocumentPosition) return this[0].compareDocumentPosition(a);
		if (this[0] == document && a != document) return 8;
		g = (this[0] !== a && this[0].contains(a) && 16) + (this[0] != a && a.contains(this[0]) && 8);
		var c = document.documentElement;
		if (this[0].sourceIndex) {
			g += this[0].sourceIndex < a.sourceIndex && 4;
			g += this[0].sourceIndex > a.sourceIndex && 2;
			g += (this[0].ownerDocument !== a.ownerDocument || this[0] != c && this[0].sourceIndex <= 0 || a != c && a.sourceIndex <= 0) && 1
		} else {
			c = document.createRange();
			var e = document.createRange();
			c.selectNode(this[0]);
			e.selectNode(a);
			c.compareBoundaryPoints(Range.START_TO_START, e)
		}
		return g
	}
})(jQuery);
(function (a) {
	a.fn.within = function (d, g, c) {
		var e = [];
		this.each(function () {
			var b = jQuery(this);
			if (this == document.documentElement) return e.push(this);
			b = c ? jQuery.data(this, "offset", b.offset()) : b.offset();
			g >= b.top && g < b.top + this.offsetHeight && d >= b.left && d < b.left + this.offsetWidth && e.push(this)
		});
		return this.pushStack(jQuery.unique(e), "within", d + "," + g)
	};
	a.fn.withinBox = function (d, g, c, e, b) {
		var f = [];
		this.each(function () {
			var j = jQuery(this);
			if (this == document.documentElement) return this.ret.push(this);
			var o = b ? jQuery.data(this, "offset", j.offset()) : j.offset(),
				q = j.width();
			j = j.height();
			(res = !(o.top > g + e || o.top + j < g || o.left > d + c || o.left + q < d)) && f.push(this)
		});
		return this.pushStack(jQuery.unique(f), "withinBox", jQuery.makeArray(arguments).join(","))
	}
})(jQuery);
(function (a) {
	var d = 1;
	a.View = function (b, f, j) {
		var o = b.match(/\.[\w\d]+$/),
			q, v;
		if (!o) {
			o = a.View.ext;
			b += a.View.ext
		}
		v = b.replace(/[\/\.]/g, "_");
		o = a.View.types[o];
		if (a.View.cached[v]) b = a.View.cached[v];
		else if (q = document.getElementById(v)) {
			q = q.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
			b = o.renderer(v, q)
		} else b = (q = a.View.preCached[v] || a.View.preCached[v.replace(/^_/, "")]) ? o.renderer(v, q) : o.get(v, b);
		if (a.View.cache) a.View.cached[v] = b;
		return b.call(o, f, j).replace(/\uFEFF/, "")
	};
	a.extend(a.View, {
		hookups: {},
		hookup: function (b) {
			var f = ++d;
			jQuery.View.hookups[f] = b;
			return f
		},
		cached: {},
		preCached: {},
		cache: true,
		register: function (b) {
			this.types["." + b.suffix] = b
		},
		types: {},
		ext: ".ejs",
		registerScript: function (b, f, j) {
			return "$.View.preload('" + f + "'," + a.View.types["." + b].script(f, j) + ");"
		},
		preload: function (b, f) {
			a.View.cached[b] = function (j, o) {
				return f.call(j, j, o)
			}
		}
	});
	for (var g = ["prepend", "append", "after", "before", "replace", "text", "html", "replaceWith"], c = function (b) {
		var f = jQuery.fn[b];
		jQuery.fn[b] = function () {
			var j = arguments,
				o;
			o = typeof arguments[1];
			if (typeof arguments[0] == "string" && (o == "object" || o == "function") && !arguments[1].nodeType && !arguments[1].jquery) j = [a.View.apply(a.View, a.makeArray(arguments))];
			for (var q in jQuery.View.hookups);
			if (q) j[0] = a(j[0]);
			o = f.apply(this, j);
			if (q) {
				var v = j[0];
				j = a.View.hookups;
				var w;
				q = 0;
				var E, A;
				a.View.hookups = {};
				v = v.add("[data-view-id]", v);
				for (w = v.length; q < w; q++) if (v[q].getAttribute && (E = v[q].getAttribute("data-view-id")) && (A = j[E])) {
					A(v[q], E);
					delete j[E];
					v[q].removeAttribute("data-view-id")
				}
				a.extend(a.View.hookups, j)
			}
			return o
		}
	}, e = 0; e < g.length; e++) c(g[e])
})(jQuery);
(function (a) {
	var d = a.extend,
		g = a.isArray,
		c = function (e) {
			if (this.constructor != c) {
				var b = new c(e);
				return function (j, o) {
					return b.render(j, o)
				}
			}
			if (typeof e == "function") {
				this.template = {};
				this.template.process = e
			} else {
				a.extend(this, c.options, e);
				var f = new c.Compiler(this.text, this.type);
				f.compile(e, this.name);
				this.template = f
			}
		};
	a.View.EJS = c;
	c.prototype = {
		constructor: c,
		render: function (e, b) {
			e = e || {};
			this._extra_helpers = b;
			var f = new c.Helpers(e, b || {});
			return this.template.process.call(e, e, f)
		},
		out: function () {
			return this.template.out
		}
	};
	c.Scanner = function (e, b, f) {
		d(this, {
			left_delimiter: b + "%",
			right_delimiter: "%" + f,
			double_left: b + "%%",
			double_right: "%%" + f,
			left_equal: b + "%=",
			left_comment: b + "%#"
		});
		this.SplitRegexp = b == "[" ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : RegExp("(" + this.double_left + ")|(%%" + this.double_right + ")|(" + this.left_equal + ")|(" + this.left_comment + ")|(" + this.left_delimiter + ")|(" + this.right_delimiter + "\n)|(" + this.right_delimiter + ")|(\n)");
		this.source = e;
		this.stag = null;
		this.lines = 0
	};
	c.Scanner.to_text = function (e) {
		var b;
		if (e == null || e === undefined) return "";
		if (e instanceof Date) return e.toDateString();
		if (e.hookup) {
			b = a.View.hookup(function (f, j) {
				e.hookup.call(e, f, j)
			});
			return "data-view-id='" + b + "'"
		}
		if (typeof e == "function") return "data-view-id='" + a.View.hookup(e) + "'";
		if (g(e)) {
			b = a.View.hookup(function (f, j) {
				for (var o = 0; o < e.length; o++) e[o].hookup ? e[o].hookup(f, j) : e[o](f, j)
			});
			return "data-view-id='" + b + "'"
		}
		if (e.nodeName || e.jQuery) throw "elements in views are not supported";
		if (e.toString) return b ? e.toString(b) : e.toString();
		return ""
	};
	c.Scanner.prototype = {
		scan: function (e) {
			var b = this.SplitRegexp;
			if (!this.source == "") for (var f = a.String.rsplit(this.source, /\n/), j = 0; j < f.length; j++) this.scanline(f[j], b, e)
		},
		scanline: function (e, b, f) {
			this.lines++;
			e = a.String.rsplit(e, b);
			for (b = 0; b < e.length; b++) {
				var j = e[b];
				if (j != null) try {
					f(j, this)
				} catch (o) {
					throw {
						type: "jQuery.View.EJS.Scanner",
						line: this.lines
					};
				}
			}
		}
	};
	c.Buffer = function (e, b) {
		this.line = [];
		this.script = "";
		this.pre_cmd = e;
		this.post_cmd = b;
		for (var f = 0; f < this.pre_cmd.length; f++) this.push(e[f])
	};
	c.Buffer.prototype = {
		push: function (e) {
			this.line.push(e)
		},
		cr: function () {
			this.script += this.line.join("; ");
			this.line = [];
			this.script += "\n"
		},
		close: function () {
			if (this.line.length > 0) {
				for (var e = 0; e < this.post_cmd.length; e++) this.push(pre_cmd[e]);
				this.script += this.line.join("; ");
				line = null
			}
		}
	};
	c.Compiler = function (e, b) {
		this.pre_cmd = ["var ___ViewO = [];"];
		this.post_cmd = [];
		this.source = " ";
		if (e != null) {
			if (typeof e == "string") {
				e = e.replace(/\r\n/g, "\n");
				this.source = e = e.replace(/\r/g, "\n")
			} else if (e.innerHTML) this.source = e.innerHTML;
			if (typeof this.source != "string") this.source = ""
		}
		b = b || "<";
		var f = ">";
		switch (b) {
		case "[":
			f = "]";
			break;
		case "<":
			break;
		default:
			throw b + " is not a supported deliminator";
		}
		this.scanner = new c.Scanner(this.source, b, f);
		this.out = ""
	};
	c.Compiler.prototype = {
		compile: function (e, b) {
			e = e || {};
			this.out = "";
			var f = new c.Buffer(this.pre_cmd, this.post_cmd),
				j = "",
				o = function (E) {
					E = E.replace(/\\/g, "\\\\");
					E = E.replace(/\n/g, "\\n");
					return E = E.replace(/"/g, '\\"')
				};
			this.scanner.scan(function (E, A) {
				if (A.stag == null) switch (E) {
				case "\n":
					j += "\n";
					f.push('___ViewO.push("' + o(j) + '");');
					f.cr();
					j = "";
					break;
				case A.left_delimiter:
				case A.left_equal:
				case A.left_comment:
					A.stag = E;
					j.length > 0 && f.push('___ViewO.push("' + o(j) + '")');
					j = "";
					break;
				case A.double_left:
					j += A.left_delimiter;
					break;
				default:
					j += E;
					break
				} else switch (E) {
				case A.right_delimiter:
					switch (A.stag) {
					case A.left_delimiter:
						if (j[j.length - 1] == "\n") {
							j = j.substr(0, j.length - 1);
							f.push(j);
							f.cr()
						} else f.push(j);
						break;
					case A.left_equal:
						f.push("___ViewO.push((jQuery.View.EJS.Scanner.to_text(" + j + ")))");
						break
					}
					A.stag = null;
					j = "";
					break;
				case A.double_right:
					j += A.right_delimiter;
					break;
				default:
					j += E;
					break
				}
			});
			j.length > 0 && f.push('___ViewO.push("' + o(j) + '")');
			f.close();
			this.out = f.script + ";";
			var q = "/*" + b + "*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {" + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
			try {
				eval(q)
			} catch (v) {
				if (typeof JSLINT != "undefined") {
					JSLINT(this.out);
					for (var w = 0; w < JSLINT.errors.length; w++) {
						q = JSLINT.errors[w];
						if (q.reason != "Unnecessary semicolon.") {
							q.line++;
							w = Error();
							w.lineNumber = q.line;
							w.message = q.reason;
							if (e.view) w.fileName = e.view;
							throw w;
						}
					}
				} else throw v;
			}
		}
	};
	c.options = {
		cache: true,
		type: "<",
		ext: ".ejs"
	};
	c.INVALID_PATH = -1;
	c.Helpers = function (e, b) {
		this._data = e;
		this._extras = b;
		d(this, b)
	};
	c.Helpers.prototype = {
		view: function (e, b, f) {
			if (!f) f = this._extras;
			if (!b) b = this._data;
			return a.View(e, b, f)
		},
		to_text: function (e, b) {
			if (e == null || e === undefined) return b || "";
			if (e instanceof Date) return e.toDateString();
			if (e.toString) return e.toString().replace(/\n/g, "<br />").replace(/''/g, "'");
			return ""
		},
		plugin: function () {
			var e = a.makeArray(arguments),
				b = e.shift();
			return function (f) {
				f = a(f);
				f[b].apply(f, e)
			}
		}
	};
	a.View.register({
		suffix: "ejs",
		get: function (e, b) {
			var f = a.ajax({
				async: false,
				url: b + "?ver=" + gsConfig.coreVersion,
				dataType: "text",
				error: function () {
					throw "ejs.js ERROR: There is no template or an empty template at " + b;
				}
			}).responseText;
			if (!f.match(/[^\s]/)) throw "ejs.js ERROR: There is no template or an empty template at " + b;
			return this.renderer(e, f)
		},
		script: function (e, b) {
			return "jQuery.View.EJS(function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {" + (new c({
				text: b
			})).out() + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}})"
		},
		renderer: function (e, b) {
			var f = new c({
				text: b,
				name: e
			});
			return function (j, o) {
				return f.render.call(f, j, o)
			}
		}
	})
})(jQuery);
(function (a) {
	var d = a.String.capitalize,
		g = a.String.underscore;
	jQuery.Class.extend("jQuery.Model", {
		setup: function () {
			this.validations = [];
			this.attributes = {};
			this.associations = {};
			this._fullName = g(this.fullName.replace(/\./g, "_"));
			if (this.fullName.substr(0, 7) != "jQuery.") {
				jQuery.Model.models[this._fullName] = this;
				if (this.storeType) this.store = new this.storeType(this)
			}
		},
		defaults: {},
		wrap: function (c) {
			if (!c) return null;
			return new this(c[this.singularName] || c.attributes || c)
		},
		wrapMany: function (c) {
			if (!c) return null;
			var e = new(this.List || Array),
				b = a.isArray(c),
				f = b ? c : c.data,
				j = f.length,
				o = 0;
			for (e._use_call = true; o < j; o++) e.push(this.wrap(f[o]));
			if (!b) for (var q in c) if (q !== "data") e[q] = c[q];
			return e
		},
		id: "id",
		addAttr: function (c, e) {
			if (!this.associations[c]) {
				this.attributes[c] || (this.attributes[c] = e);
				return e
			}
		},
		models: {},
		publish: function (c, e) {
			e = e || this;
			a.publish(this.Class.shortName + "." + c, e)
		},
		guessType: function (c) {
			if (typeof c != "string") {
				if (c == null) return typeof c;
				if (c.constructor == Date) return "date";
				if (a.isArray(c)) return "array";
				return typeof c
			}
			if (c == "") return "string";
			if (c == "true" || c == "false") return "boolean";
			if (!isNaN(c)) return "number";
			return typeof c
		},
		converters: {
			date: function (c) {
				return this._parseDate(c)
			},
			number: function (c) {
				return parseFloat(c)
			},
			"boolean": function (c) {
				return Boolean(c)
			}
		},
		findAll: function () {},
		findOne: function () {},
		create: function () {
			throw "Model: Implement Create";
		},
		update: function () {
			throw "Model: Implement " + this.fullName + '\'s "update"!';
		},
		destroy: function () {
			throw "Model: Implement " + this.fullName + '\'s "destroy"!';
		},
		_parseDate: function (c) {
			return typeof c == "string" ? Date.parse(c) == NaN ? null : Date.parse(c) : c
		}
	}, {
		init: function (c) {
			this.Class.defaults && this.attrs(this.Class.defaults);
			this.attrs(c)
		},
		update: function (c, e, b) {
			this.attrs(c);
			return this.save(e, b)
		},
		valid: function () {
			for (var c in this.errors) return false;
			return true
		},
		validate: function () {
			this.errors = {};
			var c = this;
			a.each(this.Class.validations || [], function (e, b) {
				b.call(c)
			})
		},
		attr: function (c, e) {
			var b = d(c);
			e !== undefined && this._setProperty(c, e, b);
			return this[c]
		},
		_setProperty: function (c, e, b) {
			var f = "set" + b;
			b = this[c];
			var j = this.Class,
				o = j.attributes[c] || j.addAttr(c, j.guessType(e));
			o = j.converters[o];
			if (!(this[f] && !(e = this[f](e)))) {
				e = this[c] = e == null ? null : o ? o.call(j, e) : e;
				if (c == j.id && e != null && j.store) if (b) {
					if (b != e) {
						j.store.destroy(b);
						j.store.create(this)
					}
				} else j.store.create(this)
			}
		},
		attrs: function (c) {
			var e;
			if (c) {
				var b = this.Class.id;
				for (e in c) e != b && this.attr(e, c[e]);
				b in c && this.attr(b, c[b])
			} else {
				c = {};
				for (e in this.Class.attributes) c[e] = this.attr(e)
			}
			return c
		},
		isNew: function () {
			return this[this.Class.id] == null
		},
		save: function (c, e) {
			this.validate();
			if (!this.valid()) return false;
			this.isNew() ? this.Class.create(this.attrs(), this.callback(["created", c]), e) : this.Class.update(this[this.Class.id], this.attrs(), this.callback(["updated", c]), e);
			return true
		},
		destroy: function (c, e) {
			this.Class.destroy(this[this.Class.id], this.callback(["destroyed", c]), e)
		},
		identity: function () {
			var c = this[this.Class.id];
			return this.Class._fullName + "_" + (this.Class.escapeIdentity ? encodeURIComponent(c) : c)
		},
		elements: function (c) {
			return a("." + this.identity(), c)
		},
		publish: function (c, e) {
			this.Class.publish(c, e || this)
		},
		hookup: function (c) {
			var e = g(this.Class.shortName),
				b = a.data(c, "models") || a.data(c, "models", {});
			a(c).addClass(e + " " + this.identity());
			b[e] = this
		}
	});
	a.each(["created", "updated", "destroyed"], function (c, e) {
		a.Model.prototype[e] = function (b) {
			e === "destroyed" && this.Class.store && this.Class.store.destroy(this[this.Class.id]);
			b && this.attrs(b);
			this.publish(e, this);
			return [this].concat(a.makeArray(arguments))
		}
	});
	a.fn.models = function () {
		var c = [],
			e, b;
		this.each(function () {
			a.each(a.data(this, "models") || {}, function (f, j) {
				e = e === undefined ? j.Class.List || null : j.Class.List === e ? e : null;
				c.push(j)
			})
		});
		b = new(e || a.Model.list || Array);
		b.push.apply(b, a.unique(c));
		return b
	};
	a.fn.model = function () {
		return this.models.apply(this, arguments)[0]
	}
})(jQuery);
(function (a) {
	this._ = {
		defined: function (d) {
			return d !== a && d !== null
		},
		notDefined: function (d) {
			return d === a || d === null
		},
		orEqual: function (d, g) {
			return this.defined(d) ? d : g
		},
		orEqualEx: function () {
			var d, g = arguments.length;
			for (d = 0; d < g; d++) if (this.defined(arguments[d])) return arguments[d];
			return arguments[g - 1]
		},
		generate404: function () {
			return "#/404"
		},
		redirectSong: function (d, g) {
			console.log("redirect user to song: " + d);
			_.orEqual(g, window.event);
			var c = GS.Models.Song.getOneFromCache(d);
			if (!(c && c.SongID && c.SongID > 0)) throw "redirectSong: Invalid SongID given: " + d;
			url = _.cleanUrl(c.SongName, c.SongID, "song", c.getToken());
			GS.router.redirect(url)
		},
		cleanUrl: function (d, g, c, e, b) {
			var f;
			f = "";
			if (isNaN(parseInt(g, 10))) {
				f = g;
				g = d;
				d = f
			}
			d = d || "Unknown";
			d = _.cleanNameForURL(d, c != "user");
			c = c.toLowerCase();
			b = _.orEqual(b, "");
			if (b.length) b = "/" + b;
			if (c === "s" && !e) return _.generate404();
			if (e) {
				if (c == "song") c = "s";
				f = "#/" + c + "/" + d + "/" + e + b + "?src=5"
			} else f = "#/" + c + "/" + d + "/" + g + b + "?src=5";
			return f
		},
		makeUrlForShare: function (d, g, c) {
			var e = encodeURIComponent("http://listen.grooveshark.com" + c.toUrl().substr(1)),
				b = "";
			switch (g) {
			case "song":
				b = c.SongName + " by " + c.ArtistName;
				break;
			case "playlist":
				b = c.PlaylistName + " by " + c.Username;
				break;
			case "album":
				b = c.AlbumName + " by " + c.ArtistName;
				break
			}
			b = encodeURIComponent(b);
			switch (d) {
			case "reddit":
				return "http://www.reddit.com/submit?title=" + b + "&url=" + e;
			case "stumbleupon":
				return "http://www.stumbleupon.com/submit?url=" + e
			}
			return ""
		},
		cleanNameForURL: function (d, g) {
			if (g = _.orEqual(g, true)) d = _.ucwords(d);
			d = ("" + d).replace(/&/g, " and ").replace(/#/g, " number ").replace(/[^\w]/g, "_");
			d = $.trim(d).replace(/\s/g, "_");
			d = d.replace(/__+/g, "_");
			d = encodeURIComponent(d);
			return d = d.replace(/_/g, "+")
		},
		cleanTextDiv: $("<div/>"),
		cleanText: function (d) {
			if (d && d.length) return _.cleanTextDiv.text(d).html().replace(/\"/g, "&quot;").replace(/&amp\;/g, "&");
			return ""
		},
		getString: function (d, g) {
			var c = $.localize.getString(d);
			if (c && c.length) return (new GS.Models.DataString(c, g)).render();
			return ""
		},
		ucwords: function (d) {
			return (d + "").toLowerCase().replace(/^(.)|\s(.)/g, function (g) {
				return g.toUpperCase()
			})
		},
		arrRemove: function (d, g, c) {
			d.splice(g, (c || g || 1) + (g < 0 ? d.length : 0));
			return d
		},
		arrUnique: function (d) {
			for (var g = [], c = {}, e = 0, b = d.length; e < b; e++) if (!c[d[e]]) {
				g.push(d[e]);
				c[d[e]] = true
			}
			return g
		},
		isNumber: function (d) {
			return d === +d || Object.prototype.toString.call(d) === "[object Number]"
		},
		isArray: Array.isArray ||
		function (d) {
			return !!(d && d.concat && d.unshift && !d.callee)
		},
		isString: function (d) {
			return !!(d === "" || d && d.charCodeAt && d.substr)
		},
		forEach: function (d, g, c) {
			if (!_.isEmpty(d)) {
				if (Array.prototype.forEach && d.forEach === Array.prototype.forEach) d.forEach(g, c);
				else if (_.isNumber(d.length)) for (var e = 0, b = d.length; e < b; e++) g.call(c, d[e], e, d);
				else for (e in d) Object.prototype.hasOwnProperty.call(d, e) && g.call(c, d[e], e, d);
				return d
			}
		},
		map: function (d, g, c) {
			if (Array.prototype.map && d.map === Array.prototype.map) return d.map(g, c);
			var e = [];
			_.forEach(d, function (b, f, j) {
				e.push(g.call(c, b, f, j))
			});
			return e
		},
		arrInclude: function (d, g) {
			return d.indexOf(g) != -1
		},
		toArray: function (d) {
			var g = [];
			for (var c in d) d.hasOwnProperty(c) && d[c] !== true && g.push(d[c]);
			return g
		},
		toArrayID: function (d) {
			var g = [];
			for (var c in d) d.hasOwnProperty(c) && g.push(c);
			return g
		},
		isEmpty: function (d) {
			if (_.isArray(d) || _.isString(d)) return d.length === 0;
			for (var g in d) if (Object.prototype.hasOwnProperty.call(d, g)) return false;
			return true
		},
		count: function (d) {
			var g = 0;
			for (var c in d) d.hasOwnProperty(c) && g++;
			return g
		},
		unixTime: function (d) {
			d = _.orEqual(d, new Date);
			return parseInt(d.getTime() / 1E3, 10)
		},
		millisToMinutesSeconds: function (d) {
			var g;
			g = new Date(d);
			d = g.getMinutes();
			g = g.getSeconds();
			g = g > 9 ? g : "0" + g;
			return d + ":" + g
		},
		dobToAge: function (d, g, c) {
			d = d && _.notDefined(g) && _.notDefined(c) ? new Date(d) : new Date(d, g, c);
			d = ((new Date).getTime() - d.getTime()) / 864E5;
			d = Math.floor(d / 365.24);
			return isNaN(d) ? false : d
		},
		browserDetect: function () {
			var d = {
				browser: "",
				version: 0
			},
				g = navigator.userAgent.toLowerCase();
			$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
			$.browser.adobeair = /adobeair/.test(navigator.userAgent.toLowerCase());
			if ($.browser.msie) {
				g = $.browser.version;
				g = g.substring(0, g.indexOf("."));
				d.browser = "msie";
				d.version = parseFloat(g)
			}
			if ($.browser.chrome) {
				g = g.substring(g.indexOf("chrome/") + 7);
				g = g.substring(0, g.indexOf("."));
				d.browser = "chrome";
				d.version = parseFloat(g);
				$.browser.safari = false
			}
			if ($.browser.adobeair) {
				g = g.substring(g.indexOf("adobeair/") + 9);
				g = g.substring(0, g.indexOf("."));
				d.browser = "adobeair";
				d.version = parseFloat(g);
				$.browser.safari = false
			}
			if ($.browser.safari) {
				g = g.substring(g.indexOf("safari/") + 7);
				g = g.substring(0, g.indexOf("."));
				d.browser = "safari";
				d.version = parseFloat(g)
			}
			if ($.browser.mozilla) if (navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
				g = g.substring(g.indexOf("firefox/") + 8);
				g = g.substring(0, g.indexOf("."));
				d.browser = "firefox";
				d.version = parseFloat(g)
			} else {
				d.browser = "mozilla";
				d.version = parseFloat($.browser.version)
			}
			if ($.browser.opera) {
				g = g.substring(g.indexOf("version/") + 8);
				g = g.substring(0, g.indexOf("."));
				d.browser = "opera";
				d.version = parseFloat(g)
			}
			return d
		},
		numSortA: function (d, g) {
			return d - g
		},
		numSortD: function (d, g) {
			return g - d
		},
		emailRegex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i,
		keys: {
			ESC: 27,
			ENTER: 13,
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39
		},
		states: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
		countries: [{
			iso: "US",
			name: "United States",
			callingCode: "1"
		}, {
			iso: "AF",
			name: "Afghanistan",
			callingCode: "93"
		}, {
			iso: "AL",
			name: "Albania",
			callingCode: "355"
		}, {
			iso: "DZ",
			name: "Algeria",
			callingCode: "213"
		}, {
			iso: "AS",
			name: "American Samoa",
			callingCode: "1"
		}, {
			iso: "AD",
			name: "Andorra",
			callingCode: "376"
		}, {
			iso: "AO",
			name: "Angola",
			callingCode: "244"
		}, {
			iso: "AI",
			name: "Anguilla",
			callingCode: "1"
		}, {
			iso: "AQ",
			name: "Antarctica",
			callingCode: "672"
		}, {
			iso: "AG",
			name: "Antigua and Barbuda",
			callingCode: "1"
		}, {
			iso: "AR",
			name: "Argentina",
			callingCode: "54"
		}, {
			iso: "AM",
			name: "Armenia",
			callingCode: "374"
		}, {
			iso: "AW",
			name: "Aruba",
			callingCode: "297"
		}, {
			iso: "AU",
			name: "Australia",
			callingCode: "672"
		}, {
			iso: "AT",
			name: "Austria",
			callingCode: "43"
		}, {
			iso: "AZ",
			name: "Azerbaijan",
			callingCode: "994"
		}, {
			iso: "BS",
			name: "Bahamas",
			callingCode: "1"
		}, {
			iso: "BH",
			name: "Bahrain",
			callingCode: "973"
		}, {
			iso: "BD",
			name: "Bangladesh",
			callingCode: "880"
		}, {
			iso: "BB",
			name: "Barbados",
			callingCode: "1"
		}, {
			iso: "BY",
			name: "Belarus",
			callingCode: "375"
		}, {
			iso: "BE",
			name: "Belgium",
			callingCode: "32"
		}, {
			iso: "BZ",
			name: "Belize",
			callingCode: "501"
		}, {
			iso: "BJ",
			name: "Benin",
			callingCode: "229"
		}, {
			iso: "BM",
			name: "Bermuda",
			callingCode: "1"
		}, {
			iso: "BT",
			name: "Bhutan",
			callingCode: "975"
		}, {
			iso: "BO",
			name: "Bolivia",
			callingCode: "591"
		}, {
			iso: "BA",
			name: "Bosnia and Herzegovina",
			callingCode: "387"
		}, {
			iso: "BW",
			name: "Botswana",
			callingCode: "267"
		}, {
			iso: "BV",
			name: "Bouvet Island",
			callingCode: ""
		}, {
			iso: "BR",
			name: "Brazil",
			callingCode: "55"
		}, {
			iso: "IO",
			name: "British Indian Ocean Territory",
			callingCode: "246"
		}, {
			iso: "BN",
			name: "Brunei Darussalam",
			callingCode: "673"
		}, {
			iso: "BG",
			name: "Bulgaria",
			callingCode: "359"
		}, {
			iso: "BF",
			name: "Burkina Faso",
			callingCode: "226"
		}, {
			iso: "BI",
			name: "Burundi",
			callingCode: "257"
		}, {
			iso: "KH",
			name: "Cambodia",
			callingCode: "855"
		}, {
			iso: "CM",
			name: "Cameroon",
			callingCode: "237"
		}, {
			iso: "CA",
			name: "Canada",
			callingCode: "1"
		}, {
			iso: "CV",
			name: "Cape Verde",
			callingCode: "238"
		}, {
			iso: "KY",
			name: "Cayman Islands",
			callingCode: "996"
		}, {
			iso: "CF",
			name: "Central African Republic",
			callingCode: "236"
		}, {
			iso: "TD",
			name: "Chad",
			callingCode: "235"
		}, {
			iso: "CL",
			name: "Chile",
			callingCode: "56"
		}, {
			iso: "CN",
			name: "China",
			callingCode: "86"
		}, {
			iso: "CX",
			name: "Christmas Island",
			callingCode: "61"
		}, {
			iso: "CC",
			name: "Cocos (Keeling) Islands",
			callingCode: "61"
		}, {
			iso: "CO",
			name: "Colombia",
			callingCode: "57"
		}, {
			iso: "KM",
			name: "Comoros",
			callingCode: "269"
		}, {
			iso: "CG",
			name: "Congo",
			callingCode: "242"
		}, {
			iso: "CD",
			name: "Congo, the Democratic Republic of the",
			callingCode: "243"
		}, {
			iso: "CK",
			name: "Cook Islands",
			callingCode: "682"
		}, {
			iso: "CR",
			name: "Costa Rica",
			callingCode: "506"
		}, {
			iso: "CI",
			name: "Cote D'Ivoire",
			callingCode: "225"
		}, {
			iso: "HR",
			name: "Croatia",
			callingCode: "385"
		}, {
			iso: "CU",
			name: "Cuba",
			callingCode: "53"
		}, {
			iso: "CY",
			name: "Cyprus",
			callingCode: "357"
		}, {
			iso: "CZ",
			name: "Czech Republic",
			callingCode: "420"
		}, {
			iso: "DK",
			name: "Denmark",
			callingCode: "45"
		}, {
			iso: "DJ",
			name: "Djibouti",
			callingCode: "253"
		}, {
			iso: "DM",
			name: "Dominica",
			callingCode: "1"
		}, {
			iso: "DO",
			name: "Dominican Republic",
			callingCode: "1"
		}, {
			iso: "EC",
			name: "Ecuador",
			callingCode: "593"
		}, {
			iso: "EG",
			name: "Egypt",
			callingCode: "20"
		}, {
			iso: "SV",
			name: "El Salvador",
			callingCode: "503"
		}, {
			iso: "GQ",
			name: "Equatorial Guinea",
			callingCode: "240"
		}, {
			iso: "ER",
			name: "Eritrea",
			callingCode: "291"
		}, {
			iso: "EE",
			name: "Estonia",
			callingCode: "372"
		}, {
			iso: "ET",
			name: "Ethiopia",
			callingCode: "251"
		}, {
			iso: "FK",
			name: "Falkland Islands (Malvinas)",
			callingCode: "500"
		}, {
			iso: "FO",
			name: "Faroe Islands",
			callingCode: "298"
		}, {
			iso: "FJ",
			name: "Fiji",
			callingCode: "679"
		}, {
			iso: "FI",
			name: "Finland",
			callingCode: "358"
		}, {
			iso: "FR",
			name: "France",
			callingCode: "33"
		}, {
			iso: "GF",
			name: "French Guiana",
			callingCode: "594"
		}, {
			iso: "PF",
			name: "French Polynesia",
			callingCode: "689"
		}, {
			iso: "TF",
			name: "French Southern Territories",
			callingCode: "262"
		}, {
			iso: "GA",
			name: "Gabon",
			callingCode: "241"
		}, {
			iso: "GM",
			name: "Gambia",
			callingCode: "220"
		}, {
			iso: "GE",
			name: "Georgia",
			callingCode: "995"
		}, {
			iso: "DE",
			name: "Germany",
			callingCode: "49"
		}, {
			iso: "GH",
			name: "Ghana",
			callingCode: "233"
		}, {
			iso: "GI",
			name: "Gibraltar",
			callingCode: "350"
		}, {
			iso: "GR",
			name: "Greece",
			callingCode: "30"
		}, {
			iso: "GL",
			name: "Greenland",
			callingCode: "299"
		}, {
			iso: "GD",
			name: "Grenada",
			callingCode: "1"
		}, {
			iso: "GP",
			name: "Guadeloupe",
			callingCode: "590"
		}, {
			iso: "GU",
			name: "Guam",
			callingCode: "1"
		}, {
			iso: "GT",
			name: "Guatemala",
			callingCode: "502"
		}, {
			iso: "GN",
			name: "Guinea",
			callingCode: "224"
		}, {
			iso: "GW",
			name: "Guinea-Bissau",
			callingCode: "245"
		}, {
			iso: "GY",
			name: "Guyana",
			callingCode: "592"
		}, {
			iso: "HT",
			name: "Haiti",
			callingCode: "509"
		}, {
			iso: "HM",
			name: "Heard Island and Mcdonald Islands",
			callingCode: ""
		}, {
			iso: "VA",
			name: "Holy See (Vatican City State)",
			callingCode: "379"
		}, {
			iso: "HN",
			name: "Honduras",
			callingCode: "504"
		}, {
			iso: "HK",
			name: "Hong Kong",
			callingCode: "852"
		}, {
			iso: "HU",
			name: "Hungary",
			callingCode: "36"
		}, {
			iso: "IS",
			name: "Iceland",
			callingCode: "354"
		}, {
			iso: "IN",
			name: "India",
			callingCode: "91"
		}, {
			iso: "ID",
			name: "Indonesia",
			callingCode: "62"
		}, {
			iso: "IR",
			name: "Iran, Islamic Republic of",
			callingCode: "98"
		}, {
			iso: "IQ",
			name: "Iraq",
			callingCode: "964"
		}, {
			iso: "IE",
			name: "Ireland",
			callingCode: "353"
		}, {
			iso: "IL",
			name: "Israel",
			callingCode: "972"
		}, {
			iso: "IT",
			name: "Italy",
			callingCode: "39"
		}, {
			iso: "JM",
			name: "Jamaica",
			callingCode: "1"
		}, {
			iso: "JP",
			name: "Japan",
			callingCode: "81"
		}, {
			iso: "JO",
			name: "Jordan",
			callingCode: "962"
		}, {
			iso: "KZ",
			name: "Kazakhstan",
			callingCode: "7"
		}, {
			iso: "KE",
			name: "Kenya",
			callingCode: "254"
		}, {
			iso: "KI",
			name: "Kiribati",
			callingCode: "686"
		}, {
			iso: "KP",
			name: "Korea, Democratic People's Republic of",
			callingCode: "850"
		}, {
			iso: "KR",
			name: "Korea, Republic of",
			callingCode: "82"
		}, {
			iso: "KW",
			name: "Kuwait",
			callingCode: "965"
		}, {
			iso: "KG",
			name: "Kyrgyzstan",
			callingCode: "996"
		}, {
			iso: "LA",
			name: "Lao People's Democratic Republic",
			callingCode: "856"
		}, {
			iso: "LV",
			name: "Latvia",
			callingCode: "371"
		}, {
			iso: "LB",
			name: "Lebanon",
			callingCode: "961"
		}, {
			iso: "LS",
			name: "Lesotho",
			callingCode: "266"
		}, {
			iso: "LR",
			name: "Liberia",
			callingCode: "231"
		}, {
			iso: "LY",
			name: "Libyan Arab Jamahiriya",
			callingCode: "218"
		}, {
			iso: "LI",
			name: "Liechtenstein",
			callingCode: "423"
		}, {
			iso: "LT",
			name: "Lithuania",
			callingCode: "370"
		}, {
			iso: "LU",
			name: "Luxembourg",
			callingCode: "352"
		}, {
			iso: "MO",
			name: "Macao",
			callingCode: "853"
		}, {
			iso: "MK",
			name: "Macedonia, the Former Yugoslav Republic of",
			callingCode: "389"
		}, {
			iso: "MG",
			name: "Madagascar",
			callingCode: "261"
		}, {
			iso: "MW",
			name: "Malawi",
			callingCode: "265"
		}, {
			iso: "MY",
			name: "Malaysia",
			callingCode: "60"
		}, {
			iso: "MV",
			name: "Maldives",
			callingCode: "960"
		}, {
			iso: "ML",
			name: "Mali",
			callingCode: "223"
		}, {
			iso: "MT",
			name: "Malta",
			callingCode: "356"
		}, {
			iso: "MH",
			name: "Marshall Islands",
			callingCode: "692"
		}, {
			iso: "MQ",
			name: "Martinique",
			callingCode: "596"
		}, {
			iso: "MR",
			name: "Mauritania",
			callingCode: "222"
		}, {
			iso: "MU",
			name: "Mauritius",
			callingCode: "230"
		}, {
			iso: "YT",
			name: "Mayotte",
			callingCode: "269"
		}, {
			iso: "MX",
			name: "Mexico",
			callingCode: "52"
		}, {
			iso: "FM",
			name: "Micronesia, Federated States of",
			callingCode: "691"
		}, {
			iso: "MD",
			name: "Moldova, Republic of",
			callingCode: "373"
		}, {
			iso: "MC",
			name: "Monaco",
			callingCode: "377"
		}, {
			iso: "MN",
			name: "Mongolia",
			callingCode: "976"
		}, {
			iso: "ME",
			name: "Montenegro",
			callingCode: "382"
		}, {
			iso: "MS",
			name: "Montserrat",
			callingCode: "1"
		}, {
			iso: "MA",
			name: "Morocco",
			callingCode: "212"
		}, {
			iso: "MZ",
			name: "Mozambique",
			callingCode: "258"
		}, {
			iso: "MM",
			name: "Myanmar",
			callingCode: "95"
		}, {
			iso: "NA",
			name: "Namibia",
			callingCode: "264"
		}, {
			iso: "NR",
			name: "Nauru",
			callingCode: "674"
		}, {
			iso: "NP",
			name: "Nepal",
			callingCode: "977"
		}, {
			iso: "NL",
			name: "Netherlands",
			callingCode: "31"
		}, {
			iso: "AN",
			name: "Netherlands Antilles",
			callingCode: "599"
		}, {
			iso: "NC",
			name: "New Caledonia",
			callingCode: "687"
		}, {
			iso: "NZ",
			name: "New Zealand",
			callingCode: "64"
		}, {
			iso: "NI",
			name: "Nicaragua",
			callingCode: "505"
		}, {
			iso: "NE",
			name: "Niger",
			callingCode: "227"
		}, {
			iso: "NG",
			name: "Nigeria",
			callingCode: "234"
		}, {
			iso: "NU",
			name: "Niue",
			callingCode: "683"
		}, {
			iso: "NF",
			name: "Norfolk Island",
			callingCode: "672"
		}, {
			iso: "MP",
			name: "Northern Mariana Islands",
			callingCode: "1"
		}, {
			iso: "NO",
			name: "Norway",
			callingCode: "47"
		}, {
			iso: "OM",
			name: "Oman",
			callingCode: "968"
		}, {
			iso: "PK",
			name: "Pakistan",
			callingCode: "92"
		}, {
			iso: "PW",
			name: "Palau",
			callingCode: "680"
		}, {
			iso: "PS",
			name: "Palestinian Territory, Occupied",
			callingCode: "970"
		}, {
			iso: "PA",
			name: "Panama",
			callingCode: "507"
		}, {
			iso: "PG",
			name: "Papua New Guinea",
			callingCode: "675"
		}, {
			iso: "PY",
			name: "Paraguay",
			callingCode: "595"
		}, {
			iso: "PE",
			name: "Peru",
			callingCode: "51"
		}, {
			iso: "PH",
			name: "Philippines",
			callingCode: "63"
		}, {
			iso: "PN",
			name: "Pitcairn",
			callingCode: "872"
		}, {
			iso: "PL",
			name: "Poland",
			callingCode: "48"
		}, {
			iso: "PT",
			name: "Portugal",
			callingCode: "351"
		}, {
			iso: "PR",
			name: "Puerto Rico",
			callingCode: "1"
		}, {
			iso: "QA",
			name: "Qatar",
			callingCode: "974"
		}, {
			iso: "RE",
			name: "Reunion",
			callingCode: "262"
		}, {
			iso: "RO",
			name: "Romania",
			callingCode: "40"
		}, {
			iso: "RU",
			name: "Russian Federation",
			callingCode: "7"
		}, {
			iso: "RW",
			name: "Rwanda",
			callingCode: "250"
		}, {
			iso: "SH",
			name: "Saint Helena",
			callingCode: "290"
		}, {
			iso: "KN",
			name: "Saint Kitts and Nevis",
			callingCode: "1"
		}, {
			iso: "LC",
			name: "Saint Lucia",
			callingCode: "1"
		}, {
			iso: "PM",
			name: "Saint Pierre and Miquelon",
			callingCode: "508"
		}, {
			iso: "VC",
			name: "Saint Vincent and the Grenadines",
			callingCode: "1"
		}, {
			iso: "WS",
			name: "Samoa",
			callingCode: "685"
		}, {
			iso: "SM",
			name: "San Marino",
			callingCode: "378"
		}, {
			iso: "ST",
			name: "Sao Tome and Principe",
			callingCode: "239"
		}, {
			iso: "SA",
			name: "Saudi Arabia",
			callingCode: "966"
		}, {
			iso: "SN",
			name: "Senegal",
			callingCode: "221"
		}, {
			iso: "RS",
			name: "Serbia",
			callingCode: "381"
		}, {
			iso: "SC",
			name: "Seychelles",
			callingCode: "248"
		}, {
			iso: "SL",
			name: "Sierra Leone",
			callingCode: "232"
		}, {
			iso: "SG",
			name: "Singapore",
			callingCode: "65"
		}, {
			iso: "SK",
			name: "Slovakia",
			callingCode: "421"
		}, {
			iso: "SI",
			name: "Slovenia",
			callingCode: "386"
		}, {
			iso: "SB",
			name: "Solomon Islands",
			callingCode: "677"
		}, {
			iso: "SO",
			name: "Somalia",
			callingCode: "252"
		}, {
			iso: "ZA",
			name: "South Africa",
			callingCode: "27"
		}, {
			iso: "GS",
			name: "South Georgia and the South Sandwich Islands",
			callingCode: ""
		}, {
			iso: "ES",
			name: "Spain",
			callingCode: "34"
		}, {
			iso: "LK",
			name: "Sri Lanka",
			callingCode: "94"
		}, {
			iso: "SD",
			name: "Sudan",
			callingCode: "249"
		}, {
			iso: "SR",
			name: "Suriname",
			callingCode: "597"
		}, {
			iso: "SJ",
			name: "Svalbard and Jan Mayen",
			callingCode: "79"
		}, {
			iso: "SZ",
			name: "Swaziland",
			callingCode: "268"
		}, {
			iso: "SE",
			name: "Sweden",
			callingCode: "46"
		}, {
			iso: "CH",
			name: "Switzerland",
			callingCode: "41"
		}, {
			iso: "SY",
			name: "Syrian Arab Republic",
			callingCode: "963"
		}, {
			iso: "TW",
			name: "Taiwan",
			callingCode: "886"
		}, {
			iso: "TJ",
			name: "Tajikistan",
			callingCode: "992"
		}, {
			iso: "TZ",
			name: "Tanzania, United Republic of",
			callingCode: "255"
		}, {
			iso: "TH",
			name: "Thailand",
			callingCode: "66"
		}, {
			iso: "TL",
			name: "Timor-Leste",
			callingCode: "670"
		}, {
			iso: "TG",
			name: "Togo",
			callingCode: "228"
		}, {
			iso: "TK",
			name: "Tokelau",
			callingCode: "690"
		}, {
			iso: "TO",
			name: "Tonga",
			callingCode: "676"
		}, {
			iso: "TT",
			name: "Trinidad and Tobago",
			callingCode: "1"
		}, {
			iso: "TN",
			name: "Tunisia",
			callingCode: "216"
		}, {
			iso: "TR",
			name: "Turkey",
			callingCode: "90"
		}, {
			iso: "TM",
			name: "Turkmenistan",
			callingCode: "993"
		}, {
			iso: "TC",
			name: "Turks and Caicos Islands",
			callingCode: "1"
		}, {
			iso: "TV",
			name: "Tuvalu",
			callingCode: "688"
		}, {
			iso: "UG",
			name: "Uganda",
			callingCode: "256"
		}, {
			iso: "UA",
			name: "Ukraine",
			callingCode: "380"
		}, {
			iso: "AE",
			name: "United Arab Emirates",
			callingCode: "971"
		}, {
			iso: "GB",
			name: "United Kingdom",
			callingCode: "44"
		}, {
			iso: "US",
			name: "United States",
			callingCode: "1"
		}, {
			iso: "UM",
			name: "United States Minor Outlying Islands",
			callingCode: "699"
		}, {
			iso: "UY",
			name: "Uruguay",
			callingCode: "598"
		}, {
			iso: "UZ",
			name: "Uzbekistan",
			callingCode: "998"
		}, {
			iso: "VU",
			name: "Vanuatu",
			callingCode: "678"
		}, {
			iso: "VE",
			name: "Venezuela",
			callingCode: "58"
		}, {
			iso: "VN",
			name: "Viet Nam",
			callingCode: "84"
		}, {
			iso: "VG",
			name: "Virgin Islands, British",
			callingCode: "1"
		}, {
			iso: "VI",
			name: "Virgin Islands, U.S.",
			callingCode: "1"
		}, {
			iso: "WF",
			name: "Wallis and Futuna",
			callingCode: "681"
		}, {
			iso: "EH",
			name: "Western Sahara",
			callingCode: "212"
		}, {
			iso: "YE",
			name: "Yemen",
			callingCode: "967"
		}, {
			iso: "ZM",
			name: "Zambia",
			callingCode: "260"
		}, {
			iso: "ZW",
			name: "Zimbabwe",
			callingCode: "263"
		}],
		accentMap: {
			a: "\u1e9a\u00c1\u00e1\u00c0\u00e0\u0102\u0103\u1eae\u1eaf\u1eb0\u1eb1\u1eb4\u1eb5\u1eb2\u1eb3\u00c2\u00e2\u1ea4\u1ea5\u1ea6\u1ea7\u1eaa\u1eab\u1ea8\u1ea9\u01cd\u01ce\u00c5\u00e5\u01fa\u01fb\u00c4\u00e4\u01de\u01df\u00c3\u00e3\u0226\u0227\u01e0\u01e1\u0104\u0105\u0100\u0101\u1ea2\u1ea3\u0200\u0201\u0202\u0203\u1ea0\u1ea1\u1eb6\u1eb7\u1eac\u1ead\u1e00\u1e01\u023a\u2c65\u01fc\u01fd\u01e2\u01e3\uff21\uff41",
			b: "\u1e02\u1e03\u1e04\u1e05\u1e06\u1e07\u0243\u0180\u1d6c\u0181\u0253\u0182\u0183\uff42\uff22",
			c: "\u0106\u0107\u0108\u0109\u010c\u010d\u010a\u010b\u00c7\u00e7\u1e08\u1e09\u023b\u023c\u0187\u0188\u0255\uff43\uff23",
			d: "\u010e\u010f\u1e0a\u1e0b\u1e10\u1e11\u1e0c\u1e0d\u1e12\u1e13\u1e0e\u1e0f\u0110\u0111\u1d6d\u0189\u0256\u018a\u0257\u018b\u018c\u0221\u00f0\uff44\uff24",
			e: "\u00c9\u018f\u018e\u01dd\u00e9\u00c8\u00e8\u0114\u0115\u00ca\u00ea\u1ebe\u1ebf\u1ec0\u1ec1\u1ec4\u1ec5\u1ec2\u1ec3\u011a\u011b\u00cb\u00eb\u1ebc\u1ebd\u0116\u0117\u0228\u0229\u1e1c\u1e1d\u0118\u0119\u0112\u0113\u1e16\u1e17\u1e14\u1e15\u1eba\u1ebb\u0204\u0205\u0206\u0207\u1eb8\u1eb9\u1ec6\u1ec7\u1e18\u1e19\u1e1a\u1e1b\u0246\u0247\u025a\u025d\uff45\uff25",
			f: "\u1e1e\u1e1f\u1d6e\u0191\u0192\uff46\uff26",
			g: "\u01f4\u01f5\u011e\u011f\u011c\u011d\u01e6\u01e7\u0120\u0121\u0122\u0123\u1e20\u1e21\u01e4\u01e5\u0193\u0260\uff47\uff27",
			h: "\u0124\u0125\u021e\u021f\u1e26\u1e27\u1e22\u1e23\u1e28\u1e29\u1e24\u1e25\u1e2a\u1e2bH\u1e96\u0126\u0127\u2c67\u2c68\uff48\uff28",
			i: "\u00cd\u00cc\u00ec\u012c\u012d\u00ce\u00ee\u01cf\u01d0\u00cf\u00ef\u1e2e\u1e2f\u0128\u0129\u0130i\u012e\u012f\u012a\u012b\u1ec8\u1ec9\u0208\u0209\u020a\u020b\u1eca\u1ecb\u1e2c\u1e2dI\u0131\u0197\u0268\uff49\uff29",
			j: "\u0135J\u01f0\u0237\u0248\u0249\u029d\u025f\u0284\uff4a\uff2a\u0134",
			k: "\u2c69\u1e30\u2c6a\uff4b\uff2b\u1e31\u01e9\u01e8\u0137\u0136\u1e33\u1e32\u1e35\u1e34\u0199\u0198",
			l: "\u023d\u019a\u026b\u026c\u026d\u0234\u2c60\u2c61\u2c62\uff4c\uff2c\u013a\u0139\u013e\u013d\u0140\u013f\u0142\u0142\u0141\u0141\u013c\u013b\u1e39\u1e37\u1e38\u1e36\u1e3d\u1e3c\u1e3b\u1e3a",
			m: "\u0271\uff4d\uff2d\u1e3f\u1e3e\u1e41\u1e40\u1e43\u1e42",
			n: "\u019d\u0272\u0220\u019e\u0273\u0235\uff4e\uff2enN\u0144\u0143\u01f9\u01f8\u0148\u0147\u00f1\u00d1\u1e45\u1e44\u0146\u0145\u1e47\u1e46\u1e4b\u1e4a\u1e49\u1e48",
			o: "\uff4f\uff2f\u00f3\u00d3\u00f2\u00d2\u014f\u014e\u1ed1\u1ed3\u1ed7\u1ed5\u1ed9\u00f4\u1ed0\u1ed2\u1ed6\u1ed4\u1ed8\u00d4\u01d2\u01d1\u022b\u00f6\u0275\u022a\u00d6\u019f\u0151\u0150\u1e4d\u1e4f\u022d\u00f5\u1e4c\u1e4e\u022c\u00d5\u0231\u022f\u0230\u022e\u01ff\u00f8\u01fe\u00d8\u01ed\u01eb\u01ec\u01ea\u1e53\u1e51\u014d\u1e52\u1e50\u014c\u1ecf\u1ece\u020d\u020c\u020f\u020e\u1ecd\u1ecc\u1edb\u1edd\u1ee1\u1edf\u1ee3\u01a1\u1eda\u1edc\u1ee0\u1ede\u1ee2\u01a0",
			p: "\u01a4\u01a5\u2c63\uff50\uff30pP\u1e55\u1e54\u1e57\u1e56",
			q: "\u02a0\u024a\u024b\uff51\uff31",
			r: "\u024c\u024d\u027c\u027d\u027e\u1d72\u2c64\u1d73\uff52\uff32\u0155\u0154\u0159\u0158\u1e59\u1e58\u0157\u0156\u0211\u0210\u0213\u0212\u1e5d\u1e5b\u1e5c\u1e5a\u1e5f\u1e5e",
			s: "\u0282\uff53\uff33sS\u1e65\u015b\u1e64\u015a\u015d\u015c\u1e67\u0161\u1e66\u0160\u1e61\u1e60\u015f\u0219\u015e\u0218\u1e69\u1e63\u1e68\u1e62\u1e9b\u00df",
			t: "\u023e\u01ab\u01ac\u01ad\u01ae\u0288\u0236\u2c66\u1d75\uff54\uff34T\u0165\u0164\u1e97\u1e6b\u1e6a\u0167\u0166\u0163\u021b\u0162\u021a\u1e6d\u1e6c\u1e71\u1e70\u1e6f\u1e6e\u00fe\u00de",
			u: "\u0214\u0216\u0244\u0289\uff55\uff35\u00fa\u00da\u00f9\u00d9\u016d\u016c\u00fb\u00db\u01d4\u01d3\u016f\u016e\u01d8\u01dc\u01da\u01d6\u00fc\u01d7\u01db\u01d9\u01d5\u00dc\u0171\u0170\u1e79\u0169\u1e78\u0168\u0173\u0172\u1e7b\u016b\u1e7a\u016a\u1ee7\u1ee6\u0215\u0217\u1ee5\u1ee4\u1e73\u1e72\u1e77\u1e76\u1e75\u1e74\u1ee9\u1eeb\u1eef\u1eed\u1ef1\u01b0\u1ee8\u1eea\u1eee\u1eec\u1ef0\u01af",
			v: "\u01b2\u028b\uff56\uff36\u1e7d\u1e7c\u1e7f\u1e7e",
			w: "\uff57\uff37W\u1e83\u1e82\u1e81\u1e80\u0175\u0174\u1e98\u1e85\u1e84\u1e87\u1e86\u1e89\u1e88",
			x: "\uff58\uff38\u1e8d\u1e8c\u1e8b\u1e8a",
			y: "\u028f\u024e\u024f\uff59\uff39Y\u00fd\u00dd\u1ef3\u1ef2\u0177\u0176\u1e99\u00ff\u0178\u1ef9\u1ef8\u1e8f\u1e8e\u0233\u0232\u1ef7\u1ef6\u1ef5\u1ef4\u01b4\u01b3",
			z: "\u0290\u0291\u01ba\u2c6b\u2c6c\uff5a\uff3a\u017a\u0179\u1e91\u1e90\u017e\u017d\u017c\u017b\u01b6\u01b5\u1e93\u1e92\u1e95\u1e94\u0225\u0224\u01ef\u01ee"
		},
		foldedAccents: {},
		unfoldAccents: function (d) {
			return d
		},
		randWeightedIndex: function (d) {
			var g, c, e;
			g = 0;
			for (e in d) if (d.hasOwnProperty(e)) g += d[e];
			c = Math.random() * g;
			for (e in d) if (d.hasOwnProperty(e)) {
				g = d[e];
				if (c <= g) return e;
				else c -= g
			}
			return 0
		}
	};
	if (!Array.prototype.indexOf) Array.prototype.indexOf = function (d, g) {
		var c = this.length >>> 0,
			e = Number(g) || 0;
		e = e < 0 ? Math.ceil(e) : Math.floor(e);
		if (e < 0) e += c;
		for (; e < c; e++) if (e in this && this[e] === d) return e;
		return -1
	}
})();
if (!this.JSON) this.JSON = {};
(function () {
	function a(q) {
		return q < 10 ? "0" + q : q
	}
	function d(q) {
		e.lastIndex = 0;
		return e.test(q) ? '"' + q.replace(e, function (v) {
			var w = j[v];
			return typeof w === "string" ? w : "\\u" + ("0000" + v.charCodeAt(0).toString(16)).slice(-4)
		}) + '"' : '"' + q + '"'
	}
	function g(q, v) {
		var w, E, A, B, G = b,
			x, D = v[q];
		if (D && typeof D === "object" && typeof D.toJSON === "function") D = D.toJSON(q);
		if (typeof o === "function") D = o.call(v, q, D);
		switch (typeof D) {
		case "string":
			return d(D);
		case "number":
			return isFinite(D) ? String(D) : "null";
		case "boolean":
		case "null":
			return String(D);
		case "object":
			if (!D) return "null";
			b += f;
			x = [];
			if (Object.prototype.toString.apply(D) === "[object Array]") {
				B = D.length;
				for (w = 0; w < B; w += 1) x[w] = g(w, D) || "null";
				A = x.length === 0 ? "[]" : b ? "[\n" + b + x.join(",\n" + b) + "\n" + G + "]" : "[" + x.join(",") + "]";
				b = G;
				return A
			}
			if (o && typeof o === "object") {
				B = o.length;
				for (w = 0; w < B; w += 1) {
					E = o[w];
					if (typeof E === "string") if (A = g(E, D)) x.push(d(E) + (b ? ": " : ":") + A)
				}
			} else for (E in D) if (Object.hasOwnProperty.call(D, E)) if (A = g(E, D)) x.push(d(E) + (b ? ": " : ":") + A);
			A = x.length === 0 ? "{}" : b ? "{\n" + b + x.join(",\n" + b) + "\n" + G + "}" : "{" + x.join(",") + "}";
			b = G;
			return A
		}
	}
	if (typeof Date.prototype.toJSON !== "function") {
		Date.prototype.toJSON = function () {
			return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + a(this.getUTCMonth() + 1) + "-" + a(this.getUTCDate()) + "T" + a(this.getUTCHours()) + ":" + a(this.getUTCMinutes()) + ":" + a(this.getUTCSeconds()) + "Z" : null
		};
		String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
			return this.valueOf()
		}
	}
	var c = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		e = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		b, f, j = {
			"\u0008": "\\b",
			"\t": "\\t",
			"\n": "\\n",
			"\u000c": "\\f",
			"\r": "\\r",
			'"': '\\"',
			"\\": "\\\\"
		},
		o;
	if (typeof JSON.stringify !== "function") JSON.stringify = function (q, v, w) {
		var E;
		f = b = "";
		if (typeof w === "number") for (E = 0; E < w; E += 1) f += " ";
		else if (typeof w === "string") f = w;
		if ((o = v) && typeof v !== "function" && (typeof v !== "object" || typeof v.length !== "number")) throw Error("JSON.stringify");
		return g("", {
			"": q
		})
	};
	if (typeof JSON.parse !== "function") JSON.parse = function (q, v) {
		function w(A, B) {
			var G, x, D = A[B];
			if (D && typeof D === "object") for (G in D) if (Object.hasOwnProperty.call(D, G)) {
				x = w(D, G);
				if (x !== undefined) D[G] = x;
				else delete D[G]
			}
			return v.call(A, B, D)
		}
		var E;
		q = String(q);
		c.lastIndex = 0;
		if (c.test(q)) q = q.replace(c, function (A) {
			return "\\u" + ("0000" + A.charCodeAt(0).toString(16)).slice(-4)
		});
		if (/^[\],:{}\s]*$/.test(q.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
			E = eval("(" + q + ")");
			return typeof v === "function" ? w({
				"": E
			}, "") : E
		}
		throw new SyntaxError("JSON.parse");
	}
})();
var store = function () {
	var a = {},
		d = window,
		g = d.document,
		c;
	a.set = function () {};
	a.get = function () {};
	a.remove = function () {};
	a.clear = function () {};
	a.transact = function (b, f) {
		var j = a.get(b);
		if (typeof j == "undefined") j = {};
		f(j);
		a.set(b, j)
	};
	a.serialize = function (b) {
		return JSON.stringify(b)
	};
	a.deserialize = function (b) {
		if (typeof b == "string") return JSON.parse(b)
	};
	try {
		if ("localStorage" in d && d.localStorage) {
			c = d.localStorage;
			a.set = function (b, f) {
				c.setItem(b, a.serialize(f))
			};
			a.get = function (b) {
				return a.deserialize(c.getItem(b))
			};
			a.remove = function (b) {
				c.removeItem(b)
			};
			a.clear = function () {
				c.clear()
			}
		} else if ("globalStorage" in d && d.globalStorage) {
			c = d.globalStorage[d.location.hostname];
			a.set = function (b, f) {
				c[b] = a.serialize(f)
			};
			a.get = function (b) {
				return a.deserialize(c[b] && c[b].value)
			};
			a.remove = function (b) {
				delete c[b]
			};
			a.clear = function () {
				for (var b in c) delete c[b]
			}
		} else if (g.documentElement.addBehavior) {
			c = g.createElement("div");
			d = function (b) {
				return function () {
					var f = Array.prototype.slice.call(arguments, 0);
					f.unshift(c);
					g.body.appendChild(c);
					c.addBehavior("#default#userData");
					c.load("localStorage");
					f = b.apply(a, f);
					g.body.removeChild(c);
					return f
				}
			};
			a.set = d(function (b, f, j) {
				b.setAttribute(f, a.serialize(j));
				b.save("localStorage")
			});
			a.get = d(function (b, f) {
				return a.deserialize(b.getAttribute(f))
			});
			a.remove = d(function (b, f) {
				b.removeAttribute(f);
				b.save("localStorage")
			});
			a.clear = d(function (b) {
				var f = b.XMLDocument.documentElement.attributes;
				b.load("localStorage");
				for (var j = 0, o; o = f[j]; j++) b.removeAttribute(o.name);
				b.save("localStorage")
			})
		}
	} catch (e) {}
	return a
}();
(function (a, d, g) {
	function c(v) {
		v = v || location.href;
		return "#" + v.replace(/^[^#]*#?(.*)$/, "$1")
	}
	var e = "hashchange",
		b = document,
		f, j = a.event.special,
		o = b.documentMode,
		q = "on" + e in d && (o === g || o > 7);
	a.fn[e] = function (v) {
		return v ? this.bind(e, v) : this.trigger(e)
	};
	a.fn[e].delay = 50;
	j[e] = a.extend(j[e], {
		setup: function () {
			if (q) return false;
			a(f.start)
		},
		teardown: function () {
			if (q) return false;
			a(f.stop)
		}
	});
	f = function () {
		function v() {
			var D = c(),
				F = x(A);
			if (D !== A) {
				G(A = D, F);
				a(d).trigger(e)
			} else if (F !== A) location.href = location.href.replace(/#.*/, "") + F;
			E = setTimeout(v, a.fn[e].delay)
		}
		var w = {},
			E, A = c(),
			B = function (D) {
				return D
			},
			G = B,
			x = B;
		w.start = function () {
			E || v()
		};
		w.stop = function () {
			E && clearTimeout(E);
			E = g
		};
		a.browser.msie && !q &&
		function () {
			var D, F;
			w.start = function () {
				if (!D) {
					F = (F = a.fn[e].src) && F + c();
					D = a('<iframe tabindex="-1" title="empty"/>').hide().one("load", function () {
						F || G(c());
						v()
					}).attr("src", F || "javascript:0").insertAfter("body")[0].contentWindow;
					b.onpropertychange = function () {
						try {
							if (event.propertyName === "title") D.document.title = b.title
						} catch (R) {}
					}
				}
			};
			w.stop = B;
			x = function () {
				return c(D.location.href)
			};
			G = function (R, X) {
				var ea = D.document,
					W = a.fn[e].domain;
				if (R !== X) {
					ea.title = b.title;
					ea.open();
					W && ea.write('<script>document.domain="' + W + '"<\/script>');
					ea.close();
					D.location.hash = R
				}
			}
		}();
		return w
	}()
})(jQuery, this);
(function (a, d) {
	function g(c) {
		return !a(c).parents().andSelf().filter(function () {
			return a.curCSS(this, "visibility") === "hidden" || a.expr.filters.hidden(this)
		}).length
	}
	a.ui = a.ui || {};
	if (!a.ui.version) {
		a.extend(a.ui, {
			version: "1.8.7",
			plugin: {
				add: function (c, e, b) {
					c = a.ui[c].prototype;
					for (var f in b) {
						c.plugins[f] = c.plugins[f] || [];
						c.plugins[f].push([e, b[f]])
					}
				},
				call: function (c, e, b) {
					if ((e = c.plugins[e]) && c.element[0].parentNode) for (var f = 0; f < e.length; f++) c.options[e[f][0]] && e[f][1].apply(c.element, b)
				}
			},
			contains: function (c, e) {
				return document.compareDocumentPosition ? c.compareDocumentPosition(e) & 16 : c !== e && c.contains(e)
			},
			hasScroll: function (c, e) {
				if (a(c).css("overflow") === "hidden") return false;
				var b = e && e === "left" ? "scrollLeft" : "scrollTop",
					f = false;
				if (c[b] > 0) return true;
				c[b] = 1;
				f = c[b] > 0;
				c[b] = 0;
				return f
			},
			isOverAxis: function (c, e, b) {
				return c > e && c < e + b
			},
			isOver: function (c, e, b, f, j, o) {
				return a.ui.isOverAxis(c, b, j) && a.ui.isOverAxis(e, f, o)
			},
			keyCode: {
				ALT: 18,
				BACKSPACE: 8,
				CAPS_LOCK: 20,
				COMMA: 188,
				COMMAND: 91,
				COMMAND_LEFT: 91,
				COMMAND_RIGHT: 93,
				CONTROL: 17,
				DELETE: 46,
				DOWN: 40,
				END: 35,
				ENTER: 13,
				ESCAPE: 27,
				HOME: 36,
				INSERT: 45,
				LEFT: 37,
				MENU: 93,
				NUMPAD_ADD: 107,
				NUMPAD_DECIMAL: 110,
				NUMPAD_DIVIDE: 111,
				NUMPAD_ENTER: 108,
				NUMPAD_MULTIPLY: 106,
				NUMPAD_SUBTRACT: 109,
				PAGE_DOWN: 34,
				PAGE_UP: 33,
				PERIOD: 190,
				RIGHT: 39,
				SHIFT: 16,
				SPACE: 32,
				TAB: 9,
				UP: 38,
				WINDOWS: 91
			}
		});
		a.fn.extend({
			_focus: a.fn.focus,
			focus: function (c, e) {
				return typeof c === "number" ? this.each(function () {
					var b = this;
					setTimeout(function () {
						a(b).focus();
						e && e.call(b)
					}, c)
				}) : this._focus.apply(this, arguments)
			},
			scrollParent: function () {
				var c;
				c = a.browser.msie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? this.parents().filter(function () {
					return /(relative|absolute|fixed)/.test(a.curCSS(this, "position", 1)) && /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
				}).eq(0) : this.parents().filter(function () {
					return /(auto|scroll)/.test(a.curCSS(this, "overflow", 1) + a.curCSS(this, "overflow-y", 1) + a.curCSS(this, "overflow-x", 1))
				}).eq(0);
				return /fixed/.test(this.css("position")) || !c.length ? a(document) : c
			},
			zIndex: function (c) {
				if (c !== d) return this.css("zIndex", c);
				if (this.length) {
					c = a(this[0]);
					for (var e; c.length && c[0] !== document;) {
						e = c.css("position");
						if (e === "absolute" || e === "relative" || e === "fixed") {
							e = parseInt(c.css("zIndex"), 10);
							if (!isNaN(e) && e !== 0) return e
						}
						c = c.parent()
					}
				}
				return 0
			},
			disableSelection: function () {
				return this.bind((a.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function (c) {
					c.preventDefault()
				})
			},
			enableSelection: function () {
				return this.unbind(".ui-disableSelection")
			}
		});
		a.each(["Width", "Height"], function (c, e) {
			function b(q, v, w, E) {
				a.each(f, function () {
					v -= parseFloat(a.curCSS(q, "padding" + this, true)) || 0;
					if (w) v -= parseFloat(a.curCSS(q, "border" + this + "Width", true)) || 0;
					if (E) v -= parseFloat(a.curCSS(q, "margin" + this, true)) || 0
				});
				return v
			}
			var f = e === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
				j = e.toLowerCase(),
				o = {
					innerWidth: a.fn.innerWidth,
					innerHeight: a.fn.innerHeight,
					outerWidth: a.fn.outerWidth,
					outerHeight: a.fn.outerHeight
				};
			a.fn["inner" + e] = function (q) {
				if (q === d) return o["inner" + e].call(this);
				return this.each(function () {
					a(this).css(j, b(this, q) + "px")
				})
			};
			a.fn["outer" + e] = function (q, v) {
				if (typeof q !== "number") return o["outer" + e].call(this, q);
				return this.each(function () {
					a(this).css(j, b(this, q, true, v) + "px")
				})
			}
		});
		a.extend(a.expr[":"], {
			data: function (c, e, b) {
				return !!a.data(c, b[3])
			},
			focusable: function (c) {
				var e = c.nodeName.toLowerCase(),
					b = a.attr(c, "tabindex");
				if ("area" === e) {
					e = c.parentNode;
					b = e.name;
					if (!c.href || !b || e.nodeName.toLowerCase() !== "map") return false;
					c = a("img[usemap=#" + b + "]")[0];
					return !!c && g(c)
				}
				return (/input|select|textarea|button|object/.test(e) ? !c.disabled : "a" == e ? c.href || !isNaN(b) : !isNaN(b)) && g(c)
			},
			tabbable: function (c) {
				var e = a.attr(c, "tabindex");
				return (isNaN(e) || e >= 0) && a(c).is(":focusable")
			}
		});
		a(function () {
			var c = document.body,
				e = c.appendChild(e = document.createElement("div"));
			a.extend(e.style, {
				minHeight: "100px",
				height: "auto",
				padding: 0,
				borderWidth: 0
			});
			a.support.minHeight = e.offsetHeight === 100;
			a.support.selectstart = "onselectstart" in e;
			c.removeChild(e).style.display = "none"
		});
		a.extend(a.ui, {
			plugin: {
				add: function (c, e, b) {
					c = a.ui[c].prototype;
					for (var f in b) {
						c.plugins[f] = c.plugins[f] || [];
						c.plugins[f].push([e, b[f]])
					}
				},
				call: function (c, e, b) {
					if ((e = c.plugins[e]) && c.element[0].parentNode) for (var f = 0; f < e.length; f++) c.options[e[f][0]] && e[f][1].apply(c.element, b)
				}
			},
			contains: function (c, e) {
				return document.compareDocumentPosition ? c.compareDocumentPosition(e) & 16 : c !== e && c.contains(e)
			},
			hasScroll: function (c, e) {
				if (a(c).css("overflow") === "hidden") return false;
				var b = e && e === "left" ? "scrollLeft" : "scrollTop",
					f = false;
				if (c[b] > 0) return true;
				c[b] = 1;
				f = c[b] > 0;
				c[b] = 0;
				return f
			},
			isOverAxis: function (c, e, b) {
				return c > e && c < e + b
			},
			isOver: function (c, e, b, f, j, o) {
				return a.ui.isOverAxis(c, b, j) && a.ui.isOverAxis(e, f, o)
			}
		})
	}
})(jQuery);
(function (a, d) {
	if (a.cleanData) {
		var g = a.cleanData;
		a.cleanData = function (e) {
			for (var b = 0, f;
			(f = e[b]) != null; b++) a(f).triggerHandler("remove");
			g(e)
		}
	} else {
		var c = a.fn.remove;
		a.fn.remove = function (e, b) {
			return this.each(function () {
				if (!b) if (!e || a.filter(e, [this]).length) a("*", this).add([this]).each(function () {
					a(this).triggerHandler("remove")
				});
				return c.call(a(this), e, b)
			})
		}
	}
	a.widget = function (e, b, f) {
		var j = e.split(".")[0],
			o;
		e = e.split(".")[1];
		o = j + "-" + e;
		if (!f) {
			f = b;
			b = a.Widget
		}
		a.expr[":"][o] = function (q) {
			return !!a.data(q, e)
		};
		a[j] = a[j] || {};
		a[j][e] = function (q, v) {
			arguments.length && this._createWidget(q, v)
		};
		b = new b;
		b.options = a.extend(true, {}, b.options);
		a[j][e].prototype = a.extend(true, b, {
			namespace: j,
			widgetName: e,
			widgetEventPrefix: a[j][e].prototype.widgetEventPrefix || e,
			widgetBaseClass: o
		}, f);
		a.widget.bridge(e, a[j][e])
	};
	a.widget.bridge = function (e, b) {
		a.fn[e] = function (f) {
			var j = typeof f === "string",
				o = Array.prototype.slice.call(arguments, 1),
				q = this;
			f = !j && o.length ? a.extend.apply(null, [true, f].concat(o)) : f;
			if (j && f.charAt(0) === "_") return q;
			j ? this.each(function () {
				var v = a.data(this, e),
					w = v && a.isFunction(v[f]) ? v[f].apply(v, o) : v;
				if (w !== v && w !== d) {
					q = w;
					return false
				}
			}) : this.each(function () {
				var v = a.data(this, e);
				v ? v.option(f || {})._init() : a.data(this, e, new b(f, this))
			});
			return q
		}
	};
	a.Widget = function (e, b) {
		arguments.length && this._createWidget(e, b)
	};
	a.Widget.prototype = {
		widgetName: "widget",
		widgetEventPrefix: "",
		options: {
			disabled: false
		},
		_createWidget: function (e, b) {
			a.data(b, this.widgetName, this);
			this.element = a(b);
			this.options = a.extend(true, {}, this.options, this._getCreateOptions(), e);
			var f = this;
			this.element.bind("remove." + this.widgetName, function () {
				f.destroy()
			});
			this._create();
			this._trigger("create");
			this._init()
		},
		_getCreateOptions: function () {
			return a.metadata && a.metadata.get(this.element[0])[this.widgetName]
		},
		_create: function () {},
		_init: function () {},
		destroy: function () {
			this.element.unbind("." + this.widgetName).removeData(this.widgetName);
			this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled ui-state-disabled")
		},
		widget: function () {
			return this.element
		},
		option: function (e, b) {
			var f = e;
			if (arguments.length === 0) return a.extend({}, this.options);
			if (typeof e === "string") {
				if (b === d) return this.options[e];
				f = {};
				f[e] = b
			}
			this._setOptions(f);
			return this
		},
		_setOptions: function (e) {
			var b = this;
			a.each(e, function (f, j) {
				b._setOption(f, j)
			});
			return this
		},
		_setOption: function (e, b) {
			this.options[e] = b;
			if (e === "disabled") this.widget()[b ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled ui-state-disabled").attr("aria-disabled", b);
			return this
		},
		enable: function () {
			return this._setOption("disabled", false)
		},
		disable: function () {
			return this._setOption("disabled", true)
		},
		_trigger: function (e, b, f) {
			var j = this.options[e];
			b = a.Event(b);
			b.type = (e === this.widgetEventPrefix ? e : this.widgetEventPrefix + e).toLowerCase();
			f = f || {};
			if (b.originalEvent) {
				e = a.event.props.length;
				for (var o; e;) {
					o = a.event.props[--e];
					b[o] = b.originalEvent[o]
				}
			}
			this.element.trigger(b, f);
			return !(a.isFunction(j) && j.call(this.element[0], b, f) === false || b.isDefaultPrevented())
		}
	}
})(jQuery);
(function (a) {
	a.widget("ui.mouse", {
		options: {
			cancel: ":input,option",
			distance: 1,
			delay: 0
		},
		_mouseInit: function () {
			var d = this;
			this.element.bind("mousedown." + this.widgetName, function (g) {
				return d._mouseDown(g)
			}).bind("click." + this.widgetName, function (g) {
				if (true === a.data(g.target, d.widgetName + ".preventClickEvent")) {
					a.removeData(g.target, d.widgetName + ".preventClickEvent");
					g.stopImmediatePropagation();
					return false
				}
			});
			this.started = false
		},
		_mouseDestroy: function () {
			this.element.unbind("." + this.widgetName)
		},
		_mouseDown: function (d) {
			d.originalEvent = d.originalEvent || {};
			if (!d.originalEvent.mouseHandled) {
				this._mouseStarted && this._mouseUp(d);
				this._mouseDownEvent = d;
				var g = this,
					c = d.which == 1,
					e = typeof this.options.cancel == "string" ? a(d.target).parents().add(d.target).filter(this.options.cancel).length : false;
				if (!c || e || !this._mouseCapture(d)) return true;
				this.mouseDelayMet = !this.options.delay;
				if (!this.mouseDelayMet) this._mouseDelayTimer = setTimeout(function () {
					g.mouseDelayMet = true
				}, this.options.delay);
				if (this._mouseDistanceMet(d) && this._mouseDelayMet(d)) {
					this._mouseStarted = this._mouseStart(d) !== false;
					if (!this._mouseStarted) {
						d.preventDefault();
						return true
					}
				}
				this._mouseMoveDelegate = function (b) {
					return g._mouseMove(b)
				};
				this._mouseUpDelegate = function (b) {
					return g._mouseUp(b)
				};
				a(document).bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate);
				d.preventDefault();
				return d.originalEvent.mouseHandled = true
			}
		},
		_mouseMove: function (d) {
			if (a.browser.msie && !(document.documentMode >= 9) && !d.button) return this._mouseUp(d);
			if (this._mouseStarted) {
				this._mouseDrag(d);
				return d.preventDefault()
			}
			if (this._mouseDistanceMet(d) && this._mouseDelayMet(d))(this._mouseStarted = this._mouseStart(this._mouseDownEvent, d) !== false) ? this._mouseDrag(d) : this._mouseUp(d);
			return !this._mouseStarted
		},
		_mouseUp: function (d) {
			a(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
			if (this._mouseStarted) {
				this._mouseStarted = false;
				d.target == this._mouseDownEvent.target && a.data(d.target, this.widgetName + ".preventClickEvent", true);
				this._mouseStop(d)
			}
			return false
		},
		_mouseDistanceMet: function (d) {
			return Math.max(Math.abs(this._mouseDownEvent.pageX - d.pageX), Math.abs(this._mouseDownEvent.pageY - d.pageY)) >= this.options.distance
		},
		_mouseDelayMet: function () {
			return this.mouseDelayMet
		},
		_mouseStart: function () {},
		_mouseDrag: function () {},
		_mouseStop: function () {},
		_mouseCapture: function () {
			return true
		}
	})
})(jQuery);
(function (a) {
	a.ui = a.ui || {};
	var d = /left|center|right/,
		g = /top|center|bottom/,
		c = a.fn.position,
		e = a.fn.offset;
	a.fn.position = function (b) {
		if (!b || !b.of) return c.apply(this, arguments);
		b = a.extend({}, b);
		var f = a(b.of),
			j = f[0],
			o = (b.collision || "flip").split(" "),
			q = b.offset ? b.offset.split(" ") : [0, 0],
			v, w, E;
		if (j.nodeType === 9) {
			v = f.width();
			w = f.height();
			E = {
				top: 0,
				left: 0
			}
		} else if (j.setTimeout) {
			v = f.width();
			w = f.height();
			E = {
				top: f.scrollTop(),
				left: f.scrollLeft()
			}
		} else if (j.preventDefault) {
			b.at = "left top";
			v = w = 0;
			E = {
				top: b.of.pageY,
				left: b.of.pageX
			}
		} else {
			v = f.outerWidth();
			w = f.outerHeight();
			E = f.offset()
		}
		a.each(["my", "at"], function () {
			var A = (b[this] || "").split(" ");
			if (A.length === 1) A = d.test(A[0]) ? A.concat(["center"]) : g.test(A[0]) ? ["center"].concat(A) : ["center", "center"];
			A[0] = d.test(A[0]) ? A[0] : "center";
			A[1] = g.test(A[1]) ? A[1] : "center";
			b[this] = A
		});
		if (o.length === 1) o[1] = o[0];
		q[0] = parseInt(q[0], 10) || 0;
		if (q.length === 1) q[1] = q[0];
		q[1] = parseInt(q[1], 10) || 0;
		if (b.at[0] === "right") E.left += v;
		else if (b.at[0] === "center") E.left += v / 2;
		if (b.at[1] === "bottom") E.top += w;
		else if (b.at[1] === "center") E.top += w / 2;
		E.left += q[0];
		E.top += q[1];
		return this.each(function () {
			var A = a(this),
				B = A.outerWidth(),
				G = A.outerHeight(),
				x = parseInt(a.curCSS(this, "marginLeft", true)) || 0,
				D = parseInt(a.curCSS(this, "marginTop", true)) || 0,
				F = B + x + parseInt(a.curCSS(this, "marginRight", true)) || 0,
				R = G + D + parseInt(a.curCSS(this, "marginBottom", true)) || 0,
				X = a.extend({}, E),
				ea;
			if (b.my[0] === "right") X.left -= B;
			else if (b.my[0] === "center") X.left -= B / 2;
			if (b.my[1] === "bottom") X.top -= G;
			else if (b.my[1] === "center") X.top -= G / 2;
			X.left = Math.round(X.left);
			X.top = Math.round(X.top);
			ea = {
				left: X.left - x,
				top: X.top - D
			};
			a.each(["left", "top"], function (W, M) {
				a.ui.position[o[W]] && a.ui.position[o[W]][M](X, {
					targetWidth: v,
					targetHeight: w,
					elemWidth: B,
					elemHeight: G,
					collisionPosition: ea,
					collisionWidth: F,
					collisionHeight: R,
					offset: q,
					my: b.my,
					at: b.at
				})
			});
			a.fn.bgiframe && A.bgiframe();
			A.offset(a.extend(X, {
				using: b.using
			}))
		})
	};
	a.ui.position = {
		fit: {
			left: function (b, f) {
				var j = a(window);
				j = f.collisionPosition.left + f.collisionWidth - j.width() - j.scrollLeft();
				b.left = j > 0 ? b.left - j : Math.max(b.left - f.collisionPosition.left, b.left)
			},
			top: function (b, f) {
				var j = a(window);
				j = f.collisionPosition.top + f.collisionHeight - j.height() - j.scrollTop();
				b.top = j > 0 ? b.top - j : Math.max(b.top - f.collisionPosition.top, b.top)
			}
		},
		flip: {
			left: function (b, f) {
				if (f.at[0] !== "center") {
					var j = a(window);
					j = f.collisionPosition.left + f.collisionWidth - j.width() - j.scrollLeft();
					var o = f.my[0] === "left" ? -f.elemWidth : f.my[0] === "right" ? f.elemWidth : 0,
						q = f.at[0] === "left" ? f.targetWidth : -f.targetWidth,
						v = -2 * f.offset[0];
					b.left += f.collisionPosition.left < 0 ? o + q + v : j > 0 ? o + q + v : 0
				}
			},
			top: function (b, f) {
				if (f.at[1] !== "center") {
					var j = a(window);
					j = f.collisionPosition.top + f.collisionHeight - j.height() - j.scrollTop();
					var o = f.my[1] === "top" ? -f.elemHeight : f.my[1] === "bottom" ? f.elemHeight : 0,
						q = f.at[1] === "top" ? f.targetHeight : -f.targetHeight,
						v = -2 * f.offset[1];
					b.top += f.collisionPosition.top < 0 ? o + q + v : j > 0 ? o + q + v : 0
				}
			}
		}
	};
	if (!a.offset.setOffset) {
		a.offset.setOffset = function (b, f) {
			if (/static/.test(a.curCSS(b, "position"))) b.style.position = "relative";
			var j = a(b),
				o = j.offset(),
				q = parseInt(a.curCSS(b, "top", true), 10) || 0,
				v = parseInt(a.curCSS(b, "left", true), 10) || 0;
			o = {
				top: f.top - o.top + q,
				left: f.left - o.left + v
			};
			"using" in f ? f.using.call(b, o) : j.css(o)
		};
		a.fn.offset = function (b) {
			var f = this[0];
			if (!f || !f.ownerDocument) return null;
			if (b) return this.each(function () {
				a.offset.setOffset(this, b)
			});
			return e.call(this)
		}
	}
})(jQuery);
(function (a) {
	a.widget("ui.draggable", a.ui.mouse, {
		widgetEventPrefix: "drag",
		options: {
			addClasses: true,
			appendTo: "parent",
			axis: false,
			connectToSortable: false,
			containment: false,
			cursor: "auto",
			cursorAt: false,
			grid: false,
			handle: false,
			helper: "original",
			iframeFix: false,
			opacity: false,
			refreshPositions: false,
			revert: false,
			revertDuration: 500,
			scope: "default",
			scroll: true,
			scrollSensitivity: 20,
			scrollSpeed: 20,
			snap: false,
			snapMode: "both",
			snapTolerance: 20,
			stack: false,
			zIndex: false
		},
		_create: function () {
			if (this.options.helper == "original" && !/^(?:r|a|f)/.test(this.element.css("position"))) this.element[0].style.position = "relative";
			this.options.addClasses && this.element.addClass("ui-draggable");
			this.options.disabled && this.element.addClass("ui-draggable-disabled");
			this._mouseInit()
		},
		destroy: function () {
			if (this.element.data("draggable")) {
				this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");
				this._mouseDestroy();
				return this
			}
		},
		_mouseCapture: function (d) {
			var g = this.options;
			if (this.helper || g.disabled || a(d.target).is(".ui-resizable-handle")) return false;
			this.handle = this._getHandle(d);
			if (!this.handle) return false;
			return true
		},
		_mouseStart: function (d) {
			var g = this.options;
			this.helper = this._createHelper(d);
			this._cacheHelperProportions();
			if (a.ui.ddmanager) a.ui.ddmanager.current = this;
			this._cacheMargins();
			this.cssPosition = this.helper.css("position");
			this.scrollParent = this.helper.scrollParent();
			this.offset = this.positionAbs = this.element.offset();
			this.offset = {
				top: this.offset.top - this.margins.top,
				left: this.offset.left - this.margins.left
			};
			a.extend(this.offset, {
				click: {
					left: d.pageX - this.offset.left,
					top: d.pageY - this.offset.top
				},
				parent: this._getParentOffset(),
				relative: this._getRelativeOffset()
			});
			this.originalPosition = this.position = this._generatePosition(d);
			this.originalPageX = d.pageX;
			this.originalPageY = d.pageY;
			g.cursorAt && this._adjustOffsetFromHelper(g.cursorAt);
			g.containment && this._setContainment();
			if (this._trigger("start", d) === false) {
				this._clear();
				return false
			}
			this._cacheHelperProportions();
			a.ui.ddmanager && !g.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, d);
			this.helper.addClass("ui-draggable-dragging");
			this._mouseDrag(d, true);
			return true
		},
		_mouseDrag: function (d, g) {
			this.position = this._generatePosition(d);
			this.positionAbs = this._convertPositionTo("absolute");
			if (!g) {
				var c = this._uiHash();
				if (this._trigger("drag", d, c) === false) {
					this._mouseUp({});
					return false
				}
				this.position = c.position
			}
			if (!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left + "px";
			if (!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top + "px";
			a.ui.ddmanager && a.ui.ddmanager.drag(this, d);
			return false
		},
		_mouseStop: function (d) {
			var g = false;
			if (a.ui.ddmanager && !this.options.dropBehaviour) g = a.ui.ddmanager.drop(this, d);
			if (this.dropped) {
				g = this.dropped;
				this.dropped = false
			}
			if (!this.element[0] || !this.element[0].parentNode) return false;
			if (this.options.revert == "invalid" && !g || this.options.revert == "valid" && g || this.options.revert === true || a.isFunction(this.options.revert) && this.options.revert.call(this.element, g)) {
				var c = this;
				a(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () {
					c._trigger("stop", d) !== false && c._clear()
				})
			} else this._trigger("stop", d) !== false && this._clear();
			return false
		},
		cancel: function () {
			this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear();
			return this
		},
		_getHandle: function (d) {
			var g = !this.options.handle || !a(this.options.handle, this.element).length ? true : false;
			a(this.options.handle, this.element).find("*").andSelf().each(function () {
				if (this == d.target) g = true
			});
			return g
		},
		_createHelper: function (d) {
			var g = this.options;
			d = a.isFunction(g.helper) ? a(g.helper.apply(this.element[0], [d])) : g.helper == "clone" ? this.element.clone() : this.element;
			d.parents("body").length || d.appendTo(g.appendTo == "parent" ? this.element[0].parentNode : g.appendTo);
			d[0] != this.element[0] && !/(fixed|absolute)/.test(d.css("position")) && d.css("position", "absolute");
			return d
		},
		_adjustOffsetFromHelper: function (d) {
			if (typeof d == "string") d = d.split(" ");
			if (a.isArray(d)) d = {
				left: +d[0],
				top: +d[1] || 0
			};
			if ("left" in d) this.offset.click.left = d.left + this.margins.left;
			if ("right" in d) this.offset.click.left = this.helperProportions.width - d.right + this.margins.left;
			if ("top" in d) this.offset.click.top = d.top + this.margins.top;
			if ("bottom" in d) this.offset.click.top = this.helperProportions.height - d.bottom + this.margins.top
		},
		_getParentOffset: function () {
			this.offsetParent = this.helper.offsetParent();
			var d = this.offsetParent.offset();
			if (this.cssPosition == "absolute" && this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
				d.left += this.scrollParent.scrollLeft();
				d.top += this.scrollParent.scrollTop()
			}
			if (this.offsetParent[0] == document.body || this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == "html" && a.browser.msie) d = {
				top: 0,
				left: 0
			};
			return {
				top: d.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left: d.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset: function () {
			if (this.cssPosition == "relative") {
				var d = this.element.position();
				return {
					top: d.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
					left: d.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
				}
			} else return {
				top: 0,
				left: 0
			}
		},
		_cacheMargins: function () {
			this.margins = {
				left: parseInt(this.element.css("marginLeft"), 10) || 0,
				top: parseInt(this.element.css("marginTop"), 10) || 0
			}
		},
		_cacheHelperProportions: function () {
			this.helperProportions = {
				width: this.helper.outerWidth(),
				height: this.helper.outerHeight()
			}
		},
		_setContainment: function () {
			var d = this.options;
			if (d.containment == "parent") d.containment = this.helper[0].parentNode;
			if (d.containment == "document" || d.containment == "window") this.containment = [(d.containment == "document" ? 0 : a(window).scrollLeft()) - this.offset.relative.left - this.offset.parent.left, (d.containment == "document" ? 0 : a(window).scrollTop()) - this.offset.relative.top - this.offset.parent.top, (d.containment == "document" ? 0 : a(window).scrollLeft()) + a(d.containment == "document" ? document : window).width() - this.helperProportions.width - this.margins.left, (d.containment == "document" ? 0 : a(window).scrollTop()) + (a(d.containment == "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
			if (!/^(document|window|parent)$/.test(d.containment) && d.containment.constructor != Array) {
				var g = a(d.containment)[0];
				if (g) {
					d = a(d.containment).offset();
					var c = a(g).css("overflow") != "hidden";
					this.containment = [d.left + (parseInt(a(g).css("borderLeftWidth"), 10) || 0) + (parseInt(a(g).css("paddingLeft"), 10) || 0) - this.margins.left, d.top + (parseInt(a(g).css("borderTopWidth"), 10) || 0) + (parseInt(a(g).css("paddingTop"), 10) || 0) - this.margins.top, d.left + (c ? Math.max(g.scrollWidth, g.offsetWidth) : g.offsetWidth) - (parseInt(a(g).css("borderLeftWidth"), 10) || 0) - (parseInt(a(g).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, d.top + (c ? Math.max(g.scrollHeight, g.offsetHeight) : g.offsetHeight) - (parseInt(a(g).css("borderTopWidth"), 10) || 0) - (parseInt(a(g).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]
				}
			} else if (d.containment.constructor == Array) this.containment = d.containment
		},
		_convertPositionTo: function (d, g) {
			if (!g) g = this.position;
			var c = d == "absolute" ? 1 : -1,
				e = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
				b = /(html|body)/i.test(e[0].tagName);
			return {
				top: g.top + this.offset.relative.top * c + this.offset.parent.top * c - (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : b ? 0 : e.scrollTop()) * c),
				left: g.left + this.offset.relative.left * c + this.offset.parent.left * c - (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : b ? 0 : e.scrollLeft()) * c)
			}
		},
		_generatePosition: function (d) {
			var g = this.options,
				c = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
				e = /(html|body)/i.test(c[0].tagName),
				b = d.pageX,
				f = d.pageY;
			if (this.originalPosition) {
				if (this.containment) {
					if (d.pageX - this.offset.click.left < this.containment[0]) b = this.containment[0] + this.offset.click.left;
					if (d.pageY - this.offset.click.top < this.containment[1]) f = this.containment[1] + this.offset.click.top;
					if (d.pageX - this.offset.click.left > this.containment[2]) b = this.containment[2] + this.offset.click.left;
					if (d.pageY - this.offset.click.top > this.containment[3]) f = this.containment[3] + this.offset.click.top
				}
				if (g.grid) {
					f = this.originalPageY + Math.round((f - this.originalPageY) / g.grid[1]) * g.grid[1];
					f = this.containment ? !(f - this.offset.click.top < this.containment[1] || f - this.offset.click.top > this.containment[3]) ? f : !(f - this.offset.click.top < this.containment[1]) ? f - g.grid[1] : f + g.grid[1] : f;
					b = this.originalPageX + Math.round((b - this.originalPageX) / g.grid[0]) * g.grid[0];
					b = this.containment ? !(b - this.offset.click.left < this.containment[0] || b - this.offset.click.left > this.containment[2]) ? b : !(b - this.offset.click.left < this.containment[0]) ? b - g.grid[0] : b + g.grid[0] : b
				}
			}
			return {
				top: f - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : e ? 0 : c.scrollTop()),
				left: b - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + (a.browser.safari && a.browser.version < 526 && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : e ? 0 : c.scrollLeft())
			}
		},
		_clear: function () {
			this.helper.removeClass("ui-draggable-dragging");
			this.helper[0] != this.element[0] && !this.cancelHelperRemoval && this.helper.remove();
			this.helper = null;
			this.cancelHelperRemoval = false
		},
		_trigger: function (d, g, c) {
			c = c || this._uiHash();
			a.ui.plugin.call(this, d, [g, c]);
			if (d == "drag") this.positionAbs = this._convertPositionTo("absolute");
			return a.Widget.prototype._trigger.call(this, d, g, c)
		},
		plugins: {},
		_uiHash: function () {
			return {
				helper: this.helper,
				position: this.position,
				originalPosition: this.originalPosition,
				offset: this.positionAbs
			}
		}
	});
	a.extend(a.ui.draggable, {
		version: "1.8.7"
	});
	a.ui.plugin.add("draggable", "connectToSortable", {
		start: function (d, g) {
			var c = a(this).data("draggable"),
				e = c.options,
				b = a.extend({}, g, {
					item: c.element
				});
			c.sortables = [];
			a(e.connectToSortable).each(function () {
				var f = a.data(this, "sortable");
				if (f && !f.options.disabled) {
					c.sortables.push({
						instance: f,
						shouldRevert: f.options.revert
					});
					f._refreshItems();
					f._trigger("activate", d, b)
				}
			})
		},
		stop: function (d, g) {
			var c = a(this).data("draggable"),
				e = a.extend({}, g, {
					item: c.element
				});
			a.each(c.sortables, function () {
				if (this.instance.isOver) {
					this.instance.isOver = 0;
					c.cancelHelperRemoval = true;
					this.instance.cancelHelperRemoval = false;
					if (this.shouldRevert) this.instance.options.revert = true;
					this.instance._mouseStop(d);
					this.instance.options.helper = this.instance.options._helper;
					c.options.helper == "original" && this.instance.currentItem.css({
						top: "auto",
						left: "auto"
					})
				} else {
					this.instance.cancelHelperRemoval = false;
					this.instance._trigger("deactivate", d, e)
				}
			})
		},
		drag: function (d, g) {
			var c = a(this).data("draggable"),
				e = this;
			a.each(c.sortables, function () {
				this.instance.positionAbs = c.positionAbs;
				this.instance.helperProportions = c.helperProportions;
				this.instance.offset.click = c.offset.click;
				if (this.instance._intersectsWith(this.instance.containerCache)) {
					if (!this.instance.isOver) {
						this.instance.isOver = 1;
						this.instance.currentItem = a(e).clone().appendTo(this.instance.element).data("sortable-item", true);
						this.instance.options._helper = this.instance.options.helper;
						this.instance.options.helper = function () {
							return g.helper[0]
						};
						d.target = this.instance.currentItem[0];
						this.instance._mouseCapture(d, true);
						this.instance._mouseStart(d, true, true);
						this.instance.offset.click.top = c.offset.click.top;
						this.instance.offset.click.left = c.offset.click.left;
						this.instance.offset.parent.left -= c.offset.parent.left - this.instance.offset.parent.left;
						this.instance.offset.parent.top -= c.offset.parent.top - this.instance.offset.parent.top;
						c._trigger("toSortable", d);
						c.dropped = this.instance.element;
						c.currentItem = c.element;
						this.instance.fromOutside = c
					}
					this.instance.currentItem && this.instance._mouseDrag(d)
				} else if (this.instance.isOver) {
					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;
					this.instance.options.revert = false;
					this.instance._trigger("out", d, this.instance._uiHash(this.instance));
					this.instance._mouseStop(d, true);
					this.instance.options.helper = this.instance.options._helper;
					this.instance.currentItem.remove();
					this.instance.placeholder && this.instance.placeholder.remove();
					c._trigger("fromSortable", d);
					c.dropped = false
				}
			})
		}
	});
	a.ui.plugin.add("draggable", "cursor", {
		start: function () {
			var d = a("body"),
				g = a(this).data("draggable").options;
			if (d.css("cursor")) g._cursor = d.css("cursor");
			d.css("cursor", g.cursor)
		},
		stop: function () {
			var d = a(this).data("draggable").options;
			d._cursor && a("body").css("cursor", d._cursor)
		}
	});
	a.ui.plugin.add("draggable", "iframeFix", {
		start: function () {
			var d = a(this).data("draggable").options;
			a(d.iframeFix === true ? "iframe" : d.iframeFix).each(function () {
				a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({
					width: this.offsetWidth + "px",
					height: this.offsetHeight + "px",
					position: "absolute",
					opacity: "0.001",
					zIndex: 1E3
				}).css(a(this).offset()).appendTo("body")
			})
		},
		stop: function () {
			a("div.ui-draggable-iframeFix").each(function () {
				this.parentNode.removeChild(this)
			})
		}
	});
	a.ui.plugin.add("draggable", "opacity", {
		start: function (d, g) {
			var c = a(g.helper),
				e = a(this).data("draggable").options;
			if (c.css("opacity")) e._opacity = c.css("opacity");
			c.css("opacity", e.opacity)
		},
		stop: function (d, g) {
			var c = a(this).data("draggable").options;
			c._opacity && a(g.helper).css("opacity", c._opacity)
		}
	});
	a.ui.plugin.add("draggable", "scroll", {
		start: function () {
			var d = a(this).data("draggable");
			if (d.scrollParent[0] != document && d.scrollParent[0].tagName != "HTML") d.overflowOffset = d.scrollParent.offset()
		},
		drag: function (d) {
			var g = a(this).data("draggable"),
				c = g.options,
				e = false;
			if (g.scrollParent[0] != document && g.scrollParent[0].tagName != "HTML") {
				if (!c.axis || c.axis != "x") if (g.overflowOffset.top + g.scrollParent[0].offsetHeight - d.pageY < c.scrollSensitivity) g.scrollParent[0].scrollTop = e = g.scrollParent[0].scrollTop + c.scrollSpeed;
				else if (d.pageY - g.overflowOffset.top < c.scrollSensitivity) g.scrollParent[0].scrollTop = e = g.scrollParent[0].scrollTop - c.scrollSpeed;
				if (!c.axis || c.axis != "y") if (g.overflowOffset.left + g.scrollParent[0].offsetWidth - d.pageX < c.scrollSensitivity) g.scrollParent[0].scrollLeft = e = g.scrollParent[0].scrollLeft + c.scrollSpeed;
				else if (d.pageX - g.overflowOffset.left < c.scrollSensitivity) g.scrollParent[0].scrollLeft = e = g.scrollParent[0].scrollLeft - c.scrollSpeed
			} else {
				if (!c.axis || c.axis != "x") if (d.pageY - a(document).scrollTop() < c.scrollSensitivity) e = a(document).scrollTop(a(document).scrollTop() - c.scrollSpeed);
				else if (a(window).height() - (d.pageY - a(document).scrollTop()) < c.scrollSensitivity) e = a(document).scrollTop(a(document).scrollTop() + c.scrollSpeed);
				if (!c.axis || c.axis != "y") if (d.pageX - a(document).scrollLeft() < c.scrollSensitivity) e = a(document).scrollLeft(a(document).scrollLeft() - c.scrollSpeed);
				else if (a(window).width() - (d.pageX - a(document).scrollLeft()) < c.scrollSensitivity) e = a(document).scrollLeft(a(document).scrollLeft() + c.scrollSpeed)
			}
			e !== false && a.ui.ddmanager && !c.dropBehaviour && a.ui.ddmanager.prepareOffsets(g, d)
		}
	});
	a.ui.plugin.add("draggable", "snap", {
		start: function () {
			var d = a(this).data("draggable"),
				g = d.options;
			d.snapElements = [];
			a(g.snap.constructor != String ? g.snap.items || ":data(draggable)" : g.snap).each(function () {
				var c = a(this),
					e = c.offset();
				this != d.element[0] && d.snapElements.push({
					item: this,
					width: c.outerWidth(),
					height: c.outerHeight(),
					top: e.top,
					left: e.left
				})
			})
		},
		drag: function (d, g) {
			for (var c = a(this).data("draggable"), e = c.options, b = e.snapTolerance, f = g.offset.left, j = f + c.helperProportions.width, o = g.offset.top, q = o + c.helperProportions.height, v = c.snapElements.length - 1; v >= 0; v--) {
				var w = c.snapElements[v].left,
					E = w + c.snapElements[v].width,
					A = c.snapElements[v].top,
					B = A + c.snapElements[v].height;
				if (w - b < f && f < E + b && A - b < o && o < B + b || w - b < f && f < E + b && A - b < q && q < B + b || w - b < j && j < E + b && A - b < o && o < B + b || w - b < j && j < E + b && A - b < q && q < B + b) {
					if (e.snapMode != "inner") {
						var G = Math.abs(A - q) <= b,
							x = Math.abs(B - o) <= b,
							D = Math.abs(w - j) <= b,
							F = Math.abs(E - f) <= b;
						if (G) g.position.top = c._convertPositionTo("relative", {
							top: A - c.helperProportions.height,
							left: 0
						}).top - c.margins.top;
						if (x) g.position.top = c._convertPositionTo("relative", {
							top: B,
							left: 0
						}).top - c.margins.top;
						if (D) g.position.left = c._convertPositionTo("relative", {
							top: 0,
							left: w - c.helperProportions.width
						}).left - c.margins.left;
						if (F) g.position.left = c._convertPositionTo("relative", {
							top: 0,
							left: E
						}).left - c.margins.left
					}
					var R = G || x || D || F;
					if (e.snapMode != "outer") {
						G = Math.abs(A - o) <= b;
						x = Math.abs(B - q) <= b;
						D = Math.abs(w - f) <= b;
						F = Math.abs(E - j) <= b;
						if (G) g.position.top = c._convertPositionTo("relative", {
							top: A,
							left: 0
						}).top - c.margins.top;
						if (x) g.position.top = c._convertPositionTo("relative", {
							top: B - c.helperProportions.height,
							left: 0
						}).top - c.margins.top;
						if (D) g.position.left = c._convertPositionTo("relative", {
							top: 0,
							left: w
						}).left - c.margins.left;
						if (F) g.position.left = c._convertPositionTo("relative", {
							top: 0,
							left: E - c.helperProportions.width
						}).left - c.margins.left
					}
					if (!c.snapElements[v].snapping && (G || x || D || F || R)) c.options.snap.snap && c.options.snap.snap.call(c.element, d, a.extend(c._uiHash(), {
						snapItem: c.snapElements[v].item
					}));
					c.snapElements[v].snapping = G || x || D || F || R
				} else {
					c.snapElements[v].snapping && c.options.snap.release && c.options.snap.release.call(c.element, d, a.extend(c._uiHash(), {
						snapItem: c.snapElements[v].item
					}));
					c.snapElements[v].snapping = false
				}
			}
		}
	});
	a.ui.plugin.add("draggable", "stack", {
		start: function () {
			var d = a(this).data("draggable").options;
			d = a.makeArray(a(d.stack)).sort(function (c, e) {
				return (parseInt(a(c).css("zIndex"), 10) || 0) - (parseInt(a(e).css("zIndex"), 10) || 0)
			});
			if (d.length) {
				var g = parseInt(d[0].style.zIndex) || 0;
				a(d).each(function (c) {
					this.style.zIndex = g + c
				});
				this[0].style.zIndex = g + d.length
			}
		}
	});
	a.ui.plugin.add("draggable", "zIndex", {
		start: function (d, g) {
			var c = a(g.helper),
				e = a(this).data("draggable").options;
			if (c.css("zIndex")) e._zIndex = c.css("zIndex");
			c.css("zIndex", e.zIndex)
		},
		stop: function (d, g) {
			var c = a(this).data("draggable").options;
			c._zIndex && a(g.helper).css("zIndex", c._zIndex)
		}
	})
})(jQuery);
(function (a) {
	a.widget("ui.droppable", {
		widgetEventPrefix: "drop",
		options: {
			accept: "*",
			activeClass: false,
			addClasses: true,
			greedy: false,
			hoverClass: false,
			scope: "default",
			tolerance: "intersect"
		},
		_create: function () {
			var d = this.options,
				g = d.accept;
			this.isover = 0;
			this.isout = 1;
			this.accept = a.isFunction(g) ? g : function (c) {
				return c.is(g)
			};
			this.proportions = {
				width: this.element[0].offsetWidth,
				height: this.element[0].offsetHeight
			};
			a.ui.ddmanager.droppables[d.scope] = a.ui.ddmanager.droppables[d.scope] || [];
			a.ui.ddmanager.droppables[d.scope].push(this);
			d.addClasses && this.element.addClass("ui-droppable")
		},
		destroy: function () {
			for (var d = a.ui.ddmanager.droppables[this.options.scope], g = 0; g < d.length; g++) d[g] == this && d.splice(g, 1);
			this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");
			return this
		},
		_setOption: function (d, g) {
			if (d == "accept") this.accept = a.isFunction(g) ? g : function (c) {
				return c.is(g)
			};
			a.Widget.prototype._setOption.apply(this, arguments)
		},
		_activate: function (d) {
			var g = a.ui.ddmanager.current;
			this.options.activeClass && this.element.addClass(this.options.activeClass);
			g && this._trigger("activate", d, this.ui(g))
		},
		_deactivate: function (d) {
			var g = a.ui.ddmanager.current;
			this.options.activeClass && this.element.removeClass(this.options.activeClass);
			g && this._trigger("deactivate", d, this.ui(g))
		},
		_over: function (d) {
			var g = a.ui.ddmanager.current;
			if (!(!g || (g.currentItem || g.element)[0] == this.element[0])) if (this.accept.call(this.element[0], g.currentItem || g.element)) {
				this.options.hoverClass && this.element.addClass(this.options.hoverClass);
				this._trigger("over", d, this.ui(g))
			}
		},
		_out: function (d) {
			var g = a.ui.ddmanager.current;
			if (!(!g || (g.currentItem || g.element)[0] == this.element[0])) if (this.accept.call(this.element[0], g.currentItem || g.element)) {
				this.options.hoverClass && this.element.removeClass(this.options.hoverClass);
				this._trigger("out", d, this.ui(g))
			}
		},
		_drop: function (d, g) {
			var c = g || a.ui.ddmanager.current;
			if (!c || (c.currentItem || c.element)[0] == this.element[0]) return false;
			var e = false;
			this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function () {
				var b = a.data(this, "droppable");
				if (b.options.greedy && !b.options.disabled && b.options.scope == c.options.scope && b.accept.call(b.element[0], c.currentItem || c.element) && a.ui.intersect(c, a.extend(b, {
					offset: b.element.offset()
				}), b.options.tolerance)) {
					e = true;
					return false
				}
			});
			if (e) return false;
			if (this.accept.call(this.element[0], c.currentItem || c.element)) {
				this.options.activeClass && this.element.removeClass(this.options.activeClass);
				this.options.hoverClass && this.element.removeClass(this.options.hoverClass);
				this._trigger("drop", d, this.ui(c));
				return this.element
			}
			return false
		},
		ui: function (d) {
			return {
				draggable: d.currentItem || d.element,
				helper: d.helper,
				position: d.position,
				offset: d.positionAbs
			}
		}
	});
	a.extend(a.ui.droppable, {
		version: "1.8.7"
	});
	a.ui.intersect = function (d, g, c) {
		if (!g.offset) return false;
		var e = (d.positionAbs || d.position.absolute).left,
			b = e + d.helperProportions.width,
			f = (d.positionAbs || d.position.absolute).top,
			j = f + d.helperProportions.height,
			o = g.offset.left,
			q = o + g.proportions.width,
			v = g.offset.top,
			w = v + g.proportions.height;
		switch (c) {
		case "fit":
			return o <= e && b <= q && v <= f && j <= w;
		case "intersect":
			return o < e + d.helperProportions.width / 2 && b - d.helperProportions.width / 2 < q && v < f + d.helperProportions.height / 2 && j - d.helperProportions.height / 2 < w;
		case "pointer":
			return a.ui.isOver((d.positionAbs || d.position.absolute).top + (d.clickOffset || d.offset.click).top, (d.positionAbs || d.position.absolute).left + (d.clickOffset || d.offset.click).left, v, o, g.proportions.height, g.proportions.width);
		case "touch":
			return (f >= v && f <= w || j >= v && j <= w || f < v && j > w) && (e >= o && e <= q || b >= o && b <= q || e < o && b > q);
		default:
			return false
		}
	};
	a.ui.ddmanager = {
		current: null,
		droppables: {
			"default": []
		},
		prepareOffsets: function (d, g) {
			var c = a.ui.ddmanager.droppables[d.options.scope] || [],
				e = g ? g.type : null,
				b = (d.currentItem || d.element).find(":data(droppable)").andSelf(),
				f = 0;
			a: for (; f < c.length; f++) if (!(c[f].options.disabled || d && !c[f].accept.call(c[f].element[0], d.currentItem || d.element))) {
				for (var j = 0; j < b.length; j++) if (b[j] == c[f].element[0]) {
					c[f].proportions.height = 0;
					continue a
				}
				c[f].visible = c[f].element.css("display") != "none";
				if (c[f].visible) {
					c[f].offset = c[f].element.offset();
					c[f].proportions = {
						width: c[f].element[0].offsetWidth,
						height: c[f].element[0].offsetHeight
					};
					e == "mousedown" && c[f]._activate.call(c[f], g)
				}
			}
		},
		drop: function (d, g) {
			var c = false;
			a.each(a.ui.ddmanager.droppables[d.options.scope] || [], function () {
				if (this.options) {
					if (!this.options.disabled && this.visible && a.ui.intersect(d, this, this.options.tolerance)) c = c || this._drop.call(this, g);
					if (!this.options.disabled && this.visible && this.accept.call(this.element[0], d.currentItem || d.element)) {
						this.isout = 1;
						this.isover = 0;
						this._deactivate.call(this, g)
					}
				}
			});
			return c
		},
		drag: function (d, g) {
			d.options.refreshPositions && a.ui.ddmanager.prepareOffsets(d, g);
			a.each(a.ui.ddmanager.droppables[d.options.scope] || [], function () {
				if (!(this.options.disabled || this.greedyChild || !this.visible)) {
					var c = a.ui.intersect(d, this, this.options.tolerance);
					if (c = !c && this.isover == 1 ? "isout" : c && this.isover == 0 ? "isover" : null) {
						var e;
						if (this.options.greedy) {
							var b = this.element.parents(":data(droppable):eq(0)");
							if (b.length) {
								e = a.data(b[0], "droppable");
								e.greedyChild = c == "isover" ? 1 : 0
							}
						}
						if (e && c == "isover") {
							e.isover = 0;
							e.isout = 1;
							e._out.call(e, g)
						}
						this[c] = 1;
						this[c == "isout" ? "isover" : "isout"] = 0;
						this[c == "isover" ? "_over" : "_out"].call(this, g);
						if (e && c == "isout") {
							e.isout = 0;
							e.isover = 1;
							e._over.call(e, g)
						}
					}
				}
			})
		}
	}
})(jQuery);
(function (a) {
	a.widget("ui.resizable", a.ui.mouse, {
		widgetEventPrefix: "resize",
		options: {
			alsoResize: false,
			animate: false,
			animateDuration: "slow",
			animateEasing: "swing",
			aspectRatio: false,
			autoHide: false,
			containment: false,
			ghost: false,
			grid: false,
			handles: "e,s,se",
			helper: false,
			maxHeight: null,
			maxWidth: null,
			minHeight: 10,
			minWidth: 10,
			zIndex: 1E3
		},
		_create: function () {
			var c = this,
				e = this.options;
			this.element.addClass("ui-resizable");
			a.extend(this, {
				_aspectRatio: !! e.aspectRatio,
				aspectRatio: e.aspectRatio,
				originalElement: this.element,
				_proportionallyResizeElements: [],
				_helper: e.helper || e.ghost || e.animate ? e.helper || "ui-resizable-helper" : null
			});
			if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {
				/relative/.test(this.element.css("position")) && a.browser.opera && this.element.css({
					position: "relative",
					top: "auto",
					left: "auto"
				});
				this.element.wrap(a('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css("position"),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css("top"),
					left: this.element.css("left")
				}));
				this.element = this.element.parent().data("resizable", this.element.data("resizable"));
				this.elementIsWrapper = true;
				this.element.css({
					marginLeft: this.originalElement.css("marginLeft"),
					marginTop: this.originalElement.css("marginTop"),
					marginRight: this.originalElement.css("marginRight"),
					marginBottom: this.originalElement.css("marginBottom")
				});
				this.originalElement.css({
					marginLeft: 0,
					marginTop: 0,
					marginRight: 0,
					marginBottom: 0
				});
				this.originalResizeStyle = this.originalElement.css("resize");
				this.originalElement.css("resize", "none");
				this._proportionallyResizeElements.push(this.originalElement.css({
					position: "static",
					zoom: 1,
					display: "block"
				}));
				this.originalElement.css({
					margin: this.originalElement.css("margin")
				});
				this._proportionallyResize()
			}
			this.handles = e.handles || (!a(".ui-resizable-handle", this.element).length ? "e,s,se" : {
				n: ".ui-resizable-n",
				e: ".ui-resizable-e",
				s: ".ui-resizable-s",
				w: ".ui-resizable-w",
				se: ".ui-resizable-se",
				sw: ".ui-resizable-sw",
				ne: ".ui-resizable-ne",
				nw: ".ui-resizable-nw"
			});
			if (this.handles.constructor == String) {
				if (this.handles == "all") this.handles = "n,e,s,w,se,sw,ne,nw";
				var b = this.handles.split(",");
				this.handles = {};
				for (var f = 0; f < b.length; f++) {
					var j = a.trim(b[f]),
						o = a('<div class="ui-resizable-handle ' + ("ui-resizable-" + j) + '"></div>');
					/sw|se|ne|nw/.test(j) && o.css({
						zIndex: ++e.zIndex
					});
					"se" == j && o.addClass("ui-icon ui-icon-gripsmall-diagonal-se");
					this.handles[j] = ".ui-resizable-" + j;
					this.element.append(o)
				}
			}
			this._renderAxis = function (q) {
				q = q || this.element;
				for (var v in this.handles) {
					if (this.handles[v].constructor == String) this.handles[v] = a(this.handles[v], this.element).show();
					if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {
						var w = a(this.handles[v], this.element),
							E = 0;
						E = /sw|ne|nw|se|n|s/.test(v) ? w.outerHeight() : w.outerWidth();
						w = ["padding", /ne|nw|n/.test(v) ? "Top" : /se|sw|s/.test(v) ? "Bottom" : /^e$/.test(v) ? "Right" : "Left"].join("");
						q.css(w, E);
						this._proportionallyResize()
					}
					a(this.handles[v])
				}
			};
			this._renderAxis(this.element);
			this._handles = a(".ui-resizable-handle", this.element).disableSelection();
			this._handles.mouseover(function () {
				if (!c.resizing) {
					if (this.className) var q = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
					c.axis = q && q[1] ? q[1] : "se"
				}
			});
			if (e.autoHide) {
				this._handles.hide();
				a(this.element).addClass("ui-resizable-autohide").hover(function () {
					a(this).removeClass("ui-resizable-autohide");
					c._handles.show()
				}, function () {
					if (!c.resizing) {
						a(this).addClass("ui-resizable-autohide");
						c._handles.hide()
					}
				})
			}
			this._mouseInit()
		},
		destroy: function () {
			this._mouseDestroy();
			var c = function (b) {
				a(b).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()
			};
			if (this.elementIsWrapper) {
				c(this.element);
				var e = this.element;
				e.after(this.originalElement.css({
					position: e.css("position"),
					width: e.outerWidth(),
					height: e.outerHeight(),
					top: e.css("top"),
					left: e.css("left")
				})).remove()
			}
			this.originalElement.css("resize", this.originalResizeStyle);
			c(this.originalElement);
			return this
		},
		_mouseCapture: function (c) {
			var e = false;
			for (var b in this.handles) if (a(this.handles[b])[0] == c.target) e = true;
			return !this.options.disabled && e
		},
		_mouseStart: function (c) {
			var e = this.options,
				b = this.element.position(),
				f = this.element;
			this.resizing = true;
			this.documentScroll = {
				top: a(document).scrollTop(),
				left: a(document).scrollLeft()
			};
			if (f.is(".ui-draggable") || /absolute/.test(f.css("position"))) f.css({
				position: "absolute",
				top: b.top,
				left: b.left
			});
			a.browser.opera && /relative/.test(f.css("position")) && f.css({
				position: "relative",
				top: "auto",
				left: "auto"
			});
			this._renderProxy();
			b = d(this.helper.css("left"));
			var j = d(this.helper.css("top"));
			if (e.containment) {
				b += a(e.containment).scrollLeft() || 0;
				j += a(e.containment).scrollTop() || 0
			}
			this.offset = this.helper.offset();
			this.position = {
				left: b,
				top: j
			};
			this.size = this._helper ? {
				width: f.outerWidth(),
				height: f.outerHeight()
			} : {
				width: f.width(),
				height: f.height()
			};
			this.originalSize = this._helper ? {
				width: f.outerWidth(),
				height: f.outerHeight()
			} : {
				width: f.width(),
				height: f.height()
			};
			this.originalPosition = {
				left: b,
				top: j
			};
			this.sizeDiff = {
				width: f.outerWidth() - f.width(),
				height: f.outerHeight() - f.height()
			};
			this.originalMousePosition = {
				left: c.pageX,
				top: c.pageY
			};
			this.aspectRatio = typeof e.aspectRatio == "number" ? e.aspectRatio : this.originalSize.width / this.originalSize.height || 1;
			e = a(".ui-resizable-" + this.axis).css("cursor");
			a("body").css("cursor", e == "auto" ? this.axis + "-resize" : e);
			f.addClass("ui-resizable-resizing");
			this._propagate("start", c);
			return true
		},
		_mouseDrag: function (c) {
			var e = this.helper,
				b = this.originalMousePosition,
				f = this._change[this.axis];
			if (!f) return false;
			b = f.apply(this, [c, c.pageX - b.left || 0, c.pageY - b.top || 0]);
			if (this._aspectRatio || c.shiftKey) b = this._updateRatio(b, c);
			b = this._respectSize(b, c);
			this._propagate("resize", c);
			e.css({
				top: this.position.top + "px",
				left: this.position.left + "px",
				width: this.size.width + "px",
				height: this.size.height + "px"
			});
			!this._helper && this._proportionallyResizeElements.length && this._proportionallyResize();
			this._updateCache(b);
			this._trigger("resize", c, this.ui());
			return false
		},
		_mouseStop: function (c) {
			this.resizing = false;
			var e = this.options;
			if (this._helper) {
				var b = this._proportionallyResizeElements,
					f = b.length && /textarea/i.test(b[0].nodeName);
				b = f && a.ui.hasScroll(b[0], "left") ? 0 : this.sizeDiff.height;
				f = {
					width: this.size.width - (f ? 0 : this.sizeDiff.width),
					height: this.size.height - b
				};
				b = parseInt(this.element.css("left"), 10) + (this.position.left - this.originalPosition.left) || null;
				var j = parseInt(this.element.css("top"), 10) + (this.position.top - this.originalPosition.top) || null;
				e.animate || this.element.css(a.extend(f, {
					top: j,
					left: b
				}));
				this.helper.height(this.size.height);
				this.helper.width(this.size.width);
				this._helper && !e.animate && this._proportionallyResize()
			}
			a("body").css("cursor", "auto");
			this.element.removeClass("ui-resizable-resizing");
			this._propagate("stop", c);
			this._helper && this.helper.remove();
			return false
		},
		_updateCache: function (c) {
			this.offset = this.helper.offset();
			if (g(c.left)) this.position.left = c.left;
			if (g(c.top)) this.position.top = c.top;
			if (g(c.height)) this.size.height = c.height;
			if (g(c.width)) this.size.width = c.width
		},
		_updateRatio: function (c) {
			var e = this.position,
				b = this.size,
				f = this.axis;
			if (c.height) c.width = b.height * this.aspectRatio;
			else if (c.width) c.height = b.width / this.aspectRatio;
			if (f == "sw") {
				c.left = e.left + (b.width - c.width);
				c.top = null
			}
			if (f == "nw") {
				c.top = e.top + (b.height - c.height);
				c.left = e.left + (b.width - c.width)
			}
			return c
		},
		_respectSize: function (c) {
			var e = this.options,
				b = this.axis,
				f = g(c.width) && e.maxWidth && e.maxWidth < c.width,
				j = g(c.height) && e.maxHeight && e.maxHeight < c.height,
				o = g(c.width) && e.minWidth && e.minWidth > c.width,
				q = g(c.height) && e.minHeight && e.minHeight > c.height;
			if (o) c.width = e.minWidth;
			if (q) c.height = e.minHeight;
			if (f) c.width = e.maxWidth;
			if (j) c.height = e.maxHeight;
			var v = this.originalPosition.left + this.originalSize.width,
				w = this.position.top + this.size.height,
				E = /sw|nw|w/.test(b);
			b = /nw|ne|n/.test(b);
			if (o && E) c.left = v - e.minWidth;
			if (f && E) c.left = v - e.maxWidth;
			if (q && b) c.top = w - e.minHeight;
			if (j && b) c.top = w - e.maxHeight;
			if ((e = !c.width && !c.height) && !c.left && c.top) c.top = null;
			else if (e && !c.top && c.left) c.left = null;
			return c
		},
		_proportionallyResize: function () {
			if (this._proportionallyResizeElements.length) for (var c = this.helper || this.element, e = 0; e < this._proportionallyResizeElements.length; e++) {
				var b = this._proportionallyResizeElements[e];
				if (!this.borderDif) {
					var f = [b.css("borderTopWidth"), b.css("borderRightWidth"), b.css("borderBottomWidth"), b.css("borderLeftWidth")],
						j = [b.css("paddingTop"), b.css("paddingRight"), b.css("paddingBottom"), b.css("paddingLeft")];
					this.borderDif = a.map(f, function (o, q) {
						var v = parseInt(o, 10) || 0,
							w = parseInt(j[q], 10) || 0;
						return v + w
					})
				}
				a.browser.msie && (a(c).is(":hidden") || a(c).parents(":hidden").length) || b.css({
					height: c.height() - this.borderDif[0] - this.borderDif[2] || 0,
					width: c.width() - this.borderDif[1] - this.borderDif[3] || 0
				})
			}
		},
		_renderProxy: function () {
			var c = this.options;
			this.elementOffset = this.element.offset();
			if (this._helper) {
				this.helper = this.helper || a('<div style="overflow:hidden;"></div>');
				var e = a.browser.msie && a.browser.version < 7,
					b = e ? 1 : 0;
				e = e ? 2 : -1;
				this.helper.addClass(this._helper).css({
					width: this.element.outerWidth() + e,
					height: this.element.outerHeight() + e,
					position: "absolute",
					left: this.elementOffset.left - b + "px",
					top: this.elementOffset.top - b + "px",
					zIndex: ++c.zIndex
				});
				this.helper.appendTo("body").disableSelection()
			} else this.helper = this.element
		},
		_change: {
			e: function (c, e) {
				return {
					width: this.originalSize.width + e
				}
			},
			w: function (c, e) {
				return {
					left: this.originalPosition.left + e,
					width: this.originalSize.width - e
				}
			},
			n: function (c, e, b) {
				return {
					top: this.originalPosition.top + b,
					height: this.originalSize.height - b
				}
			},
			s: function (c, e, b) {
				return {
					height: this.originalSize.height + b
				}
			},
			se: function (c, e, b) {
				return a.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [c, e, b]))
			},
			sw: function (c, e, b) {
				return a.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [c, e, b]))
			},
			ne: function (c, e, b) {
				return a.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [c, e, b]))
			},
			nw: function (c, e, b) {
				return a.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [c, e, b]))
			}
		},
		_propagate: function (c, e) {
			a.ui.plugin.call(this, c, [e, this.ui()]);
			c != "resize" && this._trigger(c, e, this.ui())
		},
		plugins: {},
		ui: function () {
			return {
				originalElement: this.originalElement,
				element: this.element,
				helper: this.helper,
				position: this.position,
				size: this.size,
				originalSize: this.originalSize,
				originalPosition: this.originalPosition
			}
		}
	});
	a.extend(a.ui.resizable, {
		version: "1.8.7"
	});
	a.ui.plugin.add("resizable", "alsoResize", {
		start: function () {
			var c = a(this).data("resizable").options,
				e = function (b) {
					a(b).each(function () {
						var f = a(this);
						f.data("resizable-alsoresize", {
							width: parseInt(f.width(), 10),
							height: parseInt(f.height(), 10),
							left: parseInt(f.css("left"), 10),
							top: parseInt(f.css("top"), 10),
							position: f.css("position")
						})
					})
				};
			if (typeof c.alsoResize == "object" && !c.alsoResize.parentNode) if (c.alsoResize.length) {
				c.alsoResize = c.alsoResize[0];
				e(c.alsoResize)
			} else a.each(c.alsoResize, function (b) {
				e(b)
			});
			else e(c.alsoResize)
		},
		resize: function (c, e) {
			var b = a(this).data("resizable"),
				f = b.options,
				j = b.originalSize,
				o = b.originalPosition,
				q = {
					height: b.size.height - j.height || 0,
					width: b.size.width - j.width || 0,
					top: b.position.top - o.top || 0,
					left: b.position.left - o.left || 0
				},
				v = function (w, E) {
					a(w).each(function () {
						var A = a(this),
							B = a(this).data("resizable-alsoresize"),
							G = {},
							x = E && E.length ? E : A.parents(e.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
						a.each(x, function (D, F) {
							var R = (B[F] || 0) + (q[F] || 0);
							if (R && R >= 0) G[F] = R || null
						});
						if (a.browser.opera && /relative/.test(A.css("position"))) {
							b._revertToRelativePosition = true;
							A.css({
								position: "absolute",
								top: "auto",
								left: "auto"
							})
						}
						A.css(G)
					})
				};
			typeof f.alsoResize == "object" && !f.alsoResize.nodeType ? a.each(f.alsoResize, function (w, E) {
				v(w, E)
			}) : v(f.alsoResize)
		},
		stop: function () {
			var c = a(this).data("resizable"),
				e = c.options,
				b = function (f) {
					a(f).each(function () {
						var j = a(this);
						j.css({
							position: j.data("resizable-alsoresize").position
						})
					})
				};
			if (c._revertToRelativePosition) {
				c._revertToRelativePosition = false;
				typeof e.alsoResize == "object" && !e.alsoResize.nodeType ? a.each(e.alsoResize, function (f) {
					b(f)
				}) : b(e.alsoResize)
			}
			a(this).removeData("resizable-alsoresize")
		}
	});
	a.ui.plugin.add("resizable", "animate", {
		stop: function (c) {
			var e = a(this).data("resizable"),
				b = e.options,
				f = e._proportionallyResizeElements,
				j = f.length && /textarea/i.test(f[0].nodeName),
				o = j && a.ui.hasScroll(f[0], "left") ? 0 : e.sizeDiff.height;
			j = {
				width: e.size.width - (j ? 0 : e.sizeDiff.width),
				height: e.size.height - o
			};
			o = parseInt(e.element.css("left"), 10) + (e.position.left - e.originalPosition.left) || null;
			var q = parseInt(e.element.css("top"), 10) + (e.position.top - e.originalPosition.top) || null;
			e.element.animate(a.extend(j, q && o ? {
				top: q,
				left: o
			} : {}), {
				duration: b.animateDuration,
				easing: b.animateEasing,
				step: function () {
					var v = {
						width: parseInt(e.element.css("width"), 10),
						height: parseInt(e.element.css("height"), 10),
						top: parseInt(e.element.css("top"), 10),
						left: parseInt(e.element.css("left"), 10)
					};
					f && f.length && a(f[0]).css({
						width: v.width,
						height: v.height
					});
					e._updateCache(v);
					e._propagate("resize", c)
				}
			})
		}
	});
	a.ui.plugin.add("resizable", "containment", {
		start: function () {
			var c = a(this).data("resizable"),
				e = c.element,
				b = c.options.containment;
			if (e = b instanceof a ? b.get(0) : /parent/.test(b) ? e.parent().get(0) : b) {
				c.containerElement = a(e);
				if (/document/.test(b) || b == document) {
					c.containerOffset = {
						left: 0,
						top: 0
					};
					c.containerPosition = {
						left: 0,
						top: 0
					};
					c.parentData = {
						element: a(document),
						left: 0,
						top: 0,
						width: a(document).width(),
						height: a(document).height() || document.body.parentNode.scrollHeight
					}
				} else {
					var f = a(e),
						j = [];
					a(["Top", "Right", "Left", "Bottom"]).each(function (v, w) {
						j[v] = d(f.css("padding" + w))
					});
					c.containerOffset = f.offset();
					c.containerPosition = f.position();
					c.containerSize = {
						height: f.innerHeight() - j[3],
						width: f.innerWidth() - j[1]
					};
					b = c.containerOffset;
					var o = c.containerSize.height,
						q = c.containerSize.width;
					q = a.ui.hasScroll(e, "left") ? e.scrollWidth : q;
					o = a.ui.hasScroll(e) ? e.scrollHeight : o;
					c.parentData = {
						element: e,
						left: b.left,
						top: b.top,
						width: q,
						height: o
					}
				}
			}
		},
		resize: function (c) {
			var e = a(this).data("resizable"),
				b = e.options,
				f = e.containerOffset,
				j = e.position;
			c = e._aspectRatio || c.shiftKey;
			var o = {
				top: 0,
				left: 0
			},
				q = e.containerElement;
			if (q[0] != document && /static/.test(q.css("position"))) o = f;
			if (j.left < (e._helper ? f.left : 0)) {
				e.size.width += e._helper ? e.position.left - f.left : e.position.left - o.left;
				if (c) e.size.height = e.size.width / b.aspectRatio;
				e.position.left = b.helper ? f.left : 0
			}
			if (j.top < (e._helper ? f.top : 0)) {
				e.size.height += e._helper ? e.position.top - f.top : e.position.top;
				if (c) e.size.width = e.size.height * b.aspectRatio;
				e.position.top = e._helper ? f.top : 0
			}
			e.offset.left = e.parentData.left + e.position.left;
			e.offset.top = e.parentData.top + e.position.top;
			b = Math.abs((e._helper ? e.offset.left - o.left : e.offset.left - o.left) + e.sizeDiff.width);
			f = Math.abs((e._helper ? e.offset.top - o.top : e.offset.top - f.top) + e.sizeDiff.height);
			j = e.containerElement.get(0) == e.element.parent().get(0);
			o = /relative|absolute/.test(e.containerElement.css("position"));
			if (j && o) b -= e.parentData.left;
			if (b + e.size.width >= e.parentData.width) {
				e.size.width = e.parentData.width - b;
				if (c) e.size.height = e.size.width / e.aspectRatio
			}
			if (f + e.size.height >= e.parentData.height) {
				e.size.height = e.parentData.height - f;
				if (c) e.size.width = e.size.height * e.aspectRatio
			}
		},
		stop: function () {
			var c = a(this).data("resizable"),
				e = c.options,
				b = c.containerOffset,
				f = c.containerPosition,
				j = c.containerElement,
				o = a(c.helper),
				q = o.offset(),
				v = o.outerWidth() - c.sizeDiff.width;
			o = o.outerHeight() - c.sizeDiff.height;
			c._helper && !e.animate && /relative/.test(j.css("position")) && a(this).css({
				left: q.left - f.left - b.left,
				width: v,
				height: o
			});
			c._helper && !e.animate && /static/.test(j.css("position")) && a(this).css({
				left: q.left - f.left - b.left,
				width: v,
				height: o
			})
		}
	});
	a.ui.plugin.add("resizable", "ghost", {
		start: function () {
			var c = a(this).data("resizable"),
				e = c.options,
				b = c.size;
			c.ghost = c.originalElement.clone();
			c.ghost.css({
				opacity: 0.25,
				display: "block",
				position: "relative",
				height: b.height,
				width: b.width,
				margin: 0,
				left: 0,
				top: 0
			}).addClass("ui-resizable-ghost").addClass(typeof e.ghost == "string" ? e.ghost : "");
			c.ghost.appendTo(c.helper)
		},
		resize: function () {
			var c = a(this).data("resizable");
			c.ghost && c.ghost.css({
				position: "relative",
				height: c.size.height,
				width: c.size.width
			})
		},
		stop: function () {
			var c = a(this).data("resizable");
			c.ghost && c.helper && c.helper.get(0).removeChild(c.ghost.get(0))
		}
	});
	a.ui.plugin.add("resizable", "grid", {
		resize: function () {
			var c = a(this).data("resizable"),
				e = c.options,
				b = c.size,
				f = c.originalSize,
				j = c.originalPosition,
				o = c.axis;
			e.grid = typeof e.grid == "number" ? [e.grid, e.grid] : e.grid;
			var q = Math.round((b.width - f.width) / (e.grid[0] || 1)) * (e.grid[0] || 1);
			e = Math.round((b.height - f.height) / (e.grid[1] || 1)) * (e.grid[1] || 1);
			if (/^(se|s|e)$/.test(o)) {
				c.size.width = f.width + q;
				c.size.height = f.height + e
			} else if (/^(ne)$/.test(o)) {
				c.size.width = f.width + q;
				c.size.height = f.height + e;
				c.position.top = j.top - e
			} else {
				if (/^(sw)$/.test(o)) {
					c.size.width = f.width + q;
					c.size.height = f.height + e
				} else {
					c.size.width = f.width + q;
					c.size.height = f.height + e;
					c.position.top = j.top - e
				}
				c.position.left = j.left - q
			}
		}
	});
	var d = function (c) {
		return parseInt(c, 10) || 0
	},
		g = function (c) {
			return !isNaN(parseInt(c, 10))
		}
})(jQuery);
(function (a) {
	a.widget("ui.sortable", a.ui.mouse, {
		widgetEventPrefix: "sort",
		options: {
			appendTo: "parent",
			axis: false,
			connectWith: false,
			containment: false,
			cursor: "auto",
			cursorAt: false,
			dropOnEmpty: true,
			forcePlaceholderSize: false,
			forceHelperSize: false,
			grid: false,
			handle: false,
			helper: "original",
			items: "> *",
			opacity: false,
			placeholder: false,
			revert: false,
			scroll: true,
			scrollSensitivity: 20,
			scrollSpeed: 20,
			scope: "default",
			tolerance: "intersect",
			zIndex: 1E3
		},
		_create: function () {
			this.containerCache = {};
			this.element.addClass("ui-sortable");
			this.refresh();
			this.floating = this.items.length ? /left|right/.test(this.items[0].item.css("float")) : false;
			this.offset = this.element.offset();
			this._mouseInit()
		},
		destroy: function () {
			this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");
			this._mouseDestroy();
			for (var d = this.items.length - 1; d >= 0; d--) this.items[d].item.removeData("sortable-item");
			return this
		},
		_setOption: function (d, g) {
			if (d === "disabled") {
				this.options[d] = g;
				this.widget()[g ? "addClass" : "removeClass"]("ui-sortable-disabled")
			} else a.Widget.prototype._setOption.apply(this, arguments)
		},
		_mouseCapture: function (d, g) {
			if (this.reverting) return false;
			if (this.options.disabled || this.options.type == "static") return false;
			this._refreshItems(d);
			var c = null,
				e = this;
			a(d.target).parents().each(function () {
				if (a.data(this, "sortable-item") == e) {
					c = a(this);
					return false
				}
			});
			if (a.data(d.target, "sortable-item") == e) c = a(d.target);
			if (!c) return false;
			if (this.options.handle && !g) {
				var b = false;
				a(this.options.handle, c).find("*").andSelf().each(function () {
					if (this == d.target) b = true
				});
				if (!b) return false
			}
			this.currentItem = c;
			this._removeCurrentsFromItems();
			return true
		},
		_mouseStart: function (d, g, c) {
			g = this.options;
			this.currentContainer = this;
			this.refreshPositions();
			this.helper = this._createHelper(d);
			this._cacheHelperProportions();
			this._cacheMargins();
			this.scrollParent = this.helper.scrollParent();
			this.offset = this.currentItem.offset();
			this.offset = {
				top: this.offset.top - this.margins.top,
				left: this.offset.left - this.margins.left
			};
			this.helper.css("position", "absolute");
			this.cssPosition = this.helper.css("position");
			a.extend(this.offset, {
				click: {
					left: d.pageX - this.offset.left,
					top: d.pageY - this.offset.top
				},
				parent: this._getParentOffset(),
				relative: this._getRelativeOffset()
			});
			this.originalPosition = this._generatePosition(d);
			this.originalPageX = d.pageX;
			this.originalPageY = d.pageY;
			g.cursorAt && this._adjustOffsetFromHelper(g.cursorAt);
			this.domPosition = {
				prev: this.currentItem.prev()[0],
				parent: this.currentItem.parent()[0]
			};
			this.helper[0] != this.currentItem[0] && this.currentItem.hide();
			this._createPlaceholder();
			g.containment && this._setContainment();
			if (g.cursor) {
				if (a("body").css("cursor")) this._storedCursor = a("body").css("cursor");
				a("body").css("cursor", g.cursor)
			}
			if (g.opacity) {
				if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
				this.helper.css("opacity", g.opacity)
			}
			if (g.zIndex) {
				if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
				this.helper.css("zIndex", g.zIndex)
			}
			if (this.scrollParent[0] != document && this.scrollParent[0].tagName != "HTML") this.overflowOffset = this.scrollParent.offset();
			this._trigger("start", d, this._uiHash());
			this._preserveHelperProportions || this._cacheHelperProportions();
			if (!c) for (c = this.containers.length - 1; c >= 0; c--) this.containers[c]._trigger("activate", d, this._uiHash(this));
			if (a.ui.ddmanager) a.ui.ddmanager.current = this;
			a.ui.ddmanager && !g.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, d);
			this.dragging = true;
			this.helper.addClass("ui-sortable-helper");
			this._mouseDrag(d);
			return true
		},
		_mouseDrag: function (d) {
			this.position = this._generatePosition(d);
			this.positionAbs = this._convertPositionTo("absolute");
			if (!this.lastPositionAbs) this.lastPositionAbs = this.positionAbs;
			if (this.options.scroll) {
				var g = this.options,
					c = false;
				if (this.scrollParent[0] != document && this.scrollParent[0].tagName != "HTML") {
					if (this.overflowOffset.top + this.scrollParent[0].offsetHeight - d.pageY < g.scrollSensitivity) this.scrollParent[0].scrollTop = c = this.scrollParent[0].scrollTop + g.scrollSpeed;
					else if (d.pageY - this.overflowOffset.top < g.scrollSensitivity) this.scrollParent[0].scrollTop = c = this.scrollParent[0].scrollTop - g.scrollSpeed;
					if (this.overflowOffset.left + this.scrollParent[0].offsetWidth - d.pageX < g.scrollSensitivity) this.scrollParent[0].scrollLeft = c = this.scrollParent[0].scrollLeft + g.scrollSpeed;
					else if (d.pageX - this.overflowOffset.left < g.scrollSensitivity) this.scrollParent[0].scrollLeft = c = this.scrollParent[0].scrollLeft - g.scrollSpeed
				} else {
					if (d.pageY - a(document).scrollTop() < g.scrollSensitivity) c = a(document).scrollTop(a(document).scrollTop() - g.scrollSpeed);
					else if (a(window).height() - (d.pageY - a(document).scrollTop()) < g.scrollSensitivity) c = a(document).scrollTop(a(document).scrollTop() + g.scrollSpeed);
					if (d.pageX - a(document).scrollLeft() < g.scrollSensitivity) c = a(document).scrollLeft(a(document).scrollLeft() - g.scrollSpeed);
					else if (a(window).width() - (d.pageX - a(document).scrollLeft()) < g.scrollSensitivity) c = a(document).scrollLeft(a(document).scrollLeft() + g.scrollSpeed)
				}
				c !== false && a.ui.ddmanager && !g.dropBehaviour && a.ui.ddmanager.prepareOffsets(this, d)
			}
			this.positionAbs = this._convertPositionTo("absolute");
			if (!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left + "px";
			if (!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top + "px";
			for (g = this.items.length - 1; g >= 0; g--) {
				c = this.items[g];
				var e = c.item[0],
					b = this._intersectsWithPointer(c);
				if (b) if (e != this.currentItem[0] && this.placeholder[b == 1 ? "next" : "prev"]()[0] != e && !a.ui.contains(this.placeholder[0], e) && (this.options.type == "semi-dynamic" ? !a.ui.contains(this.element[0], e) : true)) {
					this.direction = b == 1 ? "down" : "up";
					if (this.options.tolerance == "pointer" || this._intersectsWithSides(c)) this._rearrange(d, c);
					else break;
					this._trigger("change", d, this._uiHash());
					break
				}
			}
			this._contactContainers(d);
			a.ui.ddmanager && a.ui.ddmanager.drag(this, d);
			this._trigger("sort", d, this._uiHash());
			this.lastPositionAbs = this.positionAbs;
			return false
		},
		_mouseStop: function (d, g) {
			if (d) {
				a.ui.ddmanager && !this.options.dropBehaviour && a.ui.ddmanager.drop(this, d);
				if (this.options.revert) {
					var c = this,
						e = c.placeholder.offset();
					c.reverting = true;
					a(this.helper).animate({
						left: e.left - this.offset.parent.left - c.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
						top: e.top - this.offset.parent.top - c.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
					}, parseInt(this.options.revert, 10) || 500, function () {
						c._clear(d)
					})
				} else this._clear(d, g);
				return false
			}
		},
		cancel: function () {
			if (this.dragging) {
				this._mouseUp();
				this.options.helper == "original" ? this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") : this.currentItem.show();
				for (var d = this.containers.length - 1; d >= 0; d--) {
					this.containers[d]._trigger("deactivate", null, this._uiHash(this));
					if (this.containers[d].containerCache.over) {
						this.containers[d]._trigger("out", null, this._uiHash(this));
						this.containers[d].containerCache.over = 0
					}
				}
			}
			this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			this.options.helper != "original" && this.helper && this.helper[0].parentNode && this.helper.remove();
			a.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});
			this.domPosition.prev ? a(this.domPosition.prev).after(this.currentItem) : a(this.domPosition.parent).prepend(this.currentItem);
			return this
		},
		serialize: function (d) {
			var g = this._getItemsAsjQuery(d && d.connected),
				c = [];
			d = d || {};
			a(g).each(function () {
				var e = (a(d.item || this).attr(d.attribute || "id") || "").match(d.expression || /(.+)[-=_](.+)/);
				if (e) c.push((d.key || e[1] + "[]") + "=" + (d.key && d.expression ? e[1] : e[2]))
			});
			!c.length && d.key && c.push(d.key + "=");
			return c.join("&")
		},
		toArray: function (d) {
			var g = this._getItemsAsjQuery(d && d.connected),
				c = [];
			d = d || {};
			g.each(function () {
				c.push(a(d.item || this).attr(d.attribute || "id") || "")
			});
			return c
		},
		_intersectsWith: function (d) {
			var g = this.positionAbs.left,
				c = g + this.helperProportions.width,
				e = this.positionAbs.top,
				b = e + this.helperProportions.height,
				f = d.left,
				j = f + d.width,
				o = d.top,
				q = o + d.height,
				v = this.offset.click.top,
				w = this.offset.click.left;
			v = e + v > o && e + v < q && g + w > f && g + w < j;
			return this.options.tolerance == "pointer" || this.options.forcePointerForContainers || this.options.tolerance != "pointer" && this.helperProportions[this.floating ? "width" : "height"] > d[this.floating ? "width" : "height"] ? v : f < g + this.helperProportions.width / 2 && c - this.helperProportions.width / 2 < j && o < e + this.helperProportions.height / 2 && b - this.helperProportions.height / 2 < q
		},
		_intersectsWithPointer: function (d) {
			var g = a.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, d.top, d.height);
			d = a.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, d.left, d.width);
			g = g && d;
			d = this._getDragVerticalDirection();
			var c = this._getDragHorizontalDirection();
			if (!g) return false;
			return this.floating ? c && c == "right" || d == "down" ? 2 : 1 : d && (d == "down" ? 2 : 1)
		},
		_intersectsWithSides: function (d) {
			var g = a.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, d.top + d.height / 2, d.height);
			d = a.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, d.left + d.width / 2, d.width);
			var c = this._getDragVerticalDirection(),
				e = this._getDragHorizontalDirection();
			return this.floating && e ? e == "right" && d || e == "left" && !d : c && (c == "down" && g || c == "up" && !g)
		},
		_getDragVerticalDirection: function () {
			var d = this.positionAbs.top - this.lastPositionAbs.top;
			return d != 0 && (d > 0 ? "down" : "up")
		},
		_getDragHorizontalDirection: function () {
			var d = this.positionAbs.left - this.lastPositionAbs.left;
			return d != 0 && (d > 0 ? "right" : "left")
		},
		refresh: function (d) {
			this._refreshItems(d);
			this.refreshPositions();
			return this
		},
		_connectWith: function () {
			var d = this.options;
			return d.connectWith.constructor == String ? [d.connectWith] : d.connectWith
		},
		_getItemsAsjQuery: function (d) {
			var g = [],
				c = [],
				e = this._connectWith();
			if (e && d) for (d = e.length - 1; d >= 0; d--) for (var b = a(e[d]), f = b.length - 1; f >= 0; f--) {
				var j = a.data(b[f], "sortable");
				if (j && j != this && !j.options.disabled) c.push([a.isFunction(j.options.items) ? j.options.items.call(j.element) : a(j.options.items, j.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), j])
			}
			c.push([a.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
				options: this.options,
				item: this.currentItem
			}) : a(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);
			for (d = c.length - 1; d >= 0; d--) c[d][0].each(function () {
				g.push(this)
			});
			return a(g)
		},
		_removeCurrentsFromItems: function () {
			for (var d = this.currentItem.find(":data(sortable-item)"), g = 0; g < this.items.length; g++) for (var c = 0; c < d.length; c++) d[c] == this.items[g].item[0] && this.items.splice(g, 1)
		},
		_refreshItems: function (d) {
			this.items = [];
			this.containers = [this];
			var g = this.items,
				c = [
					[a.isFunction(this.options.items) ? this.options.items.call(this.element[0], d, {
						item: this.currentItem
					}) : a(this.options.items, this.element), this]
				],
				e = this._connectWith();
			if (e) for (var b = e.length - 1; b >= 0; b--) for (var f = a(e[b]), j = f.length - 1; j >= 0; j--) {
				var o = a.data(f[j], "sortable");
				if (o && o != this && !o.options.disabled) {
					c.push([a.isFunction(o.options.items) ? o.options.items.call(o.element[0], d, {
						item: this.currentItem
					}) : a(o.options.items, o.element), o]);
					this.containers.push(o)
				}
			}
			for (b = c.length - 1; b >= 0; b--) {
				d = c[b][1];
				e = c[b][0];
				j = 0;
				for (f = e.length; j < f; j++) {
					o = a(e[j]);
					o.data("sortable-item", d);
					g.push({
						item: o,
						instance: d,
						width: 0,
						height: 0,
						left: 0,
						top: 0
					})
				}
			}
		},
		refreshPositions: function (d) {
			if (this.offsetParent && this.helper) this.offset.parent = this._getParentOffset();
			for (var g = this.items.length - 1; g >= 0; g--) {
				var c = this.items[g],
					e = this.options.toleranceElement ? a(this.options.toleranceElement, c.item) : c.item;
				if (!d) {
					c.width = e.outerWidth();
					c.height = e.outerHeight()
				}
				e = e.offset();
				c.left = e.left;
				c.top = e.top
			}
			if (this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this);
			else for (g = this.containers.length - 1; g >= 0; g--) {
				e = this.containers[g].element.offset();
				this.containers[g].containerCache.left = e.left;
				this.containers[g].containerCache.top = e.top;
				this.containers[g].containerCache.width = this.containers[g].element.outerWidth();
				this.containers[g].containerCache.height = this.containers[g].element.outerHeight()
			}
			return this
		},
		_createPlaceholder: function (d) {
			var g = d || this,
				c = g.options;
			if (!c.placeholder || c.placeholder.constructor == String) {
				var e = c.placeholder;
				c.placeholder = {
					element: function () {
						var b = a(document.createElement(g.currentItem[0].nodeName)).addClass(e || g.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];
						if (!e) b.style.visibility = "hidden";
						return b
					},
					update: function (b, f) {
						if (!(e && !c.forcePlaceholderSize)) {
							f.height() || f.height(g.currentItem.innerHeight() - parseInt(g.currentItem.css("paddingTop") || 0, 10) - parseInt(g.currentItem.css("paddingBottom") || 0, 10));
							f.width() || f.width(g.currentItem.innerWidth() - parseInt(g.currentItem.css("paddingLeft") || 0, 10) - parseInt(g.currentItem.css("paddingRight") || 0, 10))
						}
					}
				}
			}
			g.placeholder = a(c.placeholder.element.call(g.element, g.currentItem));
			g.currentItem.after(g.placeholder);
			c.placeholder.update(g, g.placeholder)
		},
		_contactContainers: function (d) {
			for (var g = null, c = null, e = this.containers.length - 1; e >= 0; e--) if (!a.ui.contains(this.currentItem[0], this.containers[e].element[0])) if (this._intersectsWith(this.containers[e].containerCache)) {
				if (!(g && a.ui.contains(this.containers[e].element[0], g.element[0]))) {
					g = this.containers[e];
					c = e
				}
			} else if (this.containers[e].containerCache.over) {
				this.containers[e]._trigger("out", d, this._uiHash(this));
				this.containers[e].containerCache.over = 0
			}
			if (g) if (this.containers.length === 1) {
				this.containers[c]._trigger("over", d, this._uiHash(this));
				this.containers[c].containerCache.over = 1
			} else if (this.currentContainer != this.containers[c]) {
				g = 1E4;
				e = null;
				for (var b = this.positionAbs[this.containers[c].floating ? "left" : "top"], f = this.items.length - 1; f >= 0; f--) if (a.ui.contains(this.containers[c].element[0], this.items[f].item[0])) {
					var j = this.items[f][this.containers[c].floating ? "left" : "top"];
					if (Math.abs(j - b) < g) {
						g = Math.abs(j - b);
						e = this.items[f]
					}
				}
				if (e || this.options.dropOnEmpty) {
					this.currentContainer = this.containers[c];
					e ? this._rearrange(d, e, null, true) : this._rearrange(d, null, this.containers[c].element, true);
					this._trigger("change", d, this._uiHash());
					this.containers[c]._trigger("change", d, this._uiHash(this));
					this.options.placeholder.update(this.currentContainer, this.placeholder);
					this.containers[c]._trigger("over", d, this._uiHash(this));
					this.containers[c].containerCache.over = 1
				}
			}
		},
		_createHelper: function (d) {
			var g = this.options;
			d = a.isFunction(g.helper) ? a(g.helper.apply(this.element[0], [d, this.currentItem])) : g.helper == "clone" ? this.currentItem.clone() : this.currentItem;
			d.parents("body").length || a(g.appendTo != "parent" ? g.appendTo : this.currentItem[0].parentNode)[0].appendChild(d[0]);
			if (d[0] == this.currentItem[0]) this._storedCSS = {
				width: this.currentItem[0].style.width,
				height: this.currentItem[0].style.height,
				position: this.currentItem.css("position"),
				top: this.currentItem.css("top"),
				left: this.currentItem.css("left")
			};
			if (d[0].style.width == "" || g.forceHelperSize) d.width(this.currentItem.width());
			if (d[0].style.height == "" || g.forceHelperSize) d.height(this.currentItem.height());
			return d
		},
		_adjustOffsetFromHelper: function (d) {
			if (typeof d == "string") d = d.split(" ");
			if (a.isArray(d)) d = {
				left: +d[0],
				top: +d[1] || 0
			};
			if ("left" in d) this.offset.click.left = d.left + this.margins.left;
			if ("right" in d) this.offset.click.left = this.helperProportions.width - d.right + this.margins.left;
			if ("top" in d) this.offset.click.top = d.top + this.margins.top;
			if ("bottom" in d) this.offset.click.top = this.helperProportions.height - d.bottom + this.margins.top
		},
		_getParentOffset: function () {
			this.offsetParent = this.helper.offsetParent();
			var d = this.offsetParent.offset();
			if (this.cssPosition == "absolute" && this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
				d.left += this.scrollParent.scrollLeft();
				d.top += this.scrollParent.scrollTop()
			}
			if (this.offsetParent[0] == document.body || this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == "html" && a.browser.msie) d = {
				top: 0,
				left: 0
			};
			return {
				top: d.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left: d.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset: function () {
			if (this.cssPosition == "relative") {
				var d = this.currentItem.position();
				return {
					top: d.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
					left: d.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
				}
			} else return {
				top: 0,
				left: 0
			}
		},
		_cacheMargins: function () {
			this.margins = {
				left: parseInt(this.currentItem.css("marginLeft"), 10) || 0,
				top: parseInt(this.currentItem.css("marginTop"), 10) || 0
			}
		},
		_cacheHelperProportions: function () {
			this.helperProportions = {
				width: this.helper.outerWidth(),
				height: this.helper.outerHeight()
			}
		},
		_setContainment: function () {
			var d = this.options;
			if (d.containment == "parent") d.containment = this.helper[0].parentNode;
			if (d.containment == "document" || d.containment == "window") this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, a(d.containment == "document" ? document : window).width() - this.helperProportions.width - this.margins.left, (a(d.containment == "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
			if (!/^(document|window|parent)$/.test(d.containment)) {
				var g = a(d.containment)[0];
				d = a(d.containment).offset();
				var c = a(g).css("overflow") != "hidden";
				this.containment = [d.left + (parseInt(a(g).css("borderLeftWidth"), 10) || 0) + (parseInt(a(g).css("paddingLeft"), 10) || 0) - this.margins.left, d.top + (parseInt(a(g).css("borderTopWidth"), 10) || 0) + (parseInt(a(g).css("paddingTop"), 10) || 0) - this.margins.top, d.left + (c ? Math.max(g.scrollWidth, g.offsetWidth) : g.offsetWidth) - (parseInt(a(g).css("borderLeftWidth"), 10) || 0) - (parseInt(a(g).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, d.top + (c ? Math.max(g.scrollHeight, g.offsetHeight) : g.offsetHeight) - (parseInt(a(g).css("borderTopWidth"), 10) || 0) - (parseInt(a(g).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]
			}
		},
		_convertPositionTo: function (d, g) {
			if (!g) g = this.position;
			var c = d == "absolute" ? 1 : -1,
				e = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
				b = /(html|body)/i.test(e[0].tagName);
			return {
				top: g.top + this.offset.relative.top * c + this.offset.parent.top * c - (a.browser.safari && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : b ? 0 : e.scrollTop()) * c),
				left: g.left + this.offset.relative.left * c + this.offset.parent.left * c - (a.browser.safari && this.cssPosition == "fixed" ? 0 : (this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : b ? 0 : e.scrollLeft()) * c)
			}
		},
		_generatePosition: function (d) {
			var g = this.options,
				c = this.cssPosition == "absolute" && !(this.scrollParent[0] != document && a.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
				e = /(html|body)/i.test(c[0].tagName);
			if (this.cssPosition == "relative" && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) this.offset.relative = this._getRelativeOffset();
			var b = d.pageX,
				f = d.pageY;
			if (this.originalPosition) {
				if (this.containment) {
					if (d.pageX - this.offset.click.left < this.containment[0]) b = this.containment[0] + this.offset.click.left;
					if (d.pageY - this.offset.click.top < this.containment[1]) f = this.containment[1] + this.offset.click.top;
					if (d.pageX - this.offset.click.left > this.containment[2]) b = this.containment[2] + this.offset.click.left;
					if (d.pageY - this.offset.click.top > this.containment[3]) f = this.containment[3] + this.offset.click.top
				}
				if (g.grid) {
					f = this.originalPageY + Math.round((f - this.originalPageY) / g.grid[1]) * g.grid[1];
					f = this.containment ? !(f - this.offset.click.top < this.containment[1] || f - this.offset.click.top > this.containment[3]) ? f : !(f - this.offset.click.top < this.containment[1]) ? f - g.grid[1] : f + g.grid[1] : f;
					b = this.originalPageX + Math.round((b - this.originalPageX) / g.grid[0]) * g.grid[0];
					b = this.containment ? !(b - this.offset.click.left < this.containment[0] || b - this.offset.click.left > this.containment[2]) ? b : !(b - this.offset.click.left < this.containment[0]) ? b - g.grid[0] : b + g.grid[0] : b
				}
			}
			return {
				top: f - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + (a.browser.safari && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollTop() : e ? 0 : c.scrollTop()),
				left: b - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + (a.browser.safari && this.cssPosition == "fixed" ? 0 : this.cssPosition == "fixed" ? -this.scrollParent.scrollLeft() : e ? 0 : c.scrollLeft())
			}
		},
		_rearrange: function (d, g, c, e) {
			c ? c[0].appendChild(this.placeholder[0]) : g.item[0].parentNode.insertBefore(this.placeholder[0], this.direction == "down" ? g.item[0] : g.item[0].nextSibling);
			this.counter = this.counter ? ++this.counter : 1;
			var b = this,
				f = this.counter;
			window.setTimeout(function () {
				f == b.counter && b.refreshPositions(!e)
			}, 0)
		},
		_clear: function (d, g) {
			this.reverting = false;
			var c = [];
			!this._noFinalSort && this.currentItem[0].parentNode && this.placeholder.before(this.currentItem);
			this._noFinalSort = null;
			if (this.helper[0] == this.currentItem[0]) {
				for (var e in this._storedCSS) if (this._storedCSS[e] == "auto" || this._storedCSS[e] == "static") this._storedCSS[e] = "";
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")
			} else this.currentItem.show();
			this.fromOutside && !g && c.push(function (b) {
				this._trigger("receive", b, this._uiHash(this.fromOutside))
			});
			if ((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !g) c.push(function (b) {
				this._trigger("update", b, this._uiHash())
			});
			if (!a.ui.contains(this.element[0], this.currentItem[0])) {
				g || c.push(function (b) {
					this._trigger("remove", b, this._uiHash())
				});
				for (e = this.containers.length - 1; e >= 0; e--) if (a.ui.contains(this.containers[e].element[0], this.currentItem[0]) && !g) {
					c.push(function (b) {
						return function (f) {
							b._trigger("receive", f, this._uiHash(this))
						}
					}.call(this, this.containers[e]));
					c.push(function (b) {
						return function (f) {
							b._trigger("update", f, this._uiHash(this))
						}
					}.call(this, this.containers[e]))
				}
			}
			for (e = this.containers.length - 1; e >= 0; e--) {
				g || c.push(function (b) {
					return function (f) {
						b._trigger("deactivate", f, this._uiHash(this))
					}
				}.call(this, this.containers[e]));
				if (this.containers[e].containerCache.over) {
					c.push(function (b) {
						return function (f) {
							b._trigger("out", f, this._uiHash(this))
						}
					}.call(this, this.containers[e]));
					this.containers[e].containerCache.over = 0
				}
			}
			this._storedCursor && a("body").css("cursor", this._storedCursor);
			this._storedOpacity && this.helper.css("opacity", this._storedOpacity);
			if (this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == "auto" ? "" : this._storedZIndex);
			this.dragging = false;
			if (this.cancelHelperRemoval) {
				if (!g) {
					this._trigger("beforeStop", d, this._uiHash());
					for (e = 0; e < c.length; e++) c[e].call(this, d);
					this._trigger("stop", d, this._uiHash())
				}
				return false
			}
			g || this._trigger("beforeStop", d, this._uiHash());
			this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			this.helper[0] != this.currentItem[0] && this.helper.remove();
			this.helper = null;
			if (!g) {
				for (e = 0; e < c.length; e++) c[e].call(this, d);
				this._trigger("stop", d, this._uiHash())
			}
			this.fromOutside = false;
			return true
		},
		_trigger: function () {
			a.Widget.prototype._trigger.apply(this, arguments) === false && this.cancel()
		},
		_uiHash: function (d) {
			var g = d || this;
			return {
				helper: g.helper,
				placeholder: g.placeholder || a([]),
				position: g.position,
				originalPosition: g.originalPosition,
				offset: g.positionAbs,
				item: g.currentItem,
				sender: d ? d.element : null
			}
		}
	});
	a.extend(a.ui.sortable, {
		version: "1.8.7"
	})
})(jQuery);
(function (a) {
	a.widget("ui.autocomplete", {
		options: {
			appendTo: "body",
			delay: 300,
			minLength: 1,
			position: {
				my: "left top",
				at: "left bottom",
				collision: "none"
			},
			source: null
		},
		_create: function () {
			var d = this,
				g = this.element[0].ownerDocument,
				c;
			this.element.addClass("ui-autocomplete-input").attr("autocomplete", "off").attr({
				role: "textbox",
				"aria-autocomplete": "list",
				"aria-haspopup": "true"
			}).bind("keydown.autocomplete", function (e) {
				if (!(d.options.disabled || d.element.attr("readonly"))) {
					c = false;
					var b = a.ui.keyCode;
					switch (e.keyCode) {
					case b.PAGE_UP:
						d._move("previousPage", e);
						break;
					case b.PAGE_DOWN:
						d._move("nextPage", e);
						break;
					case b.UP:
						d._move("previous", e);
						e.preventDefault();
						break;
					case b.DOWN:
						d._move("next", e);
						e.preventDefault();
						break;
					case b.ENTER:
					case b.NUMPAD_ENTER:
						if (d.menu.active) {
							c = true;
							e.preventDefault()
						}
					case b.TAB:
						if (!d.menu.active) return;
						d.menu.select(e);
						break;
					case b.ESCAPE:
						d.element.val(d.term);
						d.close(e);
						break;
					default:
						clearTimeout(d.searching);
						d.searching = setTimeout(function () {
							if (d.term != d.element.val()) {
								d.selectedItem = null;
								d.search(null, e)
							}
						}, d.options.delay);
						break
					}
				}
			}).bind("keypress.autocomplete", function (e) {
				if (c) {
					c = false;
					e.preventDefault()
				}
			}).bind("focus.autocomplete", function () {
				if (!d.options.disabled) {
					d.selectedItem = null;
					d.previous = d.element.val()
				}
			}).bind("blur.autocomplete", function (e) {
				if (!d.options.disabled) {
					clearTimeout(d.searching);
					d.closing = setTimeout(function () {
						d.close(e);
						d._change(e)
					}, 150)
				}
			});
			this._initSource();
			this.response = function () {
				return d._response.apply(d, arguments)
			};
			this.menu = a("<ul></ul>").addClass("ui-autocomplete").appendTo(a(this.options.appendTo || "body", g)[0]).mousedown(function (e) {
				var b = d.menu.element[0];
				a(e.target).closest(".ui-menu-item").length || setTimeout(function () {
					a(document).one("mousedown", function (f) {
						f.target !== d.element[0] && f.target !== b && !a.ui.contains(b, f.target) && d.close()
					})
				}, 1);
				setTimeout(function () {
					clearTimeout(d.closing)
				}, 13)
			}).menu({
				focus: function (e, b) {
					var f = b.item.data("item.autocomplete");
					false !== d._trigger("focus", e, {
						item: f
					}) && /^key/.test(e.originalEvent.type) && d.element.val(f.value)
				},
				selected: function (e, b) {
					var f = b.item.data("item.autocomplete"),
						j = d.previous;
					if (d.element[0] !== g.activeElement) {
						d.element.focus();
						d.previous = j;
						setTimeout(function () {
							d.previous = j;
							d.selectedItem = f
						}, 1)
					}
					false !== d._trigger("select", e, {
						item: f
					}) && d.element.val(f.value);
					d.term = d.element.val();
					d.close(e);
					d.selectedItem = f
				},
				blur: function () {
					d.menu.element.is(":visible") && d.element.val() !== d.term && d.element.val(d.term)
				}
			}).zIndex(this.element.zIndex() + 3).css({
				top: 0,
				left: 0
			}).hide().data("menu");
			a.fn.bgiframe && this.menu.element.bgiframe()
		},
		destroy: function () {
			this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");
			this.menu.element.remove();
			a.Widget.prototype.destroy.call(this)
		},
		_setOption: function (d, g) {
			a.Widget.prototype._setOption.apply(this, arguments);
			d === "source" && this._initSource();
			if (d === "appendTo") this.menu.element.appendTo(a(g || "body", this.element[0].ownerDocument)[0])
		},
		_initSource: function () {
			var d = this,
				g, c;
			if (a.isArray(this.options.source)) {
				g = this.options.source;
				this.source = function (e, b) {
					b(a.ui.autocomplete.filter(g, e.term))
				}
			} else if (typeof this.options.source === "string") {
				c = this.options.source;
				this.source = function (e, b) {
					d.xhr && d.xhr.abort();
					d.xhr = a.ajax({
						url: c,
						data: e,
						dataType: "json",
						success: function (f, j, o) {
							o === d.xhr && b(f);
							d.xhr = null
						},
						error: function (f) {
							f === d.xhr && b([]);
							d.xhr = null
						}
					})
				}
			} else this.source = this.options.source
		},
		search: function (d, g) {
			d = d != null ? d : this.element.val();
			this.term = this.element.val();
			if (d.length < this.options.minLength) return this.close(g);
			clearTimeout(this.closing);
			if (this._trigger("search", g) !== false) return this._search(d)
		},
		_search: function (d) {
			this.element.addClass("ui-autocomplete-loading");
			this.source({
				term: d
			}, this.response)
		},
		_response: function (d) {
			if (d && d.length) {
				d = this._normalize(d);
				this._suggest(d);
				this._trigger("open")
			} else this.close();
			this.element.removeClass("ui-autocomplete-loading")
		},
		close: function (d) {
			clearTimeout(this.closing);
			if (this.menu.element.is(":visible")) {
				this.menu.element.hide();
				this.menu.deactivate();
				this._trigger("close", d)
			}
		},
		_change: function (d) {
			this.previous !== this.element.val() && this._trigger("change", d, {
				item: this.selectedItem
			})
		},
		_normalize: function (d) {
			if (d.length && d[0].label && d[0].value) return d;
			return a.map(d, function (g) {
				if (typeof g === "string") return {
					label: g,
					value: g
				};
				return a.extend({
					label: g.label || g.value,
					value: g.value || g.label
				}, g)
			})
		},
		_suggest: function (d) {
			var g = this.menu.element.empty().zIndex(this.element.zIndex() + 1E3);
			this._renderMenu(g, d);
			this.menu.deactivate();
			this.menu.refresh();
			g.show();
			this._resizeMenu();
			g.position(a.extend({
				of: this.element
			}, this.options.position))
		},
		_resizeMenu: function () {
			var d = this.menu.element;
			d.outerWidth(Math.min(d.width("").outerWidth(), this.element.outerWidth()))
		},
		_renderMenu: function (d, g) {
			var c = this;
			a.each(g, function (e, b) {
				c._renderItem(d, b)
			})
		},
		_renderItem: function (d, g) {
			return a("<li></li>").data("item.autocomplete", g).append(a("<a></a>").text(g.label)).appendTo(d)
		},
		_move: function (d, g) {
			if (this.menu.element.is(":visible")) if (this.menu.first() && /^previous/.test(d) || this.menu.last() && /^next/.test(d)) {
				this.element.val(this.term);
				this.menu.deactivate()
			} else this.menu[d](g);
			else this.search(null, g)
		},
		widget: function () {
			return this.menu.element
		}
	});
	a.extend(a.ui.autocomplete, {
		escapeRegex: function (d) {
			return d.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
		},
		filter: function (d, g) {
			var c = RegExp(a.ui.autocomplete.escapeRegex(g), "i");
			return a.grep(d, function (e) {
				return c.test(e.label || e.value || e)
			})
		}
	})
})(jQuery);
(function (a) {
	a.widget("ui.menu", {
		_create: function () {
			var d = this;
			this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({
				role: "listbox",
				"aria-activedescendant": "ui-active-menuitem"
			}).click(function (g) {
				if (a(g.target).closest(".ui-menu-item a").length) {
					g.preventDefault();
					d.select(g)
				}
			});
			this.refresh()
		},
		refresh: function () {
			var d = this;
			this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role", "menuitem").children("a").addClass("ui-corner-all").attr("tabindex", -1).mouseenter(function (g) {
				d.activate(g, a(this).parent())
			}).mouseleave(function () {
				d.deactivate()
			})
		},
		activate: function (d, g) {
			this.deactivate();
			if (this.hasScroll()) {
				var c = g.offset().top - this.element.offset().top,
					e = this.element.attr("scrollTop"),
					b = this.element.height();
				if (c < 0) this.element.attr("scrollTop", e + c);
				else c >= b && this.element.attr("scrollTop", e + c - b + g.height())
			}
			this.active = g.eq(0).children("a").addClass("ui-state-hover").attr("id", "ui-active-menuitem").end();
			this._trigger("focus", d, {
				item: g
			})
		},
		deactivate: function () {
			if (this.active) {
				this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
				this._trigger("blur");
				this.active = null
			}
		},
		next: function (d) {
			this.move("next", ".ui-menu-item:first", d)
		},
		previous: function (d) {
			this.move("prev", ".ui-menu-item:last", d)
		},
		first: function () {
			return this.active && !this.active.prevAll(".ui-menu-item").length
		},
		last: function () {
			return this.active && !this.active.nextAll(".ui-menu-item").length
		},
		move: function (d, g, c) {
			if (this.active) {
				d = this.active[d + "All"](".ui-menu-item").eq(0);
				d.length ? this.activate(c, d) : this.activate(c, this.element.children(g))
			} else this.activate(c, this.element.children(g))
		},
		nextPage: function (d) {
			if (this.hasScroll()) if (!this.active || this.last()) this.activate(d, this.element.children(".ui-menu-item:first"));
			else {
				var g = this.active.offset().top,
					c = this.element.height(),
					e = this.element.children(".ui-menu-item").filter(function () {
						var b = a(this).offset().top - g - c + a(this).height();
						return b < 10 && b > -10
					});
				e.length || (e = this.element.children(".ui-menu-item:last"));
				this.activate(d, e)
			} else this.activate(d, this.element.children(".ui-menu-item").filter(!this.active || this.last() ? ":first" : ":last"))
		},
		previousPage: function (d) {
			if (this.hasScroll()) if (!this.active || this.first()) this.activate(d, this.element.children(".ui-menu-item:last"));
			else {
				var g = this.active.offset().top,
					c = this.element.height();
				result = this.element.children(".ui-menu-item").filter(function () {
					var e = a(this).offset().top - g + c - a(this).height();
					return e < 10 && e > -10
				});
				result.length || (result = this.element.children(".ui-menu-item:first"));
				this.activate(d, result)
			} else this.activate(d, this.element.children(".ui-menu-item").filter(!this.active || this.first() ? ":last" : ":first"))
		},
		hasScroll: function () {
			return this.element.height() < this.element.attr("scrollHeight")
		},
		select: function (d) {
			this._trigger("selected", d, {
				item: this.active
			})
		}
	})
})(jQuery);
(function (a) {
	a.widget("ui.slider", a.ui.mouse, {
		widgetEventPrefix: "slide",
		options: {
			animate: false,
			distance: 0,
			max: 100,
			min: 0,
			orientation: "horizontal",
			range: false,
			step: 1,
			value: 0,
			values: null
		},
		_create: function () {
			var d = this,
				g = this.options;
			this._mouseSliding = this._keySliding = false;
			this._animateOff = true;
			this._handleIndex = null;
			this._detectOrientation();
			this._mouseInit();
			this.element.addClass("ui-slider ui-slider-" + this.orientation + " ui-widget ui-widget-content ui-corner-all");
			g.disabled && this.element.addClass("ui-slider-disabled ui-disabled");
			this.range = a([]);
			if (g.range) {
				if (g.range === true) {
					this.range = a("<div></div>");
					if (!g.values) g.values = [this._valueMin(), this._valueMin()];
					if (g.values.length && g.values.length !== 2) g.values = [g.values[0], g.values[0]]
				} else this.range = a("<div></div>");
				this.range.appendTo(this.element).addClass("ui-slider-range");
				if (g.range === "min" || g.range === "max") this.range.addClass("ui-slider-range-" + g.range);
				this.range.addClass("ui-widget-header")
			}
			a(".ui-slider-handle", this.element).length === 0 && a("<a href='#'></a>").appendTo(this.element).addClass("ui-slider-handle");
			if (g.values && g.values.length) for (; a(".ui-slider-handle", this.element).length < g.values.length;) a("<a href='#'></a>").appendTo(this.element).addClass("ui-slider-handle");
			this.handles = a(".ui-slider-handle", this.element).addClass("ui-state-default ui-corner-all");
			this.handle = this.handles.eq(0);
			this.handles.add(this.range).filter("a").click(function (c) {
				c.preventDefault()
			}).hover(function () {
				g.disabled || a(this).addClass("ui-state-hover")
			}, function () {
				a(this).removeClass("ui-state-hover")
			}).focus(function () {
				if (g.disabled) a(this).blur();
				else {
					a(".ui-slider .ui-state-focus").removeClass("ui-state-focus");
					a(this).addClass("ui-state-focus")
				}
			}).blur(function () {
				a(this).removeClass("ui-state-focus")
			});
			this.handles.each(function (c) {
				a(this).data("index.ui-slider-handle", c)
			});
			this.handles.keydown(function (c) {
				var e = true,
					b = a(this).data("index.ui-slider-handle"),
					f, j, o;
				if (!d.options.disabled) {
					switch (c.keyCode) {
					case a.ui.keyCode.HOME:
					case a.ui.keyCode.END:
					case a.ui.keyCode.PAGE_UP:
					case a.ui.keyCode.PAGE_DOWN:
					case a.ui.keyCode.UP:
					case a.ui.keyCode.RIGHT:
					case a.ui.keyCode.DOWN:
					case a.ui.keyCode.LEFT:
						e = false;
						if (!d._keySliding) {
							d._keySliding = true;
							a(this).addClass("ui-state-active");
							f = d._start(c, b);
							if (f === false) return
						}
						break
					}
					o = d.options.step;
					f = d.options.values && d.options.values.length ? j = d.values(b) : j = d.value();
					switch (c.keyCode) {
					case a.ui.keyCode.HOME:
						j = d._valueMin();
						break;
					case a.ui.keyCode.END:
						j = d._valueMax();
						break;
					case a.ui.keyCode.PAGE_UP:
						j = d._trimAlignValue(f + (d._valueMax() - d._valueMin()) / 5);
						break;
					case a.ui.keyCode.PAGE_DOWN:
						j = d._trimAlignValue(f - (d._valueMax() - d._valueMin()) / 5);
						break;
					case a.ui.keyCode.UP:
					case a.ui.keyCode.RIGHT:
						if (f === d._valueMax()) return;
						j = d._trimAlignValue(f + o);
						break;
					case a.ui.keyCode.DOWN:
					case a.ui.keyCode.LEFT:
						if (f === d._valueMin()) return;
						j = d._trimAlignValue(f - o);
						break
					}
					d._slide(c, b, j);
					return e
				}
			}).keyup(function (c) {
				var e = a(this).data("index.ui-slider-handle");
				if (d._keySliding) {
					d._keySliding = false;
					d._stop(c, e);
					d._change(c, e);
					a(this).removeClass("ui-state-active")
				}
			});
			this._refreshValue();
			this._animateOff = false
		},
		destroy: function () {
			this.handles.remove();
			this.range.remove();
			this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");
			this._mouseDestroy();
			return this
		},
		_mouseCapture: function (d) {
			var g = this.options,
				c, e, b, f, j;
			if (g.disabled) return false;
			this.elementSize = {
				width: this.element.outerWidth(),
				height: this.element.outerHeight()
			};
			this.elementOffset = this.element.offset();
			c = this._normValueFromMouse({
				x: d.pageX,
				y: d.pageY
			});
			e = this._valueMax() - this._valueMin() + 1;
			f = this;
			this.handles.each(function (o) {
				var q = Math.abs(c - f.values(o));
				if (e > q) {
					e = q;
					b = a(this);
					j = o
				}
			});
			if (g.range === true && this.values(1) === g.min) {
				j += 1;
				b = a(this.handles[j])
			}
			if (this._start(d, j) === false) return false;
			this._mouseSliding = true;
			f._handleIndex = j;
			b.addClass("ui-state-active").focus();
			g = b.offset();
			this._clickOffset = !a(d.target).parents().andSelf().is(".ui-slider-handle") ? {
				left: 0,
				top: 0
			} : {
				left: d.pageX - g.left - b.width() / 2,
				top: d.pageY - g.top - b.height() / 2 - (parseInt(b.css("borderTopWidth"), 10) || 0) - (parseInt(b.css("borderBottomWidth"), 10) || 0) + (parseInt(b.css("marginTop"), 10) || 0)
			};
			this.handles.hasClass("ui-state-hover") || this._slide(d, j, c);
			return this._animateOff = true
		},
		_mouseStart: function () {
			return true
		},
		_mouseDrag: function (d) {
			var g = this._normValueFromMouse({
				x: d.pageX,
				y: d.pageY
			});
			this._slide(d, this._handleIndex, g);
			return false
		},
		_mouseStop: function (d) {
			this.handles.removeClass("ui-state-active");
			this._mouseSliding = false;
			this._stop(d, this._handleIndex);
			this._change(d, this._handleIndex);
			this._clickOffset = this._handleIndex = null;
			return this._animateOff = false
		},
		_detectOrientation: function () {
			this.orientation = this.options.orientation === "vertical" ? "vertical" : "horizontal"
		},
		_normValueFromMouse: function (d) {
			var g;
			if (this.orientation === "horizontal") {
				g = this.elementSize.width;
				d = d.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)
			} else {
				g = this.elementSize.height;
				d = d.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)
			}
			g = d / g;
			if (g > 1) g = 1;
			if (g < 0) g = 0;
			if (this.orientation === "vertical") g = 1 - g;
			d = this._valueMax() - this._valueMin();
			return this._trimAlignValue(this._valueMin() + g * d)
		},
		_start: function (d, g) {
			var c = {
				handle: this.handles[g],
				value: this.value()
			};
			if (this.options.values && this.options.values.length) {
				c.value = this.values(g);
				c.values = this.values()
			}
			return this._trigger("start", d, c)
		},
		_slide: function (d, g, c) {
			var e;
			if (this.options.values && this.options.values.length) {
				e = this.values(g ? 0 : 1);
				if (this.options.values.length === 2 && this.options.range === true && (g === 0 && c > e || g === 1 && c < e)) c = e;
				if (c !== this.values(g)) {
					e = this.values();
					e[g] = c;
					d = this._trigger("slide", d, {
						handle: this.handles[g],
						value: c,
						values: e
					});
					this.values(g ? 0 : 1);
					d !== false && this.values(g, c, true)
				}
			} else if (c !== this.value()) {
				d = this._trigger("slide", d, {
					handle: this.handles[g],
					value: c
				});
				d !== false && this.value(c)
			}
		},
		_stop: function (d, g) {
			var c = {
				handle: this.handles[g],
				value: this.value()
			};
			if (this.options.values && this.options.values.length) {
				c.value = this.values(g);
				c.values = this.values()
			}
			this._trigger("stop", d, c)
		},
		_change: function (d, g) {
			if (!this._keySliding && !this._mouseSliding) {
				var c = {
					handle: this.handles[g],
					value: this.value()
				};
				if (this.options.values && this.options.values.length) {
					c.value = this.values(g);
					c.values = this.values()
				}
				this._trigger("change", d, c)
			}
		},
		value: function (d) {
			if (arguments.length) {
				this.options.value = this._trimAlignValue(d);
				this._refreshValue();
				this._change(null, 0)
			}
			return this._value()
		},
		values: function (d, g) {
			var c, e, b;
			if (arguments.length > 1) {
				this.options.values[d] = this._trimAlignValue(g);
				this._refreshValue();
				this._change(null, d)
			}
			if (arguments.length) if (a.isArray(arguments[0])) {
				c = this.options.values;
				e = arguments[0];
				for (b = 0; b < c.length; b += 1) {
					c[b] = this._trimAlignValue(e[b]);
					this._change(null, b)
				}
				this._refreshValue()
			} else return this.options.values && this.options.values.length ? this._values(d) : this.value();
			else return this._values()
		},
		_setOption: function (d, g) {
			var c, e = 0;
			if (a.isArray(this.options.values)) e = this.options.values.length;
			a.Widget.prototype._setOption.apply(this, arguments);
			switch (d) {
			case "disabled":
				if (g) {
					this.handles.filter(".ui-state-focus").blur();
					this.handles.removeClass("ui-state-hover");
					this.handles.attr("disabled", "disabled");
					this.element.addClass("ui-disabled")
				} else {
					this.handles.removeAttr("disabled");
					this.element.removeClass("ui-disabled")
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation);
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change(null, 0);
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for (c = 0; c < e; c += 1) this._change(null, c);
				this._animateOff = false;
				break
			}
		},
		_value: function () {
			var d = this.options.value;
			return d = this._trimAlignValue(d)
		},
		_values: function (d) {
			var g, c;
			if (arguments.length) {
				g = this.options.values[d];
				return g = this._trimAlignValue(g)
			} else {
				g = this.options.values.slice();
				for (c = 0; c < g.length; c += 1) g[c] = this._trimAlignValue(g[c]);
				return g
			}
		},
		_trimAlignValue: function (d) {
			if (d <= this._valueMin()) return this._valueMin();
			if (d >= this._valueMax()) return this._valueMax();
			var g = this.options.step > 0 ? this.options.step : 1,
				c = (d - this._valueMin()) % g;
			alignValue = d - c;
			if (Math.abs(c) * 2 >= g) alignValue += c > 0 ? g : -g;
			return parseFloat(alignValue.toFixed(5))
		},
		_valueMin: function () {
			return this.options.min
		},
		_valueMax: function () {
			return this.options.max
		},
		_refreshValue: function () {
			var d = this.options.range,
				g = this.options,
				c = this,
				e = !this._animateOff ? g.animate : false,
				b, f = {},
				j, o, q, v;
			if (this.options.values && this.options.values.length) this.handles.each(function (w) {
				b = (c.values(w) - c._valueMin()) / (c._valueMax() - c._valueMin()) * 100;
				f[c.orientation === "horizontal" ? "left" : "bottom"] = b + "%";
				a(this).stop(1, 1)[e ? "animate" : "css"](f, g.animate);
				if (c.options.range === true) if (c.orientation === "horizontal") {
					if (w === 0) c.range.stop(1, 1)[e ? "animate" : "css"]({
						left: b + "%"
					}, g.animate);
					if (w === 1) c.range[e ? "animate" : "css"]({
						width: b - j + "%"
					}, {
						queue: false,
						duration: g.animate
					})
				} else {
					if (w === 0) c.range.stop(1, 1)[e ? "animate" : "css"]({
						bottom: b + "%"
					}, g.animate);
					if (w === 1) c.range[e ? "animate" : "css"]({
						height: b - j + "%"
					}, {
						queue: false,
						duration: g.animate
					})
				}
				j = b
			});
			else {
				o = this.value();
				q = this._valueMin();
				v = this._valueMax();
				b = v !== q ? (o - q) / (v - q) * 100 : 0;
				f[c.orientation === "horizontal" ? "left" : "bottom"] = b + "%";
				this.handle.stop(1, 1)[e ? "animate" : "css"](f, g.animate);
				if (d === "min" && this.orientation === "horizontal") this.range.stop(1, 1)[e ? "animate" : "css"]({
					width: b + "%"
				}, g.animate);
				if (d === "max" && this.orientation === "horizontal") this.range[e ? "animate" : "css"]({
					width: 100 - b + "%"
				}, {
					queue: false,
					duration: g.animate
				});
				if (d === "min" && this.orientation === "vertical") this.range.stop(1, 1)[e ? "animate" : "css"]({
					height: b + "%"
				}, g.animate);
				if (d === "max" && this.orientation === "vertical") this.range[e ? "animate" : "css"]({
					height: 100 - b + "%"
				}, {
					queue: false,
					duration: g.animate
				})
			}
		}
	});
	a.extend(a.ui.slider, {
		version: "1.8.7"
	})
})(jQuery);
(function (a, d) {
	function g() {
		this.debug = false;
		this._curInst = null;
		this._keyEvent = false;
		this._disabledInputs = [];
		this._inDialog = this._datepickerShowing = false;
		this._mainDivId = "ui-datepicker-div";
		this._inlineClass = "ui-datepicker-inline";
		this._appendClass = "ui-datepicker-append";
		this._triggerClass = "ui-datepicker-trigger";
		this._dialogClass = "ui-datepicker-dialog";
		this._disableClass = "ui-datepicker-disabled";
		this._unselectableClass = "ui-datepicker-unselectable";
		this._currentClass = "ui-datepicker-current-day";
		this._dayOverClass = "ui-datepicker-days-cell-over";
		this.regional = [];
		this.regional[""] = {
			closeText: "Done",
			prevText: "Prev",
			nextText: "Next",
			currentText: "Today",
			monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			weekHeader: "Wk",
			dateFormat: "mm/dd/yy",
			firstDay: 0,
			isRTL: false,
			showMonthAfterYear: false,
			yearSuffix: ""
		};
		this._defaults = {
			showOn: "focus",
			showAnim: "fadeIn",
			showOptions: {},
			defaultDate: null,
			appendText: "",
			buttonText: "...",
			buttonImage: "",
			buttonImageOnly: false,
			hideIfNoPrevNext: false,
			navigationAsDateFormat: false,
			gotoCurrent: false,
			changeMonth: false,
			changeYear: false,
			yearRange: "c-10:c+10",
			showOtherMonths: false,
			selectOtherMonths: false,
			showWeek: false,
			calculateWeek: this.iso8601Week,
			shortYearCutoff: "+10",
			minDate: null,
			maxDate: null,
			duration: "fast",
			beforeShowDay: null,
			beforeShow: null,
			onSelect: null,
			onChangeMonthYear: null,
			onClose: null,
			numberOfMonths: 1,
			showCurrentAtPos: 0,
			stepMonths: 1,
			stepBigMonths: 12,
			altField: "",
			altFormat: "",
			constrainInput: true,
			showButtonPanel: false,
			autoSize: false
		};
		a.extend(this._defaults, this.regional[""]);
		this.dpDiv = a('<div id="' + this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')
	}
	function c(b, f) {
		a.extend(b, f);
		for (var j in f) if (f[j] == null || f[j] == d) b[j] = f[j];
		return b
	}
	a.extend(a.ui, {
		datepicker: {
			version: "1.8.7"
		}
	});
	var e = (new Date).getTime();
	a.extend(g.prototype, {
		markerClassName: "hasDatepicker",
		log: function () {
			this.debug && console.log.apply("", arguments)
		},
		_widgetDatepicker: function () {
			return this.dpDiv
		},
		setDefaults: function (b) {
			c(this._defaults, b || {});
			return this
		},
		_attachDatepicker: function (b, f) {
			var j = null;
			for (var o in this._defaults) {
				var q = b.getAttribute("date:" + o);
				if (q) {
					j = j || {};
					try {
						j[o] = eval(q)
					} catch (v) {
						j[o] = q
					}
				}
			}
			o = b.nodeName.toLowerCase();
			q = o == "div" || o == "span";
			if (!b.id) {
				this.uuid += 1;
				b.id = "dp" + this.uuid
			}
			var w = this._newInst(a(b), q);
			w.settings = a.extend({}, f || {}, j || {});
			if (o == "input") this._connectDatepicker(b, w);
			else q && this._inlineDatepicker(b, w)
		},
		_newInst: function (b, f) {
			return {
				id: b[0].id.replace(/([^A-Za-z0-9_-])/g, "\\\\$1"),
				input: b,
				selectedDay: 0,
				selectedMonth: 0,
				selectedYear: 0,
				drawMonth: 0,
				drawYear: 0,
				inline: f,
				dpDiv: !f ? this.dpDiv : a('<div class="' + this._inlineClass + ' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')
			}
		},
		_connectDatepicker: function (b, f) {
			var j = a(b);
			f.append = a([]);
			f.trigger = a([]);
			if (!j.hasClass(this.markerClassName)) {
				this._attachments(j, f);
				j.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker", function (o, q, v) {
					f.settings[q] = v
				}).bind("getData.datepicker", function (o, q) {
					return this._get(f, q)
				});
				this._autoSize(f);
				a.data(b, "datepicker", f)
			}
		},
		_attachments: function (b, f) {
			var j = this._get(f, "appendText"),
				o = this._get(f, "isRTL");
			f.append && f.append.remove();
			if (j) {
				f.append = a('<span class="' + this._appendClass + '">' + j + "</span>");
				b[o ? "before" : "after"](f.append)
			}
			b.unbind("focus", this._showDatepicker);
			f.trigger && f.trigger.remove();
			j = this._get(f, "showOn");
			if (j == "focus" || j == "both") b.focus(this._showDatepicker);
			if (j == "button" || j == "both") {
				j = this._get(f, "buttonText");
				var q = this._get(f, "buttonImage");
				f.trigger = a(this._get(f, "buttonImageOnly") ? a("<img/>").addClass(this._triggerClass).attr({
					src: q,
					alt: j,
					title: j
				}) : a('<button type="button"></button>').addClass(this._triggerClass).html(q == "" ? j : a("<img/>").attr({
					src: q,
					alt: j,
					title: j
				})));
				b[o ? "before" : "after"](f.trigger);
				f.trigger.click(function () {
					a.datepicker._datepickerShowing && a.datepicker._lastInput == b[0] ? a.datepicker._hideDatepicker() : a.datepicker._showDatepicker(b[0]);
					return false
				})
			}
		},
		_autoSize: function (b) {
			if (this._get(b, "autoSize") && !b.inline) {
				var f = new Date(2009, 11, 20),
					j = this._get(b, "dateFormat");
				if (j.match(/[DM]/)) {
					var o = function (q) {
						for (var v = 0, w = 0, E = 0; E < q.length; E++) if (q[E].length > v) {
							v = q[E].length;
							w = E
						}
						return w
					};
					f.setMonth(o(this._get(b, j.match(/MM/) ? "monthNames" : "monthNamesShort")));
					f.setDate(o(this._get(b, j.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - f.getDay())
				}
				b.input.attr("size", this._formatDate(b, f).length)
			}
		},
		_inlineDatepicker: function (b, f) {
			var j = a(b);
			if (!j.hasClass(this.markerClassName)) {
				j.addClass(this.markerClassName).append(f.dpDiv).bind("setData.datepicker", function (o, q, v) {
					f.settings[q] = v
				}).bind("getData.datepicker", function (o, q) {
					return this._get(f, q)
				});
				a.data(b, "datepicker", f);
				this._setDate(f, this._getDefaultDate(f), true);
				this._updateDatepicker(f);
				this._updateAlternate(f);
				f.dpDiv.show()
			}
		},
		_dialogDatepicker: function (b, f, j, o, q) {
			b = this._dialogInst;
			if (!b) {
				this.uuid += 1;
				this._dialogInput = a('<input type="text" id="' + ("dp" + this.uuid) + '" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');
				this._dialogInput.keydown(this._doKeyDown);
				a("body").append(this._dialogInput);
				b = this._dialogInst = this._newInst(this._dialogInput, false);
				b.settings = {};
				a.data(this._dialogInput[0], "datepicker", b)
			}
			c(b.settings, o || {});
			f = f && f.constructor == Date ? this._formatDate(b, f) : f;
			this._dialogInput.val(f);
			this._pos = q ? q.length ? q : [q.pageX, q.pageY] : null;
			if (!this._pos) this._pos = [document.documentElement.clientWidth / 2 - 100 + (document.documentElement.scrollLeft || document.body.scrollLeft), document.documentElement.clientHeight / 2 - 150 + (document.documentElement.scrollTop || document.body.scrollTop)];
			this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px");
			b.settings.onSelect = j;
			this._inDialog = true;
			this.dpDiv.addClass(this._dialogClass);
			this._showDatepicker(this._dialogInput[0]);
			a.blockUI && a.blockUI(this.dpDiv);
			a.data(this._dialogInput[0], "datepicker", b);
			return this
		},
		_destroyDatepicker: function (b) {
			var f = a(b),
				j = a.data(b, "datepicker");
			if (f.hasClass(this.markerClassName)) {
				var o = b.nodeName.toLowerCase();
				a.removeData(b, "datepicker");
				if (o == "input") {
					j.append.remove();
					j.trigger.remove();
					f.removeClass(this.markerClassName).unbind("focus", this._showDatepicker).unbind("keydown", this._doKeyDown).unbind("keypress", this._doKeyPress).unbind("keyup", this._doKeyUp)
				} else if (o == "div" || o == "span") f.removeClass(this.markerClassName).empty()
			}
		},
		_enableDatepicker: function (b) {
			var f = a(b),
				j = a.data(b, "datepicker");
			if (f.hasClass(this.markerClassName)) {
				var o = b.nodeName.toLowerCase();
				if (o == "input") {
					b.disabled = false;
					j.trigger.filter("button").each(function () {
						this.disabled = false
					}).end().filter("img").css({
						opacity: "1.0",
						cursor: ""
					})
				} else if (o == "div" || o == "span") f.children("." + this._inlineClass).children().removeClass("ui-state-disabled");
				this._disabledInputs = a.map(this._disabledInputs, function (q) {
					return q == b ? null : q
				})
			}
		},
		_disableDatepicker: function (b) {
			var f = a(b),
				j = a.data(b, "datepicker");
			if (f.hasClass(this.markerClassName)) {
				var o = b.nodeName.toLowerCase();
				if (o == "input") {
					b.disabled = true;
					j.trigger.filter("button").each(function () {
						this.disabled = true
					}).end().filter("img").css({
						opacity: "0.5",
						cursor: "default"
					})
				} else if (o == "div" || o == "span") f.children("." + this._inlineClass).children().addClass("ui-state-disabled");
				this._disabledInputs = a.map(this._disabledInputs, function (q) {
					return q == b ? null : q
				});
				this._disabledInputs[this._disabledInputs.length] = b
			}
		},
		_isDisabledDatepicker: function (b) {
			if (!b) return false;
			for (var f = 0; f < this._disabledInputs.length; f++) if (this._disabledInputs[f] == b) return true;
			return false
		},
		_getInst: function (b) {
			try {
				return a.data(b, "datepicker")
			} catch (f) {
				throw "Missing instance data for this datepicker";
			}
		},
		_optionDatepicker: function (b, f, j) {
			var o = this._getInst(b);
			if (arguments.length == 2 && typeof f == "string") return f == "defaults" ? a.extend({}, a.datepicker._defaults) : o ? f == "all" ? a.extend({}, o.settings) : this._get(o, f) : null;
			var q = f || {};
			if (typeof f == "string") {
				q = {};
				q[f] = j
			}
			if (o) {
				this._curInst == o && this._hideDatepicker();
				var v = this._getDateDatepicker(b, true);
				c(o.settings, q);
				this._attachments(a(b), o);
				this._autoSize(o);
				this._setDateDatepicker(b, v);
				this._updateDatepicker(o)
			}
		},
		_changeDatepicker: function (b, f, j) {
			this._optionDatepicker(b, f, j)
		},
		_refreshDatepicker: function (b) {
			(b = this._getInst(b)) && this._updateDatepicker(b)
		},
		_setDateDatepicker: function (b, f) {
			var j = this._getInst(b);
			if (j) {
				this._setDate(j, f);
				this._updateDatepicker(j);
				this._updateAlternate(j)
			}
		},
		_getDateDatepicker: function (b, f) {
			var j = this._getInst(b);
			j && !j.inline && this._setDateFromField(j, f);
			return j ? this._getDate(j) : null
		},
		_doKeyDown: function (b) {
			var f = a.datepicker._getInst(b.target),
				j = true,
				o = f.dpDiv.is(".ui-datepicker-rtl");
			f._keyEvent = true;
			if (a.datepicker._datepickerShowing) switch (b.keyCode) {
			case 9:
				a.datepicker._hideDatepicker();
				j = false;
				break;
			case 13:
				j = a("td." + a.datepicker._dayOverClass + ":not(." + a.datepicker._currentClass + ")", f.dpDiv);
				j[0] ? a.datepicker._selectDay(b.target, f.selectedMonth, f.selectedYear, j[0]) : a.datepicker._hideDatepicker();
				return false;
			case 27:
				a.datepicker._hideDatepicker();
				break;
			case 33:
				a.datepicker._adjustDate(b.target, b.ctrlKey ? -a.datepicker._get(f, "stepBigMonths") : -a.datepicker._get(f, "stepMonths"), "M");
				break;
			case 34:
				a.datepicker._adjustDate(b.target, b.ctrlKey ? +a.datepicker._get(f, "stepBigMonths") : +a.datepicker._get(f, "stepMonths"), "M");
				break;
			case 35:
				if (b.ctrlKey || b.metaKey) a.datepicker._clearDate(b.target);
				j = b.ctrlKey || b.metaKey;
				break;
			case 36:
				if (b.ctrlKey || b.metaKey) a.datepicker._gotoToday(b.target);
				j = b.ctrlKey || b.metaKey;
				break;
			case 37:
				if (b.ctrlKey || b.metaKey) a.datepicker._adjustDate(b.target, o ? +1 : -1, "D");
				j = b.ctrlKey || b.metaKey;
				if (b.originalEvent.altKey) a.datepicker._adjustDate(b.target, b.ctrlKey ? -a.datepicker._get(f, "stepBigMonths") : -a.datepicker._get(f, "stepMonths"), "M");
				break;
			case 38:
				if (b.ctrlKey || b.metaKey) a.datepicker._adjustDate(b.target, -7, "D");
				j = b.ctrlKey || b.metaKey;
				break;
			case 39:
				if (b.ctrlKey || b.metaKey) a.datepicker._adjustDate(b.target, o ? -1 : +1, "D");
				j = b.ctrlKey || b.metaKey;
				if (b.originalEvent.altKey) a.datepicker._adjustDate(b.target, b.ctrlKey ? +a.datepicker._get(f, "stepBigMonths") : +a.datepicker._get(f, "stepMonths"), "M");
				break;
			case 40:
				if (b.ctrlKey || b.metaKey) a.datepicker._adjustDate(b.target, +7, "D");
				j = b.ctrlKey || b.metaKey;
				break;
			default:
				j = false
			} else if (b.keyCode == 36 && b.ctrlKey) a.datepicker._showDatepicker(this);
			else j = false;
			if (j) {
				b.preventDefault();
				b.stopPropagation()
			}
		},
		_doKeyPress: function (b) {
			var f = a.datepicker._getInst(b.target);
			if (a.datepicker._get(f, "constrainInput")) {
				f = a.datepicker._possibleChars(a.datepicker._get(f, "dateFormat"));
				var j = String.fromCharCode(b.charCode == d ? b.keyCode : b.charCode);
				return b.ctrlKey || b.metaKey || j < " " || !f || f.indexOf(j) > -1
			}
		},
		_doKeyUp: function (b) {
			b = a.datepicker._getInst(b.target);
			if (b.input.val() != b.lastVal) try {
				if (a.datepicker.parseDate(a.datepicker._get(b, "dateFormat"), b.input ? b.input.val() : null, a.datepicker._getFormatConfig(b))) {
					a.datepicker._setDateFromField(b);
					a.datepicker._updateAlternate(b);
					a.datepicker._updateDatepicker(b)
				}
			} catch (f) {
				a.datepicker.log(f)
			}
			return true
		},
		_showDatepicker: function (b) {
			b = b.target || b;
			if (b.nodeName.toLowerCase() != "input") b = a("input", b.parentNode)[0];
			if (!(a.datepicker._isDisabledDatepicker(b) || a.datepicker._lastInput == b)) {
				var f = a.datepicker._getInst(b);
				a.datepicker._curInst && a.datepicker._curInst != f && a.datepicker._curInst.dpDiv.stop(true, true);
				var j = a.datepicker._get(f, "beforeShow");
				c(f.settings, j ? j.apply(b, [b, f]) : {});
				f.lastVal = null;
				a.datepicker._lastInput = b;
				a.datepicker._setDateFromField(f);
				if (a.datepicker._inDialog) b.value = "";
				if (!a.datepicker._pos) {
					a.datepicker._pos = a.datepicker._findPos(b);
					a.datepicker._pos[1] += b.offsetHeight
				}
				var o = false;
				a(b).parents().each(function () {
					o |= a(this).css("position") == "fixed";
					return !o
				});
				if (o && a.browser.opera) {
					a.datepicker._pos[0] -= document.documentElement.scrollLeft;
					a.datepicker._pos[1] -= document.documentElement.scrollTop
				}
				j = {
					left: a.datepicker._pos[0],
					top: a.datepicker._pos[1]
				};
				a.datepicker._pos = null;
				f.dpDiv.empty();
				f.dpDiv.css({
					position: "absolute",
					display: "block",
					top: "-1000px"
				});
				a.datepicker._updateDatepicker(f);
				j = a.datepicker._checkOffset(f, j, o);
				f.dpDiv.css({
					position: a.datepicker._inDialog && a.blockUI ? "static" : o ? "fixed" : "absolute",
					display: "none",
					left: j.left + "px",
					top: j.top + "px"
				});
				if (!f.inline) {
					j = a.datepicker._get(f, "showAnim");
					var q = a.datepicker._get(f, "duration"),
						v = function () {
							a.datepicker._datepickerShowing = true;
							var w = f.dpDiv.find("iframe.ui-datepicker-cover");
							if (w.length) {
								var E = a.datepicker._getBorders(f.dpDiv);
								w.css({
									left: -E[0],
									top: -E[1],
									width: f.dpDiv.outerWidth(),
									height: f.dpDiv.outerHeight()
								})
							}
						};
					f.dpDiv.zIndex(a(b).zIndex() + 1);
					a.effects && a.effects[j] ? f.dpDiv.show(j, a.datepicker._get(f, "showOptions"), q, v) : f.dpDiv[j || "show"](j ? q : null, v);
					if (!j || !q) v();
					f.input.is(":visible") && !f.input.is(":disabled") && f.input.focus();
					a.datepicker._curInst = f
				}
			}
		},
		_updateDatepicker: function (b) {
			var f = this,
				j = a.datepicker._getBorders(b.dpDiv);
			b.dpDiv.empty().append(this._generateHTML(b));
			var o = b.dpDiv.find("iframe.ui-datepicker-cover");
			o.length && o.css({
				left: -j[0],
				top: -j[1],
				width: b.dpDiv.outerWidth(),
				height: b.dpDiv.outerHeight()
			});
			b.dpDiv.find("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a").bind("mouseout", function () {
				a(this).removeClass("ui-state-hover");
				this.className.indexOf("ui-datepicker-prev") != -1 && a(this).removeClass("ui-datepicker-prev-hover");
				this.className.indexOf("ui-datepicker-next") != -1 && a(this).removeClass("ui-datepicker-next-hover")
			}).bind("mouseover", function () {
				if (!f._isDisabledDatepicker(b.inline ? b.dpDiv.parent()[0] : b.input[0])) {
					a(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
					a(this).addClass("ui-state-hover");
					this.className.indexOf("ui-datepicker-prev") != -1 && a(this).addClass("ui-datepicker-prev-hover");
					this.className.indexOf("ui-datepicker-next") != -1 && a(this).addClass("ui-datepicker-next-hover")
				}
			}).end().find("." + this._dayOverClass + " a").trigger("mouseover").end();
			j = this._getNumberOfMonths(b);
			o = j[1];
			o > 1 ? b.dpDiv.addClass("ui-datepicker-multi-" + o).css("width", 17 * o + "em") : b.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
			b.dpDiv[(j[0] != 1 || j[1] != 1 ? "add" : "remove") + "Class"]("ui-datepicker-multi");
			b.dpDiv[(this._get(b, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl");
			b == a.datepicker._curInst && a.datepicker._datepickerShowing && b.input && b.input.is(":visible") && !b.input.is(":disabled") && b.input.focus();
			if (b.yearshtml) {
				var q = b.yearshtml;
				setTimeout(function () {
					q === b.yearshtml && b.dpDiv.find("select.ui-datepicker-year:first").replaceWith(b.yearshtml);
					q = b.yearshtml = null
				}, 0)
			}
		},
		_getBorders: function (b) {
			var f = function (j) {
				return {
					thin: 1,
					medium: 2,
					thick: 3
				}[j] || j
			};
			return [parseFloat(f(b.css("border-left-width"))), parseFloat(f(b.css("border-top-width")))]
		},
		_checkOffset: function (b, f, j) {
			var o = b.dpDiv.outerWidth(),
				q = b.dpDiv.outerHeight(),
				v = b.input ? b.input.outerWidth() : 0,
				w = b.input ? b.input.outerHeight() : 0,
				E = document.documentElement.clientWidth + a(document).scrollLeft(),
				A = document.documentElement.clientHeight + a(document).scrollTop();
			f.left -= this._get(b, "isRTL") ? o - v : 0;
			f.left -= j && f.left == b.input.offset().left ? a(document).scrollLeft() : 0;
			f.top -= j && f.top == b.input.offset().top + w ? a(document).scrollTop() : 0;
			f.left -= Math.min(f.left, f.left + o > E && E > o ? Math.abs(f.left + o - E) : 0);
			f.top -= Math.min(f.top, f.top + q > A && A > q ? Math.abs(q + w) : 0);
			return f
		},
		_findPos: function (b) {
			for (var f = this._get(this._getInst(b), "isRTL"); b && (b.type == "hidden" || b.nodeType != 1);) b = b[f ? "previousSibling" : "nextSibling"];
			b = a(b).offset();
			return [b.left, b.top]
		},
		_hideDatepicker: function (b) {
			var f = this._curInst;
			if (!(!f || b && f != a.data(b, "datepicker"))) if (this._datepickerShowing) {
				b = this._get(f, "showAnim");
				var j = this._get(f, "duration"),
					o = function () {
						a.datepicker._tidyDialog(f);
						this._curInst = null
					};
				a.effects && a.effects[b] ? f.dpDiv.hide(b, a.datepicker._get(f, "showOptions"), j, o) : f.dpDiv[b == "slideDown" ? "slideUp" : b == "fadeIn" ? "fadeOut" : "hide"](b ? j : null, o);
				b || o();
				if (b = this._get(f, "onClose")) b.apply(f.input ? f.input[0] : null, [f.input ? f.input.val() : "", f]);
				this._datepickerShowing = false;
				this._lastInput = null;
				if (this._inDialog) {
					this._dialogInput.css({
						position: "absolute",
						left: "0",
						top: "-100px"
					});
					if (a.blockUI) {
						a.unblockUI();
						a("body").append(this.dpDiv)
					}
				}
				this._inDialog = false
			}
		},
		_tidyDialog: function (b) {
			b.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")
		},
		_checkExternalClick: function (b) {
			if (a.datepicker._curInst) {
				b = a(b.target);
				b[0].id != a.datepicker._mainDivId && b.parents("#" + a.datepicker._mainDivId).length == 0 && !b.hasClass(a.datepicker.markerClassName) && !b.hasClass(a.datepicker._triggerClass) && a.datepicker._datepickerShowing && !(a.datepicker._inDialog && a.blockUI) && a.datepicker._hideDatepicker()
			}
		},
		_adjustDate: function (b, f, j) {
			b = a(b);
			var o = this._getInst(b[0]);
			if (!this._isDisabledDatepicker(b[0])) {
				this._adjustInstDate(o, f + (j == "M" ? this._get(o, "showCurrentAtPos") : 0), j);
				this._updateDatepicker(o)
			}
		},
		_gotoToday: function (b) {
			b = a(b);
			var f = this._getInst(b[0]);
			if (this._get(f, "gotoCurrent") && f.currentDay) {
				f.selectedDay = f.currentDay;
				f.drawMonth = f.selectedMonth = f.currentMonth;
				f.drawYear = f.selectedYear = f.currentYear
			} else {
				var j = new Date;
				f.selectedDay = j.getDate();
				f.drawMonth = f.selectedMonth = j.getMonth();
				f.drawYear = f.selectedYear = j.getFullYear()
			}
			this._notifyChange(f);
			this._adjustDate(b)
		},
		_selectMonthYear: function (b, f, j) {
			b = a(b);
			var o = this._getInst(b[0]);
			o._selectingMonthYear = false;
			o["selected" + (j == "M" ? "Month" : "Year")] = o["draw" + (j == "M" ? "Month" : "Year")] = parseInt(f.options[f.selectedIndex].value, 10);
			this._notifyChange(o);
			this._adjustDate(b)
		},
		_clickMonthYear: function (b) {
			var f = this._getInst(a(b)[0]);
			f.input && f._selectingMonthYear && setTimeout(function () {
				f.input.focus()
			}, 0);
			f._selectingMonthYear = !f._selectingMonthYear
		},
		_selectDay: function (b, f, j, o) {
			var q = a(b);
			if (!(a(o).hasClass(this._unselectableClass) || this._isDisabledDatepicker(q[0]))) {
				q = this._getInst(q[0]);
				q.selectedDay = q.currentDay = a("a", o).html();
				q.selectedMonth = q.currentMonth = f;
				q.selectedYear = q.currentYear = j;
				this._selectDate(b, this._formatDate(q, q.currentDay, q.currentMonth, q.currentYear))
			}
		},
		_clearDate: function (b) {
			b = a(b);
			this._getInst(b[0]);
			this._selectDate(b, "")
		},
		_selectDate: function (b, f) {
			var j = this._getInst(a(b)[0]);
			f = f != null ? f : this._formatDate(j);
			j.input && j.input.val(f);
			this._updateAlternate(j);
			var o = this._get(j, "onSelect");
			if (o) o.apply(j.input ? j.input[0] : null, [f, j]);
			else j.input && j.input.trigger("change");
			if (j.inline) this._updateDatepicker(j);
			else {
				this._hideDatepicker();
				this._lastInput = j.input[0];
				typeof j.input[0] != "object" && j.input.focus();
				this._lastInput = null
			}
		},
		_updateAlternate: function (b) {
			var f = this._get(b, "altField");
			if (f) {
				var j = this._get(b, "altFormat") || this._get(b, "dateFormat"),
					o = this._getDate(b),
					q = this.formatDate(j, o, this._getFormatConfig(b));
				a(f).each(function () {
					a(this).val(q)
				})
			}
		},
		noWeekends: function (b) {
			b = b.getDay();
			return [b > 0 && b < 6, ""]
		},
		iso8601Week: function (b) {
			b = new Date(b.getTime());
			b.setDate(b.getDate() + 4 - (b.getDay() || 7));
			var f = b.getTime();
			b.setMonth(0);
			b.setDate(1);
			return Math.floor(Math.round((f - b) / 864E5) / 7) + 1
		},
		parseDate: function (b, f, j) {
			if (b == null || f == null) throw "Invalid arguments";
			f = typeof f == "object" ? f.toString() : f + "";
			if (f == "") return null;
			for (var o = (j ? j.shortYearCutoff : null) || this._defaults.shortYearCutoff, q = (j ? j.dayNamesShort : null) || this._defaults.dayNamesShort, v = (j ? j.dayNames : null) || this._defaults.dayNames, w = (j ? j.monthNamesShort : null) || this._defaults.monthNamesShort, E = (j ? j.monthNames : null) || this._defaults.monthNames, A = j = -1, B = -1, G = -1, x = false, D = function (l) {
				(l = W + 1 < b.length && b.charAt(W + 1) == l) && W++;
				return l
			}, F = function (l) {
				var Y = D(l);
				l = RegExp("^\\d{1," + (l == "@" ? 14 : l == "!" ? 20 : l == "y" && Y ? 4 : l == "o" ? 3 : 2) + "}");
				l = f.substring(ea).match(l);
				if (!l) throw "Missing number at position " + ea;
				ea += l[0].length;
				return parseInt(l[0], 10)
			}, R = function (l, Y, ha) {
				l = D(l) ? ha : Y;
				for (Y = 0; Y < l.length; Y++) if (f.substr(ea, l[Y].length).toLowerCase() == l[Y].toLowerCase()) {
					ea += l[Y].length;
					return Y + 1
				}
				throw "Unknown name at position " + ea;
			}, X = function () {
				if (f.charAt(ea) != b.charAt(W)) throw "Unexpected literal at position " + ea;
				ea++
			}, ea = 0, W = 0; W < b.length; W++) if (x) if (b.charAt(W) == "'" && !D("'")) x = false;
			else X();
			else switch (b.charAt(W)) {
			case "d":
				B = F("d");
				break;
			case "D":
				R("D", q, v);
				break;
			case "o":
				G = F("o");
				break;
			case "m":
				A = F("m");
				break;
			case "M":
				A = R("M", w, E);
				break;
			case "y":
				j = F("y");
				break;
			case "@":
				var M = new Date(F("@"));
				j = M.getFullYear();
				A = M.getMonth() + 1;
				B = M.getDate();
				break;
			case "!":
				M = new Date((F("!") - this._ticksTo1970) / 1E4);
				j = M.getFullYear();
				A = M.getMonth() + 1;
				B = M.getDate();
				break;
			case "'":
				if (D("'")) X();
				else x = true;
				break;
			default:
				X()
			}
			if (j == -1) j = (new Date).getFullYear();
			else if (j < 100) j += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (j <= o ? 0 : -100);
			if (G > -1) {
				A = 1;
				B = G;
				do {
					o = this._getDaysInMonth(j, A - 1);
					if (B <= o) break;
					A++;
					B -= o
				} while (1)
			}
			M = this._daylightSavingAdjust(new Date(j, A - 1, B));
			if (M.getFullYear() != j || M.getMonth() + 1 != A || M.getDate() != B) throw "Invalid date";
			return M
		},
		ATOM: "yy-mm-dd",
		COOKIE: "D, dd M yy",
		ISO_8601: "yy-mm-dd",
		RFC_822: "D, d M y",
		RFC_850: "DD, dd-M-y",
		RFC_1036: "D, d M y",
		RFC_1123: "D, d M yy",
		RFC_2822: "D, d M yy",
		RSS: "D, d M y",
		TICKS: "!",
		TIMESTAMP: "@",
		W3C: "yy-mm-dd",
		_ticksTo1970: (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)) * 24 * 60 * 60 * 1E7,
		formatDate: function (b, f, j) {
			if (!f) return "";
			var o = (j ? j.dayNamesShort : null) || this._defaults.dayNamesShort,
				q = (j ? j.dayNames : null) || this._defaults.dayNames,
				v = (j ? j.monthNamesShort : null) || this._defaults.monthNamesShort;
			j = (j ? j.monthNames : null) || this._defaults.monthNames;
			var w = function (D) {
				(D = x + 1 < b.length && b.charAt(x + 1) == D) && x++;
				return D
			},
				E = function (D, F, R) {
					F = "" + F;
					if (w(D)) for (; F.length < R;) F = "0" + F;
					return F
				},
				A = function (D, F, R, X) {
					return w(D) ? X[F] : R[F]
				},
				B = "",
				G = false;
			if (f) for (var x = 0; x < b.length; x++) if (G) if (b.charAt(x) == "'" && !w("'")) G = false;
			else B += b.charAt(x);
			else switch (b.charAt(x)) {
			case "d":
				B += E("d", f.getDate(), 2);
				break;
			case "D":
				B += A("D", f.getDay(), o, q);
				break;
			case "o":
				B += E("o", (f.getTime() - (new Date(f.getFullYear(), 0, 0)).getTime()) / 864E5, 3);
				break;
			case "m":
				B += E("m", f.getMonth() + 1, 2);
				break;
			case "M":
				B += A("M", f.getMonth(), v, j);
				break;
			case "y":
				B += w("y") ? f.getFullYear() : (f.getYear() % 100 < 10 ? "0" : "") + f.getYear() % 100;
				break;
			case "@":
				B += f.getTime();
				break;
			case "!":
				B += f.getTime() * 1E4 + this._ticksTo1970;
				break;
			case "'":
				if (w("'")) B += "'";
				else G = true;
				break;
			default:
				B += b.charAt(x)
			}
			return B
		},
		_possibleChars: function (b) {
			for (var f = "", j = false, o = function (v) {
				(v = q + 1 < b.length && b.charAt(q + 1) == v) && q++;
				return v
			}, q = 0; q < b.length; q++) if (j) if (b.charAt(q) == "'" && !o("'")) j = false;
			else f += b.charAt(q);
			else switch (b.charAt(q)) {
			case "d":
			case "m":
			case "y":
			case "@":
				f += "0123456789";
				break;
			case "D":
			case "M":
				return null;
			case "'":
				if (o("'")) f += "'";
				else j = true;
				break;
			default:
				f += b.charAt(q)
			}
			return f
		},
		_get: function (b, f) {
			return b.settings[f] !== d ? b.settings[f] : this._defaults[f]
		},
		_setDateFromField: function (b, f) {
			if (b.input.val() != b.lastVal) {
				var j = this._get(b, "dateFormat"),
					o = b.lastVal = b.input ? b.input.val() : null,
					q, v;
				q = v = this._getDefaultDate(b);
				var w = this._getFormatConfig(b);
				try {
					q = this.parseDate(j, o, w) || v
				} catch (E) {
					this.log(E);
					o = f ? "" : o
				}
				b.selectedDay = q.getDate();
				b.drawMonth = b.selectedMonth = q.getMonth();
				b.drawYear = b.selectedYear = q.getFullYear();
				b.currentDay = o ? q.getDate() : 0;
				b.currentMonth = o ? q.getMonth() : 0;
				b.currentYear = o ? q.getFullYear() : 0;
				this._adjustInstDate(b)
			}
		},
		_getDefaultDate: function (b) {
			return this._restrictMinMax(b, this._determineDate(b, this._get(b, "defaultDate"), new Date))
		},
		_determineDate: function (b, f, j) {
			var o = function (v) {
				var w = new Date;
				w.setDate(w.getDate() + v);
				return w
			},
				q = function (v) {
					try {
						return a.datepicker.parseDate(a.datepicker._get(b, "dateFormat"), v, a.datepicker._getFormatConfig(b))
					} catch (w) {}
					var E = (v.toLowerCase().match(/^c/) ? a.datepicker._getDate(b) : null) || new Date,
						A = E.getFullYear(),
						B = E.getMonth();
					E = E.getDate();
					for (var G = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, x = G.exec(v); x;) {
						switch (x[2] || "d") {
						case "d":
						case "D":
							E += parseInt(x[1], 10);
							break;
						case "w":
						case "W":
							E += parseInt(x[1], 10) * 7;
							break;
						case "m":
						case "M":
							B += parseInt(x[1], 10);
							E = Math.min(E, a.datepicker._getDaysInMonth(A, B));
							break;
						case "y":
						case "Y":
							A += parseInt(x[1], 10);
							E = Math.min(E, a.datepicker._getDaysInMonth(A, B));
							break
						}
						x = G.exec(v)
					}
					return new Date(A, B, E)
				};
			if (f = (f = f == null || f === "" ? j : typeof f == "string" ? q(f) : typeof f == "number" ? isNaN(f) ? j : o(f) : new Date(f.getTime())) && f.toString() == "Invalid Date" ? j : f) {
				f.setHours(0);
				f.setMinutes(0);
				f.setSeconds(0);
				f.setMilliseconds(0)
			}
			return this._daylightSavingAdjust(f)
		},
		_daylightSavingAdjust: function (b) {
			if (!b) return null;
			b.setHours(b.getHours() > 12 ? b.getHours() + 2 : 0);
			return b
		},
		_setDate: function (b, f, j) {
			var o = !f,
				q = b.selectedMonth,
				v = b.selectedYear;
			f = this._restrictMinMax(b, this._determineDate(b, f, new Date));
			b.selectedDay = b.currentDay = f.getDate();
			b.drawMonth = b.selectedMonth = b.currentMonth = f.getMonth();
			b.drawYear = b.selectedYear = b.currentYear = f.getFullYear();
			if ((q != b.selectedMonth || v != b.selectedYear) && !j) this._notifyChange(b);
			this._adjustInstDate(b);
			if (b.input) b.input.val(o ? "" : this._formatDate(b))
		},
		_getDate: function (b) {
			return !b.currentYear || b.input && b.input.val() == "" ? null : this._daylightSavingAdjust(new Date(b.currentYear, b.currentMonth, b.currentDay))
		},
		_generateHTML: function (b) {
			var f = new Date;
			f = this._daylightSavingAdjust(new Date(f.getFullYear(), f.getMonth(), f.getDate()));
			var j = this._get(b, "isRTL"),
				o = this._get(b, "showButtonPanel"),
				q = this._get(b, "hideIfNoPrevNext"),
				v = this._get(b, "navigationAsDateFormat"),
				w = this._getNumberOfMonths(b),
				E = this._get(b, "showCurrentAtPos"),
				A = this._get(b, "stepMonths"),
				B = w[0] != 1 || w[1] != 1,
				G = this._daylightSavingAdjust(!b.currentDay ? new Date(9999, 9, 9) : new Date(b.currentYear, b.currentMonth, b.currentDay)),
				x = this._getMinMaxDate(b, "min"),
				D = this._getMinMaxDate(b, "max");
			E = b.drawMonth - E;
			var F = b.drawYear;
			if (E < 0) {
				E += 12;
				F--
			}
			if (D) {
				var R = this._daylightSavingAdjust(new Date(D.getFullYear(), D.getMonth() - w[0] * w[1] + 1, D.getDate()));
				for (R = x && R < x ? x : R; this._daylightSavingAdjust(new Date(F, E, 1)) > R;) {
					E--;
					if (E < 0) {
						E = 11;
						F--
					}
				}
			}
			b.drawMonth = E;
			b.drawYear = F;
			R = this._get(b, "prevText");
			R = !v ? R : this.formatDate(R, this._daylightSavingAdjust(new Date(F, E - A, 1)), this._getFormatConfig(b));
			R = this._canAdjustMonth(b, -1, F, E) ? '<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_' + e + ".datepicker._adjustDate('#" + b.id + "', -" + A + ", 'M');\" title=\"" + R + '"><span class="ui-icon ui-icon-circle-triangle-' + (j ? "e" : "w") + '">' + R + "</span></a>" : q ? "" : '<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="' + R + '"><span class="ui-icon ui-icon-circle-triangle-' + (j ? "e" : "w") + '">' + R + "</span></a>";
			var X = this._get(b, "nextText");
			X = !v ? X : this.formatDate(X, this._daylightSavingAdjust(new Date(F, E + A, 1)), this._getFormatConfig(b));
			q = this._canAdjustMonth(b, +1, F, E) ? '<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_' + e + ".datepicker._adjustDate('#" + b.id + "', +" + A + ", 'M');\" title=\"" + X + '"><span class="ui-icon ui-icon-circle-triangle-' + (j ? "w" : "e") + '">' + X + "</span></a>" : q ? "" : '<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="' + X + '"><span class="ui-icon ui-icon-circle-triangle-' + (j ? "w" : "e") + '">' + X + "</span></a>";
			A = this._get(b, "currentText");
			X = this._get(b, "gotoCurrent") && b.currentDay ? G : f;
			A = !v ? A : this.formatDate(A, X, this._getFormatConfig(b));
			v = !b.inline ? '<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_' + e + '.datepicker._hideDatepicker();">' + this._get(b, "closeText") + "</button>" : "";
			o = o ? '<div class="ui-datepicker-buttonpane ui-widget-content">' + (j ? v : "") + (this._isInRange(b, X) ? '<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_' + e + ".datepicker._gotoToday('#" + b.id + "');\">" + A + "</button>" : "") + (j ? "" : v) + "</div>" : "";
			v = parseInt(this._get(b, "firstDay"), 10);
			v = isNaN(v) ? 0 : v;
			A = this._get(b, "showWeek");
			X = this._get(b, "dayNames");
			this._get(b, "dayNamesShort");
			var ea = this._get(b, "dayNamesMin"),
				W = this._get(b, "monthNames"),
				M = this._get(b, "monthNamesShort"),
				l = this._get(b, "beforeShowDay"),
				Y = this._get(b, "showOtherMonths"),
				ha = this._get(b, "selectOtherMonths");
			this._get(b, "calculateWeek");
			for (var ta = this._getDefaultDate(b), ga = "", ja = 0; ja < w[0]; ja++) {
				for (var xa = "", U = 0; U < w[1]; U++) {
					var da = this._daylightSavingAdjust(new Date(F, E, b.selectedDay)),
						ia = " ui-corner-all",
						ua = "";
					if (B) {
						ua += '<div class="ui-datepicker-group';
						if (w[1] > 1) switch (U) {
						case 0:
							ua += " ui-datepicker-group-first";
							ia = " ui-corner-" + (j ? "right" : "left");
							break;
						case w[1] - 1:
							ua += " ui-datepicker-group-last";
							ia = " ui-corner-" + (j ? "left" : "right");
							break;
						default:
							ua += " ui-datepicker-group-middle";
							ia = "";
							break
						}
						ua += '">'
					}
					ua += '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix' + ia + '">' + (/all|left/.test(ia) && ja == 0 ? j ? q : R : "") + (/all|right/.test(ia) && ja == 0 ? j ? R : q : "") + this._generateMonthYearHeader(b, E, F, x, D, ja > 0 || U > 0, W, M) + '</div><table class="ui-datepicker-calendar"><thead><tr>';
					var Ca = A ? '<th class="ui-datepicker-week-col">' + this._get(b, "weekHeader") + "</th>" : "";
					for (ia = 0; ia < 7; ia++) {
						var ra = (ia + v) % 7;
						Ca += "<th" + ((ia + v + 6) % 7 >= 5 ? ' class="ui-datepicker-week-end"' : "") + '><span title="' + X[ra] + '">' + ea[ra] + "</span></th>"
					}
					ua += Ca + "</tr></thead><tbody>";
					Ca = this._getDaysInMonth(F, E);
					if (F == b.selectedYear && E == b.selectedMonth) b.selectedDay = Math.min(b.selectedDay, Ca);
					ia = (this._getFirstDayOfMonth(F, E) - v + 7) % 7;
					Ca = B ? 6 : Math.ceil((ia + Ca) / 7);
					ra = this._daylightSavingAdjust(new Date(F, E, 1 - ia));
					for (var eb = 0; eb < Ca; eb++) {
						ua += "<tr>";
						var kb = !A ? "" : '<td class="ui-datepicker-week-col">' + this._get(b, "calculateWeek")(ra) + "</td>";
						for (ia = 0; ia < 7; ia++) {
							var Za = l ? l.apply(b.input ? b.input[0] : null, [ra]) : [true, ""],
								Wa = ra.getMonth() != E,
								bb = Wa && !ha || !Za[0] || x && ra < x || D && ra > D;
							kb += '<td class="' + ((ia + v + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + (Wa ? " ui-datepicker-other-month" : "") + (ra.getTime() == da.getTime() && E == b.selectedMonth && b._keyEvent || ta.getTime() == ra.getTime() && ta.getTime() == da.getTime() ? " " + this._dayOverClass : "") + (bb ? " " + this._unselectableClass + " ui-state-disabled" : "") + (Wa && !Y ? "" : " " + Za[1] + (ra.getTime() == G.getTime() ? " " + this._currentClass : "") + (ra.getTime() == f.getTime() ? " ui-datepicker-today" : "")) + '"' + ((!Wa || Y) && Za[2] ? ' title="' + Za[2] + '"' : "") + (bb ? "" : ' onclick="DP_jQuery_' + e + ".datepicker._selectDay('#" + b.id + "'," + ra.getMonth() + "," + ra.getFullYear() + ', this);return false;"') + ">" + (Wa && !Y ? "&#xa0;" : bb ? '<span class="ui-state-default">' + ra.getDate() + "</span>" : '<a class="ui-state-default' + (ra.getTime() == f.getTime() ? " ui-state-highlight" : "") + (ra.getTime() == G.getTime() ? " ui-state-active" : "") + (Wa ? " ui-priority-secondary" : "") + '" href="#">' + ra.getDate() + "</a>") + "</td>";
							ra.setDate(ra.getDate() + 1);
							ra = this._daylightSavingAdjust(ra)
						}
						ua += kb + "</tr>"
					}
					E++;
					if (E > 11) {
						E = 0;
						F++
					}
					ua += "</tbody></table>" + (B ? "</div>" + (w[0] > 0 && U == w[1] - 1 ? '<div class="ui-datepicker-row-break"></div>' : "") : "");
					xa += ua
				}
				ga += xa
			}
			ga += o + (a.browser.msie && parseInt(a.browser.version, 10) < 7 && !b.inline ? '<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>' : "");
			b._keyEvent = false;
			return ga
		},
		_generateMonthYearHeader: function (b, f, j, o, q, v, w, E) {
			var A = this._get(b, "changeMonth"),
				B = this._get(b, "changeYear"),
				G = this._get(b, "showMonthAfterYear"),
				x = '<div class="ui-datepicker-title">',
				D = "";
			if (v || !A) D += '<span class="ui-datepicker-month">' + w[f] + "</span>";
			else {
				w = o && o.getFullYear() == j;
				var F = q && q.getFullYear() == j;
				D += '<select class="ui-datepicker-month" onchange="DP_jQuery_' + e + ".datepicker._selectMonthYear('#" + b.id + "', this, 'M');\" onclick=\"DP_jQuery_" + e + ".datepicker._clickMonthYear('#" + b.id + "');\">";
				for (var R = 0; R < 12; R++) if ((!w || R >= o.getMonth()) && (!F || R <= q.getMonth())) D += '<option value="' + R + '"' + (R == f ? ' selected="selected"' : "") + ">" + E[R] + "</option>";
				D += "</select>"
			}
			G || (x += D + (v || !(A && B) ? "&#xa0;" : ""));
			b.yearshtml = "";
			if (v || !B) x += '<span class="ui-datepicker-year">' + j + "</span>";
			else {
				E = this._get(b, "yearRange").split(":");
				var X = (new Date).getFullYear();
				w = function (ea) {
					ea = ea.match(/c[+-].*/) ? j + parseInt(ea.substring(1), 10) : ea.match(/[+-].*/) ? X + parseInt(ea, 10) : parseInt(ea, 10);
					return isNaN(ea) ? X : ea
				};
				f = w(E[0]);
				E = Math.max(f, w(E[1] || ""));
				f = o ? Math.max(f, o.getFullYear()) : f;
				E = q ? Math.min(E, q.getFullYear()) : E;
				for (b.yearshtml += '<select class="ui-datepicker-year" onchange="DP_jQuery_' + e + ".datepicker._selectMonthYear('#" + b.id + "', this, 'Y');\" onclick=\"DP_jQuery_" + e + ".datepicker._clickMonthYear('#" + b.id + "');\">"; f <= E; f++) b.yearshtml += '<option value="' + f + '"' + (f == j ? ' selected="selected"' : "") + ">" + f + "</option>";
				b.yearshtml += "</select>";
				if (a.browser.mozilla) x += '<select class="ui-datepicker-year"><option value="' + j + '" selected="selected">' + j + "</option></select>";
				else {
					x += b.yearshtml;
					b.yearshtml = null
				}
			}
			x += this._get(b, "yearSuffix");
			if (G) x += (v || !(A && B) ? "&#xa0;" : "") + D;
			x += "</div>";
			return x
		},
		_adjustInstDate: function (b, f, j) {
			var o = b.drawYear + (j == "Y" ? f : 0),
				q = b.drawMonth + (j == "M" ? f : 0);
			f = Math.min(b.selectedDay, this._getDaysInMonth(o, q)) + (j == "D" ? f : 0);
			o = this._restrictMinMax(b, this._daylightSavingAdjust(new Date(o, q, f)));
			b.selectedDay = o.getDate();
			b.drawMonth = b.selectedMonth = o.getMonth();
			b.drawYear = b.selectedYear = o.getFullYear();
			if (j == "M" || j == "Y") this._notifyChange(b)
		},
		_restrictMinMax: function (b, f) {
			var j = this._getMinMaxDate(b, "min"),
				o = this._getMinMaxDate(b, "max");
			j = j && f < j ? j : f;
			return j = o && j > o ? o : j
		},
		_notifyChange: function (b) {
			var f = this._get(b, "onChangeMonthYear");
			if (f) f.apply(b.input ? b.input[0] : null, [b.selectedYear, b.selectedMonth + 1, b])
		},
		_getNumberOfMonths: function (b) {
			b = this._get(b, "numberOfMonths");
			return b == null ? [1, 1] : typeof b == "number" ? [1, b] : b
		},
		_getMinMaxDate: function (b, f) {
			return this._determineDate(b, this._get(b, f + "Date"), null)
		},
		_getDaysInMonth: function (b, f) {
			return 32 - (new Date(b, f, 32)).getDate()
		},
		_getFirstDayOfMonth: function (b, f) {
			return (new Date(b, f, 1)).getDay()
		},
		_canAdjustMonth: function (b, f, j, o) {
			var q = this._getNumberOfMonths(b);
			j = this._daylightSavingAdjust(new Date(j, o + (f < 0 ? f : q[0] * q[1]), 1));
			f < 0 && j.setDate(this._getDaysInMonth(j.getFullYear(), j.getMonth()));
			return this._isInRange(b, j)
		},
		_isInRange: function (b, f) {
			var j = this._getMinMaxDate(b, "min"),
				o = this._getMinMaxDate(b, "max");
			return (!j || f.getTime() >= j.getTime()) && (!o || f.getTime() <= o.getTime())
		},
		_getFormatConfig: function (b) {
			var f = this._get(b, "shortYearCutoff");
			f = typeof f != "string" ? f : (new Date).getFullYear() % 100 + parseInt(f, 10);
			return {
				shortYearCutoff: f,
				dayNamesShort: this._get(b, "dayNamesShort"),
				dayNames: this._get(b, "dayNames"),
				monthNamesShort: this._get(b, "monthNamesShort"),
				monthNames: this._get(b, "monthNames")
			}
		},
		_formatDate: function (b, f, j, o) {
			if (!f) {
				b.currentDay = b.selectedDay;
				b.currentMonth = b.selectedMonth;
				b.currentYear = b.selectedYear
			}
			f = f ? typeof f == "object" ? f : this._daylightSavingAdjust(new Date(o, j, f)) : this._daylightSavingAdjust(new Date(b.currentYear, b.currentMonth, b.currentDay));
			return this.formatDate(this._get(b, "dateFormat"), f, this._getFormatConfig(b))
		}
	});
	a.fn.datepicker = function (b) {
		if (!a.datepicker.initialized) {
			a(document).mousedown(a.datepicker._checkExternalClick).find("body").append(a.datepicker.dpDiv);
			a.datepicker.initialized = true
		}
		var f = Array.prototype.slice.call(arguments, 1);
		if (typeof b == "string" && (b == "isDisabled" || b == "getDate" || b == "widget")) return a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this[0]].concat(f));
		if (b == "option" && arguments.length == 2 && typeof arguments[1] == "string") return a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this[0]].concat(f));
		return this.each(function () {
			typeof b == "string" ? a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this].concat(f)) : a.datepicker._attachDatepicker(this, b)
		})
	};
	a.datepicker = new g;
	a.datepicker.initialized = false;
	a.datepicker.uuid = (new Date).getTime();
	a.datepicker.version = "1.8.7";
	window["DP_jQuery_" + e] = a
})(jQuery);
(function (a) {
	var d = 0;
	a.getScrollbarWidth = function () {
		if (!d) if (a.browser.msie) {
			var g = a('<textarea cols="10" rows="2"></textarea>').css({
				position: "absolute",
				top: -1000,
				left: -1000
			}).appendTo("body"),
				c = a('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({
					position: "absolute",
					top: -1000,
					left: -1000
				}).appendTo("body");
			d = g.width() - c.width();
			g.add(c).remove()
		} else {
			g = a("<div />").css({
				width: 100,
				height: 100,
				overflow: "auto",
				position: "absolute",
				top: -1000,
				left: -1000
			}).prependTo("body").append("<div />").find("div").css({
				width: "100%",
				height: 200
			});
			d = 100 - g.width();
			g.parent().remove()
		}
		return d
	}
})(jQuery);
(function (a) {
	a.fn.drag = function (e, b, f) {
		var j = typeof e == "string" ? e : "",
			o = a.isFunction(e) ? e : a.isFunction(b) ? b : null;
		if (j.indexOf("drag") !== 0) j = "drag" + j;
		f = (e == o ? b : f) || {};
		return o ? this.bind(j, f, o) : this.trigger(j)
	};
	var d = a.event,
		g = d.special,
		c = g.drag = {
			defaults: {
				which: 1,
				distance: 15,
				not: ":input",
				handle: null,
				relative: false,
				drop: true,
				click: true
			},
			datakey: "dragdata",
			livekey: "livedrag",
			add: function (e) {
				var b = a.data(this, c.datakey),
					f = e.data || {};
				b.related += 1;
				if (!b.live && e.selector) {
					b.live = true;
					d.add(this, "draginit." + c.livekey, c.delegate)
				}
				a.each(c.defaults, function (j) {
					if (f[j] !== undefined) b[j] = f[j]
				})
			},
			remove: function () {
				a.data(this, c.datakey).related -= 1
			},
			setup: function () {
				if (!a.data(this, c.datakey)) {
					var e = a.extend({
						related: 0
					}, c.defaults);
					a.data(this, c.datakey, e);
					d.add(this, "mousedown", c.init, e);
					this.attachEvent && this.attachEvent("ondragstart", c.dontstart)
				}
			},
			teardown: function () {
				if (!a.data(this, c.datakey).related) {
					a.removeData(this, c.datakey);
					d.remove(this, "mousedown", c.init);
					d.remove(this, "draginit", c.delegate);
					c.textselect(true);
					this.detachEvent && this.detachEvent("ondragstart", c.dontstart)
				}
			},
			init: function (e) {
				var b = e.data,
					f;
				if (!(b.which > 0 && e.which != b.which)) if (!a(e.target).is(b.not)) if (!(b.handle && !a(e.target).closest(b.handle, e.currentTarget).length)) {
					b.propagates = 1;
					b.interactions = [c.interaction(this, b)];
					b.target = e.target;
					b.pageX = e.pageX;
					b.pageY = e.pageY;
					b.dragging = null;
					f = c.hijack(e, "draginit", b);
					if (b.propagates) {
						if ((f = c.flatten(f)) && f.length) {
							b.interactions = [];
							a.each(f, function () {
								b.interactions.push(c.interaction(this, b))
							})
						}
						b.propagates = b.interactions.length;
						b.drop !== false && g.drop && g.drop.handler(e, b);
						c.textselect(false);
						d.add(document, "mousemove mouseup", c.handler, b);
						return false
					}
				}
			},
			interaction: function (e, b) {
				return {
					drag: e,
					callback: new c.callback,
					droppable: [],
					offset: a(e)[b.relative ? "position" : "offset"]() || {
						top: 0,
						left: 0
					}
				}
			},
			handler: function (e) {
				var b = e.data;
				switch (e.type) {
				case !b.dragging && "mousemove":
					if (Math.pow(e.pageX - b.pageX, 2) + Math.pow(e.pageY - b.pageY, 2) < Math.pow(b.distance, 2)) break;
					e.target = b.target;
					c.hijack(e, "dragstart", b);
					if (b.propagates) b.dragging = true;
				case "mousemove":
					if (b.dragging) {
						c.hijack(e, "drag", b);
						if (b.propagates) {
							b.drop !== false && g.drop && g.drop.handler(e, b);
							break
						}
						e.type = "mouseup"
					}
				case "mouseup":
					d.remove(document, "mousemove mouseup", c.handler);
					if (b.dragging) {
						b.drop !== false && g.drop && g.drop.handler(e, b);
						c.hijack(e, "dragend", b)
					}
					c.textselect(true);
					if (b.click === false && b.dragging) {
						jQuery.event.triggered = true;
						setTimeout(function () {
							jQuery.event.triggered = false
						}, 20);
						b.dragging = false
					}
					break
				}
			},
			delegate: function (e) {
				var b = [],
					f, j = a.data(this, "events") || {};
				a.each(j.live || [], function (o, q) {
					if (q.preType.indexOf("drag") === 0) if (f = a(e.target).closest(q.selector, e.currentTarget)[0]) {
						d.add(f, q.origType + "." + c.livekey, q.origHandler, q.data);
						a.inArray(f, b) < 0 && b.push(f)
					}
				});
				if (!b.length) return false;
				return a(b).bind("dragend." + c.livekey, function () {
					d.remove(this, "." + c.livekey)
				})
			},
			hijack: function (e, b, f, j, o) {
				if (f) {
					var q = {
						event: e.originalEvent,
						type: e.type
					},
						v = b.indexOf("drop") ? "drag" : "drop",
						w, E = j || 0,
						A, B;
					j = !isNaN(j) ? j : f.interactions.length;
					e.type = b;
					e.originalEvent = null;
					f.results = [];
					do
					if (A = f.interactions[E]) if (!(b !== "dragend" && A.cancelled)) {
						B = c.properties(e, f, A);
						A.results = [];
						a(o || A[v] || f.droppable).each(function (G, x) {
							w = (B.target = x) ? d.handle.call(x, e, B) : null;
							if (w === false) {
								if (v == "drag") {
									A.cancelled = true;
									f.propagates -= 1
								}
								if (b == "drop") A[v][G] = null
							} else if (b == "dropinit") A.droppable.push(c.element(w) || x);
							if (b == "dragstart") A.proxy = a(c.element(w) || A.drag)[0];
							A.results.push(w);
							delete e.result;
							if (b !== "dropinit") return w
						});
						f.results[E] = c.flatten(A.results);
						if (b == "dropinit") A.droppable = c.flatten(A.droppable);
						b == "dragstart" && !A.cancelled && B.update()
					}
					while (++E < j);
					e.type = q.type;
					e.originalEvent = q.event;
					return c.flatten(f.results)
				}
			},
			properties: function (e, b, f) {
				var j = f.callback;
				j.drag = f.drag;
				j.proxy = f.proxy || f.drag;
				j.startX = b.pageX;
				j.startY = b.pageY;
				j.deltaX = e.pageX - b.pageX;
				j.deltaY = e.pageY - b.pageY;
				j.originalX = f.offset.left;
				j.originalY = f.offset.top;
				j.offsetX = e.pageX - (b.pageX - j.originalX);
				j.offsetY = e.pageY - (b.pageY - j.originalY);
				j.drop = c.flatten((f.drop || []).slice());
				j.available = c.flatten((f.droppable || []).slice());
				return j
			},
			element: function (e) {
				if (e && (e.jquery || e.nodeType == 1)) return e
			},
			flatten: function (e) {
				return a.map(e, function (b) {
					return b && b.jquery ? a.makeArray(b) : b && b.length ? c.flatten(b) : b
				})
			},
			textselect: function (e) {
				a("body")[e ? "unbind" : "bind"]("selectstart", c.dontstart).attr("unselectable", e ? "off" : "on").css("MozUserSelect", e ? "" : "none")
			},
			dontstart: function () {
				return false
			},
			callback: function () {}
		};
	c.callback.prototype = {
		update: function () {
			g.drop && this.available.length && a.each(this.available, function (e) {
				g.drop.locate(this, e)
			})
		}
	};
	g.draginit = g.dragstart = g.dragend = c
})(jQuery);
(function (a) {
	a.fn.drop = function (e, b, f) {
		var j = typeof e == "string" ? e : "",
			o = a.isFunction(e) ? e : a.isFunction(b) ? b : null;
		if (j.indexOf("drop") !== 0) j = "drop" + j;
		f = (e == o ? b : f) || {};
		return o ? this.bind(j, f, o) : this.trigger(j)
	};
	a.drop = function (e) {
		e = e || {};
		c.multi = e.multi === true ? Infinity : e.multi === false ? 1 : !isNaN(e.multi) ? e.multi : c.multi;
		c.delay = e.delay || c.delay;
		c.tolerance = a.isFunction(e.tolerance) ? e.tolerance : e.tolerance === null ? null : c.tolerance;
		c.mode = e.mode || c.mode || "intersect"
	};
	var d = a.event,
		g = d.special,
		c = a.event.special.drop = {
			multi: 1,
			delay: 20,
			mode: "overlap",
			targets: [],
			datakey: "dropdata",
			livekey: "livedrop",
			add: function (e) {
				var b = a.data(this, c.datakey);
				b.related += 1;
				if (!b.live && e.selector) {
					b.live = true;
					d.add(this, "dropinit." + c.livekey, c.delegate)
				}
			},
			remove: function () {
				a.data(this, c.datakey).related -= 1
			},
			setup: function () {
				if (!a.data(this, c.datakey)) {
					a.data(this, c.datakey, {
						related: 0,
						active: [],
						anyactive: 0,
						winner: 0,
						location: {}
					});
					c.targets.push(this)
				}
			},
			teardown: function () {
				if (!a.data(this, c.datakey).related) {
					a.removeData(this, c.datakey);
					d.remove(this, "dropinit", c.delegate);
					var e = this;
					c.targets = a.grep(c.targets, function (b) {
						return b !== e
					})
				}
			},
			handler: function (e, b) {
				var f;
				if (b) switch (e.type) {
				case "mousedown":
					f = a(c.targets);
					if (typeof b.drop == "string") f = f.filter(b.drop);
					f.each(function () {
						var j = a.data(this, c.datakey);
						j.active = [];
						j.anyactive = 0;
						j.winner = 0
					});
					b.droppable = f;
					c.delegates = [];
					g.drag.hijack(e, "dropinit", b);
					c.delegates = a.unique(g.drag.flatten(c.delegates));
					break;
				case "mousemove":
					c.event = e;
					c.timer || c.tolerate(b);
					break;
				case "mouseup":
					c.timer = clearTimeout(c.timer);
					if (b.propagates) {
						g.drag.hijack(e, "drop", b);
						g.drag.hijack(e, "dropend", b);
						a.each(c.delegates || [], function () {
							d.remove(this, "." + c.livekey)
						})
					}
					break
				}
			},
			delegate: function (e) {
				var b = [],
					f, j = a.data(this, "events") || {};
				a.each(j.live || [], function (o, q) {
					if (q.preType.indexOf("drop") === 0) {
						f = a(e.currentTarget).find(q.selector);
						f.length && f.each(function () {
							d.add(this, q.origType + "." + c.livekey, q.origHandler, q.data);
							a.inArray(this, b) < 0 && b.push(this)
						})
					}
				});
				c.delegates.push(b);
				return b.length ? a(b) : false
			},
			locate: function (e, b) {
				var f = a.data(e, c.datakey),
					j = a(e),
					o = j.offset() || {},
					q = j.outerHeight();
				j = j.outerWidth();
				o = {
					elem: e,
					width: j,
					height: q,
					top: o.top,
					left: o.left,
					right: o.left + j,
					bottom: o.top + q
				};
				if (f) {
					f.location = o;
					f.index = b;
					f.elem = e
				}
				return o
			},
			contains: function (e, b) {
				return (b[0] || b.left) >= e.left && (b[0] || b.right) <= e.right && (b[1] || b.top) >= e.top && (b[1] || b.bottom) <= e.bottom
			},
			modes: {
				intersect: function (e, b, f) {
					return this.contains(f, [e.pageX, e.pageY]) ? 1E9 : this.modes.overlap.apply(this, arguments)
				},
				overlap: function (e, b, f) {
					return Math.max(0, Math.min(f.bottom, b.bottom) - Math.max(f.top, b.top)) * Math.max(0, Math.min(f.right, b.right) - Math.max(f.left, b.left))
				},
				fit: function (e, b, f) {
					return this.contains(f, b) ? 1 : 0
				},
				middle: function (e, b, f) {
					return this.contains(f, [b.left + b.width * 0.5, b.top + b.height * 0.5]) ? 1 : 0
				}
			},
			sort: function (e, b) {
				return b.winner - e.winner || e.index - b.index
			},
			tolerate: function (e) {
				var b, f, j, o, q, v, w = 0,
					E, A = e.interactions.length,
					B = [c.event.pageX, c.event.pageY],
					G = c.tolerance || c.modes[c.mode];
				do
				if (E = e.interactions[w]) {
					if (!E) return;
					E.drop = [];
					q = [];
					v = E.droppable.length;
					if (G) j = c.locate(E.proxy);
					b = 0;
					do
					if (f = E.droppable[b]) {
						o = a.data(f, c.datakey);
						if (f = o.location) {
							o.winner = G ? G.call(c, c.event, j, f) : c.contains(f, B) ? 1 : 0;
							q.push(o)
						}
					}
					while (++b < v);
					q.sort(c.sort);
					b = 0;
					do
					if (o = q[b]) if (o.winner && E.drop.length < c.multi) {
						if (!o.active[w] && !o.anyactive) if (g.drag.hijack(c.event, "dropstart", e, w, o.elem)[0] !== false) {
							o.active[w] = 1;
							o.anyactive += 1
						} else o.winner = 0;
						o.winner && E.drop.push(o.elem)
					} else if (o.active[w] && o.anyactive == 1) {
						g.drag.hijack(c.event, "dropend", e, w, o.elem);
						o.active[w] = 0;
						o.anyactive -= 1
					}
					while (++b < v)
				}
				while (++w < A);
				if (c.last && B[0] == c.last.pageX && B[1] == c.last.pageY) delete c.timer;
				else c.timer = setTimeout(function () {
					c.tolerate(e)
				}, c.delay);
				c.last = c.event
			}
		};
	g.dropinit = g.dropstart = g.dropend = c
})(jQuery);
(function (a) {
	function d(e) {
		e = e.replace(/_/, "-").toLowerCase();
		if (e.length > 3) e = e.substring(0, 3) + e.substring(3).toUpperCase();
		return e
	}
	var g = {};
	a.localize = function (e, b) {
		function f(x, D, F) {
			F = F || 1;
			var R;
			if (b && b.loadBase && F == 1) {
				B = {};
				R = x + ".json";
				j(R, x, D, F)
			} else if (F == 1) {
				B = {};
				f(x, D, 2)
			} else if (F == 2 && D.length >= 2) {
				R = x + "-" + D.substring(0, 2) + ".json";
				j(R, x, D, F)
			} else if (F == 3 && D.length >= 5) {
				R = x + "-" + D.substring(0, 5) + ".json";
				j(R, x, D, F)
			}
		}
		function j(x) {
			if (b.pathPrefix) x = b.pathPrefix + "/" + x;
			g[x] ? v(g[x]) : a.ajax({
				url: x,
				async: false,
				timeout: 500,
				dataType: "json",
				data: null,
				success: function (D) {
					B = a.extend({}, a.localize.defaultLangData, B, D);
					g[x] = B;
					v(B)
				}
			})
		}
		function o(x) {
			a.localize.data[e] = x;
			var D;
			A.each(function () {
				elem = a(this);
				key = elem.attr("data-translate-text");
				D = w(key, x);
				var F = elem.dataString();
				if (F) F.setString(D);
				else elem.attr("tagName") == "INPUT" ? elem.val(D) : elem.html(D)
			})
		}
		function q(x) {
			a.localize.data[e] = x;
			var D;
			A.each(function () {
				elem = a(this);
				key = elem.attr("data-translate-title");
				D = w(key, x);
				elem.attr("title", D)
			})
		}
		function v(x) {
			if (b.callback) b.callback === "titleCallback" ? q(x) : b.callback(x, o);
			else o(x)
		}
		function w(x, D) {
			for (var F = x.split(/\./), R = D; F.length > 0;) if (R) R = R[F.shift()];
			else return null;
			return R
		}
		function E(x) {
			if (typeof x == "string") return "^" + x + "$";
			else if (x.length) {
				for (var D = [], F = x.length; F--;) D.push(E(x[F]));
				return D.join("|")
			} else return x
		}
		var A = this,
			B = {};
		b = b || {};
		b.pathPrefix = "/locales";
		var G = d(b && b.language ? b.language : a.defaultLanguage);
		b.skipLanguage && G.match(E(b.skipLanguage)) || f(e, G, 1)
	};
	a.fn.localize = a.localize;
	a.localize.data = {};
	a.localize.defaultLangData = {};
	if (_.defined(window.gsLocale)) {
		a.localize.data.gs = gsLocale;
		for (var c in gsLocale) a.localize.defaultLangData[c] = gsLocale[c];
		g["/locales/gs-en.json"] = gsLocale
	}
	a.localize.getString = function (e) {
		return this.data.gs[e] || this.defaultLangData[e]
	};
	a.defaultLanguage = d(navigator.language ? navigator.language : navigator.userLanguage)
})(jQuery);
(function (a) {
	var d = {};
	a.publish = function (g, c) {
		c = a.makeArray(c);
		d[g] && a.each(d[g], function () {
			try {
				this.apply(a, c || [])
			} catch (e) {
				console.error("pub/sub. topic: " + g + ", error: ", e, ", func: ", this)
			}
		})
	};
	a.subscribe = function (g, c) {
		d[g] || (d[g] = []);
		d[g].push(c);
		return [g, c]
	};
	a.unsubscribe = function (g) {
		var c = g[0];
		d[c] && a.each(d[c], function (e) {
			this == g[1] && d[c].splice(e, 1)
		})
	};
	a.subscriptions = d
})(jQuery);
(function (a) {
	function d(g) {
		if (typeof g.data === "string") {
			var c = g.handler,
				e = g.data.toLowerCase().split(" ");
			g.handler = function (b) {
				if (!(this !== b.target && /textarea|select/i.test(b.target.nodeName) && b.target.type === "text")) {
					var f = b.type !== "keypress" && a.hotkeys.specialKeys[b.which],
						j = String.fromCharCode(b.which).toLowerCase(),
						o = "",
						q = {};
					if (b.altKey && f !== "alt") o += "alt+";
					if (b.ctrlKey && f !== "ctrl") o += "ctrl+";
					if (b.metaKey && !b.ctrlKey && f !== "meta") o += "meta+";
					if (b.shiftKey && f !== "shift") o += "shift+";
					if (f) q[o + f] = true;
					else {
						q[o + j] = true;
						q[o + a.hotkeys.shiftNums[j]] = true;
						if (o === "shift+") q[a.hotkeys.shiftNums[j]] = true
					}
					f = 0;
					for (j = e.length; f < j; f++) if (q[e[f]]) return c.apply(this, arguments)
				}
			}
		}
	}
	a.hotkeys = {
		version: "0.8",
		specialKeys: {
			8: "backspace",
			9: "tab",
			13: "return",
			16: "shift",
			17: "ctrl",
			18: "alt",
			19: "pause",
			20: "capslock",
			27: "esc",
			32: "space",
			33: "pageup",
			34: "pagedown",
			35: "end",
			36: "home",
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			45: "insert",
			46: "del",
			96: "0",
			97: "1",
			98: "2",
			99: "3",
			100: "4",
			101: "5",
			102: "6",
			103: "7",
			104: "8",
			105: "9",
			106: "*",
			107: "+",
			109: "-",
			110: ".",
			111: "/",
			112: "f1",
			113: "f2",
			114: "f3",
			115: "f4",
			116: "f5",
			117: "f6",
			118: "f7",
			119: "f8",
			120: "f9",
			121: "f10",
			122: "f11",
			123: "f12",
			144: "numlock",
			145: "scroll",
			191: "/",
			224: "meta"
		},
		shiftNums: {
			"`": "~",
			"1": "!",
			"2": "@",
			"3": "#",
			"4": "$",
			"5": "%",
			"6": "^",
			"7": "&",
			"8": "*",
			"9": "(",
			"0": ")",
			"-": "_",
			"=": "+",
			";": ": ",
			"'": '"',
			",": "<",
			".": ">",
			"/": "?",
			"\\": "|"
		}
	};
	a.each(["keydown", "keyup", "keypress"], function () {
		a.event.special[this] = {
			add: d
		}
	})
})(jQuery);
(function (a) {
	function d(c) {
		var e = [].slice.call(arguments, 1),
			b = 0;
		c = a.event.fix(c || window.event);
		c.type = "mousewheel";
		if (c.wheelDelta) b = c.wheelDelta / 120;
		if (c.detail) b = -c.detail / 3;
		e.unshift(c, b);
		return a.event.handle.apply(this, e)
	}
	var g = ["DOMMouseScroll", "mousewheel"];
	a.event.special.mousewheel = {
		setup: function () {
			if (this.addEventListener) for (var c = g.length; c;) this.addEventListener(g[--c], d, false);
			else this.onmousewheel = d
		},
		teardown: function () {
			if (this.removeEventListener) for (var c = g.length; c;) this.removeEventListener(g[--c], d, false);
			else this.onmousewheel = null
		}
	};
	a.fn.extend({
		mousewheel: function (c) {
			return c ? this.bind("mousewheel", c) : this.trigger("mousewheel")
		},
		unmousewheel: function (c) {
			return this.unbind("mousewheel", c)
		}
	})
})(jQuery);
jQuery.fn.supersleight = function (a) {
	a = jQuery.extend({
		imgs: true,
		backgrounds: true,
		shim: "webincludes/images/blank.gif",
		apply_positioning: true
	}, a);
	return this.each(function () {
		jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4 && jQuery(this).find("*").andSelf().each(function (d, g) {
			var c = jQuery(g);
			if (a.backgrounds && c.css("background-image").match(/\.png/i) !== null) {
				var e = c.css("background-image");
				e = e.substring(5, e.length - 2);
				var b = c.css("background-repeat") == "no-repeat" ? "crop" : "scale";
				e = {
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + e + "', sizingMethod='" + b + "')",
					"background-image": "url(" + a.shim + ")"
				};
				c.css(e)
			}
			if (a.imgs && c.is("img[src$=png]")) {
				e = {
					width: c.width() + "px",
					height: c.height() + "px",
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + c.attr("src") + "', sizingMethod='scale')"
				};
				c.css(e).attr("src", a.shim)
			}
			if (a.apply_positioning && c.is("a, input") && (c.css("position") === "" || c.css("position") == "static")) c.css("position", "relative")
		})
	})
};
(function (a) {
	a.fn.gsQueue = function (d, g) {
		var c = this;
		d = a.extend({
			itemWidth: 75,
			activeItemWidth: 100,
			speed: 800,
			scroll: 40,
			dataKey: "queueSongID"
		}, d);
		var e = a(".viewport", this),
			b = a("ol.queue", this);
		a(".scrollbar", this);
		g = g;
		var f = 0,
			j = 0,
			o = 0,
			q = {
				floor: 0,
				ceil: 0
			},
			v = false,
			w = false,
			E = {};
		this.initialize = function () {
			this.itemRenderer = d.itemRenderer || this.itemRenderer;
			w = true;
			e.scrollLeft(0);
			e.scroll(c.render);
			d.activeItemWidthDiff = d.activeItemWidth - d.itemWidth;
			f && this.scrollTo(j);
			return this
		};
		a(window).resize(function () {
			c.render();
			c.updateScrollbar()
		});
		this.setItems = function (A) {
			var B = g.length !== (A || []).length;
			g = A ? A : [];
			w = true;
			if (f > A.length || A.length == 0) {
				this.render();
				this.moveTo(A.length, true)
			} else this.render();
			B && c.updateScrollbar()
		};
		this.updateItem = function (A) {
			var B = A[d.dataKey];
			if (B && g[B]) g[B] = A;
			else console.error("jquery-queue. item has invalid dataKey. settings:", d.dataKey, "item key:", A[d.dataKey])
		};
		this.updateScrollbar = function () {
			var A = a("#queue").height(),
				B = d.itemWidth,
				G = d.activeItemWidth,
				x = parseInt(e.css("padding-left"), 10);
			B = B * g.length + G + x;
			a(b).width(Math.max(B, e.outerWidth() - x));
			a(c).tinyscrollbar({
				axis: "x",
				contentWidth: B
			});
			e.scrollLeft() > e.width() && e.scrollLeft() + e.width() > B && this.scrollTo(B);
			a("#queue").height() != A && a(window).resize()
		};
		this.setActive = function (A, B) {
			if (!(_.notDefined(A) || A < 0)) {
				B = _.orEqual(B, true);
				if (f !== A) {
					f = A;
					v = true;
					a(".queue-item-active", b).removeClass("queue-item-active");
					B && f < g.length && this.moveTo(f);
					this.render()
				}
			}
		};
		this.addToCache = function (A, B) {
			E[A] = B
		};
		this.getFromCache = function (A) {
			return E[A] || null
		};
		this.moveTo = function (A, B) {
			A = Math.max(0, Math.min(A, g.length - 1));
			var G = this.calcOffset(A);
			if (G > e.outerWidth(true)) G -= e.outerWidth(true) / 2;
			this.scrollTo(G, B)
		};
		this.scrollTo = function (A, B) {
			if (B || Math.abs(A - j) > e.width() * 2.5) {
				e.scrollLeft(A);
				c.updateScrollbar()
			} else e.stop().animate({
				scrollLeft: A
			}, "slow", "linear", function () {
				c.updateScrollbar()
			});
			j = A;
			c.render()
		};
		this.render = function () {
			this.renderTimeout && clearTimeout(this.renderTimeout);
			this.renderTimeout = setTimeout(function () {
				var A = Math.max(0, e.scrollLeft() - e.width()),
					B = Math.min(e.scrollLeft() + e.width() * 2, g.length * d.itemWidth),
					G = 0,
					x = 0,
					D, F, R;
				q.floor = Math.floor(A / d.itemWidth);
				q.ceil = Math.ceil(B / d.itemWidth);
				if (w || Math.abs(o - e.scrollLeft()) > e.width() * 2) {
					E = {};
					b.html("")
				} else for (D in E) if (E.hasOwnProperty(D)) {
					F = E[D];
					R = parseInt(a(F).css("left"), 10);
					if (D >= g.length || R < A || R > B) {
						b.get(0).removeChild(F);
						delete E[D];
						G++
					}
				}
				for (i = q.floor; i < q.ceil; i++) {
					if (A = c.getFromCache(g[i][d.dataKey])) v && a(A).css("left", c.calcOffset(i) + "px");
					else {
						A = c.itemWrapper(g[i], i);
						b.append(A);
						x++
					}
					i == f && a(A).addClass("queue-item-active")
				}
				w = v = false;
				o = e.scrollLeft()
			}, 50)
		};
		this.calcOffset = function (A) {
			var B = A * d.itemWidth;
			if (A > f) B += d.activeItemWidthDiff;
			return B
		};
		this.itemWrapper = function (A, B) {
			var G = this.calcOffset(B),
				x = "queue-item",
				D;
			if (B == f) x += " queue-item-active";
			D = c.getFromCache(A[d.dataKey]);
			if (!D) {
				D = c.itemRenderer(A, B, g.length);
				var F = document.createElement("div");
				F.innerHTML = ['<li class="', x, '" style="left: ' + G + "px; z-index: " + (5E3 - B) + '" rel="', B, '"><div class="queue-item-content">', D, '</div><span class="position">' + (B + 1) + " of " + g.length + "</span></li>"].join("");
				D = F.firstChild;
				c.addToCache(A[d.dataKey], D)
			}
			return D
		};
		this.itemRenderer = function (A) {
			return ["<span>", A.toString(), "</span>"].join("")
		};
		return this.initialize()
	}
})(jQuery);
(function (a) {
	a.fn.slickbox = function (d, g) {
		var c = this;
		d = a.extend({
			itemWidth: 160,
			itemHeight: 100,
			verticalGap: "auto",
			minHorizontalGap: 3,
			maxHorizontalGap: 100
		}, d);
		var e = a(this),
			b, f, j = {};
		g = g;
		var o = 0,
			q = 0,
			v = 0,
			w = 0,
			E = 0,
			A = 0,
			B = 0,
			G = {
				floor: 0,
				ceil: 0
			},
			x = false,
			D = false;
		this.initialize = function () {
			this.itemRenderer = d.itemRenderer || this.itemRenderer;
			this.itemClass = d.itemClass || "";
			this.listClass = d.listClass || "";
			b = a("<ol class='slickbox-tiles " + this.listClass + "' style='position: relative;'></ol>");
			e.append(b);
			w = d.padding ? d.padding : 0;
			f = d.scrollPane ? a(d.scrollPane) : e;
			a(f).scroll(c.render);
			c.calculateGaps();
			c.render();
			return this
		};
		this.calculateGaps = function () {
			var F = Math.max(1, Math.floor((e.width() - w - d.minHorizontalGap) / (d.itemWidth + d.minHorizontalGap))),
				R = Math.max(1, Math.floor((e.width() - w - d.maxHorizontalGap) / (d.itemWidth + d.maxHorizontalGap)));
			A = Math.max(F, R);
			E = Math.ceil(g.length / A);
			v = d.horizontalGap ? d.horizontalGap : Math.floor((e.width() - w * 2 - d.itemWidth * A) / (A - 1));
			q = d.verticalGap == "auto" ? v : d.verticalGap;
			b.height(E * (d.itemHeight + q) + w * 2)
		};
		a(window).resize(function () {
			c.calculateGaps();
			c.render()
		});
		this.setItems = function (F) {
			g = F ? F : [];
			D = true;
			if (o > F.length || F.length == 0) {
				this.render();
				this.moveTo(F.length, true)
			} else this.render()
		};
		this.setActive = function (F, R) {
			if (!(_.notDefined(F) || F < 0)) {
				R = _.orEqual(R, true);
				if (o !== F) {
					o = F;
					x = true;
					R && o < g.length && this.moveTo(o);
					this.render()
				}
			}
		};
		this.addToCache = function (F, R) {
			j[F] = R
		};
		this.getFromCache = function (F) {
			return j[F] || null
		};
		this.moveTo = function (F, R) {
			F = Math.max(0, Math.min(F, g.length - 1));
			this.scrollTo(c.topOffset(F), R)
		};
		this.scrollTo = function (F, R) {
			R ? f.scrollLeft(F) : f.stop().animate({
				scrollTop: F
			}, "slow", "linear", function () {
				c.render()
			});
			B = F;
			c.render()
		};
		this.render = function () {
			c.renderTimeout && clearTimeout(this.renderTimeout);
			c.renderTimeout = setTimeout(function () {
				var F = Math.max(0, f.scrollTop()),
					R = Math.max(F + 1, f.scrollTop() + f.height());
				G.floor = Math.floor(F / (d.itemHeight + q)) * A;
				G.ceil = Math.ceil(R / (d.itemHeight + q)) * A;
				if (D) {
					j = {};
					b.html("")
				} else for (var X in j) if (j.hasOwnProperty(X)) {
					el = j[X];
					elTop = parseInt(a(el).css("top"), 10);
					if (X >= g.length || elTop + d.itemHeight < F || elTop - d.itemHeight > R) {
						b.get(0).removeChild(el);
						delete j[X]
					}
				}
				for (i = G.floor; i < G.ceil && i < g.length; i++) {
					if (F = c.getFromCache(i)) x && a(F).css({
						left: c.leftOffset(i),
						top: c.topOffset(i)
					});
					else {
						F = c.itemWrapper(g[i], i);
						b.append(F);
						c.addToCache(i, F)
					}
					i == o && a(F).addClass("slickbox-item-active")
				}
				D = x = false
			}, 60)
		};
		this.topOffset = function (F) {
			return Math.floor(F / A) * (d.itemHeight + q) + w
		};
		this.leftOffset = function (F) {
			return F % A * (d.itemWidth + v) + F % A * w
		};
		this.itemWrapper = function (F, R) {
			var X = "slickbox-item ",
				ea;
			if (R == o) X += " slickbox-item-active";
			ea = c.itemRenderer(F, R, g);
			X += a.isFunction(c.itemClass) ? " " + c.itemClass(F, R, g) : " " + c.itemClass;
			var W = document.createElement("div"),
				M = "";
			d.hidePositionInfo || (M = '<span class="position">' + (R + 1) + " of " + g.length + "</span>");
			W.innerHTML = ['<li class="', X, '" style="position:absolute; top: ' + c.topOffset(R) + "px; left: " + c.leftOffset(R) + "px; z-index: " + (5E3 - R) + '" rel="', R, '"><div class="slickbox-item-content">', ea, "</div>", M, "</li>"].join("");
			return W.firstChild
		};
		this.itemRenderer = function (F) {
			return ["<span>", F.toString(), "</span>"].join("")
		};
		return this.initialize()
	}
})(jQuery);
(function (a) {
	a.fn.tinyscrollbar = function (d) {
		function g() {
			A.obj.bind("mousedown", c);
			E.obj.bind("mouseup", j);
			a(o).bind("keydown", e);
			if (d.scroll && this.addEventListener) {
				o[0].addEventListener("DOMMouseScroll", b, false);
				o[0].addEventListener("mousewheel", b, false)
			} else if (d.scroll) o[0].onmousewheel = b
		}
		function c(X) {
			a(o).focus();
			R.start = B ? X.pageX : X.pageY;
			F.start = parseInt(A.obj.css(G));
			a(document).bind("mousemove", j);
			a(document).bind("mouseup", f);
			A.obj.bind("mouseup", f);
			return false
		}
		function e(X) {
			X = a.event.fix(X || window.event);
			if (!(X.ctrlKey || X.altKey || X.shiftKey && X.keyKode == 32)) {
				switch (X.keyCode) {
				case 39:
				case 40:
					D += d.wheel;
					X.preventDefault();
					break;
				case 37:
				case 38:
					D -= d.wheel;
					X.preventDefault();
					break;
				case 34:
					X = Math.min(E[d.axis] - A[d.axis], Math.max(0, parseInt(A.obj.css(G), 10) + 0.9 * A.obj.width()));
					D = X * w.ratio;
					break;
				case 33:
					X = Math.min(E[d.axis] - A[d.axis], Math.max(0, parseInt(A.obj.css(G), 10) - 0.9 * A.obj.width()));
					D = X * w.ratio;
					break;
				case 35:
					D = v[d.axis] - q[d.axis];
					X.preventDefault();
					break;
				case 36:
					D = 0;
					X.preventDefault();
					break
				}
				D = Math.min(v[d.axis] - q[d.axis], Math.max(0, D));
				A.obj.css(G, D / w.ratio);
				G == "top" ? q.obj.scrollTop(D) : q.obj.scrollLeft(D)
			}
		}
		function b(X) {
			a(o).focus();
			if (!(v.ratio >= 1)) {
				X = a.event.fix(X || window.event);
				D -= (X.wheelDelta ? X.wheelDelta / 120 : -X.detail / 3) * d.wheel;
				D = Math.min(v[d.axis] - q[d.axis], Math.max(0, D));
				A.obj.css(G, D / w.ratio);
				G == "top" ? q.obj.scrollTop(D) : q.obj.scrollLeft(D)
			}
		}
		function f() {
			a(document).unbind("mousemove", j);
			a(document).unbind("mouseup", f);
			A.obj.unbind("mouseup", f);
			G == "top" ? q.obj.scrollTop(D) : q.obj.scrollLeft(D);
			return false
		}
		function j(X) {
			if (!(v.ratio >= 1) && w.ratio > 0) {
				F.now = Math.round(Math.min(E[d.axis] - A[d.axis], Math.max(0, F.start + ((B ? X.pageX : X.pageY) - R.start))));
				D = Math.ceil(F.now * w.ratio);
				A.obj.css(G, F.now);
				G == "top" ? q.obj.stop().animate({
					scrollTop: D
				}) : q.obj.stop().animate({
					scrollLeft: D
				})
			}
			return false
		}
		d = a.extend({
			axis: "y",
			contentWidth: false,
			wheel: 40,
			scroll: true,
			size: "auto",
			sizethumb: "auto",
			onScroll: null
		}, d);
		var o = a(this),
			q = {
				obj: a(".viewport", this)
			},
			v = {
				obj: a(".overview", this)
			},
			w = {
				obj: a(".scrollbar", this)
			},
			E = {
				obj: a(".track", w.obj)
			},
			A = {
				obj: a(".thumb", w.obj)
			},
			B = d.axis == "x",
			G = B ? "left" : "top",
			x = B ? "Width" : "Height",
			D = 0,
			F = {
				start: 0,
				now: 0
			},
			R = {};
		if (this.length > 1) {
			this.each(function () {
				a(this).tinyscrollbar(d)
			});
			return this
		}
		this.initialize = function () {
			this.update();
			g();
			return this
		};
		this.update = function () {
			q[d.axis] = q.obj[0]["offset" + x];
			v[d.axis] = d.contentWidth && d.contentWidth >= 0 ? d.contentWidth : v.obj[0]["scroll" + x];
			v.ratio = q[d.axis] / v[d.axis];
			w.obj.toggleClass("disable", v.ratio >= 1);
			q.obj.toggleClass("scrollable", v.ratio < 1);
			E[d.axis] = d.size == "auto" ? q[d.axis] - 2 : d.size;
			A[d.axis] = Math.min(E[d.axis], Math.max(0, d.sizethumb == "auto" ? E[d.axis] * v.ratio : d.sizethumb));
			w.ratio = d.sizethumb == "auto" ? v[d.axis] / E[d.axis] : (v[d.axis] - q[d.axis]) / (E[d.axis] - A[d.axis]);
			A.obj.removeAttr("style");
			R.start = A.obj.offset()[G];
			var X = x.toLowerCase();
			w.obj.css(X, E[d.axis]);
			E.obj.css(X, E[d.axis]);
			A.obj.css(X, A[d.axis]);
			D = d.contentWidth && d.contentWidth >= 0 ? d.contentWidth > q.obj.outerWidth() ? -v.obj.offset()[G] : 0 : v.obj.outerWidth() > q.obj.outerWidth() ? -v.obj.offset()[G] : 0;
			A.obj.css(G, D / w.ratio)
		};
		return this.initialize()
	}
})(jQuery);
(function (a) {
	function d(c) {
		return typeof c == "object" ? c : {
			top: c,
			left: c
		}
	}
	var g = a.scrollTo = function (c, e, b) {
		a(window).scrollTo(c, e, b)
	};
	g.defaults = {
		axis: "xy",
		duration: parseFloat(a.fn.jquery) >= 1.3 ? 0 : 1
	};
	g.window = function () {
		return a(window)._scrollable()
	};
	a.fn._scrollable = function () {
		return this.map(function () {
			if (!(!this.nodeName || a.inArray(this.nodeName.toLowerCase(), ["iframe", "#document", "html", "body"]) != -1)) return this;
			var c = (this.contentWindow || this).document || this.ownerDocument || this;
			return a.browser.safari || c.compatMode == "BackCompat" ? c.body : c.documentElement
		})
	};
	a.fn.scrollTo = function (c, e, b) {
		if (typeof e == "object") {
			b = e;
			e = 0
		}
		if (typeof b == "function") b = {
			onAfter: b
		};
		if (c == "max") c = 9E9;
		b = a.extend({}, g.defaults, b);
		e = e || b.speed || b.duration;
		b.queue = b.queue && b.axis.length > 1;
		if (b.queue) e /= 2;
		b.offset = d(b.offset);
		b.over = d(b.over);
		return this._scrollable().each(function () {
			function f(A) {
				o.animate(w, e, b.easing, A &&
				function () {
					A.call(this, c, b)
				})
			}
			var j = this,
				o = a(j),
				q = c,
				v, w = {},
				E = o.is("html,body");
			switch (typeof q) {
			case "number":
			case "string":
				if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(q)) {
					q = d(q);
					break
				}
				q = a(q, this);
			case "object":
				if (q.is || q.style) v = (q = a(q)).offset()
			}
			a.each(b.axis.split(""), function (A, B) {
				var G = B == "x" ? "Left" : "Top",
					x = G.toLowerCase(),
					D = "scroll" + G,
					F = j[D],
					R = g.max(j, B);
				if (v) {
					w[D] = v[x] + (E ? 0 : F - o.offset()[x]);
					if (b.margin) {
						w[D] -= parseInt(q.css("margin" + G)) || 0;
						w[D] -= parseInt(q.css("border" + G + "Width")) || 0
					}
					w[D] += b.offset[x] || 0;
					if (b.over[x]) w[D] += q[B == "x" ? "width" : "height"]() * b.over[x]
				} else {
					G = q[x];
					w[D] = G.slice && G.slice(-1) == "%" ? parseFloat(G) / 100 * R : G
				}
				if (/^\d+$/.test(w[D])) w[D] = w[D] <= 0 ? 0 : Math.min(w[D], R);
				if (!A && b.queue) {
					F != w[D] && f(b.onAfterFirst);
					delete w[D]
				}
			});
			f(b.onAfter)
		}).end()
	};
	g.max = function (c, e) {
		var b = e == "x" ? "Width" : "Height",
			f = "scroll" + b;
		if (!a(c).is("html,body")) return c[f] - a(c)[b.toLowerCase()]();
		b = "client" + b;
		var j = c.ownerDocument.documentElement,
			o = c.ownerDocument.body;
		return Math.max(j[f], o[f]) - Math.min(j[b], o[b])
	}
})(jQuery);
(function (a) {
	a.fn.konami = function (d, g) {
		var c = this;
		g = a.extend({}, a.fn.konami.params, g);
		this.bind("konami", d).bind("keyup", function (e) {
			c.checkCode(e)
		});
		this.checkCode = function (e) {
			g.timeout && clearTimeout(g.timeout);
			if (e.keyCode == g.code[g.step]) g.step++;
			else g.step = 0;
			if (g.step == g.code.length) {
				c.trigger("konami");
				g.step = 0
			} else if (g.step > 0) g.timeout = setTimeout(c.reset, g.delay)
		};
		this.reset = function () {
			g.step = 0
		};
		return this
	};
	a.fn.konami.params = {
		code: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
		step: 0,
		delay: 500
	}
})(jQuery);
(function (a) {
	a.fn.jjmenu = function (d, g, c, e) {
		function b(j, o, q, v, w) {
			function E() {
				var W = a(x).css("display") == "none" ? true : false,
					M = false;
				if (w.orientation == "top" || w.orientation == "bottom") M = true;
				a(x).show();
				M = a(x).offset().top;
				var l = a(x).offset().left,
					Y = parseInt(a(x).outerHeight(), 10),
					ha = parseInt(a(x).outerWidth(), 10),
					ta = M - a(window).scrollTop();
				W && a(x).hide();
				a(x).css({
					left: l + "px"
				});
				var ga = l;
				if (w.spill === "left") {
					ga = l - ha;
					a(x).addClass("spill_left").prevAll(".jjmenu").each(function (ja, xa) {
						ga -= a(xa).outerWidth() + 1
					})
				} else if (l + ha > a(window).width()) {
					ga = l - ha;
					a(x).prev(".jjmenu").addClass("spill_left").each(function (ja, xa) {
						ga -= a(xa).outerWidth() + 1
					})
				} else ga += 2;
				W = true;
				if (w.yposition == "auto" && w.xposition == "left") {
					if (ta + Y + a(v).outerHeight() > a(window).height()) W = false
				} else if (ta + Y > a(window).height()) W = false;
				ta = true;
				if (M - Y < 0) ta = false;
				if (w.yposition == "bottom") M += a(v).outerHeight();
				if (w.orientation == "auto" && W == false && ta == true || w.orientation == "top") {
					M = M + Y > a(window).height() ? a(window).height() - Y : a(x).attr("id").match("jjmenu_main_sub") ? M - Y + 25 : M - Y;
					a(x).addClass("topOriented")
				} else {
					a(x).addClass("bottomOriented");
					if (w.yposition == "auto" && w.xposition == "left") M += a(v).outerHeight();
					M = M
				}
				a(x).css({
					top: M + "px",
					left: ga + "px"
				});
				a(".jj_menu_item:first", x).addClass("first_menu_item");
				a(".jj_menu_item:last", x).addClass("last_menu_item")
			}
			function A(W) {
				if (W.hasOwnProperty("title") || _.defined(W.customClass) && W.customClass === "separator") {
					var M = document.createElement("div");
					a(M).hover(function () {
						a(this).addClass("jj_menu_item_hover")
					}, function () {
						a(this).removeClass("jj_menu_item_hover")
					});
					a(M).click(function (Y) {
						Y.stopPropagation();
						B(W.action);
						W.type !== "sub" && a("div[id^=jjmenu]").remove()
					});
					var l = document.createElement("span");
					a(M).append(l);
					switch (W.type) {
					case "sub":
						M.className = "jj_menu_item jj_menu_item_more";
						a(M).mouseenter(function () {
							new b(j + "_sub", W.src, q, this, w);
							B(W.action)
						});
						break;
					default:
						a(M).hover(function () {
							a("div[id^=jjmenu_" + j + "_sub]").remove()
						});
						M.className = "jj_menu_item";
						break
					}
					W.customClass && W.customClass.length > 0 && jQuery(M).addClass(W.customClass);
					if (W.useEllipsis) {
						a(l).addClass("ellipsis").attr("title", G(W.title));
						a(l).html(G(W.title))
					} else if (W.title) {
						a(l).html(G(W.title)).attr("title", G(W.title));
						a(l).html(G(W.title))
					}
					a(D).append(M)
				}
			}
			function B(W) {
				if (W) switch (W.type) {
				case "gourl":
					if (W.target) {
						window.open(G(W.url), W.target).focus();
						return false
					} else document.location.href = G(W.url);
					break;
				case "ajax":
					a.getJSON(G(W.url), function (l) {
						var Y = eval(W.callback);
						typeof Y == "function" && Y(l)
					});
					break;
				case "fn":
					var M = eval(W.callback);
					typeof M == "function" && M(q);
					break
				}
			}
			function G(W) {
				if (q) for (var M in q) W = W.replace("#" + M + "#", eval("myReplaces." + M));
				return W
			}
			if (j == "main") window.triggerElement = v;
			w = function (W, M) {
				var l = {
					show: "default",
					xposition: "right",
					yposition: "auto",
					orientation: "auto"
				};
				if (!M) return l;
				if (!M.show) M.show = "default";
				var Y = M.show;
				if (!M.xposition) M.xposition = "right";
				if (!M.yposition) M.yposition = "auto";
				if (!M.orientation) M.orientation = "auto";
				if (!M.spill) M.spill = "auto";
				if (W != "main") {
					var ha = l;
					ha.show = Y;
					ha.spill = M.spill
				}
				return W == "main" ? M : ha
			}(j, w);
			var x = document.createElement("div"),
				D = document.createElement("span");
			a("div[id^=jjmenu_" + j + "]").remove();
			a(x).append(D);
			x.className = "jjmenu";
			if (w.className) x.className += " " + w.className;
			x.id = "jjmenu_" + j;
			a(x).css({
				display: "none"
			});
			a(document.body).append(x);
			(function () {
				var W = a(v).offset(),
					M = W.top - 1;
				W = w.xposition == "left" ? W.left : W.left + a(v).outerWidth();
				if (w.xposition == "mouse") W = Math.max(f.pageX - 3, 0);
				if (w.yposition == "mouse") M = Math.max(f.pageY - 3, 0);
				a(x).css({
					position: "absolute",
					top: M + "px",
					left: W + "px"
				})
			})();
			var F = false;
			for (var R in o) if (o[R].get) {
				F = true;
				a.getJSON(G(o[R].get), function (W) {
					for (var M in W) A(W[M]);
					E()
				});
				a(this).ajaxError(function () {
					E()
				})
			} else if (o[R].getByService) o[R].getByService(function (W) {
				o[R].dataHandler(W, function (M) {
					for (var l in M) A(M[l]);
					E()
				})
			});
			else if (o[R].getByFunction) {
				var X = (typeof o[R].getByFunction == "function" ? o[R].getByFunction : eval(o[R].getByFunction))(q);
				for (var ea in X) A(X[ea]);
				E()
			} else A(o[R]);
			F || E();
			(function () {
				if (!w || w.show == "default") {
					a(x).show();
					return false
				}
				var W = parseInt(w.speed);
				W = isNaN(W) ? 500 : W;
				switch (w.show) {
				case "fadeIn":
					a(x).fadeIn(W);
					break;
				case "slideDown":
					a(x).slideDown(W);
					break;
				case "slideToggle":
					a(x).slideToggle(W);
					break;
				default:
					a(x).show();
					break
				}
			})()
		}
		var f = this;
		f.pageX = d.pageX;
		f.pageY = d.pageY;
		d.preventDefault();
		d.stopPropagation();
		new b("main", g, c, this, e);
		a(this).unbind("mouseup").addClass("active-context").blur();
		a(this)[0].oncontextmenu = function () {
			return false
		};
		document.body.oncontextmenu = function () {
			if (a("div[id^=jjmenu_main]").length) return false
		};
		a(document).click(function () {
			a("div[id^=jjmenu]").remove();
			f.removeClass("active-context")
		});
		a(this).parents().scroll(function () {
			a("div[id^=jjmenu]").remove();
			f.removeClass("active-context")
		})
	}
})(jQuery);
if (typeof jQuery === "undefined") throw Error("SlickGrid requires jquery module to be loaded");
if (!jQuery.fn.drag) throw Error("SlickGrid requires jquery.event.drag module to be loaded");
(function (a) {
	function d() {
		var e = null;
		this.isActive = function (b) {
			return b ? e === b : e !== null
		};
		this.activate = function (b) {
			if (b !== e) {
				if (e !== null) throw "SlickGrid.EditorLock.activate: an editController is still active, can't activate another editController";
				if (!b.commitCurrentEdit) throw "SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()";
				if (!b.cancelCurrentEdit) throw "SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()";
				e = b
			}
		};
		this.deactivate = function (b) {
			if (e !== b) throw "SlickGrid.EditorLock.deactivate: specified editController is not the currently active one";
			e = null
		};
		this.commitCurrentEdit = function () {
			return e ? e.commitCurrentEdit() : true
		};
		this.cancelCurrentEdit = function () {
			return e ? e.cancelCurrentEdit() : true
		}
	}
	var g, c = function () {
		for (var e = 0, b = a.browser.mozilla ? 5E6 : 1E9, f = a("<div style='display:none' />").appendTo(document.body); e <= b;) {
			f.css("height", e + 1E6);
			if (f.height() !== e + 1E6) break;
			else e += 1E6
		}
		f.remove();
		return e
	}();
	a.extend(true, window, {
		Slick: {
			Grid: function (e, b, f, j) {
				function o() {
					var n = a("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body"),
						r = {
							width: n.width() - n[0].clientWidth,
							height: n.height() - n[0].clientHeight
						};
					n.remove();
					return r
				}
				function q(n) {
					ya.outerWidth(n);
					Rb = n > jb - g.width
				}
				function v(n) {
					n && n.jquery && n.attr("unselectable", "on").css("MozUserSelect", "none").bind("selectstart.ui", function () {
						return false
					})
				}
				function w() {
					return db.length
				}
				function E(n) {
					return db[n]
				}
				function A() {
					for (var n = ya[0];
					(n = n.parentNode) != document.body;) if (n == pa[0] || n.scrollWidth != n.clientWidth || n.scrollHeight != n.clientHeight) a(n).bind("scroll.slickgrid", Mb)
				}
				function B() {
					function n() {
						a(this).addClass("ui-state-hover")
					}
					function r() {
						a(this).removeClass("ui-state-hover")
					}
					var C;
					Pa.empty();
					P = {};
					var K;
					for (C = 0; C < f.length; C++) {
						var V = f[C] = a.extend({}, Qb, f[C]);
						P[V.id] = C;
						K = V.columnFormatter ? V.columnFormatter(V) : "<span class='slick-column-name'>" + V.name + "</span>";
						K = a("<div class='ui-state-default slick-header-column slick-header-column-" + V.id + "' id='" + yb + V.id + "'/>").html(K).width(V.width - h).css("left", "10000px").attr("title", V.toolTip || "").data("fieldId", V.id).appendTo(Pa);
						if (j.enableColumnReorder || V.sortable) K.hover(n, r);
						if (V.collapsable) {
							K.append("<a class='slick-collapse-indicator' />");
							a(".slick-collapse-indicator").width(g.width - 1);
							a(".slick-collapse-indicator").css("marginRight", -g.width);
							a(".slick-collapse-indicator").css("marginLeft", g.width / 2 - 3.5 + 1)
						}
						V.sortable && K.append("<span class='slick-sort-indicator' />")
					}
					M(O, Q);
					D();
					j.enableColumnReorder && x()
				}
				function G() {
					Pa.click(function (n) {
						if (!(a(n.target).hasClass("slick-resizable-handle") || a(n.target).hasClass("slick-collapse-indicator"))) if (ka.onSort) {
							n = a(n.target).closest(".slick-header-column");
							if (n.length) {
								n = f[Xa(n[0])];
								if (n.sortable) if (j.editorLock.commitCurrentEdit()) {
									if (n.id === O) Q = !Q;
									else {
										O = n.id;
										Q = true
									}
									M(O, Q);
									ka.onSort(n, Q)
								}
							}
						}
					})
				}
				function x() {
					Pa.sortable({
						containment: "parent",
						axis: "x",
						cursor: "default",
						tolerance: "intersection",
						helper: "clone",
						placeholder: "slick-sortable-placeholder ui-state-default slick-header-column",
						forcePlaceholderSize: true,
						start: function (n, r) {
							a(r.helper).addClass("slick-header-column-active")
						},
						beforeStop: function (n, r) {
							a(r.helper).removeClass("slick-header-column-active")
						},
						stop: function (n) {
							if (j.editorLock.commitCurrentEdit()) {
								for (var r = Pa.sortable("toArray"), C = [], K = 0; K < r.length; K++) C.push(f[X(r[K].replace(yb, ""))]);
								ha(C);
								ka.onColumnsReordered && ka.onColumnsReordered();
								n.stopPropagation();
								D()
							} else a(this).sortable("cancel")
						}
					})
				}
				function D() {
					var n, r, C, K, V, Z, fa, Oa, Ia;
					K = Pa.children();
					K.find(".slick-resizable-handle").remove();
					K.each(function (Aa) {
						if (f[Aa].resizable) {
							if (fa === undefined) fa = Aa;
							Oa = Aa
						}
					});
					K.each(function (Aa, Ma) {
						a(Ma);
						fa !== undefined && Aa < fa || j.forceFitColumns && Aa >= Oa ? a("<div class='slick-resizable-handle' />").appendTo(Ma) : a("<div class='slick-resizable-handle' />").appendTo(Ma).bind("dragstart", function (wa) {
							if (!j.editorLock.commitCurrentEdit()) return false;
							C = wa.pageX;
							a(this).parent().addClass("slick-header-column-active");
							var va = wa = null;
							K.each(function (zb, Sb) {
								f[zb].previousWidth = a(Sb).outerWidth()
							});
							if (j.forceFitColumns) {
								va = wa = 0;
								for (n = Aa + 1; n < K.length; n++) {
									r = f[n];
									if (r.resizable) {
										if (va !== null) if (r.maxWidth) va += r.maxWidth - r.previousWidth;
										else va = null;
										wa += r.previousWidth - Math.max(r.minWidth || 0, s)
									}
								}
							}
							var oa = 0,
								Ea = 0;
							for (n = 0; n <= Aa; n++) {
								r = f[n];
								if (r.resizable) {
									if (Ea !== null) if (r.maxWidth) Ea += r.maxWidth - r.previousWidth;
									else Ea = null;
									oa += r.previousWidth - Math.max(r.minWidth || 0, s)
								}
							}
							if (wa === null) wa = 1E5;
							if (oa === null) oa = 1E5;
							if (va === null) va = 1E5;
							if (Ea === null) Ea = 1E5;
							Z = C + Math.min(wa, Ea);
							V = C - Math.min(oa, va);
							Ia = ya.width()
						}).bind("drag", function (wa) {
							var va = Math.min(Z, Math.max(V, wa.pageX)) - C,
								oa;
							if (va < 0) {
								oa = va;
								for (n = Aa; n >= 0; n--) {
									r = f[n];
									if (r.resizable) {
										wa = Math.max(r.minWidth || 0, s);
										if (oa && r.previousWidth + oa < wa) {
											oa += r.previousWidth - wa;
											W(n, wa, j.syncColumnCellResize)
										} else {
											W(n, r.previousWidth + oa, j.syncColumnCellResize);
											oa = 0
										}
									}
								}
								if (j.forceFitColumns) {
									oa = -va;
									for (n = Aa + 1; n < K.length; n++) {
										r = f[n];
										if (r.resizable) if (oa && r.maxWidth && r.maxWidth - r.previousWidth < oa) {
											oa -= r.maxWidth - r.previousWidth;
											W(n, r.maxWidth, j.syncColumnCellResize)
										} else {
											W(n, r.previousWidth + oa, j.syncColumnCellResize);
											oa = 0
										}
									}
								} else j.syncColumnCellResize && q(Ia + va)
							} else {
								oa = va;
								for (n = Aa; n >= 0; n--) {
									r = f[n];
									if (r.resizable) if (oa && r.maxWidth && r.maxWidth - r.previousWidth < oa) {
										oa -= r.maxWidth - r.previousWidth;
										W(n, r.maxWidth, j.syncColumnCellResize)
									} else {
										W(n, r.previousWidth + oa, j.syncColumnCellResize);
										oa = 0
									}
								}
								if (j.forceFitColumns) {
									oa = -va;
									for (n = Aa + 1; n < K.length; n++) {
										r = f[n];
										if (r.resizable) {
											wa = Math.max(r.minWidth || 0, s);
											if (oa && r.previousWidth + oa < wa) {
												oa += r.previousWidth - wa;
												W(n, wa, j.syncColumnCellResize)
											} else {
												W(n, r.previousWidth + oa, j.syncColumnCellResize);
												oa = 0
											}
										}
									}
								} else j.syncColumnCellResize && q(Ia + va)
							}
						}).bind("dragend", function () {
							var wa;
							a(this).parent().removeClass("slick-header-column-active");
							for (n = 0; n < K.length; n++) {
								r = f[n];
								wa = a(K[n]).outerWidth();
								r.previousWidth !== wa && r.rerenderOnResize && U();
								r.width = j.forceFitColumns ? Math.floor(r.width * (wa - r.previousWidth) / r.previousWidth) + r.width : wa;
								!j.syncColumnCellResize && r.previousWidth !== wa && W(n, wa, true)
							}
							eb();
							ka.onColumnsResized && ka.onColumnsResized()
						})
					})
				}
				function F() {
					function n(r) {
						return {
							start: {
								row: Math.min(r.start.row, r.end.row),
								cell: Math.min(r.start.cell, r.end.cell)
							},
							end: {
								row: Math.max(r.start.row, r.end.row),
								cell: Math.max(r.start.cell, r.end.cell)
							}
						}
					}
					ya.bind("draginit", function (r, C) {
						var K = a(r.target).closest(".slick-cell");
						if (K.length === 0) return false;
						if (parseInt(K.parent().attr("row"), 10) >= Ka()) return false;
						K = f[Xa(K[0])];
						if (K.behavior == "move" || K.behavior == "selectAndMove") C.mode = 1;
						else if (j.enableCellRangeSelection) C.mode = 2;
						else return false
					}).bind("dragstart", function (r, C) {
						if (!j.editorLock.commitCurrentEdit()) return false;
						var K = parseInt(a(r.target).closest(".slick-row").attr("row"), 10);
						if (C.mode == 1) {
							H[K] || a(r.target).click();
							C.draggedItemsContext = GS.Controllers.PageController.getActiveController().getPlayContext();
							C.draggedItems = [];
							if (j.isFilter) {
								var V = a("#page .gs_grid.songs").controller().dataView.rows;
								V.sort(function (Z, fa) {
									return Z - fa
								});
								for (K = 0; K < V.length; K++) C.draggedItems.push(V[K]);
								V = [];
								for (K = 0; K < t.length; K++) V.push(Ga(t[K]))
							} else {
								t.sort(function (Z, fa) {
									return Z - fa
								});
								for (K = 0; K < t.length; K++) C.draggedItems.push(Ga(t[K]))
							}
							C.selectionProxy = a("<div class='slick-reorder-proxy'/>").css("position", "absolute").css("zIndex", "99999").appendTo("body").mousewheel(function (Z, fa) {
								pa.within(Z.clientX, Z.clientY).length > 0 && pa.scrollTop(pa.scrollTop() - 82 * fa)
							});
							if (j.dragProxy) j.isFilter && V ? C.selectionProxy.html(j.dragProxy(V)) : C.selectionProxy.html(j.dragProxy(C.draggedItems));
							else C.selectionProxy.html('<div class="status"></div><span class="info">' + C.draggedItems.length + "</span>");
							C.guide = a("<div class='slick-reorder-guide'/>").css("position", "absolute").css("zIndex", "99998").css("width", a(this).innerWidth()).css("top", -1000).appendTo(pa);
							C.playerGuide = a("<div id='queue_songGuide'/>").addClass("size_" + GS.player.queueSize).css("position", "absolute").css("zIndex", "99998").css("width", 10).css("top", a("#queue_list").offset().top + 2).hide().appendTo("body");
							C.insertBefore = -1;
							C.autoScrollHasWaited = false;
							C.autoScrollWaitTimeout = false;
							GS.guts.gaTrackEvent("grid", "dragStart")
						}
						if (C.mode == 2) {
							K = pb(C.startX - ya.offset().left, C.startY - ya.offset().top);
							if (!Db(K.row, K.cell)) return false;
							C.range = {
								start: K,
								end: {}
							};
							return a("<div class='slick-selection'></div>").appendTo(ya)
						}
					}).bind("drag", function (r, C) {
						if (C.mode == 1) {
							var K = r.clientY - a(this).offset().top;
							C.selectionProxy.css("top", r.clientY).css("left", r.clientX);
							K = Math.max(0, Math.min(Math.round(K / j.rowHeight), Ka()));
							if (K !== C.insertBefore) {
								if (ka.onBeforeMoveRows && ka.onBeforeMoveRows(l(), K) === false) {
									C.guide.css("top", -1000);
									C.canMove = false
								} else {
									C.guide.css("top", K * j.rowHeight + ab);
									C.canMove = true
								}
								C.insertBefore = K
							}
							var V;
							K = pa.within(r.clientX, r.clientY).length > 0;
							if (j.autoDragScroll && K) {
								if (!C.autoScrollWaitTimeout) C.autoScrollWaitTimeout = setTimeout(function () {
									C.autoScrollHasWaited = true;
									C.autoScrollWaitTimeout = false
								}, 500);
								j.autoScrollBuffer = j.autoScrollBuffer || Math.ceil(pa.height() * 0.2);
								j.autoScrollWaitDuration = j.autoScrollBuffer || 300;
								if (pa.offset().top + j.autoScrollBuffer > r.clientY) {
									if (C.autoScrollHasWaited) {
										V = Math.max(0, pa.scrollTop() - 82);
										pa.scrollTop(V)
									}
									clearInterval(C.autoScrollInterval);
									C.autoScrollInterval = setInterval(function () {
										if (C.autoScrollHasWaited) {
											V = Math.max(0, pa.scrollTop() - 82);
											pa.scrollTop(V)
										}
									}, j.autoScrollWaitDuration)
								} else if (pa.offset().top + pa.height() - j.autoScrollBuffer < r.clientY) {
									if (C.autoScrollHasWaited) {
										V = Math.min(ya.height(), pa.scrollTop() + 82);
										pa.scrollTop(V)
									}
									clearInterval(C.autoScrollInterval);
									C.autoScrollInterval = setInterval(function () {
										if (C.autoScrollHasWaited) {
											V = Math.min(ya.height(), pa.scrollTop() + 82);
											pa.scrollTop(V)
										}
									}, j.autoScrollWaitDuration)
								} else {
									clearTimeout(C.autoScrollWaitTimeout);
									clearInterval(C.autoScrollInterval);
									C.autoScrollWaitTimeout = false;
									C.autoScrollHasWaited = false
								}
							} else {
								clearInterval(C.autoScrollInterval);
								clearTimeout(C.autoScrollWaitTimeout);
								C.autoScrollHasWaited = false;
								C.autoScrollWaitTimeout = false
							}
							if (C.dropContainers) {
								var Z = false;
								for (var fa in C.dropContainers) if (C.dropContainers.hasOwnProperty(fa)) {
									K = C.dropContainers[fa];
									if (K.within(r.clientX, r.clientY).length) {
										Z = true;
										break
									}
								}
								Z ? C.selectionProxy.addClass("valid").removeClass("invalid") : C.selectionProxy.addClass("invalid").removeClass("valid")
							}
							GS.player.managePlayerGuide(r, C)
						}
						if (C.mode == 2) {
							fa = pb(r.clientX - ya.offset().left, r.clientY - ya.offset().top);
							if (!Db(fa.row, fa.cell)) return;
							C.range.end = fa;
							K = n(C.range);
							fa = Eb(K.start.row, K.start.cell);
							K = Eb(K.end.row, K.end.cell);
							a(C.proxy).css({
								top: fa.top,
								left: fa.left,
								height: K.bottom - fa.top - 2,
								width: K.right - fa.left - 2
							})
						}
						GS.sidebar && GS.sidebar.handleHover(r)
					}).bind("dragend", function (r, C) {
						clearInterval(C.autoScrollInterval);
						var K = pa.within(r.clientX, r.clientY).length > 0;
						if (K) {
							if (C.mode == 1) {
								C.guide.remove();
								C.selectionProxy.remove();
								C.playerGuide.remove();
								if (K && ka.onMoveRows && C.canMove) {
									ka.onMoveRows(l(), C.insertBefore);
									GS.guts.gaTrackEvent("grid", "dragSuccess")
								}
							}
							if (C.mode == 2) {
								a(C.proxy).remove();
								K && ka.onCellRangeSelected && ka.onCellRangeSelected(n(C.range))
							}
						} else {
							C.guide.remove();
							C.selectionProxy.remove();
							C.playerGuide.remove()
						}
					})
				}
				function R() {
					var n = a("<div class='ui-state-default slick-header-column' style='visibility:hidden'>-</div>").appendTo(Pa);
					h = n.outerWidth() - n.width();
					k = n.outerHeight() - n.height();
					n.remove();
					var r = a("<div class='slick-row' />").appendTo(ya);
					n = a("<div class='slick-cell' id='' style='visibility:hidden'>-</div>").appendTo(r);
					m = n.outerWidth() - n.width();
					p = n.outerHeight() - n.height();
					r.remove();
					s = Math.max(h, m)
				}
				function X(n) {
					return P[n]
				}
				function ea() {
					jb = pa.width();
					var n, r, C = [],
						K = 0,
						V = j.autoHeight ? jb : jb - g.width,
						Z = 0;
					for (n = Z = 0; n < f.length; n++) {
						r = f[n];
						C.push(r.width);
						Z += r.width;
						K += r.width - Math.max(r.minWidth || 0, s)
					}
					Z = Z;
					for (U(); Z > V;) {
						if (!K) return;
						var fa = (Z - V) / K;
						for (n = 0; n < f.length && Z > V; n++) {
							r = f[n];
							if (!(!r.resizable || r.minWidth === r.width || r.width === s)) {
								r = Math.floor(fa * (r.width - Math.max(r.minWidth || 0, s))) || 1;
								Z -= r;
								C[n] -= r
							}
						}
					}
					for (K = Z; Z < V;) {
						fa = V / Z;
						for (n = 0; n < f.length && Z < V; n++) {
							r = f[n];
							if (!(!r.resizable || r.maxWidth <= r.width)) {
								r = Math.min(Math.floor(fa * r.width) - r.width, r.maxWidth - r.width || 1E6) || 1;
								Z += r;
								C[n] += r
							}
						}
						if (K == Z) break;
						K = Z
					}
					for (n = 0; n < f.length; n++) W(n, f[n].currentWidth = C[n], true);
					ra()
				}
				function W(n, r, C) {
					f[n].currentWidth = r;
					Pa.children().eq(n).css("width", r - h);
					C && a("." + yb + " .c" + n).css("width", r - m + "px")
				}
				function M(n, r) {
					O = n;
					Q = r;
					var C = P[O];
					Pa.children().removeClass("slick-header-column-sorted");
					Pa.find(".slick-sort-indicator").removeClass("slick-sort-indicator-asc").removeClass("slick-sort-indicator-desc");
					if (C != null) Pa.children().eq(C).addClass("slick-header-column-sorted").find(".slick-sort-indicator").addClass(Q ? "slick-sort-indicator-asc" : "slick-sort-indicator-desc")
				}
				function l() {
					return t.concat()
				}
				function Y(n) {
					var r, C, K = {};
					for (r = 0; r < n.length; r++) K[n[r]] = true;
					for (r = 0; r < t.length; r++) {
						C = t[r];
						aa[C] && !K[C] && a(aa[C]).removeClass("ui-state-active selected")
					}
					for (r = 0; r < n.length; r++) {
						C = n[r];
						aa[C] && !H[C] && a(aa[C]).addClass("ui-state-active selected")
					}
					t = n.concat();
					H = K
				}
				function ha(n) {
					f = n;
					U();
					B();
					eb();
					Cb()
				}
				function ta(n) {
					var r = Fa;
					hb = Math.min(nb - 1, Math.floor(n / mb));
					Fa = Math.round(hb * rb);
					n = n - Fa;
					if (Fa != r) {
						var C = Za(n);
						xa(C.top, C.bottom);
						for (var K in aa) aa[K].style.top = K * j.rowHeight - Fa + "px"
					}
					if (qa != n) {
						Sa = qa + r < n + Fa ? 1 : -1;
						pa[0].scrollTop = za = sa = qa = n;
						ka.onViewportChanged && ka.onViewportChanged()
					}
				}
				function ga(n, r, C) {
					return C === null || C === undefined ? "" : C
				}
				function ja(n) {
					return n.formatter || j.formatterFactory && j.formatterFactory.getFormatter(n) || ga
				}
				function xa(n) {
					for (var r in aa) if ((r = parseInt(r, 10)) !== u && (r < n.top || r > n.bottom)) da(r)
				}
				function U() {
					I && Ja();
					ya[0].innerHTML = "";
					aa = {};
					La = {};
					S += ma;
					ma = 0
				}
				function da(n) {
					var r = aa[n];
					if (r) {
						ya[0].removeChild(r);
						delete aa[n];
						delete La[n];
						ma--;
						S++
					}
				}
				function ia(n) {
					var r, C;
					if (n && n.length) {
						Sa = 0;
						var K = [];
						r = 0;
						for (C = n.length; r < C; r++) {
							I && u === r && Ja();
							aa[n[r]] && K.push(n[r])
						}
						if (ma > 10 && K.length === ma) U();
						else {
							r = 0;
							for (n = K.length; r < n; r++) da(K[r])
						}
					}
				}
				function ua(n) {
					ia([n])
				}
				function Ca(n) {
					if (aa[n]) {
						a(aa[n]).children().each(function (r) {
							var C = f[r];
							if (n === u && r === z && I) I.loadValue(Ga(u));
							else this.innerHTML = Ga(n) ? ja(C)(n, r, Ga(n)[C.field], C, Ga(n)) : ""
						});
						bb(n)
					}
				}
				function ra() {
					var n = j.rowHeight * (Ka() + (j.enableAddRow ? 1 : 0) + (j.leaveSpaceForNewRows ? la - 1 : 0)) + ab * 2;
					j.autoHeight ? pa.height(n).css({
						"overflow-y": "hidden"
					}) : pa.height(Ha.innerHeight() - Ya.outerHeight() - (j.showSecondaryHeaderRow ? Ra.outerHeight() : 0));
					jb = pa.innerWidth();
					Qa = pa.innerHeight();
					la = Math.ceil(Qa / j.rowHeight);
					var r = 0;
					Pa.find(".slick-header-column").each(function () {
						r += a(this).outerWidth()
					});
					Ab = pa.get(0).clientHeight < pa.get(0).scrollHeight;
					if (!Ab && !j.autoHeight) r += g.width;
					q(r);
					kb();
					Ta()
				}
				function eb() {
					j.forceFitColumns ? ea() : ra()
				}
				function kb() {
					var n = Ka() + (j.enableAddRow ? 1 : 0) + (j.leaveSpaceForNewRows ? la - 1 : 0),
						r = $a,
						C = j.enableAddRow ? Ka() : Ka() - 1;
					for (var K in aa) K >= C && da(K);
					Va = Math.max(j.rowHeight * n, Qa - g.height);
					if (Va < xb) {
						$a = mb = Va;
						nb = 1;
						rb = 0
					} else {
						$a = xb;
						mb = $a / 100;
						nb = Math.floor(Va / mb);
						rb = (Va - $a) / (nb - 1)
					}
					if ($a !== r) {
						ya.outerHeight($a);
						sa = pa[0].scrollTop
					}
					n = sa + Fa <= Va - Qa;
					if (Va == 0 || sa == 0) hb = Fa = 0;
					else n ? ta(sa + Fa) : ta(Va - Qa);
					$a != r && j.autoHeight && ra()
				}
				function Za() {
					return {
						top: Math.floor((sa + Fa) / j.rowHeight),
						bottom: Math.ceil((sa + Fa + Qa) / j.rowHeight)
					}
				}
				function Wa() {
					if (j.enableAsyncPostRender) {
						clearTimeout(na);
						na = setTimeout(ob, j.asyncPostRenderDelay)
					}
				}
				function bb(n) {
					delete La[n];
					Ba = Math.min(Ba, n);
					Da = Math.max(Da, n);
					Wa()
				}
				function Ta() {
					var n = Za(),
						r = Za(void 0),
						C = Math.round(Qa / j.rowHeight);
					if (Sa == -1) {
						r.top -= C;
						r.bottom += 3
					} else if (Sa == 1) {
						r.top -= 3;
						r.bottom += C
					} else {
						r.top -= 3;
						r.bottom += 3
					}
					r.top = Math.max(0, r.top);
					r.bottom = Math.min(j.enableAddRow ? Ka() : Ka() - 1, r.bottom);
					xa(r);
					var K, V = ya[0],
						Z = ma;
					K = [];
					var fa = [],
						Oa = new Date,
						Ia = false;
					for (C = r.top; C <= r.bottom; C++) if (!aa[C]) {
						ma++;
						fa.push(C);
						var Aa = K,
							Ma = C,
							wa = Ga(Ma),
							va = Ma < Ka() && !wa,
							oa = void 0,
							Ea = void 0;
						oa = "";
						var zb = j.rowHeight - p;
						Ea = "slick-row " + (va ? " loading" : "") + (H[Ma] ? " selected ui-state-active" : "") + (Ma % 2 == 1 ? " odd" : " even");
						if (j.rowCssClasses) Ea += " " + j.rowCssClasses(wa);
						if (j.rowAttrs) oa = j.rowAttrs(wa);
						Aa.push("<div class='ui-widget-content " + Ea + "' row='" + Ma + "' style='top:" + (j.rowHeight * Ma - Fa + ab) + "px' " + oa + ">");
						va = Ea = 0;
						for (var Sb = f.length; va < Sb; va++) {
							var Bb = f[va];
							Ea = 0;
							if (va == 0) Ea += ab;
							if (va + 1 == Sb) {
								Ea += ab;
								if (!Ab && !j.autoHeight) Ea -= g.width
							}
							oa = "slick-cell c" + va + (Bb.cssClass ? " " + Bb.cssClass : "");
							if (N && N[Ma] && N[Ma][Bb.id]) oa += " " + j.cellHighlightCssClass;
							Ea = "height: " + zb + "px; line-height:" + zb + "px; width: " + ((f[va].currentWidth || f[va].width) - Ea - m) + "px;";
							Aa.push("<div class='" + oa + "' style='" + Ea + "'>");
							wa && Aa.push(ja(Bb)(Ma, va, wa[Bb.field], Bb, wa));
							Aa.push("</div>")
						}
						Aa.push("</div>");
						if (J && u === C) Ia = true;
						y++
					}
					r = document.createElement("div");
					r.innerHTML = K.join("");
					C = 0;
					for (K = r.childNodes.length; C < K; C++) aa[fa[C]] = V.appendChild(r.firstChild);
					if (Ia) J = a(aa[u]).children().eq(z)[0];
					if (ma - Z > 5) Ua = (new Date - Oa) / (ma - Z);
					Ba = n.top;
					Da = Math.min(j.enableAddRow ? Ka() : Ka() - 1, n.bottom);
					Wa();
					za = sa;
					ba = null
				}
				function Cb() {
					sa = pa[0].scrollTop;
					var n = pa[0].scrollLeft,
						r = Math.abs(sa - qa);
					if (n !== Na) {
						Na = n;
						Ya[0].scrollLeft = n;
						Ra[0].scrollLeft = n
					}
					if (r) {
						Sa = qa < sa ? 1 : -1;
						qa = sa;
						if (r < Qa) ta(sa + Fa);
						else {
							n = Fa;
							hb = Math.min(nb - 1, Math.floor(sa * ((Va - Qa) / ($a - Qa)) * (1 / mb)));
							Fa = Math.round(hb * rb);
							n != Fa && U()
						}
						ba && clearTimeout(ba);
						if (Math.abs(za - sa) < Qa) Ta();
						else ba = setTimeout(Ta, 50);
						ka.onViewportChanged && ka.onViewportChanged()
					}
				}
				function ob() {
					for (; Ba <= Da;) {
						var n = Sa >= 0 ? Ba++ : Da--,
							r = aa[n];
						if (!(!r || La[n] || n >= Ka())) {
							var C = Ga(n);
							r = r.childNodes;
							for (var K = 0, V = 0, Z = f.length; K < Z; ++K) {
								var fa = f[K];
								fa.asyncPostRender && fa.asyncPostRender(r[V], Ba, C, fa);
								++V
							}
							La[n] = true;
							na = setTimeout(ob, j.asyncPostRenderDelay);
							return
						}
					}
				}
				function Xa(n) {
					for (var r = 0; n && n.previousSibling;) {
						r++;
						n = n.previousSibling
					}
					return r
				}
				function Ub(n) {
					if (!(ka.onKeyDown && !j.editorLock.isActive() && ka.onKeyDown(n, u, z))) if (!n.shiftKey && !n.altKey && !n.ctrlKey && !n.metaKey) if (n.which == 27) {
						if (!j.editorLock.isActive()) return;
						Lb()
					} else if (n.which == 37) Ob();
					else if (n.which == 39) Pb();
					else if (n.which == 38) cb();
					else if (n.which == 40) gb();
					else if (n.which == 9) Hb();
					else if (n.which == 13) {
						if (j.editable) if (I) u === w() ? gb() : Kb();
						else j.editorLock.commitCurrentEdit() && qb()
					} else return;
					else if (n.which == 9 && n.shiftKey && !n.ctrlKey && !n.metaKey && !n.altKey) Ib();
					else return;
					n.stopPropagation();
					n.preventDefault();
					try {
						n.originalEvent.keyCode = 0
					} catch (r) {}
				}
				function Vb(n) {
					var r = a(n.target).closest(".slick-cell", ya);
					if (r.length !== 0) if (!(J === r[0] && I !== null)) {
						var C = parseInt(r.parent().attr("row"), 10),
							K = Xa(r[0]),
							V = null,
							Z = f[K],
							fa = Ga(C);
						if (!(a.isFunction(j.isSelectable) && !j.isSelectable(fa))) {
							if (!Ha.is("slick-grid-focused")) {
								a(".slick-grid-focused").removeClass("slick-grid-focused");
								Ha.addClass("slick-grid-focused")
							}
							if (fa && (Z.behavior === "selectAndMove" || Z.behavior === "select" || n.ctrlKey || n.metaKey || n.shiftKey)) {
								if (V = j.editorLock.commitCurrentEdit()) {
									Z = l();
									var Oa = a.inArray(C, Z);
									if (!n.ctrlKey && !n.metaKey && !n.shiftKey) Z = Z.length === 1 && Z[0] == C ? [] : [C];
									else if (Oa === -1 && (n.ctrlKey || n.metaKey)) Z.push(C);
									else if (Oa !== -1 && (n.ctrlKey || n.metaKey)) Z = a.grep(Z, function (Ma) {
										return Ma !== C
									});
									else if (Z.length && n.shiftKey) {
										Oa = Z.pop();
										var Ia = Math.min(C, Oa),
											Aa = Math.max(C, Oa);
										Z = [];
										for (Ia = Ia; Ia <= Aa; Ia++) Ia !== Oa && Z.push(Ia);
										Z.push(Oa)
									}
									Fb();
									Y(Z);
									ka.onSelectedRowsChanged && ka.onSelectedRowsChanged();
									if (fa && ka.onClick) if (V = j.editorLock.commitCurrentEdit()) if (ka.onClick(n, C, K)) {
										n.stopPropagation();
										n.preventDefault();
										return
									}
								}
								if (n.ctrlKey || n.metaKey || n.shiftKey) return
							}
							if (fa && ka.onClick) if (V = j.editorLock.commitCurrentEdit()) if (ka.onClick(n, C, K)) {
								n.stopPropagation();
								n.preventDefault()
							}
							if (j.enableCellNavigation && !f[K].unselectable) if (V === true || V === null && j.editorLock.commitCurrentEdit()) {
								sb(C, false);
								ub(r[0], C === w() || j.autoEdit)
							}
						}
					}
				}
				function Wb(n) {
					var r = a(n.target).closest(".slick-cell", ya);
					if (r.length !== 0) if (!(J === r[0] && I !== null)) {
						var C = parseInt(r.parent().attr("row"), 10);
						r = Xa(r[0]);
						var K = null;
						if (Ga(C) && ka.onContextMenu) if (K = j.editorLock.commitCurrentEdit()) if (ka.onContextMenu(n, C, r)) {
							n.stopPropagation();
							n.preventDefault();
							return false
						}
					}
				}
				function Tb(n) {
					var r = a(n.target).closest(".slick-cell", ya);
					if (r.length !== 0) if (!(J === r[0] && I !== null)) {
						var C = parseInt(r.parent().attr("row"), 10);
						r = Xa(r[0]);
						var K = null;
						if (Ga(C) && ka.onDblClick) if (K = j.editorLock.commitCurrentEdit()) if (ka.onDblClick(n, C, r)) {
							n.stopPropagation();
							n.preventDefault();
							return false
						}
						j.editable && lb(C, r, true)
					}
				}
				function Xb(n) {
					if (ka.onHeaderContextMenu && j.editorLock.commitCurrentEdit()) {
						n.preventDefault();
						var r = a(n.target).closest(".slick-header-column", ".slick-header-columns");
						ka.onHeaderContextMenu(n, f[ka.getColumnIndex(r.data("fieldId"))])
					}
				}
				function Yb(n) {
					var r = a(n.target).closest(".slick-header-column");
					if (r.length != 0) {
						r = f[Xa(r[0])];
						if (ka.onHeaderClick && j.editorLock.commitCurrentEdit()) {
							n.preventDefault();
							ka.onHeaderClick(n, r)
						}
					}
				}
				function Zb(n) {
					if (j.enableAutoTooltips) {
						n = a(n.target).closest(".slick-cell", ya);
						if (n.length) if (n.innerWidth() < n[0].scrollWidth) {
							var r = a.trim(n.text());
							n.attr("title", j.toolTipMaxLength && r.length > j.toolTipMaxLength ? r.substr(0, j.toolTipMaxLength - 3) + "..." : r)
						} else n.attr("title", "")
					}
				}
				function Db(n, r) {
					return !(n < 0 || n >= Ka() || r < 0 || r >= f.length)
				}
				function pb(n, r) {
					for (var C = Math.floor((r + Fa) / j.rowHeight), K = 0, V = 0, Z = 0; Z < f.length && V < n; Z++) {
						V += f[Z].width;
						K++
					}
					return {
						row: C,
						cell: K - 1
					}
				}
				function Eb(n, r) {
					if (!Db(n, r)) return null;
					for (var C = n * j.rowHeight - Fa, K = C + j.rowHeight - 1, V = 0, Z = 0; Z < r; Z++) V += f[Z].width;
					return {
						top: C,
						left: V,
						bottom: K,
						right: V + f[r].width
					}
				}
				function Fb() {
					Jb(null, false)
				}
				function fb() {
					a(J).attr("tabIndex", 0).attr("hideFocus", true);
					if (a.browser.msie && parseInt(a.browser.version) < 8) {
						J.setActive();
						var n = a(J).position().left,
							r = n + a(J).outerWidth(),
							C = pa.scrollLeft(),
							K = C + pa.width();
						if (n < C) pa.scrollLeft(n);
						else r > K && pa.scrollLeft(Math.min(n, r - pa[0].clientWidth))
					} else J.focus()
				}
				function Jb(n, r) {
					if (J !== null) {
						Ja();
						a(J).removeClass("selected")
					}
					J = n;
					if (J !== null) {
						u = parseInt(a(J).parent().attr("row"), 10);
						z = Xa(J);
						a(J).addClass("selected");
						if (j.editable && r && Gb(u, z)) {
							clearTimeout(ca);
							if (j.asyncEditorLoading) ca = setTimeout(qb, j.asyncEditorLoadDelay);
							else qb()
						} else fb();
						ka.onCurrentCellChanged && ka.onCurrentCellChanged(Nb())
					} else z = u = null
				}
				function ub(n, r) {
					Jb(n, r);
					n ? Y([u]) : Y([]);
					ka.onSelectedRowsChanged && ka.onSelectedRowsChanged()
				}
				function Gb(n, r) {
					if (n < Ka() && !Ga(n)) return false;
					if (f[r].cannotTriggerInsert && n >= Ka()) return false;
					if (!(f[r].editor || j.editorFactory && j.editorFactory.getEditor(f[r]))) return false;
					return true
				}
				function Ja() {
					if (I) {
						ka.onBeforeCellEditorDestroy && ka.onBeforeCellEditorDestroy(I);
						I.destroy();
						I = null;
						if (J) {
							a(J).removeClass("editable invalid");
							if (Ga(u)) {
								var n = f[z];
								J.innerHTML = ja(n)(u, z, Ga(u)[n.field], n, Ga(u));
								bb(u)
							}
						}
						if (a.browser.msie) if (document.selection && document.selection.empty) document.selection.empty();
						else if (window.getSelection)(n = window.getSelection()) && n.removeAllRanges && n.removeAllRanges();
						j.editorLock.deactivate(T)
					}
				}
				function qb() {
					if (J) {
						if (!j.editable) throw "Grid : makeSelectedCellEditable : should never get called when options.editable is false";
						clearTimeout(ca);
						if (Gb(u, z)) if (ka.onBeforeEditCell && ka.onBeforeEditCell(u, z, Ga(u)) === false) fb();
						else {
							j.editorLock.activate(T);
							a(J).addClass("editable");
							J.innerHTML = "";
							var n = f[z],
								r = Ga(u);
							I = new(n.editor || j.editorFactory && j.editorFactory.getEditor(n))({
								grid: ka,
								gridPosition: vb(Ha[0]),
								position: vb(J),
								container: J,
								column: n,
								item: r || {},
								commitChanges: Kb,
								cancelChanges: Lb
							});
							r && I.loadValue(r);
							L = I.serializeValue();
							I.position && Mb()
						}
					}
				}
				function Kb() {
					if (j.editorLock.commitCurrentEdit()) {
						fb();
						j.autoEdit && gb()
					}
				}
				function Lb() {
					j.editorLock.cancelCurrentEdit() && fb()
				}
				function vb(n) {
					var r = {
						top: n.offsetTop,
						left: n.offsetLeft,
						bottom: 0,
						right: 0,
						width: a(n).outerWidth(),
						height: a(n).outerHeight(),
						visible: true
					};
					r.bottom = r.top + r.height;
					r.right = r.left + r.width;
					for (var C = n.offsetParent;
					(n = n.parentNode) != document.body;) {
						if (r.visible && n.scrollHeight != n.offsetHeight && a(n).css("overflowY") != "visible") r.visible = r.bottom > n.scrollTop && r.top < n.scrollTop + n.clientHeight;
						if (r.visible && n.scrollWidth != n.offsetWidth && a(n).css("overflowX") != "visible") r.visible = r.right > n.scrollLeft && r.left < n.scrollLeft + n.clientWidth;
						r.left -= n.scrollLeft;
						r.top -= n.scrollTop;
						if (n === C) {
							r.left += n.offsetLeft;
							r.top += n.offsetTop;
							C = n.offsetParent
						}
						r.bottom = r.top + r.height;
						r.right = r.left + r.width
					}
					return r
				}
				function wb() {
					return vb(J)
				}
				function Mb() {
					if (J) {
						var n;
						if (ka.onCurrentCellPositionChanged) {
							n = wb();
							ka.onCurrentCellPositionChanged(n)
						}
						if (I) {
							n = n || wb();
							if (I.show && I.hide) n.visible ? I.show() : I.hide();
							I.position && I.position(n)
						}
					}
				}
				function Nb() {
					return J ? {
						row: u,
						cell: z
					} : null
				}
				function sb(n, r) {
					var C = n * j.rowHeight,
						K = (n + 1) * j.rowHeight - Qa + (Rb ? g.height : 0);
					if ((n + 1) * j.rowHeight > sa + Qa + Fa) {
						ta(r ? C : K);
						Ta()
					} else if (n * j.rowHeight < sa + Fa) {
						ta(r ? K : C);
						Ta()
					}
				}
				function ib(n, r, C) {
					function K() {
						return !f[Xa(this)].unselectable
					}
					if (J && j.enableCellNavigation) if (j.editorLock.commitCurrentEdit()) {
						var V = aa[u + n],
							Z = V && z + r >= 0 ? a(V).children().eq(z + r).filter(K) : null;
						if (Z && !Z.length) {
							var fa = a(V).children().filter(function (Oa) {
								return r > 0 ? Oa > z + r : Oa < z + r
							}).filter(K);
							if (fa && fa.length) Z = r > 0 ? fa.eq(0) : fa.eq(fa.length - 1)
						}
						if (C && n === 0 && !(V && Z && Z.length)) if (!Z || !Z.length) {
							V = aa[u + n + (r > 0 ? 1 : -1)];
							fa = a(V).children().filter(K);
							Z = r > 0 ? V ? fa.eq(0) : null : V ? fa.eq(fa.length - 1) : null
						}
						if (V && Z && Z.length) {
							n = parseInt(a(V).attr("row"), 10);
							C = n == w();
							sb(n, !C);
							ub(Z[0], C || j.autoEdit);
							I || fb()
						} else fb()
					}
				}
				function lb(n, r, C) {
					if (!(n > Ka() || n < 0 || r >= f.length || r < 0)) if (!(!j.enableCellNavigation || f[r].unselectable)) if (j.editorLock.commitCurrentEdit()) {
						sb(n, false);
						var K = null;
						f[r].unselectable || (K = a(aa[n]).children().eq(r)[0]);
						ub(K, C || n === Ka() || j.autoEdit);
						I || fb()
					}
				}
				function cb() {
					ib(-1, 0, false)
				}

				function gb() {
					ib(1, 0, false)
				}
				function Ob() {
					ib(0, -1, false)
				}
				function Pb() {
					ib(0, 1, false)
				}
				function Ib() {
					ib(0, -1, true)
				}
				function Hb() {
					ib(0, 1, true)
				}
				function $b() {
					var n = Ga(u),
						r = f[z];
					if (I) {
						if (I.isValueChanged()) {
							var C = I.validate();
							if (C.valid) {
								if (u < Ka()) {
									C = {
										row: u,
										cell: z,
										editor: I,
										serializedValue: I.serializeValue(),
										prevSerializedValue: L,
										execute: function () {
											this.editor.applyValue(n, this.serializedValue);
											Ca(this.row)
										},
										undo: function () {
											this.editor.applyValue(n, this.prevSerializedValue);
											Ca(this.row)
										}
									};
									if (j.editCommandHandler) {
										Ja();
										j.editCommandHandler(n, r, C)
									} else {
										C.execute();
										Ja()
									}
									ka.onCellChange && ka.onCellChange(u, z, n)
								} else if (ka.onAddNewRow) {
									C = {};
									I.applyValue(C, I.serializeValue());
									Ja();
									ka.onAddNewRow(C, r)
								}
								return !j.editorLock.isActive()
							} else {
								a(J).addClass("invalid");
								a(J).stop(true, true).effect("highlight", {
									color: "red"
								}, 300);
								ka.onValidationError && ka.onValidationError(J, C, u, z, r);
								I.focus();
								return false
							}
						}
						Ja()
					}
					return true
				}
				function ac() {
					Ja();
					return true
				}
				var bc = {
					rowHeight: 25,
					defaultColumnWidth: 80,
					enableAddRow: false,
					leaveSpaceForNewRows: false,
					editable: false,
					autoEdit: true,
					enableCellNavigation: true,
					enableCellRangeSelection: false,
					enableColumnReorder: true,
					asyncEditorLoading: false,
					asyncEditorLoadDelay: 100,
					forceFitColumns: false,
					enableAsyncPostRender: false,
					asyncPostRenderDelay: 60,
					autoHeight: false,
					editorLock: Slick.GlobalEditorLock,
					showSecondaryHeaderRow: false,
					secondaryHeaderRowHeight: 25,
					syncColumnCellResize: false,
					enableAutoTooltips: true,
					toolTipMaxLength: null,
					formatterFactory: null,
					editorFactory: null,
					cellHighlightCssClass: "highlighted",
					cellFlashingCssClass: "flashing",
					multiSelect: true
				},
					db, Ka, Ga, Qb = {
						name: "",
						resizable: true,
						sortable: false,
						collapsable: false,
						minWidth: 30
					},
					xb, Va, $a, mb, nb, rb, hb = 0,
					Fa = 0,
					ab = 10,
					Sa = 1,
					Ha, yb = "slickgrid_" + Math.round(1E6 * Math.random()),
					ka = this,
					Ya, Pa, Ra, tb, pa, ya, Qa, jb, Rb, Ab, h, k, m, p, s, u, z, J = null,
					I = null,
					L, T, aa = {},
					ma = 0,
					la, qa = 0,
					sa = 0,
					za = 0,
					Na = 0,
					Ua = 10,
					t = [],
					H = {},
					P = {},
					N, O, Q = true,
					ca = null,
					ba = null,
					na = null,
					La = {},
					Da = null,
					Ba = null,
					y = 0,
					S = 0;
				this.debug = function () {
					var n = "";
					n += "\ncounter_rows_rendered:  " + y;
					n += "\ncounter_rows_removed:  " + S;
					n += "\nrenderedRows:  " + ma;
					n += "\nnumVisibleRows:  " + la;
					n += "\nmaxSupportedCssHeight:  " + xb;
					n += "\nn(umber of pages):  " + nb;
					n += "\n(current) page:  " + hb;
					n += "\npage height (ph):  " + mb;
					n += "\nscrollDir:  " + Sa;
					alert(n)
				};
				this.eval = function (n) {
					return eval(n)
				};
				(function () {
					Ha = a(e);
					db = b;
					Ka = db.getLength || w;
					Ga = db.getItem || E;
					xb = c;
					g = g || o();
					j = a.extend({}, bc, j);
					Qb.width = j.defaultColumnWidth;
					ab = _.orEqual(j.padding, ab);
					if (j.enableColumnReorder && !a.fn.sortable) throw Error('SlickGrid\'s "enableColumnReorder = true" option requires jquery-ui.sortable module to be loaded');
					T = {
						commitCurrentEdit: $b,
						cancelCurrentEdit: ac
					};
					Ha.empty().attr("tabIndex", 0).attr("hideFocus", true).css("overflow", "hidden").css("outline", 0).addClass(yb).addClass("ui-widget");
					/relative|absolute|fixed/.test(Ha.css("position")) || Ha.css("position", "relative");
					Ya = a("<div class='slick-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo(Ha);
					Pa = a("<div class='slick-header-columns' style='width:100000px; left:-10000px' />").appendTo(Ya);
					Ra = a("<div class='slick-header-secondary ui-state-default' style='overflow:hidden;position:relative;' />").appendTo(Ha);
					tb = a('<div class="slick-header-columns-secondary" style="width:100000px; height: ' + j.secondaryHeaderRowHeight + 'px;" />').appendTo(Ra);
					j.showSecondaryHeaderRow || Ra.hide();
					pa = a("<div class='slick-viewport' tabIndex='0' hideFocus style='width:100%; overflow-x:hidden; outline:0; position:relative; overflow-y:auto;'>").appendTo(Ha);
					ya = a("<div class='grid-canvas' tabIndex='0' hideFocus style='padding: " + ab + "px' />").appendTo(pa);
					R();
					pa.height(Ha.innerHeight() - Ya.outerHeight() - (j.showSecondaryHeaderRow ? Ra.outerHeight() : 0));
					v(Pa);
					pa.bind("selectstart.ui", function (n) {
						return a(n.target).is("input,textarea")
					});
					B();
					G();
					F();
					eb();
					A();
					pa.bind("scroll", Cb);
					Ha.bind("resize", eb);
					ya.bind("keydown", Ub);
					ya.bind("click", Vb);
					ya.bind("dblclick", Tb);
					ya.bind("contextmenu", Wb);
					ya.bind("mouseover", Zb);
					Ya.bind("contextmenu", Xb);
					Ya.bind("click", Yb)
				})();
				a.extend(this, {
					slickGridVersion: "1.4.2",
					onSort: null,
					onHeaderContextMenu: null,
					onClick: null,
					onDblClick: null,
					onContextMenu: null,
					onKeyDown: null,
					onAddNewRow: null,
					onValidationError: null,
					onViewportChanged: null,
					onSelectedRowsChanged: null,
					onColumnsReordered: null,
					onColumnsResized: null,
					onBeforeMoveRows: null,
					onMoveRows: null,
					onCellChange: null,
					onBeforeEditCell: null,
					onBeforeCellEditorDestroy: null,
					onBeforeDestroy: null,
					onCurrentCellChanged: null,
					onCurrentCellPositionChanged: null,
					onCellRangeSelected: null,
					getColumns: function () {
						return f
					},
					setColumns: ha,
					getOptions: function () {
						return j
					},
					setOptions: function (n) {
						if (j.editorLock.commitCurrentEdit()) {
							Ja();
							j.enableAddRow !== n.enableAddRow && ua(Ka());
							j = a.extend(j, n);
							Ta()
						}
					},
					setData: function (n, r) {
						U();
						db = b = n;
						Ka = db.getLength || w;
						Ga = db.getItem || E;
						r && ta(0)
					},
					destroy: function () {
						j.editorLock.cancelCurrentEdit();
						ka.onBeforeDestroy && ka.onBeforeDestroy();
						Pa.sortable && Pa.sortable("destroy");
						ya.parents().unbind("scroll.slickgrid");
						Ha.unbind("resize", ra);
						ya.unbind("draginit dragstart dragend drag");
						Ha.empty().removeClass(yb)
					},
					getColumnIndex: X,
					autosizeColumns: ea,
					updateCell: function (n, r) {
						if (aa[n]) {
							var C = a(aa[n]).children().eq(r);
							if (C.length !== 0) {
								var K = f[r],
									V = Ga(n);
								if (I && u === n && z === r) I.loadValue(V);
								else {
									C[0].innerHTML = V ? ja(K)(n, r, V[K.field], K, V) : "";
									bb(n)
								}
							}
						}
					},
					updateRow: Ca,
					removeRow: ua,
					removeRows: ia,
					removeAllRows: U,
					render: Ta,
					invalidate: function () {
						kb();
						U();
						Ta()
					},
					setHighlightedCells: function (n) {
						var r, C, K;
						for (var V in aa) for (r = 0; r < f.length; r++) {
							K = N && N[V] && N[V][f[r].id];
							C = n && n[V] && n[V][f[r].id];
							if (K != C) {
								C = a(aa[V]).children().eq(r);
								C.length && C.toggleClass(j.cellHighlightCssClass)
							}
						}
						N = n
					},
					flashCell: function (n, r, C) {
						C = C || 100;
						if (aa[n]) {
							var K = a(aa[n]).children().eq(r),
								V = function (Z) {
									Z && setTimeout(function () {
										K.queue(function () {
											K.toggleClass(j.cellFlashingCssClass).dequeue();
											V(Z - 1)
										})
									}, C)
								};
							V(4)
						}
					},
					getViewport: Za,
					resizeCanvas: ra,
					updateRowCount: kb,
					getCellFromPoint: pb,
					getCellFromEvent: function (n) {
						n = a(n.target).closest(".slick-cell", ya);
						if (!n.length) return null;
						return {
							row: n.parent().attr("row") | 0,
							cell: Xa(n[0])
						}
					},
					getCurrentCell: Nb,
					getCurrentCellNode: function () {
						return J
					},
					resetCurrentCell: Fb,
					navigatePrev: Ib,
					navigateNext: Hb,
					navigateUp: cb,
					navigateDown: gb,
					navigateLeft: Ob,
					navigateRight: Pb,
					gotoCell: lb,
					editCurrentCell: qb,
					getCellEditor: function () {
						return I
					},
					scrollRowIntoView: sb,
					getSelectedRows: l,
					setSelectedRows: Y,
					getSecondaryHeaderRow: function () {
						return tb[0]
					},
					showSecondaryHeaderRow: function () {
						j.showSecondaryHeaderRow = true;
						Ra.slideDown("fast", ra)
					},
					hideSecondaryHeaderRow: function () {
						j.showSecondaryHeaderRow = false;
						Ra.slideUp("fast", ra)
					},
					setSortColumn: M,
					getCurrentCellPosition: wb,
					getGridPosition: function () {
						return vb(Ha[0])
					},
					getScrollWidth: function () {
						return g.width
					},
					getEditController: function () {
						return T
					}
				})
			},
			EditorLock: d,
			GlobalEditorLock: new d
		}
	})
})(jQuery);

function EventHelper() {
	this.handlers = [];
	this.subscribe = function (a) {
		this.handlers.push(a)
	};
	this.notify = function (a) {
		for (var d = 0; d < this.handlers.length; d++) this.handlers[d].call(this, a)
	};
	return this
}(function (a) {
	a.extend(true, window, {
		Slick: {
			Data: {
				DataView: function () {
					function d() {
						v = {};
						newItems = [];
						for (var Y = 0, ha = 0, ta = o.length; Y < ta; Y++) {
							var ga = o[Y][j];
							if (!(ga == undefined || !F && v[ga] != undefined)) {
								newItems.push(o[Y]);
								v[ga] = ha;
								ha++
							}
						}
						o = newItems
					}
					function g() {
						return {
							pageSize: R,
							pageNum: X,
							totalRows: ea
						}
					}
					function c(Y, ha) {
						G = ha;
						x = Y;
						D = null;
						ha === false && o.reverse();
						o.sort(Y);
						ha === false && o.reverse();
						d();
						f()
					}
					function e(Y, ha) {
						G = ha;
						D = Y;
						x = null;
						var ta = Object.prototype.toString;
						Object.prototype.toString = typeof Y == "function" ? Y : function () {
							return this[Y]
						};
						ha === false && o.reverse();
						o.sort();
						Object.prototype.toString = ta;
						ha === false && o.reverse();
						d();
						f()
					}
					function b(Y, ha, ta, ga) {
						var ja = [];
						w = null;
						for (var xa = ha.length, U = 0, da = 0, ia, ua, Ca = 0, ra = Y.length; Ca < ra; ++Ca) {
							ia = Y[Ca];
							ua = ia[j];
							if (!ta || ta(ia)) {
								if (!R || U >= R * X && U < R * (X + 1)) {
									if (da >= xa || ua != ha[da][j] || ga && ga[ua]) ja[ja.length] = da;
									ha[da] = ia;
									da++
								}
								U++
							}
						}
						xa > da && ha.splice(da, xa - da);
						ea = U;
						return ja
					}
					function f() {
						if (!B) {
							var Y = q.length,
								ha = ea,
								ta = b(o, q, E, A);
							if (R && ea < X * R) {
								X = Math.floor(ea / R);
								ta = b(o, q, E, A)
							}
							A = null;
							ha != ea && l.notify(g());
							Y != q.length && W.notify({
								previous: Y,
								current: q.length
							});
							ta.length > 0 && M.notify(ta)
						}
					}
					var j = "id",
						o = [],
						q = [],
						v = {},
						w = null,
						E = null,
						A = null,
						B = false,
						G = true,
						x = null,
						D = null,
						F = false,
						R = 0,
						X = 0,
						ea = 0,
						W = new EventHelper,
						M = new EventHelper,
						l = new EventHelper;
					return {
						rows: q,
						beginUpdate: function () {
							B = true
						},
						endUpdate: function () {
							B = false;
							f()
						},
						setPagingOptions: function (Y) {
							if (Y.pageSize != undefined) R = Y.pageSize;
							if (Y.pageNum != undefined) X = Math.min(Y.pageNum, Math.ceil(ea / R));
							l.notify(g());
							f()
						},
						getPagingInfo: g,
						getItems: function () {
							return o
						},
						setItems: function (Y, ha) {
							if (ha !== undefined) j = ha;
							o = Y;
							d();
							f()
						},
						setFilter: function (Y) {
							E = Y;
							f()
						},
						setAllowDuplicates: function (Y) {
							F = Y ? true : false;
							f()
						},
						sort: c,
						fastSort: e,
						reSort: function () {
							if (x) c(x, G);
							else D && e(D, G)
						},
						getIdxById: function (Y) {
							return v[Y]
						},
						getRowById: function (Y) {
							if (!w) {
								w = {};
								for (var ha = 0, ta = q.length; ha < ta; ++ha) w[q[ha][j]] = ha
							}
							return w[Y]
						},
						getItemById: function (Y) {
							return o[v[Y]]
						},
						getItemByIdx: function (Y) {
							return o[Y]
						},
						refresh: f,
						updateItem: function (Y, ha) {
							if (!(v[Y] === undefined || Y !== ha[j])) {
								o[v[Y]] = ha;
								A || (A = {});
								A[Y] = true;
								f()
							}
						},
						insertItem: function (Y, ha) {
							o.splice(Y, 0, ha);
							d();
							f()
						},
						addItem: function (Y) {
							o.push(Y);
							d();
							f()
						},
						addItems: function (Y) {
							for (var ha = 0; ha < Y.length; ha++) o.push(Y[ha]);
							d();
							f()
						},
						deleteItem: function (Y) {
							if (v[Y] === undefined) throw "Invalid id";
							o.splice(v[Y], 1);
							d();
							f()
						},
						onRowCountChanged: W,
						onRowsChanged: M,
						onPagingInfoChanged: l
					}
				}
			}
		}
	})
})(jQuery);
var hexcase = 0,
	b64pad = "";

function hex_md5(a) {
	return rstr2hex(rstr_md5(str2rstr_utf8(a)))
}

function b64_md5(a) {
	return rstr2b64(rstr_md5(str2rstr_utf8(a)))
}
function any_md5(a, d) {
	return rstr2any(rstr_md5(str2rstr_utf8(a)), d)
}
function hex_hmac_md5(a, d) {
	return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(d)))
}
function b64_hmac_md5(a, d) {
	return rstr2b64(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(d)))
}
function any_hmac_md5(a, d, g) {
	return rstr2any(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(d)), g)
}

function md5_vm_test() {
	return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72"
}
function rstr_md5(a) {
	return binl2rstr(binl_md5(rstr2binl(a), a.length * 8))
}
function rstr_hmac_md5(a, d) {
	var g = rstr2binl(a);
	if (g.length > 16) g = binl_md5(g, a.length * 8);
	for (var c = Array(16), e = Array(16), b = 0; b < 16; b++) {
		c[b] = g[b] ^ 909522486;
		e[b] = g[b] ^ 1549556828
	}
	g = binl_md5(c.concat(rstr2binl(d)), 512 + d.length * 8);
	return binl2rstr(binl_md5(e.concat(g), 640))
}

function rstr2hex(a) {
	for (var d = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", g = "", c, e = 0; e < a.length; e++) {
		c = a.charCodeAt(e);
		g += d.charAt(c >>> 4 & 15) + d.charAt(c & 15)
	}
	return g
}
function rstr2b64(a) {
	for (var d = "", g = a.length, c = 0; c < g; c += 3) for (var e = a.charCodeAt(c) << 16 | (c + 1 < g ? a.charCodeAt(c + 1) << 8 : 0) | (c + 2 < g ? a.charCodeAt(c + 2) : 0), b = 0; b < 4; b++) d += c * 8 + b * 6 > a.length * 8 ? b64pad : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >>> 6 * (3 - b) & 63);
	return d
}

function rstr2any(a, d) {
	var g = d.length,
		c, e, b, f, j, o = Array(Math.ceil(a.length / 2));
	for (c = 0; c < o.length; c++) o[c] = a.charCodeAt(c * 2) << 8 | a.charCodeAt(c * 2 + 1);
	var q = Math.ceil(a.length * 8 / (Math.log(d.length) / Math.log(2))),
		v = Array(q);
	for (e = 0; e < q; e++) {
		j = [];
		for (c = f = 0; c < o.length; c++) {
			f = (f << 16) + o[c];
			b = Math.floor(f / g);
			f -= b * g;
			if (j.length > 0 || b > 0) j[j.length] = b
		}
		v[e] = f;
		o = j
	}
	g = "";
	for (c = v.length - 1; c >= 0; c--) g += d.charAt(v[c]);
	return g
}

function str2rstr_utf8(a) {
	a = a.toString();
	for (var d = "", g = -1, c, e; ++g < a.length;) {
		c = a.charCodeAt(g);
		e = g + 1 < a.length ? a.charCodeAt(g + 1) : 0;
		if (55296 <= c && c <= 56319 && 56320 <= e && e <= 57343) {
			c = 65536 + ((c & 1023) << 10) + (e & 1023);
			g++
		}
		if (c <= 127) d += String.fromCharCode(c);
		else if (c <= 2047) d += String.fromCharCode(192 | c >>> 6 & 31, 128 | c & 63);
		else if (c <= 65535) d += String.fromCharCode(224 | c >>> 12 & 15, 128 | c >>> 6 & 63, 128 | c & 63);
		else if (c <= 2097151) d += String.fromCharCode(240 | c >>> 18 & 7, 128 | c >>> 12 & 63, 128 | c >>> 6 & 63, 128 | c & 63)
	}
	return d
}

function str2rstr_utf16le(a) {
	for (var d = "", g = 0; g < a.length; g++) d += String.fromCharCode(a.charCodeAt(g) & 255, a.charCodeAt(g) >>> 8 & 255);
	return d
}
function str2rstr_utf16be(a) {
	for (var d = "", g = 0; g < a.length; g++) d += String.fromCharCode(a.charCodeAt(g) >>> 8 & 255, a.charCodeAt(g) & 255);
	return d
}
function rstr2binl(a) {
	for (var d = Array(a.length >> 2), g = 0; g < d.length; g++) d[g] = 0;
	for (g = 0; g < a.length * 8; g += 8) d[g >> 5] |= (a.charCodeAt(g / 8) & 255) << g % 32;
	return d
}

function binl2rstr(a) {
	for (var d = "", g = 0; g < a.length * 32; g += 8) d += String.fromCharCode(a[g >> 5] >>> g % 32 & 255);
	return d
}

function binl_md5(a, d) {
	a[d >> 5] |= 128 << d % 32;
	a[(d + 64 >>> 9 << 4) + 14] = d;
	for (var g = 1732584193, c = -271733879, e = -1732584194, b = 271733878, f = 0; f < a.length; f += 16) {
		var j = g,
			o = c,
			q = e,
			v = b;
		g = md5_ff(g, c, e, b, a[f + 0], 7, -680876936);
		b = md5_ff(b, g, c, e, a[f + 1], 12, -389564586);
		e = md5_ff(e, b, g, c, a[f + 2], 17, 606105819);
		c = md5_ff(c, e, b, g, a[f + 3], 22, -1044525330);
		g = md5_ff(g, c, e, b, a[f + 4], 7, -176418897);
		b = md5_ff(b, g, c, e, a[f + 5], 12, 1200080426);
		e = md5_ff(e, b, g, c, a[f + 6], 17, -1473231341);
		c = md5_ff(c, e, b, g, a[f + 7], 22, -45705983);
		g = md5_ff(g, c, e, b, a[f + 8], 7, 1770035416);
		b = md5_ff(b, g, c, e, a[f + 9], 12, -1958414417);
		e = md5_ff(e, b, g, c, a[f + 10], 17, -42063);
		c = md5_ff(c, e, b, g, a[f + 11], 22, -1990404162);
		g = md5_ff(g, c, e, b, a[f + 12], 7, 1804603682);
		b = md5_ff(b, g, c, e, a[f + 13], 12, -40341101);
		e = md5_ff(e, b, g, c, a[f + 14], 17, -1502002290);
		c = md5_ff(c, e, b, g, a[f + 15], 22, 1236535329);
		g = md5_gg(g, c, e, b, a[f + 1], 5, -165796510);
		b = md5_gg(b, g, c, e, a[f + 6], 9, -1069501632);
		e = md5_gg(e, b, g, c, a[f + 11], 14, 643717713);
		c = md5_gg(c, e, b, g, a[f + 0], 20, -373897302);
		g = md5_gg(g, c, e, b, a[f + 5], 5, -701558691);
		b = md5_gg(b, g, c, e, a[f + 10], 9, 38016083);
		e = md5_gg(e, b, g, c, a[f + 15], 14, -660478335);
		c = md5_gg(c, e, b, g, a[f + 4], 20, -405537848);
		g = md5_gg(g, c, e, b, a[f + 9], 5, 568446438);
		b = md5_gg(b, g, c, e, a[f + 14], 9, -1019803690);
		e = md5_gg(e, b, g, c, a[f + 3], 14, -187363961);
		c = md5_gg(c, e, b, g, a[f + 8], 20, 1163531501);
		g = md5_gg(g, c, e, b, a[f + 13], 5, -1444681467);
		b = md5_gg(b, g, c, e, a[f + 2], 9, -51403784);
		e = md5_gg(e, b, g, c, a[f + 7], 14, 1735328473);
		c = md5_gg(c, e, b, g, a[f + 12], 20, -1926607734);
		g = md5_hh(g, c, e, b, a[f + 5], 4, -378558);
		b = md5_hh(b, g, c, e, a[f + 8], 11, -2022574463);
		e = md5_hh(e, b, g, c, a[f + 11], 16, 1839030562);
		c = md5_hh(c, e, b, g, a[f + 14], 23, -35309556);
		g = md5_hh(g, c, e, b, a[f + 1], 4, -1530992060);
		b = md5_hh(b, g, c, e, a[f + 4], 11, 1272893353);
		e = md5_hh(e, b, g, c, a[f + 7], 16, -155497632);
		c = md5_hh(c, e, b, g, a[f + 10], 23, -1094730640);
		g = md5_hh(g, c, e, b, a[f + 13], 4, 681279174);
		b = md5_hh(b, g, c, e, a[f + 0], 11, -358537222);
		e = md5_hh(e, b, g, c, a[f + 3], 16, -722521979);
		c = md5_hh(c, e, b, g, a[f + 6], 23, 76029189);
		g = md5_hh(g, c, e, b, a[f + 9], 4, -640364487);
		b = md5_hh(b, g, c, e, a[f + 12], 11, -421815835);
		e = md5_hh(e, b, g, c, a[f + 15], 16, 530742520);
		c = md5_hh(c, e, b, g, a[f + 2], 23, -995338651);
		g = md5_ii(g, c, e, b, a[f + 0], 6, -198630844);
		b = md5_ii(b, g, c, e, a[f + 7], 10, 1126891415);
		e = md5_ii(e, b, g, c, a[f + 14], 15, -1416354905);
		c = md5_ii(c, e, b, g, a[f + 5], 21, -57434055);
		g = md5_ii(g, c, e, b, a[f + 12], 6, 1700485571);
		b = md5_ii(b, g, c, e, a[f + 3], 10, -1894986606);
		e = md5_ii(e, b, g, c, a[f + 10], 15, -1051523);
		c = md5_ii(c, e, b, g, a[f + 1], 21, -2054922799);
		g = md5_ii(g, c, e, b, a[f + 8], 6, 1873313359);
		b = md5_ii(b, g, c, e, a[f + 15], 10, -30611744);
		e = md5_ii(e, b, g, c, a[f + 6], 15, -1560198380);
		c = md5_ii(c, e, b, g, a[f + 13], 21, 1309151649);
		g = md5_ii(g, c, e, b, a[f + 4], 6, -145523070);
		b = md5_ii(b, g, c, e, a[f + 11], 10, -1120210379);
		e = md5_ii(e, b, g, c, a[f + 2], 15, 718787259);
		c = md5_ii(c, e, b, g, a[f + 9], 21, -343485551);
		g = safe_add(g, j);
		c = safe_add(c, o);
		e = safe_add(e, q);
		b = safe_add(b, v)
	}
	return Array(g, c, e, b)
}
function md5_cmn(a, d, g, c, e, b) {
	return safe_add(bit_rol(safe_add(safe_add(d, a), safe_add(c, b)), e), g)
}
function md5_ff(a, d, g, c, e, b, f) {
	return md5_cmn(d & g | ~d & c, a, d, e, b, f)
}
function md5_gg(a, d, g, c, e, b, f) {
	return md5_cmn(d & c | g & ~c, a, d, e, b, f)
}

function md5_hh(a, d, g, c, e, b, f) {
	return md5_cmn(d ^ g ^ c, a, d, e, b, f)
}
function md5_ii(a, d, g, c, e, b, f) {
	return md5_cmn(g ^ (d | ~c), a, d, e, b, f)
}
function safe_add(a, d) {
	var g = (a & 65535) + (d & 65535);
	return (a >> 16) + (d >> 16) + (g >> 16) << 16 | g & 65535
}
function bit_rol(a, d) {
	return a << d | a >>> 32 - d
}
hexcase = 0;
b64pad = "";

function hex_sha1(a) {
	return rstr2hex(rstr_sha1(str2rstr_utf8(a)))
}
function b64_sha1(a) {
	return rstr2b64(rstr_sha1(str2rstr_utf8(a)))
}
function any_sha1(a, d) {
	return rstr2any(rstr_sha1(str2rstr_utf8(a)), d)
}

function hex_hmac_sha1(a, d) {
	return rstr2hex(rstr_hmac_sha1(str2rstr_utf8(a), str2rstr_utf8(d)))
}
function b64_hmac_sha1(a, d) {
	return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(a), str2rstr_utf8(d)))
}
function any_hmac_sha1(a, d, g) {
	return rstr2any(rstr_hmac_sha1(str2rstr_utf8(a), str2rstr_utf8(d)), g)
}
function sha1_vm_test() {
	return hex_sha1("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d"
}
function rstr_sha1(a) {
	return binb2rstr(binb_sha1(rstr2binb(a), a.length * 8))
}

function rstr_hmac_sha1(a, d) {
	var g = rstr2binb(a);
	if (g.length > 16) g = binb_sha1(g, a.length * 8);
	for (var c = Array(16), e = Array(16), b = 0; b < 16; b++) {
		c[b] = g[b] ^ 909522486;
		e[b] = g[b] ^ 1549556828
	}
	g = binb_sha1(c.concat(rstr2binb(d)), 512 + d.length * 8);
	return binb2rstr(binb_sha1(e.concat(g), 672))
}
function rstr2hex(a) {
	for (var d = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", g = "", c, e = 0; e < a.length; e++) {
		c = a.charCodeAt(e);
		g += d.charAt(c >>> 4 & 15) + d.charAt(c & 15)
	}
	return g
}

function rstr2b64(a) {
	for (var d = "", g = a.length, c = 0; c < g; c += 3) for (var e = a.charCodeAt(c) << 16 | (c + 1 < g ? a.charCodeAt(c + 1) << 8 : 0) | (c + 2 < g ? a.charCodeAt(c + 2) : 0), b = 0; b < 4; b++) d += c * 8 + b * 6 > a.length * 8 ? b64pad : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >>> 6 * (3 - b) & 63);
	return d
}

function rstr2any(a, d) {
	var g = d.length,
		c = [],
		e, b, f, j, o = Array(Math.ceil(a.length / 2));
	for (e = 0; e < o.length; e++) o[e] = a.charCodeAt(e * 2) << 8 | a.charCodeAt(e * 2 + 1);
	for (; o.length > 0;) {
		j = [];
		for (e = f = 0; e < o.length; e++) {
			f = (f << 16) + o[e];
			b = Math.floor(f / g);
			f -= b * g;
			if (j.length > 0 || b > 0) j[j.length] = b
		}
		c[c.length] = f;
		o = j
	}
	g = "";
	for (e = c.length - 1; e >= 0; e--) g += d.charAt(c[e]);
	c = Math.ceil(a.length * 8 / (Math.log(d.length) / Math.log(2)));
	for (e = g.length; e < c; e++) g = d[0] + g;
	return g
}

function str2rstr_utf8(a) {
	for (var d = "", g = -1, c, e; ++g < a.length;) {
		c = a.charCodeAt(g);
		e = g + 1 < a.length ? a.charCodeAt(g + 1) : 0;
		if (55296 <= c && c <= 56319 && 56320 <= e && e <= 57343) {
			c = 65536 + ((c & 1023) << 10) + (e & 1023);
			g++
		}
		if (c <= 127) d += String.fromCharCode(c);
		else if (c <= 2047) d += String.fromCharCode(192 | c >>> 6 & 31, 128 | c & 63);
		else if (c <= 65535) d += String.fromCharCode(224 | c >>> 12 & 15, 128 | c >>> 6 & 63, 128 | c & 63);
		else if (c <= 2097151) d += String.fromCharCode(240 | c >>> 18 & 7, 128 | c >>> 12 & 63, 128 | c >>> 6 & 63, 128 | c & 63)
	}
	return d
}

function str2rstr_utf16le(a) {
	for (var d = "", g = 0; g < a.length; g++) d += String.fromCharCode(a.charCodeAt(g) & 255, a.charCodeAt(g) >>> 8 & 255);
	return d
}
function str2rstr_utf16be(a) {
	for (var d = "", g = 0; g < a.length; g++) d += String.fromCharCode(a.charCodeAt(g) >>> 8 & 255, a.charCodeAt(g) & 255);
	return d
}
function rstr2binb(a) {
	for (var d = Array(a.length >> 2), g = 0; g < d.length; g++) d[g] = 0;
	for (g = 0; g < a.length * 8; g += 8) d[g >> 5] |= (a.charCodeAt(g / 8) & 255) << 24 - g % 32;
	return d
}

function binb2rstr(a) {
	for (var d = "", g = 0; g < a.length * 32; g += 8) d += String.fromCharCode(a[g >> 5] >>> 24 - g % 32 & 255);
	return d
}

function binb_sha1(a, d) {
	a[d >> 5] |= 128 << 24 - d % 32;
	a[(d + 64 >> 9 << 4) + 15] = d;
	for (var g = Array(80), c = 1732584193, e = -271733879, b = -1732584194, f = 271733878, j = -1009589776, o = 0; o < a.length; o += 16) {
		for (var q = c, v = e, w = b, E = f, A = j, B = 0; B < 80; B++) {
			g[B] = B < 16 ? a[o + B] : bit_rol(g[B - 3] ^ g[B - 8] ^ g[B - 14] ^ g[B - 16], 1);
			var G = safe_add(safe_add(bit_rol(c, 5), sha1_ft(B, e, b, f)), safe_add(safe_add(j, g[B]), sha1_kt(B)));
			j = f;
			f = b;
			b = bit_rol(e, 30);
			e = c;
			c = G
		}
		c = safe_add(c, q);
		e = safe_add(e, v);
		b = safe_add(b, w);
		f = safe_add(f, E);
		j = safe_add(j, A)
	}
	return Array(c, e, b, f, j)
}
function sha1_ft(a, d, g, c) {
	if (a < 20) return d & g | ~d & c;
	if (a < 40) return d ^ g ^ c;
	if (a < 60) return d & g | d & c | g & c;
	return d ^ g ^ c
}
function sha1_kt(a) {
	return a < 20 ? 1518500249 : a < 40 ? 1859775393 : a < 60 ? -1894007588 : -899497514
}
function safe_add(a, d) {
	var g = (a & 65535) + (d & 65535);
	return (a >> 16) + (d >> 16) + (g >> 16) << 16 | g & 65535
}
function bit_rol(a, d) {
	return a << d | a >>> 32 - d
}
Date.prototype.format = function (a) {
	for (var d = "", g = Date.replaceChars, c = 0; c < a.length; c++) {
		var e = a.charAt(c);
		d += g[e] ? g[e].call(this) : e
	}
	return d
};
Date.replaceChars = {
	shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	longMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	longDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	d: function () {
		return (this.getDate() < 10 ? "0" : "") + this.getDate()
	},
	D: function () {
		return Date.replaceChars.shortDays[this.getDay()]
	},
	j: function () {
		return this.getDate()
	},
	l: function () {
		return Date.replaceChars.longDays[this.getDay()]
	},
	N: function () {
		return this.getDay() + 1
	},
	S: function () {
		return this.getDate() % 10 == 1 && this.getDate() != 11 ? "st" : this.getDate() % 10 == 2 && this.getDate() != 12 ? "nd" : this.getDate() % 10 == 3 && this.getDate() != 13 ? "rd" : "th"
	},
	w: function () {
		return this.getDay()
	},
	z: function () {
		return "Not Yet Supported"
	},
	W: function () {
		return "Not Yet Supported"
	},
	F: function () {
		return Date.replaceChars.longMonths[this.getMonth()]
	},
	m: function () {
		return (this.getMonth() < 9 ? "0" : "") + (this.getMonth() + 1)
	},
	M: function () {
		return Date.replaceChars.shortMonths[this.getMonth()]
	},
	n: function () {
		return this.getMonth() + 1
	},
	t: function () {
		return "Not Yet Supported"
	},
	L: function () {
		return this.getFullYear() % 4 == 0 && this.getFullYear() % 100 != 0 || this.getFullYear() % 400 == 0 ? "1" : "0"
	},
	o: function () {
		return "Not Supported"
	},
	Y: function () {
		return this.getFullYear()
	},
	y: function () {
		return ("" + this.getFullYear()).substr(2)
	},
	a: function () {
		return this.getHours() < 12 ? "am" : "pm"
	},
	A: function () {
		return this.getHours() < 12 ? "AM" : "PM"
	},
	B: function () {
		return "Not Yet Supported"
	},
	g: function () {
		return this.getHours() % 12 || 12
	},
	G: function () {
		return this.getHours()
	},
	h: function () {
		return ((this.getHours() % 12 || 12) < 10 ? "0" : "") + (this.getHours() % 12 || 12)
	},
	H: function () {
		return (this.getHours() < 10 ? "0" : "") + this.getHours()
	},
	i: function () {
		return (this.getMinutes() < 10 ? "0" : "") + this.getMinutes()
	},
	s: function () {
		return (this.getSeconds() < 10 ? "0" : "") + this.getSeconds()
	},
	e: function () {
		return "Not Yet Supported"
	},
	I: function () {
		return "Not Supported"
	},
	O: function () {
		return (-this.getTimezoneOffset() < 0 ? "-" : "+") + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? "0" : "") + Math.abs(this.getTimezoneOffset() / 60) + "00"
	},
	P: function () {
		return (-this.getTimezoneOffset() < 0 ? "-" : "+") + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? "0" : "") + Math.abs(this.getTimezoneOffset() / 60) + ":" + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? "0" : "") + Math.abs(this.getTimezoneOffset() % 60)
	},
	T: function () {
		var a = this.getMonth();
		this.setMonth(0);
		var d = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, "$1");
		this.setMonth(a);
		return d
	},
	Z: function () {
		return -this.getTimezoneOffset() * 60
	},
	c: function () {
		return this.format("Y-m-d") + "T" + this.format("H:i:sP")
	},
	r: function () {
		return this.toString()
	},
	U: function () {
		return this.getTime() / 1E3
	}
};
(function (a) {
	a.GrowingInput = function (g, c) {
		var e, b, f;
		c = a.extend({
			min: 0,
			max: null,
			maxWidth: null,
			startWidth: 30,
			correction: 45
		}, c);
		g = a(g).data("growing", this);
		var j = this,
			o = function (v) {
				f.text(v);
				v = f.width();
				return (v ? v : c.startWidth) + c.correction
			},
			q = function () {
				b = e;
				var v = e = g.val();
				if ((c.min || c.min === 0) && e.length < c.min) {
					if ((b || b === 0) && b.length <= c.min) return;
					v = d(e, c.min, "-")
				} else if ((c.max || c.max === 0) && e.length > c.max) {
					if ((b || b === 0) && b.length >= c.max) return;
					v = e.substr(0, c.max)
				}
				c.maxWidth ? g.width(Math.min(c.maxWidth, o(v))) : g.width(o(v));
				return j
			};
		this.resize = q;
		(function () {
			f = a("<span></span>").css({
				"float": "left",
				display: "inline-block",
				position: "absolute",
				left: -1000
			}).insertAfter(g);
			a.each(["font-size", "font-family", "padding-left", "padding-top", "padding-bottom", "padding-right", "border-left", "border-right", "border-top", "border-bottom", "word-spacing", "letter-spacing", "text-indent", "text-transform"], function (v, w) {
				f.css(w, g.css(w))
			});
			g.blur(q).keyup(q).keydown(q).keypress(q);
			q()
		})()
	};
	var d = function (g, c, e, b) {
		if (g.length >= c) return this;
		e = e || " ";
		c = Array(c - g.length + 1).join(e).substr(0, c - g.length);
		if (!b || b == "right") return g + c;
		if (b == "left") return c + g;
		return c.substr(0, (c.length / 2).floor()) + g + c.substr(0, (c.length / 2).ceil())
	}
})(jQuery);
(function (a) {
	a.TextboxList = function (e, b) {
		var f, j, o, q, v = false,
			w = [],
			E, A = {},
			B = a.extend(true, {
				prefix: "textboxlist",
				max: null,
				unique: false,
				uniqueInsensitive: true,
				endEditableBit: true,
				startEditableBit: true,
				hideEditableBits: true,
				inBetweenEditableBits: true,
				keys: {
					previous: 37,
					next: 39
				},
				bitsOptions: {
					editable: {},
					box: {}
				},
				plugins: {},
				encode: function (U) {
					return a.grep(a.map(U, function (da) {
						da = d(da[0]) ? da[0] : da[1];
						return d(da) ? da.toString().replace(/,/, "") : null
					}), function (da) {
						return da != undefined
					}).join(",")
				},
				decode: function (U) {
					return U.split(",")
				}
			}, b);
		e = a(e);
		var G = this,
			x = function (U, da) {
				G.plugins[U] = new(a.TextboxList[g(c(U))])(G, da)
			},
			D = function () {
				B.endEditableBit && F("editable", null, {
					tabIndex: f.tabIndex
				}).inject(o);
				ga("bitAdd", ta, true);
				ga("bitRemove", ta, true);
				a(document).click(function (U) {
					if (v) {
						if (U.target.className.indexOf(B.prefix) != -1) {
							if (U.target == a(j).get(0)) return;
							if (a(U.target).parents("div." + B.prefix).get(0) == j.get(0)) return
						}
						M()
					}
				}).keydown(function (U) {
					if (v && q) {
						var da = q.is("editable") ? q.getCaret() : null,
							ia = q.getValue()[1],
							ua = !! a.map(["shift", "alt", "meta", "ctrl"], function (ra) {
								return U[ra]
							}).length || q.is("editable") && q.isSelected(),
							Ca = function () {
								U.stopPropagation();
								U.preventDefault()
							};
						switch (U.which) {
						case 8:
							if (q.is("box")) {
								Ca();
								return q.remove()
							}
						case B.keys.previous:
							if (q.is("box") || (da == 0 || !ia.length) && !ua) {
								Ca();
								ea("prev")
							}
							break;
						case 46:
							if (q.is("box")) {
								Ca();
								return q.remove()
							}
						case B.keys.next:
							if (q.is("box") || da == ia.length && !ua) {
								Ca();
								ea("next")
							}
						}
					}
				});
				ha(B.decode(f.val()))
			},
			F = function (U, da, ia) {
				if (U == "box") {
					if (d(B.max) && o.children("." + B.prefix + "-bit-box").length + 1 > B.max) return false;
					if (B.unique && a.inArray(R(da), w) != -1) return false
				}
				return new a.TextboxListBit(U, da, G, a.extend(true, B.bitsOptions[U], ia))
			},
			R = function (U) {
				return d(U[0]) ? U[0] : B.uniqueInsensitive ? U[1].toLowerCase() : U[1]
			},
			X = function (U, da, ia, ua) {
				if (U = F("box", [da, U, ia])) {
					if (!ua || !ua.length) ua = o.find("." + B.prefix + "-bit-box").filter(":last");
					U.inject(ua.length ? ua : o, ua.length ? "after" : "top")
				}
				return G
			},
			ea = function (U, da) {
				var ia = l(da && a(da).length ? da : q).toElement();
				(ia = l(ia[U]())) && ia.focus();
				return G
			},
			W = function () {
				var U = o.children().filter(":last");
				U && l(U).focus();
				return G
			},
			M = function () {
				if (!v) return G;
				q && q.blur();
				v = false;
				return ja("blur")
			},
			l = function (U) {
				return U.type && (U.type == "editable" || U.type == "box") ? U : a(U).data("textboxlist:bit")
			},
			Y = function () {
				var U = [];
				o.children().each(function () {
					var da = l(this);
					da.is("editable") || U.push(da.getValue())
				});
				return U
			},
			ha = function (U) {
				U && a.each(U, function (da, ia) {
					if (ia) X.apply(G, a.isArray(ia) ? [ia[1], ia[0], ia[2]] : [ia])
				})
			},
			ta = function () {
				f.val(B.encode(Y()))
			},
			ga = function (U, da) {
				if (A[U] == undefined) A[U] = [];
				var ia = false;
				a.each(A[U], function (ua) {
					if (ua === da) ia = true
				});
				ia || A[U].push(da);
				return G
			},
			ja = function (U, da, ia) {
				if (!A || !A[U]) return G;
				a.each(A[U], function (ua, Ca) {
					(function () {
						da = da != undefined ? a.isArray(da) ? da : [da] : Array.prototype.slice.call(arguments);
						var ra = function () {
							return Ca.apply(G || null, da)
						};
						if (ia) return setTimeout(ra, ia);
						return ra()
					})()
				});
				return G
			},
			xa = function (U) {
				return a.inArray(R(U), w)
			};
		this.onFocus = function (U) {
			q && q.blur();
			clearTimeout(E);
			q = U;
			j.addClass(B.prefix + "-focus");
			if (!v) {
				v = true;
				ja("focus", U)
			}
		};
		this.onAdd = function (U) {
			B.unique && U.is("box") && w.push(R(U.getValue()));
			if (U.is("box")) if ((U = l(U.toElement().prev())) && U.is("box") && B.inBetweenEditableBits || !U && B.startEditableBit) {
				U = U && U.toElement().length ? U.toElement() : false;
				U = F("editable").inject(U || o, U ? "after" : "top");
				B.hideEditableBits && U.hide()
			}
		};
		this.onRemove = function (U) {
			if (v) {
				if (B.unique && U.is("box")) {
					var da = xa(U.getValue());
					if (da != -1) w = w.splice(da + 1, 1)
				}(da = l(U.toElement().prev())) && da.is("editable") && da.remove();
				ea("next", U)
			}
		};
		this.onBlur = function (U, da) {
			q = null;
			j.removeClass(B.prefix + "-focus");
			E = setTimeout(M, da ? 0 : 200)
		};
		this.setOptions = function (U) {
			B = a.extend(true, B, U)
		};
		this.getOptions = function () {
			return B
		};
		this.getContainer = function () {
			return j
		};
		this.isDuplicate = xa;
		this.addEvent = ga;
		this.removeEvent = function (U, da) {
			if (A[U]) for (var ia = A[U].length; ia--;) A[U][ia] === da && A[U].splice(ia, 1);
			return G
		};
		this.fireEvent = ja;
		this.create = F;
		this.add = X;
		this.getValues = Y;
		this.plugins = [];
		(function () {
			f = e.css("display", "none").attr("autocomplete", "off").focus(W);
			j = a('<div class="' + B.prefix + '" />').insertAfter(e).click(function (da) {
				if ((da.target == o.get(0) || da.target == j.get(0)) && (!v || q && q.toElement().get(0) != o.find(":last-child").get(0))) W()
			});
			o = a('<ul class="' + B.prefix + '-bits" />').appendTo(j);
			for (var U in B.plugins) x(U, B.plugins[U]);
			D()
		})()
	};
	a.TextboxListBit = function (e, b, f, j) {
		var o, q, v, w, E, A = false,
			B = c(e),
			G = a.extend(true, e == "box" ? {
				deleteButton: true
			} : {
				tabIndex: null,
				growing: true,
				growingOptions: {},
				stopEnter: true,
				addOnBlur: false,
				addKeys: [13, 188]
			}, j);
		this.type = e;
		this.value = b;
		var x = this,
			D = function (l) {
				if (A) return x;
				X();
				A = true;
				f.onFocus(x);
				q.addClass(v + "-focus").addClass(v + "-" + e + "-focus");
				W("focus");
				e == "editable" && !l && o.focus();
				return x
			},
			F = function (l) {
				if (!A) return x;
				A = false;
				f.onBlur(x);
				q.removeClass(v + "-focus").removeClass(v + "-" + e + "-focus");
				W("blur");
				if (e == "editable") {
					l || o.blur();
					E && !o.val().length && ea()
				}
				return x
			},
			R = function () {
				F();
				f.onRemove(x);
				q.remove();
				return W("remove")
			},
			X = function () {
				q.css("display", "block");
				return x
			},
			ea = function () {
				q.css("display", "none");
				E = true;
				return x
			},
			W = function (l) {
				l = c(l);
				f.fireEvent("bit" + l, x).fireEvent("bit" + B + l, x);
				return x
			};
		this.is = function (l) {
			return e == l
		};
		this.setValue = function (l) {
			if (e == "editable") {
				o.val(d(l[0]) ? l[0] : l[1]);
				G.growing && o.data("growing").resize()
			} else b = l;
			return x
		};
		this.getValue = function () {
			return e == "editable" ? [null, o.val(), null] : b
		};
		if (e == "editable") {
			this.getCaret = function () {
				var l = o.get(0);
				if (l.createTextRange) {
					var Y = document.selection.createRange().duplicate();
					Y.moveEnd("character", l.value.length);
					if (Y.text === "") return l.value.length;
					return l.value.lastIndexOf(Y.text)
				} else return l.selectionStart
			};
			this.getCaretEnd = function () {
				var l = o.get(0);
				if (l.createTextRange) {
					var Y = document.selection.createRange().duplicate();
					Y.moveStart("character", -l.value.length);
					return Y.text.length
				} else return l.selectionEnd
			};
			this.isSelected = function () {
				return A && x.getCaret() !== x.getCaretEnd()
			};
			var M = function () {
				var l = x.getValue();
				if (l = f.create("box", l)) {
					l.inject(q, "before");
					x.setValue([null, "", null]);
					return l
				}
				return null
			};
			this.toBox = M
		}
		this.toElement = function () {
			return q
		};
		this.focus = D;
		this.blur = F;
		this.remove = R;
		this.inject = function (l, Y) {
			switch (Y || "bottom") {
			case "top":
				q.prependTo(l);
				break;
			case "bottom":
				q.appendTo(l);
				break;
			case "before":
				q.insertBefore(l);
				break;
			case "after":
				q.insertAfter(l);
				break
			}
			f.onAdd(x);
			return W("add")
		};
		this.show = X;
		this.hide = ea;
		this.fireBitEvent = W;
		(function () {
			v = f.getOptions().prefix + "-bit";
			w = v + "-" + e;
			q = a("<li />").addClass(v).addClass(w).data("textboxlist:bit", x).hover(function () {
				q.addClass(v + "-hover").addClass(w + "-hover")
			}, function () {
				q.removeClass(v + "-hover").removeClass(w + "-hover")
			});
			if (e == "box") {
				q.html(d(x.value[2]) ? x.value[2] : x.value[1]).click(D);
				if (G.deleteButton) {
					q.addClass(w + "-deletable");
					a('<a href="#" class="' + w + '-deletebutton" />').click(R).appendTo(q)
				}
				q.children().click(function (l) {
					l.stopPropagation();
					l.preventDefault()
				})
			} else {
				o = a('<input type="text" class="' + w + '-input" autocomplete="off" />').val(x.value ? x.value[1] : "").appendTo(q);
				if (d(G.tabIndex)) o.tabIndex = G.tabIndex;
				G.growing && new a.GrowingInput(o, G.growingOptions);
				o.focus(function () {
					D(true)
				}).blur(function () {
					F(true);
					G.addOnBlur && M()
				});
				if (G.addKeys || G.stopEnter) o.keydown(function (l) {
					if (A) {
						if (G.stopEnter && l.which === 13) {
							l.stopPropagation();
							l.preventDefault()
						}
						if (a.inArray(l.which, a.isArray(G.addKeys) ? G.addKeys : [G.addKeys]) != -1) {
							l.stopPropagation();
							l.preventDefault();
							M()
						}
					}
				})
			}
		})()
	};
	var d = function (e) {
		return !!(e || e === 0)
	},
		g = function (e) {
			return e.replace(/-\D/g, function (b) {
				return b.charAt(1).toUpperCase()
			})
		},
		c = function (e) {
			return e.replace(/\b[a-z]/g, function (b) {
				return b.toUpperCase()
			})
		};
	a.fn.extend({
		textboxlist: function (e) {
			return this.each(function () {
				new a.TextboxList(this, e)
			})
		}
	})
})(jQuery);
(function () {
	$.TextboxList.Autocomplete = function (d, g) {
		var c, e, b, f, j = [],
			o = [],
			q = false,
			v, w, E, A, B, G, x = $.extend(true, {
				minLength: 1,
				maxResults: 5,
				insensitive: true,
				highlight: true,
				highlightSelector: null,
				mouseInteraction: true,
				onlyFromValues: false,
				queryRemote: false,
				remote: {
					url: "",
					param: "search",
					extraParams: {},
					loadPlaceholder: "Please wait..."
				},
				method: "standard",
				placeholder: "Type to receive suggestions"
			}, g),
			D = function (ga) {
				ga.toElement().keydown(ta).keyup(function () {
					F()
				})
			},
			F = function (ga) {
				if (ga) w = ga;
				if (x.queryRemote || j.length) {
					var ja = $.trim(w.getValue()[1]);
					ja.length < x.minLength && q && q.css("display", "block");
					if (ja != B) {
						B = ja;
						f.css("display", "none");
						if (!(ja.length < x.minLength)) {
							if (x.queryRemote) if (o[ja]) j = o[ja];
							else {
								ga = x.remote.extraParams;
								ga[x.remote.param] = ja;
								G && G.abort();
								G = $.ajax({
									url: x.remote.url,
									data: ga,
									dataType: "json",
									success: function (xa) {
										j = o[ja] = xa;
										R(ja)
									}
								})
							}
							R(ja)
						}
					}
				}
			},
			R = function (ga) {
				var ja = e.filter(j, ga, x.insensitive, x.maxResults);
				if (d.getOptions().unique) ja = $.grep(ja, function (xa) {
					return d.isDuplicate(xa) == -1
				});
				W();
				if (ja.length) {
					l();
					f.empty().css("display", "block");
					$.each(ja, function (xa, U) {
						X(U, ga)
					});
					x.onlyFromValues && M(f.find(":first"));
					ja = ja
				}
			},
			X = function (ga, ja) {
				var xa = $('<li class="' + c + '-result" />').html(ga[3] ? ga[3] : ga[1]).data("textboxlist:auto:value", ga);
				xa.appendTo(f);
				if (x.highlight) $(x.highlightSelector ? xa.find(x.highlightSelector) : xa).each(function () {
					$(this).html() && e.highlight($(this), ja, x.insensitive, c + "-highlight")
				});
				if (x.mouseInteraction) {
					xa.css("cursor", "pointer").hover(function () {
						M(xa)
					}).mousedown(function (U) {
						U.stopPropagation();
						U.preventDefault();
						clearTimeout(E);
						A = true
					}).mouseup(function () {
						if (A) {
							ha();
							w.focus();
							F();
							A = false
						}
					});
					x.onlyFromValues || xa.mouseleave(function () {
						v && v.get(0) == xa.get(0) && l()
					})
				}
			},
			ea = function () {
				E = setTimeout(function () {
					W();
					f.css("display", "none");
					B = null
				}, $.browser.msie ? 150 : 0)
			},
			W = function () {
				q && q.css("display", "none")
			},
			M = function (ga) {
				if (ga && ga.length) {
					l();
					v = ga.addClass(c + "-result-focus")
				}
			},
			l = function () {
				if (v && v.length) {
					v.removeClass(c + "-result-focus");
					v = null
				}
			},
			Y = function (ga) {
				if (!v || !v.length) return self;
				return M(v[ga]())
			},
			ha = function () {
				var ga = v.data("textboxlist:auto:value"),
					ja = d.create("box", ga.slice(0, 3));
				if (ja) {
					ja.autoValue = ga;
					$.isArray(void 0) && (void 0).push(ga);
					w.setValue([null, "", null]);
					ja.inject(w.toElement(), "before")
				}
				l();
				return self
			},
			ta = function (ga) {
				var ja = function () {
					ga.stopPropagation();
					ga.preventDefault()
				};
				switch (ga.which) {
				case 38:
					ja();
					!x.onlyFromValues && v && v.get(0) === f.find(":first").get(0) ? l() : Y("prev");
					break;
				case 40:
					ja();
					v && v.length ? Y("next") : M(f.find(":first"));
					break;
				case 13:
					ja();
					if (v && v.length) ha();
					else if (!x.onlyFromValues) {
						ja = w.getValue();
						if (ja = d.create("box", ja)) {
							ja.inject(w.toElement(), "before");
							w.setValue([null, "", null])
						}
					}
				}
			};
		this.setValues = function (ga) {
			j = ga
		};
		(function () {
			d.addEvent("bitEditableAdd", D).addEvent("bitEditableFocus", F).addEvent("bitEditableBlur", ea).setOptions({
				bitsOptions: {
					editable: {
						addKeys: false,
						stopEnter: false
					}
				}
			});
			$.browser.msie && d.setOptions({
				bitsOptions: {
					editable: {
						addOnBlur: false
					}
				}
			});
			c = d.getOptions().prefix + "-autocomplete";
			e = $.TextboxList.Autocomplete.Methods[x.method];
			b = $('<div class="' + c + '" />').appendTo(d.getContainer());
			if (x.placeholder || x.placeholder === 0) q = $('<div class="' + c + '-placeholder" />').html(x.placeholder).appendTo(b);
			f = $('<ul class="' + c + '-results" />').appendTo(b).click(function (ga) {
				ga.stopPropagation();
				ga.preventDefault()
			})
		})()
	};
	$.TextboxList.Autocomplete.Methods = {
		standard: {
			filter: function (d, g, c, e) {
				var b = [];
				g = RegExp("\\b" + a(g), c ? "i" : "");
				for (c = 0; c < d.length; c++) {
					if (b.length === e) break;
					g.test(d[c][1]) && b.push(d[c])
				}
				return b
			},
			highlight: function (d, g, c, e) {
				g = RegExp("(<[^>]*>)|(\\b" + a(g) + ")", c ? "ig" : "g");
				return d.html(d.html().replace(g, function (b, f, j) {
					return b.charAt(0) == "<" ? b : '<strong class="' + e + '">' + j + "</strong>"
				}))
			}
		}
	};
	var a = function (d) {
		return d.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1")
	}
})();
var googleOpenIDPopup = {
	constants: {
		openidSpec: {
			identifier_select: "http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select",
			namespace2: "http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
		}
	},
	getWindowInnerSize: function () {
		var a = 0,
			d = 0,
			g = null;
		if ("innerWidth" in window) {
			a = window.innerWidth;
			d = window.innerHeight
		} else {
			if ("BackCompat" === window.document.compatMode && "body" in window.document) g = window.document.body;
			else if ("documentElement" in window.document) g = window.document.documentElement;
			if (g !== null) {
				a = g.offsetWidth;
				d = g.offsetHeight
			}
		}
		return [a, d]
	},
	getParentCoords: function () {
		var a = 0,
			d = 0;
		if ("screenLeft" in window) {
			a = window.screenLeft;
			d = window.screenTop
		} else if ("screenX" in window) {
			a = window.screenX;
			d = window.screenY
		}
		return [a, d]
	},
	getCenteredCoords: function (a, d) {
		var g = this.getWindowInnerSize(),
			c = this.getParentCoords(),
			e = c[0] + Math.max(0, Math.floor((g[0] - a) / 2));
		g = c[1] + Math.max(0, Math.floor((g[1] - d) / 2));
		if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) for (; e > screen.width;) e -= screen.width;
		if (e < 0) e += screen.width;
		return [e, g]
	},
	createPopupOpener: function (a) {
		var d = null,
			g = null,
			c = this,
			e = "shouldEncodeUrls" in a ? a.shouldEncodeUrls : true,
			b = "identifier" in a ? e ? encodeURIComponent(a.identifier) : a.identifier : this.constants.openidSpec.identifier_select,
			f = "identity" in a ? e ? encodeURIComponent(a.identity) : a.identity : this.constants.openidSpec.identifier_select,
			j = "namespace" in a ? e ? encodeURIComponent(a.namespace) : a.namespace : this.constants.openidSpec.namespace2,
			o = "onOpenHandler" in a && "function" === typeof a.onOpenHandler ? a.onOpenHandler : this.darkenScreen,
			q = "onCloseHandler" in a && "function" === typeof a.onCloseHandler ? a.onCloseHandler : null,
			v = "returnToUrl" in a ? a.returnToUrl : null,
			w = "realm" in a ? a.realm : null,
			E = "opEndpoint" in a ? a.opEndpoint : null,
			A = "extensions" in a ? a.extensions : null,
			B = function () {
				if (!g || g.closed) {
					g = null;
					q && q();
					if (null !== d) {
						window.clearInterval(d);
						d = null
					}
				}
			};
		return {
			popup: function (G, x) {
				var D;
				D = "&";
				var F = null;
				F = null;
				if (null === E || null === v) D = void 0;
				else {
					if (E.indexOf("?") === -1) D = "?";
					F = e ? encodeURIComponent(v) : v;
					F = [E, D, "openid.ns=", j, "&openid.mode=checkid_setup&openid.claimed_id=", b, "&openid.identity=", f, "&openid.return_to=", F].join("");
					if (w !== null) F += "&openid.realm=" + (e ? encodeURIComponent(w) : w);
					if (A !== null) {
						D = F;
						F = "";
						for (key in A) F += ["&", key, "=", e ? encodeURIComponent(A[key]) : A[key]].join("");
						F = D + F
					}
					F += "&openid.ns.ui=" + encodeURIComponent("http://specs.openid.net/extensions/ui/1.0");
					F += "&openid.ui.mode=popup";
					D = F
				}
				o && o();
				F = c.getCenteredCoords(G, x);
				g = window.open(D, "", "width=" + G + ",height=" + x + ",status=1,location=1,resizable=yes,left=" + F[0] + ",top=" + F[1]);
				d = window.setInterval(B, 80);
				return g
			}
		}
	}
},
	ZeroClipboard = {
		version: "1.0.7",
		clients: {},
		moviePath: "/webincludes/flash/ZeroClipboard.swf",
		nextId: 1,
		$: function (a) {
			if (typeof a == "string") a = document.getElementById(a);
			if (!a.addClass) {
				a.hide = function () {
					this.style.display = "none"
				};
				a.show = function () {
					this.style.display = ""
				};
				a.addClass = function (d) {
					this.removeClass(d);
					this.className += " " + d
				};
				a.removeClass = function (d) {
					for (var g = this.className.split(/\s+/), c = -1, e = 0; e < g.length; e++) if (g[e] == d) {
						c = e;
						e = g.length
					}
					if (c > -1) {
						g.splice(c, 1);
						this.className = g.join(" ")
					}
					return this
				};
				a.hasClass = function (d) {
					return !!this.className.match(RegExp("\\s*" + d + "\\s*"))
				}
			}
			return a
		},
		setMoviePath: function (a) {
			this.moviePath = a
		},
		dispatch: function (a, d, g) {
			(a = this.clients[a]) && a.receiveEvent(d, g)
		},
		register: function (a, d) {
			this.clients[a] = d
		},
		getDOMObjectPosition: function (a, d) {
			for (var g = {
				left: 0,
				top: 0,
				width: a.width ? a.width : a.offsetWidth,
				height: a.height ? a.height : a.offsetHeight
			}; a && a != d;) {
				g.left += a.offsetLeft;
				g.top += a.offsetTop;
				a = a.offsetParent
			}
			return g
		},
		Client: function (a) {
			this.handlers = {};
			this.id = ZeroClipboard.nextId++;
			this.movieId = "ZeroClipboardMovie_" + this.id;
			ZeroClipboard.register(this.id, this);
			a && this.glue(a)
		}
	};
ZeroClipboard.Client.prototype = {
	id: 0,
	ready: false,
	movie: null,
	clipText: "",
	handCursorEnabled: true,
	cssEffects: true,
	handlers: null,
	glue: function (a, d, g) {
		this.domElement = ZeroClipboard.$(a);
		if (typeof d == "string") d = ZeroClipboard.$(d);
		else if (typeof d == "undefined") d = document.getElementsByTagName("body")[0];
		a = ZeroClipboard.getDOMObjectPosition(this.domElement, d);
		this.div = document.createElement("div");
		var c = this.div.style;
		c.position = "absolute";
		c.left = "" + a.left + "px";
		c.top = "" + a.top + "px";
		c.width = "" + a.width + "px";
		c.height = "" + a.height + "px";
		c.zIndex = 1E5;
		if (typeof g == "object") for (addedStyle in g) c[addedStyle] = g[addedStyle];
		d.appendChild(this.div);
		this.div.innerHTML = this.getHTML(a.width, a.height)
	},
	getHTML: function (a, d) {
		var g = "",
			c = "id=" + this.id + "&width=" + a + "&height=" + d;
		if (navigator.userAgent.match(/MSIE/)) {
			var e = location.href.match(/^https/i) ? "https://" : "http://";
			g += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + e + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + a + '" height="' + d + '" id="' + this.movieId + '" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + ZeroClipboard.moviePath + '" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="' + c + '"/><param name="wmode" value="transparent"/></object>'
		} else g += '<embed id="' + this.movieId + '" src="' + ZeroClipboard.moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + a + '" height="' + d + '" name="' + this.movieId + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + c + '" wmode="transparent" />';
		return g
	},
	hide: function () {
		if (this.div) this.div.style.left = "-2000px"
	},
	show: function () {
		this.reposition()
	},
	destroy: function () {
		if (this.domElement && this.div) {
			this.hide();
			this.div.innerHTML = "";
			var a = document.getElementsByTagName("body")[0];
			try {
				a.removeChild(this.div)
			} catch (d) {}
			this.div = this.domElement = null
		}
	},
	reposition: function (a) {
		if (a)(this.domElement = ZeroClipboard.$(a)) || this.hide();
		if (this.domElement && this.div) {
			a = ZeroClipboard.getDOMObjectPosition(this.domElement);
			var d = this.div.style;
			d.left = "" + a.left + "px";
			d.top = "" + a.top + "px"
		}
	},
	setText: function (a) {
		this.clipText = a;
		this.ready && this.movie.setText(a)
	},
	addEventListener: function (a, d) {
		a = a.toString().toLowerCase().replace(/^on/, "");
		this.handlers[a] || (this.handlers[a] = []);
		this.handlers[a].push(d)
	},
	setHandCursor: function (a) {
		this.handCursorEnabled = a;
		this.ready && this.movie.setHandCursor(a)
	},
	setCSSEffects: function (a) {
		this.cssEffects = !! a
	},
	receiveEvent: function (a, d) {
		a = a.toString().toLowerCase().replace(/^on/, "");
		switch (a) {
		case "load":
			this.movie = document.getElementById(this.movieId);
			if (!this.movie) {
				var g = this;
				setTimeout(function () {
					g.receiveEvent("load", null)
				}, 1);
				return
			}
			if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
				g = this;
				setTimeout(function () {
					g.receiveEvent("load", null)
				}, 100);
				this.ready = true;
				return
			}
			this.ready = true;
			this.movie.setText(this.clipText);
			this.movie.setHandCursor(this.handCursorEnabled);
			break;
		case "mouseover":
			if (this.domElement && this.cssEffects) {
				this.domElement.addClass("hover");
				this.recoverActive && this.domElement.addClass("active")
			}
			break;
		case "mouseout":
			if (this.domElement && this.cssEffects) {
				this.recoverActive = false;
				if (this.domElement.hasClass("active")) {
					this.domElement.removeClass("active");
					this.recoverActive = true
				}
				this.domElement.removeClass("hover")
			}
			break;
		case "mousedown":
			this.domElement && this.cssEffects && this.domElement.addClass("active");
			break;
		case "mouseup":
			if (this.domElement && this.cssEffects) {
				this.domElement.removeClass("active");
				this.recoverActive = false
			}
			break
		}
		if (this.handlers[a]) for (var c = 0, e = this.handlers[a].length; c < e; c++) {
			var b = this.handlers[a][c];
			if (typeof b == "function") b(this, d);
			else if (typeof b == "object" && b.length == 2) b[0][b[1]](this, d);
			else typeof b == "string" && window[b](this, d)
		}
	}
};