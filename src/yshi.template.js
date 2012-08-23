YSHI = window.YSHI || {};
YSHI.Template = (function() {
	var tags = [
		"html", "head", "body", "script", "meta", "title", "link",
		"div", "p", "span", "a", "img", "br", "hr", "em", "strong",
		"table", "tr", "th", "td", "thead", "tbody", "tfoot",
		"ul", "ol", "li", 
		"dl", "dt", "dd",
		"h1", "h2", "h3", "h4", "h5", "h6", "h7",
		"form", "fieldset", "input", "textarea", "label", "select", "option"
	]

	var is_dict = function (obj) {
		/* TODO: this isn't constrainted enough */
		return ((typeof(obj) === 'object') &&
			(typeof(obj.prototype) === 'undefined'));
	}

	var TextNode = function(text) {
		this._text = text
	};

	TextNode.prototype.to_domobjs = function() {
	        var tempDiv = document.createElement('div');
		tempDiv.innerHTML = this._text;
		return tempDiv.childNodes;
	};

	var Node = function(tag_name) {
		this._tag_name = tag_name;
		this._attrs = {};
		this._children = [];
	};

	Node.prototype.setAttribute = function(attrkey, attrval) {
		this._attrs[attrkey] = attrval;
	};

	Node.prototype.appendChild = function(child) {
		this._children.push(child)
	};

	Node.prototype.to_domobj = function() {
		var o = document.createElement(this._tag_name);
		for (key in this._attrs) {
			o.setAttribute(key, this._attrs[key]); };
		for (chidx in this._children) {
			var child = this._children[chidx];
			if (child instanceof Node) {
				o.appendChild(this._children[chidx].to_domobj());
			} else if (child instanceof TextNode) {
				var to_add = child.to_domobjs();
				for (var i = 0; i < to_add.length; i++) {
					o.appendChild(to_add[i]);
				}
			} else if (typeof(this._children[chidx]) === 'string') {
				o.appendChild(document.createTextNode(this._children[chidx]));
			}
		}
		return o;
	}

	var Template = function(tpl_func) {
		this._tpl_func = tpl_func;
	};

	Template.prototype.render = function(data) {
		return this._tpl_func.call(this, data).to_domobj();
	};

	Template.prototype.tags = {};
	for (idx in tags) {
		Template.prototype.tags[tags[idx]] = (function(tag_name) {
			return function() {
				var o = new Node(tag_name);
				var has_attrs = true;
				if (arguments[0] instanceof Node) has_attrs = false;
				if (arguments[0] instanceof TextNode) has_attrs = false;
				if (!is_dict(arguments[0])) has_attrs = false;
				if (has_attrs) {
					for (key in arguments[0]) {
						o.setAttribute(key, arguments[0][key]); }}
				for(var i = (has_attrs ? 1 : 0); i < arguments.length; i++) {
					o.appendChild(arguments[i]); }
				return o;
			};
		})(tags[idx]);
	};

	Template.prototype.tags['escapedtext'] = function(text) {
		return new TextNode(text);
	};

	return Template;
})();
