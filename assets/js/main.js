// API Past Launches POST Request

const apiCallPastLaunches = () => {
	// Specified Fields
	const options = {
		select: [
			'cores',
			'date_utc',
			'date_local',
			'details',
			'flight_number',
			'id',
			'rocket',
			'launchpad',
			'links',
			'name',
			'success',
		],
		limit: 1000,
	};

	const query = {
		upcoming: false,
	};

	const pastLaunchesBody = {
		query,
		options,
	};

	const launchesURL = 'https://api.spacexdata.com/v4/launches/query';

	fetch(launchesURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(pastLaunchesBody),
	})
		.then((data) => data.json())
		.then((res) => drawGraphs(res.docs))
		.catch((error) => {
			alert(
				'SpaceX API Launches Endpoint.\n\n' + error + '\n\nPlease retry later.'
			);
			console.warn(error);
		});
};

// Draw launch graphs
const drawGraphs = (data) => {
	// If first stage core is reused, change rocket name to 'Used Falcon 9'
	for (let i = 0; i < getObjectLength(data); i++) {
		data[i]['rocket_name'] = convertRocketIdToRocketName(
			data[i].rocket,
			data[i].cores
		);
	}

	// Crossfilter data
	const ndx = crossfilter(data);

	// Pass crossfiltered data to charts and tables
	showPastLaunches(ndx);
	showLaunchSuccessRate(ndx);
	showPieChartByRocket(ndx);
	showLaunchesBySiteByRocket(ndx);
	showDataTable(ndx);
	showRowCount(ndx);

	// Hide loading spinners
	$('.spinner-grow').hide();

	// Render all charts
	dc.renderAll();
};

const convertLaunchpadIdToSiteName = (launchPadId) => {
	let siteName;
	switch (launchPadId) {
		case '5e9e4502f509092b78566f87':
			siteName = 'Vandenburg';
			break;
		case '5e9e4501f5090910d4566f83':
			siteName = 'Vandenburg';
			break;
		case '5e9e4501f509094ba4566f84':
			siteName = 'Cape Canaveral';
			break;
		case '5e9e4502f5090927f8566f85':
			siteName = 'STLS';
			break;
		case '5e9e4502f5090995de566f86':
			siteName = 'Kwajalein Atoll';
			break;
		case '5e9e4502f509094188566f88':
			siteName = 'Kennedy Space Center';
			break;
		default:
			siteName = 'Unknown';
			break;
	}
	return siteName;
};

// Launches by Site and Rocket
const showLaunchesBySiteByRocket = (ndx) => {
	// Dimension
	const siteDimension = ndx.dimension((d) =>
		convertLaunchpadIdToSiteName(d.launchpad)
	);

	// Custom Reducer
	const reduceAdd = (i, d) => {
		i[d.rocket_name] = (i[d.rocket_name] || 0) + 1;
		return i;
	};
	const reduceRemove = (i, d) => {
		i[d.rocket_name] = (i[d.rocket_name] || 0) - 1;
		return i;
	};
	const reduceInitial = () => ({});

	// Group
	const rocketGroup = siteDimension
		.group()
		.reduce(reduceAdd, reduceRemove, reduceInitial);

	// Bar Chart
	const barChart = dc
		.barChart('#chartLaunchesBySiteAndRocket')
		.width(500)
		.height(470)
		.dimension(siteDimension)
		.group(rocketGroup, 'Falcon 1', (d) => d.value['Falcon 1'])
		.stack(rocketGroup, 'New Falcon 9', (d) => d.value['New Falcon 9'])
		.stack(rocketGroup, 'Used Falcon 9', (d) => d.value['Used Falcon 9'])
		.stack(rocketGroup, 'Falcon Heavy', (d) => d.value['Falcon Heavy'])
		.xAxisLabel('Launch Site', 25)
		.yAxisLabel('Launches', 25)
		.useViewBoxResizing(true)
		.xUnits(dc.units.ordinal)
		.renderHorizontalGridLines(true)
		.ordinalColors(['#FAF3DD', '#0D324D', '#73EEDC', '#A4A8D1'])
		.gap(60)
		.renderTitle(true)
		.title((d) => {
			return [
				d.key,
				'New Falcon 9: ' + (d.value['New Falcon 9'] || '0'),
				'Used Falcon 9: ' + (d.value['Used Falcon 9'] || '0'),
				'Falcon Heavy: ' + (d.value['Falcon Heavy'] || '0'),
				'Falcon 1: ' + (d.value['Falcon 1'] || '0'),
			].join('\n');
		})
		.margins({ top: 30, left: 60, right: 20, bottom: 70 })
		.x(d3.scaleBand());
};

