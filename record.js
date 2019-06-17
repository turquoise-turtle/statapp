var db = new PouchDB('statapp', {auto_compaction: true});

db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	sa.el('#topicName').innerText = doc.name;
	sa.el('#xAxisLabel').innerText = doc.xName;
	sa.el('#yAxisLabel').innerText = doc.yName;
	if (doc.subtopics.length <= 1) {
		sa.el('#subtopicChoice').classList.add('hidden');
		sa.el('#subtopicChoiceLabel').classList.add('hidden');
	} else {
		sa.el('#subtopicChoice').innerHTML = '';
		doc.subtopics.map(function(individualSubtopic) {
			var option = document.createElement('option');
			option.value = individualSubtopic;
			option.innerText = individualSubtopic;
			sa.el('#subtopicChoice').appendChild(option);
		});
	}
	
	setup_inputs('x');
	setup_inputs('y');
	
	var data = results[1].data;
	
	sa.el('#saveData').addEventListener('click', save_the_data);
	
	
	sa.l(doc, data);
})

var xAxis, yAxis, metadata;
var getData = {};

function setup_inputs(xOrY, type) {
	//the function goes through the user agent string, checks if it is an iOS device, and if it is it gets the iOS version number. found at https://gist.github.com/Craga89/2829457
	var iOS = parseFloat(
	('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
	.replace('undefined', '3_2').replace('_', '.').replace('_', '')
) || false;

	var type = metadata[xOrY + 'Type'];
	var axis = sa.el('#' + xOrY + 'Axis');
	if (type === 'hmtime') {
		axis.type = 'tel';
		axis = new Cleave('#' + xOrY + 'Axis', {
			time: true,
			timePattern: ['h', 'm']
		});
		getData[xOrY] = function() {
			//sa.l(axis);
			return 'h' + axis.getFormattedValue();
		}
	} else if (type === 'mstime') {
		axis.type = 'tel';
		axis = new Cleave('#' + xOrY + 'Axis', {
			time: true,
			timePattern: ['m', 's']
		});
		getData[xOrY] = function() {
			//sa.l(axis);
			return 'm' + axis.getFormattedValue();
		}
	} else {
		if (iOS === false || iOS > 12.2) {
			axis.type = 'text';
			axis.inputmode = 'numeric';
			axis.pattern = '[+-]?\\d*\\.?\\d*';
		} else {
			axis.type = 'number'
		}
		getData[xOrY] = function() {
			//sa.l(axis);
			return 'n' + axis.value;
		}
	}
}

function save_the_data(e) {
	var newResults = [];
	var xValue = getData.x();
	var yValue = getData.y();
	sa.l(xValue, yValue);
	if (test_data(xValue)) {
		if (test_data(yValue)) {
			//good
			notify(true);
			real_save_data(xValue, yValue);
		} else {
			notify(false, 'y');
		}
	} else {
		notify(false, 'x');
	}
}

document.querySelectorAll('input').forEach(function(el){
	el.addEventListener('focus', function(e){
		el.scrollIntoView(false);
	})
});

function test_data(value) {
	if (value !== value.replace('h', '') || value !== value.replace('m', '')) {
		//time
		if (value.replace('h', '').length < 5 || value.replace('m', '').length < 5) {
			//not a full time
			return false;
		} else {
			//"It's always a good time" ((c) Owl City)
			return true;
		}
	} else {
		//number
		value = value.replace('n', '');
		var numberRegex = /^[+-]?\d*\.?\d*$/g;
		if (numberRegex.test(value)) {
			//good number
			return true;
		} else {
			//bad number
			return false;
		}
	}
}

function notify(good, xOrY) {
	if (!good) {
		//not good
		sa.l('bad values', xOrY);
	} else {
		sa.l('good values');
	}
}

function real_save_data(x,y) {
	var hash = window.location.hash.substr(1);
	var id = 'data_' + hash;
	return sa.sget(db, id)
	.then(function(results) {
		sa.l(results.data);
		var newData = sa.deep_clone(results.data);
		//test the subtopic length
		if (metadata.subtopics.length === 0) {
			//default
			newData.default[0].push(x);
			newData.default[1].push(y);
			
			var oldX = sa.deep_clone(newData.default[0]);
			var oldY = sa.deep_clone(newData.default[1]);
			
			var newXY = sa.selection_sort(oldX, oldY);
			newData.default[0] = newXY[0];
			newData.default[1] = newXY[1];
			
		} else {
			var currentSubtopic = sa.el('#subtopicChoice').value;
			newData[currentSubtopic][0].push(x);
			newData[currentSubtopic][1].push(y);
			
			var oldX = sa.deep_clone(newData[currentSubtopic][0]);
			var oldY = sa.deep_clone(newData[currentSubtopic][1]);
			
			var newXY = sa.selection_sort(oldX, oldY);
			newData[currentSubtopic][0] = newXY[0];
			newData[currentSubtopic][1] = newXY[1];
		}
		sa.l(newData);
		results.data = newData;
		return sa.sset(db, results)
	}).then(function(){
		sa.el('#saveStatus').classList.remove('hidden');
		setTimeout(function() {
			sa.el('#saveStatus').classList.add('hidden');
			setTimeout(function() {
				//location.href = './results.html#' + window.location.hash.substr(1);
				location.reload();
			}, 100);
		}, 1000);
	});
}