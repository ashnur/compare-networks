
const r = require("ramda")
const d3 = require("d3")
const document = require("global/document")
const window = require("global/window")

const canvasElement = document.createElement('canvas')
document.body.appendChild(canvasElement)
const width = +window.innerWidth
const height =  +window.innerHeight
const center = {x: width/2, y: height/2}
const canvas = d3.select("canvas").attr("width", width).attr("height", height)
const context = canvas.node().getContext("2d")
const rn = require('random-number')


const moveBack = (node, i) => {
  const dx = node.x / width - 1 / 2
  const dy = node.y / height - 1 / 2
  if (Math.random() < Math.pow(dx/0.5, 40)) {
    node.vx = - dx * 3
  }
  if (Math.random() < Math.pow(dy/0.5, 40)) {
    node.vy = - dy * 3
  }
}
const limitToScreen = () => nodes.forEach(moveBack)

const addDirections = (link) => {
  const to = messages.indexOf(link.source) > -1 ? link.target : link.source
  const from = messages.indexOf(link.source) > -1 ? link.source : link.target
  return r.merge({to, from, p: 0}, link)
}

const touches = r.curry((node, link) => link.source == node || link.target == node )

const inTheDark = (edge) => (messages.indexOf(edge.source) > -1 ) ^ (messages.indexOf(edge.target) > -1 )


const graph = require('./graph.js')
const randNode = rn.generator({min: 0, max: graph.nodes.length-1, integer: true})
const initNode = randNode()
const messages = [initNode]
let forceEdges = JSON.parse(JSON.stringify(graph.edges))
let currentEdges = graph.edges.filter(touches(initNode)).map(addDirections)
const drawnEdges = []
const nodes = graph.nodes.map((value, id)=>{return {id,value}})
const travelTime = 600 


const simulation = d3.forceSimulation()
                     .force("center", d3.forceCenter(width / 2, height / 2))
                     .force("link", d3.forceLink().distance(50).strength(0.02))
                     .force("collide", d3.forceCollide(5))
                     .force("charge", d3.forceManyBody().distanceMin(20).strength(-1))
                     .force("boxed", limitToScreen)

simulation.nodes(nodes).on("tick", ticked)
simulation.force("link").links(forceEdges)
canvas.call(d3.drag()
              .container(canvas.node())
              .subject(dragsubject)
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended))

update()

const notCurrentEdge = (fe) => currentEdges.find((ce) => ce.index != fe.index)
const addToDrawn = (edge) => {
  drawnEdges.push(edge)
  if ( messages.indexOf(edge.from) == -1 ) {
    messages.push(edge.from)
  }
  if ( messages.indexOf(edge.to) == -1 ) {
    messages.push(edge.to)
  }
}
function update(){
  const timer = d3.timer(function(elapsed){
    const progress = elapsed/travelTime
    const moveMessage = (ce) => ce.p = d3.easeCubic(progress)

    if ( elapsed < travelTime ) {
      if ( simulation.alpha() < 0.1 ) simulation.restart()
      currentEdges.forEach(moveMessage)
    } else {
      timer.stop()
      forceEdges = forceEdges.filter(notCurrentEdge)
      currentEdges.forEach(addToDrawn) 
      // select all edges from messages that lead to nodes that are not in messages
      const extendingEdges = graph.edges.filter(inTheDark)
      const nextEdges = extendingEdges.map(addDirections)
      currentEdges = nextEdges
      if ( currentEdges.length > 0 ) update()
    }
  })
}

const messageAlpha = 0.22
const messageStrokeStyle = "#123456"

function ticked() {
  context.clearRect(0, 0, width, height)

  // context.globalAlpha = 0.1
  // context.beginPath()
  // forceEdges.forEach(drawLink)
  // context.strokeStyle = "#666"
  // context.stroke()

  context.globalAlpha = messageAlpha
  context.beginPath()
  drawnEdges.forEach(drawOldMessage)
  context.strokeStyle = messageStrokeStyle
  context.stroke()

  context.beginPath()
  currentEdges.forEach(drawMessage)
  context.stroke()

  context.beginPath()
  nodes.forEach(drawNode)
  context.globalAlpha = 0.3
  context.fillStyle = d3.interpolateViridis(0.3)
  context.fill()
}

function drawOldMessage(message) {
  const source = nodes[message.source]
  const target = nodes[message.target]
  context.moveTo(source.x, source.y)
  context.lineTo(target.x, target.y)
}

function drawMessage(message) {
  const source = nodes[message.from]
  const target = nodes[message.to]
  const {x, y} = d3.interpolate(source, target)(message.p)
  context.moveTo(source.x, source.y)
  context.lineTo(x, y)
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y)
  context.lineTo(d.target.x, d.target.y)
}

function drawNode(d) {
  context.moveTo(d.x + 2.5, d.y)
  context.arc(d.x, d.y, 2.5, 0, 2 * Math.PI)
}

function dragsubject() {
  return simulation.find(d3.event.x, d3.event.y)
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d3.event.subject.fx = d3.event.subject.x
  d3.event.subject.fy = d3.event.subject.y
}

function dragged() {
  d3.event.subject.fx = d3.event.x
  d3.event.subject.fy = d3.event.y
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0)
  d3.event.subject.fx = null
  d3.event.subject.fy = null
}
