define(function() {
'use strict'
return function(md, name) {
  return md._states_reqs_index && md._states_reqs_index[name];
}
})
