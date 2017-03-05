#Oracle APEX Heatmap calendar plugin

Heatmap calendar is a region type plugin that shows year calendar where days are arranged into columns by week, then grouped by month and years. The values are visualised as coloured cells per day.
It is based on [Mike Bostock’s Calendar View](https://bl.ocks.org/mbostock/4063318) and uses [D3 JavaScript library](https://github.com/d3/d3)

#Install

* Import plugin file "region_type_plugin_com_nikitsky_heatmap_calendar.sql" from source directory into your application

#Preview
![Heatmap calendar preview](https://github.com/nikitsky/heatmap_calendar_apex_plugin/blob/master/preview.png?raw=true "Plugin screenshot")

#Demo application
https://apex.oracle.com/pls/apex/f?p=113960

#Plugin attributes
Plugin expects data from database. The query should return at least two columns: date and value. An additional label is possible. Plugin aggregates data on the day level summarising the value and concatenating labels.

| Plugin attribute  |  description                    |
| ----------------- | ------------------------------- | 
| First year        | The first year to be shown on the calendar. If not provided, the current year is used |
| Years to show     | The number of years you want to display |
| Cell Size         | Size of day square in pixels  |
| Date column       | Region SQL column with the date which should be highlighted on the calendar |
| Value column      | Region SQL column with numeric value to be visualised on the calendar |
| Date format mask  | Date format mask in [d3-time-format](https://github.com/d3/d3-time-format#locale_format)  |
| Legend type       | Legend can be a gradient or discrete. Gradient legend is drawn as a rectangle with gradient colour, Discrete legend has number of colours shown |
| Starting value    | Expected starting value. If it is empty or 'automatic' then the minimum value from the aggregated data |
| Starting colour   | Colour which represents the starting value. |
| Ending value      | Maximum expected value. If not specified or 'automatic' the maximum value from the aggregated data |
| Ending colour     | Colour which represents the ending value |
| Label column      | Region SQL column with a label to be added to the day value. It is optional |
| Tooltip           | To show the day value and labels as tooltip |

#Plugin advanced settings

There are some additional parameters which allow to customize calendar look. These parameters should be passed to plugin by the Initialization JavaScript Code. 

| option             | type    |  description                    |
| ------------------ | ------- | ------------------------------- | 
| dayCaption         | array   | Custom caption for weekdays (from Monday to Sunday), e.g. ['M','T','W','T','F','S','S'] |
| monthCaption       | array   | Custom caption for month (from January to December), e.g. ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'] |
| repeatMonthCaption | boolean | If true, plugin will draw month captions for every year |
| colorRange         | array   | Although continuous scales typically have two values each in their domain and range, provided by the plugin attributes, you can specify more than two values produces a piecewise scale. For example, to create a diverging colour scale that interpolates between white and red for negative values, and white and green for positive values, you can pass the array: ["red", "white", "green"]. The colorRange overrides the Starting colour and Ending colour attributes |
| valueRange         | array   | If more than two colours used, the data range should be provided as well. For example, to create a diverging colour scale that interpolates between white and red for negative values, and white and green for positive values, you can pass the array: [-10,0, 10]. The valueRange overrides the Starting value and Ending value attributes |
| hideValue          | boolean | Do not show value but only label |
| legendTicks        | number  | You can specify approximately count representative values from the values domain for legend. If count is not specified, it defaults to 5|
| tooltipClass       | string  | Css class to be used for the tooltip. You can define your own class or use Universal Theme CSS utility classes that define colour palette, e.g. 'u-color-16-bg' for lightblue tooltip |
| marginTop          | number  | Calendar top margin in pixels |
| marginRight        | number  | Calendar right margin in pixels |
| marginBottom       | number  | Calendar bottom margin in pixels |
| marginLeft         | number  | Calendar left margin in pixels |
| captionMonthSize   | number  | Height of month caption. Would be required to amend if you change font size of day_caption css class |
| captionDaySize     | number  | Width of day of week caption. Would be required to amend if you change font size of month_caption css class |
| captionYearSize    | number  | Width of day of week caption. Would be required to amend if you change font size of year_caption css class |

released under [BSD license](http://opensource.org/licenses/BSD-3-Clause). Copyright 2017 Valentine Nikitsky
