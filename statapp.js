//this file is my own mini javascript library that I made to consolidate the common functions of my project, using the IIFE (immediately invoked function expression) javascript pattern

//window is the global scope, .sa means assign a property called sa to the global scope, with the returned value from the following code.
//Basically, an IIFE (the code after this first equals sign), lets you have a self-contained scope, and then you get to return in the object {} only specific functions or variables that you defined. This lets you have a public API of functions which you can access, which themselves use private functions that you can't access.
window.sa = (function() {
	
	//basically a function that calls the normal console.log, but lets it be used with a different name
	//found at https://transitory.technology/console-log/
	var l = function () {
		return Function.prototype.bind.call(console.log, console);
	} ();
	
	//basically a function that calls the normal document.querySelector which returns the HTML element
	var el = function (query) {
		return document.querySelector(query);
	};
	//as well as the normal document.querySelectorAll which returns an array of HTML elements
	var mel = function (query) {
		return document.querySelectorAll(query);
	}
	
	//why deep copy and not regular var b = a;?
	//https://stackoverflow.com/questions/184710/what-is-the-difference-between-a-deep-copy-and-a-shallow-copy
	//deep copy an array from https://stackoverflow.com/a/37503916/
	Array.prototype.clone = function(){
		return this.map(e => Array.isArray(e) ? e.clone() : e);
	};
	//deep copy an object found at http://jsben.ch/bWfk9
	var objcopy = function(originalObject) {
		return Object.assign({}, originalObject);
	};
	
	//sget is the Storage GET function that I made to make accessing the db easier
	//it gets a parameter of the db reference, and optionally another parameter of what to get
	var sget = function(dbref, stuff) {
		//make sure that the parameter 'stuff' is assigned to something
		//if it is then keep it the same, otherwise if the parameter is missing, set 'stuff' to null using the OR pipes: '|| null'
		stuff = stuff || null;
		
		//if stuff is equal to null, then return the entire contents of the db
		if (stuff === null) {
			return dbref.allDocs({include_docs: true});
		}
		
		//if stuff is an array...
		if (stuff.constructor === Array) {
			//debug('array')
			var list = [];
			var description = {};
			//loop through every item in the array. a 'for ... in' loop sets 'item' to be the value of the index of the current element, whereas a 'for ... of' loop would set 'item' to be the current element
			for (var item in stuff) {
				//right now, 'list.push(dbref...' is pushing the function call 'dbref.get(...' into the array 'list'. in other words, it runs 'dbref.get(...' but because it is an asynchronous function you don't know when it will finish, so we append/push it to a list to keep track of it / to put the results into a list
				list.push(dbref.get(stuff[item]));
				//this adds a property to an object with the key being the name and the value being the index
				//e.g. if the current element was 'meta_initialised' and the index was 0, it would essentially add to the object so description = {'meta_initialised': 0}
				//it's just a helper so that I can make sure I have the right index
				description[stuff[item]] = item;
			}
			//because of the asynchronous functions all now being in an array 'list', Promise.all will wait till all of the async functions inside it have finished before returning the final result
			var promiselist = Promise.all(list);
			return Promise.all([desc, promiselist]);
		}
		
		//if stuff is just a string, get that specific document
		if (typeof stuff === 'string') {
			return dbref.get(stuff);
		}
		
		//you may have noticed that I put a return in each if statement, so that it won't continue through the subroutine because it's not necessary.
		//but if stuff has gotten past all those if statements, then it's an object {} which has specific parameters for searching through all the documents, as seen on https://pouchdb.com/api.html#batch_fetch
		//because the base data type in javascript is an object {}, I thought it best to not use an if statement here, because there's no other data type I'd put into this function than nothing/array/string/object
		return db.allDocs(stuff);
	}
	
	//sset is the Storage SET function that I made to make putting stuff in the db easier
	//it gets a parameter of the db reference, and what to put into the database
	this.sset = function (dbref, stuff) {
		//this time it's a simple if array use the function to bulk put elements in the db...
		if (stuff.constructor === Array) {
			return dbref.bulkDocs(stuff);
		}
		//...or put the singular document into the db
		return dbref.put(stuff);
	}
	
	hash_data = function(dbref) {
		var hash = window.location.hash.substr(1);
		var id = 'data_' + hash;
		//sget(dbref, ['meta_topicList', id])
		
		return Promise.all([topic_metadata(dbref, hash), sget(dbref, id)])
		//.then(function(results) {
		//	l(results);
		//})
	};
	
	topic_metadata = function(dbref, findId) {
		return sget(dbref, 'meta_topicList')
		.then(function(doc) {
			//a linear search algorithm that returns either the found topic or false
			var list = doc.list;
			//var found = false;
			for (var topic of list) {
				if (topic.id === findId) {
					//found = true;
					return topic;
				}
			}
			return false;
		})
	};
	
	//return a publicly available set of functions which are named below, which can use the private functions that aren't named
	return {
		l: l,
		el: el,
		mel: mel,
		objcopy: objcopy,
		sget: sget,
		sset: sset,
		hash_data: hash_data
	}
}());