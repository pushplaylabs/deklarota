define(function() {
'use strict';
var has = function(obj, prop) {
  return obj.hasOwnProperty(prop)
}

var changed = function(obj, deps) {
  for (var i = 0; i < deps.length; i++) {
    if (has(obj, deps[i])) {
      console.log('has', obj, deps[i])
      return true
    }
  }
}

return function execSchema(schema, self) {
  var result_name = schema[0]
  var deps = schema[1]
  var fn = schema[2]

  if (!changed(self, deps)) {
    return
  }

  var args = new Array(deps.length)

  for (var i = 0; i < deps.length; i++) {
    args[i] = self[deps[i]]
  }
  var value = fn.apply(null, args)

  if (self[result_name] === value) {
    return
  }

  if (self[result_name] == null && value == null) {
    return
  }

  self[result_name] = value
}
})
