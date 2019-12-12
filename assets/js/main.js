//------------------------------------ API Request
//TODO: catch apicall errors
function apiCall() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    "mission_name",
    "launch_date_local",
    "launch_date_utc",
    "rocket",
    "launch_site/site_name_long"
  ];
  const filters = fields.join(",");

  d3.json(`https://api.spacexdata.com/v3/launches/past?filter=${filters}`).then(
    function(data) {
      console.log(data[29]);
      drawGraphs(data);
    }
  );
}
//------------------------------------ Render All

function drawGraphs(data) {
  // If first stage core is reused, change rocket name to 'Used Falcon 9''
  for (var i = 0; i < getObjectLength(data); i++) {
    if (data[i].rocket.first_stage.cores[0].reused === true) {
      //change name to Used
      data[i].rocket.rocket_name = "Used Falcon 9";
    }
  }

  var ndx = crossfilter(data);
  // TODO: use bootstrap spinners while charts load

  // Charts
  showPastLaunches(ndx);
  showPayloads(ndx);
  showLaunchSuccessRate(ndx);
  showPastLaunchesBySite(ndx);
  showRowCount(ndx);
  showDataTable(ndx);

//   showPieChartByRocket(ndx);

  // hide spinners
  $(".spinner-grow").hide();

  dc.renderAll();
}
//------------------------------------ Data Table
function showDataTable(ndx) {
  var dimension1 = ndx.dimension(function(d) {
    return d.dim;
  }); 
  var dataTable = dc
    .dataTable("#dc-data-table")
    .dimension(dimension1)
    .height(200)
    .width(200)
    .size(Infinity)
    .columns([
      // TODO: simplify columns by returning array?
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
// -----pie chart by rocket
//TODO: write showPieChartByRocket() 
// function showPieChartByRocket(ndx) {
//   var rocketDimension = ndx.dimension(dc.pluck("rocket_name")); //function(d) {
//   var groupRocket = rocketDimension.group().reduceCount();
//   print_filter(groupRocket);
// }
//----------------------------------- Show Launches Per Year By Rocket

function showPastLaunches(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year")); //function(d) {

  var rocketGroup = yearDimension
    .group()
    .reduce(reduceAdd, reduceRemove, reduceInitial);

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
    .width(600) //TODO: change chart heights and widths to percentages
    .height(360)
    .dimension(yearDimension)
    .group(rocketGroup, "Falcon 1", function(d) {
      return d.value["Falcon 1"];
    })
    .stack(rocketGroup, "New Falcon 9", function(d) {
      return d.value["Falcon 9"];
    })
    .stack(rocketGroup, "Used Falcon 9", function(d) {
      return d.value["Used Falcon 9"];
    })
    .stack(rocketGroup, "Falcon Heavy", function(d) {
      return d.value["Falcon Heavy"];
    })
    .xAxisLabel("Year", 35)
    .yAxisLabel("Launches", 25) //TODO Add internal axis padding/margins
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .gap(6)
    .renderTitle(true)
    .title(function(d) {
      //  return rocketGroup;
      //TODO: hide tooltip row if zero
      return [
        "New Falcon 9: " + (d.value["Falcon 9"] || "0"),
        "Used Falcon 9: " + (d.value["Used Falcon 9"] || "0"),
        "Falcon Heavy: " + (d.value["Falcon Heavy"] || "0"),
        "Falcon 1: " + (d.value["Falcon 1"] || "0")
      ].join("\n");
    })
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
    .legend(
      dc
        .legend()
        .x(145)
        .y(340)
        .itemHeight(13)
        .gap(8)
        .horizontal(true)
        .autoItemWidth(true)
    )
    .xAxis()
    .tickFormat(d3.format("0000"));
}
//test---------------------------------Launch Sites by Year 

function showLaunchSitesByYear(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year"));
  var yearGroup = yearDimension.group().reduceCount();
  // Bar Chart
  var barChart = dc
    .barChart("#chart")
    .width(600)
    .height(360)
    .dimension(yearDimension)
    .group(yearGroup)
    .xAxisLabel("Year", 30)
    .yAxisLabel("Launches", 20) // Add margins
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .gap(1)
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
    .useViewBoxResizing(true)
    //TODO: Tooltips for all charts
    //TODO: Add Legend

    .xAxis()
    .tickFormat(d3.format("0000"));
}

//----------------------------------- Show Launches By Launch Site

function showPastLaunchesBySite(ndx) {
  var yearDimension = ndx.dimension(dc.pluck("launch_year"));
//   var siteDimension = ndx.dimension(dc.pluck("site_name_long")); 
  var yearGroup = yearDimension
    .group()
    .reduce(reduceAdd, reduceRemove, reduceInitial);

  function reduceAdd(i, d) {
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

  // Bar Chart
  var stackedBar = dc
    .barChart("#chartLaunchSites")
    .width(600)
    .height(360)
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
      function(d) {
        return d.value["Vandenberg Air Force Base Space Launch Complex 4E"];
      }
    )
    .stack(
      yearGroup,
      "Kennedy Space Center",
      function(d) {
        return d.value["Kennedy Space Center Historic Launch Complex 39A"];
      }
    )
    .yAxisLabel("Launches", 25) // Add internal axis margins/paddingj
    .xAxisLabel("Year", 30)
    .renderHorizontalGridLines(true)
    .gap(6)
    .useViewBoxResizing(true)
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
    return weight;
  }); 

  // Chart
  var barChart = dc
    .barChart("#chartPayloadPerYear")
    .width(500)
    .height(260)
    .dimension(yearDimension)
    .group(yearGroup)
    .yAxisLabel("Payload Mass (kg)")
    .xAxisLabel("Year")
    .renderHorizontalGridLines(true)
     .gap(10)
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

//------------------------Sucess Percentage------------- could show this just as Text percentage (like crimestats)
//https://dc-js.github.io/dc.js/docs/stock.html

function showLaunchSuccessRate(ndx) {
  var launchDimension = ndx.dimension(dc.pluck("launch_success"));
  var launchGroup = launchDimension.group();
  var all = ndx.groupAll();

  var pieChart = dc
    .pieChart("#pieChartLaunchSuccess")
    .width(300)
    .height(180)
    .dimension(launchDimension)
    .group(launchGroup)
    .colors(["#b22222", "#369a43"])
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
          Math.floor((d.value / all.value()) * 100) +
          "%)"; 
      }
      return label;
    });
}

