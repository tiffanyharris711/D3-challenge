d3.csv('assets/data/data.csv', function (data) {
    // Variables
    var body = d3.select('body')
      var margin = { top: 50, right: 50, bottom: 50, left: 50 }
      var h = 500 - margin.top - margin.bottom
      var w = 500 - margin.left - margin.right
      // Scales
    var colorScale = d3.scale.category20()
    var xScale = d3.scale.linear()
    //   .domain([
    //       d3.min([0,d3.min(data,function (d) { return d.poverty })]),
    //       d3.max([0,d3.max(data,function (d) { return d.poverty })])
    //       ])
      .domain([0,25])
      .range([0,w])
    var yScale = d3.scale.linear()
    //   .domain([
    //       d3.min([0,d3.min(data,function (d) { return d.healthcare })]),
    //       d3.max([0,d3.max(data,function (d) { return d.healthcare })])
    //       ])
      .domain([0,25])
      .range([h,0])
      // SVG
      var svg = body.append('svg')
          .attr('height',h + margin.top + margin.bottom)
          .attr('width',w + margin.left + margin.right)
        .append('g')
          .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
      // X-axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(2)
        .orient('bottom')
    // Y-axis
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(2)
        .orient('left')
    // Circles
    var circles = svg.selectAll('circle')
        .data(data)
        .enter()
      .append('circle')
        .attr('cx',function (d) { return xScale(d.healthcare) })
        .attr('cy',function (d) { return yScale(d.poverty) })
        .attr('r','10')
        .attr('fill',function (d,i) { return colorScale(i) })
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r',20)
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(400)
            .attr('r',10)
        })
      .append('title') // Tooltip
        .text(function (d) { return d.state +
                             '\nHealthcare: ' + d.poverty +
                             '\nPoverty: ' + d.healthcare })
    // X-axis
    svg.append('g')
        .attr('class','axis')
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
    svg.append('g')
        .attr('class', 'axis')
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