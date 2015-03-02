var cluster = require('cluster'),
http = require('http'),
estatic = require('ecstatic'),
fs = require('fs'),
ejs = require('ejs'),

index = ejs.compile(fs.readFileSync(__dirname + '/public/index.html','utf8'),{delimiter: '?', helpers:{echohtml:
	function(s, i){return s+":"+ (!i? 1:i) +" echohtml!"}}}),

serve = estatic({root: __dirname+'/public', serverHeader: false,
	showDir:true, autoIndex: false, baseDir:"/public"});


if(cluster.isMaster){

	// Keep track of http requests
	var numReqs = 0;
	setInterval(function(){
		console.log("numReqs =", numReqs);
	}, 11000);

	// Start workers and listen for messages containing
	// notifyRequest
	var numCPUs = 1;//require('os').cpus().length;
	for(var i = 0; i < numCPUs; i++){
		cluster.fork();
	}

	Object.keys(cluster.workers).forEach(function(id){

		cluster.workers[id].on('message', function messageHandler(msg){
			if(msg.cmd && msg.cmd == 'notifyRequest'){
				numReqs += 1;

				cluster.workers[id].send({numr: numReqs});
			}
		});
	});

}else{

	http.Server(function(req, res, next){
		if(req.url.indexOf("public") >-1){
			serve(req, res, next);
		}
		else{
			res.writeHead(200, {'content-type': 'text/html'});
			res.write(index({hello: "Hello nodejs!", numr: 0}));

			res.end();
		}

		// notify master about the request
		process.send({cmd: 'notifyRequest'});

		process.on('message', function(msg){
			if(msg){
				numr = msg.numr;
			}
		});

	}).listen(8000);
}