// Data Table

const showDataTable = (ndx) => {
	const dimension1 = ndx.dimension((d) => d.dim);
	const dataTable = dc
		.dataTable('#dc-data-table')
		.dimension(dimension1)
		.height(200)
		.width(200)
		.size(Infinity)
		.columns([
			{
				label: 'Flight #',
				format: (d) => d.flight_number,
			},
			{
				label: 'Patch',
				format: (d) => {
					let pic = d.links.patch.small;
					return `<img src="${pic}" 
                  class='mission-patch-small menu_links' alt="Mission Patch" height="50px"  
                  onclick="showModal('${d.links.patch.large}')" />`;
				},
			},
			{
				label: 'Mission',
				//   Function allows mission detail dropdown on click of mission name
				format: (d) => {
					if (d.details) {
						return `<span class="mission-links" data-toggle="tooltip" data-placement="right" title="${d.details}">${d.name}</span>`;
					} else {
						return `<span>${d.name}</span>`;
					}
				},
			},
			{
				label: 'Launch Date',
				// Display first 10 characters of launch_date_local, to ignore the time
				format: (d) => d.date_utc.substring(0, 10),
			},
			{
				label: 'Launch Site',
				format: (d) => {
					const siteName = convertLaunchpadIdToSiteName(d.launchpad);
					return `<span>${siteName}</span>`;
				},
			},
			{
				label: 'Rocket',
				format: (d) => {
					// if the flickr image array is not empty, insert link which triggers showModal()
					if (d.links.flickr.original.length > 0) {
						// get first image in array
						const flickrImage1 = d.links.flickr.original[0];
						return `<a class="rocket-link"
                     onclick="showModal('${flickrImage1}')">
                     ${d.rocket_name}</a>`;
					} else {
						// else return without any link
						return d.rocket_name;
					}
				},
			},
			{
				label: 'Launch Result',
				format: (d) => {
					const launchOutcome = d.success ? 'SUCCESS' : 'FAILURE';
					const launchOutcomeClass = launchOutcome.toLowerCase();
					const details = d.details;
					return `<span class='${launchOutcomeClass}' title="${details}">${launchOutcome}</span>`;
				},
			},
			{
				label: 'Video',
				format: (d) => {
					//   Youtube link
					// icon source: https://www.iconspedia.com/icon/news-icon-22850.html
					return `<a href='${d.links.webcast}' target="_blank" rel="noreferrer">
                  <img src="assets/img/youtube_social_red.png" class="link-icon-small"
                  width="20px" height="20px"
                  alt="YouTube Link" /></a>`;
				},
			},
		])
		//  Pagination based on example: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
		.order(d3.descending)
		.showSections(false)
		.on('preRender', update_offset)
		.on('preRedraw', update_offset)
		.on('pretransition', display);

	// Define how many records to show per page (5)
	let ofs = 0;
	let pag = 8;

	//  Pagination based on example: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
	function update_offset() {
		let totFilteredRecs = ndx.groupAll().value();
		// let end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
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
		let totFilteredRecs = ndx.groupAll().value();
		let end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
		d3.select('#begin').text(end === 0 ? ofs : ofs + 1);
		d3.select('#end').text(end);
		d3.select('#last').attr('disabled', ofs - pag < 0 ? 'true' : null);
		d3.select('#next').attr(
			'disabled',
			ofs + pag >= totFilteredRecs ? 'true' : null
		);
		d3.select('#size').text(totFilteredRecs);
		if (totFilteredRecs != ndx.size()) {
			d3.select('#totalsize').text('(Unfiltered Total: ' + ndx.size() + ')');
		} else {
			d3.select('#totalsize').text('');
		}
	}

	//  Go to Next page
	$('#next').on('click', () => {
		ofs += pag;
		update_offset();
		dataTable.redraw();
	});

	//  Go to Previous
	$('#prev').on('click', () => {
		ofs -= pag;
		update_offset();
		dataTable.redraw();
	});
};

