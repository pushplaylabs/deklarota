define(function(require) {
'use strict';

var hp = require('../helpers');
var getRightNestingName = hp.getRightNestingName;

var getDeclrConstr = function(app, md, item) {
	if (typeof item == 'function') {
		return item;
	} else if (typeof item == 'string') {
		return md.getConstrByPathTemplate(app, item);
	} else {
		return item;
	}
};

var nestConstrDeclaration = function(cur, md, app) {
	if (cur.type == 'route') {
		return md.getConstrByPathTemplate(app, cur.value);
	} else {
		return md._all_chi[cur.key];
	}
};

var specMap = function(func) {
	return function(list, arg1, arg2) {
		if (Array.isArray(list)) {
			var result = new Array(list.length);
			for (var i = 0; i < list.length; i++) {
				result[i] = func(list[i], arg1, arg2);
			}
			return result;
		} else {
			return func(list, arg1, arg2);
		}
	};
};

var nestList = specMap(nestConstrDeclaration);

var getNestingConstr = function(app, md, nesting_name) {
	nesting_name = getRightNestingName(md, nesting_name);


	if (md[ 'nest_rqc-' + nesting_name ]) {
		var key = md._nest_rqc && md._nest_rqc[nesting_name];
		var target = md._all_chi[key];
		if (Array.isArray(target)) {
			if (!target.constrs_array) {
				var result = [];
				var index = target[1];
				for (var prop in index) {
					if (!index.hasOwnProperty(prop)) {
						continue;
					} else {
						result.push( getDeclrConstr(app, md, index[prop]) );
					}

				}
				target.constrs_array = result;
			}

			return target.constrs_array;
		} else {
			return getDeclrConstr(app, md, target);
		}

	} else if (md.idx_nestings_declarations && md.idx_nestings_declarations[nesting_name]) {
		return nestList(md.idx_nestings_declarations[nesting_name].subpages_names_list, md, app);

	} else if (md[ 'nest_posb-' + nesting_name ]) {
		return constrsList(app, md, md[ 'nest_posb-' + nesting_name ]);
	}
};

function constrsList(app, md, items) {
	if (Array.isArray(items)) {
		var result = [];
		for (var i = 0; i < items.length; i++) {
			result.push(getDeclrConstr(app, md, items[i]));
		}
		return result;
	} else {
		return getDeclrConstr(app, md, items);
	}
}

return {
	getDeclrConstr: getDeclrConstr,
	getNestingConstr: getNestingConstr
};

});
