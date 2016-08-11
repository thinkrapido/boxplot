
d3.json('/api', function(err, data) {

  if (err) {
    return console.error(err);
  }

  var svg = d3.select('#boxplot'),
      diagramWidth = +(svg.style('width').replace('px', '')),
      diagramHeight = +(svg.style('height').replace('px', ''))
      y = d3.scaleLinear()
            .domain([50, 200])
            .range([diagramHeight, 0]),
      axisLeft = d3.axisLeft(y),
      chart = svg.append('g')
          .attr('transform', 'translate(50, 40),scale(.8)'),
      boxplot = d3.box()
                  .diagramWidth(diagramWidth)
                  .displayLast(6)
      ;

  chart.call(axisLeft);
  var container = chart.append('g');

  var boundary = [
        [{ x: 0, y: 95 }, { x: diagramWidth, y: 95 }],
        [{ x: 0, y: 85 }, { x: diagramWidth, y: 85 }]
      ];

  var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return y(d.y); })
      // .curve(d3.curveLinear)
      ;

  for (var i = 0; i < boundary.length; i++) {
    container.append('path')
        .attr('d', lineFunction(boundary[i]))
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
      ;
  }

  container = chart.append('g').attr('class', 'boxplot');

  container.selectAll('g.boxplot').data(data).enter().call(boxplot);

});

d3.box = function() {

  var diagramWidth = 0;
  var displayLast = -1;
  var width = 30;
  var width2 = width / 2;

  function box(g) {

    var skip = 0;
    var length = 0;

    g.each(function(d, i, node) {

      if (length == 0) {
        length = node.length;
      }

      if (i == 0 && displayLast > 0 && node.length > displayLast) {
        skip = node.length - displayLast;
        length = displayLast;
      }
      if (skip > i) {
        return;
      }

      var delta = diagramWidth / length / 2;
      var offsetX = (diagramWidth / length) * (i - skip) + delta;
      var offsetDelta = offsetX - (width / 2);
      var offsetDelta2 = offsetX - (width / 4);

      var g = d3.select(this);

      g.append('line')
          .attr('class', 'min-max')
          .attr('x1', offsetX)
          .attr('y1', function(d) { return y(d.min); })
          .attr('x2', offsetX)
          .attr('y2', function(d) { return y(d.Q2); })
          .attr('stroke-dasharray', '5,5')
      ;

      g.append('line')
          .attr('class', 'min-max')
          .attr('x1', offsetX)
          .attr('y1', function(d) { return y(d.max); })
          .attr('x2', offsetX)
          .attr('y2', function(d) { return y(d.Q2); })
          .attr('stroke-dasharray', '5,5')
      ;

      g.append('line')
          .attr('class', 'min')
          .attr('x1', offsetDelta2)
          .attr('y1', function(d) { return y(d.min); })
          .attr('x2', offsetDelta2 + width2)
          .attr('y2', function(d) { return y(d.min); })
      ;

      g.append('line')
          .attr('class', 'max')
          .attr('x1', offsetDelta2)
          .attr('y1', function(d) { return y(d.max); })
          .attr('x2', offsetDelta2 + width2)
          .attr('y2', function(d) { return y(d.max); })
      ;

      g.append('rect')
          .attr('class', 'quartile')
          .attr('x', offsetDelta)
          .attr('y', function(d) { return y(d.Q3); })
          .attr('width', width)
          .attr('height', function(d) { return y(d.Q1) - y(d.Q3); })
      ;

      g.append('line')
          .attr('class', 'median')
          .attr('x1', offsetDelta)
          .attr('y1', function(d) { return y(d.Q2); })
          .attr('x2', offsetDelta + width)
          .attr('y2', function(d) { return y(d.Q2); })
      ;

      for (var i = 0; i < d.outlier.length; i++) {
        g.append('circle')
            .attr('class', 'outlier')
            .attr('cx', offsetX)
            .attr('cy', function() { return y(d.outlier[i]); })
        ;
      }

      g.append('g')
          .attr('transform', function(d) { return 'translate('+(offsetX + 5)+','+y(50)+')'; })
        .append('text')
          .attr('class', 'boxplot')
          .attr('transform', 'rotate(-60)')
          .text(function(d) { return d.date; })
      ;
    })

  }

  box.diagramWidth = function(x) {
    if (!arguments.length) return diagramWidth;
    diagramWidth = +x;
    return box;
  }

  box.displayLast = function(x) {
    if (!arguments.length) return displayLast;
    displayLast = Math.floor(+x);
    if (displayLast <= 0) displayLast = -1;
    return box;
  }

  return box;
}