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
	
	if (doc.xType === 'time') {
		var xInput = {
			time: true,
			timePattern: ['h', 'm']
		};
	} else {
		var xInput = {
			numeral: true,
			numeralDecimalScale: 10,
			numeralThousandsGroupStyle: 'none'
		}
	}
	xAxis = new Cleave('#xAxis', xInput);
	
	if (doc.yType === 'time') {
		var yInput = {
			time: true,
			timePattern: ['h', 'm']
		};
	} else {
		var yInput = {
			numeral: true,
			numeralDecimalScale: 10,
			numeralThousandsGroupStyle: 'none'
		}
	}
	yAxis = new Cleave('#yAxis', yInput);
	
	var data = results[1].data;
	
	sa.el('#saveData').addEventListener('click', save_the_data);
	
	
	sa.l(doc, data);
})

var xAxis, yAxis, metadata;

function save_the_data(e) {
	var xValue = xAxis.getRawValue();
	var yValue = yAxis.getRawValue();
	//if (metadata
}