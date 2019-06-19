var db = new PouchDB('statapp', {auto_compaction: true});
var metadata, dataset;
db.info().then(function(){
	return sa.hash_data(db)
}).then(function(results) {
	var doc = results[0];
	metadata = doc;
	sa.l(metadata)
	var data = results[1].data;
	dataset = data;
	
	sa.el('#topicName').innerText = doc.name;
	
	//sa.l(dataset);
	
	best_option();
	
});
var linesForAxes
function best_option() {
	var graphDataset = [];
	var joinedAxes = [];
	var averageSet = [];
	var bestSetIndex = false;
	linesForAxes = {};
	
	Object.keys(dataset).forEach(function(subtopic) {
		//sa.l(subtopic, dataset[subtopic]);
		var currentAxisDataset = {name: subtopic};
		currentAxisDataset.x = dataset_to_dataset(dataset[subtopic][0], 'x');
		currentAxisDataset.y = dataset_to_dataset(dataset[subtopic][1], 'y');
// 		sa.l(currentAxisDataset.x[0],currentAxisDataset.y[0])
		
		var currentAxisJoined = joined_dataset(currentAxisDataset.x, currentAxisDataset.y);
		joinedAxes.push(currentAxisJoined);
		
		var linLine = regression.linear(currentAxisJoined)//, {precision: 40, order: 3})
		var expLine = regression.exponential(currentAxisJoined)//, {precision: 40, order: 3})
		var logLine = regression.logarithmic(currentAxisJoined)//, {precision: 40, order: 3})
		var powLine = regression.power(currentAxisJoined)//, {precision: 40, order: 3})
		var polyLine = regression.polynomial(currentAxisJoined)//, {precision: 40, order: 3})
		
		
		
		var lineArray = [linLine, expLine, logLine, powLine, polyLine];
		//go through the functions for the array, and disallow any that have a 0, i.e y=0x + c will always equal c, so it's not a good approximation
		var doNotUse = [];
		for (var i=0; i<lineArray.length-1; i++) {
			//sa.l(t.equation);
			sa.l(lineArray[i].equation, lineArray[i].equation.includes(0))
			if (lineArray[i].equation.includes(0)) {
				doNotUse.push(i);
			}
		}
		sa.l(lineArray[4].equation, lineArray[4].equation.includes(0))
		//a two dimensional array
		var test2dArray = [[],[],[],[],[]];
		
// 		sa.empty_lines()
		
		for (var currentTestIndex=0; currentTestIndex < 10 && currentTestIndex < currentAxisDataset.x.length; currentTestIndex++) {
// 			sa.l(currentTestIndex)
			var testX = currentAxisDataset.x[currentTestIndex]
			var testY = currentAxisDataset.y[currentTestIndex]
// 			sa.l(testX, testY);
			
// 			sa.l(linLine.predict(testX))
// 			sa.l(expLine.predict(testX))
// 			sa.l(logLine.predict(testX))
// 			sa.l(powLine.predict(testX))
// 			sa.l(polyLine.predict(testX))
		
			var linTest = linLine.predict(testX)[1];
			var expTest = expLine.predict(testX)[1];
			var logTest = logLine.predict(testX)[1];
			var powTest = powLine.predict(testX)[1];
			var polyTest = polyLine.predict(testX)[1];
			var rawTestArray = [linTest, expTest, logTest, powTest, polyTest];
// 			sa.l(test2dArray[2])
			var testArray = rawTestArray.map(function(testValue, index){
				var result = Math.abs(testY - testValue);
				//pushes the test result for e.g. the linear model into an array with all other tests from the linear model
				test2dArray[index].push(result);
// 				sa.l(result, index)
				return result;
			});
// 			sa.l(testArray)
			
			var closestTest = Math.min.apply(null, testArray);
			var closestTestIndex = testArray.indexOf(closestTest)
// 			sa.l(closestTest, closestTestIndex, lineArray[closestTestIndex])
		}
		
// 		sa.l(test2dArray);
		test2dArray = test2dArray.map(function(setOfTests) {
			return mean_of_array(setOfTests);
		});
		
		var clTestIndex = 0;
// 		var startIndex = clTestIndex;
		for (var i=0; i<test2dArray.length; i++) {
			if (test2dArray[i] < test2dArray[clTestIndex] && !doNotUse.includes(i)) {
				clTestIndex = i;
			}
			if (doNotUse.includes(clTestIndex)) {
				clTestIndex = clTestIndex + 1;
				if (clTestIndex == test2dArray.length) {
					clTestIndex = false;
				}
			}
		}
		
		if (clTestIndex !== false) {
			//var closestTest = Math.min.apply(null, test2dArray);
			//sa.l(test2dArray, closestTest)
			//var closestTestIndex = test2dArray.indexOf(closestTest)
			console.warn(test2dArray[clTestIndex], clTestIndex, lineArray[clTestIndex], test2dArray[clTestIndex])
			linesForAxes[subtopic] = lineArray[clTestIndex];
		} else {
			console.error('no equation');
		}
		
		
// 		sa.empty_lines()
		
// 		sa.l(dataset[subtopic][1]);
// 		sa.l(currentAxisDataset.y);
		
		var mean = mean_of_array(currentAxisDataset.y);
		var mode = mode_of_array(currentAxisDataset.y);
		var median = median_of_array(dataset[subtopic][1], dataset[subtopic][0]);
		var sigma = standard_deviation(currentAxisDataset.y);
		
		
		if (metadata['yType'] == 'hmtime') {
			newMean = [new Date(mean).getHours(), new Date(mean).getMinutes()];
			newMode = [new Date(mode).getHours(), new Date(mode).getMinutes()];
			newMedian = [new Date(median).getHours(), new Date(median).getMinutes()];
			newSigma = [new Date(sigma).getHours(), new Date(sigma).getMinutes()];
		} else if  (metadata['yType'] == 'mstime') {
			newMean = [new Date(mean).getMinutes(), new Date(mean).getSeconds()];
			newMode = [new Date(mode).getMinutes(), new Date(mode).getSeconds()];
			newMedian = [new Date(median).getMinutes(), new Date(median).getSeconds()];
			newSigma = [new Date(sigma).getMinutes(), new Date(sigma).getSeconds()];
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
		
		var currentAverageSet = {
			name: subtopic,
			mean: mean,
			fMean: newMean,
			sigma: sigma,
			fSigma: newSigma
		};
		averageSet.push(currentAverageSet);
		graphDataset.push(currentAxisDataset);
		
		if (bestSetIndex === false) {
			bestSetIndex = averageSet.length - 1;
			sa.l('first "better" option');
		} else if (metadata['yBetter'] == 'higher') {
			if (mean > averageSet[bestSetIndex]['mean']) {
				bestSetIndex = averageSet.length - 1;
				sa.l(newMean + ' is better');
			}
		} else {
			if (mean < averageSet[bestSetIndex]['mean']) {
				bestSetIndex = averageSet.length - 1;
				sa.l(newMean + ' is better');
			}
		}
		
		sa.l('')
	});
// 	sa.l(graphDataset);
	sa.l(averageSet);
	sa.l(joinedAxes);
	
	if (bestSetIndex !== false) {
		//var bestSetIndex = 0;
		//for (var avgSet 
		sa.l('there is a best option')
		sa.el('#bestAllRound').innerText = averageSet[bestSetIndex]['name'];
	}
}

function dataset_to_dataset(dataArray, xOrY) {
	var newList = [];
	for (var el of dataArray) {
		var realEl = sa.data_parse(el);
// 		sa.l(el, realEl)
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
		var joinedItem = [];
		joinedItem.push(x[index]);
		joinedItem.push(y[index]);
		joinedList.push(joinedItem);
// 		sa.l(joinedItem);
	}
	return joinedList;
}

//calculate the mean average of an array
function mean_of_array(dataArray, sample) {
	sample = sample || false;
	var avg = false;
	if (dataArray.length) {
		//the idea for using the .reduce function (which is a function available on arrays) was found at https://stackoverflow.com/questions/10359907/array-sum-and-average#10624256
		//basically it lets you "reduce" an array into a single value, using the provided function
		//my provided function is just add the total so far plus the current value (the value at the current index of the array)
// 		sa.l(dataArray)
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
		sa.l(dataArray)
	}
	return avg;
}

//calculate the mode average of an array
function mode_of_array(dataArray) {
	var avg = false;
	if (dataArray.length) {
		var top = 'default_i';
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
		}, {'default_i':0});
		var avg = countedArray[top];
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