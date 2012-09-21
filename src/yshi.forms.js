(function() {
	// -- INTERFACES -- //

	/**
	 * A field.
	 * @interface
	 */
	function IField() {};
	/**
	 * @type {string}
	 */
	IField.prototype.field_name;

	/**
	 * @param {?} data
	 * @return {?}
	 */
	IField.prototype.extract_value = function(data) {};

	/**
	 * @param {?} data
	 * @return {?}
	 */
	IField.prototype.reverse_extract_value = function(data) {};

	/**
	 * A Composite field.
	 * @interface
	 * @extends {IField}
	 */
	function ICompositeField() {};

	/**
	 * @expose
	 * @param {?} field_cls
	 * @param {string} field_subname
	 */
	ICompositeField.prototype.add_field = function(field_cls, field_subname) {};

	/**
	 * A YSHI.Template function
	 * @interface
	 */
	function IYSHI_Template() {};
	/** @type {Object} */
	IYSHI_Template.prototype.tags;
	/**
	 * @type {function(...[Object]): ?}
	 * @expose
         */
	IYSHI_Template.prototype.render = function() {};

	// -- END INTERFACES -- //
	// -- UTILITY FUNCTIONS -- /

	/**
	 * @param {string} type_name the input type
	 * @return {boolean} true if the browser supports this input type
	 */
	var inputtype_accepts = function(type_name) {
		var input = document.createElement('input');
		input.type = type_name;
		return (input.type === type_name);
	}

	/**
	 * @param {string} prefix
	 * @param {string} target
	 * @return {string} target minus the prefix
	 */
	var unprefix = function(prefix, target) {
		var output = "";
		if (target.length < prefix.length) {
			throw "target is shorter than prefix";
		}
		for (var i = 0; i < prefix.length; i++) {
			if (prefix[i] !== target[i]) {
				throw "target is not prefixed";
			}
		}
		for (var i = prefix.length; i < target.length; i++) {
			output += target[i];
		}
		return output;
	};

	/**
	 * @param {Object} obj1
	 * @param {Object} obj2
	 * @return {Object}
	 */
	var dictmerge = function(obj1, obj2){
		var output = {};
		for (var key in obj1) { output[key] = obj1[key]; }
		for (var key in obj2) { output[key] = obj2[key]; }
		return output;
	}
	// -- END UTILITY FUNCTIONS -- //

	var Forms = (function() {
		var exports = {};

		var Field = (function() {
			/** @constructor */
			var Field = window['YSHI']['Class']['create'](Object, function(field_name) {
				if (typeof(field_name) !== "string") {
					throw "name must be string";
				}
				this._name = field_name;
			});

			Field.prototype.__defineGetter__('field_name', function() {
				return this._name;
			});

			Field.prototype['extract_value'] = function(data) {
				throw "Abstract: Must Override";
			};

			Field.prototype['reverse_extract_value'] = function(data) {
				throw "Abstract: Must Override";
			};

			return Field;
		}());
		exports['Field'] = Field;

		var NativeIntegerField = (function() {
			var fake_super = window['YSHI']['Class']['fake_super'];
			var class_create = window['YSHI']['Class']['create'];

			/**
			 * @constructor
			 * @implements {IField}
			 */
			var NativeIntegerField = class_create(Field, function(field_name) {
				fake_super(NativeIntegerField, this, 'constructor')(field_name);
			});

			/**
			 * @this {IField}
			 * @return {number}
			 */
			NativeIntegerField.prototype['extract_value'] = function(data) {
				return parseInt(data[this['field_name']], 10);
			};

			/**
			 * @this {IField}
			 */
			NativeIntegerField.prototype['reverse_extract_value'] = function(data) {
				return data[this['field_name']].toString();
			};

			return NativeIntegerField;
		}());
		exports['NativeIntegerField'] = NativeIntegerField;

		var LegacyIntegerField = (function(){
			var fake_super = window['YSHI']['Class']['fake_super'];
			var class_create = window['YSHI']['Class']['create'];

			/**
			 * @constructor
			 * @implements {IField}
			 */
			var LegacyIntegerField = class_create(Field, function(field_name) {
				fake_super(LegacyIntegerField, this, 'constructor')(field_name);
			});

			/**
			 * @this {IField}
			 * @return {number}
			 */
			LegacyIntegerField.prototype['extract_value'] = function(data) {
				return parseInt(data[this['field_name']], 10);
			};

			return LegacyIntegerField;
		}());
		exports['LegacyIntegerField'] = LegacyIntegerField;

		var IntegerField = inputtype_accepts('number') ? NativeIntegerField : LegacyIntegerField;
		exports['IntegerField'] = IntegerField;

		var CompositeField = (function() {
			var fake_super = window['YSHI']['Class']['fake_super'];
			var class_create = window['YSHI']['Class']['create'];

			/**
			 * @constructor
			 * @implements {IField}
			 */
			var CompositeField = class_create(Field, function(field_name) {
				fake_super(CompositeField, this, 'constructor')(field_name);
				this._fields = [];
			});

			/**
			 * @this {IField}
			 * @param {?} field_cls
			 * @param {string} sub_name
			 */
			CompositeField.prototype['add_field'] = function(field_cls, sub_name) {

				this._fields.push(new field_cls(this['field_name'] + '.' + sub_name));
			};

			/** @this {IField} */
			CompositeField.prototype['extract_value'] = function(data) {
				var retval = {};
				var prefix = this['field_name'] + '.';
				for (var i = 0; i < this._fields.length; i++) {
					var field = this._fields[i];
					retval[unprefix(prefix, field['field_name'])] = field.extract_value(data);
				}
				return retval;
			};

			/** @this {IField} */
			CompositeField.prototype['reverse_extract_value'] = function(data) {
				var retval = {};
				return retval;
			};

			return CompositeField;
		}());
		exports['CompositeField'] = CompositeField;

		var NativeDateField = (function() {
			var fake_super = window['YSHI']['Class']['fake_super'];
			var class_create = window['YSHI']['Class']['create'];

			/**
			 * @constructor
			 * @implements {IField}
			 */
			var NativeDateField = class_create(Field, function(field_name) {
				fake_super(NativeDateField, this, 'constructor')(field_name);
			});

			/**
			 * @this {IField}
			 */
			NativeDateField.prototype['extract_value'] = function(data) {
				return data[this['field_name']];
			};
			return NativeDateField;
		}());
		exports['NativeDateField'] = NativeDateField;

		var LegacyDateField = (function() {
			var fake_super = window['YSHI']['Class']['fake_super'];
			var class_create = window['YSHI']['Class']['create'];

			/**
			 * @constructor
			 * @implements {ICompositeField}
			 */
			var LegacyDateField = class_create(CompositeField, function(field_name) {
				fake_super(LegacyDateField, this, 'constructor')(field_name);
				this.add_field(IntegerField, 'year');
				this.add_field(IntegerField, 'month');
				this.add_field(IntegerField, 'day');
			});

			/**
			 * @this {IField}
			 * @return {string}
			 */
			LegacyDateField.prototype.extract_value = function(data) {
				var parent_data = fake_super(LegacyDateField, this, 'extract_data')(data);
				return (parent_data['year'].toString() + "-" + parent_data['month'].toString() + "-" + parent_data['day'].toString());
			};

			/** @this {IField} */
			LegacyDateField.prototype.reverse_extract_value = function(data) {
				var rv = {};
				if (!data || !data[this['field_name']]) {
					rv[this['field_name'] + ".year"] = "";
					rv[this['field_name'] + ".month"] = "";
					rv[this['field_name'] + ".day"] = "";
				} else {
					var split = data[this['field_name']].split("-");
					rv[this['field_name'] + ".year"] = split[0];
					rv[this['field_name'] + ".month"] = split[1];
					rv[this['field_name'] + ".day"] = split[2];
				}
				return rv;
			};
			return LegacyDateField;
		}());
		exports['LegacyDateField'] = LegacyDateField;

		var DateField = inputtype_accepts('date') ? NativeDateField : LegacyDateField;
		exports['DateField'] = DateField;

		var HTMLRender = (function() {
			var Template = window['YSHI']['Template'];

			var table = new (window['YSHI']['util']['Hashtable'])();

			table.put(NativeIntegerField, new Template(function(field, defaults) {
				var $ = this['tags'];
				return $.input({
					'type': 'number',
				       'name': field['field_name'],
				       'value': defaults[field['field_name']]});
			}));
			table.put(LegacyIntegerField, new Template(function(field, defaults) {
				var $ = this['tags'];
				return $.input({
					'type': 'text',
				       'name': field['field_name'],
				       'value': defaults[field['field_name']]});
			}));
			table.put(NativeDateField, new Template(function(field, defaults) {
				var $ = this['tags'];
				return $.input({
					'type': 'date',
				       'name': field['field_name'],
				       'value': defaults[field['field_name']]});
			}));
			/**
			 * @param {IField} field
			 */
			table.put(LegacyDateField, new Template(function (field, defaults) {
				var $ = this['tags'];
				/** @type {Object.<string, Object>} */
				var unextracted = field.reverse_extract_value(defaults);
				return $.span({'class': 'fieldcontainer'},
					/* warning: hardcoded subfield names */
					$.input({
						'type': 'number',
					'class': 'field',
					'name': field['field_name'] + '.year',
					'value': unextracted[field['field_name'] + '.year']}),
					$.input({
						'type': 'number',
					'class': 'field',
					'name': field['field_name'] + '.month',
					'value': unextracted[field['field_name'] + '.month']}),
					$.input({
						'type': 'number',
					'class': 'field',
					'name': field['field_name'] + '.day',
					'value': unextracted[field['field_name'] + '.day']})
				);
			}));

			return function(obj, ex) {
				return table.get(obj.constructor)['render'](obj, ex);
			};
		}());
		exports['HTMLRender'] = HTMLRender;
		return exports;
	}());

	window['YSHI'] = window['YSHI'] || {};
	window['YSHI']['Forms'] = Forms;
}());
