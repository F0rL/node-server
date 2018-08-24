# node-server
## 声明请求的入口，调用函数routePath()处理请求
```
var server = http.createServer(function(req, res){
  routePath(req, res)
})

server.listen(8080)
console.log('welcome to visit http://localhost:8080')
```
## 函数routePath()解析请求，得到pathname
```
function routePath(req, res){
  var pathObj = url.parse(req.url, true)

  var handleFn = routes[pathObj.pathname]//匹配routes[]
  if (handleFn){
    req.query = pathObj.query  //get获得的数据

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
  } //设置了"simple"，静态文件初始路径会默认在"simple"内
```
## 解析请求后与routes进行匹配，如果匹配成功，返回对应的结果
```
var routes = {
  '/a' : function(req, res){
    res.end(JSON.stringify(req.query))
  }, //匹配"http://localhost:8080/a"

  '/b' : function(req, res){
    res.end('match /b')
  }, //匹配"http://localhost:8080/a"

  '/a/c' : function(req, res){
    res.end('match /a/c')
  }, //匹配"http://localhost:8080/a/c"

  '/search' : function(req, res){
    res.end('username' + req.body.username + ',password=' + req.body.userpassword)
  }
}
```
## 定义一个函数，如果routes匹配不成功，当成静态文件处理
```
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
```
## 定义一个函数，处理post请求
```
function parseBody(body){
  console.log(body)
  var obj = {}
  body.split('&').forEach(function(str){
    obj[str.split('=')[0]] = str.split('=')[1]
  })
  return obj
}
```
## 在本地启动服务器，在浏览器输入"http://localhost:8080/test.html"，就能看到对应的静态界面。