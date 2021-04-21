csvData = "data/data.csv"

//============Set up chart=====================
var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// ====Create an SVG wrapper,append an SVG group that will hold chart and set margins=====
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ==========Import and format the data to numerical values =======================
  d3.csv(csvData).then(function(CensusData) {
    CensusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
  });

// ==============Create Scales====================
  const xScale = d3.scaleLinear()
    // .domain([8,d3.max(CensusData, d => d.poverty)])
    .domain(d3.extent(CensusData, d => d.poverty))
    .range([0, width])
    .nice(); 

  const yScale = d3.scaleLinear()
    // .domain([0,d3.max(CensusData, d => d.healthcare)])
    .domain(d3.extent(CensusData, d => d.healthcare))
    .range([height, 0])
    .nice();
  
// =============Create Axes=========================
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

// ============Append axes to the chartGroup==========
  chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
  chartGroup.append("g").call(yAxis);

//============Generate scatter plot=========
  chartGroup.selectAll("circle")
  .data(CensusData)
  .enter()
  .append("circle")
  .attr("cx", d=>xScale(d.poverty))
  .attr("cy", d=>yScale(d.healthcare))
  .attr("r", "11")
  .classed("stateCircle", true)
  .attr("opacity", 0.75);

//============add texts to each datapoint=========
  chartGroup.append("g")
    .selectAll('text')
    .data(CensusData)
    .enter()
    .append("text")
    .text(d=>d.abbr)
    .attr("x",d=>xScale(d.poverty))
    .attr("y",d=>yScale(d.healthcare))
    .classed("stateText", true);
  
//============add axes titles=========
  chartGroup.append("text")
    .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
    .classed("axis", true)
    .text("In Poverty (%)");

  chartGroup.append("text")
    .attr("y", 0 - ((margin.left / 2) + 15))
    .attr("x", 0 - (height / 2))
    .classed("axis", true)
    .attr("transform", "rotate(-90)")
    .text("Lacks Healthcare (%)");
  }).catch(function(error) {
    console.log(error);
  });