#Oracle APEX Heatmap calendar plugin

Heatmap calendar is a region type plugin that shows year calendar where days are arranged into columns by week, then grouped by month and years. The values are visualised as colored cells per day. 
It is based on [Mike Bostock’s Calendar View](https://bl.ocks.org/mbostock/4063318) and uses [D3 JavaScript library](https://github.com/d3/d3)

#Install

* Import plugin file "region_type_plugin_com_nikitsky_heatmap_calendar.sql" from source directory into your application

#Preview
![Heatmap calendar preview](https://github.com/nikitsky/heatmap_calendar_apex_plugin/blob/master/preview.png?raw=true "Plugin screenshot")

#Plugin Settings

| option             | type    |  description                    |
| ------------------ | ------- | ------------------------------- | 
| cellSize           | number  | Size of day square in pixels  |
| firstYear          | number  | The first year to be shown on the calendar. If not provided, the current year is used |
| periods            | number  | The number of years you want to display |
| dateFormat         | string  | Date format mask in [d3-time-format](https://github.com/d3/d3-time-format#locale_format)  |
| dayCaption         | array   | Custom caption for weekdays (from Monday to Sunday), e.g. ['M','T','W','T','F','S','S'] |
| monthCaption       | array   | Custom caption for month (from January to December), e.g. ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'] |
| repeatMonthCaption | boolean | Show month captions for every year. False is default |
| colorRange         | array   | Starting and finishing colours, e.g. ["white", "green"] |
| valueRange         | array   | Expected minimum and maximum values used for colours blending, e.g. [0,10] |
| legendType         | string  | Possible values are: none, gradient, discrete |


released under [BSD license](http://opensource.org/licenses/BSD-3-Clause). Copyright 2017 Valentine Nikitsky