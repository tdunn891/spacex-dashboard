//------------------------------------ API Request
//TODO: catch apicall errors

function apiCall() {
  var fields = [
    "flight_number",
    "launch_year",
    "launch_success",
    "mission_name",
    "launch_date_local",
    "launch_date_utc",
    "rocket",
    "launch_site/site_name_long"
  ];
  var filters = "?filter=" + fields.join(",");
  filters = "";

  d3.json(`https://api.spacexdata.com/v3/launches/past${filters}`).then(
    function(data) {
      drawGraphs(data);
    }
  );
}
// Render All

function drawGraphs(data) {
  // If first stage core is reused, change rocket name.
  for (var i = 0; i < getObjectLength(data); i++) {
    if (data[i].rocket.first_stage.cores[0].reused === true) {
      // change rocket name to to Used Falcon 9
      data[i].rocket.rocket_name = "Used Falcon 9";
    } else if (data[i].rocket.rocket_name === "Falcon 9") {
      // change rocket name to New Falcon 9
      data[i].rocket.rocket_name = "New Falcon 9";
    }
  }

  // Crossfilter data
  var ndx = crossfilter(data);

  // Pass crossfiltered data to charts
  showPastLaunches(ndx);
  showLaunchSuccessRate(ndx);
  showPieChartByRocket(ndx);
  showLaunchSuccessPercentage(ndx);
  showLaunchesBySiteByRocket(ndx);
  showDataTable(ndx);
  showRowCount(ndx);

  // Hide loading spinners
  $(".spinner-grow").hide();

  // Render charts
  dc.renderAll();
}

// Launches by Site and Rocket
function showLaunchesBySiteByRocket(ndx) {
  // Dimension
  var siteDimension = ndx.dimension(function(d) {
    return d.launch_site.site_name_long;
  });
  //   Group
  var rocketGroup = siteDimension
    .group()
    //  Custom reducer
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
  // Bar Chart
  var barChart = dc
    .barChart("#chartLaunchesBySiteAndRocket")
    .width(600)
    .height(360)
    .dimension(siteDimension)
    .group(rocketGroup, "Falcon 1", function(d) {
      return d.value["Falcon 1"];
    })
    .stack(rocketGroup, "New Falcon 9", function(d) {
      return d.value["New Falcon 9"];
    })
    .stack(rocketGroup, "Used Falcon 9", function(d) {
      return d.value["Used Falcon 9"];
    })
    .stack(rocketGroup, "Falcon Heavy", function(d) {
      return d.value["Falcon Heavy"];
    })
    .xAxisLabel("Launch Site", 100)
    .yAxisLabel("Launches", 25) //TODO Add internal axis padding/margins
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    //  .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ffff00"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .gap(20)
    .elasticX(true)
    .renderTitle(true)
    .title(function(d) {
      //TODO: hide tooltip row if zero
      return [
        "New Falcon 9: " + (d.value["New Falcon 9"] || "0"),
        "Used Falcon 9: " + (d.value["Used Falcon 9"] || "0"),
        "Falcon Heavy: " + (d.value["Falcon Heavy"] || "0"),
        "Falcon 1: " + (d.value["Falcon 1"] || "0")
      ].join("\n");
    })
    .x(
      d3
        .scaleOrdinal()
      //   .domain([
      //     "Kwajalein Atoll Omelek Island",
      //     "Vandenberg Air Force Base Space Launch Complex 4E",
      //     "Kennedy Space Center Historic Launch Complex 39A",
      //     "Cape Canaveral Air Force Station Space Launch Complex 40"
      //   ])
    );
}

