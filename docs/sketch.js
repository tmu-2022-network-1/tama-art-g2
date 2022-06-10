let points = []
let summed = []

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
let isPopupOpened = false
let OnTheSummed = []
let isSummedOpened = false

function preload() {
  mapImg = loadImage('./map.png')
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

  if (!isPopupOpened && !isSummedOpened) {
    mapWFromTar = windowWidth - mapWidth / 2 - mouseX
    mapHFromTar = windowHeight - mapHeight / 2 - mouseY
  }
  let mapWFromDis = mapWFromTar - mapWFrom
  mapWFrom += mapWFromDis * easing
  let mapHFromDis = mapHFromTar - mapHFrom
  mapHFrom += mapHFromDis * easing
  mapWTo = mapWFrom + mapWidth
  mapHTo = mapHFrom + mapHeight

  background(175, 18, 53)
  image(mapImg, mapWFrom, mapHFrom, mapWidth, mapHeight)

  cursor('default')
  for (let i = 0; i < points.length; i++) {
    points[i].display()
  }

  for (let i = 0; i < summed.length; i++) {
    summed[i].display()
  }

  for (let i = 0; i < points.length; i++) {
    if (points[i].mouseHover) {
      fill(230)
      textSize(20)
      textAlign(LEFT, CENTER)
      text(json[points[i].num].name, points[i].px + 30, points[i].py)
    }
  }
}

const getData = async () => {
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycbxhZ4ww0rLhp6A72xu4HznL5g-cA6BqosnggI2xlzzqrQKqVbq2HTLZO8MpdnaIkZLG_Q/exec',
  )
  if (response.ok) {
    json = await response.json()
  }

  const response2 = await fetch(
    'https://script.google.com/macros/s/AKfycbxhZ4ww0rLhp6A72xu4HznL5g-cA6BqosnggI2xlzzqrQKqVbq2HTLZO8MpdnaIkZLG_Q/exec?sheet=group2',
  )
  if (response2.ok) {
    comments = await response2.json()
  }

  for (let i = 0; i < json.length; i++) {
    points[i] = new SpotPoint(i)
  }

  await isMergedCheck()
}

const isMergedCheck = async () => {
  for (let i = 1; i < points.length; i++) {
    if (json[i].lon != 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (
          dist(json[i].lon, json[i].lat, json[j].lon, json[j].lat) < 0.02 &&
          !points[j].isMerged
        ) {
          points[i].isMerged = true
          points[j].isMerged = true
          summed[summed.length] = new SummedPoint(
            summed.length,
            (parseFloat(json[i].lon) + parseFloat(json[j].lon)) / 2,
            (parseFloat(json[i].lat) + parseFloat(json[j].lat)) / 2,
            i,
            j,
          )
        }
      }
    }
  }

  for (let i = 1; i < summed.length; i++) {
    for (let j = i - 1; j >= 0; j--) {
      if (
        dist(summed[i].lon, summed[i].lat, summed[j].lon, summed[j].lat) <
          0.02 &&
        !summed[j].isMerged
      ) {
        summed[i].merge(summed[j])
      }
    }
  }

  for (let i = 0; i < summed.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (
        dist(summed[i].lon, summed[i].lat, json[j].lon, json[j].lat) < 0.02 &&
        !points[j].isMerged
      ) {
        summed[i].addElement(j)
      }
    }
  }
}

class SpotPoint {
  constructor(i) {
    this.num = i
    this.r = 30
    this.px = 0
    this.py = 0
    this.mouseHover = false
    this.isSelected = false
    this.isMerged = false
    this.fullHTML = `
      <h2 id="name">${json[i].name}</h2>
      <p id="address">${json[i].address}</p>
      <p id="station">最寄り駅: ${json[i].station}</p>
      <p id="holiday">定休日: ${json[i].closingDay}</p>
      <p id="tel">TEL: ${json[i].telephone}</p>
      <a id="url" href="${json[i].url}" target="_blank">ホームページ</a>
      <p id="time">開館時間: ${json[i].openingTime}</p>
      <p id="comment">${comments[i].comment}</p>
      <p id="tips">tips! ${comments[i].tips}</p>
      <span id="cross" onclick="crossClose()"></span>
    `
    this.listHTML = document.createElement('a')
    this.listHTML.classList.add('list-item')
    this.listHTML.setAttribute('onclick', `selectList(${this.num})`)
    this.listHTML.innerHTML = `
        <h2>${json[i].name}</h2>
        <h3>></h3>
    `
  }

