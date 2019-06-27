var selectBox = sa.el('#topicList')
var db = new PouchDB('statapp', {auto_compaction: true});
db.info().then(function (info) {
	sa.l(info);
	return sa.sget(db, 'meta_initialised');
}).then(function(e) {
	return sa.sget(db, 'meta_topicList');
}).then(function(doc) {
	sa.l(doc)
	if (doc.list.length == 0) {
		//if there's no topics
		no_topics();
	} else {
		var toRenderList = doc.list.map(topic_to_option)
		m.render(selectBox, toRenderList);
	}
}).catch(function(e) {
	if (e.reason == 'missing') {
		if (e.docId == 'meta_initialised') {
			no_topics();
		}
	} else {
		console.error(e)
	}
});

//show a message if there's no data
function no_topics() {
	sa.el('#subApp').innerHTML = '<h3>Huh. You don\'t have any topics to delete, why don\'t you go to the homepage?</h3><a href="./index.html">Homepage</a>';
}

//turn each topic into an option in a select box
function topic_to_option(topic) {
	return m('option[value=' + topic.id + ']', topic.name);
}

var deleteButton = sa.el('#deleteTopic');
deleteButton.addEventListener('click', function(event) {
	var confirmation = confirm('Are you sure you want to delete the topic?');
	if (confirmation) {
		delete_topic(sa.el('#topicList').value);
	}
});

function delete_topic(topicId) {
	var dataStorage = 'data_' + topicId;
	//get both the metadata and the data document
	sa.sget(db, ['meta_topicList', dataStorage])
	.then(function(bulkReturn) {
		sa.l(bulkReturn);
		//the metadata of all topics is bulkReturn[1] (an array) and just to make sure we get the right document, we passed the index of it into an object at bulkReturn[0]['meta_topicList']
		//so it basically becomes array[1][index]
		var metadata = bulkReturn[1][bulkReturn[0]['meta_topicList']];
		var list = metadata.list;
		for (var index in list) {
			if (list[index].id === topicId) {
				//.splice removes that item from the array
				list.splice(index, 1);
			}
		}
		metadata.list = list;
		selectBox.remove(selectBox.selectedIndex);
		
		//similar to before
		var dataItem = bulkReturn[1][bulkReturn[0][dataStorage]];
		//set it to delete
		dataItem._deleted = true;
		sa.l(metadata, dataItem)
		return sa.sset(db, [metadata, dataItem]);
	}).then(sa.l);
}