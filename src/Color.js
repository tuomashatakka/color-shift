
import { mix, hue, saturation, luminance, brightness, isLight } from './color-functions'


export default class Color {

  static equal (c1, c2) {
    return checkEquality(c1, c2)
  }

  static is (c1, c2) {
    return checkEquality(c1, c2)
  }

  static rgb (red, green, blue, alpha) {
    return createFrom.rgb([ red, green, blue, alpha ])
  }

  static hex (hex) {
    return createFrom.hex(hex)
  }

  static from () {
    return resolveColor(...arguments)
  }

  is (color) {
    return Color.equal(this, color)
  }

  constructor (red, green, blue, alpha = 1) {
    let mid    = (red + green + blue) / 3 < 1
    this.red   = normalize(red,   mid)
    this.blue  = normalize(blue,  mid)
    this.green = normalize(green, mid)
    this.alpha = alpha ? normalize(alpha, alpha <= 1) : 255

    assertValidColor(this)
  }

  update (colors = {}) {
    const { red, green, blue, alpha } = colors

    if (!isNaN(Number(red)))
      this.red = Number(red)

    if (!isNaN(Number(green)))
      this.green = Number(green)

    if (!isNaN(Number(blue)))
      this.blue = Number(blue)

    if (!isNaN(Number(alpha)))
      this.alpha = Number(alpha)

    return this
  }

  get channels () {
    return [ this.red, this.green, this.blue ]
  }

  get components () {
    return this.channels.concat([ this.alpha / 255 ])
  }

  get hue () {
    return hue(this)
  }

  set hue (value) {
    return hue(this, value)
  }

  get saturation () {
    return saturation(this)
  }

  set saturation (value) {
    return saturation(this, value)
  }

  get luminance () {
    return luminance(this)
  }

  set luminance (value) {
    return luminance(this, value)
  }

  get brightness () {
    return brightness(this)
  }

  getHue () {
    return hue(this)
  }

  getSaturation () {
    return saturation(this)
  }

  getLuminance () {
    return luminance(this)
  }

  setHue (value) {
    return hue(this, value)
  }

  setSaturation (value) {
    return saturation(this, value)
  }

  saturate (amount=0.5) {
    const initial = this.saturation
    return saturation(this, initial + amount)
  }

  desaturate (amount=0.5) {
    const initial = this.saturation
    return saturation(this, initial - amount)
  }

  darken (amount=0.5) {
    return mix(this, COLOR.BLACK, 1 - amount)
  }

  setLuminance (value) {
    return luminance(this, value)
  }

  lighten (amount=0.5) {
    return mix(this, COLOR.WHITE, 1 - amount)
  }

  darken (amount=0.5) {
    return mix(this, COLOR.BLACK, 1 - amount)
  }

  isLight () {
    return isLight(this)
  }

  isDark () {
    return !this.isLight()
  }

  mix (color, amount=0.5) {
    return mix(this, Color.from(color), 1 - amount)
  }

  blend (color, mode ='mix') {
    if (mode === 'mix')
      return mix(this, Color.from(color))
  }

  get hex () {
    return this.toHex()
  }

  get rgb () {
    return this.toRGB()
  }

  get rgba () {
    return this.toRGBA()
  }

  toHex () {
    return '#' + this.channels.map(toHex).join('')
  }

  toRGB () {
    return `rgb(${this.channels.map(channel => Math.round(channel)).join(', ')})`
  }

  toRGBA () {
    return `rgba(${this.components.map(channel => Math.round(channel)).join(', ')})`
  }

  toString () {
    return this.toRGBA()
  }

  toJSON () {
    let { red, green, blue, alpha } = this
    return { red, green, blue, alpha }
  }
}


const COLOR = {
  BLACK: new Color(0, 0, 0),
  WHITE: new Color(255, 255, 255),
}


const checkEquality = (c1, c2) =>
  c1.alpha === c2.alpha &&
  c1.green === c2.green &&
  c1.blue === c2.blue &&
  c1.red === c2.red


const toHex = c => {
  c = c.toString(16)
  while (c.length < 2)
    c = '0' + c
  return c.substr(0, 2)
}


function normalize (val = 255, unit = false) {
  let value = Math.max(0, Math.min(255, parseFloat(val)))
  if (isNaN(value))
    throw new TypeError(`Invalid value provided for normalize (<${typeof val}> ${val})`)
  if (unit && value < 1)
    value *= 255
  return parseInt(value)
}


function resolveColor () { // eslint-disable-line complexity

  if (arguments[0] instanceof Color)
    return arguments[0]

  let last = arguments[arguments.length - 1]
  let args = Array.from(arguments).slice(1)
  let color = arguments.length < 3
    ? arguments[0]
    : Array.from(arguments)

  if (!color)
    return new Color(255, 255, 255)

  if (color[0] === '#')
    return createFrom.hex(color, ...args)

  else if ([ 3, 4 ].indexOf(color.length) > -1)
    return createFrom.rgb(color, ...args)

  else if (arguments.length === 1 && typeof last === 'object')
    return createFrom.col(color, ...args)

  throw new TypeError(
    `Invalid input for Color.from. The function accepts either a hex color value or a list of ` +
    `integers with a length of 3 or 4. Got ${arguments[1]}`)
}


const createFrom = {

  hex (color) {
    let r, g, b, a // eslint-disable-line one-var

    if (color.length < 6) {
      r = parseInt(color.substr(1, 1), 16) * 16
      g = parseInt(color.substr(2, 1), 16) * 16
      b = parseInt(color.substr(3, 1), 16) * 16
      a = parseInt(color.substr(4, 1), 16) * 16
    }
    else {
      r = parseInt(color.substr(1, 2), 16)
      g = parseInt(color.substr(3, 2), 16)
      b = parseInt(color.substr(5, 2), 16)
      a = parseInt(color.substr(7, 2), 16)
    }
    return new Color(r, g, b, a)
  },

  rgb (color, meta={}) {
    return new Color(...color, meta)
  },

  col (color, meta={}) {
    let { red, green, blue, alpha, r, g, b, a } = color
    return new Color(
      r || red,
      g || green,
      b || blue,
      a || alpha,
      meta)
  }

}


function assertValidColor (color) {
  let invalid = isNaN(parseInt(color.red) + parseInt(color.green) + parseInt(color.blue))

  if (invalid)
    throw new TypeError(
      `Invalid arguments passed for the constructor of Color. Use Color.from to parse a color from a string.
red:   ${color.red}
green: ${color.green}
blue:  ${color.blue}`)
}