// Show how many launch records are currently included in crossfilter
// Based on code from: https://dc-js.github.io/dc.js/docs/stock.html
const showRowCount = (ndx) => {
	const all = ndx.groupAll();
	let dataCountTest = dc
		.dataCount('.dc-data-count')
		.crossfilter(ndx)
		.groupAll(all)
		.html({
			some:
				'<strong>%filter-count</strong> of <strong>%total-count</strong> launches selected' +
				" | <a href='javascript:dc.filterAll(); dc.redrawAll();' rel='noreferrer'>Reset</a>",
			all: 'Showing all launches',
		});
};

// Show how many payload records are currently included in crossfilter
// Based on code from: https://dc-js.github.io/dc.js/docs/stock.html
const showRowCountPayloads = (ndx) => {
	let all = ndx.groupAll();
	let dataCountPayloads = dc
		.dataCount('.dc-data-count-payloads')
		.crossfilter(ndx)
		.groupAll(all)
		.html({
			some:
				'<strong>%filter-count</strong> of <strong>%total-count</strong> payloads selected' +
				" | <a href='javascript:dc.filterAll(); dc.redrawAll();' rel='noreferrer'>Reset</a>",
			all: 'Showing all payloads',
		});
};

// Launches by Rocket Pie Chart
const showPieChartByRocket = (ndx) => {
	// Dimension
	const rocketDimension = ndx.dimension((d) => d.rocket_name);
	//   Group
	const groupRocket = rocketDimension.group();

	// Pie Chart
	const pieChart = dc
		.pieChart('#pieChartLaunchesByRocket')
		.radius(120)
		.minAngleForLabel(0.2)
		.dimension(rocketDimension)
		.group(groupRocket)
		.ordinalColors(['#0D324D', '#73EEDC', '#FAF3DD', '#A4A8D1'])
		.height(295)
		.width(500)
		.label((d) => d.value)
		.cx(330)
		.cy(150)
		.legend(dc.legend().x(30).y(65).autoItemWidth(true).itemHeight(32).gap(12))
		.useViewBoxResizing(true);
};

// Show Launches Per Year By Rocket

const showPastLaunches = (ndx) => {
	// Dimension
	const yearDimension = ndx.dimension((d) => {
		return d.date_utc.slice(0, 4);
	});

	// Reducer
	const reduceAdd = (i, d) => {
		i[d.rocket_name] = (i[d.rocket_name] || 0) + 1;
		return i;
	};
	const reduceRemove = (i, d) => {
		i[d.rocket_name] = (i[d.rocket_name] || 0) - 1;
		return i;
	};
	const reduceInitial = (i, d) => ({});

	// Group
	const rocketGroup = yearDimension
		.group()
		//  Custom reducer
		.reduce(reduceAdd, reduceRemove, reduceInitial);
	// Stacked Bar Chart
	const barChart = dc
		.barChart('#chartLaunchesPerYearByVehicle')
		.width(500)
		.height(470)
		.dimension(yearDimension)
		.group(rocketGroup, 'Falcon 1', (d) => d.value['Falcon 1'])
		.stack(rocketGroup, 'New Falcon 9', (d) => d.value['New Falcon 9'])
		.stack(rocketGroup, 'Used Falcon 9', (d) => d.value['Used Falcon 9'])
		.stack(rocketGroup, 'Falcon Heavy', (d) => d.value['Falcon Heavy'])
		.xAxisLabel('Year', 25)
		.yAxisLabel('Launches', 25)
		.useViewBoxResizing(true)
		.xUnits(dc.units.ordinal)
		.margins({ top: 30, left: 60, right: 30, bottom: 70 })
		.renderHorizontalGridLines(true)
		.gap(6)
		.ordinalColors(['#FAF3DD', '#0D324D', '#73EEDC', '#A4A8D1'])
		.renderTitle(true)
		.title((d) => {
			return [
				d.key,
				'New Falcon 9: ' + (d.value['New Falcon 9'] || '0'),
				'Used Falcon 9: ' + (d.value['Used Falcon 9'] || '0'),
				'Falcon Heavy: ' + (d.value['Falcon Heavy'] || '0'),
				'Falcon 1: ' + (d.value['Falcon 1'] || '0'),
			].join('\n');
		})
		.x(d3.scaleBand())
		.xAxis()
		.tickFormat(d3.format('0000'));
};

