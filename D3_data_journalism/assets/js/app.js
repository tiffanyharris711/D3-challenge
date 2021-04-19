// Variables    
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 50
}

svgW = 960;
svgH = 500;

var h = svgH - margin.top - margin.bottom
var w = svgW - margin.left - margin.right

// Scatter, svg
var scatter = d3.select('#scatter')
  .append("svg")
  .attr("width", svgW)
  .attr("height", svgH);

// Group
var group = scatter.append("g")
  .attr('transform','translate(' + margin.left + ',' + margin.top + ')')


d3.csv('assets/data/data.csv').then(function (data) {
    
    data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });
      // Scales
    var xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.poverty))
      .range([0,w])
      // .nice();

    var yScale = d3.scaleLinear()
      .domain([6,d3.max(data, d => d.healthcare)])
      .range([h,0]);

    // X-axis
    var xAxis = d3.axisBottom(xScale);
        
    // Y-axis
      var yAxis = d3.axisLeft(yScale);
      
    group.append("g").attr("transform", `translate(0, ${h})`).call(xAxis);
    group.append("g").call(yAxis);

    // Circles
    var circles = group.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx',d => xScale(d.healthcare))
      .attr('cy',d => yScale(d.poverty))
      .attr('r','10')
      .attr('fill','lightblue')
      .classed("stateCircle",true)
      .attr("opacity", 0.75);
      // .on('mouseover', function () {
      //   d3.select(this)
      //     .transition()
      //     .duration(500)
      //     .attr('r',20)
      // })
      // .on('mouseout', function () {
      //   d3.select(this)
      //     .transition()
      //     .duration(400)
      //     .attr('r',10)
      // })
    // .append('title') // Tooltip
    //   .text(function (d) { return d.state +
    //                         '\nHealthcare: ' + d.poverty +
    //                         '\nPoverty: ' + d.healthcare })
    // X-axis
    group.attr('class','axis')
        .attr('transform', 'translate(0,' + h + ')')
        .call(xAxis)
      .append('text') // X-axis Label
        .attr('class','label')
        .attr('y',30)
        .attr('x',170)
        .attr('dy','.71em')
        // .style('text-anchor','center')
        .text('In Poverty (%)')
    // Y-axis
    group.attr('class', 'axis')
        .call(yAxis)
      .append('text') // y-axis Label
        .attr('class','label')
        .attr('transform','rotate(-90)')
        .attr('x',-270)
        .attr('y',-40)
        // .attr('dy','.71em')
        // .style('text-anchor','end')
        .text('Lacks Healthcare (%)')
  })