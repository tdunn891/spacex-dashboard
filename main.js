//------------------------------------ API Request
// var barChart;

function apiCall() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    "mission_name",
    "launch_date_local",
    "launch_date_utc",
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
  showRowCount(ndx);
  showDataTable(ndx);
  dc.renderAll();
}
//------------------------------------ Data Table
function showDataTable(ndx) {
  var dimension1 = ndx.dimension(function(d) {
    return d.dim;
  }); //function(d) {
  var dataTable = dc
    //  .dataTable("#dataTable")
    .dataTable("#dc-data-table")
    .dimension(dimension1)
    .height(200)
    .width(200)
    .size(Infinity)
    .columns([
      function(d) {
        return d.flight_number;
      },
      function(d) {
        return d.launch_year;
      },
      function(d) {
        return d.mission_name;
      },
      function(d) {
        return d.rocket.rocket_name;
      },
      function(d) {
        return d.launch_date_local;
      },
      function(d) {
        return d.launch_success;
      }
    ])
    .sortBy(function(d) {
      return d.flight_number;
    });
}

//----------------------------------- Row Count
function showRowCount(ndx) {
  var all = ndx.groupAll();
  var dataCountTest = dc
    .dataCount(".dc-data-count")
    .crossfilter(ndx)
    .groupAll(all)
    .html({
      some:
        "<strong>%filter-count</strong> of <strong>%total-count</strong> launches selected" +
        " | <a href='javascript:dc.filterAll(); dc.renderAll();'>Reset All</a>", //consider redraw instead of renderall
      all: "All launches selected - click to filter."
    });
  //   https://dc-js.github.io/dc.js/docs/stock.html
}

//----------------------------------- Show Launches Per Year By Rocket

// var barChart; //test
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

  // Bar Chart
  var barChart = dc
    .barChart("#chartLaunchesPerYearByVehicle")
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
    .xAxisLabel("Year")
    .yAxisLabel("Launches") // Add margins
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .barPadding(0.3)
    .outerPadding(0)
    //  .renderLabel(true)
    //  .label(function(d){
    //  return d.key;
    //  })
    .renderTitle(true)
    .title(function(d) {
      //  return rocketGroup;
      //TODO: hide tooltip row if zero
      return [
        "Falcon 9: " + (d.value["Falcon 9"] || "0"),
        "Falcon Heavy: " + (d.value["Falcon Heavy"] || "0"),
        "Falcon 1: " + (d.value["Falcon 1"] || "0")
        //   "Falcon Heavy: " + d.value["Falcon Heavy"]
      ].join("\n");
    })
    //  .valueAccessor(function (d) {
    //   return d.value.avg;
    //  })
    //  .legend(
    //    dc
    //      .legend()
    //      .x(800)
    //      .y(10)
    //      .itemHeight(13)
    //    //   .gap(5)
    //  ) //testing
    //  .brushOn(false)
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
    //  .legend(dc.legend().x(800).y(10).itemHeight(13))
    .centerBar(true)
    //  .brushOn(true) //what's brush?
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
    .barChart("#chartPayloadPerYear")
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
    .pieChart("#pieChartLaunchSuccess")
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

// MISSIONS------------------------------------------------

function apiCallMissions() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    //  "rocket/rocket_name", //rocket_name isn't being returned...for now just get all rocket/
    //  "rocket/second_stage/payloads",
    "rocket",
    "launch_site/site_name_long",
    "mission_name",
    "mission_id",
    "links",
    "details"
  ];
  const filters = "?filter=" + fields.join(",");

  d3.json(`https://api.spacexdata.com/v3/launches/past${filters}`).then(
    function(data) {
      //  console.log(data[29]);
      console.log(data[29]);
      // drawGraphs(data);
      crossfilterMissionCards(data);
    }
  );
}

