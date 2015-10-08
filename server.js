var numr, pid,
http = require('http'),
estatic = require('ecstatic'),
fs = require('fs'),
ejs = require('ejs'),
index = ejs.compile(fs.readFileSync(__dirname + '/public/index.html','utf8'),{delimiter: '?', helpers:{echohtml:
	function(s, i){return s+":"+ (!i? 1:i) +" echohtml!"}}}),

serve = estatic({root: __dirname+'/public', serverHeader: false,
	showDir:true, autoIndex: false, baseDir:"/public"});

if(!!process)
	process.on('message', function(msg){
		if(msg){
			numr = msg.numr;
			pid = msg.pid;
		}
	});

http.Server(function(req, res, next){
		if(req.url.indexOf("public") >-1){
			serve(req, res, next);
		}
		else{
			res.writeHead(200, {'content-type': 'text/html'});
			res.write(index({hello: "Hello nodejs!",
				numr: numr, pid: pid}));

			res.end();
		}

		// notify master about the request
		if(!!process){
			//process.send({cmd: 'notifyRequest'});
		}

}).listen(8000);