// Data Table

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
      {
        label: "Flight #",
        format: function(d) {
          return d.flight_number;
        }
      },
      {
        label: "Mission Patch",
        // anchor has href attribute of void(0) to force hand cursor on mouseover
        format: function(d) {
          return `<a href=javascript:void(0);><img src="${
            d.links.mission_patch_small
          }" class='mission-patch-small menu_links' alt="Mission Patch" title="Mission Patch" onclick="showModal('${
            d.links.mission_patch
          }')"></img></a>`;
        }
      },
      {
        label: "Mission",
        format: function(d) {
          //   If launch success, add button class btn-success, else add btn-danger
          var buttonType = d.launch_success ? "btn-success" : "btn-danger";
          return `<a class="btn ${buttonType}" title="Click for Details" data-toggle="collapse" href="#collapse${
            d.flight_number
          }" role="button" aria-expanded="false" aria-controls="collapseExample">${
            d.mission_name
          }
  </a>
  <div class="collapse" id="collapse${d.flight_number}">
          <div class="card card-body details-card">
          ${d.details}
          </div>
        </div>`;
        }
      },
      {
        label: "Launch Date",
        format: function(d) {
          // Only display first 10 characters of launch_date_local
          return d.launch_date_local.substring(0, 10);
        }
      },
      {
        label: "Launch Site",
        format: function(d) {
          return `<span title="${d.launch_site.site_name_long}">${
            d.launch_site.site_name
          }</span>`;
        }
      },

      {
        label: "Rocket",
        format: function(d) {
          return d.rocket.rocket_name;
        }
      },
      {
        label: "Launch Status",
        format: function(d) {
          //   return d.launch_success;
          var launchOutcome = d.launch_success ? "SUCCESS" : "FAILURE";
          var launchOutcomeClass = launchOutcome.toLowerCase();
          var details = d.details;
          return `<span class='${launchOutcomeClass}' title="${details}">${launchOutcome}</span>`;
        }
      },
      {
        label: "Links",
        format: function(d) {
          // return unordered list of external links (YouTube, Wikipedia, News Article)
          // icon source: https://www.iconspedia.com/icon/news-icon-22850.html
          return `<ul class='launch-links'>
                     <li><a href='${
                       d.links.video_link
                     }' target="_blank"><img src="/assets/img/youtube_social_red.png" class="link-icon-small" alt="YouTube Link" title="Watch on YouTube"/></a></li>
                     <li><a href='${
                       d.links.wikipedia
                     }' target="_blank"><img src="assets/img/wikipedia-32.png" class="link-icon-small" alt="Wikipedia" title="Wikipedia"/></a></li>
                     <li><a href='${
                       d.links.article_link
                     }' target="_blank"><img src="assets/img/news-32.png" class="link-icon-small" alt="News Article" title="News Article"/></a></li>
                    </ul>`;
        }
      }
    ])
    //  Pagination based on example: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
    .order(d3.descending)
    .showSections(false)
    .on("preRender", update_offset)
    .on("preRedraw", update_offset)
    .on("pretransition", display);

  // Define how many records to show per page
  var ofs = 0;
  var pag = 10;

  //  Pagination based on example: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
  function update_offset() {
    var totFilteredRecs = ndx.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    ofs =
      ofs >= totFilteredRecs
        ? Math.floor((totFilteredRecs - 1) / pag) * pag
        : ofs;
    ofs = ofs < 0 ? 0 : ofs;
    dataTable.beginSlice(ofs);
    dataTable.endSlice(ofs + pag);
  }

  //  Pagination based on example: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
  function display() {
    var totFilteredRecs = ndx.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    d3.select("#begin").text(end === 0 ? ofs : ofs + 1);
    d3.select("#end").text(end);
    d3.select("#last").attr("disabled", ofs - pag < 0 ? "true" : null);
    d3.select("#next").attr(
      "disabled",
      ofs + pag >= totFilteredRecs ? "true" : null
    );
    d3.select("#size").text(totFilteredRecs);
    if (totFilteredRecs != ndx.size()) {
      d3.select("#totalsize").text("(Unfiltered Total: " + ndx.size() + ")");
    } else {
      d3.select("#totalsize").text("");
    }
  }

  //   Next pagination button
  $("#next").on("click", function() {
    ofs += pag;
    update_offset();
    dataTable.redraw();
  });

  //   Previous pagination button
  $("#prev").on("click", function() {
    ofs -= pag;
    update_offset();
    dataTable.redraw();
  });
}

