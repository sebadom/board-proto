/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

var SETTINGS = {
  timeline: {
    height: 40
  },
  flight: {
    line: 1
  },
  leg: {
    height: 15
  }
}

d3.scheduleBoard = function(options) {
    var timeDomainStart;
    var timeDomainEnd;
    var el = $(options.el);
    var height = el.height();
    var width = el.width();
    var x;
    var xAxis;
    var tickFormat = "%H%M";
    var flightsPos = {};
    var svg;
    var cache = []

    function saveFlightPosition(flight) {
      var row = $('#plane-' + flight.plane);
      flightsPos[flight.plane] = {
        x: x(flight.legs[0].departure),
        y: row.position().top + SETTINGS.timeline.height + (row.outerHeight() / 2) - (SETTINGS.leg.height / 2)
      }
    }

    var initAxis = function(rows) {
        x = d3.time.scale.utc().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
        xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("top")
                      .ticks(23)
                      .tickFormat(d3.time.format.utc(tickFormat))
                      .tickSize(10, 1)
                      .tickPadding(1);

    };

    function drawFlights(flights) {
      var group;

      // draw the group
      group = svg.selectAll(".chart")
        .data(flights)
        .enter()
        .append("g")
        .attr("class", 'flight')
        .attr("transform", setFlightTransform);

      // draw the line
      group.append('line')
        .attr('x1', 0)
        .attr('x2', function (flight) {
          return x(flight.legs[flight.legs.length - 1].arrival) - flightsPos[flight.plane].x;
        })
        .attr('y1', SETTINGS.leg.height - SETTINGS.flight.line)
        .attr('y2', SETTINGS.leg.height - SETTINGS.flight.line)
        .attr('stroke-width', SETTINGS.flight.line)
        .attr('stroke', 'red');

      // draw each leg box
      group.selectAll('rect')
        .data(function (f) {
          _.each(f.legs, function(l) { l.plane = f.plane });
          return f.legs;
        })
        .enter()
        .append('rect')
        .attr('class', function (l) {
          return l.repo ? 'repo-leg leg' : 'leg';
        })
        .attr("y", 0)
        .attr("x", function (leg) { return x(leg.departure) - flightsPos[leg.plane].x; })
        .attr("width", function (leg) { return (x(leg.arrival) - flightsPos[leg.plane].x) - (x(leg.departure) - flightsPos[leg.plane].x); })
        .attr("height", SETTINGS.leg.height)
    }

    function setFlightTransform(flight) {
      return "translate(" + flightsPos[flight.plane].x + ", " + flightsPos[flight.plane].y + ")"
    }

    function drawTimeLine() {
      svg.append("g")
        .attr("class", "timeline")
        .append("rect")
        .attr("class", "timeline-background")
        .attr("height", SETTINGS.timeline.height)

      d3.select('.timeline').append("g")
         .attr("class", "axis")
         .attr("transform", "translate(0, " + SETTINGS.timeline.height + ")")
         .call(xAxis);
/*
      svg.append("g")
           .attr("class", "grid")
           .attr("transform", "translate(0, 40)")
           .call(xAxis)
         .selectAll(".tick")
           .data(x.ticks(10), function(d) { return d; })
         .exit()
           .classed("minor", true);
*/
    }

    function getFlightsFromAircraft(flights) {
      var result = [];
      _.each(_.flatten(_.map(flights, 'planes')), function (plane) {
        _.each(plane.flights, function (flight) {
          flight.plane = plane.plate;
          result.push(flight);
          saveFlightPosition(flight);
        });
      });

      return result;
    }

    function scheduleBoard() {
        svg = d3.select(options.el)
          .append("svg")
          .attr("class", "chart")
          .append("g")
          .attr("class", "gantt-chart")

        initAxis();
        drawTimeLine();
        return scheduleBoard;
    };

    scheduleBoard.addFlights = function(aircrafts) {
      drawFlights(getFlightsFromAircraft(aircrafts));
      _.each(aircrafts, function (a) {
        cache.push(a);
      });
      debugger
    }

    scheduleBoard.redraw = function(tasks) {
        initAxis();

        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        rect.enter()
            .insert("rect", ":first-child")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", function(d) {
                if (taskStatus[d.status] == null) {
                    return "bar";
                }
                return taskStatus[d.status];
            })
            .transition()
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.rangeBand();
            })
            .attr("width", function(d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.transition()
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.rangeBand();
            })
            .attr("width", function(d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return scheduleBoard;
    };

    scheduleBoard.timeDomain = function(value) {
        if (!arguments.length)
            return [timeDomainStart, timeDomainEnd];
        timeDomainStart = value[0], timeDomainEnd = value[1];
        return scheduleBoard;
    };

    return scheduleBoard;
};
