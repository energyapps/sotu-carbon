// Initiate pym
var pymChild = new pym.Child();

var statesGlobal = [];

//indexes, Width and height, Padding, parameters
var j = 0; // this is the index of which "type" of data we're looking at. Gross=0, PerCap=1
var StandardPadding = 20;

var w = parseInt(d3.select("#master_container").style("width"))
// var h = (AxisPaddingTop + StandardPadding/2 + ((totes)*2*r) + (totes*BubblePadding)+BubblePadding*1.5+20)

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = w - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#master_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseDate = d3.time.format("%Y").parse;
var parseDate2 = d3.time.format("%m/%d/%Y").parse;

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
    .orient("left")
    .outerTickSize(0);   

d3.tsv("data/combined_hor.tsv", function(error, data) {
  if (error) throw error;
  d3.csv("data/barrels.csv", function(error, barrels) {
    if (error) throw error;

    console.log(data)
    console.log(barrels)

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date" && key.slice(-2) !== "01"; }));

    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    barrels.forEach(function(d){
      d.date = parseDate2(d.date)
    })

    // Put it on the thing~!~~!!!

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
        		} 
        	}
          return {
          	date: d.date,
           	co2: f,
           	pcc: g         };
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

  // put this in the update
    y.domain([
      -550,300
    ]);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height)
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .text("CO2 Emissions Change (Million Tonnes)");

    var city = svg.selectAll(".city")
        .data(cities)
      .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { 		

        if (+d.values[7].co2 < 0.01) {
         
        };			
                var line = d3.svg.line()
          .interpolate("basis")
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d["co2"]); })
          return line(d.values) 
  	  })
        .attr("attribute",function(d){return d.name})
        .attr("tabID","co2")
        .style("stroke", function(d,i) {       	
          var color = "#111"
          return color;        
        })
        .style("stroke-opacity","0.10")
        .on("mouseover",function(d){        	
        	Highlight(d.name)       
        })
        .on("mouseout",function(d){
          // d3.select(this).style("stroke-opacity","0.15")
        });

      d3.select('[attribute="United States"]')
      	.style("stroke-width","5")
      	.style("stroke-opacity","0.6")
        .style("stroke","rgb(139,204,0)")

      svg.append("text")
      	.attr("class","highlightText")
      	.attr("x",width)
      	.attr("y","0")
      	.text(function(d){
      		var type = "co2" 
      		var state = cities[3].name;
      		var amount = cities[3].values[7][type]    	
      		return state + ": " + amount;
      	})

      svg.append("text")
        .attr("class","highlightText2")
        .attr("x",width)
        .attr("y","35")
        .text("CO2 Emissions Change (Million Tonnes)")

      svg.append("text")
        .attr("class","USText")
        .attr("x",320)
        .attr("y",height-150)
        .text("United States ⤴")      

  	d3.selectAll(".tab").on("click", function() {
  		d3.selectAll(".tab").attr("class","tab");
  		this.className = "tab active";
  		d3.select("#about_extend").attr("class","");
  		d3.select("#about").attr("class","about_tab")		
  		update(this.id)
  	});

  	d3.select("#about").on("click", function() {
  		this.className = "about_tab active"			
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
  	    	return "No country found"
  	    },
  	    onSelect: function (suggestion) {	    	
  	   		// CAll function that highlights selected line
  	 		Highlight(suggestion.value)
  	    }
  	});		
  	pymChild.sendHeight();
  });
});
	

		function Highlight(sug) {

			// Call d3 THIS highlight, everything else lowlight			
      d3.selectAll(".line").style("stroke-opacity","0.10")        
			d3.select('[attribute="United States"]').style("stroke-opacity","0.6")
      d3.select('[attribute="'+ sug +'"]').style("stroke-opacity","0.8")        				
			d3.select(".highlightText")
				.text(function(d){					
					var data = d3.select('[attribute="'+ sug +'"]')[0][0].__data__;
		    		var type = d3.select('[attribute="'+ sug +'"]')[0][0].attributes.tabID.value; 
		    		var state = data.name;
		    		var amount = data.values[7][type]    	
		    		return state + ": " + amount;
	    		})

			pymChild.sendHeight();
		}	

		function update(tabID) {				
			var w = parseInt(d3.select("#master_container").style("width"))

      d3.selectAll('.y.axis').remove();
      d3.select(".baseline").remove();
      d3.select(".USText").remove();

      if (tabID == "co2") {
        y.domain([
          -550,300
        ]);
        var ctext = "CO2 Emissions Change (Million Tonnes)";

      } else {
        y.domain([
          -10,6
        ]);
        var ctext = "CO2 Emissions Change (Tonnes/Person)";
      };

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height)
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text(ctext);

			var city = svg.selectAll(".city").selectAll("path")

			city.transition()
			   	.duration(1000)
				.attr("d", function(d) { 			 		
					var line = d3.svg.line()
					    .interpolate("basis")
					    .x(function(d) { return x(d.date); })
					    .y(function(d) { return y(d[tabID]); })
					return line(d.values)
				})
				.attr("tabID",tabID)
			    

      d3.select(".highlightText2")        
        .text(ctext) 


			pymChild.sendHeight();
		}			

// Prebaked functions
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}		