//TEST------------ show launch success percentage as single number
//TODO figure out how to show percentage launch success as single number
function showLaunchSuccessPercentage(ndx) {
  var successDimension = ndx.dimension(dc.pluck("launch_success"));
  var groupSuccess = successDimension.group();
  var all = ndx.groupAll();

  var launchSuccessPercentage = dc
    .numberDisplay("#numberDisplayLaunchSuccessRate")
    .width(100)
    .height(100)
    .group(groupSuccess)
    .valueAccessor(function(d) {
      return d.value;
    })
    .html({
      one: "Launch Success: %number",
      some: "Launch Successes: %number",
      none: "No Success"
    });

  // Total records
  var numRecords = ndx.groupAll();
  var numDisplay = dc.numberDisplay("#numberDisplayLaunchSuccessTotal");
  numDisplay
    .group(numRecords)
    .html({
      one: "Launch Attempts: %number",
      some: "Launch Attempts: %number",
      none: "No Launch Attempts"
    })
    .valueAccessor(x => x);
}

// Row Count and how many records are currently filtered
function showRowCount(ndx) {
  var all = ndx.groupAll();
  var dataCountTest = dc
    .dataCount(".dc-data-count")
    .crossfilter(ndx)
    .groupAll(all)
    .html({
      some:
        "<strong>%filter-count</strong> of <strong>%total-count</strong> selected" +
        " | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>",
      all: "Showing all launches - click to filter."
    });
  //   https://dc-js.github.io/dc.js/docs/stock.html
}

// Launches by Rocket
function showPieChartByRocket(ndx) {
  // Dimension
  var rocketDimension = ndx.dimension(function(d) {
    return d.rocket.rocket_name;
  });
  //   Group
  var groupRocket = rocketDimension.group();

  // Pie Chart
  var pieChart = dc
    .pieChart("#pieChartLaunchesByRocket")
    //   .externalLabels(10)
    //   .drawPaths(true)
    .innerRadius(60)
    .externalRadiusPadding(30)
    .minAngleForLabel(0.1)
    .dimension(rocketDimension)
    .group(groupRocket)
    //TODO Fix colours
    .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ff0000"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .height(360)
    .width(600)
    .legend(
      dc
        .legend()
        .x(20)
        .y(95)
        .autoItemWidth(true)
        .itemHeight(30)
        .gap(18)
    )
    .useViewBoxResizing(true);
}
//----------------------------------- Show Launches Per Year By Rocket

function showPastLaunches(ndx) {
  // Dimension
  var yearDimension = ndx.dimension(dc.pluck("launch_year")); //function(d) {
  // Group
  var rocketGroup = yearDimension
    .group()
    //  Custom reducer
    .reduce(reduceAdd, reduceRemove, reduceInitial);

  function reduceAdd(i, d) {
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

  // Bar Chart
  var barChart = dc
    .barChart("#chartLaunchesPerYearByVehicle")
    .width(600)
    .height(360)
    .dimension(yearDimension)
    .group(rocketGroup, "Falcon 1", function(d) {
      return d.value["Falcon 1"];
    })
    .stack(rocketGroup, "New Falcon 9", function(d) {
      return d.value["New Falcon 9"];
    })
    .stack(rocketGroup, "Used Falcon 9", function(d) {
      return d.value["Used Falcon 9"];
    })
    .stack(rocketGroup, "Falcon Heavy", function(d) {
      return d.value["Falcon Heavy"];
    })
    .xAxisLabel("Year", 25)
    .yAxisLabel("Launches", 25) //TODO Add internal axis padding/margins
    //  TODO increase fontsize of axis labels
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .gap(6)
    //  .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ffff00"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .renderTitle(true)
    .title(function(d) {
      //TODO: hide tooltip row if zero
      return [
        "New Falcon 9: " + (d.value["New Falcon 9"] || "0"),
        "Used Falcon 9: " + (d.value["Used Falcon 9"] || "0"),
        "Falcon Heavy: " + (d.value["Falcon Heavy"] || "0"),
        "Falcon 1: " + (d.value["Falcon 1"] || "0")
      ].join("\n");
    })
    .x(d3.scaleOrdinal())
    .centerBar(true)
    .xAxis()
    .tickFormat(d3.format("0000"));
}

// Launches By Site

function showPastLaunchesBySite(ndx) {
  // Dimension
  var yearDimension = ndx.dimension(dc.pluck("launch_year"));
  //   Group
  var yearGroup = yearDimension
    .group()
    //  Custom reducer
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

  // Stacked Bar Chart
  var stackedBar = dc
    //   TODO   improve appearance of Launches by Site, use short names for sites?
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
    .stack(yearGroup, "Vandenberg Air Force Base", function(d) {
      return d.value["Vandenberg Air Force Base Space Launch Complex 4E"];
    })
    .stack(yearGroup, "Kennedy Space Center", function(d) {
      return d.value["Kennedy Space Center Historic Launch Complex 39A"];
    })
    .yAxisLabel("Launches", 25) // Add internal axis margins/paddingj
    .xAxisLabel("Year", 30)
    .renderHorizontalGridLines(true)
    .gap(6)
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .x(d3.scaleOrdinal())
    .centerBar(true)
    .xAxis()
    .tickFormat(d3.format("0000"));
}

// NOT USED ---------------------PAYLOADS By Year----------------------------

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

  // Bar Chart
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
    .x(d3.scaleOrdinal())
    .centerBar(true)
    .brushOn(false)
    .xAxis()
    .tickFormat(d3.format("0000"));
}

