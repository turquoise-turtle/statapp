//global variables
var graphDataset = [];
var joinedAxes = [];
var averageSet = {};
var bestSetIndex = false;
var linesForAxes = {};
var metadata, dataset;
var atLeastOne = false;
var getData = {};
var modelDifferences = {};

var db = new PouchDB('statapp', {auto_compaction: true});
db.info().then(function(){
	return sa.hash_data(db);
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	sa.l(metadata);
	var data = results[1].data;
	dataset = data;
	
	sa.el('#topicName').innerText = doc.name;
	sa.el('#xAxisLabel').innerText = doc.xName;
	
	//sa.l(dataset);
	
	best_option();
	
});

function best_option() {
	Object.keys(dataset).forEach(function(subtopic) {
		//for each subtopic's data, process it
		process_subtopic(subtopic);
// 		sa.l(linesForAxes);

	});
	
// 	sa.l(graphDataset);
// 	sa.l(averageSet);
// 	sa.l(joinedAxes);
	
	//display the best average (bestSetIndex was changed during process_subtopic if there was enough data)
	if (bestSetIndex !== false) {
		sa.l('there is a best option which is', averageSet[bestSetIndex]);
		//access the fMean property inside the object which is a property of the object averageSet
		//bestSetIndex is the name of the subtopic which has the best average
		var formattedMean = averageSet[bestSetIndex]['fMean'];
		var formattedSigma = averageSet[bestSetIndex]['fSigma'];
		//the \xB1 is a plus or minus sign ±
		var averageText = averageSet[bestSetIndex]['name'] + ' with an average of ' + formattedMean;
		//sometimes there's not enough data to find the standard deviation
		if (formattedSigma !== false) {
			averageText = averageText + ' \xB1 ' + formattedSigma;
		}
		sa.el('#bestAllRound').innerText = averageText;
	//if bestSetIndex does equal false, then there is no best topic, which means there's not enough data, so show a helpful message
	} else {
		sa.el('#allRound').innerHTML = 'It looks like there\'s not enough data for this topic. Go to the <a href="./record.html#' + window.location.hash.substr(1) + '" class="nice-link">Record Data</a> screen to enter some data';
		//and hide the input box
		sa.el('#computation').classList.add('hidden');
	}
	
	//if there's at least one working model (from process_subtopic again)
	if (atLeastOne) {
		//setup the input
		setup_input();
		sa.el('#calculateBest').addEventListener('click', check_the_data);
	} else {
		//there are no models, so hide it
		sa.el('#computation').classList.add('hidden');
	}
}

//a modified version of the function in results.js
//basically it goes through every data entry that was stored in the array (i.e. 'n123.4', 'h12:38', 'm58:57'), and processes it
function dataset_to_dataset(dataArray, xOrY) {
	var newList = [];
	for (var el of dataArray) {
		var realEl = sa.data_parse(el);
// 		sa.l(el, realEl);
		//if it is a date, then turn it into Unix time (the number of milliseconds after January 1st 1970)
		if (realEl instanceof Date) {
			realEl = realEl.getTime();
		}
		newList.push(realEl);
	}
	//sa.l(newList);
	return newList;
}

//join the x and y data arrays for the regression function
function joined_dataset(x, y) {
	var joinedList = [];
	for (var index = 0; index < x.length; index++) {
		//if the x or y value is a number (using double negatives, i.e. not not a number), then put it into the list
		if (!(isNaN(x[index]) || isNaN(y[index]))) {
			var joinedItem = [];
			joinedItem.push(x[index]);
			joinedItem.push(y[index]);
			
			joinedList.push(joinedItem);
// 			sa.l(joinedItem);
		}
	}
	return joinedList;
}


