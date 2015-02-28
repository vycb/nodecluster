var fs = require('fs');

fs.readFile("index.html", 'utf8', function(err, data){
	if(err)
		console.log(err);

	debugger;
	var result = data.replace(/TODO/mg, 'DC58-E160-F472E1-56B6-C881');

	fs.writeFile("index.html", result, 'utf8', function(err){
		if(err)
			console.log(err);
	});
});