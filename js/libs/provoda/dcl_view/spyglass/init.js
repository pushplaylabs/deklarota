
import spv from '../../../spv'
import getBwlevView from '../getBwlevView'
import getModel from '../../View/getModel'
var nil = spv.nil

function watchAndRequest(root_bwlev_view, self, spyglass) {
  var key = spyglass.nest_name + '---' + self.view_id
  var current = null

  self.lwch(root_bwlev_view, 'spyglasses_requests', function handleChange(index) {
    var value = index[key] || null

    self.collectionChange(self, spyglass.nest_name, value && getModel(self, value), current && getModel(self, current))
    current = value
    // TODO if (value) {unsubscribe()}
  })

  var parent_bwlev_view = spyglass.bwlev === true && getBwlevView(self)
  root_bwlev_view.RPCLegacy('requestSpyglass', {
    key: key,
    bwlev: spyglass.bwlev && parent_bwlev_view.mpx.md._provoda_id,
    context_md: spyglass.context_md && getContextId(self, parent_bwlev_view, spyglass.context_md),
    name: spyglass.name,
  })
  // TODO remove key value from index on this view/self destroy
}

function getContextId(view, parent_bwlev_view, steps) {
  if (steps === true) {
    return parent_bwlev_view.getNesting('pioneer')._provoda_id
  }

  if (steps.startsWith('.')) {
    throw new Error('implement local context getting')
    // could be specially usefull inside `nest_borrow`
  }

  throw new Error('implement steps (^^^^) context getting')
}

export default function(self) {
  if (nil(self._spyglass)) {
    return
  }
  var root_view = self.root_view || (self.isRootView && self)
  var root_bwlev_view = root_view.parent_view
  if (nil(root_bwlev_view)) {
    throw new Error('cant find bwlev_view')
  }

  for (var key in self._spyglass) {
    var cur = self._spyglass[key]
    watchAndRequest(root_bwlev_view, self, cur)
  }
}
