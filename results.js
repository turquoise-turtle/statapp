//scatter plot example from https://plot.ly/javascript/line-and-scatter/#line-and-scatter-plot
var trace1 = {
  x: [1, 2, 3, 4],
  y: [10, 15, 13, 17],
  mode: 'lines',
  type: 'scatter'
};

var trace2 = {
  x: [2, 3, 4, 5],
  y: [16, 5, 11, 9],
  mode: 'lines',
  type: 'scatter'
};

var trace3 = {
  x: [1, 2, 3, 4],
  y: [12, 9, 15, 12],
  mode: 'lines',
  type: 'scatter'
};

var data = [trace1, trace2, trace3];

Plotly.newPlot('drawHere', data, {showlegend: true}, {displayModeBar: true, displaylogo: false, responsive: true});

//bar chart example from https://plot.ly/javascript/bar-charts/#colored-and-styled-bar-chart
var trace1 = {
  x: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012],
  y: [219, 146, 112, 127, 124, 180, 236, 207, 236, 263, 350, 430, 474, 526, 488, 537, 500, 439],
  name: 'Rest of world',
  marker: {color: 'rgb(55, 83, 109)'},
  type: 'bar'
};

var trace2 = {
  x: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012],
  y: [16, 13, 10, 11, 28, 37, 43, 55, 56, 88, 105, 156, 270, 299, 340, 403, 549, 499],
  name: 'China',
  marker: {color: 'rgb(26, 118, 255)'},
  type: 'bar'
};

var data = [trace1, trace2];

var layout = {
  title: 'US Export of Plastic Scrap',
  xaxis: {tickfont: {
      size: 14,
      color: 'rgb(107, 107, 107)'
    }},
  yaxis: {
    title: 'USD (millions)',
    titlefont: {
      size: 16,
      color: 'rgb(107, 107, 107)'
    },
    tickfont: {
      size: 14,
      color: 'rgb(107, 107, 107)'
    }
  },
  legend: {
    x: 0,
    y: 1.0,
    bgcolor: 'rgba(255, 255, 255, 0)',
    bordercolor: 'rgba(255, 255, 255, 0)'
  },
  barmode: 'group',
  bargap: 0.15,
  bargroupgap: 0.1
};

Plotly.newPlot('myDiv2', data, layout, {responsive: true});

//box plot example from https://plot.ly/javascript/box-plots/#grouped-box-plot
var x = ['day 1', 'day 1', 'day 1', 'day 1', 'day 1', 'day 1',
         'day 2', 'day 2', 'day 2', 'day 2', 'day 2', 'day 2']

var trace1 = {
  y: [0.2, 0.2, 0.6, 1.0, 0.5, 0.4, 0.2, 0.7, 0.9, 0.1, 0.5, 0.3],
  x: x,
  name: 'kale',
  marker: {color: '#3D9970'},
  type: 'box'
};

var trace2 = {
  y: [0.6, 0.7, 0.3, 0.6, 0.0, 0.5, 0.7, 0.9, 0.5, 0.8, 0.7, 0.2],
  x: x,
  name: 'radishes',
  marker: {color: '#FF4136'},
  type: 'box'
};

var trace3 = {
  y: [0.1, 0.3, 0.1, 0.9, 0.6, 0.6, 0.9, 1.0, 0.3, 0.6, 0.8, 0.5],
  x: x,
  name: 'carrots',
  marker: {color: '#FF851B'},
  type: 'box'
};

var data = [trace1, trace2, trace3];

var layout = {
  yaxis: {
    title: 'normalized moisture',
    zeroline: false
  },
  boxmode: 'group'
};

Plotly.newPlot('myDiv3', data, layout, {responsive: true});