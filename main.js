var cluster = require('cluster'),
http = require('http'),
fs = require('fs'),
ejs = require('ejs'),
index = ejs.compile(fs.readFileSync(__dirname + '/pub/index.html',
	'utf8'), {delimiter: '?', helpers:{echohtml:
	function(s, i){return s+":"+ (!i? 1:i) +" echohtml!"}}}),
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

	// Worker processes have a http server.
	http.Server(function(req, res){
		process.on('message', function(msg){
			if(msg){
				numr = msg.numr;
			}
		});
		res.writeHead(200);
		res.end(index({hello: "Hello nodejs!", numr: numr}));

		// notify master about the request
		process.send({cmd: 'notifyRequest'});
	}).listen(8000);
}