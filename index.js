const debug = require('debug')('signalk-airmar-plugin')
const util = require('util')
const _ = require('lodash')

const calibrate_depth = '%s,3,126208,1,%s,11,01,0b,f5,01,f8,01,03,%s,%s,ff,ff'

module.exports = function(app) {
  var plugin = {}
  var unsubscribes = []
  var didStart = false

  plugin.id = "airmar-plugin"
  plugin.name = "Airmar Depth Offset Configuration"
  plugin.description = "Configure an Airmar DST800 depth sensor"

  plugin.schema = {
    title: "Airmar Depth Configuration",
    type: "object",
    required: [
      "instance", "offset"
    ],
    properties: {
      instance: {
        title: "NMEA 2000 Instance Id",
        description: "This is the NMEA 2000 instance id for your transducer.",
        type: "number"
      },
      offset: {
        title: "Offset",
        type: "number",
        description: "The transducer offset from the water surface or the keel. Should be a positive number for water surface offset or a negative number for keel offset. This does not reflect the current configured value, it only reflects the last value configured by this plugin. "
      }
    }
  }


  plugin.start = function(options) {
    if ( didStart == false ) {
      debug("first startup, doing nothing")
      didStart = true;
      return;
    } else if ( typeof options.instance === 'undefined' || typeof options.offset === 'undefined' ) {
      console.error("instance or offset is not defined")
    } else {
      var n2kString = util.format(calibrate_depth, (new Date()).toISOString(),
                                  options.instance,
                                  padd((options.offset & 0xff).toString(16), 2),
                                  padd(((options.offset >> 8) & 0xff).toString(16), 2));
      debug("sending offset config: " + n2kString)
      //app.emit('nmea2000out', n2kString)
    }
  }

  plugin.stop = function() {
  }

  return plugin
}

function padd(n, p, c)
{
  var pad_char = typeof c !== 'undefined' ? c : '0';
  var pad = new Array(1 + p).join(pad_char);
  return (pad + n).slice(-pad.length);
}
