//for functions that start with 'sa.' see statapp.js

//set up a new or existing database
var db = new PouchDB('statapp', {auto_compaction: true});

//wait till the db is open
db.info().then(function (info) {
	console.log(info);
	//get the document 'meta_initialised' to see if the db has been setup
	return sa.sget(db, 'meta_initialised');
}).then(function(e) {
	//this will run if there is a document called 'meta_initialised', and if there is that means the db has been initialised
	return sa.sget(db, 'meta_topicList');
}).then(function(doc) {
	//sa.l(doc, doc.list)
	sa.l(doc.list);
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
var root = sa.el('#app');

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
	m.render(root, m('section.center-text', {'class':'no-topics'}, [
// 		m('h3', 'Hey there, it looks like you\'re new.'),
		m('h2', 'Welcome to StatApp'),
		m('h3', 'You can create a topic which can store data along both an x and y axis, and view the results as a graph or see the best option.'),
		m('h3', 'Click the Create Topic button to start')
	]))
	
	sa.el('#deleteLink').parentNode.removeChild(sa.el('#deleteLink'))
}

//this function will generate the code using the templating engine mithril.js
function topic_ise(topic) {
	return m('section', {'class':'card'}, [
			//using topic.name & topic.id lets the function run on each record that came from the array of records
			m('h3', topic.name),
			m('section', {'class':'card-links'}, [
				m('a.nice-links', {'href':'./record.html#' + topic.id}, 'Record Data |'),
				m('a.nice-links', {'href':'./results.html#' + topic.id}, 'View Data |'),
				m('a.nice-links', {'href':'./bestoption.html#' + topic.id}, 'Best Option')
			])
		]);
}