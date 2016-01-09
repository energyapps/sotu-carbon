// Initiate pym
var pymChild = new pym.Child();

// define globals first
var statesPlusGlobal = [];
var countriesGlobal = [];

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
    .y(function(d) { return y(d.temperature); });

d3.tsv("../data/CO22.tsv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var cities = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, temperature: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
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
      .style("stroke", function(d,i) { 
        var color = "hsl(" + (i+260) + ",100%,50%)"
        return color;        
      })
      .style("stroke-opacity","0.4")
      .on("mouseover",function(d){   
        d3.selectAll(".line").style("stroke-opacity","0.2")
        d3.select(this).style("stroke-opacity","0.8")
      })
      .on("mouseout",function(d){
        d3.select(this).style("stroke-opacity","0.2")
      });
      ;

  // city.append("text")
  //     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
  //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
  //     .attr("x", 3)
  //     .attr("dy", ".35em")
  //     .text(function(d) { return d.name; });

});


d3.json("data/usaco2test.json", function(error, usdata) {
	d3.json("data/worldco2test.json", function(error, worlddata) {			

		var stData = usdata.states;

		for (i in stData) {
			statesPlusGlobal.push(stData[i])
		};

		var LookCountry = worlddata.countries;

		for (i in LookCountry) {
			
			if (LookCountry[i].id === "WWWW" || LookCountry[i].id === "EU28" || LookCountry[i].id === "GG20" || LookCountry[i].id === "GG08" ) {
				countriesGlobal.push(LookCountry[i])	
			}
			else if(LookCountry[i].type === "EXCL" || LookCountry[i].type === "ECON" || LookCountry[i].id === "USA") {
			} else {
				countriesGlobal.push(LookCountry[i])	
			};
		}					

		statesPlus = statesPlusGlobal;

		countries = worlddata.countries;

		initial(statesPlus)

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
		    lookup: countriesGlobal,
		    lookupLimit: 10,
		    maxHeight:350,
		    showNoSuggestionNotice: true,
		    noSuggestionNotice: function(){		    	
		    	return "Can't find your country? Click About the Data below to learn more."	
		    },
		    onSelect: function (suggestion) {
		    	
		    	var indexy = suggestion.indexy;

		 		CountryClick(statesPlusGlobal,indexy)
		    }
		});		
	pymChild.sendHeight();
	});
});

		// Fires on Initial Load.
		function initial(data) {
			CountryClick(data,160) //add World
			CountryClick(data,156) // EU
			CountryClick(data,117) // China
			CountryClick(data,153) // UAE
			CountryClick(data,124) // Small Country... Morrocco?
		};

		// Fires when a new country(STATE) is added or subtracted
		function CountryClick(data,x) {			
			if (add === AddCountries) {
				add = 0;
				//Remove 53, 54, 55
				data.splice(52	,(AddCountries - 1))	
				d3.selectAll(".countryBox").remove();			
			};

			// first go from 0 to 1, then 1 to 2, 3 to 4, 4 to 0 (above ), 0 to 1;
			add +=1;
			var indexIs = 51+add;
		
			// or could switch to length
			data[indexIs] = countries[x];			
			d3.select("#countryBoxes")
				.append("div")
				.text(countries[x].value)
				.attr('class','countryBox')
					.append("div")
					.attr('class',"xBox")
					.attr('id',countries[x].id)
					.text("x")
					.on("click",function(d){
						d3.select(this.parentNode).remove();						
						add -=1;
						
						for (var i = 51; i < data.length; i++) {
							if (data[i].id === this.id) {
								data.splice(i,1)
							};
						};

						update(data,j)
					});			

			// Run it boyy
			update(data,j)
			pymChild.sendHeight();
		};

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