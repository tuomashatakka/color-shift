// ƸΒΔΕΖƩǝ

import Color from './Color'
import { rgbToHsl, hslToRgb } from './color-conversion'


const coefficients = [ 0.2127, 0.7152,  0.0722 ]
const { PI } = Math


const sum = (val, c) => 
  val + c

function pad (str, fill = '0', n = 2) {
  if (str.length > n)
    return str.substr(str.length - 2, 2)
  while (str.length < n)
    str = fill + str
  return str
}

function hex (number) {
  let n = parseInt(number * 2.55).toString(16)
  return pad(n)
}

function within (v, min, max) {
  return Math.max(Math.min(v, max), min)
}

function rotation (color) {
  let chs = hueComponents(color)
  let y = 0
  let x = 0
  for (let rot in chs) {
    let dy = Math.sin(rot) * chs[rot]
    let dx = Math.cos(rot) * chs[rot]
    x += dx
    y += dy
  }
  return { x, y }
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

function toNumber (input) {
  if (typeof input === 'string')
    return parseInt(input, 16)
  else if (typeof input === 'number')
    if (input <= 1)
      return parseInt(input * 100)
    else
      return parseInt(input)
}

const getHue        = (color) => 
  rgbToHsl(...color.channels)[0]

const getSaturation = (color) => 
  rgbToHsl(...color.channels)[1]

const getLuminance  = (color) => 
  rgbToHsl(...color.channels)[2]

function setHue (color, hue) {
  const [ , saturation, luminance ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb((hue + 360) % 360, saturation, luminance))
}

function setSaturation (color, saturation) {
  const [ hue, , luminance ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb(hue, saturation, luminance))
}

function setLuminance (color, luminance) {
  const [ hue, saturation, ] = rgbToHsl(...color.channels)
  return Color.from(...hslToRgb(hue, saturation, luminance))
}

function hueComponents (color) {
  return {
    [0 / 3 * PI]: color.red / 255,
    [2 / 3 * PI]: color.green / 255,
    [4 / 3 * PI]: color.blue / 255,
  }
}


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

export function pureBrightness ({ channels }) {
  let total = channels.reduce(sum, 0)
  return parseInt(total / channels.length)
}

export function brightness ({ channels }) {
  let v = 0
  for (let col in channels) {
    let d = channels[col] / 255
    v += coefficients[col] * (d < 0.03928 ? d / 12.92 : Math.pow((d + 0.055) / 1.055), 2.4)
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
  const bri      = brightness(color)
  const deduct   = val => val - bri
  let relative   = color.channels.map(deduct)
  return channel ? relative[channel] : relative
}

export function intensity (color) {
  let { x, y } = rotation(color)
  let distance = Math.sqrt(x * x + y * y)
  return distance
}

function extractColors (...args) { // eslint-disable-line complexity, max-statements

  let red 
  let green
  let blue
  let alpha

  switch (args.length) {
    case 1:
    case 2:
      if (args.length > 1)
        alpha = toNumber(args[1])
      
      if (typeof args[0] === 'string') {
        
        const two = n => s.substr(extract[n], 2)
        let s = args[0] === '#' ? args[0].substr(1) : args[0]
        let extract = s.length > 7 ? [ 3, 5, 7, 1 ] : [ 1, 3, 5 ]
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

export const hue = (color, valueOrFormat = 'deg') => !isNaN(parseInt(valueOrFormat))
  ? setHue(color, valueOrFormat)
  : getHue(color, valueOrFormat)

export const saturation = (color, value) => value
  ? setSaturation(color, value)
  : getSaturation(color)

export const luminance = (color, value) => value
  ? setLuminance(color, value)
  : getLuminance(color)
