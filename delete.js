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


function no_topics() {
	sa.el('#subApp').innerHTML = '<h3>Huh. You don\'t have any topics to delete, why don\'t you go to the homepage?</h3><a href="./index.html">Homepage</a>';
// 	var header = document.createElement('h3');
// 	header.innerText = 'Huh. You don\'t have any topics to delete, why don\'t you go to the homepage?';
// 	var link = document.createElement('a');
}

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
	sa.sget(db, ['meta_topicList', dataStorage])
	.then(function(bulkReturn) {
		sa.l(bulkReturn);
		var metadata = bulkReturn[1][bulkReturn[0]['meta_topicList']];
		var list = metadata.list;
		for (var index in list) {
			if (list[index].id === topicId) {
				list.splice(index, 1);
			}
		}
		metadata.list = list;
		selectBox.remove(selectBox.selectedIndex);
		
		var dataItem = bulkReturn[1][bulkReturn[0][dataStorage]];
		dataItem._deleted = true;
		sa.l(metadata, dataItem)
		return sa.sset(db, [metadata, dataItem]);
	}).then(sa.l);
}