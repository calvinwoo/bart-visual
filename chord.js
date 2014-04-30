d3.text("ridership2013/april.csv", function(imports) {
  var stationByCode = {
    'RM': 'Richmond',
    'EN': 'El Cerrito Del Norte',
    'EP': 'El Cerrito Plaza',
    'NB': 'North Berkeley',
    'BK': 'Berkeley',
    'AS': 'Ashby',
    'MA': 'MacArthur',
    '19': '19th Street Oakland',
    '12': '12th Street / Oakland City Center',
    'LM': 'Lake Merritt',
    'FV': 'Fruitvale',
    'CL': 'Coliseum / Oakland Airport',
    'SL': 'San Leandro',
    'BF': 'Bayfair',
    'HY': 'Hayward',
    'SH': 'South Hayward',
    'UC': 'Union City',
    'FM': 'Fremont',
    'CN': 'Concord',
    'PH': 'Pleasant Hill',
    'WC': 'Walnut Creek',
    'LF': 'Lafayette',
    'OR': 'Orinda',
    'RR': 'Rockridge',
    'OW': 'West Oakland',
    'EM': 'Embarcadero',
    'MT': 'Montgomery Street',
    'PL': 'Powell Street',
    'CC': 'Civic Center',
    '16': '16th Street Mission',
    '24': '24th Street Mission',
    'GP': 'Glen Park',
    'BP': 'Balboa Park',
    'DC': 'Daly City',
    'CM': 'Colma',
    'CV': 'Castro Valley',
    'ED': 'Dublin / Pleasanton',
    'NC': 'North Concord / Martinez',
    'WP': 'Pittsburg / Baypoint',
    'SS': 'South San Francisco',
    'SB': 'San Bruno',
    'MB': 'Millbrae',
    'SO': 'SFO',
    'WD': 'West Dublin/Pleasanton'
  };

  var countyByCode = {
    'RM': 'Contra Costa',
    'EN': 'Contra Costa',
    'EP': 'Contra Costa',
    'NB': 'Alameda',
    'BK': 'Alameda',
    'AS': 'Alameda',
    'MA': 'Alameda',
    '19': 'Alameda',
    '12': 'Alameda',
    'LM': 'Alameda',
    'FV': 'Alameda',
    'CL': 'Alameda',
    'SL': 'Alameda',
    'BF': 'Alameda',
    'HY': 'Alameda',
    'SH': 'Alameda',
    'UC': 'Alameda',
    'FM': 'Alameda',
    'CN': 'Contra Costa',
    'PH': 'Contra Costa',
    'WC': 'Contra Costa',
    'LF': 'Contra Costa',
    'OR': 'Contra Costa',
    'RR': 'Alameda',
    'OW': 'Alameda',
    'EM': 'SF',
    'MT': 'SF',
    'PL': 'SF',
    'CC': 'SF',
    '16': 'SF',
    '24': 'SF',
    'GP': 'SF',
    'BP': 'SF',
    'DC': 'San Mateo',
    'CM': 'San Mateo',
    'CV': 'Alameda',
    'ED': 'Alameda',
    'NC': 'Contra Costa',
    'WP': 'Contra Costa',
    'SS': 'San Mateo',
    'SB': 'San Mateo',
    'MB': 'San Mateo',
    'SO': 'San Mateo',
    'WD': 'Alameda'
  }

  var colorByCounty = {
    'Alameda': '#04529C',
    'Contra Costa': '#FFCC33',
    'SF': '#E6BE8A',
    'San Mateo': '#AF1E2C'
  }

  var csv_values = d3.csv.parseRows(imports);
  var matrix = [];
  var codeByIndex = {};
  var colorByIndex = {};
	// reading data
  for (var i = 1; i< csv_values.length; i ++){
    matrix[i-1]=[];
    var code = csv_values[i][0];
    codeByIndex[i-1] = code;
    colorByIndex[i-1] = colorByCounty[ countyByCode[code] ];
    for (var j = 1 ; j < csv_values[i].length; j ++){
      if (!csv_values[i][j]) csv_values[i][j] = 0;
      var value = parseFloat(csv_values[i][j].toString().replace(',',''));
      if (value < 0)
        value = 0
      matrix[i-1][j-1] = value;
    }
  }

  var chord = d3.layout.chord()
      .padding(.05)
      .sortSubgroups(d3.descending)
      .matrix(matrix);


  var width = 1280,
      height = 900,
      innerRadius = Math.min(width, height) * .30,
      outerRadius = innerRadius * 1.1;

  var fill = d3.scale.ordinal()
      .domain(d3.range(44))
      //.range(["#000000", "#FFDD89", "#957244", "#F26223"]);

  var svg = d3.select(".diagram").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Outside edges
  svg.append("g").selectAll("path")
      .data(chord.groups)
    .enter().append("path")
      .style("fill", function(d) { return colorByIndex[d.index]; })
      .style("stroke", function(d) { return colorByIndex[d.index]; })
      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));

  var labels = svg.append('g').selectAll('g')
        .data(chord.groups)
      .enter().append('g')
        .attr("transform", function(d) {
          return "rotate(" + (labelAngle(d) * 180 / Math.PI - 90) + ")"
              + "translate(" + (outerRadius+10) + ",0)";
        })

  labels.append('text')
      .attr("transform", function(d) {
        if (labelAngle(d) > Math.PI) { return 'rotate(180)' }
        else { return '' }
      })
      .style('text-anchor', function(d) {
        if (labelAngle(d) > Math.PI) { return 'end' }
        else { return '' }
      })
      .text(function(d) { return stationByCode[codeByIndex[d.index]] })
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));

  function labelAngle(d) {
    return (d.startAngle + d.endAngle) / 2;
  }

  /*// Tick marks and labels
  var ticks = svg.append("g").selectAll("g")
      .data(chord.groups)
    .enter().append("g").selectAll("g")
      .data(groupTicks)
    .enter().append("g")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + outerRadius + ",0)";
      });

  // Tick marks specifically
  ticks.append("line")
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 5)
      .attr("y2", 0)
      .style("stroke", "#000");

  // Labels specifically
  ticks.append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.label; });
  */

  // Interior Ribbons
  svg.append("g")
      .attr("class", "chord")
    .selectAll("path")
      .data(chord.chords)
    .enter().append("path")
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("fill", function(d) { return colorByIndex[d.target.index]; })
      .style("stroke", function(d) { return colorByIndex[d.target.index]; })
      .style("opacity", 1);



  // Returns an array of tick angles and labels, given a group.
  function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1000).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 5 ? null : v / 1000 + "k"
      };
    });
  }

  // Returns an event handler for fading a given chord group.
  function fade(opacity) {
    return function(g, i) {
      svg.selectAll(".chord path")
          .filter(function(d) { return d.source.index != i && d.target.index != i; })
        .transition()
          .style("opacity", opacity);
    };
  }
});
