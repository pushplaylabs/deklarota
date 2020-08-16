const plugin = require('babel-plugin-replace-imports')

module.exports = (...args) => {


  console.log(...args)

  const [e] = args

  console.log(e.Plugin)
  console.log(e.loadOptions())
  console.log(e.OptionManager)


  console.log(plugin(...args))
  throw new Error('www')
}
