#Oracle APEX Heatmap calendar plugin

Heatmap calendar is a region type plugin that shows year calendar where days are arranged into columns by week, then grouped by month and years. The values are visualised as colored cells per day. 
It is based on [Mike Bostock’s Calendar View](https://bl.ocks.org/mbostock/4063318) and uses [D3 JavaScript library](https://github.com/d3/d3)

#Install

* Import plugin file "region_type_plugin_com_nikitsky_heatmap_calendar.sql" from source directory into your application

#Preview
![Heatmap calendar preview](https://github.com/nikitsky/heatmap_calendar_apex_plugin/preview.png?raw=true "Plugin screenshot")

#Plugin Settings

| option     | type   |  description                    | default |
| ---------- | ------ | ------------------------------- | ------- |
| cellSize   | number |  size of day square in pixels   | 16      |
| years | array | years you want to see. E.g. [2015, 2016] | the current year | 
| day_caption | array | Custom caption for weekdays (from Monday to Sunday)|['Mon','Tue','Wed','Thu','Fri','Sat','Sun']|
| month_caption | array | Custom caption for month (from January to December) | ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] |

released under [BSD license](http://opensource.org/licenses/BSD-3-Clause). Copyright 2017 Valentine Nikitsky