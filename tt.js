var { transform } = require('@codemod/core')
var plugin = require('./dev/gulp-plugin')
var path = require('path')

var gutil = require('gulp-util')

function copyFile(src, data, name) {
	return new gutil.File({
		cwd: src.cwd,
		base: src.base,
		path: name ? path.join(path.dirname(src.path), name) : src.path,
		contents: ((data instanceof Buffer) ? data : new Buffer(data))
	})
}

module.exports = plugin('replace-imports', function(options, file, enc, done) {
  var stream = this
  var js_string = file.contents.toString()

  console.log('file', file.path)

  const result = transform(js_string, {
    'plugins': [
      [
        './babel-plugin-replace-imports/pp.js',
        {
          'test': /spv/i,
          filePath: file.path,
          directory: options.directory,
          'replacer': (...args) => {
            console.log('replacing!', args)
            return 11
          }
        }
      ]
    ]
  })


  stream.push(copyFile(file, result.code))

  done()

})


// console.log(result.code)
