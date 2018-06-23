// Ƹ
// ǝ
// Β
// Δ
// Ε
// Ζ
// Η
// function resolve (Ʃ) {
import Color from './Color'
import { rgbToHsl, hslToRgb } from './color-conversion'


const coefficients = [ 0.2127, 0.7152,  0.0722 ]
const { PI, floor: round } = Math
const R = 2 * Math.PI



/**
 * Change the color's alpha channel to match the given value
 *
 * @method opaque
 * @param  {*} color Color for which the alpha channel change is applied to
 * @param  {Number} [alpha=1] The new value for the alpha channel (either 0-1 or 0-100)
 * @return {String} An rgba hex color string with the new opacity
 */

export function opaque (color, alpha = 1) {
  let colors = extractColors(color, alpha)
  return colorsToHexString(colors)
}



export function mix (c1, c2, f = 0.5) {
  let f1 = within(f, 0, 1)
  let f2 = within(1 - f, 0, 1)
  let ch1 = c1.channels
  let ch2 = c2.channels
  let tot = []
  for (let n = 0; n < 3; n++)
    tot.push(f1 * ch1[n] + f2 * ch2[n])
  return new Color(...tot, (c1.alpha + c2.alpha) / 2)
}

function hslToColor (h, s, l) {
  let angle = Math.abs(h)
  let r = 0, g = 0, b = 0

  if (angle >= 0 && angle < 120) {
    r = (120 - angle) / 120
    g = (angle) / 120
  }
  else if (angle >= 120 && angle < 240) {
    angle = angle - 120
    g = (120 - angle) / 120
    b = (angle) / 120
  }
  else if (angle >= 240 && angle < 360) {
    angle = angle - 240
    b = (120 - angle) / 120
    r = (angle) / 120
  }
  return {
    red: r * l,
    green: g * l,
    blue: b * l
  }
}

export function pureBrightness ({ channels }) {
  let total = channels.reduce((val, c) => val + c, 0)
  return parseInt(total / channels.length)
}

export function brightness ({ channels }) {
  let v = 0
  for (let col in channels) {
    let d = channels[col] / 255
    v += coefficients[col] * (d < 0.03928 ? d / 12.92 : Math.pow(((d + 0.055) / 1.055), 2.4))
  }
  return parseInt(v * 255)
}

export function isLight (color) {
  return brightness(color) > 127
}

export function isDark (color) {
  return !isLight(color)
}

export function relativeBrightness (color, channel=null) {
  let bri      = brightness(color)
  let relative = color.channels.map(val => val - bri)
  return channel ? relative[channel] : relative
}


function radiansToDegrees (rad) {
  return round(180 * rad / PI)
}

function degreesToRadians (deg) {
  return deg / 180 * PI
}

function hueComponents (color) {
  return {
    [0 / 3 * PI]: color.red / 255,
    [2 / 3 * PI]: color.green / 255,
    [4 / 3 * PI]: color.blue / 255,
  }
}

function rotation (color) {
  let chs = hueComponents(color)
  let y = 0, x = 0
  for (let rot in chs) {
    let dy = Math.sin(rot) * chs[rot]
    let dx = Math.cos(rot) * chs[rot]
    x += dx
    y += dy
  }
  return { x, y }
}

export function intensity (color) {
  let { x, y } = rotation(color)
  let distance = Math.sqrt(x * x + y * y)
  return distance
}




function pad (str, fill = '0', n = 2) {
  if (str.length > n)
    return str.substr(str.length - 2, 2)
  while (str.length < n)
    str = fill + str
  return str
}

function hex (number) {
  let n = (parseInt(number * 2.55)).toString(16)
  return pad(n)
}

function within (v, min, max) {
  return Math.max(Math.min(v, max), min)
}

function toNumber (input) {
  if (typeof input === 'string')
    return parseInt(input, 16)
  else if (typeof input === 'number')
    if (input <= 1)
      return parseInt(input * 100)
    else
      return parseInt(input)
}

// eslint-disable-next-line complexity
function extractColors (...args) {

  let red, green, blue, alpha

  switch (args.length) {
    case 1:
    case 2:
      if (args.length > 1)
        alpha = toNumber(args[1])
      if (typeof args[0] === 'string') {
        let s = args[0] === '#' ? args[0].substr(1) : args[0]
        let extract = s.length > 7 ? [ 3, 5, 7, 1 ] : [ 1, 3, 5 ]
        let two = n => s.substr(extract[n], 2)
        red   = two(0)
        green = two(1)
        blue  = two(2)
        alpha = alpha || two(3)
      }
      break
    case 3:
      [ red, green, blue ] = args
      alpha = 255
      break
    case 4:
      [ red, green, blue, alpha ] = args
      break
  }

  return {
    red:   toNumber(red),
    blue:  toNumber(blue),
    green: toNumber(green),
    alpha: toNumber(alpha),
  }

}

function colorsToHexString (colors) {
  let a = hex(colors.alpha)
  let r = hex(colors.red)
  let g = hex(colors.green)
  let b = hex(colors.blue)
  if (isNaN(a))
    a = ''
  return '#' + a + r + g + b
}



// export function brightness (color) {
//   const MAX_INTENSITY = 255
//   let colors = extractColors(color)
//   return (
//     colors.red   / MAX_INTENSITY +
//     colors.green / MAX_INTENSITY +
//     colors.blue  / MAX_INTENSITY
//   ) / 3
// }

// export function luminance ({ channels }) {
//   // TODO: How is this calculated?
//   console.info(relativeBrightness({channels}))
// }

// export function setSaturation (color, value) {
// return value // lol
// }

export const hue = (color, valueOrFormat = 'deg') => !isNaN(parseInt(valueOrFormat))
  ? setHue(color, valueOrFormat)
  : getHue(color, valueOrFormat)

export const saturation = (color, value) => value
  ? setSaturation(color, value)
  : getSaturation(color)

export const luminance = (color, value) => value
  ? setSaturation(color, value)
  : getSaturation(color)

// function getHue (color, format='deg') {
//   let { x, y } = rotation(color)
//   let rot      = (Math.atan2(y, x) + R) % R
//   if (format === 'deg')
//     return radiansToDegrees(rot)
//   if (format === 'rad')
//     return rot
//   throw new TypeError('Format must be either `deg` or `rad` for the hue function')
// }
//
// function getSaturation (color) {
//   let { x, y } = rotation(color)
//   let distance = Math.sqrt(x * x + y * y)
//   return parseInt(distance * 255)
// }

export const getHue        = (color) => rgbToHsl(...color.channels)[0]
export const getSaturation = (color) => rgbToHsl(...color.channels)[1]
export const getLuminance  = (color) => rgbToHsl(...color.channels)[2]

export function setHue (color, hue) {
  let [ , saturation, luminance ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb((hue + 360) % 360, saturation, luminance))
}

export function setSaturation (color, saturation) {
  let [ hue, , luminance ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb(hue, saturation, luminance))
}

export function setLuminance (color, luminance) {
  let [ hue, saturation, ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb(hue, saturation, luminance))
}
