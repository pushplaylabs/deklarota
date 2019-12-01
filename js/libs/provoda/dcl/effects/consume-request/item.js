define(function() {
'use strict'

// {
//   type: 'request',
//   pass: 'dasfba',
//   api: '',
//   require: '',
//   fn: [['auth'], (api, _, auth) => api.get('sidekick')],
//
//
// }

// pass example:

//   to: ['< *', {
//     schema: [''],
//
//   }]

function ReqDcl (name, data) {
  this.passName = name
  this.api = data.api
  this.require = data.require
  this.fn = data.fn
}

ReqDcl.prototype.type = 'request'

return ReqDcl
})
