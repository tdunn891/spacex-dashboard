//------------------------------------ API Request
// var barChart;

function apiCall() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
   //  "rocket/rocket_name", //rocket_name isn't being returned...for now just get all rocket/
   //  "rocket/second_stage/payloads",
    "rocket",
    "launch_site/site_name_long"
  ];
  const filters = fields.join(",");

  d3.json(`https://api.spacexdata.com/v3/launches/past?filter=${filters}`).then(
    function(data) {
      //  console.log(data[29]);
      console.log(data[29]);
      drawGraphs(data);
    }
  );
}
//------------------------------------ Render All

function drawGraphs(data) {
  var ndx = crossfilter(data);
  //   var all = dnx.GroupAll();
  // TODO: use bootstrap spinners while charts load

  // Charts
  showPastLaunches(ndx);
  showPayloads(ndx);
  showLaunchSuccessRate(ndx);
  showPastLaunchesBySite(ndx);
  dc.renderAll();
}

//----------------------------------- Show Launches By Year . could then go by Site or by Vehicle

function showPastLaunches(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year")); //function(d) {
  //   var yearDimension = ndx.dimension(function(d) {
  //  return d.launch_year;
  //   });
  //   var rocketDimension = ndx.dimension(dc.pluck("rocket_name"));
  //   var rocketDimension = ndx.dimension(function(d) {
  //  return d.rocket.rocket_name;
  //   });
  //   var yearGroup = yearDimension.group().reduceCount(); //.group() just counts rows
  //  var rocketGroup = rocketDimension.group().reduceCount(); //.group() just counts rows
  var rocketGroup = yearDimension
    .group()
    .reduce(reduceAdd, reduceRemove, reduceInitial);
// WIP
  function reduceAdd(i, d) {
    //i: initial, d: datapoint
    i[d.rocket.rocket_name] = (i[d.rocket.rocket_name] || 0) + 1;
    return i;
  }
  function reduceRemove(i, d) {
    i[d.rocket.rocket_name] = (i[d.rocket.rocket_name] || 0) - 1;
    return i;
  }
  function reduceInitial() {
    return {};
  }
  print_filter(rocketGroup);
  // Chart
  var barChart = dc
    .barChart("#chart")
    .width(500)
    .height(260)
    //   .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    //  .group(yearGroup)
    .group(rocketGroup, "Falcon 1", function(d) {
      return d.value["Falcon 1"];
    })
    .stack(rocketGroup, "Falcon 9", function(d) {
      return d.value["Falcon 9"];
    })
    .stack(rocketGroup, "Falcon Heavy", function(d) {
      return d.value["Falcon Heavy"];
    })
    //   .dimension(rocketDimension)
    //   .group(rocketGroup)
    .xAxisLabel("Year")
    .yAxisLabel("Launches") // Add margins
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .barPadding(0.3)
    .outerPadding(0)
    .x(
      d3
        .scaleOrdinal()
        .domain([
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019
        ])
    )
    .centerBar(true)
    .brushOn(true) //what's brush?
    .xAxis()
    .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
}
//test---------------------------------LAUNCH ..Pads by Site (vertical Bar?)

function showLaunchSitesByYear(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year"));
  var yearGroup = yearDimension.group().reduceCount(); //.group() just counts rows
  //   print_filter(yearGroup);
  // Chart
  var barChart = dc
    .barChart("#chart")
    .width(500)
    .height(260)
    //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    .group(yearGroup)
    .xAxisLabel("Year")
    .yAxisLabel("Launches") // Add margins
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .barPadding(0.3)
    .outerPadding(0)
    .x(
      d3
        .scaleOrdinal()
        .domain([
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019
        ])
    )
    .centerBar(true)
    .brushOn(true)
    //TODO: Tooltip
    //TODO: Legend

    .xAxis()
    .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
}

//test----------------------------------- Show Launches By Launch Site