// Sucess Percentage. could show this just as Text percentage
//https://dc-js.github.io/dc.js/docs/stock.html

function showLaunchSuccessRate(ndx) {
  var launchDimension = ndx.dimension(dc.pluck("launch_success"));
  var launchGroup = launchDimension.group();
  var all = ndx.groupAll();

  // pieChart not used, consider removing
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

  // Launch Success row chart
  var rowChart = dc
    .rowChart("#rowChartLaunchSuccess")
    .width(500)
    .height(125)
    .gap(10)
    .dimension(launchDimension)
    .ordinalColors(["#2db92d", "#cd0000"])
    .useViewBoxResizing(true)
   //  TODO Add rowChart axis label: Launches
    //  .label(false)
    .label(function(d) {
      // if (rowChart.hasFilter() && !rowChart.hasFilter(d.key)) {
      // return d.key;
      //  }
      var label;
      // TODO Launch success barchart: dynamically show successes and failures
      d.key === true ? (label = "Success") : (label = "Failure");
      return label;
    })
   //   .renderTitle(true)
    .group(launchGroup);
}

// Modal to be shown on click of mission patch in data table

function showModal(missionPatchLarge) {
  //   jQuery to add large mission patch to modal content
  $("#modal-content").html(
    `<img src="${missionPatchLarge}" class="mission-patch-large" alt="Mission Patch Large"/>`
  );
  // Show modal
  $("#myModal").modal("show");
}

//----------------------- Print Filter -----------------------
// Source: https://gist.github.com/xhinking/9341806

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

// Get Object Length helper function

function getObjectLength(data) {
  return Object.keys(data).length;
}

// Next Mission API Call

