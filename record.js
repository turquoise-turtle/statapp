var db = new PouchDB('statapp', {auto_compaction: true});

db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
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
	
	var data = results[1];
	
	
	sa.l(doc, data);
})