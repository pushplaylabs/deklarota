define(function() {
'use strict'
return function(md, name) {
  return md._nest_reqs && md._nest_reqs[name];
}
})