//----------------------- Print Filter -----------------------

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

// -------------- API CALL MISSIONS (technically launches) ------------------------------------------------

function apiCallMissions() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    "launch_date_local",
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
      console.log(data[29]);
      crossfilterMissionCards(data);
    }
  );
}

function crossfilterMissionCards(data) {
  var ndx = crossfilter(data);  
  console.log(data[60]);
  doCards(data);
}
function doCards(data) {
  console.log("object length: " + getObjectLength(data));
  for (var i = 0; i < getObjectLength(data); i++) {
    //do in reverse order to show most recent launches first
    //create new card (jQuery)// button spinner while page loads
    var row = data[i];
    var missionPatchSmall = row.links.mission_patch_small;
    var missionPatch = row.links.mission_patch;
    var missionName = row.mission_name;
    var launchDate = row.launch_date_local.substring(0, 10); //).substring(0, 10);

    var launchOutcome = row.launch_success
      ? "LAUNCH SUCCESS"
      : "LAUNCH FAILURE";
    var launchOutcomeClass = row.launch_success ? "success" : "failure";

    var flightNumber = row.flight_number;
    var orbit = row.rocket.second_stage.payloads[0].orbit;
    var details = row.details;
    var articleLink = row.links.article_link;
    var youtubeLink = row.links.video_link;
    //TODO youtube logo for each card
    //TODO article logo for each card

    // create mission cards
    $("#missions").append(
      `<div class="card text-left col-2">
               <img class="card-img-top" src="${missionPatchSmall}" onclick="populateModalMissionPatch('${missionPatch}', '${missionName}');" alt="Mission Patch" />
               <div class="card-body">
                  <h4 class="card-title">${missionName}</h4>
                  <span class="${launchOutcomeClass}">${launchOutcome}</span>
                  <p class="card-text">
                  <ul>
                     <li>Flight Number: ${flightNumber}</li>
                     <li>Launch Date: ${launchDate}</li>
                  </ul>
                  <a href="${youtubeLink}" target="_blank">Vid</a>
                  <a href="${articleLink}" target="_blank">Article</a>
                  </p>
               </div>
            </div>`
    );
  }
}
// ------------- populates modal with large mission patch, mission name
function populateModalMissionPatch(missionPatch, missionName, details) {
  $("#modal-content").html(
    `<img src="${missionPatch}" class="mission-patch-large" alt="Mission Patch Large"/>
    <h4 class="card-title">${missionName}</h4>`
  );
  $("#myModal").modal("show");
}

