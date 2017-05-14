#National Geographic Education Styleguide

We used [UIKit](http://getuikit.com/) as the basis for our framework.

* Declarative style
* The use of data-* attributes for JavaScript integration
* The organization and structure of the JavaScript framework

# Installing

1. Make sure that you have node.js installed. If you are on a Mac and have [Homebrew](http://brew.sh/) installed: `brew install node`
2. Switch to the same directory as the `package.json` file.
3. Type `npm install`

# Organization

* **01 - 09** Configuration
* **10 - 29** CSS Base
  * **10** Typography
    * Vertical spacing for block elements
    * Body Copy
    * Text Utilities
      * Size modifiers
      * Weight modifiers
      * Color modifiers
      * Alignment modifiers
      * Wrapping modifiers
      * Screen Reader Content
    * Text-level semantics/inline elements
    * Headings
    * Blockquotes
    * Code and Preformatted text
  * **12** Horizontal Rule
  * **14** Lists
    * Default lists
    * Styled lists
      * Basic
      * List Bullet
      * List Line
      * List Striped
      * Modifiers
        * List Spacing
  * **16** Description Lists
    * Default
    * Horizontal
    * Lined
  * **18** Tables
    * Default
    * Styled Table
    * Modifiers
      * Striped
      * Vertically centered
      * Condensed
      * Hovering
  * **20** Forms
    * 20.01 Variables
    * 20.03 Basic
    * 20.05 Form Rows
    * 20.07 Control States
      * Validation state
      * Disabled state
    * 20.09 Control Modifiers
      * Blank Form
      * Width modifiers
      * Size modifiers
      * Help text
    * 20.11 Layout modifiers
      * Form stacked
      * Form Horizontal
      * Condensed Vertical Spacing
    * 20.13 Search
      * Basic
      * AJAX search results
* 30 - 49 User Interface Components
  * 30 Buttons
    * Basic Usage
    * Color modifiers
      * Primary
      * Success
      * Danger
      * Button Link
    * Size modifiers
    * Button Group
  * 32 Thumbnail images
      * Basic Usage
      * Bordered
      * Sizing modifiers
      * Captions
  * 34 Image Overlays
      * Area Content
      * Toggle
      * Caption
      * Overlaying thumbnails
  * 36 Icons
      * Basic
      * Icon Buttons
      * Sizing
      * Fixed width
      * Lists
      * Bordered and pulled
      * Spinning
      * Rotated and flipped
      * Stacked
      * Icon listing
  * 38 Media Object
  * 40 Dropdowns
* 50 - 69 Callouts and Prompts
  * 50 Badge
    *  Modifiers
       * Notifcation
       * Color
  * (Tooltips, alerts, modals)
* 70 - 89 Navigation Components
  * 70 Nav
    * Basic
    * Style modifiers
      * Side Navigation
      * Dropdown Navigation
      * Nav Navbar
    * Header and divider
    * Nested Navs
      * Accordion
  * 72 Navbar
  * 74 Subnav
        Basic
        Line separators
        Pills
        Subnav with dropdowns
        Sliders
  * 76 Pagination
        Usage
        Alignment
        Previous and next
  * 78 Tab
  * 80 Accordion
  * 82 Alphanumeric Index
  * 84 Breadcrumbs
* 90 - 99 Layout
    90 Grids
        Usage
            gutter
            small gutter
        Nested grid
        Center grid
        Source ordering
        Grid divider
        Match column heights
            Match height of panels
            match within rows
            wrap multiple rows
            wrap rows with custom widths
        Even grid columns
        Block grid
    92 Panel
        Modifiers
            Panel Box
            Primary
            Secondary
            Tab content
        Panel Header
        Panel Spacing
        Panel Dividers
        Panel Box with teaser
    94 Layout Utilities
        Clearing and floating
            NBFC
        Alignment
        Vertical Alignment
        Margin Adjustments
            add margin
            larger margin
            smaller margin
            remove margin
            auto margin
        Border radius
        Large headings
        Muted Links
        Scrollable area
            Preformatted text
            Box
        Display as
        Visibility
            Any divice visibility
            Responsive visibility
* 100 + Modules
    Page Structure
    Site Header
    Article Heading
    Page Modules