function apiCallNextLaunch() {
  // TODO API call next launch: use only fields required
  var fields = [
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
  var filters = "?filter=" + fields.join(",");
  // API Call
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
// Populate Next Mission Card
function populateNextMissionCard(data) {
  // If rocket is reused, rename rocket to 'Used Falcon 9'
  //TODO catch error if reddit thread is null
  if (data.rocket.first_stage.cores[0].reused === true) {
    data.rocket.rocket_name = "Used Falcon 9";
  } else if (data.rocket.rocket_name === "Falcon 9") {
    //   else if, rename rocket to "New Falcon 9"
    data.rocket.rocket_name = "New Falcon 9";
  }

  // jQuery to Populate card with next launch details
  $("#nextMissionCard").html(
    `<div class="card-body">
<h4 class="card-title">${data.mission_name}</h4>
<p class="card-text">
   <ul>
      <li><strong>Flight Number:</strong> ${data.flight_number}</li>
      <li><strong>Rocket:</strong> ${data.rocket.rocket_name}</li>
      <li><strong>Launch Date:</strong> ${data.launch_date_local}</li>
      <li><strong>Launch Site:</strong> ${data.launch_site.site_name_long}</li>
      <li><strong>Details:</strong> ${data.details}</li>
      <li><a href=${
        data.links.reddit_campaign
      } target="_blank"><img src="assets/img/reddit-icon.png" /></a></li>
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

// Populate CountDown until next Launch

function populateCountDown(launchDateUnix) {
  var countDownDate = launchDateUnix * 1000; // millisecond since unix epoch

  // Below Countdown based on source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_countdown
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
      document.getElementById("nextLaunchCountdown").innerHTML = "Expired";
    }
  }, 1000);
}

// API Call to get location of next launch
function apiCallOneLaunchPad(site_id) {
  d3.json(`https://api.spacexdata.com/v3/launchpads/${site_id}`).then(function(
    data
  ) {
    // Add marker of next launch to google map
    addNextLaunchMarkerToMap(data);
  });
}

// Adds marker of next launch to google map
function addNextLaunchMarkerToMap(data) {
  // Get latitude and longitude
  var launchSite = data.site_name_long;

  //   Convert to object, ready for Google Maps API consumption
  var latLngMarker = {
    lat: data.location.latitude,
    lng: data.location.longitude
  };

  // Initialise google map, centered on launch site
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
  var fields = [
    "speed_kph",
    "speed_mph",
    "earth_distance_km",
    "earth_distance_mi"
  ];
  var filters = "?filter=" + fields.join(",");
  //   Call Roadster API
  d3.json(`https://api.spacexdata.com/v3/roadster${filters}`).then(function(
    data
  ) {
    console.log(data);
  });
}

//probbaly wont be used--------landings.html---------------- doesn't seem to respect filters
// function apiCallLandingPads() {
//   d3.json(`https://api.spacexdata.com/v3/landpads`).then(function(data) {
//     console.log(data[0]);
//     drawLandingGraph(data);
//     addLandingMarkers(data);
//   });
// }

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

// NOT USED Landings by site
function showLandingGraph(ndx) {
  var landingPadDimension = ndx.dimension(dc.pluck("full_name"));
  // var groupOutcome = landingPadDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
  var groupLandSuccess = landingPadDimension.group().reduceSum(function(d) {
    return +d.successful_landings;
  });
  var groupLandFail = landingPadDimension.group().reduceSum(function(d) {
    return d.attempted_landings - d.successful_landings;
  });

  //   print_filter(groupLandSuccess);
  //   print_filter(groupLandFail);
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
  var barChart = dc
    .barChart("#landings-chart")
    .width(400)
    .height(200)
    .x(d3.scaleOrdinal())
    .xUnits(dc.units.ordinal)
    .elasticX(true)
    .ordinalColors(["#2db92d", "#cd0000"])
    .useViewBoxResizing(true)
    .dimension(landingPadDimension)
    .group(groupLandSuccess, "Success")
    .stack(groupLandFail, "Fail");
}

//----------------PAYLOADS.html--------------------------
function apiCallPayloads() {
  d3.json("https://api.spacexdata.com/v3/payloads").then(function(data) {
    //  console.log(data[5]);
    drawPayloadGraphs(data);
  });
}

function drawPayloadGraphs(data) {
  // Crossfilter payload data
  var ndx = crossfilter(data);
  //   Show graphs
  showPayloadGraph(ndx);

  // Hide loading spinners
  $(".spinner-grow").hide();

  //   Render graphs
  dc.renderAll();
}

// Multiple Payload Graphs
function showPayloadGraph(ndx) {
  var orbitDimension = ndx.dimension(dc.pluck("orbit"));
  // if null, return "N/A"
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

  var rowChart = dc
    .rowChart("#pieChartPayloadByOrbit")
    .width(300)
    .height(160)
    .useViewBoxResizing(true)
    .cap(7)
    .gap(2)
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
    .width(300)
    .height(160)
    .useViewBoxResizing(true)
    .cap(7)
    .gap(2)
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
    .width(300)
    .height(160)
    .gap(2)
    //  .labelOffsetX()
    .useViewBoxResizing(true)
    .dimension(payloadTypeDimension)
    .group(groupPayloadType);
}