// -- get Object Length function -----
function getObjectLength(data) {
  return Object.keys(data).length;
}

function loadCards(ndx) {
  var rocketDimension = ndx.dimension(dc.pluck("rocket_name")); //?
  var rocketGroup = rocketDimension.group(); //?
}

//--------------apiCALL Next Mission----------------------------

function apiCallNextLaunch() {
  const fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    "launch_date_local",
    "launch_date_unix",
    "launch_date_utc",
    "rocket",
    "launch_site",
    "mission_name",
    "mission_id",
    "links",
    "details"
  ];
  const filters = "?filter=" + fields.join(",");

  d3.json(`https://api.spacexdata.com/v3/launches/next${filters}`).then(
    function(data) {
       // get details (lat/long) of launch pad
      apiCallOneLaunchPad(data.launch_site.site_id);
      // populate next mission's details
      populateNextMissionCard(data);
      // compute and populate countdown until next launch
      populateCountDown(data.launch_date_unix);
    }
  );
}
// ------------- poopulateNextMissionCard
function populateNextMissionCard(data) {
  //if rocket is reused, show 'Used Falcon 9'
  //TODO replace Reddit Thread with Reddit Logo
  //TODO catch error if reddit thread is null
  var rocketName;
  if (data.rocket.first_stage.cores[0].reused === true) {
    rocketName = "Used Falcon 9";
  } else {
    rocketName = data.rocket.rocket_name;
  }
  $("#nextMissionCard").html(
    `<div class="card-body">
<h4 class="card-title">${data.mission_name}</h4>
<p class="card-text">
   <ul>
      <li><strong>Flight Number:</strong> ${data.flight_number}</li>
      <li><strong>Rocket:</strong> ${rocketName}</li>
      <li><strong>Launch Date:</strong> ${data.launch_date_local}</li>
      <li><strong>Launch Site:</strong> ${data.launch_site.site_name_long}</li>
      <li><strong>Details:</strong> ${data.details}</li>
      <li><a href=${data.links.reddit_campaign} target="_blank">Reddit Thread</a></li>
   </ul>
</p>
</div>`
  );

  // Add To Calendar event details
  $("#addeventatc1 .title").text(`SpaceX Launch - ${data.mission_name}`);
  $("#addeventatc1 .start").text(data.launch_date_utc);
  $("#addeventatc1 .location").text(data.launch_site.site_name_long);
  $("#addeventatc1 .description").text(
    `Rocket: ${data.rocket.rocket_name} \n Details: ${data.details}`
  );
}

// ----------------populateCountDown---
function populateCountDown(launchDateUnix) {
  var countDownDate = launchDateUnix * 1000; // millisecond since unix epoch

  //--https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_countdown
  // Update the count down every 1 second
  var x = setInterval(function() {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // Output the result in an element with id="demo"
    document.getElementById("days").innerHTML = days;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("seconds").innerHTML = seconds;
    // If the count down is over, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("nextLaunchCountdown").innerHTML = "LIFT OFF!";
    }
  }, 1000);
}

//---------------apiCallLaunchPads---------------
function apiCallOneLaunchPad(site_id) {
  d3.json(`https://api.spacexdata.com/v3/launchpads/${site_id}`).then(function(
    data
  ) {
    addNextLaunchMarkerToMap(data);
  });
}