function process_subtopic(subtopic) {
	//sa.l(subtopic, dataset[subtopic]);
	
	//set up the current axis/subtopic dataset in separate arrays for the x and y values
	var currentAxisDataset = {name: subtopic};
	currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
	currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
	//store the dataset for the current subtopic in the global array of datasets
	graphDataset.push(currentAxisDataset);
	sa.l(currentAxisDataset.x,currentAxisDataset.y);
	
	//only go through and make/test models if there are enough datapoints
	if (currentAxisDataset.x.length > 1) {
		//set up the data in the current subtopic in an array of individual [x,y] arrays using the joined_dataset function
		var currentAxisJoined = joined_dataset(currentAxisDataset.x, currentAxisDataset.y);
		joinedAxes.push(currentAxisJoined);
	
		//generate the models using the library regression.js
		var linLine = regression.linear(currentAxisJoined)//, {precision: 40, order: 3});
		var expLine = regression.exponential(currentAxisJoined)//, {precision: 40, order: 3});
		var logLine = regression.logarithmic(currentAxisJoined)//, {precision: 40, order: 3});
		var powLine = regression.power(currentAxisJoined)//, {precision: 40, order: 3});
		var polyLine = regression.polynomial(currentAxisJoined)//, {precision: 40, order: 3});
		//put them all in one array of models
		var lineArray = [linLine, expLine, logLine, powLine, polyLine];
	
		//go through the models and disallow any that have a 0 as a coefficient, i.e y=0x + c will always equal c, so it's not a good approximation
		//or Infinity, or NaN (not a number);
		var doNotUse = [];
		if (linLine.equation[0] == 0 || linLine.equation[0] == Infinity || isNaN(linLine.equation[0])) {
			doNotUse.push(0);
		}
		if (expLine.equation.includes(0) || expLine.equation.includes(Infinity) || check_array_nan(expLine.equation)) {
			doNotUse.push(1);
		}
		if (logLine.equation[1] == 0 || logLine.equation[1] == Infinity || isNaN(logLine.equation[1])) {
			doNotUse.push(2);
		}
		if (powLine.equation.includes(0) || powLine.equation.includes(Infinity) || check_array_nan(powLine.equation)) {
			doNotUse.push(3);
		}
		//except the polynomial model, because that can have a y=0x^2 + 0.2x + c and still be valid
// 		sa.l(lineArray[4].equation, lineArray[4].equation.includes(0));
	
	
	
		//sa.empty_lines();
		
		//go through and do all the tests, using the current subtopic name, the data, the models, and the exclusion list
		var subtopicHasModel = generate_tests(subtopic, currentAxisDataset, lineArray, doNotUse);
		
		//the return value is an array, where the first value is a Boolean
		if (subtopicHasModel[0]) {
			//set that there is at least one subtopic with a working model
			atLeastOne = true;
		}
	}
	//only go through and make the averages if there is at least one value
	if (currentAxisDataset.x.length > 0) {
		sa.empty_lines();
		/*
			generate the averages
		*/
		
// 		sa.l(dataset[subtopic][1]);
// 		sa.l(currentAxisDataset.y);
		
		//use the average functions found near the bottom of this file
		var mean = mean_of_array(currentAxisDataset.y);
		var mode = mode_of_array(currentAxisDataset.y);
		var median = median_of_array(dataset[subtopic][1], dataset[subtopic][0]);
		var sigma = standard_deviation(currentAxisDataset.y);
		var newMean, newMode, newMedian, newSigma;
		
		//turn the average into text based on the data type
		if (metadata['yType'] == 'hmtime') {
			newMean = new Date(mean).getHours() + ':' + new Date(mean).getMinutes();
			newMode = new Date(mode).getHours() + ':' + new Date(mode).getMinutes();
			newMedian = new Date(median).getHours() + ':' + new Date(median).getMinutes();
			newSigma = new Date(sigma).getHours() + ':' + new Date(sigma).getMinutes();
		} else if  (metadata['yType'] == 'mstime') {
			newMean = new Date(mean).getMinutes() + ':' + new Date(mean).getSeconds();
			newMode = new Date(mode).getMinutes() + ':' + new Date(mode).getSeconds();
			newMedian = new Date(median).getMinutes() + ':' + new Date(median).getSeconds();
			newSigma = new Date(sigma).getMinutes() + ':' + new Date(sigma).getSeconds();
		} else {
			newMean = mean;
			newMode = mode;
			newMedian = median;
			newSigma = sigma;
		}
		sa.l('mean', newMean);
		sa.l('mode', newMode);
		sa.l('median', newMedian);
		sa.l('sigma sample', newSigma);
		
		
		//make an object with all the important average details from the current subtopic
		var currentAverageSet = {
			name: subtopic,
			mean: mean,
			fMean: newMean,
			sigma: sigma,
			fSigma: newSigma
		};
		//and put that object into the averageSet object
		averageSet[subtopic] = currentAverageSet;
		
		//the global variable bestSetIndex is initially false, so change it to this subtopic to be the first "best" average
		if (bestSetIndex === false) {
			bestSetIndex = subtopic;
			sa.l('first "better" option');
		} else if (metadata['yBetter'] == 'higher') {
			//otherwise if the preferred better value is higher than if the current subtopic's average is higher than the current best average, then update the best average to this
			if (mean > averageSet[bestSetIndex]['mean']) {
				bestSetIndex = subtopic;
				sa.l(newMean + ' is better');
			}
		} else {
			//otherwise if it's better to be lower, and it is lower, then update the best average
			if (mean < averageSet[bestSetIndex]['mean']) {
				bestSetIndex = subtopic;
				sa.l(newMean + ' is better');
			}
		}
		
		sa.l('');
	}
}

