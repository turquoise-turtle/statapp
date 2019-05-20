//this file is my own mini javascript library that I made to consolidate the common functions of my project, using the IIFE (immediately invoked function expression) javascript pattern

//window is the global scope, .sa means assign a property called sa to the global scope, with the returned value from the following code.
//Basically, an IIFE (the code after this first equals sign), lets you have a self-contained scope, and then you get to return in the object {} only specific functions or variables that you defined. This lets you have a public API of functions which you can access, which themselves use private functions that you can't access.
window.sa = (function() {
	//basically a function that calls the normal console.log, but lets it be used with a different name
	//found at https://transitory.technology/console-log/
	var debug = function () {
		return Function.prototype.bind.call(console.log, console);
	} ();
	
	return {
		l: debug
	}
}());