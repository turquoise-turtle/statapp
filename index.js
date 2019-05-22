//set up mithril.js
var root = document.querySelector('#app');

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

/*m('section', {'class':'card'}, [
	m('h3', 'Topic Name Here'),
	m('section', {'class':'card-links'}, [
		m('a', {'href':'#'}, 'Record Data'),
		m('a', {'href':'#'}, 'View Data'),
		m('a', {'href':'#'}, 'Best Option')
	])
])*/

m.render(root, torenderlist)

// var topiclist = [];

// if (topiclist.length == 0) {
// 	var torenderlist = [
// 		m('section', {class: 'topic-card'}, [
// 			m('h1', {class: 'topic-heading'}, 'You don\'t have topics')
// 		])
// 	];
// }

// m.render(root, torenderlist);