//--------------------AddNextLaunchMarkerToMap------------
function addNextLaunchMarkerToMap(data) {
  var launchSite = data.site_name_long;

  var latLngMarker = {
    lat: data.location.latitude,
    lng: data.location.longitude
  };

  //initialise map, centered on launch site
  map = new google.maps.Map(document.getElementById("map"), {
    center: latLngMarker,
    mapTypeId: "hybrid",
    zoom: 12
  });

  // create marker of launch site
  var marker = new google.maps.Marker({
    position: latLngMarker,
    map: map,
    title: launchSite
  });
}

//-------------ROADSTER (BONUS: probably not necessary)
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
  d3.json(`https://api.spacexdata.com/v3/landpads`).then(function(data) {
    console.log(data[0]);
    drawLandingGraph(data);
    addLandingMarkers(data);
  });
}

// function addLandingMarkers(data) {
//   var totalLandingPads = getObjectLength(data);
//   console.log("object length: " + getObjectLength(data));

//   for (var i = 0; i < totalLandingPads; i++) {
//     //for each landing pad, add a marker
//     //get relevant data points
//     var row = data[i];
//     var latLngMarker = {
//       lat: row.location.latitude,
//       lng: row.location.longitude
//     };
//     var fullName = row.full_name;

//     //create marker
//     var marker = new google.maps.Marker({
//       position: latLngMarker,
//       map: map,
//       title: fullName
//     });
//   }
// }

// draw landing graph
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
}

//----------------PAYLOADS.html--------------------------
function apiCallPayloads() {
  d3.json("https://api.spacexdata.com/v3/payloads").then(function(data) {
    console.log(data[5]);
    drawPayloadGraphs(data);
  });
}

function drawPayloadGraphs(data) {
  var ndx = crossfilter(data);
  showPayloadGraph(ndx);

  // hide spinners
  $(".spinner-grow").hide();

  dc.renderAll();
}

//--------------- Payloads by Orbit-----------------
function showPayloadGraph(ndx) {
  var orbitDimension = ndx.dimension(dc.pluck("orbit"));
  // if null, "N/A"
  var nationalityDimension = ndx.dimension(function(d) {
    return d.nationality || "N/A";
  });
  var manufacturerDimension = ndx.dimension(function(d) {
    return d.manufacturer || "N/A";
  });

  var payloadTypeDimension = ndx.dimension(function(d) {
    return d.payload_type || "N/A";
  });
  var burstOrbitManuDimension = ndx.dimension(function(d) {
    return [d.orbit || "N/A", d.manufacturer || "N/A"];
  });

  var burstNationalityManuDimension = ndx.dimension(function(d) {
    return [d.nationality || "N/A", d.manufacturer || "N/A"];
  });

  var groupOrbit = orbitDimension.group().reduceCount();
  var groupNationality = nationalityDimension.group().reduceCount();
  var groupManufacturer = manufacturerDimension.group().reduceCount();
  var groupPayloadType = payloadTypeDimension.group().reduceCount();

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

  var rowChart = dc
    .rowChart("#pieChartPayloadByOrbit")
    .width(400)
    .height(300)
    .useViewBoxResizing(true)
    .cap(7)
    .dimension(orbitDimension)
    .group(groupOrbit);

  var rowChartPayloadNationality = dc
    .rowChart("#pieChartPayloadNationalityUSvsROW")
    .width(300)
    .height(100)
    .cap(1)
    .dimension(nationalityDimension)
    .group(groupNationality);

  var rowChartManufacturer = dc
    .rowChart("#pieChartPayloadManufacturer")
    .width(400)
    .height(300)
    .useViewBoxResizing(true)
    .cap(7)
    .dimension(manufacturerDimension)
    .group(groupManufacturer);

  var pieChartNationality = dc
    .pieChart("#pieChartPayloadNationality")
    .width(400)
    .height(300)
    .cap(7)
    //  .useViewBoxResizing(true)
    .dimension(nationalityDimension)
    .group(groupNationality);

  var rowChartPayloadType = dc
    .rowChart("#rowChartPayloadType")
    .width(400)
    .height(200)
    //  .labelOffsetX()
    .useViewBoxResizing(true)
    .dimension(payloadTypeDimension)
    .group(groupPayloadType);
