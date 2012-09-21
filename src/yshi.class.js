(function() {
	var YSHI_Class = (function() {
		var find_method = function(cur_proto, meth_name) {
			var cur_pt = cur_proto.parent;
			while (cur_pt) {
				if (cur_pt.hasOwnProperty(meth_name)) {
					return cur_pt;
				};
				cur_pt = cur_pt.parent;
			}
			return;
		};

		var fake_super = function(cur_cls, inst, meth_name) {
			var proto = find_method(cur_cls.prototype, meth_name);
			if (typeof(proto) === 'undefined') {
				throw "No Method Found";
			}
			return proto[meth_name].bind(inst);
		};

		var make_proto = function(cur_class, super_class) {
			var proto = Object.create(super_class.prototype);
			proto.constructor = cur_class;
			proto.parent = super_class.prototype;
			return proto;
		};

		var create = function(super_class, constructor) {
			constructor.prototype = make_proto(constructor, super_class);
			return constructor;
		};

		var exports = {};
		exports['fake_super'] = fake_super;
		exports['create'] = create;
		return exports;
	}());

	window['YSHI'] = window['YSHI'] || {};
	window['YSHI']['Class'] = YSHI_Class;
}());
