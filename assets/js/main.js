//API GET Request

//TODO: catch apicall errors
function apiCall() {
  // array of required fields
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
  //   comma-separate fields, ready to be passed into url
  var filters = "?filter=" + fields.join(",");
  filters = "";

  // filters passed into url
  d3.json(`https://api.spacexdata.com/v3/launches/past${filters}`).then(
    function(data) {
      drawGraphs(data);
    }
  );
}

// Draw launch graphs
function drawGraphs(data) {
  // If first stage core is reused, change rocket name to 'Used Falcon 9'
  for (var i = 0; i < getObjectLength(data); i++) {
    if (data[i].rocket.first_stage.cores[0].reused === true) {
      // change rocket name to Used Falcon 9
      data[i].rocket.rocket_name = "Used Falcon 9";
      // else if rocket name is Falcon 9, rename to New Falcon 9
    } else if (data[i].rocket.rocket_name === "Falcon 9") {
      data[i].rocket.rocket_name = "New Falcon 9";
    }
  }

  // Crossfilter data
  var ndx = crossfilter(data);

  // Pass crossfiltered data to charts and tables
  showPastLaunches(ndx);
  showLaunchSuccessRate(ndx);
  showPieChartByRocket(ndx);
  showLaunchesBySiteByRocket(ndx);
  showDataTable(ndx);
  showRowCount(ndx);

  // Hide loading spinners
  $(".spinner-grow").hide();

  // Render all charts
  dc.renderAll();
}

// Launches by Site and Rocket
function showLaunchesBySiteByRocket(ndx) {
  // Dimension
  var siteDimension = ndx.dimension(function(d) {
    //   return d.launch_site.site_name_long;
    return d.launch_site.site_name;
  });
  // Group
  var rocketGroup = siteDimension
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
    .barChart("#chartLaunchesBySiteAndRocket")
    .width(500)
    .height(470)
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
    .xAxisLabel("Launch Site", 25)
    .yAxisLabel("Launches", 25)
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    //   .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ffff00"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .ordinalColors(["#30C5FF", "#AAC0AA", "#F6AE2D", "#963484"]) //963484
    .gap(60)
    .renderTitle(true)
    .title(function(d) {
      return [
        "New Falcon 9: " + (d.value["New Falcon 9"] || "0"),
        "Used Falcon 9: " + (d.value["Used Falcon 9"] || "0"),
        "Falcon Heavy: " + (d.value["Falcon Heavy"] || "0"),
        "Falcon 1: " + (d.value["Falcon 1"] || "0")
      ].join("\n");
    })
    .x(
      d3.scaleOrdinal()
      //   .domain([
      //     "Kwajalein Atoll",
      //     "Vandenberg Air Force Base",
      //     "Kennedy Space Center",
      //     "Cape Canaveral"
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
          return `<a href=javascript:void(0);><img src="${d.links.mission_patch_small}" 
          class='mission-patch-small menu_links' alt="Mission Patch" data-toggle="tooltip" data-placement="right"
           title="Click to enlarge" onclick="showModal('${d.links.mission_patch}')" /></a>`;
        }
      },
      {
        label: "Mission",
        //   Function allows mission detail dropdown on click of mission name
        format: function(d) {
          return `<a class="mission-links" data-toggle="collapse" href="#collapse${d.flight_number}" aria-expanded="false"
           aria-controls="collapseExample"><span data-toggle="tooltip" title="Show Details">${d.mission_name}<span>
           </a><div class="collapse" id="collapse${d.flight_number}"><div class="card card-body details-card">
          ${d.details}</div></div>`;
        }
      },
      {
        label: "Launch Date",
        format: function(d) {
          // Only display first 10 characters of launch_date_local, to ignore the time
          return d.launch_date_local.substring(0, 10);
        }
      },
      {
        label: "Launch Site",
        format: function(d) {
          return `<span data-toggle="tooltip" data-placement="left" title="${d.launch_site.site_name_long}">
          ${d.launch_site.site_name}</span>`;
        }
      },

      {
        label: "Rocket",
        format: function(d) {
         
         // if the flickr image array is not empty, insert link which triggers showModal()
         if (d.links.flickr_images.length > 0) {

            var details = d.details;
            // get first image in array
            var flickrImage1 = d.links.flickr_images[0]

            return `<a href=javascript:void(0);
            data-toggle="tooltip" data-placement="right"
            title="Show Launch Image" onclick="showModal('${flickrImage1}')">
            ${d.rocket.rocket_name}</a>`;
         } else {
            // else return without any link
            return d.rocket.rocket_name;
         }
        }
      },
      {
        label: "Launch Result",
        format: function(d) {
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
                     <li><a href='${d.links.video_link}' target="_blank"><img src="/assets/img/youtube_social_red.png" class="link-icon-small" alt="YouTube Link" title="Watch on YouTube"/></a></li>
                     <li><a href='${d.links.wikipedia}' target="_blank"><img src="assets/img/wikipedia-32.png" class="link-icon-small" alt="Wikipedia" title="Wikipedia"/></a></li>
                     <li><a href='${d.links.article_link}' target="_blank"><img src="assets/img/news-32.png" id="news-article-icon" class="link-icon-small" alt="News Article" title="News Article"/></a></li>
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

  // Define how many records to show per page (5)
  var ofs = 0;
  var pag = 8;

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

  //  Go to Next page
  $("#next").on("click", function() {
    ofs += pag;
    update_offset();
    dataTable.redraw();
  });

  //  Go to Previous
  $("#prev").on("click", function() {
    ofs -= pag;
    update_offset();
    dataTable.redraw();
  });
}

// Show how many launch records are currently included in crossfilter
// Based on code from: https://dc-js.github.io/dc.js/docs/stock.html
function showRowCount(ndx) {
  var all = ndx.groupAll();
  var dataCountTest = dc
    .dataCount(".dc-data-count")
    .crossfilter(ndx)
    .groupAll(all)
    .html({
      some:
        "<strong>%filter-count</strong> of <strong>%total-count</strong> launches selected" +
        " | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>",
      all: "Showing all launches - click to filter."
    });
}

// Show how many payload records are currently included in crossfilter
// Based on code from: https://dc-js.github.io/dc.js/docs/stock.html
function showRowCountPayloads(ndx) {
  var all = ndx.groupAll();
  var dataCountPayloads = dc
    .dataCount(".dc-data-count-payloads")
    .crossfilter(ndx)
    .groupAll(all)
    .html({
      some:
        "<strong>%filter-count</strong> of <strong>%total-count</strong> payloads selected" +
        " | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>",
      all: "Showing all payloads - click to filter."
    });
}

// Launches by Rocket Pie Chart
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
    .innerRadius(50)
    .externalRadiusPadding(30)
    .minAngleForLabel(0.1)
    .dimension(rocketDimension)
    .group(groupRocket)
    //  .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ff0000"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .ordinalColors(["#AAC0AA", "#F6AE2D", "#30C5FF", "#963484"]) // 963484 pink

    .height(320)
    .width(500)
    .cx(310)
    .cy(150)
    .legend(
      dc
        .legend()
        .x(30)
        .y(60)
        .autoItemWidth(true)
        .itemHeight(22)
        .gap(14)
    )
    .useViewBoxResizing(true);
}