//go through all the tests for a given subtopic
function generate_tests(subtopicName, subtopicDataset, models, doNotUse, maxTests) {
	//the default maximum number of tests is 10
	maxTests = maxTests || 10;
	
	//a two dimensional array which stores all the results from the tests on each of the five models
	var test2dArray = [[],[],[],[],[]];
	
	//get the length of the dataset
	var datasetLength = subtopicDataset.x.length;
	//run these tests a maximum of maxTests (or length of dataset) times
	for (var currentTestIndex=0; currentTestIndex < maxTests && currentTestIndex < datasetLength; currentTestIndex++) {
	
		//generate a random index for the dataset, by generating a random decimal, multiplying it by the length of the dataset and rounding down
		//it works because Math.random() returns 0 <= number < 1, so e.g 0.99 * 10 = 9.9, round down is 9. so for an array of length 10, it makes sure that it only gets valid indices from 0 to 9 inclusive
		var randomIndex = Math.floor(Math.random() * datasetLength);
		
// 		sa.l(currentTestIndex);
		//the test x value and the actual y value
		var testX = subtopicDataset.x[randomIndex]
		var actualY = subtopicDataset.y[randomIndex]
		sa.l(randomIndex);
		//make sure that both the test x value and test y value are valid by continuing to generate if necessary
		while (isNaN(testX) || isNaN(actualY)) {
			sa.l(testX, actualY);
			randomIndex = Math.floor(Math.random() * datasetLength);
			testX = subtopicDataset.x[randomIndex];
			actualY = subtopicDataset.y[randomIndex];
		}
// 		sa.l(testX, actualY);
		
		//generate a list of expected y values for a given x value
		//.predict(x) returns an array of [x,y], so we get the y value
		var linTest = models[0].predict(testX)[1];
		var expTest = models[1].predict(testX)[1];
		var logTest = models[2].predict(testX)[1];
		var powTest = models[3].predict(testX)[1];
		var polyTest = models[4].predict(testX)[1];
		var rawTestArray = [linTest, expTest, logTest, powTest, polyTest];
		
		//loop over every predicted y value in the rawTestArray list
		var testArray = rawTestArray.map(function(predictedValue, index){
			if (isNaN(predictedValue)) {
// 				sa.l(index);
				//if the expected y value is Not a Number (NaN), then add false to the array instead
				test2dArray[index].push(false);
				return false;
			} else {
				//get the absolute difference between the expected y value and the actual y value
				var result = Math.abs(actualY - predictedValue);
				//pushes the test result for e.g. the linear model into an array with all other tests from the linear model
				test2dArray[index].push(result);
// 				sa.l(result, index);
				return result;
			}
		});
// 		sa.l(testArray);
// 		sa.l(sa.only_numbers(testArray));
	}
	
	sa.l(test2dArray);
	
	//flatten the two dimensional array by replacing the 2nd dimension array with an average of the results contained within it
	test2dArray = test2dArray.map(function(setOfTests) {
		return mean_of_array(setOfTests);
	});
	sa.l(test2dArray);
	
	//loop through the now flattened array to find the smallest average difference of the models, but ignore any models that were added to the doNotUse exclusion list
	var closestTestIndex = 0;
	var closestExists = false;
	for (var i=0; i < test2dArray.length; i++) {
		//doNotUse.includes will return a Boolean, the ! switches it to the other Boolean, i.e. !false == true
		//the other part of the if statement checks whether the value with index i is less than the current smallest value with index closestTestIndex, OR if index 0 is a valid model then it will initialise it as the smallest
		if (!doNotUse.includes(i) && (test2dArray[i] < test2dArray[closestTestIndex] || i == 0) ) {
			closestTestIndex = i;
			closestExists = true;
		}
		//this will initially check whether model 0 should be excluded, and increment the index so that model 1 will be compared next
		if (doNotUse.includes(closestTestIndex)) {
			closestTestIndex = closestTestIndex + 1;
			//but if all the models are excluded then the index will equal the length of the array, so we change it to false and will handle it later
			if (closestTestIndex == test2dArray.length) {
				closestTestIndex = false;
			}
		}
	}
	
	
	var returnValue;
	
	if (closestTestIndex !== false) {
		//if there is a valid test
		sa.l(test2dArray[closestTestIndex], closestTestIndex, models[closestTestIndex], test2dArray[closestTestIndex]);
		//store the best model in the linesForAxes object under the current subtopic's name
		linesForAxes[subtopicName] = models[closestTestIndex];
		//also store the average difference/error for that model
		modelDifferences[subtopicName] = test2dArray[closestTestIndex];
		returnValue = [true, closestTestIndex, test2dArray[closestTestIndex]];
	} else {
		sa.l('no equation');
		
		returnValue = [false];
	}
	
	return returnValue;
}

