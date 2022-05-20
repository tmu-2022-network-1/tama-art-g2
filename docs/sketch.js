// ブラウザ検知用コード
// const agent = window.navigator.userAgent.toLowerCase()

// if (agent.indexOf('chrome') == -1) {
//   alert(
//     'Chrome以外のブラウザでは正常に動作しない可能性があります。\nお手数おかけし大変申し訳ございませんが、動作が不安定な場合はChromeでのアクセスをお試しください。',
//   )
// }

let points = []

let mapImg
const latFrom = 35.899228
const latTo = 35.501494
const lonFrom = 138.943093
const lonTo = 139.593786
let json = []
let _text = []
let mapWidth
let mapHeight
let mapWFrom
let mapWFromTar
let mapHFromTar
let mapWTo
let mapHFrom
let mapHTo
let scale = 1.2
let easing = 0.04
let OnThePoint = []
let isPopupOpened = false
let isSelected = []

function preload() {
  mapImg = loadImage('./map_nishitokyo.png')
  getData()
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  colorMode(HSB, 360, 100, 100, 100)

  mapWidth = windowWidth * scale
  mapHeight = mapWidth * (mapImg.height / mapImg.width)
  mapWFrom = windowWidth / 2 - mapWidth / 2
  mapHFrom = windowHeight / 2 - mapHeight / 2
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function draw() {
  mapWidth = windowWidth * scale
  mapHeight = mapWidth * (mapImg.height / mapImg.width)

  if (!isPopupOpened) {
    mapWFromTar = windowWidth - mapWidth / 2 - mouseX
    mapHFromTar = windowHeight - mapHeight / 2 - mouseY
  }
  let mapWFromDis = mapWFromTar - mapWFrom
  mapWFrom += mapWFromDis * easing
  let mapHFromDis = mapHFromTar - mapHFrom
  mapHFrom += mapHFromDis * easing
  mapWTo = mapWFrom + mapWidth
  mapHTo = mapHFrom + mapHeight

  background(255)
  image(mapImg, mapWFrom, mapHFrom, mapWidth, mapHeight)

  cursor('default')
  for (let i = 0; i < points.length; i++) {
    points[i].display()
  }
}

const getData = async () => {
  const response = await fetch(
    'https://script.googleusercontent.com/macros/echo?user_content_key=LKlrtcRrjID9Dymgw8IUFZPz5MIDcRnb9MFl6zGtapu6mJf3MDxQcDLQdIYmmtIqQ6Xs5cQ-9KIbUHHADQWO9DLeUgj8roy0m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnEmHHJxhC_oe1Qmd2R-eXjoXgTxWUu4HYlJom6QacPSgNEmyKwSz32FPG-bn2sJSQBMlTA-c0F3yHHty0meKf-_VOxuX8xhGctz9Jw9Md8uu&lib=MabRb0sHcOdgcukW2MiMwBlocHvvcqee0',
  )
  if (response.ok) {
    json = await response.json()
    for (let i = 0; i < json.length; i++) {
      points[i] = new SpotPoint(i)
    }
  }

  const response2 = await fetch(
    'https://script.google.com/macros/s/AKfycbxYb6A56yxS_gLG_AkWxMODItAzBrzYYT8CT3Yvxel3UlgNhau-sJnH1ZbFM-Ho_GcQkA/exec?sheet=group2',
  )
  if (response2.ok) {
    comments = await response2.json()
  }
}

class SpotPoint {
  constructor(i) {
    this.num = i
    this.r = 30
    this.px = 0
    this.py = 0
  }

  display() {
    if (json[this.num] !== undefined) {
      this.px = map(json[this.num].lon, lonFrom, lonTo, mapWFrom, mapWTo)
      this.py = map(json[this.num].lat, latFrom, latTo, mapHFrom, mapHTo)

      var tarR = 30
      OnThePoint[this.num] = false

      if (
        mouseX >= this.px - this.r / 2 &&
        mouseX <= this.px + this.r / 2 &&
        mouseY >= this.py - this.r / 2 &&
        mouseY <= this.py + this.r / 2
      ) {
        cursor('pointer')
        tarR = 40
        OnThePoint[this.num] = true
      }
      fill(0, 0, 100, 100)
      if (isSelected[this.num]) {
        fill(200, 50, 100, 100)
        tarR = 40
      }

      let disR = tarR - this.r
      this.r += disR * 0.25

      push()
      noStroke()
      drawingContext.shadowColor = color(0, 0, 0, 30)
      drawingContext.shadowBlur = 10
      drawingContext.shadowOffsetY = 3
      ellipse(this.px, this.py, this.r, this.r)
      pop()
    }
  }
}

const popup = document.getElementById('popup')

function mouseClicked() {
  for (let i = 0; i < json.length; i++) {
    if (OnThePoint[i] == true) {
      if (isPopupOpened) {
        crossClose()
      }
      mapWFromTar =
        windowWidth / 2 - map(json[i].lon, lonFrom, lonTo, 0, mapWidth)
      mapHFromTar =
        (2 * windowHeight) / 3 -
        map(json[i].lat, latFrom, latTo, 0, mapHeight) +
        100
      isPopupOpened = true
      isSelected[i] = true
      window.setTimeout(function () {
        popup.style.display = 'block'
      }, 500)
      document.getElementById('name').innerText = json[i].name
      document.getElementById('address').innerText = json[i].address
      document.getElementById(
        'station',
      ).innerText = `最寄り駅: ${json[i].station}`
      document.getElementById(
        'holiday',
      ).innerText = `定休日: ${json[i].closingDay}`
      document.getElementById('tel').innerText = `TEL: ${json[i].telephone}`
      document.getElementById(
        'url',
      ).innerHTML = `<a href="${json[i].url}" target="_blank">${json[i].url}</a>`
      document.getElementById(
        'time',
      ).innerText = `開館時間: ${json[i].openingTime}`
      document.getElementById('comment').innerText = comments[i].comment
    }
  }
}

function crossClose() {
  isPopupOpened = false
  popup.style.display = 'none'
  for (let i = 0; i < json.length; i++) {
    isSelected[i] = false
  }
}

document.getElementById('cross').onclick = () => {
  crossClose()
}
