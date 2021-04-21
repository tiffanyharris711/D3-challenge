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

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(CensusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d[chosenXAxis]))
    .range([0, width])
    .nice(); 
  return xLinearScale;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating circle text with a transition to
// new circles
function renderStateText(stateText, newXScale, chosenXAxis) {
  stateText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return stateText;
}

// function used for updating circles group with a transition to
// new circles
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else {
    label = "Age:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([60, -50])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
};

// ==========Import and format the data to numerical values =======================
d3.csv(csvData).then(function(CensusData, err) {
  if (err) throw err;

  CensusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
});

  var xLinearScale = xScale(CensusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d.healthcare))
    .range([height, 0])
    .nice();

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(CensusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "11")
    .classed("stateCircle", true)
    .attr("opacity", 0.75);

  //============add texts to each datapoint=========
  var stateText = chartGroup.append("g")
  .selectAll('text')
  .data(CensusData)
  .enter()
  .append("text")
  .text(d=>d.abbr)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d.healthcare))
  .classed("stateText", true);

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`);

  var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 0)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 17)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("y", 0 - ((margin.left / 2) + 15))
    .attr("x", 0 - (height / 2))
    .classed("axis", true)
    .attr("transform", "rotate(-90)")
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(CensusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates stateText with new x values
        stateText = renderStateText(stateText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
}); //close d3 then