// Show Launches Per Year By Rocket

function showPastLaunches(ndx) {
  // Dimension
  var yearDimension = ndx.dimension(dc.pluck("launch_year"));
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

  // Stacked Bar Chart
  var barChart = dc
    .barChart("#chartLaunchesPerYearByVehicle")
    .width(500)
    .height(470)
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
    .yAxisLabel("Launches", 25)
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .gap(6)
    //  .ordinalColors(["#ff9900", "#2db92d", "#1e90ff", "#ffff00"]) //orange: #ff9900, #1f78b4"  green: #00cc00
    .ordinalColors(["#30C5FF", "#AAC0AA", "#F6AE2D", "#963484"])
    .renderTitle(true)
    .title(function(d) {
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

// Bar chart showing Launch Results
function showLaunchSuccessRate(ndx) {
  var launchDimension = ndx.dimension(dc.pluck("launch_success"));
  var launchGroup = launchDimension.group();

  // Launch Result row chart
  var rowChart = dc
    .rowChart("#rowChartLaunchSuccess")
    .width(500)
    .height(115)
    .gap(8)
    .dimension(launchDimension)
    .ordinalColors(["#2db92d", "#cd0000"])
    .useViewBoxResizing(true)
    .label(function(d) {
      var label;
      d.key === true ? (label = "Success") : (label = "Failure");
      return label;
    })
    .group(launchGroup);
}

// Modal to be shown on click of mission patch in data table
function showModal(modalImage) {
// Set modal image attribute to modalImage
  $("#launch-image").attr("src", `${modalImage}`);
  // Show modal
  $("#myModal").modal("show");
}

// Print Filter
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

// Upcoming Launh API GET Request
function apiCallNextLaunch() {
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
  // append filters to url to minimise response size
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
  // If rocket is reused, rename rocket to "Used Falcon 9"
  if (data.rocket.first_stage.cores[0].reused === true) {
    data.rocket.rocket_name = "Used Falcon 9";
    //   else if, rename rocket to "New Falcon 9"
  } else if (data.rocket.rocket_name === "Falcon 9") {
    data.rocket.rocket_name = "New Falcon 9";
  }

  // jQuery to populate card with next launch details
  $("#nextMissionCard").html(
    `<div class="card-body">
<h4 class="card-title">${data.mission_name}</h4>
<p class="card-text">
   <ul>
      <li><strong>Flight Number:</strong> ${data.flight_number}</li>
      <li><strong>Rocket:</strong> ${data.rocket.rocket_name}</li>
      <li><strong>Launch Date:</strong> ${data.launch_date_local}</li>
      <li><strong>Launch Site:</strong> ${data.launch_site.site_name_long}</li>
      <li><a data-toggle="collapse" href="#collapseDetails" role="button" aria-expanded="false" aria-controls="collapseExample">Show Details >></a>
      <div class="collapse" id="collapseDetails">
      <div class="card card-body details-card">${data.details}</div></div></li>
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
  // multiple by 1000 to get milliseconds since Unix Epoch
  var countDownDate = launchDateUnix * 1000;

  // Below countdown function based on source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_countdown
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
    zoom: 11
  });

  // create marker of launch site
  var marker = new google.maps.Marker({
    position: latLngMarker,
    map: map,
    title: launchSite
  });
}

// Roadster API Get Request
function apiCallRoadster() {
  //   Call Roadster API
  d3.json("https://api.spacexdata.com/v3/roadster").then(function(data) {
    showRoadster(data);
  });
}

// Displays Roadster data in Roadster card
function showRoadster(data) {
  $("#speed").text(data.speed_kph.toFixed(2));
  $("#earth-distance").text(data.earth_distance_km.toFixed(2));
  $("#days-in-space").text(data.period_days.toFixed(0));
}

// API Call Payloads
function apiCallPayloads() {
  d3.json("https://api.spacexdata.com/v3/payloads").then(function(data) {
    drawPayloadGraphs(data);
  });
}

// Draw payload graphs
function drawPayloadGraphs(data) {
  // Crossfilter payload data
  var ndx = crossfilter(data);
  //   Show graphs
  showPayloadGraphs(ndx);
  // Show count of currently filtered payload records
  showRowCountPayloads(ndx);
  // Hide loading spinners
  $(".spinner-grow").hide();
  //   Render graphs
  dc.renderAll();
}

// Show 3 Payload Graphs - Payload by Orbit, Payloads by Manufacturer, Payloads by Type
function showPayloadGraphs(ndx) {
  // Dimensions
  var orbitDimension = ndx.dimension(dc.pluck("orbit"));
  // if null, return "N/A"
  var manufacturerDimension = ndx.dimension(function(d) {
    return d.manufacturer || "N/A";
  });
  var payloadTypeDimension = ndx.dimension(function(d) {
    return d.payload_type || "N/A";
  });

  // Groups
  var groupOrbit = orbitDimension.group().reduceCount();
  var groupManufacturer = manufacturerDimension.group().reduceCount();
  var groupPayloadType = payloadTypeDimension.group().reduceCount();

  var rowChartPayloadByOrbit = dc
    .rowChart("#barChartPayloadByOrbit")
    .width(500)
    .height(300)
    .useViewBoxResizing(true)
    .cap(10)
    .gap(2)
    .dimension(orbitDimension)
    .group(groupOrbit);

  var rowChartPayloadByManufacturer = dc
    .rowChart("#barChartPayloadManufacturer")
    .width(500)
    .height(300)
    .useViewBoxResizing(true)
    .cap(10)
    .gap(2)
    .dimension(manufacturerDimension)
    .group(groupManufacturer);

  var rowChartPayloadByType = dc
    .rowChart("#rowChartPayloadType")
    .width(500)
    .height(300)
    .gap(2)
    .useViewBoxResizing(true)
    .dimension(payloadTypeDimension)
    .group(groupPayloadType);
}
