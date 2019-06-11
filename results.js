//this function returns a javascript Date object, which plotly.js needs to properly use it in an axis
//so it just initialises it to the current day, and sets the hours or minutes
function d(h,m) {
	return new Date(new Date().setHours(h,m,0,0));
}



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
	
	sa.l(dataset);
	
	graph_everything();
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
// 				currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
// 				break;
		}
		
		graphDataset.push(currentAxisDataset);
	});
	sa.l(graphDataset);
	
	
	for (var xOrY of ['x', 'y']) {
		if (metadata[xOrY + 'Type'] === 'time') {
			layout[xOrY + 'axis'] = {
				tickformat: '%H:%M',
				title: metadata[xOrY + 'Name']
			}
		} else {
			layout[xOrY + 'axis'] = {
				title: metadata[xOrY + 'Name']
			}
		}
	}
	
	var options = {
		displayModeBar: true,
		displaylogo: false,
		responsive: true
	}
	
	Plotly.newPlot('graphHere', graphDataset, layout, options);
}

function dataset_to_dataset(dataArray, xOrY) {
	var newList = [];
	for (var el of dataArray) {
		if (metadata[xOrY + 'Type'] === 'time') {
			el = el.substr(1);
			var time = el.split(':');
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
			var realTime = d(time[0],time[1]);
			
			newList.push(realTime);
		} else {
			el = el.substr(1);
			newList.push(el);
		}
		//sa.l(el);
	}
	//sa.l(newList);
	return newList;
}



//scatter plot example from https://plot.ly/javascript/line-and-scatter/#line-and-scatter-plot
//bar chart example from https://plot.ly/javascript/bar-charts/#colored-and-styled-bar-chart
//box plot example from https://plot.ly/javascript/box-plots/#grouped-box-plot