function crossfilterMissionCards(data) {
  var ndx = crossfilter(data); // only necessary if filtering
  console.log(data[60]);
  doCards(data);
  //   loadCards(ndx);
}
function doCards(data) {
  // count of objects in data object
  var totalFlights = getObjectLength(data);
  console.log("object length: " + getObjectLength(data));
  //   console.log(data.length());

  for (var i = 0; i < totalFlights; i++) {
    //do in reverse order to show most recent launches first
    //create new card (jQuery)// button spinner while page loads
    //populate it
    var row = data[i];
    var missionPatchSmall = row.links.mission_patch_small;
    var missionPatch = row.links.mission_patch;
    var missionName = row.mission_name;

    var flightNumber = row.flight_number;
    var orbit = row.rocket.second_stage.payloads[0].orbit;
    var details = row.details;
    var articleLink = row.links.article_link;
    var youtubeLink = row.links.video_link;
    //create cards
    $("#missions").append(
      `<div class="card text-left col-2">
               <img class="card-img-top" src="${missionPatchSmall}" onclick="populateModalMissionPatch('${missionPatch}', '${missionName}');" alt="Mission Patch" />
               <div class="card-body">
                  <h4 class="card-title">${missionName}</h4>
                  <p class="card-text">
                  <ul>
                     <li>Flight Number: ${flightNumber}</li>
                     <li>Payload Orbit: ${orbit}</li>
                  </ul>
                  <a href="${youtubeLink}" target="_blank">Vid</a>
                  <a href="${articleLink}" target="_blank">Article</a>
                  </p>
               </div>
            </div>`
    );
  }
}

function populateModalMissionPatch(missionPatch, missionName, details) {
  $("#modal-content").html(
    `<img src="${missionPatch}" class="mission-patch-large" alt="Mission Patch Large"/>
    <h4 class="card-title">${missionName}</h4>`
  );
  $("#myModal").modal("show");
}

function getObjectLength(data) {
  return Object.keys(data).length;
}

function loadCards(ndx) {
  var rocketDimension = ndx.dimension(dc.pluck("rocket_name")); //?
  var rocketGroup = rocketDimension.group(); //?
  //   print_filter(rocketGroup);
}

//-------------ROADSTER
function apiCallRoadster() {
  const fields = [
    "speed_kph",
    "speed_mph",
    "earth_distance_km",
    "earth_distance_mi"
  ];
  const filters = "?filter=" + fields.join(",");
  d3.json(`https://api.spacexdata.com/v3/roadster${filters}`).then(function(
    data
  ) {
    console.log(data);
  });
}

//--------landings.html---------------- doesn't seem to respect filters
function apiCallLandingPads() {
  //   const fields = [
  //   "launch_year",
  //   "launch_site/site_name_long"
  //   ];
  //   const filters = fields.join(",");

  d3.json(`https://api.spacexdata.com/v3/landpads`).then(function(data) {
    console.log(data[0]);
    drawLandingGraph(data);
    addLandingMarkers(data);
  });
}

function addLandingMarkers(data) {
  var totalLandingPads = getObjectLength(data);
  console.log("object length: " + getObjectLength(data));

  for (var i = 0; i < totalLandingPads; i++) {
    //for each landing pad, add a marker
    //get relevant data points
    var row = data[i];
    var latLngMarker = {
      lat: row.location.latitude,
      lng: row.location.longitude
    };
    var fullName = row.full_name;
    //create marker
    console.log("TCL: addLandingMarkers -> latLngMarker ", latLngMarker);

    var marker = new google.maps.Marker({
      position: latLngMarker,
      map: map,
      title: fullName
    });
  }
}

//draw landing graph
function drawLandingGraph(data) {
  var ndx = crossfilter(data);

  showLandingGraph(ndx);
  dc.renderAll();
}

//WIP
function showLandingGraph(ndx) {
  var landingPadDimension = ndx.dimension(dc.pluck("full_name"));
  // var groupOutcome = landingPadDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
  var groupLandSuccess = landingPadDimension.group().reduceSum(function(d) {
    return +d.successful_landings;
  });
  var groupLandFail = landingPadDimension.group().reduceSum(function(d) {
    return d.attempted_landings - d.successful_landings;
  });

  print_filter(groupLandSuccess);
  print_filter(groupLandFail);
  //get landing success percentage  (find easier way to get this, mb using dc)
  /*var totalSuccessArray = groupLandSuccess.all();
  var totalFailArray = groupLandFail.all();
  var totalSuccess = 0;
  var totalFail = 0;
  for (var i = 0; i < totalSuccessArray.length; i++) {
    totalSuccess += totalSuccessArray[i].value;
    totalFail += totalFailArray[i].value 
  };
  var totalAttempts = totalSuccess + totalFail;
  var landSuccessRate = parseFloat(totalSuccess / (totalSuccess + totalFail)*100).toFixed(2)+"%";
  $('#landings-success-rate').html(`<p>Success Rate: ${landSuccessRate}</p>`); //doesn't update
*/
  var rowChart = dc
    .barChart("#landings-chart")
    .width(800)
    .height(500)
    .x(d3.scaleOrdinal().domain([]))
    .xUnits(dc.units.ordinal)
    .elasticX(true)
    .dimension(landingPadDimension)
    .group(groupLandSuccess, "Success")
    .stack(groupLandFail, "Fail");
  //  .colors(["#b22222", "#369a43"]);

  //show percentage landing success

  // console.log(groupLandSuccess);
  // $('#landings-success-rate').html(function(d){
  // console.log(d.successful_landings / d.attempted_landings);
  // });
}

