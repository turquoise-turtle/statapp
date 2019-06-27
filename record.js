var db = new PouchDB('statapp', {auto_compaction: true});

db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	sa.el('#topicName').innerText = doc.name;
	sa.el('#xAxisLabel').innerText = doc.xName;
	sa.el('#yAxisLabel').innerText = doc.yName;
	//only show the select box if there's more than one subtopic
	if (doc.subtopics.length < 1) {
		sa.el('#subtopicChoice').classList.add('hidden');
		sa.el('#subtopicChoiceLabel').classList.add('hidden');
	} else if (doc.subtopics.length === 1) {
		var option = document.createElement('option');
		option.value = doc.subtopics[0];
		option.innerText = doc.subtopics[0];
		sa.el('#subtopicChoice').appendChild(option);
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
var minMaxGood;

function setup_inputs(xOrY) {
	//the function goes through the user agent string, checks if it is an iOS device, and if it is it gets the iOS version number. found at https://gist.github.com/Craga89/2829457
	var iOS = parseFloat(
	('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
	.replace('undefined', '3_2').replace('_', '.').replace('_', '')
) || false;
	
	//get the type
	var type = metadata[xOrY + 'Type'];
	//get the input box for the axis
	var axis = sa.el('#' + xOrY + 'Axis');
	if (type === 'hmtime') {
		//hh:mm data
		//make it look like a telephone numpad for phones
		axis.type = 'tel';
		//use Cleave.js to format the input if it's a time (it handles input masking, which is how it validates the time and puts the ':' in the input box automatically)
		axis = new Cleave('#' + xOrY + 'Axis', {
			time: true,
			timePattern: ['h', 'm']
		});
		//make a function stored at the x or y property of the global getData object which will return the value
		getData[xOrY] = function() {
			//sa.l(axis);
			//prefix with h for hh:mm time
			return 'h' + axis.getFormattedValue();
		}
	} else if (type === 'mstime') {
		//mm:ss data
		axis.type = 'tel';
		axis = new Cleave('#' + xOrY + 'Axis', {
			time: true,
			timePattern: ['m', 's']
		});
		getData[xOrY] = function() {
			//sa.l(axis);
			//prefix with m for mm:ss time
			return 'm' + axis.getFormattedValue();
		}
	} else {
		//it is a number
		
		//because of iOS idiosyncrasies detailed in the Log v
		if (iOS === false || iOS > 12.2) {
			axis.type = 'text';
			axis.inputmode = 'numeric';
			axis.pattern = '[+-]?\\d*\\.?\\d*';
		} else {
			axis.type = 'number';
		}
		// ^
		getData[xOrY] = function() {
			//sa.l(axis);
			//prefix with n for a number
			return 'n' + axis.value;
		}
	}
	sa.el('#' + xOrY + 'Axis').addEventListener('keydown', function(e) {
		//when the user presses enter (ASCII 13) in either input box, it runs the same function as when the record data button is pressed, i.e. save the data
		if (e.keyCode === 13) {
			save_the_data(e);
		}
	})
}

function save_the_data(e) {
	//this function runs when the button is clicked
	sa.el('#app').classList.add('validity');
	var newResults = [];
	var xValue = getData.x();
	var yValue = getData.y();
	sa.l(xValue, yValue);
	//if the x value is good
	if (sa.test_data(xValue)) {
		//and the y value is good
		if (sa.test_data(yValue)) {
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

//make sure that the keyboard doesn't obscure the inputs by scrolling the input into view
document.querySelectorAll('input').forEach(function(el){
	el.addEventListener('focus', function(e){
		el.scrollIntoView(false);
	})
});


function notify(good, xOrY) {
	if (good === false) {
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
	//get the data document
	.then(function(results) {
		sa.l(results.data);
		var newData = sa.deep_clone(results.data);
		//test the subtopic length
		if (metadata.subtopics.length === 0) {
			//default is the subtopic name if there's no subtopics
			newData.default[0].push(x);
			newData.default[1].push(y);
			
			var oldX = sa.deep_clone(newData.default[0]);
			var oldY = sa.deep_clone(newData.default[1]);
			
			//run the selection sort after adding the data to the array
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
		//save data to database
		return sa.sset(db, results)
	}).then(function(){
		sa.el('#saveStatus').classList.remove('hidden');
		setTimeout(function() {
			sa.el('#saveStatus').classList.add('hidden');
			setTimeout(function() {
				location.href = './results.html#' + window.location.hash.substr(1);
				location.reload();
			}, 100);
		}, 2800);
	});
}