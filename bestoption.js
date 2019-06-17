var db = new PouchDB('statapp', {auto_compaction: true});
var metadata, dataset;
db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	//sa.l(metadata)
	var data = results[1].data;
	dataset = data;
	
	sa.el('#topicName').innerText = doc.name;
	
	//sa.l(dataset);
	
	best_option();
	
});
function best_option() {
	var graphDataset = [];
	Object.keys(dataset).forEach(function(subtopic) {
		//sa.l(subtopic, dataset[subtopic]);
		var currentAxisDataset = {};
		currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
		currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
		
		
		graphDataset.push(currentAxisDataset);
	});
	sa.l(graphDataset);
	
	/*
	for (var xOrY of ['x', 'y']) {
		layout[xOrY + 'axis'] = {
			title: metadata[xOrY + 'Name']
		}
		if (metadata[xOrY + 'Type'] === 'hmtime') {
			layout[xOrY + 'axis']['tickformat'] =  '%H:%M';
		} else if (metadata[xOrY + 'Type'] === 'mstime') {
			layout[xOrY + 'axis']['tickformat'] =  '%M:%S';
		}
	}
	*/
}

function dataset_to_dataset(dataArray, xOrY) {
	var newList = [];
	for (var el of dataArray) {
		var realEl = sa.data_parse(el);
		if (realEl instanceof Date) {
			realEl = realEl.getTime();
		}
		newList.push(realEl);
	}
	//sa.l(newList);
	return newList;
}

