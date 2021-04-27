csvData = "data/data.csv"

//============Set up chart=====================
var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
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
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(CensusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d[chosenXAxis]))
    .range([0, width])
    .nice(); 
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label ********
function yScale(CensusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d[chosenYAxis]))
    .range([height, 0])
    .nice();
  return yLinearScale;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newXScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating xAxis var upon click on axis label
function renderxAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circle text with a transition to
// new circles
function renderStateText(stateText, newXScale, chosenXAxis) {
  stateText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return stateText;
}

function renderStateTextY(stateText, newYScale, chosenYAxis) {
  stateText.transition()
    .duration(1000)
    .attr("y", d => newXScale(d[chosenYAxis]));
  return stateText;
}

//format income number in tooltip with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function used for updating circles group with a transition to
// new circles
function updateToolTip(chosenXAxis, chosenYaxis, circlesGroup) {

  var label;
  var labelY;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    label = "Age:";
  }
  else {
    label ="Income:";
  }

  if (chosenYAxis === "healthcare") {
    label = "Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    label = "Smokes:";
  }
  else {
    label ="Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([60, -50])
    .html(function(d) {
      if (chosenXAxis === "income") {
        var tip = (`${d.state}<br>${label} ${numberWithCommas(d[chosenXAxis])}`);
      }
      else {
        var tip = (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      }
      return (tip);
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
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
});

  var xLinearScale = xScale(CensusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(CensusData, d => d[chosenYAxis]))
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
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(CensusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
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
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .classed("stateText", true);

  // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`);

  // Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")

  var povertyLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 0)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

  // append y axis
  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - ((margin.left / 2) - 15 ))
    .attr("x", 0 - (height / 1.5))
    .classed("axis", true)
    .attr("transform", "rotate(-90)")
    .text("Lacks Healthcare (%)");
  
  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - ((margin.left / 2) + 2))
    .attr("x", 0 - (height / 1.9))
    .classed("axis", true)
    .attr("transform", "rotate(-90)")
    .text("Smokes");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - ((margin.left / 2) + 20))
    .attr("x", 0 - (height / 1.9))
    .classed("axis", true)
    .attr("transform", "rotate(-90)")
    .text("Obesity");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        
        // updates x scale for new data
        xLinearScale = xScale(CensusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderxAxis(xLinearScale, xAxis);
        
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        
        // updates stateText with new x values
        stateText = renderStateText(stateText, xLinearScale, chosenXAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true); 
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    // x axis labels event listener
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;
      
      // updates x scale for new data
      yLinearScale = yScale(CensusData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderyAxis(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

      // updates stateText with new x values
      stateText = renderStateTextY(stateText, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true); 
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "smokes") {
        healthLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false); 
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        healthLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true); 
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  }).catch(function(error) {
    console.log(error);
}); //close d3 then