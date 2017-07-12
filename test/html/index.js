var fs = require('fs')
var Fbparser = require("../../index")
var fileName = process.argv[2]
var html = fs.readFileSync('./test/html/'+fileName)

var fbparser = new Fbparser()
var result = fbparser.parse(html)
console.log(result)
