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

    if (gOptions.firstYear == 0) {
    		gOptions.firstYear = new Date().getFullYear()
    };

	if ( $.isFunction( pPluginInitJavascript ) ) {
		var newOptions = {};
        var changedCalOptions = pPluginInitJavascript( newOptions );

	    var gOptions = jQuery.extend(gOptions, newOptions);

    }

    gOptions.cellSize = parseInt(gOptions.cellSize);
    gOptions.firstYear = parseInt(gOptions.firstYear);
    gOptions.periods = parseInt(gOptions.periods);

    var gRegion$ = jQuery( "#" + apex.util.escapeCSS( pRegionId ) + '_hc', apex.gPageContext$);

	var day = function(d) {
			return ( d.getDay() == 0 ) ? 6: d.getDay()-1;
		}
    week = d3.timeFormat("%W"),
    format = d3.timeFormat("%Y%m%d");
    width = gOptions.cellSize * 53 + 51;
    height = gOptions.cellSize * 7 + 31;

    //define color range
    var color = d3.scaleLinear()
		.range(gOptions.colorRange)
		.domain(gOptions.valueRange);

	function _draw( pData ) {
		var svg = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' ).selectAll("svg")
		    .data(d3.range(gOptions.firstYear, gOptions.firstYear+gOptions.periods))
		  	.enter().append("svg")
				    .attr("width", width)
				    //add 30px for month caption if required
				    .attr("height", function(d, i){ return (gOptions.cellSize * 7) + (( gOptions.repeatMonthCaption || i == 0)? 31:2) ;})
				    .attr("class", gOptions.calendarClass)
				.append("g")
				    .attr("transform", function(d, i){return "translate(50," +(( gOptions.repeatMonthCaption || i == 0)? 30:1) + ")"});

		//caption: year
		svg.append("text")
	    .attr("transform", "translate(-36," + gOptions.cellSize * 3.5 + ")rotate(-90)")
		    .attr("class", "year_caption")
		    .text(function(d) { return d; });

		//caption: weekdays
		var weekdays = svg.selectAll(".day_caption")
			.data (d3.range(0,7))
			.data ( gOptions.dayCaption )
			.enter().append("text")
			    .text(function(d) { return d ; })
				.attr("x", "-5")
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
			var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
				 .append("svg")
				 	.attr("width", width)
				 	.attr("height", pOptions.cellSize*2)
		            .attr("id","key")
		            .attr("class","legend")
		            .append('g')
			            .attr("transform", "translate(50," + gOptions.cellSize*.5 +")");

			//define data for legend
		    var legendColor = d3.scaleLinear()
				.range(gOptions.colorRange)
				.domain(d3.range(0, gOptions.colorRange.length));
				// .domain([0,5]);

			var legendBreaks = d3.scaleLinear()
				.range(gOptions.valueRange)
				.interpolate(d3.interpolateRound)
				.domain([0,5]);

	        key.selectAll("rect")
	            .data(d3.range(1,7))
	            .enter().append("rect")
			        .attr("class", "day")
			        .attr("width",gOptions.cellSize)
			        .attr("height",gOptions.cellSize)
		            .style("fill",function(d){return color(d); })
		            // .style("fill",function(d){return legendColor(d); })
			        .attr("x",function(d,i){return width/6*i;})
			        .attr("y",0);

	        key.selectAll("text")
	            .data(d3.range(1,7))
	            .enter()
	            .append("text")
	            .attr("x",function(d,i){
	                return (width/6*i + gOptions.cellSize+5);
	            })
	            .attr("y","0.8em")
	            .text(function(d,i){
	            	return ( i == 5 )? "over "+legendBreaks(5):"up to "+legendBreaks(d);
	            });
		}

		var data = d3.nest()
			.key(function(e) {return e.date })
			.rollup(function(e) {return d3.sum(e, function(e){ return e.value; })})
			.object(pData.dateData);

		rect.filter(function(d) { return d in data; })
			.select("title")
			.text(function(d) { return d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)) + ": " + data[d]; });
		rect.filter(function(d) { return d in data; })
			.transition().delay(function(d,i){return i/2;})
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





