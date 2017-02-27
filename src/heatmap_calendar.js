//Version 0.3
function heatmap_calendar( pRegionId, pOptions, pPluginInitJavascript ) {

    var gOptions = jQuery.extend(
        {
            cellSize: 16,
            firstYear: 0,
            periods: 1,
            dayCaption: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
		    monthCaption: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		    repeatMonthCaption: false,
		    dateFormat: "%d.%m.%Y",
		    colorRange: ["white", "green"],
		    valueRange: [0,20],
		    showLegend: true
        },
        pOptions
    );

	if ( $.isFunction( pPluginInitJavascript ) ) {
		var newOptions = {};
        var changedCalOptions = pPluginInitJavascript( newOptions );

	    var gOptions = jQuery.extend(gOptions, newOptions);

    }

    if (gOptions.firstYear == 0) {
    		gOptions.firstYear = new Date().getFullYear()
    };

    gOptions.cellSize = parseInt(gOptions.cellSize);
    gOptions.firstYear = parseInt(gOptions.firstYear);
    gOptions.periods = parseInt(gOptions.periods);

	var margin = {
		top: 4,
		right: 8,
		bottom: 4,
		left: 4
	};

    var legend = {
    	ticks: 5,
    	width:  gOptions.cellSize * 15,
    	height: gOptions.cellSize
    };

    var captionSize = {
    	month: 24,
    	day: 34,
    	year: 14
    };

    var gRegion$ = jQuery( "#" + apex.util.escapeCSS( pRegionId ) + '_hc', apex.gPageContext$);

	var day = function(d) {
			return ( d.getDay() == 0 ) ? 6: d.getDay()-1;
		};

 	var week = d3.timeFormat("%W"),
	    format = d3.timeFormat("%Y%m%d"),
	    width = gOptions.cellSize * 53 + captionSize.day + captionSize.year + margin.left + margin.right+1;

    //define color range
    var color = d3.scaleLinear()
		.domain(gOptions.valueRange)
		.range(gOptions.colorRange);

	function _legendGradient( ) {
		//create separate svg for legend
		var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
			 .append("svg")
			 	.attr("width", width)
			 	.attr("height", legend.height*2 + margin.bottom)
	            .attr("id","key")
	            .attr("class","legend")
	            .append('g')
		            .attr("transform", "translate(" + (width - margin.right - legend.width) +",0)");

		//Append a defs (for definition) element to your SVG
		var defs = key.append("defs");

		//Append a linearGradient element to the defs and give it a unique id
		var linearGradient = defs.append("linearGradient")
		    .attr("id", "linear-gradient");

		//Horizontal gradient
		linearGradient
		    .attr("x1", "0%")
		    .attr("y1", "0%")
		    .attr("x2", "100%")
		    .attr("y2", "0%");

		//Append multiple color stops
		linearGradient.selectAll("stop")
			.data(gOptions.colorRange.slice(0, gOptions.valueRange.length))
			// .data(color.range())
				.enter().append("stop")
					.attr("offset", function(d,i){ return i/(color.range().length-1);})
					.attr("stop-color", function(d){ return d;});

		//color gradient rectangle
		key.append("rect")
			.attr("width", legend.width)
			.attr("height", legend.height)
			.attr("class", "colorscale")
			.style("fill", "url(#linear-gradient)");

		//Set scale for x-axis
		var xScale = d3.scaleLinear()
			.range([0, legend.width-1])
			.domain([gOptions.valueRange[0], gOptions.valueRange[gOptions.valueRange.length-1]]);

		//Define x-axis
		var axis = d3.axisBottom(xScale)
			.tickSize(0)
			.tickSizeInner(0)
			.tickPadding(3)
			.tickSizeOuter(0)
			.ticks(legend.ticks);

		key.append("g")
			.attr("transform", "translate(0," + (legend.height) +")")
			.call(axis);
	};

	function _legendBoxed() {
		var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
			.append("svg")
			 	.attr("width", width)
			 	.attr("height", legend.height*2 + margin.bottom)
	            .attr("id","key")
	            .attr("class","legend")
	            .append('g')
		            .attr("transform", "translate(" + (margin.left + captionSize.year + captionSize.day) +",0)");
	};

	function _legendDiscret() {
		var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
			.append("svg")
			 	.attr("width", width)
			 	.attr("height", legend.height + margin.bottom)
	            .attr("id","key")
	            .attr("class","legend")
	            .append('g')
		            .attr("transform", "translate(" + (margin.left + captionSize.year + captionSize.day) +",0)");

		//define data for legend
	    var legendColor = d3.scaleLinear()
			.range(gOptions.colorRange)
			.domain(d3.range(0, legend.ticks));

		var legendBreaks = d3.scaleLinear()
			.range(gOptions.valueRange)
			.interpolate(d3.interpolateRound)
			.domain(d3.range(0, legend.ticks));

        key.selectAll("rect")
            .data(d3.range(0, legend.ticks))
            .enter().append("rect")
		        .attr("class", "day")
		        .attr("width",gOptions.cellSize)
		        .attr("height",gOptions.cellSize)
	            .style("fill",function(d){return color(d); })
	            // .style("fill",function(d){return legendColor(d); })
		        .attr("x",function(d,i){return width/legend.ticks*i;})
		        .attr("y",0);

	        // key.selectAll("text")
	        //     .data(d3.range(1,7))
	        //     .enter()
	        //     .append("text")
	        //     .attr("x",function(d,i){
	        //         return (width/6*i + gOptions.cellSize+5);
	        //     })
	        //     .attr("y","0.8em")
	        //     .text(function(d,i){
	        //     	return ( i == 5 )? "over "+legendBreaks(5):"up to "+legendBreaks(d);
	        //     });
	};

	function _draw( pData ) {
		var svg = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' ).selectAll("svg")
		    .data(d3.range(gOptions.firstYear, gOptions.firstYear+gOptions.periods))
		  	.enter().append("svg")
				    .attr("width", width)
				    //add room for month caption if required
				    .attr("height", function(d, i){ return ((gOptions.cellSize * 7) + margin.top + margin.bottom) + (( gOptions.repeatMonthCaption || i == 0)? captionSize.month:0) ;})
				    .attr("class", gOptions.calendarClass)
				.append("g")
				    .attr("transform", function(d, i){return "translate(" + (captionSize.year + captionSize.day + margin.left) + "," +(margin.top + (( gOptions.repeatMonthCaption || i == 0)? captionSize.month:0)) + ")"});

		//caption: year
		svg.append("text")
	    .attr("transform", "translate(-" + captionSize.day + "," + gOptions.cellSize * 3.5 + ")rotate(-90)")
		    .attr("class", "year_caption")
		    .text(function(d) { return d; });

		//caption: weekdays
		var weekdays = svg.selectAll(".day_caption")
			.data (d3.range(0,7))
			.data ( gOptions.dayCaption )
			.enter().append("text")
			    .text(function(d) { return d ; })
				.attr("x", "-4")
			    .attr("dy", "-.3em")
				.attr("class", "day_caption")
			    .attr("y", function(d, i) { return gOptions.cellSize*(i+1); });

		//capton: month
		var month_captions = svg.selectAll(".month_caption");

		if ( ! gOptions.repeatMonthCaption ) {
			//keep only the first year
			month_captions._groups.splice(1,month_captions._groups.length);
		}
		month_captions
			.data(gOptions.monthCaption)
			.enter().append("text")
				.attr("class", "month_caption")
				.attr("x", function(d, i) { return ((i+1) * (gOptions.cellSize * 53 / 12)-gOptions.cellSize*1.2) ; })
				.attr("dy", "-.5em")
				.text(function(d,i){ return d });

		// days
		var rect = svg.selectAll(".day")
			.data(function(d) { return d3.timeDay.range(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		  	.enter().append("rect")
			    .attr("class", "day")
			    .attr("width", gOptions.cellSize)
			    .attr("height", gOptions.cellSize)
			    .attr("x", function(d) { return week(d) * gOptions.cellSize; })
			    .attr("y", function(d) { return day(d) * gOptions.cellSize; })
			    .datum(format) ;

		// put date to the cell
		rect.append("title")
		    .text(function(d) { return d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)); });

		// draw months borders
		svg.selectAll(".month")
	    	.data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
	  		.enter().append("path")
	    		.attr("class", "month")
	    		.attr("d", monthPath);

		function monthPath(t0) {
		  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
		      d0 = +day(t0), w0 = +week(t0),
		      d1 = +day(t1), w1 = +week(t1);
		  return "M" + (w0 + 1) * gOptions.cellSize + "," + d0 * gOptions.cellSize
		      + "H" + w0 * gOptions.cellSize + "V" + 7 * gOptions.cellSize
		      + "H" + w1 * gOptions.cellSize + "V" + (d1 + 1) * gOptions.cellSize
		      + "H" + (w1 + 1) * gOptions.cellSize + "V" + 0
		      + "H" + (w0 + 1) * gOptions.cellSize + "Z";
		}

		//legend
		if ( gOptions.showLegend ) {
			_legendGradient();
			// _legendDiscret();
		}

		var data = d3.nest()
			.key(function(e) {return e.date })
			.rollup(function(e) {return d3.sum(e, function(e){ return e.value; })})
			.object(pData.dateData);

		rect.filter(function(d) { return d in data; })
			.select("title")
			.text(function(d) { return d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)) + ": " + data[d]; });
		rect.filter(function(d) { return d in data; })
			.transition()
				.delay(function(d,i){return i*2;})
				.style('fill', function (d, i) {return color(data[d]);})
	}


    function _refresh() {
        apex.server.plugin(
            gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            },
            {
                dataType: "json",
                accept: "application/json",
                refreshObject: gRegion$,
                success: _draw,
                error:  _debug
            }
        );
    }

    function _debug( i ) {
        apex.debug.log( i );
    }


    gRegion$
        .on( "apexrefresh", _refresh )
        .trigger( "apexrefresh" );
}





