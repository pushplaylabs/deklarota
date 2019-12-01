define(function(require) {
'use strict';
var execSchema = require('../../execSchema')

var schema = [
  '__req_pass_compx',
  ['__req_pass_list', '_extendable_passes_index'],
  function(__req_pass_list, _extendable_passes_index) {
    if (!__req_pass_list) {
      return
    }
  }
]

return function(self) {
  execSchema(schema, self)
}

})
