# elronSpeedTrap
https://mothrakk.github.io/elronSpeedTrap/index.html

An application for analyzing Elron train data geographically.

### Where is the data from? How's it work?

https://elron.ee/rongid-kaardil/

(Or, more specifically; https://elron.ee/api/v1/map)

The data was scraped over time using track.py. The script ticks every n seconds and acquires & stores data made available by the train. Some data elements include speed, line ID and departure & arrival times.

Included is a set of (latitude, longitude) geographical coordinates. This is meant to just keep track of the trains real-time on the Google Maps embedded on the Elron website. These coordinates do, however, allow for geographical analysis.

### Ok, but why?

Fun & practice.

### Project files

**track.py**

Scrapes & collects train data over time.

**compile.py**

Pre-compiles/parses the raw train data. This takes a while, but the end result is that the web app can update grids in O(1) time, and the json file itself is significantly smaller.

**create_overlay.py**

Used to create the train pathways overlay image. Works by iterating over every train data point and drawing each of their locations on an otherwise transparent image as a 1x1 red pixel.

#

![](https://i.imgur.com/mWSnWsu.png)
