const r = require("ramda")
const d3 = require("d3")
const rg = require('randomgraph')
const document = require("global/document")
const window = require("global/window")

const canvasElement = document.createElement('canvas')
document.body.appendChild(canvasElement)
const width = +window.innerWidth
const height =  +window.innerHeight

const center = {x: width/2, y: height/2}

const canvas = d3.select("canvas")
    .attr("width", width)
    .attr("height", height)

const context = canvas.node().getContext("2d")
context.globalAlpha = 1

//const graph = rg.BalancedTree(3, 2)
//const graph = rg.WattsStrogatz.alpha(300, 4, 0.03)
//const graph = rg.ErdosRenyi.np(200, 0.01)
const graph = rg.BarabasiAlbert(3000, 2, 2)
//const graph = rg.BarabasiAlbert(60, 2, 2)

const rn = require('random-number')
const randNode = rn.generator({min: 0, max: graph.nodes.length-1, integer: true})
const initNode = randNode()

const touches = r.curry((node, link) => link.source == node || link.target == node )

const messages = [initNode]

const simulation = d3.forceSimulation()
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink().distance(50).strength(0.02))
      .force("collide", d3.forceCollide(5))
      .force("charge", d3.forceManyBody().distanceMin(20).strength(-1))
      .force("boxed", function(){
        const margin = 1
        for (let i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i]
          const dx = node.x / width - 1 / 2
          const dy = node.y / height - 1 / 2
          if (Math.random() < Math.pow(dx/0.5, 40)) {
            node.vx = - dx * 3
          }
          if (Math.random() < Math.pow(dy/0.5, 40)) {
            node.vy = - dy * 3
          }
        }
      })


function addDirections(link){
  const to = messages.indexOf(link.source) > -1 ? link.target : link.source
  const from = messages.indexOf(link.source) > -1 ? link.source : link.target
  return r.merge({to, from, p: 0}, link)
}

let forceEdges = JSON.parse(JSON.stringify(graph.edges))
let currentEdges = graph.edges.filter(touches(initNode)).map(addDirections)
const drawnEdges = []
const nodes = graph.nodes.map((value, id)=>{return {id,value}})

simulation
    .nodes(nodes)
    .on("tick", ticked)

simulation.force("link")
    .links(forceEdges)

canvas.call(d3.drag()
    .container(canvas.node())
    .subject(dragsubject)
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))

const travelTime = 1000
update()
function update(){
  const timer = d3.timer(function(elapsed){
    if ( elapsed < travelTime ) {
      simulation.restart()
      for ( let i = 0; i < currentEdges.length; i++ ) {
        currentEdges[i].p = d3.easeCubic(elapsed/travelTime)
      }
    } else {
      timer.stop()
      currentEdges.forEach((ie) => drawnEdges.push(ie))
      forceEdges = forceEdges.filter((fe) => currentEdges.find((ce) => ce.index != fe.index))
      // add nodes to messages 
      currentEdges.forEach((edge) => {
        if ( messages.indexOf(edge.from) == -1 ) {
          messages.push(edge.from)
        }
        if ( messages.indexOf(edge.to) == -1 ) {
          messages.push(edge.to)
        }
      }) 
      // select all edges from messages that lead to nodes that are not in messages
      const extendingEdges = graph.edges.filter(inTheDark)
      const nextEdges = extendingEdges.map(addDirections)
      currentEdges = nextEdges
      if ( currentEdges.length > 0 ) update()
    }
  })
}


function inTheDark(edge){ return (messages.indexOf(edge.source) > -1 ) ^ (messages.indexOf(edge.target) > -1 ) }


function ticked() {
  context.clearRect(0, 0, width, height)


  context.globalAlpha = 0.22
  context.beginPath()
  forceEdges.forEach(drawLink)
  context.strokeStyle = "#999"
  context.stroke()
  context.globalAlpha = 1

  context.beginPath()
  drawnEdges.forEach(drawOldMessage)
  context.strokeStyle = "#007"
  context.stroke()

  context.beginPath()
  currentEdges.forEach(drawMessage)
  context.stroketyle = "#007"
  context.stroke()

  context.beginPath()
  nodes.forEach(drawNode)
  context.fillStyle = d3.interpolateViridis(0.335)
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
