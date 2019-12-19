# Milestone Project 2 - SpaceX Interactive Dashboard

## Project Purpose

This project aims to encourage the user to visually explore data relating to SpaceX's operations, including launches, payloads, etc.

## User Experience Design

#### Strategy
<!-- The reason for the product, application or the site, why we create it, who are we doing this for, why people are willing to use it, why they need it. The goal here is to define the user needs and business objectives. -->

<!-- Overall Strategy -->
UX efforts must fulfil the overarching strategy of the site. SpaceX runs an official API, detailing a wide array of data relating to its rocket operations. The strategic aim of the site is to present interesting data to the user, and make that data as enjoyable and intuitive as possible to explore. 


Site Objectives:

- Present SpaceX's launch and payload data in an intuitive and fun way.
- Promote interest in SpaceX's operations.

User Needs:

The target audience is spaceflight and SpaceX enthusiasts.

These users should be able to:

- Interact with SpaceX's launch and payload data.
- Derive new insights from this data.
- Be presented with pertinent external links (Youtube, Wikipedia, News Articles).

The following Opportunities/Problems table was used to determine which strategic priorities the UX efforts should address (in this order):

| Opportunity/Problem                           | Importance     | Viablility/Feasibility  |
| --------------------------------------------- |:--------------:|:-----------------------:|
| A. Display launch and payload data to the user| 5 | 5 |
| B. Allow interactive filtering of data        | 5 | 5 |
| C. Display underlying filtered data in a table| 4 | 5 |
| D. Instill a sense of excitement about future SpaceX launches | 3 | 3 |
| E. | | |

#### Scope
<!-- Defines the functional and content requirements. What are the features, and content contained in the application or product. The requirements should fulfill and be aligned with the strategic goals. -->

##### Functional Specifications

In considering the functional specifications, I researched existing graphical implementations of the SpaceX API. There is a vast array of data available from SpaceX (13 different endpoints), so it was important to scope in only the most engaging and interesting insights, while at the same time ensuring the data was also accessible to users with only minimal knowledge of SpaceX. Dashboards by their nature can (if implemented poorly) cognitively overload the user, making the functional scope a key consideration in this context.

Feature Set:

- Interactive dashboard of past SpaceX launches
- Show details of upcoming launch
- Interactive dashboard of SpaceX's payload data
- The current speed and location of the Tesla Roadster car which Elon Musk launched into space.

##### Content Requirements

<!-- What is required to provide value? -->

In order to provide the value of the above features, the following content is required:

- Interactive dc.js charts (stacked bar charts, pie chart, row chart).
- Data table dc.js showing further detail of the currently selected launches.
- Icons to visually aide the user.
- Embedded Google Map showing the launch site of the next launch (eg Cape Canaveral).
- 'Add to Calendar' button to add next launch to user's calendar (Google, Microsoft Calendar etc).
- Images of mission patches of past missions.
- Bootstrap image carousel to show images of the Telsa Roadster.

#### Structure
<!-- Defines how user interact with the product, how system behave when user interact, how it’s organized, prioritized, and how much of it.  -->

##### Interaction Design

<!-- Patterns and sequences that provide options to the user -->
<!-- Good Int. Design:
helps people to accomplish their goals.
effectively communicates interactivity and functionality(what user can do).
informs user about state changes(file has been saved, or any feedback), while they interact.
prevents user error or mistakes, like the system asks user to confirm potentially harmful action(i.e. deletion). -->

The strategic goals of the site rests largely on the user's willingness to interact with the charts to find insights. The advantage of a dashboard is being able to view many different dimensions or views of a dataset at the same time. To this end, a single-page structure is most appropriate. For example, on desktop screen sizes, this structure allows all four charts in the Launch Explorer section to be viewed at once. The user is able to see the effects their filtering has to all four charts at once. For mobile and tablet screens, the navigation bar collapses into a toggler to allow jumping to each section. A 'Reset' button is provided which allows a convenient way to reset filters on all charts.

Consistency & Predictability:

The following icons were used to give visual cues as to what the section was about:
(Launch Explorer: rocket flying icon, Next Launch: rocket on launch pad icon, Payload Analysis: satellite icon)

Feedback:

<!-- Navigation and social links change colour on hover, which shows users that they are clickable. The Enquiry user form requires that all fields (Name, Email, Enquiry) are populated, and alerts the user to any fields which require attention e.g. an email address without a '@' symbol. Once the submit button is clicked, a modal is shown to provide feedback to the user that their enquiry was sent successfully. -->

Given the many possible interactions available to the user on the site, the following feedback mechanisms were employed to encourage as much interaction as possible:

- Tooltips are used on mouse over of all charts, giving some brief context to each chart's meaning.
- Tooltips also activate on mouse over of chart segments, giving additional detail of the segment.
- Slight colour fade occurs on mouse over of each colour segment within each chart. Cursor also changes to a hand icon to signal clickability.
- Colour transition on hover shows links icons are clickable.


##### Information Architecture

<!-- Organisation, arrangement and priority of content -->
<!-- Given the content requirements, It defines the arrangement of content elements, how they are organized, to facilitate human understanding. -->
<!-- Good Info. Arch:
organizes, categorizes, and prioritizes the information based on user needs and business objectives.
makes it easy to understand and move through information presented.
flexible to accommodate growth and adapt to change.
appropriate for the audience. -->

The organising principle and order of the content is structured to ensure the user understands and engages with each chart and section. The most engaging and easy to understand content - 'Launches By Rocket' - is located the top left of the page where the eye will naturally land first. The next chart - 'Launch Success' -features simple, intiuitive two bar chart - green: success, red: failure. Once this foundational understanding is achieved, the user will realise that the colours representing the rocket names are synchronised across the the next 2 charts - 'Launches By Year' and 'Launches By Site'.

