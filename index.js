//for functions that start with 'sa.' see statapp.js

//set up a new or existing database
var db = new PouchDB('statapp');

//wait till the db is open
db.info().then(function (info) {
	console.log(info);
	//get the document 'meta_initialised' to see if the db has been setup
	return sa.sget(db, 'meta_initialised');
}).then(function(e) {
	//this will run if there is a document called 'meta_initialised', and if there is that means the db has been initialised
	return sa.sget(db, 'meta_topicList');
}).then(function(doc) {
	sa.l(doc)
	if (doc.list.length == 0) {
		//if there's no topics
		basic_single_topic();
	} else {
		//the 'map' function is called on 'doc.list' (the array of records), and calls the function 'topic_ise' on each element in the array. it's a helpful javascript thing to call a function on everything in an array and return an array of results, rather than having to write a whole 'for (var ... of ... ) {...}' loop
		var toRenderList = doc.list.map(topic_ise)
		//sa.l(toRenderList)
		m.render(root, toRenderList);
	}
	
}).catch(function(e) {
	//this will run if there is an error...
	if (e.reason == 'missing') {
		if (e.docId == 'meta_initialised') {
			//... if the document is missing then we can initialise the db here
			//initialise database
			initialise_db(db);
			basic_single_topic();
		}
	} else {
		//there's a different error so log it to the console
		console.error(e)
	}
});
	


//set root to the document which has the ID 'app'
var root = document.querySelector('#app');

//this function will initialise the db
function initialise_db(dbref) {
	var meta_initialised = {'_id': 'meta_initialised', 'value': true};
	var meta_topicList = {'_id': 'meta_topicList', 'list': []};
	return sa.sset(dbref, [meta_initialised, meta_topicList]);
}

//this function will run to place the single heading that the user doesn't have any topics
function basic_single_topic() {
	//m.render takes an element (root is the 'app' element from above) and the m function
	//it creates a 'section' element, with the 'no-topics' class, and inside that section element is a h3 header with the text
	m.render(root, m('section', {'class':'no-topics'}, [
		m('h3', 'Huh, it looks like you don’t have any topics. Click the plus button to create one')
	]))
}

//this function will generate the code using the templating engine mithril.js
function topic_ise(topic) {
	return m('section', {'class':'card'}, [
			//using topic.name & topic.id lets the function run on each record that came from the array of records
			m('h3', topic.name),
			m('section', {'class':'card-links'}, [
				m('a', {'href':'./record.html#' + topic.id}, 'Record Data'),
				m('a', {'href':'./results.html#' + topic.id}, 'View Data'),
				m('a', {'href':'./bestoption.html#' + topic.id}, 'Best Option')
			])
		]);
}


/*
var torenderlist = [];
for (var i = 0; i < 3; i++) {
	torenderlist.push(
		m('section', {'class':'card'}, [
			m('h3', 'Topic Name Here'),
			m('section', {'class':'card-links'}, [
				m('a', {'href':'./record.html#'}, 'Record Data'),
				m('a', {'href':'./results.html#'}, 'View Data'),
				m('a', {'href':'./bestoption.html#'}, 'Best Option')
			])
		])
	);
}
m.render(root, torenderlist)
*/