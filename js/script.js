
	// define globals first
	var statesPlusGlobal = [];
	var countriesGlobal = [];

	//indexes, Width and height, Padding, parameters
	var q = 0; // Number of runs?
	var o = 0;
	var j = 1; // this is the index of which "type" of data we're looking at. Gross=0, PerCap=1
	var add = 0; // index How many countries are added.
	// var w = 1000;
	var w = parseInt(d3.select("#master_container").style("width"))
	var h = 1000;
	var AxisPaddingTop = 20;
	var AxisPaddingLeft = 200;
	var StandardPadding = 20;
	var BubblePadding = 3;
	var r = 5;
	var AddCountries = 4; //How many countries can be added
	// var dlengthMin = states.length //Need to update
	// var dlengthMax = dlengthMin + AddCountries;			
			
	var statesPlus;
	var countries;

	//Create SVG element
	var svg = d3.select("#master_container")
				.append("svg")
				.attr("width", w)
				.attr("height", h);  	

	svg.append("g")
	    .attr("class", "axis")  //Assign "axis" class
	    .attr("transform", "translate(0," + (AxisPaddingTop + 10) + ")")

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

d3.json("/data/usaco2test.json", function(error, usdata) {
	d3.json("/data/worldco2test.json", function(error, worlddata) {
			
		var stData = usdata.states;

		for (i in stData) {
			statesPlusGlobal.push(stData[i])
		};

		var LookCountry = worlddata.countries;

		for (i in LookCountry) {
			countriesGlobal.push(LookCountry[i])			
		}					

		statesPlus = statesPlusGlobal;

		initial(statesPlus)

		countries = worlddata.countries;

		d3.selectAll(".tab").on("click", function() {
			d3.selectAll(".tab").attr("class","tab");
			this.className = "tab active";
			d3.select("#about_extend").attr("class","");
			d3.select("#about").attr("class","about_tab")
			MetricClick(statesPlus, this.id)
		});
	
		d3.select("#about").on("click", function() {
			console.log('test')
			// d3.selectAll(".tab").attr("class","tab")
			this.className = "about_tab active"			
			d3.select("#about_extend").attr("class","active");
		});

		d3.selectAll(".xBox").on("click", function(){				
			d3.select(this.parentNode).remove();
		})

		$(document).on('click', function(event) {
		  if (!$(event.target).closest('#about').length) {
		    d3.select("#about_extend").attr("class","");
			d3.select("#about").attr("class","about_tab")
		  }
		});

		$('#autocompletez').autocomplete({
		    lookup: countriesGlobal,
		    lookupLimit: 10,
		    maxHeight:350,
		    onSelect: function (suggestion) {
		    	
		    	var indexy = suggestion.indexy;

		 		CountryClick(statesPlusGlobal,indexy)
		    }
		});
	});
});

		// Fires on Initial Load.
		function initial(data) {
			update(data,j)
		};

		// Fires when a new country is added or subtracted
		function CountryClick(data,x) {	
				// How to prevent doubles?
				// prevent XXXX's
				// Prevent USA			
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
							console.log(data[i].id)
							if (data[i].id === this.id) {
								console.log(data[i])
								data.splice(i,1)
							};
						};

						update(data,j)
					});			

			// Run it boyy
			update(data,j)
		};

		//DONT DEFINE J HERE?!?!
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
		};

		function update(x,j) {				
			// interpret j
			if (j  === 0) {
				var type = "gross"
			} else if (j === 1) {
				var type = "percap"		
			};

			// update the sortID fields
			sortFunction(x,type)

			// reassign a reference of the data
			var	statesPlus = x;

			// Scales and Axis updates
			var xScale1 = d3.scale.linear()
				// .domain([1,1000,10000])
                 .domain([0, d3.max(statesPlus, function(d) {
                 	// The plus turns it into a float from a string
                 	return +d.data[type].y13; })])    
                 // .domain([1,5000])             
                 // .range([AxisPaddingLeft, w - (StandardPadding*5) ,w-(StandardPadding*2)]);\
                 .range([AxisPaddingLeft,w-(StandardPadding*2)]);

			var xAxis1 = d3.svg.axis()
				.scale(xScale1)
				.orient("top")
				.ticks(3);

			svg.selectAll("g.axis")
				.transition() //maybe remove
				.duration(1000) 
				// .transform(translate(10,20))
				.attr("transform","translate(10,30)")
				.call(xAxis1);		

			// define the svg variables
			var circles = svg.selectAll("circle.y13")
				.data(statesPlus)

			// var textB = svg.selectAll("text.bubbles")
			// 	.data(statesPlus)

			var textN = svg.selectAll("text.names")
			   .data(statesPlus)	

			// Do the updated things first! This is what happens to an update
			circles
				.transition()
			   	.duration(2000)
			   	.attr("cx", function(d) {
			   		return xScale1(d.data[type].y13)
			    })			 				

			// textB
			// 	.transition()
			//     .duration(2000)
			//     .text(function(d) {
			//    		return d.data[type].y13;
			//    	})
			//    	.attr("x", function(d) {
			//    		return xScale1(d.data[type].y13) + (2*BubblePadding)
			//     })			    

			textN
				.transition()
				.duration(2000)
				.text(function(d) {
					return d.value;
				})								

			// Now you tell it what to do when something ENTERS for the first time!
			circles   
			    .enter()
			    .append("circle")
			    .attr("id",function(d){
			   		return "a"+d.value
			   	})
			    .attr("r", r)
			    .attr("cx", function(d) {
			   		return xScale1(d.data[type].y13)
			    })
			    .attr("cy",function(d,i){			    	
			   		return (AxisPaddingTop + StandardPadding/2 + ((i)*2*r) + (i*BubblePadding))
				})
				.attr("class", function(d) {			    	
			    	if (d.type === "CTRY") {
			    		return "ctry y13"	
			    	} else if (d.type === "ECON") {
			    		return "econ y13"
			    	} else {
			    		return "y13"
			    	};			    	
			    })
			
			// textB
			//     .enter()
			//     .append("text")
			//     .attr("class","bubbles")			    
			// 	.text(function(d) {
			//    		return d.data[type].y13;
			//    	})
			//    	.attr("y",function(d, i){
			// 		return (AxisPaddingTop + StandardPadding/2 + ((i)*2*r) + (i*BubblePadding) + BubblePadding*1.5)
			// 	})
			//    	.attr("x", function(d) {
			//    		return xScale1(d.data[type].y13) + (2*BubblePadding)
			//     })
			//     .attr("font-family", "sans-serif")
			//     .attr("font-size", "11px")
			//     .attr("fill", "red");

			textN
			    .enter()
			    .append("text")
			    .attr("class", function(d) {			    	
			    	if (d.type === "CTRY") {
			    		return "names ctry"	
			    	} else if (d.type === "ECON") {
			    		return "names econ"
			    	} else {
			    		return "names"
			    	};			    	
			    })			    	
			    .text(function(d) {
					return d.value;
				})			
			    .attr("y",function(d, i){
					return (AxisPaddingTop + StandardPadding/2 + ((i)*2*r) + (i*BubblePadding)+BubblePadding*1.5)
				})
				.attr("x", function(d) {
					return 0
				})	
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px");	

			// ADD A DOTTED LINE HERE
			svg
				.append("line")
				.attr("class","dotted1")
				.attr("x1",AxisPaddingLeft - StandardPadding)
				.attr("x2",AxisPaddingLeft - StandardPadding)
				.attr("y1","0")
				.attr("y2", function(){
					var i = statesPlus.length
					return (AxisPaddingTop + StandardPadding/2 + ((i)*2*r) + (i*BubblePadding)+BubblePadding*1.5)
				})
				.attr("stroke","rgb(61,57,58)")
				.attr("stroke-width","2px")
				.attr("stroke-dasharray","1,4")
				.attr("stroke-linecap","round");

			// Do the second layer of transitions after the first fires
			circles
				.transition().duration(2000).delay(2000)
			    .attr("cy",function(d,i){			  
			   		return (AxisPaddingTop + StandardPadding/2 + ((d.sortID)*2*r) + (d.sortID*BubblePadding)+BubblePadding/2)
				})

			// textB
			// 	.transition().duration(2000).delay(2000)
			// 	.attr("y",function(d, i){
			//    		return (AxisPaddingTop + StandardPadding/2 + ((d.sortID)*2*r) + (d.sortID*BubblePadding)+BubblePadding*1.5)
			// 	})

			textN
				.transition().duration(2000).delay(2000)
				.attr("y",function(d, i){
			   		return (AxisPaddingTop + StandardPadding/2 + ((d.sortID)*2*r) + (d.sortID*BubblePadding)+BubblePadding*1.5)
				})

		  	// Remove old elements as needed.
			circles.exit().remove();			
			// textB.exit().remove();			
			textN.exit().remove();			
		}			

		function sortFunction (statesPlus,type) {		
			//define the rename
			var copy = JSON.parse(JSON.stringify(statesPlus)); //maybe don't need for json?
			//index the rename
			for (var i = 0; i < copy.length; i++) {
				copy[i].nodeID = i;
				copy[i].sortID = 0;
				statesPlus[i].nodeID = i; //will this update itself?
				statesPlus[i].sortID = 0;
			};			

			function sortList (data, type) {			
				data = data.sort(function(a,b){
					a = +a.data[type].y13
					b = +b.data[type].y13
					if (a < b) {
					    return -1;
					} else if (a > b) { 
					    return 1;
					}
				});
				// create sorted index ... sortID
				for (var i = 0; i < data.length; i++) {		
					data[i].sortID = i;
				};
				return data;
			}

			var newList = sortList(copy,type)			

			for (var i = 0; i < statesPlus.length; i++) {
				for (var k = 0; k < newList.length; k++) {
					if (statesPlus[i].nodeID === newList[k].nodeID) {
						statesPlus[i].sortID = newList[k].sortID
					};			
				};
			};
		
			return statesPlus
		}