function process_subtopic(subtopic) {
	//sa.l(subtopic, dataset[subtopic]);
	
	//set up the current axis/subtopic dataset in separate arrays for the x and y values
	var currentAxisDataset = {name: subtopic};
	currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
	currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
	//store the dataset for the current subtopic in the global array of datasets
	graphDataset.push(currentAxisDataset);
// 	sa.l(currentAxisDataset.x[0],currentAxisDataset.y[0])
	
	//set up the data in the current subtopic in an array of individual [x,y] arrays using the joined_dataset function
	var currentAxisJoined = joined_dataset(currentAxisDataset.x, currentAxisDataset.y);
	joinedAxes.push(currentAxisJoined);
	
	//generate the models using the library regression.js
	var linLine = regression.linear(currentAxisJoined)//, {precision: 40, order: 3})
	var expLine = regression.exponential(currentAxisJoined)//, {precision: 40, order: 3})
	var logLine = regression.logarithmic(currentAxisJoined)//, {precision: 40, order: 3})
	var powLine = regression.power(currentAxisJoined)//, {precision: 40, order: 3})
	var polyLine = regression.polynomial(currentAxisJoined)//, {precision: 40, order: 3})
	//put them all in one array of models
	var lineArray = [linLine, expLine, logLine, powLine, polyLine];
	
	//go through the models and disallow any that have a 0 as a coefficient, i.e y=0x + c will always equal c, so it's not a good approximation
	var doNotUse = [];
	if (linLine.equation[0] == 0) {
		doNotUse.push(0);
	}
	if (expLine.equation.includes(0)) {
		doNotUse.push(1);
	}
	if (logLine.equation[1] == 0) {
		doNotUse.push(2);
	}
	if (powLine.equation.includes(0)) {
		doNotUse.push(3);
	}
	//except the polynomial model, because that can have a y=0x^2 + 0.2x + c and still be valid
	sa.l(lineArray[4].equation, lineArray[4].equation.includes(0))
	
	//a two dimensional array which stores all the results from the tests on each of the five models
	var test2dArray = [[],[],[],[],[]];
	
// 	sa.empty_lines()

	
}