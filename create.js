//this subtopic section draws a lot of inspiration from https://www.w3schools.com/howto/howto_js_todolist.asp
sa.el('#addCurrentSubtopic').addEventListener('click', function(event) {
	event.preventDefault();
	var listItem = document.createElement('li');
	var subtopicName = sa.el('#currentSubtopic').value;
	sa.el('#currentSubtopic').value = '';
	var text = document.createElement('span');
	text.innerText = subtopicName
	text.className = 'subtopicListItem';
	listItem.append(text);
	if (subtopicName === '') {
		//alert('You must write something');
	} else {
		sa.el('#subtopics').appendChild(listItem);
	}
	
	var span = document.createElement('span');
	var closeText = document.createTextNode('\u00D7');
	span.className = 'close';
	span.appendChild(closeText);
	listItem.appendChild(span);
	span.onclick = delete_subtopic;
});
function delete_subtopic(event) {
	//this function deletes the list item element
	var listItem = event.currentTarget.parentNode;
	listItem.parentNode.removeChild(listItem);
}

/*
the function below creates a Universally Unique IDentifier [UUID](http:en.wikipedia.org/wiki/Universally_unique_identifier) for each topic and was found at https:gist.github.com/jed/982883#file-annotated-js.

the function was modified so that the function name was uuid instead of b

__basically__,
		if there's a parameter it returns a random number from 0 to 15 in hexadecimal
		or if the parameter is 8 it returns a random number from 0 to 11 in hexadecimal,
		otherwise it generates '10000000-1000-4000-80000000-100000000000' (using the notation 1e7 etc (in 1e7, e means the computer term for * 10^ (multiply by 10 to the power of what comes next), so 1e7 = 1 * 10^7 = 10000000)),
		and then replaces the zeroes, ones and eights with random numbers from 0 to 15 in hexadecimal
		by using the original function itself (it calls itself and passes in the individual zeroes, ones and eights to get a random hex number).
		the result is a valid UUID (basically there's the RFC which sets a lot of standards, and they have a technical standard for a lot of things, so there's a certain place where a 4 needs to be, and only certain numbers can be in other certain positions)

Q: why did I want to use a UUID?
A: because I don't want the topic name to become the ID for the topic stored in the database (even though the user will only see the ID in the hash parameter, and the topic name will be used in the user interface), because the user could potentially try to make multiple topics with the same name, and that causes conflicts, and so it's generally best practice to use a random identifier so that you can be sure you're working with the right record when you're potentially working with a large volume of records. Also, the function I picked was an example of 'code golf', where people try to get the code to complete a certain purpose in the shortest amount of code necessary (which I've messed up by writing 19 times as many characters in describing it)

tl;dr I looked up "how to make a unique ID javascript", found a StackOverflow question, followed that to a GitHub Gist where this person posted their code and an annotated version which explained it, and wrote this long comment about it
*/
function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

//run the function save_topic when the save button is clicked
sa.el('#saveTopic').addEventListener('click', save_topic);
function save_topic(event) {
	event.preventDefault();
	
	var topicName = sa.el('#topicName').value;
	
	var subtopicsArray = [];
	var subtopicList = sa.el('#subtopics');//need to loop through this
	subtopicList.querySelectorAll('li').forEach(function (listItem) {
		sa.l(listItem);
		var text = listItem.querySelector('.subtopicListItem').innerText;
		subtopicsArray.push(text);
	});
	
	var xName = sa.el('#xName').value;
	var xType = sa.el('#xType').value;
	var xMinBool = sa.el('#xMinBool').checked;
	var xMinValue = sa.el('#xMinValue').value;
	
	var yName = sa.el('#yName').value;
	var yType = sa.el('#yType').value;
	var yMinBool = sa.el('#yMinBool').checked;
	var yMinValue = sa.el('#yMinValue').value;
	
	//the following goes through all inputs, finds which ones have the attribute name="y_better" and then picks which one is checked https://stackoverflow.com/a/15839451/
	var yBetter = sa.el('input[name="y_better"]:checked').value;
	
	sa.l(topicName, subtopicList, xName, xType, xMinBool, xMinValue, yName, yType, yMinBool, yMinValue, yBetter, uuid());
}