// Bar chart showing Launch Results
const showLaunchSuccessRate = (ndx) => {
	const launchDimension = ndx.dimension(dc.pluck('success'));
	const launchGroup = launchDimension.group();

	// Launch Result row chart
	const rowChart = dc
		.rowChart('#rowChartLaunchSuccess')
		.width(500)
		.height(110)
		.gap(4)
		.dimension(launchDimension)
		.renderTitleLabel(true)
		.ordinalColors(['#2db92d', '#cd0000'])
		.useViewBoxResizing(true)
		.label(() => '')
		.titleLabelOffsetX(413)
		.title((d) => (d.key ? 'Success: ' : 'Failure: ') + d.value)
		.group(launchGroup);
};

// Modal to be shown on click of mission patch in data table
const showModal = (modalImage) => {
	// Set modal image attribute
	$('#launch-image').attr('src', `${modalImage}`);
	$('#myModal').modal('show');
};

// Print Filter
// Source: https://gist.github.com/xhinking/9341806
const print_filter = (filter) => {
	let f = eval(filter);
	if (typeof f.length != 'undefined') {
	} else {
	}
	if (typeof f.top != 'undefined') {
		f = f.top(Infinity);
	} else {
	}
	if (typeof f.dimension != 'undefined') {
		f = f
			.dimension(function (d) {
				return '';
			})
			.top(Infinity);
	} else {
	}
	console.log(
		filter +
			'(' +
			f.length +
			') = ' +
			JSON.stringify(f)
				.replace('[', '[\n\t')
				.replace(/}\,/g, '},\n\t')
				.replace(']', '\n]')
	);
};

// Get Object Length helper function
const getObjectLength = (data) => Object.keys(data).length;

// Upcoming Launch API GET Request
const apiCallNextLaunch = () => {
	const nextLaunchURL = 'https://api.spacexdata.com/v4/launches/next';

	fetch(nextLaunchURL)
		.then((data) => data.json())
		.then((res) => {
			// get details (lat/long) of launch pad
			apiCallOneLaunchPad(res.launchpad);
			// populate next mission's details
			populateNextMissionCard(res);
			// compute and populate countdown until next launch
			populateCountDown(res.date_unix);
		})
		.catch((error) => {
			alert(
				'SpaceX API Next Launch Endpoint Error.\n\n' +
					error +
					'\n\nPlease retry later.'
			);
			console.warn(error);
		});
};

const convertRocketIdToRocketName = (rocketId, cores) => {
	let rocket_name;
	switch (rocketId) {
		case '5e9d0d95eda69955f709d1eb':
			rocket_name = 'Falcon 1';
			break;
		case '5e9d0d95eda69973a809d1ec':
			rocket_name = (cores[0].reused === true ? 'Used' : 'New') + ' Falcon 9';
			break;
		case '5e9d0d95eda69974db09d1ed':
			rocket_name = 'Falcon Heavy';
			break;
		case '5e9d0d96eda699382d09d1ee':
			rocket_name = 'Starship';
			break;
		default:
			rocket_name = 'NA';
			break;
	}
	return rocket_name;
};

const getNextLaunchRocketImage = (rocket_name) => {
	let nextLaunchRocketImage;
	switch (rocket_name) {
		case 'Used Falcon 9' || 'Used Falcon 9':
			nextLaunchRocketImage = 'assets/img/falcon9.png';
			break;
		case 'Falcon Heavy':
			nextLaunchRocketImage = 'assets/img/falcon-heavy.png';
			break;
		case 'Starship':
			nextLaunchRocketImage = 'assets/img/starship.png';
			break;
		default:
			nextLaunchRocketImage = 'assets/img/falcon9.png';
			break;
	}
	return nextLaunchRocketImage;
};

