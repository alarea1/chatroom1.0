var http = require('http');//http模块
var fs   = require('fs');//
var path = require('path');//提供与文件系统路径相关的功能
var mime = require('mime');//通过拓展名得到mime类型
var cache = {};//用来缓存文件内容的对象

//文件不存在时发送404错误
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Error 404:资源未找到');
    response.end();
    
    }

//文件数据服务，写出正确的http头然后发送文件的具体内容：
function sendFile(response,filePath,fileContents){
    response.writeHead(200,{"content-type":mime.lookup(path.basename(filePath))});
    response.end(fileContents);
    
    }

function serverStatic(response,cache,absPath){
    if(cache[absPath]){sendFile(response,absPath,cache[absPath]);}//查询是否存在于缓存中，如果是则返回内存中文件
    else{fs.exists(absPath,function(exists){//如果不在检查是否存在于硬盘中，如果存在，则从硬盘中读取文件
         if(exists){fs.readFile(absPath,function(err,data){
             if(err){send404(response);}
             else{cache[absPath]=data;         //从硬盘中读取文件并返回
             sendFile(response,absPath,data);
               }
             });
            }else{ send404(response);//都不存在则返回404错误
          } 
         });
        }
    }

var server = http.createServer(function(request,response){
    var filePath = false;
    if (request.url == '/'){filePath = 'public/index.html';}//返回默认样式html文件
    else{filePath = 'public'+request.url;}//将URL转化为文件相对路径
    var absPath = './'+filePath;
    serverStatic(response,cache,absPath);
    
    });//返回静态文件

server.listen(3000,function(){console.log("服务器正在监听3000接口");});

var chatServer = require('./lib/chat_server.js');
chatServer.listen(server);
