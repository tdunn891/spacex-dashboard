//------------------------------------ API Request

d3.json(
  "https://api.spacexdata.com/v3/launches/past?filter=flight_number,launch_year,rocket/rocket_name,rocket/second_stage/payloads/"
).then(function(data) {
  console.log(data[0]);
  drawGraphs(data);
});

//------------------------------------ Render All

function drawGraphs(data) {
  var ndx = crossfilter(data);

  // Charts
  showPastLaunches(ndx);
  showPayloads(ndx);
  dc.renderAll();
}

//----------------------------------- Show Launches By Year

function showPastLaunches(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year")); //function(d) {
  //  return d.launch_year;
  //   });
  var yearGroup = yearDimension.group().reduceCount(); //.group() just counts rows
  print_filter(yearGroup);
  // Chart
  var barChart = dc
    .barChart("#chart")
    .width(600)
    .height(360)
    //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    .group(yearGroup)
    .yAxisLabel("Launches") // Add margins
    .xAxisLabel("Year")
    //  .gap(30)
    .barPadding(0.3)
    .outerPadding(0)
    .x(d3.scaleLinear().domain([2005, 2020]))
    .centerBar(true)
    .brushOn(false)
    //  .xUnits(dc.units.ordinal);
    //  .x(d3.scale.linear().domain([2006, 2019]));
    .xAxis()
    .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
}

//---------------------PAYLOADS By Year----------------------------

function showPayloads(ndx) {
  var yearDimension = ndx.dimension(function(d) {
    return d.launch_year;
  });
  var yearGroup = yearDimension.group().reduceSum(function(d) {
    //sum payload weights
    var weight = 0;
    for (var i = 0; i < d["rocket"]["second_stage"]["payloads"].length; i++) {
      weight = d["rocket"]["second_stage"]["payloads"][i]["payload_mass_kg"] + weight;
    }
   //  console.log(weight);
    return weight;
  }); //.group() just counts rows
  print_filter(yearGroup);

  // Chart
  var barChart = dc
    .barChart("#chart2")
    .width(600)
    .height(360)
    //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    .group(yearGroup)
    .yAxisLabel("Payload Mass (kg)")
    .xAxisLabel("Year")
    //  .gap(30)
    .barPadding(0.3)
    .outerPadding(0)
    .x(d3.scaleLinear().domain([2005, 2020]))
    .centerBar(true)
    .brushOn(false)
    //  .xUnits(dc.units.ordinal);
    //  .x(d3.scale.linear().domain([2006, 2019]));
    .xAxis()
    .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
}

//----------------------- Print Filter-----------------------

function print_filter(filter) {
  var f = eval(filter);
  if (typeof f.length != "undefined") {
  } else {
  }
  if (typeof f.top != "undefined") {
    f = f.top(Infinity);
  } else {
  }
  if (typeof f.dimension != "undefined") {
    f = f
      .dimension(function(d) {
        return "";
      })
      .top(Infinity);
  } else {
  }
  console.log(
    filter +
      "(" +
      f.length +
      ") = " +
      JSON.stringify(f)
        .replace("[", "[\n\t")
        .replace(/}\,/g, "},\n\t")
        .replace("]", "\n]")
  );
}

//---------------------------------------------------------

// works
/*
const d3test = () => {
  return (
    d3
      // .json("https://api.spacexdata.com/v3/launches/past")
      .json(
        "https://api.spacexdata.com/v3/launches/past?filter=flight_number,launch_year,rocket/rocket_name,rocket/second_stage/payloads/"
      )
      // .then(pastLaunches => console.log(pastLaunches));
      .then(function(data) {
        // numify year
        data.forEach(function(d) {
          d.launch_year = +d.launch_year;
        });
        // crossfilter
        var ndx = crossfilter(data);
        var yearDimension = ndx.dimension(function(d) {
          return d.launch_year;
        });
        var yearGroup = yearDimension.group().reduceCount(); //.group() just counts rows
        //  .reduce(reduceAdd, reduceRemove, reduceInitial);
        // reduce needs 3 functions:
        //   function reduceAdd(i, d) { // seen as p and v in documentation. i=initial, d=datapoint
        //  (i[d.rocket.rocket_name]||0)+d.;
        //   } // api documnation
        //   function reduceRemove(i,d) {}
        //   function reduceInitial() {
        //  return {};
        //   }

        print_filter(yearGroup);
        // dc
        var barChart = dc
          .barChart("#chart")
          .width(768)
          .height(480)
          //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
          .dimension(yearDimension)
          .group(yearGroup)
          .yAxisLabel("Launches")
          .xAxisLabel("Year")
          //  .gap(30)
          .barPadding(0.3)
          .outerPadding(0)
          .x(d3.scaleLinear().domain([2005, 2020]))
          .centerBar(true)
          .brushOn(false)
          //  .xUnits(dc.units.ordinal);
          //  .x(d3.scale.linear().domain([2006, 2019]));
          .xAxis()
          .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
        // Render

        dc.renderAll();
      })
  );
};
*/
