define(function(require) {
'use strict'
var spv = require('spv')
var execSchema = require('../../execSchema')
var cloneObj = spv.cloneObj
// _nest_reqs - legacy nest reqs
// _states_reqs_index - legacy states reqs

var selectModernOrLegacy = function(modern, legacy) {
  var merged = {}
  merged = cloneObj(merged, legacy)
  merged = cloneObj(merged, modern)

  var list = Object.keys(merged)

  var resultIndex = {}

  for (var i = 0; i < list.length; i++) {
    var name = list[i]
    var selected = (modern && modern[name]) || (legacy && legacy[name])
    resultIndex[list[i]] = selected
  }

  console.log('resultIndex', resultIndex)

  return resultIndex
}

var schema_nest = [
  '__reqs_nests_index',
  ['__req_pass_compx', '_nest_reqs'],
  selectModernOrLegacy,
]

var schema_state = [
  '__reqs_states_index',
  ['__req_pass_compx', '_states_reqs_index'],
  selectModernOrLegacy
]


return function rebuildRequests(self) {
  execSchema(schema_nest, self)
  execSchema(schema_state, self)
}
})