function showPastLaunchesBySite(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year")); //function(d) {            dc.pluck is the accessor function?
  var siteDimension = ndx.dimension(dc.pluck("site_name_long")); //test
  var yearGroup = yearDimension
    .group()
    .reduce(reduceAdd, reduceRemove, reduceInitial);

  function reduceAdd(i, d) {
    //i: initial, d: datapoint
    i[d.launch_site.site_name_long] =
      (i[d.launch_site.site_name_long] || 0) + 1;
    return i;
  }
  function reduceRemove(i, d) {
    i[d.launch_site.site_name_long] =
      (i[d.launch_site.site_name_long] || 0) - 1;
    return i;
  }
  function reduceInitial() {
    return {};
  }

  //   print_filter(yearDimension.filterExact(2019));

  // Chart
  var stackedBar = dc
    .barChart("#chartLaunchSites")
    .width(500)
    .height(260)
    //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    .group(yearGroup, "Kwajalein Atoll Omelek Island", function(d) {
      return d.value["Kwajalein Atoll Omelek Island"];
    })
    .stack(yearGroup, "Cape Canaveral", function(d) {
      return d
        .value["Cape Canaveral Air Force Station Space Launch Complex 40"];
    })
    .stack(
      yearGroup,
      "Vandenberg Air Force Base",
      // "Cape Canaveral Air Force Station Space Launch Complex 40_test",
      function(d) {
        return d.value["Vandenberg Air Force Base Space Launch Complex 4E"];
      }
    )
    .stack(
      yearGroup,
      "Kennedy Space Center",
      // "Cape Canaveral Air Force Station Space Launch Complex 40_test",
      function(d) {
        return d.value["Kennedy Space Center Historic Launch Complex 39A"];
      }
    )
    .yAxisLabel("Launches") // Add margins
    .xAxisLabel("Year")
    .renderHorizontalGridLines(true)
    .barPadding(0.3)
    .outerPadding(0)
    .xUnits(dc.units.ordinal)
    .x(
      d3
        .scaleOrdinal()
        .domain([
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019
        ])
    )
    .centerBar(true)
    .brushOn(false)
    .xAxis()
    .tickFormat(d3.format("0000"));
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
      weight =
        d["rocket"]["second_stage"]["payloads"][i]["payload_mass_kg"] + weight;
    }
    //  console.log(weight);
    return weight;
  }); //.group() just counts rows
  //   print_filter(yearGroup);

  // Chart
  var barChart = dc
    .barChart("#chart2")
    .width(500)
    .height(260)
    //  .margins({ top: 0, bottom: 0, right: 0, left: 0 })
    .dimension(yearDimension)
    .group(yearGroup)
    .yAxisLabel("Payload Mass (kg)")
    .xAxisLabel("Year")
    .renderHorizontalGridLines(true)
    //  .gap(30)
    .barPadding(0.3)
    .outerPadding(0)
    .xUnits(dc.units.ordinal)
    //  .x(d3.scaleLinear().domain([2005, 2020]))
    .x(
      d3
        .scaleOrdinal()
        .domain([
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019
        ])
    )
    .centerBar(true)
    .brushOn(false)
    //  .xUnits(dc.units.ordinal);
    //  .x(d3.scale.linear().domain([2006, 2019]));
    .xAxis()
    .tickFormat(d3.format("0000")); //formats year to 2019 instead of 2,019
}

//------------------------Sucess Percentage------------- could show this just as Text percentage (like crimestats)
//https://dc-js.github.io/dc.js/docs/stock.html

function showLaunchSuccessRate(ndx) {
  var launchDimension = ndx.dimension(dc.pluck("launch_success"));
  var launchGroup = launchDimension.group();
  var all = ndx.groupAll();

  //   print_filter(launchGroup);
  //   console.log(launchGroup);
  var pieChart = dc
    .pieChart("#pieChart")
    .width(300)
    .height(180)
    .dimension(launchDimension)
    .group(launchGroup)
    .colors(["#b22222", "#369a43"])
    //  .colorAccessor(function(d, i) {
    // return d.value;
    //  });
    .label(function(d) {
      // not working properly
      if (pieChart.hasFilter() && !pieChart.hasFilter(d.key)) {
        return d.key;
      }
      var label;
      // Success or Fail instead of true false
      d.key === true ? (label = "Success!") : (label = "Oops..");
      if (all.value()) {
        label +=
          " " +
          d.value +
          " out of ... or (" +
          Math.floor((d.value / all.value()) * 100) + // running groupAll on the dimension with the active filter gives all rows bc it ignores filters placed on its own dimension.
          "%)"; // replace all.value with total number of launches based on other filters   .. try data.size to get total rows
        //   label += ' (' + Math.floor((d.value / launchGroup) * 100) + '%)'; // replace all.value with total number of launches
      }
      return label;
    });
}

// ---------------------Data Table-----------------------

function showTable(ndx) {
  // var dim = ndx.dimension();
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

//--------------------------------------
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
