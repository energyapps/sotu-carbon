// Initiate pym
var pymChild = new pym.Child();

var statesGlobal = [],
  co2Domain = [],
  pccDomain = [];

//indexes, Width and height, Padding, parameters
var j = 0; // this is the index of which "type" of data we're looking at. Gross=0, PerCap=1

var w = parseInt( d3.select( "#master_container" ).style( "width" ) ),
  StandardPadding = 20,
  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  width = w - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var svg = d3.select( "#master_container" ).append( "svg" )
  .attr( "width", width + margin.left + margin.right )
  .attr( "height", height + margin.top + margin.bottom )
  .append( "g" )
  .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

var parseDate = d3.time.format( "%Y" ).parse;

var xScale = d3.time.scale()
  .range( [ 0, ( width ) ] );

var yScale = d3.scale.linear()
  .range( [ height, 0 ] );

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
  .scale( xScale )
  .orient( "bottom" );

var yAxis = d3.svg.axis()
  .scale( yScale )
  .orient( "left" )
  .outerTickSize( 0 );

d3.tsv( "data/combined_international_CO2_2015.tsv", function ( error, data ) {
  if ( error ) throw error

  // ensure one tick per year based on data
  xAxis.ticks( data.length );

  color.domain( d3.keys( data[ 0 ] ).filter( function ( key ) {
    return key !== "date" && key.slice( -2 ) !== "01";
  } ) );

  data.forEach( function ( d ) {
    d.date = parseDate( d.date );
  } );

  // declare array variable for combined data
  var comboValues = [],
    co2Values = [],
    pccValues = [];

  var countries = color.domain().map( function ( name ) {
    statesGlobal.push( name )
    return {
      name: name,
      values: data.map( function ( d ) {
        var f = +d[ name ];
        comboValues.push( f ); // push values to combo array
        co2Values.push( f ); // push values to combo array

        // Loops and adds in other intensities!
        for ( var k in d ) {
          if ( k.slice( 0, -2 ) == name && k.slice( -2 ) == 01 ) {
            var g = +d[ k ];
            comboValues.push( g ); // push values to combo array
            pccValues.push( g ); // push values to combo array
          }
        }
        return {
          date: d.date,
          co2: f,
          pcc: g
        };
      } )
    };
  } );

  xScale.domain( d3.extent( data, function ( d ) {
    return d.date;
  } ) );

  svg.append( "g" )
    .attr( "class", "x axis" )
    .attr( "transform", "translate(0," + height + ")" )
    .call( xAxis );

  // calculate Y axis min/max from combo array
  yScale.domain( [ d3.min( comboValues ), d3.max( comboValues ) / 10 ] );
  // assign global domain for CO2 chart (used on tab click to redraw axis)
  co2Domain = [ Math.floor( d3.min( co2Values ) ), Math.ceil( d3.max( co2Values ) / 10 ) ];
  // assign global domain for PCC chart (used on tab click to redraw axis)
  pccDomain = [ Math.floor( d3.min( pccValues ) ), Math.ceil( d3.max( pccValues ) / 5 ) ];

  svg.append( "g" )
    .attr( "class", "y axis" )
    .call( yAxis )
    .append( "text" )
    .attr( "transform", "rotate(-90)" )
    .attr( "x", -height )
    .attr( "y", 6 )
    .attr( "dy", ".71em" )
    .style( "text-anchor", "start" )
    .text( "CO₂ Emissions Change (Million Tonnes)" );

  var country = svg.selectAll( ".country" )
    .data( countries )
    .enter().append( "g" )
    .attr( "class", "country" );

  country.append( "path" )
    .attr( "class", "line" )
    .attr( "d", function ( d ) {
      var line = d3.svg.line()
        .interpolate( "basis" )
        .x( function ( d ) {
          return xScale( d.date );
        } )
        .y( function ( d ) {
          return yScale( d[ "co2" ] );
        } )
      return line( d.values )
    } )
    .attr( "attribute", function ( d ) {
      return d.name
    } )
    .attr( "tabID", "co2" )
    .style( "stroke", function ( d, i ) {
      var color = "#111"
      return color;
    } )
    .style( "stroke-opacity", "0.10" )
    .style( "stroke-linecap", "round" )
    .on( "mouseover", function ( d ) {
      Highlight( d.name )
    } );
  /*.on( "mouseout", function ( d ) {
    // d3.select(this).style("stroke-opacity","0.15")
  } );*/

  d3.select( '[attribute="United States"]' )
    .style( "stroke-width", "5" )
    .style( "stroke-opacity", "0.6" )
    .style( "stroke", "rgb(139,204,0)" )

  svg.append( "text" )
    .attr( "class", "highlightText" )
    .attr( "x", width - 10 )
    .attr( "y", "-10" )
    .attr( "name", function ( d ) {
      return countries[ 134 ].name; // load with US data
    } )
    .text( function ( d ) {
      var type = "co2"
      var country = countries[ 134 ].name;
      var amount = countries[ 134 ].values[ 9 ][ type ]
      if ( amount > 0 ) {
        var plus = "+"
      } else {
        var plus = ""
      };
      return country + ": " + plus + amount;
    } )

  svg.append( "text" )
    .attr( "class", "highlightText2" )
    .attr( "x", width - 10 )
    .attr( "y", "35" )
    .text( "CO₂ Emissions Change (Million Tonnes)" )

  svg.append( "text" )
    .attr( "class", "USText" )
    .attr( "x", 290 )
    .attr( "y", height - 120 )
    .text( "U.S. CO₂ reductions ⤴" )

  d3.selectAll( ".tab" ).on( "click", function () {
    d3.selectAll( ".tab" ).attr( "class", "tab" );
    this.className = "tab active";
    d3.select( "#about_extend" ).attr( "class", "" );
    d3.select( "#about" ).attr( "class", "about_tab" );
    update( this.id );
    // output yscale domain
    // console.log( this.id, yScale.domain() );
  } );

  d3.select( "#about" ).on( "click", function () {
    this.className = "about_tab active"
    $( "#about_extend" ).addClass( "active" );
    $( "#about_extend" ).css( "display", "block" );
  } );

  //remove about on click out
  $( document ).on( 'click', function ( event ) {
    if ( !$( event.target ).closest( '#about' ).length ) {
      d3.select( "#about" ).attr( "class", "about_tab" )
      $( "#about_extend" ).css( "display", "none" );
    }
  } );

  $( '#autocompletez' ).autocomplete( {
    lookup: statesGlobal,
    lookupLimit: 10,
    maxHeight: 350,
    showNoSuggestionNotice: true,
    noSuggestionNotice: function () {
      return "No country found"
    },
    onSelect: function ( suggestion ) {
      // Call function that highlights selected line
      Highlight( suggestion.value )
    }
  } );
  pymChild.sendHeight();
  // });
} );