#### Skeleton
<!-- Interface Design: The best arrangement and visual presentation of elements 
Navigation Design: Intuitive and completion of tasks  -->
<!-- Concered with What form will application take, how will users get around how will we present the content? -->

##### Wireframes

Two sets of wireframes were created in the early development stage to help setout the content and layout in differing device sizes. 

<!-- [Mobile Wireframes](Mobile_Wireframes.jpeg) -->

<!-- [Desktop Wireframes](Desktop_Wireframes.jpeg) -->

#### Surface

Colours: A dark colour theme was employed to give the user a sense of outer space.
Fonts: A futuristic typeface was employed for the section headings and chart titles to convey an exciting and sci-fi feel of spaceflight.

### User Stories
<!-- Story of how a user interacts with a system in some way -->

User stories:

- User 1 - "As a user interested in exploring the failures of SpaceX, I want to be able to be able to filter the dashboard by launch failures, to see when they happened, where they were and which rockets failed."
- User 2 - "As a user who loves to watch live streams and videos of SpaceX's launches, I want a way to filter flights to find specific launches and the related SpaceX YouTube links."
- User 3 - "As a user interested in finding more about what SpaceX actually deploys into orbit, I want to interact with data concerning payloads."
- User 4 - "As a user who wants to know about the upcoming launch, I want to see the key details, and don't want to miss the next live stream."
- User 5 - "As a user with ...

How the needs are met:

- User 1's needs are met by Launch Explorer dashboard via its ability to filter the whole dashboard and data table to show failures only.
- User 2's needs are met by the inclusion of YouTube links in the data table for each launch.
- User 3's needs are met by the Payload Analysis dashboard with 3 charts showing various payload breakdowns.
- User 4's needs are met by the Next Launch section, in particular the 'Add Launch to Calendar' feature.
- User 5's needs are met by ...

## Features

### Existing Features

- Feature 1: Interactive pie chart displaying all SpaceX's launches to date, broken down by rocket name. 
- Feature 2: Interactive stacked bar chart displaying all launches to date year on year, grouped by rocket name. 
- Feature 3: Interactive stacked bar chart displaying all launches to date broken down by launch pad site, grouped by rocket name. 
- Feature 4: Interactive row chart displaying all launches broken down by launch outcome ie. Success or Failure.
- Feature 5: Paginated data table showing the dataset after any filters are applied (via Features 1,2,3,4). Some additional detail is provided, including an image of the mission patch, which on click, shows a higher resolution version of the image in a modal popup. For each launch, links the YouTube video, Wikipedia article and News Article are also populated. Clicking on the mission name displays launch detail text.
- Feature 6: Next launch section showing key details, launchpad Google map with marker, and countdown until the next scheduled SpaceX launch. All data in this section is dynamically populated from the 'Upcoming Launch' SpaceX API endpoint.
- Feature 7: An 'Add Launch to Calendar' button is featured below the launch countdown, so that the user won't miss the next launch, and can be reminded to watch SpaceX's live stream. On clicking of this button, the user can select which calendar account the event is to be added to (Apple, Google, Outook, Yahoo). The calendar event fields (ie. Title, Location, Time, Details) are dynamically populated from the 'Upcoming Launch' SpaceX API endpoint.
- Feature 8: Interactive bar chart showing count of payloads SpaceX has deployed into each orbit type (eg Geostationary Transfer Orbit (GTO), Low Earth Ortit (LEO)).
- Feature 9: Interactive bar chart showing count of payloads manufactured by each manufacturer (eg SpaceX, Boeing, Airbus).
- Feature 10: Interactive bar chart showing count of payloads by payload type (eg Satellite or SpaceX vehicle).
- Feature 11: Panel showing details of Elon Musk's Tesla Roadster that was launched into orbit in 2018. Details include the vehicle's current speed, days in orbit and current distance from Earth. This data is dynamically updated using the SpaceX API Roadster endpoint.

### Features Left to Implement

Potential Feature 1 - A section called Landing Explorer which uses the Landings API endpoint (https://api.spacexdata.com/v3/landpads). This would be a stacked barchart showing the success/failure of landing attempts for each landing pad.

Potential Feature 2 - A link in data table to show several pictures from each launch. The source data for this is in the launches API.

Potential Feature 3 - 

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

Chrome Developer Tools were used extensively during development. In particular the ability to review the responsiveness of the site on a wide variety of device sizes. The Chrome Developer Audit tool, "Lighthouse" was used to test Performace, Accessibility, Best Practices.

<!-- The site was tested successfully on the following browsers: Firefox, Chrome, Safari and the following physical devices: OnePlus 5 (Android), iPhone 7 (iOS) -->

<!-- Manual testing involved clicking through all the links from different locations on the page, on all device sizes to ensure responsiveness. External links were also tested to ensure they were opened in a new tab (ie target="_blank"). -->

<!-- During my Mid-Project review session, my mentor advised that... -->

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

The Links icons (YouTube, Wikipedia, News Article) in the data table were sourced from: https://www.iconspedia.com/icon/news-icon-22850.html

The 'Print Filter' function was used extensively in ensuring correct dc.js dimensions and groups were achieved from the Crossfilter: https://gist.github.com/xhinking/9341806



### Media

Images of the mission patches and the Tesla Roadster were sourced from the API.

Favicon rocket icon source: http://www.iconarchive.com/show/captiva-icons-by-bokehlicia/rocket-icon.html

### Acknowledgements

Thanks to my mentor, Brian M, for the helpful feedback.