//----------------PAYLOADS.html--------------------------
function apiCallPayloads() {
  d3.json("https://api.spacexdata.com/v3/payloads").then(function(data) {
    //  console.log(data[29]);
    console.log(data[5]);
    drawPayloadGraphs(data);
    //  crossfilterMissionCards(data);
  });
}

function drawPayloadGraphs(data) {
  var ndx = crossfilter(data);
  showPayloadGraph(ndx);

  dc.renderAll();
}

function showPayloadGraph(ndx) {
  var orbitDimension = ndx.dimension(dc.pluck("orbit"));
  // if null, "N/A"
  var nationalityDimension = ndx.dimension(function(d) {
    return d.nationality || "N/A";
  });
  var manufacturerDimension = ndx.dimension(function(d) {
    return d.manufacturer || "N/A";
  });
  //   console.log(orbitDimension);
  var burstOrbitManuDimension = ndx.dimension(function(d) {
    return [d.orbit || "N/A", d.manufacturer || "N/A"];
  });

  var burstNationalityManuDimension = ndx.dimension(function(d) {
    return [d.nationality || "N/A", d.manufacturer || "N/A"];
  });

  var groupOrbit = orbitDimension.group().reduceCount();
  var groupNationality = nationalityDimension.group().reduceCount();
  var groupManufacturer = manufacturerDimension.group().reduceCount();

  var groupBurst = burstOrbitManuDimension.group().reduceCount(function(d) {
    return d.manufacturer;
  });

  var groupBurst2 = burstNationalityManuDimension
    .group()
    .reduceCount(function(d) {
      return d.nationality;
    });

  var all = ndx.groupAll();
  print_filter(groupOrbit);
  print_filter(groupNationality);
  print_filter(groupManufacturer);
  print_filter(groupBurst);

  var pieChart = dc
    //  .pieChart("#pieChartPayloadByOrbit")
    .rowChart("#pieChartPayloadByOrbit")
    .width(400)
    .height(400)
    //  .minAngleForLabel(0.15)
    //  .drawPaths(true)
    //  .slicesCap(7)
    //  .externalLabels(30)
    //  .externalRadiusPadding(50)
    .cap(7)
    .dimension(orbitDimension)
    .group(groupOrbit);

  var pieChartPayloadNationality = dc
    //  .pieChart("#pieChartPayloadNationality")
    .rowChart("#pieChartPayloadNationalityUSvsROW")
    .width(400)
    .height(100)
    //  .minAngleForLabel(0.12)
    //  .slicesCap(7)
    .cap(1)
    .dimension(nationalityDimension)
    .group(groupNationality);

  var pieChartManufacturer = dc
    .rowChart("#pieChartPayloadManufacturer")
    .width(400)
    .height(400)
    .cap(7)
    .dimension(manufacturerDimension)
    .group(groupManufacturer);

  var piChartNationality = dc.pieChart("#pieChartPayloadNationality")
    .width(400)
    .height(400)
    .cap(7)
    .dimension(nationalityDimension)
    .group(groupNationality);
  /*
  var sunBurst = dc
    .sunburstChart("#sunburstChartOrbitManu")
    .width(800)
    .height(800)
    .innerRadius(100)
    .radius(300)
    .minAngleForLabel(0.1)
    .dimension(burstNationalityManuDimension)
    .group(groupBurst2);
    */
}
