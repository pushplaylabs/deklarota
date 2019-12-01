define(function() {
'use strict'
return function(md, name) {
  return md.__reqs_states_index && md.__reqs_states_index[name];
}
})
