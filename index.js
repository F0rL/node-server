var http = require('http')
var path = require('path')
var fs = require('fs')
var url = require('url')

//在routes里面匹配
var routes = {
  '/a' : function(req, res){
    res.end(JSON.stringify(req.query))
  },

  '/b' : function(req, res){
    res.end('match /b')
  },

  '/a/c' : function(req, res){
    res.end('match /a/c')
  },

  '/search' : function(req, res){
    res.end('username' + req.body.username + ',password=' + req.body.userpassword)
  }
}


//第一步，请求的入口,调用函数routePath()处理请求
var server = http.createServer(function(req, res){
  routePath(req, res)
})

server.listen(8080)
console.log('welcome to visit http://localhost:8080')

//函数routePath()解析请求，得到pathname
function routePath(req, res){
  var pathObj = url.parse(req.url, true)

  var handleFn = routes[pathObj.pathname]//匹配routes[]
  if (handleFn){
    req.query = pathObj.query

    //参考 https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
    //post json 解析
    var body = ''
    req.on('data', function(chunk){
      body += chunk
    }).on('end', function(){
      req.body = parseBody(body)
      handleFn(req, res)
    })

  }else {
    staticRoot(path.resolve(__dirname, "simple"), req, res)
  } //找不到就当成静态文件处理
}


function staticRoot(staticPath, req, res){
  var pathObj = url.parse(req.url, true)
  var filePath = path.join(staticPath, pathObj.pathname)
  fs.readFile(filePath,'binary', function(err, content){
    if(err){
      res.writeHead('404', 'haha Not Found')
      return res.end()
    }

    res.writeHead(200, 'Ok')
    res.write(content, 'binary')
    res.end()  
  })

}

function parseBody(body){
  console.log(body)
  var obj = {}
  body.split('&').forEach(function(str){
    obj[str.split('=')[0]] = str.split('=')[1]
  })
  return obj
}