define(function() {
'use strict'
return function(md, name) {
  return md.__reqs_nests_index && md.__reqs_nests_index[name];
}
})