//setup the input as in the record data screen (see record.js for explanation)
function setup_input() {
	//the function goes through the user agent string, checks if it is an iOS device, and if it is it gets the iOS version number. found at https://gist.github.com/Craga89/2829457
	var iOS = parseFloat(
	('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
	.replace('undefined', '3_2').replace('_', '.').replace('_', '')
) || false;
	
	//get the type
	var type = metadata['xType'];
	//in this page, we only need to handle the x axis as an input
	var axis = sa.el('#xAxis');
	if (type === 'hmtime') {
		axis.type = 'tel';
		axis = new Cleave('#xAxis', {
			time: true,
			timePattern: ['h', 'm']
		});
		getData['x'] = function() {
			//sa.l(axis);
			return 'h' + axis.getFormattedValue();
		}
	} else if (type === 'mstime') {
		axis.type = 'tel';
		axis = new Cleave('#xAxis', {
			time: true,
			timePattern: ['m', 's']
		});
		getData['x'] = function() {
			//sa.l(axis);
			return 'm' + axis.getFormattedValue();
		}
	} else {
		if (iOS === false || iOS > 12.2) {
			axis.type = 'text';
			axis.inputmode = 'numeric';
			axis.pattern = '[+-]?\\d*\\.?\\d*';
		} else {
			axis.type = 'number'
		}
		getData['x'] = function() {
			//sa.l(axis);
			return 'n' + axis.value;
		}
	}
	sa.el('#xAxis').addEventListener('keydown', function(e) {
		//when the user presses enter (ASCII 13), it runs the same function as when the button is pressed
		if (e.keyCode === 13) {
			check_the_data(e);
		}
	});
}

//given an x value, predict the best y value
function calculate_the_best(predictThis) {
	var bestPrediction = null;
	//loop through every subtopic
	Object.keys(dataset).forEach(function(subtopic){
		//only make a prediction for the subtopic if the subtopic has a model
		if (subtopic in linesForAxes) {
			//use the .predict() function
			var predicted = linesForAxes[bestSetIndex].predict(predictThis)[1];
			sa.l(predicted, linesForAxes, predictThis, typeof predictThis);
			//check if there is a stored best prediction
			if (bestPrediction === null) {
				bestPrediction = {
					name: subtopic,
					prediction: predicted
				};
			} else {
				//check if the current best prediction is better than the stored best prediction, by being either higher or lower
				if (metadata['yBetter'] == 'higher' && predicted > bestPrediction.prediction) {
					bestPrediction = {
						name: subtopic,
						prediction: predicted
					};
				} else if (predicted < bestPrediction.prediction) {
					bestPrediction = {
						name: subtopic,
						prediction: predicted
					};
				}
			}
		}
		sa.l(bestPrediction);
	});
	//update the UI
	var resultText;
	if (bestPrediction.name == 'default') {
		resultText = 'The prediction for ' + getData.x().substr(1) + ' is: ';
	} else {
		resultText = 'The Best Option for ' + getData.x().substr(1) + ' is: ' + bestPrediction.name + ' with ';
	}
	
	//parse the prediction
	if (metadata['yType'] == 'hmtime') {
		//date_to_form(...) turns a Unix data into a hh:mm time
		var predicted = sa.date_to_form(bestPrediction.prediction);
		var predictionAccuracy = sa.date_to_form(modelDifferences[bestPrediction.name]);
// 		resultText = resultText + predicted ;
	} else if  (metadata['yType'] == 'mstime') {
		////date_to_form(...,true) turns a Unix data into a mm:ss time
		var predicted = sa.date_to_form(bestPrediction.prediction, true);
		var predictionAccuracy = sa.date_to_form(modelDifferences[bestPrediction.name], true);
// 		resultText = resultText + predicted + ' \xB1 ' + modelDifferences[bestPrediction.name];
	} else {
		//else the prediction is a number
		var predicted = bestPrediction.prediction;
		var predictionAccuracy = modelDifferences[bestPrediction.name];
// 		resultText = resultText + predicted + ' \xB1 ' + modelDifferences[bestPrediction.name];
	}
	resultText = resultText + predicted + ' \xB1 ' + predictionAccuracy;
	
	
	sa.el('#theBest').innerText = resultText;
}

function check_the_data(e) {
	//the validity class will highlight the input field if it's not valid
	sa.el('#app').classList.add('validity');
// 	var newResults = [];
	var xValue = getData.x();
// 	var yValue = getData.y();
	sa.l(xValue);
	//test the x value
	if (sa.test_data(xValue)) {
		//parse the value
		var parsed = sa.data_parse(xValue);
		if (parsed instanceof Date) {
			//turn it into Unix time
			parsed = parsed.getTime();
		}
		calculate_the_best(parsed);
	} else {
		//
		sa.l('invalid');
	}
}

//go through entire array and check if there is at least one element which is not a number
function check_array_nan(array) {
	var result = false;
	for (i=0; i < array.length; i++){
		if (isNaN(array[i])) {
			result = true;
		}
	}
	return result;
}



//calculate the mean average of an array
function mean_of_array(dataArray, sample) {
	sample = sample || false;
	var avg = false;
	//only do this if there is at least some element in the array
	if (dataArray.length) {
		//the idea for using the .reduce function (which is a function available on arrays) was found at https://stackoverflow.com/questions/10359907/array-sum-and-average#10624256
		//basically it lets you "reduce" an array into a single value, using the provided function
		//my provided function is just add the total so far plus the current value (the value at the current index of the array);
// 		sa.l(dataArray);
		var sum = dataArray.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		//the 0 just means start at index 0
		}, 0);
// 		sa.l(sum);
		if (sample && dataArray.length > 1) {
			//the minus one is used as a sample in the standard deviation
			var length = dataArray.length - 1;
		} else {
			var length = dataArray.length;
		}
		avg = sum / length;
	}
	if (avg == false) {
		sa.l(dataArray);
	}
	return avg;
}

