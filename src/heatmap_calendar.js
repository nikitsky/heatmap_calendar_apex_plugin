var
    // cellSize = 17,
    week_days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];



var day = function(d) {
		return ( d.getDay() == 0 ) ? 6: d.getDay()-1;
	}
    week = d3.timeFormat("%W"),

    parseDate = d3.timeParse("%d.%m.%Y"),
    format = d3.timeFormat("%Y-%m-%d");
    // format = d3.timeFormat("%d.%m.%Y");

    width = cellSize * 53 + 51;
    height = cellSize * 7 + 31;

var svg = d3.select("#" + regionID + '_hc').selectAll("svg")
    .data(d3.range(2016, 2019))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
  .append("g") //allign calendar middle-bottom
    // .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    .attr("transform", "translate(50, 30)");

	//caption: year
	svg.append("text")
    // .attr("transform", "translate(-36," + cellSize * 3.5 + ")rotate(-90)")
	    .attr("dy", "-.25em")
	    .attr("class", "year_caption")
	    .text(function(d) { return d; });

	//caption: weekdays
	var weekdays = svg.selectAll(".days_caption")
		.data (d3.range(0,7))
		.data ( week_days )
		.enter().append("text")
			.attr("class", "days_caption")
			.attr("x", "-5")
		    .attr("y", function(d, i) { return cellSize*(i+1); })
		    // .attr("transform", function(d, i) { return "translate(-5," + cellSize*(i+1) + ")"; })
		    .attr("dy", "-.25em")
		    .text(function(d) { return d ; });

	//capton: month
	var legend = svg.selectAll(".months_caption")
		.data(month)
		.enter().append("text")
			.attr("class", "months_caption")
			.attr("x", function(d, i) { return ((i+1) * (cellSize * 53 / 12)-cellSize*1.5) ; })
			.attr("dy", "-.5em")
			.text(function(d,i){ return d });

	// days
	var rect = svg.selectAll(".day")
	    .data(function(d) { return d3.timeDay.range(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
	  .enter().append("rect")
	    .attr("class", "day")
	    .attr("width", cellSize)
	    .attr("height", cellSize)
	    .attr("x", function(d) { return week(d) * cellSize; })
	    .attr("y", function(d) { return day(d) * cellSize; })
	    .datum(format);

	rect.append("title")
	    .text(function(d) { return d; });

	svg.selectAll(".month")
    	.data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  		.enter().append("path")
    		.attr("class", "month")
    		.attr("d", monthPath);

	function monthPath(t0) {
	  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
	      d0 = +day(t0), w0 = +week(t0),
	      d1 = +day(t1), w1 = +week(t1);
	  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
	      + "H" + w0 * cellSize + "V" + 7 * cellSize
	      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
	      + "H" + (w1 + 1) * cellSize + "V" + 0
	      + "H" + (w0 + 1) * cellSize + "Z";
	}