function Highlight( sug ) {
  // Call d3 THIS highlight, everything else lowlight
  d3.selectAll( ".line" ).style( "stroke-opacity", "0.10" )
  d3.select( '[attribute="United States"]' ).style( "stroke-opacity", "0.6" )
  d3.select( '[attribute="' + sug + '"]' ).style( "stroke-opacity", "0.8" )
  d3.select( ".highlightText" )
    .attr( "name", sug )
    .text( function ( d ) {
      var data = d3.select( '[attribute="' + sug + '"]' )[ 0 ][ 0 ].__data__;
      var type = d3.select( '[attribute="' + sug + '"]' )[ 0 ][ 0 ].attributes.tabID.value;
      var country = sug;
      var amount = data.values[ 9 ][ type ]
      if ( amount > 0 ) {
        var plus = "+"
      } else {
        var plus = ""
      };
      return country + ": " + plus + amount;
    } )

  pymChild.sendHeight();
}

function update( tabID ) {
  var w = parseInt( d3.select( "#master_container" ).style( "width" ) );

  d3.selectAll( '.y.axis' ).remove();
  d3.select( ".baseline" ).remove();
  d3.selectAll( ".USText" ).remove();

  if ( tabID == "co2" ) {
    yScale.domain( co2Domain );

    var ctext = "CO₂ Emissions Change (Million Tonnes)";

  } else {
    yScale.domain( pccDomain );
    var ctext = "CO₂ Emissions Change (Tonnes/Person)";
  };

  svg.append( "g" )
    .attr( "class", "y axis" )
    .call( yAxis )
    .append( "text" )
    .attr( "transform", "rotate(-90)" )
    .attr( "x", -height )
    .attr( "y", 6 )
    .attr( "dy", ".71em" )
    .style( "text-anchor", "start" )
    .text( ctext );

  var country = svg.selectAll( ".country" ).selectAll( "path" );

  country.transition()
    .duration( 1000 )
    .attr( "d", function ( d ) {
      var line = d3.svg.line()
        .interpolate( "basis" )
        .x( function ( d ) {
          return xScale( d.date );
        } )
        .y( function ( d ) {
          return yScale( d[ tabID ] );
        } )
      return line( d.values )
    } )
    .attr( "tabID", tabID );

  d3.select( ".highlightText2" )
    .text( ctext );

  d3.select( ".highlightText" )
    .text( function ( d ) {
      var name = this.attributes.name.value;
      var data = d3.select( '[attribute="' + name + '"]' )[ 0 ][ 0 ].__data__;
      var amount = data.values[ 9 ][ tabID ]
      if ( amount > 0 ) {
        var plus = "+"
      } else {
        var plus = ""
      };
      return name + ": " + plus + amount;
    } )
  pymChild.sendHeight();
}

// Prebaked functions
function randomIntFromInterval( min, max ) {
  return Math.floor( Math.random() * ( max - min + 1 ) + min );
}