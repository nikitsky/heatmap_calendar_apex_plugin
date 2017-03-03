//Version 1.0
function heatmap_calendar( pRegionId, pOptions, pPluginInitJavascript ) {

	var gSpinner, gDayRect, gTooltip;

    var gOptions = jQuery.extend(
        {
            cellSize: 16,
            firstYear: 0,
            periods: 1,
            dayCaption: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
		    monthCaption: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		    repeatMonthCaption: false,
		    dateFormat: "%d.%m.%Y",
		    colorRange: [],
		    valueRange: [],
		    startValue: 0,
		    endValue: "auto",
		    startColor: "white",
		    endColor: "green",
		    legendType: "gradient",
		    tooltipEnabled: true,
		    tooltipClass: "heatmap_tooltip_defaut",
		    legendTicks: 5,
			marginTop: 4,
			marginRight: 8,
			marginBottom: 4,
			marginLeft: 4,
	    	captionMonthSize: 24,
	    	captionDaySize: 34,
	    	captionYearSize: 14
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

    var legend = {
    	width:  gOptions.cellSize * 15,
    	height: gOptions.cellSize
    };

    var gRegion$ = jQuery( "#" + apex.util.escapeCSS( pRegionId ) + '_hc', apex.gPageContext$);

	var day = function(d) {
			return ( d.getDay() == 0 ) ? 6: d.getDay()-1;
		};

 	var week = d3.timeFormat("%W"),
	    format = d3.timeFormat("%Y%m%d"),
	    width = gOptions.cellSize * 53 + gOptions.captionDaySize + gOptions.captionYearSize + gOptions.marginLeft + gOptions.marginRight+1;

	gRegion$
        .on( "apexrefresh", _refresh )
        .trigger( "apexrefresh" );

    //main function
    function _refresh() {
        gSpinner = apex.widget.waitPopup();
        _drawCalendar();
        apex.server.plugin(
            gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            },
            {
                dataType: "json",
                accept: "application/json",
                refreshObject: gRegion$,
                success: _fillColour,
                error:  _debug
            }
        );
    }

	function _drawCalendar() {
		if ( gOptions.tooltipEnabled ) {
			gTooltip = d3.select( "body" )
		        .append("div")
		        .attr("class",  "heatmap_tooltip " + gOptions.tooltipClass)
		        .style("position", "absolute")
		        .style("visibility", "hidden");
		};

	 	var svg = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' ).selectAll("svg")
		    .data(d3.range(gOptions.firstYear, gOptions.firstYear+gOptions.periods))
		  	.enter().append("svg")
				    .attr("width", width)
				    //add room for month caption if required
				    .attr("height", function(d, i){ return ((gOptions.cellSize * 7) + gOptions.marginTop + gOptions.marginBottom) + (( gOptions.repeatMonthCaption || i == 0)? gOptions.captionMonthSize:0) ;})
				    .attr("class", gOptions.calendarClass)
				.append("g")
				    .attr("transform", function(d, i){return "translate(" + (gOptions.captionYearSize + gOptions.captionDaySize + gOptions.marginLeft) + "," +(gOptions.marginTop + (( gOptions.repeatMonthCaption || i == 0)? gOptions.captionMonthSize:0)) + ")"});

		//caption: year
		svg.append("text")
	    .attr("transform", "translate(-" + gOptions.captionDaySize + "," + gOptions.cellSize * 3.5 + ")rotate(-90)")
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
		gDayRect = svg.selectAll(".day")
			.data(function(d) { return d3.timeDay.range(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		  	.enter().append("rect")
			    .attr("class", "day")
			    .attr("width", gOptions.cellSize)
			    .attr("height", gOptions.cellSize)
			    .attr("x", function(d) { return week(d) * gOptions.cellSize; })
			    .attr("y", function(d) { return day(d) * gOptions.cellSize; })
			    .datum(format) ;

		// put date to the cell only of tooltips are disabled
		if ( ! gOptions.tooltipEnabled ) {
			gDayRect.append("title")
			    .text(function(d) { return d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)); });
		};

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
	};

	function _fillColour ( pData ){
		//Aggregate labels data
		var dataLabels = d3.nest()
			.key(function(e) {return e.date })
			.rollup(function(e) {
				return {value: d3.sum(e, function(e){ return e.value; }), labels: cleanArray(e.map(function(s){return (s.label)?s.label:""; }))};
			})
			.object(pData.dateData);

		//define display range. if valueRange array length less then 2, the startValue and endValue attributes are used
		if ( typeof gOptions.valueRange == "undefined" || !gOptions.valueRange.constructor == Array || gOptions.valueRange.length<2) {

			gOptions.valueRange = [];

			// if startValue attribute is not number then the minimum value from the data used
			if ( ! isNaN(+gOptions.startValue) ) {
				gOptions.valueRange[0] = parseInt(gOptions.startValue);
			} else {
				gOptions.valueRange[0] = d3.min(d3.values(dataLabels).map(function (s) { return s.value;}));
			}

			// if endValue attribute is not number then the maximum value from the data used
			if ( ! isNaN(+gOptions.endValue) ) {
				gOptions.valueRange[1] = parseInt(gOptions.endValue);
			} else {
				gOptions.valueRange[1] = d3.max(d3.values(dataLabels).map(function (s) { return s.value;}));
			}
		}

		if ( typeof gOptions.colorRange == "undefined" || ! gOptions.colorRange.constructor == Array || gOptions.colorRange.length<2) {
			gOptions.colorRange = [];
			gOptions.colorRange[0] = gOptions.startColor;
			gOptions.colorRange[1] = gOptions.endColor;
		}

	    //define color range
	    var color = d3.scaleLinear()
			.domain(gOptions.valueRange)
			.range(gOptions.colorRange);

		gSpinner.remove();

		//colour the days
		gDayRect.filter(function(d) { return d in dataLabels; })
			.transition()
				.delay(function(d,i){return i*2;})
				.style('fill', function (d, i) {return color(dataLabels[d].value);});

		//add text only of tooltips are disabled
		if ( ! gOptions.tooltipEnabled ) {
			gDayRect.filter(function(d) { return d in dataLabels; })
				.select("title")
				.html(function(d) {
					var lLabels = "";
					for (i in dataLabels[d].labels) {
						lLabels += "<br>"+dataLabels[d].labels[i];
					};
					return d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)) + ": " + dataLabels[d].value + lLabels;
				});
		};

		//tooltip generator
        if ( gOptions.tooltipEnabled ) {
	        gDayRect.on('mouseover', function(d, i, j) {
		      if ( d ) {
				var lTooltipText = d3.timeFormat(gOptions.dateFormat)(d3.timeParse("%Y%m%d")(d)) ;
				if ( dataLabels[d] != undefined ) {
					lTooltipText += ": "+dataLabels[d].value;
					var lTooltipLabel = "";
					for (i in dataLabels[d].labels) {
						lTooltipLabel += ((i > 0)?"<br>":"")+dataLabels[d].labels[i];
					};
				} else {
					lTooltipText += ": 0";
					lTooltipLabel = "";
				};
		        gTooltip.html('<div class="caption">' + lTooltipText + '</div>' +((lTooltipLabel.length>0)?'<div class="labels">' + lTooltipLabel + '</div>':''));
		        gTooltip.style("visibility", "visible");
		      } else
		          gTooltip.style("visibility", "hidden");
		      })
		      .on('mouseout', function(d, i, j) {
		          gTooltip.style("visibility", "hidden");
		      })
		      .on("mousemove", function(d, i) {
		          gTooltip.style("top", (d3.event.pageY + 10) + "px").style("left", (d3.event.pageX + 10) + "px");
		      });
        };

		//legend
		switch ( gOptions.legendType ) {
			case "gradient":
				 _legendGradient();
				 break;
			case "discrete":
				_legendDiscrete();
				break;
			default:
				{}
		}

		function _legendGradient( ) {
			//create separate svg for legend
			var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
				 .append("svg")
				 	.attr("width", width)
				 	.attr("height", legend.height*2 + gOptions.marginBottom)
		            .attr("id","key")
		            .attr("class","legend")
		            .append('g')
			            .attr("transform", "translate(" + (width - gOptions.marginRight - legend.width) +",0)");

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
				.ticks(gOptions.legendTicks);

			key.append("g")
				.attr("transform", "translate(0," + (legend.height) +")")
				.call(axis);
		};

		function _legendDiscrete() {
			var key = d3.select( "#" + apex.util.escapeCSS( pRegionId ) + '_hc' )
				.append("svg")
				 	.attr("width", width)
				 	.attr("height", legend.height + gOptions.marginBottom)
		            .attr("id","key")
		            .attr("class","legend")
		            .append('g')
			            .attr("transform", "translate(" + (gOptions.marginLeft + gOptions.captionYearSize + gOptions.captionDaySize) +",0)");

			//define data for legend
			var ticks = color.ticks(gOptions.legendTicks);

	        key.selectAll("rect")
	            .data(ticks)
	            .enter().append("rect")
			        .attr("class", "day")
			        .attr("width",gOptions.cellSize)
			        .attr("height",gOptions.cellSize)
		            .style("fill",function(d){return color(d); })
			        .attr("x",function(d,i){return width/ticks.length*i;})
			        .attr("y",0);

		        key.selectAll("text")
		            .data(ticks)
		            .enter()
		            .append("text")
		            .attr("x",function(d,i){
		                return width/ticks.length*i + gOptions.cellSize+5;
		            })
		            .attr("y","0.8em")
		            .text(function(d,i){
		            	return d;
		            	// return ( i == 5 )? "over "+legendBreaks(5):"up to "+legendBreaks(d);
		            });
		};
	}

    function _debug( i ) {
        apex.debug.log( i );
        gSpinner.remove();
    }

	// Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
	function cleanArray(actual) {
		var newArray = new Array();
		for (var i = 0; i < actual.length; i++) {
			if (actual[i]) {
				newArray.push(actual[i]);
			}
		}
		return newArray;
	};
}





