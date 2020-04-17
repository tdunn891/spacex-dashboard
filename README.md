# [SpaceX Dashboard](https://tdunn891.github.io/spacex-dashboard)

## Project Purpose

This project aims to display data from the SpaceX [API](https://github.com/r-spacex/SpaceX-API) in an accessible, informative and interactive format. 


## User Experience Design

#### Strategy

Site Objectives:

- Present SpaceX's launch and payload data in an intuitive and fun way.
- Promote interest in SpaceX's activities.

User Needs:

The target audience is SpaceX and space enthusiasts. Users should be able to:

- Interact with SpaceX's launch and payload data
- See images, external video links relating to each launch
- Find out about future launch details

The following Opportunities/Problems table was used to determine which strategic priorities the UX efforts should address (in this order):

| Opportunity/Problem                           | Importance     | Viability/Feasibility  |
| --------------------------------------------- |:--------------:|:-----------------------:|
| A. Display launch and payload data to the user| 5 | 5 |
| B. Allow interactive filtering of data        | 5 | 5 |
| C. Display underlying filtered data in a table| 4 | 5 |
| D. Promote interest in SpaceX's future activities | 3 | 3 |

#### Scope

##### Functional Specifications

In considering the functional specifications, I researched existing graphical implementations of the SpaceX API. There is a vast array of data available from SpaceX (13 different endpoints), so it was important to scope in only the most engaging and interesting insights, while at the same time ensuring the data was also accessible to users with only minimal knowledge of SpaceX. Dashboards by their nature can (if implemented poorly) cognitively overload the user, making the functional scope a key consideration.

Feature Set:

- Interactive dashboard of past SpaceX launches
- Interactive dashboard of SpaceX's payload data
- Show details of upcoming launch, including map location
- Show the current speed and location of the Elon Musk's Tesla Roadster

##### Content Requirements

In order to provide the value of the above features, the following content is required:

- Interactive charts (dc.js stacked bar charts, pie chart, row charts).
- Data table (dc.js) showing further detail of the currently selected launches.
- Icons to visually aide the user.
- Embedded Google Map showing the launch site of the next launch (eg Cape Canaveral).
- 'Add to Calendar' button to add next launch to user's calendar (Google, Microsoft Calendar etc).
- Images of mission patches of past missions.
- Bootstrap image carousel to show images of the Telsa Roadster.

#### Structure

##### Interaction Design

The strategic goals of the site rests largely on the user's willingness to interact with the charts and data table. The advantage of a dashboard is being able to view many different dimensions or views of a dataset at the same time. To this end, a single-page structure was selected as most appropriate. For example, on desktop screen sizes, this structure allows all four charts in the Launch Explorer section to be viewed at once. The user is able to see the effects their filtering has to all four charts at once. For mobile and tablet screens, the navigation bar collapses into a toggler to allow jumping to each section. A 'Reset' button is provided which allows a convenient way to reset filters on all charts.

Consistency & Predictability:

Icons were used to give visual cues as to what the section was about:
Launch Explorer - rocket flying icon, Next Launch - rocket on launch pad icon, Payload Analysis - satellite icon.

Feedback:

Given the many possible interactions available to the user on the site, the following feedback mechanisms were employed to encourage as much interaction as possible:

- Tooltips are used on mouse over of all charts, giving context to each chart's meaning.
- Tooltips also activate on mouse over of chart segments, giving additional detail of the segment.
- Slight colour fade occurs on mouse over of each colour segment within each chart. Cursor also changes to a hand icon to signal clickability.
- Colour transition on hover shows links icons are clickable.


##### Information Architecture

The organising principle and order of the content is structured to ensure the user understands and engages with each chart and section.

#### Skeleton

The easiest chart to understand - 'Launches by Rocket' - is located at the top left of the page where the eye will naturally land first. The next chart - 'Launch Success' features simple, intuitive two bar chart - green: success, red: failure. Once this foundational understanding is achieved, the user can see that the colours representing the rocket names are synchronised across the next 2 charts - 'Launches by Year' and 'Launches by Site'. 

Similarly, in the Payload Analysis dashboard, the most basic chart 'Payloads by Type' is presented first, followed by 'Payloads by Orbit', then 'Payloads by Manufacturer'.

##### Wireframes

Two sets of wireframes were created in the early development stage to help set out the content and layout in differing device sizes. 

[Desktop & Mobile Wireframes](https://github.com/tdunn891/milestone-2/tree/master/assets/img/wireframes)

#### Surface

Colours: A dark colour theme was employed to give the user a sense of outer space.

Fonts: A futuristic typeface was employed consistently for all text to convey a futuristic, exciting nature of spaceflight.

### User Stories

User stories:

- User 1 - "As a user interested in exploring the failures of SpaceX, I want to be able to be able to filter the dashboard by launch failures, to see when they happened, where they were, and which rockets failed."
- User 2 - "As a user who loves to watch live streams and videos of SpaceX's launches, I want a way to filter flights to find specific launches and the related SpaceX YouTube links."
- User 3 - "As a user interested in finding more about what SpaceX actually deploys into orbit, I want to interact with data concerning payloads."
- User 4 - "As a user who wants to know about the upcoming launch, I want to see the key details, and don't want to miss the next live stream."

How the needs are met:

- User 1's needs are met by Launch History dashboard via its ability to filter the whole dashboard and data table to show failures only
- User 2's needs are met by the inclusion of YouTube links in the data table for each launch
- User 3's needs are met by the Payload Analysis dashboard with 3 charts showing various payload breakdowns
- User 4's needs are met by the Next Launch section, in particular the 'Add Launch to Calendar' feature

## Features

### Existing Features

- Feature 1: Interactive pie chart displaying all SpaceX's launches to date, broken down by rocket name
- Feature 2: Interactive stacked bar chart displaying all launches to date year on year, grouped by rocket name
- Feature 3: Interactive stacked bar chart displaying all launches to date broken down by launch pad site, grouped by rocket name
- Feature 4: Interactive row chart displaying all launches broken down by launch outcome ie. Success or Failure
- Feature 5: Paginated data table showing the dataset after any filters are applied (via Features 1,2,3,4). Some additional detail is provided, including an image of the mission patch, which on click, shows a higher resolution version of the image in a modal popup. A Youtube link for each launch is also populated. Clicking on the mission name displays launch detail text. Clicking on Rocket Name shows an image from the launch in a modal
- Feature 6: Next launch section showing key details, launchpad Google map with marker, and countdown until the next scheduled SpaceX launch. All data in this section is dynamically populated from the 'Upcoming Launch' SpaceX API endpoint
- Feature 7: An 'Add Launch to Calendar' button is featured below the launch countdown, so that the user won't miss the next launch, and can be reminded to watch SpaceX's live stream. On clicking of this button, the user can select which calendar account the event is to be added to (Apple, Google, Outlook, Yahoo). The calendar event fields (ie. Title, Location, Time, Details) are dynamically populated from the 'Upcoming Launch' SpaceX API endpoint.
- Feature 8: Interactive row chart showing count of payloads SpaceX has deployed into each orbit type (eg Geostationary Transfer Orbit (GTO), Low Earth Orbit (LEO))
- Feature 9: Interactive row chart showing count of payloads manufactured by each manufacturer (eg SpaceX, Boeing, Airbus)
- Feature 10: Interactive row chart showing count of payloads by payload type (eg Satellite or SpaceX vehicle)
- Feature 11: Data table showing details of Elon Musk's Tesla Roadster that was launched into orbit in 2018. Details include the vehicle's current speed, days in orbit and current distance from Earth. This data is dynamically updated every 10 minutes via the SpaceX API Roadster endpoint

### Features Left to Implement

Potential Feature 1 - A section called Landing Explorer which uses the Landings API endpoint (https://api.spacexdata.com/v3/landpads). This would be a stacked bar chart showing the success/failure of landing attempts for each landing pad

Potential Feature 2 - A link in data table to show a gallery of pictures from each launch (source image links available in the Launches API)

## Technologies Used

- [Autoprefixer CSS Online](https://autoprefixer.github.io/) : used to add vendor prefixes.
- [Bootstrap](https://getbootstrap.com) : responsive, mobile-first framework.
- [Chrome Developer Tools](https://developers.google.com/web/tools/chrome-devtools) : used extensively to ensure device responsiveness.
- [Crossfilter](https://github.com/crossfilter/crossfilter) : used to filter and manipulate data before it is fed into dc.js charts. 
- [CSS3](https://www.w3.org/Style/CSS/Overview.en.html) : styling language.
- [d3.js](https://d3js.org/) : javascript library for manipulating documents based on data.
- [dc.js](https://dc-js.github.io/dc.js/) : javascript charting library working on top of d3.js, used to create all charts and data table.
- [Favicon Generator](https://www.favicon-generator.org) : used to create a 16x16 icon, displayed next to page title in browser.
- [Git](https://git-scm.com/) : used for version control.
- [GitHub](https://github.com) : used to host code repository and to deploy project (via GitHub Pages).
- [Google Fonts](https://fonts.google.com/) : used for the main font - 'Share Tech'.
- [Google Maps Javascript API](https://developers.google.com/maps/documentation) : used to display Google Map and add marker at the site of the next launch.
- [HTML5](https://www.w3.org/html) : used for page structure.
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) : used for to show modal on form submission, dynamically resize navbar height
- [jQuery](https://jquery.com/) : used to select and manipulate HTML elements.
- [Paint S](https://apps.apple.com/us/app/paint-s/id736473980?mt=12) : used for wireframe development.
- [popper.js](https://popper.js.org/) : javascript library required to allow Bootstrap tooltips.
- [Postman](https://www.getpostman.com/) : used extensively for developing and refining the API GET Requests.
- [SpaceX API](https://github.com/r-spacex/SpaceX-API) : used as source data for dashboards.
- [VSCode](https://code.visualstudio.com) : preferred code editor.
- [W3C Validator](https://jigsaw.w3.org) : used to validate HTML & CSS.

## Testing

Extensive manual testing was conducted to ensure the site functions and looks well on all major browsers (Chrome, Firefox, Safari, Edge) and device sizes.

The following manual tests passed:

| Test No. | Test Name | Result |
|:-|:-|:-|
|1|Launch and payload dashboard can be filtered and unfiltered on graph segment click|PASS|
|2|Any filter applied within a dashboard group updates all other graphs in that dashboard group (ie in Launches or Payloads groups)|PASS|
|3|Reset buttons reset filters of all graphs in dashboard|PASS|
|4|All charts are appropriately sized for each device (Mobile, Desktop)|PASS|
|5|All navigation links smooth scroll to correct section|PASS|
|6|All text is readable and appropriate size|PASS|
|7|All external links work and open in new window (target="_blank")|PASS|
|8|'Add Launch to Calendar' button fires with correct parameters|PASS|
|9|Forward and Back browser buttons aren't required, but if used don't cause breaks|PASS|
|10|Page and graphs do not take excessive time to load and render|PASS|
 
The following tests failed:

| Issue No. | Test Name | Result | Issue | Resolution |
|:-|:-|:-|:-|:-|
|1|Data table readable on all devices|FAIL|On mobile devices, data table text was too large, causing table to extend horizontally beyond the viewport.|Font-size was decreased and table element was wrapped in a Bootstrap class 'table-responsive' which allows horizontal scrolling|
|2|Charts appropriately sized for each device (Tablet)|FAIL|Payload graphs were taking up too much vertical space on a tablet. This was bad UX because the user couldn't see the effect filtering one chart had on the others|This was corrected by using bootstrap responsive column sizing combined with column offsets.|
|3|No excessive amounts of text|FAIL|Next mission detail text was too long, hindering the key takeaway from the section.|This text was collapsed behind a 'Show Details' link, which can be expanded if the user wants to see this detail.

Code Validation

|Code |Result|
|:-|:-|
CSS ([W3C](https://jigsaw.w3.org/css-validator/))|PASS|
HTML ([W3C](https://validator.w3.org/))|PASS|
Javascript with no major errors ([jshint](https://jshint.com/))|PASS|


## Deployment

The site was deployed on GitHub Pages, by following the below steps:

- Selected Repository on github.com
- "Settings" > "Github Pages"
- Selected "Master Branch" from the "Source" dropdown box.
- Notification: "Github Pages source saved"
- Notification: "Your site was published at [https://tdunn891.github.io/milestone-2/](https://tdunn891.github.io/milestone-2/)"

## Credits

### Content

The underlying data for all charts is sourced from the SpaceX API, using the following endpoints:

- Launches: https://api.spacexdata.com/v3/launches
- Payloads: https://api.spacexdata.com/v3/payloads
- Landing Pads: https://api.spacexdata.com/v3/landpads
- Roadster: https://api.spacexdata.com/v3/roadster

The 'Add to Calendar' functionality in the 'Next Launch' section was sourced from: https://www.addevent.com/add-to-calendar-button

The Javascript controlling the Countdown to Next Launch was sourced from: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_countdown 

The pagination of the data table in the 'Launch Explorer' section was sourced from: https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html

Favicon rocket icon source: http://www.iconarchive.com/show/captiva-icons-by-bokehlicia/rocket-icon.html

The 'Print Filter' function was used extensively in ensuring correct dc.js dimensions and groups were achieved from the Crossfilter: https://gist.github.com/xhinking/9341806

### Media

Images of the mission patches, launches and the Tesla Roadster were sourced from the SpaceX API.

### Acknowledgements

Thanks to my mentor, Brian M, for his helpful feedback. And thanks to family and friends for helping with UX testing.