  display() {
    if (!this.isMerged && json[this.num] !== undefined) {
      this.px = map(json[this.num].lon, lonFrom, lonTo, mapWFrom, mapWTo)
      this.py = map(json[this.num].lat, latFrom, latTo, mapHFrom, mapHTo)

      var tarR = 30
      this.mouseHover = false

      if (
        mouseX >= this.px - this.r / 2 &&
        mouseX <= this.px + this.r / 2 &&
        mouseY >= this.py - this.r / 2 &&
        mouseY <= this.py + this.r / 2
      ) {
        cursor('pointer')
        tarR = 40
        this.mouseHover = true
      }
      fill(0, 0, 100, 100)
      if (this.isSelected) {
        fill(200, 20, 100, 100)
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

class SummedPoint {
  constructor(i, lon, lat, id1, id2) {
    this.num = i
    this.r = 40
    this.lon = lon
    this.lat = lat
    this.px = 0
    this.py = 0
    this.isSelected = false
    this.isMerged = false
    this.elements = [id1, id2]
    this.listItem =
      `<span id="cross" onclick="crossClose()"></span>` +
      points[id1].listHTML.outerHTML +
      points[id2].listHTML.outerHTML
  }

  addElement(num) {
    this.elements[this.elements.length] = num
    this.listItem = this.listItem + points[num].listHTML.outerHTML
    this.lon =
      (this.lon * (this.elements.length - 1) + parseFloat(json[num].lon)) /
      this.elements.length
    this.lat =
      (this.lat * (this.elements.length - 1) + parseFloat(json[num].lat)) /
      this.elements.length
    points[num].isMerged = true
  }

  merge(target) {
    this.elements = this.elements.concat(target.elements)
    this.listItem = this.listItem + target.listItem
    this.lon =
      (this.lon * (this.elements.length - target.elements.length) +
        target.lon * target.elements.length) /
      this.elements.length
    this.lat =
      (this.lat * (this.elements.length - target.elements.length) +
        target.lat * target.elements.length) /
      this.elements.length

    target.isMerged = true
  }

  display() {
    if (!this.isMerged) {
      this.px = map(this.lon, lonFrom, lonTo, mapWFrom, mapWTo)
      this.py = map(this.lat, latFrom, latTo, mapHFrom, mapHTo)

      var tarR = 40
      OnTheSummed[this.num] = false

      if (
        mouseX >= this.px - this.r / 2 &&
        mouseX <= this.px + this.r / 2 &&
        mouseY >= this.py - this.r / 2 &&
        mouseY <= this.py + this.r / 2
      ) {
        cursor('pointer')
        tarR = 50
        OnTheSummed[this.num] = true
      }
      fill(0, 0, 100, 100)
      if (this.isSelected) {
        fill(200, 20, 100, 100)
        tarR = 50
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
      fill(30)
      textSize(20)
      textAlign(CENTER, CENTER)
      text(this.elements.length, this.px, this.py)
    }
  }
}

const popup = document.getElementById('popup')
const summedPopup = document.getElementById('popup')

function mouseClicked() {
  for (let i = 0; i < points.length; i++) {
    if (points[i].mouseHover == true) {
      if (isPopupOpened || isSummedOpened) {
        crossClose()
      }
      mapWFromTar =
        windowWidth / 2 - map(json[i].lon, lonFrom, lonTo, 0, mapWidth) + 240
      mapHFromTar =
        windowHeight / 2 - map(json[i].lat, latFrom, latTo, 0, mapHeight)
      isPopupOpened = true
      points[i].isSelected = true
      window.setTimeout(function () {
        popup.style.display = 'block'
        popup.classList.toggle('visible')
        popup.classList.toggle('invisible')
        popup.innerHTML = points[i].fullHTML
      }, 400)
    }
  }
  for (let i = 0; i < summed.length; i++) {
    if (OnTheSummed[i] == true) {
      if (isPopupOpened || isSummedOpened) {
        crossClose()
      }
      mapWFromTar =
        windowWidth / 2 - map(summed[i].lon, lonFrom, lonTo, 0, mapWidth) + 240
      mapHFromTar =
        windowHeight / 2 - map(summed[i].lat, latFrom, latTo, 0, mapHeight)
      isSummedOpened = true
      summed[i].isSelected = true
      window.setTimeout(function () {
        summedPopup.style.display = 'block'
        summedPopup.classList.toggle('visible')
        summedPopup.classList.toggle('invisible')
        summedPopup.innerHTML = summed[i].listItem
      }, 400)
    }
  }
}

function selectList(num) {
  popup.innerHTML = points[num].fullHTML
}

function crossClose() {
  if (isPopupOpened) {
    popup.classList.toggle('visible')
    popup.classList.toggle('invisible')
    isPopupOpened = false
    window.setTimeout(function () {
      popup.style.display = 'none'
    }, 400)
    for (let i = 0; i < points.length; i++) {
      points[i].isSelected = false
    }
  }

  if (isSummedOpened) {
    summedPopup.classList.toggle('visible')
    summedPopup.classList.toggle('invisible')
    isSummedOpened = false
    window.setTimeout(function () {
      summedPopup.style.display = 'none'
    }, 400)
    for (let i = 0; i < summed.length; i++) {
      summed[i].isSelected = false
    }
  }
}

document.getElementById('cross').onclick = () => {
  crossClose()
}