// Populate Next Mission Card
const populateNextMissionCard = (data) => {
	const rocket_name = convertRocketIdToRocketName(data.rocket, data.cores);
	const nextLaunchRocketImage = getNextLaunchRocketImage(rocket_name);

	$('#next-launch-rocket-image').attr('src', `${nextLaunchRocketImage}`);
	$('#next-launch-patch').attr(
		'onclick',
		`showModal('${data.links.patch.large}')`
	);
	$('#flight-number').text(data.flight_number);
	$('#mission-name').text(data.name);
	$('#rocket').text(rocket_name);
	$('#launch-date').text(data.date_local);
	// $('#launch-site').text(data.launch_site.site_name_long);
	$('#next-mission-detail').text(data.details);
	$('#next-launch-patch').attr('src', `${data.links.patch.small}`);
	// Add To Calendar event details
	$('#addeventatc1 .title').text(`SpaceX Launch - ${data.name}`);
	$('#addeventatc1 .start').text(data.date_utc);
	// $('#addeventatc1 .location').text(data.launch_site.site_name_long);
	$('#addeventatc1 .description').text(
		`Rocket: ${rocket_name} \n Details: ${data.details}`
	);
};

// Populate CountDown until next Launch
const populateCountDown = (launchDateUnix) => {
	// multiple by 1000 to get milliseconds since Unix Epoch
	let countDownDate = launchDateUnix * 1000;

	// Below countdown function based on source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_countdown
	// Update the count down every 1 second
	let x = setInterval(() => {
		// Get today's date and time
		let now = new Date().getTime();
		// Find the distance between now and the count down date
		let distance = countDownDate - now;
		// Time calculations for days, hours, minutes and seconds
		let days = Math.floor(distance / (1000 * 60 * 60 * 24));
		let hours = Math.floor(
			(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((distance % (1000 * 60)) / 1000);
		// Output the result in an element with id="demo"
		document.getElementById('days').innerHTML = days;
		document.getElementById('minutes').innerHTML = minutes;
		document.getElementById('hours').innerHTML = hours;
		document.getElementById('seconds').innerHTML = seconds;
		// If the count down is over, write some text
		if (distance < 0) {
			clearInterval(x);
			document.getElementById('nextLaunchCountdown').innerHTML = 'Expired';
		}
	}, 1000);
};

// API Call to get location of next launch
const apiCallOneLaunchPad = (site_id) => {
	const oneLaunchPadURL = 'https://api.spacexdata.com/v4/launchpads/';
	fetch(oneLaunchPadURL + site_id)
		.then((data) => data.json())
		.then((res) => {
			// Add marker of next launch to google map
			addNextLaunchMarkerToMap(res);

			$('#launch-site').text(res.full_name);
			$('#addeventatc1 .location').text(res.full_name);
		})
		.catch((error) => {
			alert(
				'Failed to get response from the SpaceX API Launchpads Endpoint.\n\n' +
					error +
					'\n\nPlease retry later.'
			);
			console.warn(error);
		});
};

// Adds marker of next launch to google map
const addNextLaunchMarkerToMap = (data) => {
	// Get latitude and longitude of next launch site
	const launchSite = data.name;

	//   Convert to object, ready for Google Maps API consumption
	const latLngMarker = {
		lat: data.latitude,
		lng: data.longitude,
	};

	// Initialise google map, centered on launch site
	const map = new google.maps.Map(document.getElementById('map'), {
		center: latLngMarker,
		mapTypeId: 'hybrid',
		zoom: 11,
	});

	// create marker of launch site
	const marker = new google.maps.Marker({
		position: latLngMarker,
		map: map,
		title: launchSite,
	});
};

// Roadster API Get Request
const apiCallRoadster = () => {
	//   Call Roadster API
	const roadsterURL = 'https://api.spacexdata.com/v4/roadster';
	fetch(roadsterURL)
		.then((data) => data.json())
		.then((res) => showRoadster(res))
		.catch((error) => {
			alert(
				'Failed to get response from the SpaceX API Roadster Endpoint.\n\n' +
					error +
					'\n\nPlease retry later.'
			);
			console.warn(error);
		});
};

// Displays Roadster data in Roadster card
const showRoadster = (data) => {
	$('#speed').text(formatThousandsComma(data.speed_kph.toFixed(2)) + ' km/h');
	$('#earth-distance').text(
		formatThousandsComma(data.earth_distance_km.toFixed(2)) + ' km'
	);
	const launchDate = new Date(data.launch_date_utc);
	const todaysDate = new Date();
	const daysInSpace = Math.round(
		(todaysDate - launchDate) / (1000 * 60 * 60 * 24)
	);
	$('#days-in-space').text(daysInSpace + ' days');
};

// source: https://blog.abelotech.com/posts/number-currency-formatting-javascript/
const formatThousandsComma = (num) =>
	num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

// API Call Payloads
const apiCallPayloads = () => {
	// Specified fields
	const options = {
		select: ['name', 'type', 'manufacturers', 'orbit'],
		limit: 1000,
	};

	const payloadsBody = {
		options,
	};

	payloadsURL = 'https://api.spacexdata.com/v4/payloads/query';

	fetch(payloadsURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payloadsBody),
	})
		.then((data) => data.json())
		.then((data) => drawPayloadGraphs(data.docs))
		.catch((error) => {
			alert(
				'Failed to get response from the SpaceX API Payloads Endpoint.\n\n' +
					error +
					'\n\nPlease retry later.'
			);
			console.warn(error);
		});
};

