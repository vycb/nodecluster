var cluster = require('cluster');

if(cluster.isMaster){

	// Keep track of http requests
	var numReqs = 0;
	setInterval(function(){
		console.log("numReqs =", numReqs);
	}, 21000);

	// Start workers and listen for messages containing
	// notifyRequest
	var numCPUs = 1;//require('os').cpus().length;
	for(var i = 0; i < numCPUs; i++){
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
  });

	Object.keys(cluster.workers).forEach(function(id){

		cluster.workers[id].on('message', function messageHandler(msg){
			if(msg.cmd && msg.cmd === 'notifyRequest'){
				numReqs += 1;

				cluster.workers[id].send({numr: numReqs, pid:cluster.workers[id].process.pid});
			}
		});
	});

}else{
	require("./server.js");
}