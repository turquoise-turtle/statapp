//set up mithril.js
var root = document.querySelector('#app');

var torenderlist = [];
for (var i = 0; i < 3; i++) {
	torenderlist.push(
		m('section', {'class':'card'}, [
			m('h3', 'Topic Name Here'),
			m('section', {'class':'card-links'}, [
				m('a', {'href':'#'}, 'Record Data'),
				m('a', {'href':'#'}, 'View Data'),
				m('a', {'href':'#'}, 'Best Option')
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

/*
space(){
	bulletlist.push({x: currentx, y:10})

bullet() {
	x
	y
	dy
	
	[
		{x: 20, y:10},
		{x:50, y:15}
	]
}

draw() {
	for () {
		y = y + dy
		if (y == 100) 
	}
}
*/