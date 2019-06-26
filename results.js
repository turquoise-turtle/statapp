var db = new PouchDB('statapp', {auto_compaction: true});
var metadata, dataset;
db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	var data = results[1].data;
	dataset = data;
	
	sa.el('#topicName').innerText = doc.name;
	sa.el('#bestOption').href = './bestoption.html#' + window.location.hash.substr(1);
	
	sa.l(dataset);
	var isThereData = false;
	Object.keys(dataset).forEach(function(subtopic) {
		if (dataset[subtopic][0].length > 0) {
			isThereData = true;
			sa.l(dataset[subtopic][0])
		}
	});
	
	if (isThereData) {
		graph_everything();
	} else {
		sa.el('#noData').innerHTML = 'It looks like there\'s not enough data for this topic. Go to the <a href="./record.html#' + window.location.hash.substr(1) + '" class="nice-link">Record Data</a> screen to enter some data';
		sa.el('#noData').classList.remove('hidden');
		sa.el('#graphType').classList.add('hidden');
		sa.el('#bestOption').classList.add('hidden');
	}
});

sa.el('#graphType').addEventListener('change', graph_everything);

function graph_everything() {
	var graphDataset = [];
	var layout = {
		showlegend: true
	};
	Object.keys(dataset).forEach(function(subtopic) {
		sa.l(subtopic, dataset[subtopic]);
		var currentAxisDataset = {
			name: subtopic//,
// 			line: {shape: 'linear'}
// 			line: {shape: 'spline'}
// 			line: {shape: 'hv'}
// 			line: {shape: 'vh'}
// 			line: {shape: 'hvh'}
// 			line: {shape: 'vhv'}
// 			line: {dash: 'solid',width: 4}
// 			line: {dash: 'dashdot',width: 4}
// 			line: {dash: 'dot',width: 4}
			
		};
		
		
		switch (sa.el('#graphType').value) {
			case 'scatter':
				currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
				currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
				currentAxisDataset.mode = 'lines+markers'//'lines+markers';
				currentAxisDataset.type = 'scatter';
				break;
			case 'box':
				currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
				currentAxisDataset.type = 'box';
				break;
// 			case 'histogram':
// 				currentAxisDataset.type = 'histogram';
// 				currentAxisDataset.histfunc = 'avg';
// 				currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
// 				currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y', true);
// 				break;
		}
		
		graphDataset.push(currentAxisDataset);
	});
	sa.l(graphDataset);
	
	
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
	
	var options = {
		displayModeBar: true,
		displaylogo: false,
		responsive: true
	}
	
	Plotly.newPlot('graphHere', graphDataset, layout, options);
}

function dataset_to_dataset(dataArray, xOrY, milliseconds) {
	milliseconds = milliseconds || false;
	var newList = [];
	for (var el of dataArray) {
		//it took ages to figure out to use a direct javascript Date object, rather than strings or numbers
		//like, here's a snippet of code from testing (that was showcased in a gif)
		/*
			OG example code: x: [1, 2, 3, 4],
			try 1: x: ['01:01', '02:02', '03:03', '04:04'],
			try 2: x: ['01:01:00', '02:02:00', '03:03:00', '04:04:00'],
			try 3: x: ['Mon Jun 03 2019 01:01:00 (Australian Eastern Standard Time)', 'Mon Jun 03 2019 02:02:00 (Australian Eastern Standard Time)', 'Mon Jun 03 2019 03:03:00 (Australian Eastern Standard Time)', 'Mon Jun 03 2019 04:04:00 (Australian Eastern Standard Time)'],
			try 4: (finally works if I use a direct javascript Date object, which I make with a helper function called d)
				x: [d(1,1), d(2,2), d(3,3), d(4,4)],
		*/
		var realEl = sa.data_parse(el);
		if (realEl instanceof Date && milliseconds) {
			realEl = realEl.getTime();
		}
		newList.push(realEl);
		
// 		if (metadata[xOrY + 'Type'] === 'htime' || metadata[xOrY + 'Type'] === 'mtime') {
// 			
// 			var realTime = sa.data_parse(el);
// 			
// 			//el = el.substr(1);
// 			//var time = el.split(':');
// 			//var realTime = d(time[0],time[1]);
// 			
// 			newList.push(realTime);
// 		} else {
// 			el = el.substr(1);
// 			newList.push(el);
// 		}
// 		//sa.l(el);
	}
	//sa.l(newList);
	return newList;
}



//scatter plot example from https://plot.ly/javascript/line-and-scatter/#line-and-scatter-plot
//bar chart example from https://plot.ly/javascript/bar-charts/#colored-and-styled-bar-chart
//box plot example from https://plot.ly/javascript/box-plots/#grouped-box-plot