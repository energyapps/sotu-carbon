// Initiate pym
var pymChild = new pym.Child();

// define globals first
var statesPlusGlobal = [];
var countriesGlobal = [];

var statesGlobal = [];

//indexes, Width and height, Padding, parameters
var q = 0; // Number of runs?
var o = 0;
var j = 1; // this is the index of which "type" of data we're looking at. Gross=0, PerCap=1
var add = 0; // index How many countries are added.
// var AxisPaddingTop = 20;
// var AxisPaddingLeft = 200;
var StandardPadding = 20;
// var BubblePadding = 3;
var AddCountries = 10; //How many countries can be added		
var totes = 51 + AddCountries
var statesPlus;
var countries;

var w = parseInt(d3.select("#master_container").style("width"))
// var h = (AxisPaddingTop + StandardPadding/2 + ((totes)*2*r) + (totes*BubblePadding)+BubblePadding*1.5+20)

var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = w - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#master_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Create SVG element
// var svg = d3.select("#master_container").append("svg")
// 			.attr("width", w)
// 			.attr("height", h);  	

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.co2); });

d3.tsv("../data/CO23.tsv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date" && key.slice(-2) !== "01" && key.slice(-2) !== "02"  ; }));

  data.forEach(function(d) {

    d.date = parseDate(d.date);
  });

  var cities = color.domain().map(function(name) {
  	statesGlobal.push(name)

    return {
      name: name,
      values: data.map(function(d) {
      	var f = +d[name];
      	
      	// Loops and adds in other intensities!
      	for (var k in d){
      		if (k.slice(0,-2) == name && k.slice(-2) == 01 ) {
      			var g = +d[k]
      		} else if (k.slice(0,-2) == name && k.slice(-2) == 02 ) {
      			var h = +d[k]
      		}
      	}

        return {
        	date: d.date,
         	co2: f,
         	cintensity: g,
         	eintensity: h
         };
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.co2; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.co2; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("CO2 per capita change");

  var city = svg.selectAll(".city")
      .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .attr("attribute",function(d){return d.name})
      .style("stroke", function(d,i) { 
      	var c = 350 - (d.values[13].co2 * -3)
        var color = "hsl(" + c + ",100%,50%)"
        return color;        
      })
      .style("stroke-opacity","0.4")
      .on("mouseover",function(d){        	
        console.log(d.name)
        d3.selectAll(".line").style("stroke-opacity","0.1")
        d3.select(this).style("stroke-opacity","0.8")
      })
      .on("mouseout",function(d){
        d3.select(this).style("stroke-opacity","0.1")
      });
      ;

  // city.append("text")
  //     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
  //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.co2) + ")"; })
  //     .attr("x", 3)
  //     .attr("dy", ".35em")
  //     .text(function(d) { return d.name; });


	d3.selectAll(".tab").on("click", function() {
		d3.selectAll(".tab").attr("class","tab");
		this.className = "tab active";
		d3.select("#about_extend").attr("class","");
		d3.select("#about").attr("class","about_tab")

		// set the metric title
		var emissions = d3.select('#emissions')[0][0];
		if (j === 1) {
			emissions.innerHTML = "Annual Carbon Dioxide Emissions 2013 (Million Metric Tons of CO<sub>2</sub> per geography, logarithmic)";
		} else {
			emissions.innerHTML = "Annual Carbon Dioxide Emissions 2013 (Metric Tons of CO<sub>2</sub> per Person) ";	
		};			

		MetricClick(statesPlus, this.id)
	});

	d3.select("#about").on("click", function() {
		// d3.selectAll(".tab").attr("class","tab")
		this.className = "about_tab active"			
		// d3.select("#about_extend").attr("class","active");
		$("#about_extend").addClass("active");
		$("#about_extend").css("display","block");
	});

	//remove about on click out
	$(document).on('click', function(event) {
	  if (!$(event.target).closest('#about').length) {
	    // d3.select("#about_extend").attr("class","");
		d3.select("#about").attr("class","about_tab")
		$("#about_extend").css("display","none");
	  }
	});

	$('#autocompletez').autocomplete({
	    lookup: statesGlobal,
	    lookupLimit: 10,
	    maxHeight:350,
	    showNoSuggestionNotice: true,
	    noSuggestionNotice: function(){		    	
	    	return "No state found"
	    },
	    onSelect: function (suggestion) {
	    	console.log(suggestion)	

	   		// CAll function that highlights selected line
	 		Highlight(suggestion)
	    }
	});		
	pymChild.sendHeight();
});
	

		function Highlight(sug) {
			// Call d3 THIS highlight, everything else lowlight

			d3.selectAll(".line").style("stroke-opacity","0.1")
			d3.select('[attribute="'+ sug.value +'"]').style("stroke-opacity","0.8")        	

			pymChild.sendHeight();
		}	

		// Fires when the metric is switched
		function MetricClick(data, t) {
				//iterate between the options
				if (t === "percap") {
					j=1;
					q+=1; //number of times it has run?
				}				
				else{
					j=0;
				};
			update(data,j)
			pymChild.sendHeight();
		};

		function update(x,j) {				
			var w = parseInt(d3.select("#master_container").style("width"))

			// interpret j: The thing that changes from one co2 per cap to intesnity, etc.
			if (j  === 0) {
				// var type = "gross"
			} else if (j === 1) {
				// var type = "percap"		
			};

			// reassign a reference of the data
			var	statesPlus = x;

			// svg.attr("height",function(){
			// 		var i = statesPlus.length
			// 		return (AxisPaddingTop + StandardPadding/2 + ((i)*2*r) + (i*BubblePadding)+BubblePadding*1.5)
			// 	});

			pymChild.sendHeight();
		}			

// Prebaked functions
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}		