// Draw payload graphs
const drawPayloadGraphs = (data) => {
	// Crossfilter payload data
	const ndx = crossfilter(data);
	//   Show graphs
	showPayloadGraphs(ndx);
	// Show count of currently filtered payload records
	showRowCountPayloads(ndx);
	// Hide loading spinners
	$('.spinner-grow').hide();
	//   Render graphs
	dc.renderAll();
};

// Show 3 Payload Graphs - Payload by Orbit, Payloads by Manufacturer, Payloads by Type
const showPayloadGraphs = (ndx) => {
	// Dimensions
	const orbitDimension = ndx.dimension(dc.pluck('orbit'));
	// if null, return "N/A"
	const manufacturerDimension = ndx.dimension(
		(d) => d.manufacturers[0] || 'N/A'
	);
	const payloadTypeDimension = ndx.dimension((d) => d.type || 'N/A');

	// Groups
	const groupOrbit = orbitDimension.group().reduceCount();
	const groupManufacturer = manufacturerDimension.group().reduceCount();
	const groupPayloadType = payloadTypeDimension.group().reduceCount();

	// Row Chart, Payload By Orbit
	const rowChartPayloadByOrbit = dc
		.rowChart('#barChartPayloadByOrbit')
		.width(500)
		.height(330)
		.useViewBoxResizing(true)
		.cap(10)
		.gap(2)
		.renderTitleLabel(true)
		.titleLabelOffsetX(413)
		.label(() => '')
		.dimension(orbitDimension)
		.group(groupOrbit);

	// Row Chart, Payload By Manufacturer
	const rowChartPayloadByManufacturer = dc
		.rowChart('#barChartPayloadManufacturer')
		.width(500)
		.height(330)
		.useViewBoxResizing(true)
		.cap(10)
		.gap(2)
		.renderTitleLabel(true)
		.titleLabelOffsetX(413)
		.label(() => '')
		.dimension(manufacturerDimension)
		.group(groupManufacturer);

	// Row Chart, Payload By Type
	const rowChartPayloadByType = dc
		.rowChart('#rowChartPayloadType')
		.width(500)
		.height(330)
		.gap(2)
		.renderTitleLabel(true)
		.titleLabelOffsetX(413)
		.label(() => '')
		.useViewBoxResizing(true)
		.dimension(payloadTypeDimension)
		.group(groupPayloadType);
};

apiCallPastLaunches();
apiCallNextLaunch();
apiCallPayloads();
apiCallRoadster();
$('body').tooltip({ selector: '[data-toggle=tooltip]' });

// Toggle active link in nav bar
$('.navbar-nav li').click((e) => {
	$(e.currentTarget).addClass('active');
	$(e.currentTarget).siblings().removeClass('active');
});

// Reset charts
$('.filter-button').click(() => {
	dc.filterAll();
	dc.redrawAll();
});
