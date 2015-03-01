var cluster = require('cluster'),
http = require('http'),
estatic = require('ecstatic'),
fs = require('fs'),
ejs = require('ejs'),
index = ejs.compile(fs.readFileSync(__dirname + '/pub/index.html',
	'utf8'), {delimiter: '?', helpers:{echohtml:
	function(s, i){return s+":"+ (!i? 1:i) +" echohtml!"}}}),
serve = estatic({root: __dirname+'/public', showDir:true, autoIndex: true}),
	numr
	;

if(cluster.isMaster){

	// Keep track of http requests
	var numReqs = 0;
	setInterval(function(){
		console.log("numReqs =", numReqs);
	}, 11000);

	// Start workers and listen for messages containing
	// notifyRequest
	var numCPUs = require('os').cpus().length;
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

	http.Server(function(req, res){
		switch(req.url){
			case "/":
			default:
				res.writeHead(200, {'content-type': 'text/html'});
				res.write(index({hello: "Hello nodejs!", numr: numr}));

				break;

			case "/pub":
			case "/pub/":
			case "/pub/index.html":
				serve(req, res, next);
				break;
		}

		res.end();

		// notify master about the request
		process.send({cmd: 'notifyRequest'});

		process.on('message', function(msg){
			if(msg){
				numr = msg.numr;
			}
		});

	}).listen(8000);
}