# Milestone Project 2 - SpaceX Dashboard

## Project Purpose

This project aims to let the user to visually explore data relating to SpaceX's operations, including launches, payloads, etc.

## User Experience Design

#### Strategy

The client expressed the following Business Objectives and User Needs.

Business Objectives:

- Increase annual rental bookings (and thereby income) by 20%.
- Increase awareness of the cottage as desirable place to stay.
- Increase awareness of Robe as a domestic holiday destination.
- Showcase nearby attractions and activities in Robe.

User Needs:

The target audience is spaceflight and rocket enthusiasts.

- Interact with SpaceX's flight data.

The following Opportunities/Problems table was drafted with the client to determine strategic priorities UX efforts should address (in this order):

| Opportunity/Problem                         | Importance     | Viablility/Feasibility  |
| ------------------------------------------- |:--------------:| -----------------------:|
| A.                  |               |                        |
| B. |               |                        |
| C. |      |                        |
| D. |               |                       |

#### Scope

##### Functional Specifications

In considering the functional specifications, I researched popular charts from other users of the SpaceX API.

Feature Set:

- Show past launches
- Show next launch
- Show payload data

##### Content Requirements

In order to provide the value of the above functions, the following content is required:

- Embedded Google Map showing the launch site of the next launch (eg Cape Canaveral).
- Icons (Font Awesome, Material Icons) to visually aide the user.
- Add to Calendar button to add next launch to user's calendar (Google, Microsoft Calendar etc).
- Data table of past launches.
- Images mission patches of past missions.

#### Structure

##### Interaction Design

<!-- Given the simple, informational nature of the content, a single page structure is most appropriate. The content is all on one continuous page to encourage (particularly mobile-users) to view all of the content easily without having to click around i.e. to prevent cognitive overload. A navigation bar is provided (which collapses into a toggler) to allow the user to quickly jump to a specific section. The Call To Action is the 'MAKE BOOKING' button in the navigation bar. -->

Consistency & Predictability:

<!-- Users of holiday rental sites are are extrememly accustomed to following appropriate visual icons/cues to guide them. Icons have been employed consistent with those used in other booking sites to take advantage of this - icons such as Bedroom, TV, Wifi, GPS Pin to represent location etc. Web and mobile users are accustomed to a top navbar whose items collapse into a 'burger icon' on mobile devices. -->

Feedback:

<!-- Navigation and social links change colour on hover, which shows users that they are clickable. The Enquiry user form requires that all fields (Name, Email, Enquiry) are populated, and alerts the user to any fields which require attention e.g. an email address without a '@' symbol. Once the submit button is clicked, a modal is shown to provide feedback to the user that their enquiry was sent successfully. -->

##### Information Architecture

<!-- Due to the low complexity and low amount of content, the architecture employed is single page, including several links to external websites (social links, booking website). -->

<!-- The organising principle and order of the content is tied to the user needs - Property Features, Explore, Contact, Reviews. The first section the user is presented with is images and features of the house itself. Following this, the Explore section which includes the Google Map location. The Enquiry section with user form then follows, as this is the point in the user's visit where any information not yet provided can be asked for. Finally, the user can read reviews to encourage a Call to Action (Make Booking).   -->

#### Skeleton

##### Wireframes

Two sets of wireframes were created in the early development stage to help setout the content and layout in differing device sizes. Mobile-first were created initially, then wireframes for larger device and desktop users.

<!-- [Mobile Wireframes](Mobile_Wireframes.jpeg) -->

<!-- [Desktop Wireframes](Desktop_Wireframes.jpeg) -->

#### Surface

The shade of blue was chosen as the dominant colour to convey a relaxed, sea-side feel.
Background images of the cove, sea, and green seaside vegetation were also used for this purpose.

### User Stories
<!-- Story of how a user interacts with a system in some way -->
- User 1 - "As a user with 
- User 2 - "As a user with 
- User 3 - "As a user from 
- User 4 - "As a user with 
- User 5 - "As a user with 

- User 1's needs are met by 
- User 2's needs are met by 
- User 3's needs are met by 
- User 4's needs are met by 
- User 5's needs are met by 

## Features

### Existing Features

- Feature 1: 
- Feature 2: 
- Feature 3: 
- Feature 4: 
- Feature 5: 
- Feature 6: 
- Feature 7: 
- Feature 7: 

### Features Left to Implement

Potential Feature 1 - 

Potential Feature 2 - 

Potential Feature 3 - 

## Technologies Used

- [HTML5](https://www.w3.org/html) : used for page structure.
- [CSS3](https://www.w3.org/Style/CSS/Overview.en.html) : styling language.
- [Bootstrap](https://getbootstrap.com) : responsive, mobile-first framework.
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) : used for to show modal on form submission, dynamically resize navbar height
- [Git](https://git-scm.com/) : used for version control.
- [GitHub](https://github.com) : used to host code repository and to deploy project (via GitHub Pages).
- [VSCode](https://code.visualstudio.com) : preferred text editor.
- [Favicon Generator](https://www.favicon-generator.org) : used to create a 16x16 icon, displayed next to page title.
- [FontAwesome](https://fontawesome.com) : used for icons.
- [Material Icons](https://material.io/resources/icons) : used for icons.
- [Chrome Developer Tools](https://developers.google.com/web/tools/chrome-devtools) : used extensively to ensure device responsiveness.
- [Paint S](https://apps.apple.com/us/app/paint-s/id736473980?mt=12) : used for wireframe development.
- [Adobe Lightroom](https://lightroom.adobe.com/) : used to edit images.
- [W3C Validator](https://jigsaw.w3.org) : used to validate HTML & CSS.
- [Autoprefixer CSS Online](https://autoprefixer.github.io/) : used to add vendor prefixes.

## Testing

<!-- Chrome Developer Tools were used extensively during development. In particular the ability to review the responsiveness of the site on a wide variety of device sizes. The Chrome Developer Audit tool, "Lighthouse" was used to test Performace, Accessibility, Best Practices. -->

<!-- The site was tested successfully on the following browsers: Firefox, Chrome, Safari and the following physical devices: OnePlus 5 (Android), iPhone 7 (iOS) -->

<!-- Manual testing involved clicking through all the links from different locations on the page, on all device sizes to ensure responsiveness. External links were also tested to ensure they were opened in a new tab (ie target="_blank"). -->

<!-- During my Mid-Project review session, my mentor advised that I use 100% width for the Enquiry form inputs on mobile devices. It was also advised to replace curved border style for the section headings with straight corners. My mentor advised this would help to avoid the user thinking they were clickable buttons. -->

## Deployment

The site was deployed on GitHub Pages, by following the below steps:

- Selected Repository on github.com
- "Settings" > "Github Pages"
- Selected "Master Branch" from the "Source" dropdown box.
- Notification: "Github Pages source saved"
- Notification: "Your site was published at [https://tdunn891.github.io/milestone-2/](https://tdunn891.github.io/milestone-2/)"

## Credits

### Content

### Media

### Acknowledgements
