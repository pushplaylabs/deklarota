
import updateProxy from '../updateProxy'
var updateAttr = updateProxy.update

export default function gentlyUpdateAttr(self, name, value, opts) {
  if (self.wasDisposed()) {
    return
  }

  if (self._currentMotivator() != null) {
     updateAttr(self, name, value, opts)
     return
   }

   self.input(function() {
     updateAttr(self, name, value, opts)
   })
}
