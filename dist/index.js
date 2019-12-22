
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./htmdx.cjs.production.min.js')
} else {
  module.exports = require('./htmdx.cjs.development.js')
}