//calculate the mode average of an array
function mode_of_array(dataArray) {
	var avg = false;
	if (dataArray.length) {
		var top = 'default_i';
		//.reduce applies a function to "reduce" the entire array into one value
		//here it just has an object which will count the number of times each value occurs
		var countedArray = dataArray.reduce(function (allValues, currentValue) {
			if (currentValue in allValues) {
				allValues[currentValue]++;
			} else {
				allValues[currentValue] = 1;
			}
			if (allValues[currentValue] > allValues[top]) {
				top = currentValue;
			}
			return allValues;
		//{'default_i':0} is the initial value
		}, {'default_i':0});
		avg = countedArray[top];
		//return [top, avg, countedArray];
		return top;
	}
	return avg;
}

//this median function is based on a function from https://gist.github.com/Daniel-Hug/7273430
function median_of_array(dataArray, xArray) {
	var avg = false;
	if (dataArray.length) {
		//this time we're sorting the two arrays based on the y axis
		var newXY = sa.selection_sort(dataArray, xArray);
		var newY = dataset_to_dataset(newXY[0]);
		var newX = dataset_to_dataset(newXY[1]);
	
		var mid = newY.length / 2;
		if (mid % 1) {
			avg = newY[mid - 0.5];
		} else {
// 			sa.l(newY[mid - 1], newY[mid]);
			avg = (newY[mid - 1] + newY[mid]) / 2;
		}
	}
	return avg;
}

function standard_deviation(dataArray) {
	var avg = false;
	if (dataArray.length > 1) {
		/*
			basically, from looking at https://www.mathsisfun.com/data/standard-deviation.html to revisit standard deviation:
			sigma/standard deviation = square root of variance
			variance = mean average of the squared differences of the mean
			squared difference of the mean = take a value, minus the mean, and square the result
		*/
		var mean = mean_of_array(dataArray);
		var squaredDifferences = dataArray.map(function(number) {
			var difference = number - mean;
			//raise the difference to the power of 2
			return Math.pow(difference, 2);
		});
		var variance = mean_of_array(squaredDifferences, true);
		var standardDeviation = Math.sqrt(variance);
		avg = standardDeviation;
	}
	return avg;
}