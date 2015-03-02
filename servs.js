var
http = require('http'),
ejs = require('ejs'),
fs = require('fs'),
index = ejs.compile(fs.readFileSync(__dirname + '/public/index.html',
	'utf8'), {delimiter: '?', helpers:{echohtml:
		function(s, i){return s+":"+ (!i? 1:i) +" echohtml!"}}}),
estatic = require('ecstatic');

var serve = estatic({root: __dirname+'/public', serverHeader: false,
	showDir:true, autoIndex: true, baseDir:"/public"});

var server = http.createServer(function(req, res, next){
	if(req.url.indexOf("public") >-1){
		serve(req, res, next);

	}
	else{
		res.writeHead(200, {'content-type': 'text/html'});
		res.write(index({hello: "Hello nodejs!", numr: 0}));

		res.end();
	}
});

// Listen
server.listen(8000);