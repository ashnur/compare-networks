const r = require("ramda")
const d3 = require("d3")
const rg = require('randomgraph')
const document = require("global/document")
const window = require("global/window")

const canvasElement = document.createElement('canvas')
document.body.appendChild(canvasElement)
const width = +window.innerWidth
const height =  +window.innerHeight

const canvas = d3.select("canvas")
    .attr("width", width)
    .attr("height", height)

const context = canvas.node().getContext("2d")

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-10).distanceMax(300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("vertical", d3.forceY().strength(0.018))
    .force("horizontal", d3.forceX().strength(0.006))


const graph = rg.BarabasiAlbert(60, 2, 2)

const nodes = graph.nodes.map((value, id)=>{return {id,value}})
console.log(nodes, graph.nodes)

simulation
    .nodes(nodes)
    .on("tick", ticked)

simulation.force("link")
    .links(graph.edges)

canvas.call(d3.drag()
        .container(canvas.node())
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

function ticked() {
  context.clearRect(0, 0, width, height)

  context.beginPath()
  graph.edges.forEach(drawLink)
  context.globalAlpha = 0.12
  context.strokeStyle = "#999"
  context.stroke()

  context.beginPath()
  nodes.forEach(drawNode)
  context.globalAlpha = 1
  context.fillStyle = d3.interpolateViridis(0.335)
  context.fill()
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

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y)
  context.lineTo(d.target.x, d.target.y)
}

function drawNode(d) {
  context.moveTo(d.x + 2.5, d.y)
  context.arc(d.x, d.y, 2.5, 0, 2 * Math.PI)
}
