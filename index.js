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


const sq = (x) => Math.pow(x, 2)
const q = (A, B) => sq(B.x - A.x) + sq(B.y - A.y) 

const fakecross = (A, B) => {
  const [a1, a2, a3] = [A.x, A.y, 1]
  const [b1, b2, b3] = [B.x, B.y, 1]
  const z = a1 * b2 - a2 * b1
  return [ a2 - b2, b1 - a1, z ]
}

const area = (A, B) => {
  const [a, b, c] = fakecross(A, B)
  return Math.sqrt(sq(a) + sq(b) + sq(c)) / 2
}

function boundedByBox(x1, y1, x2, y2){
  return function(edge, id){
    const z = area(edge.source, edge.target)
    return 1/z
  }
}
const simulation = d3.forceSimulation()
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink().distance(100).strength(boundedByBox(0, 0, width, height)))
      .force("collide", d3.forceCollide(5))
      .force("charge", d3.forceManyBody().strength(-0.5))
      .force("boxed", function(){
        const margin = 1
        for (let i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i]
          const dx = node.x / width - 1 / 2
          const dy = node.y / height - 1 / 2
          if (Math.random() < Math.pow(dx/0.5, 40)) {
            node.vx = - dx * 3;
          }
          if (Math.random() < Math.pow(dy/0.5, 40)) {
            node.vy = - dy * 3;
          }
        }
      })

const graph = rg.BarabasiAlbert(100, 10, 2)

const rn = require('random-number')
const randEdge = rn.generator({min: 0, max: graph.edges.length-1, integer: true})
const randNode = rn.generator({min: 0, max: graph.nodes.length-1, integer: true})
const initNode = randNode()

const touches = r.curry((node, link) => {
  const z = link.source == node || link.target == node
  //if ( node == initNode ) console.log(z, node, link, link.source.index, link.target.index)
  return z
})

const messages = [initNode]

function addDirections(link){
  const to = messages.indexOf(link.source) > -1 ? link.target : link.source
  const from = messages.indexOf(link.source) > -1 ? link.source : link.target
  return r.merge({to, from}, link)
}

const currentEdges = graph.edges.filter(touches(initNode)).map(addDirections)
console.log(currentEdges)
const drawnEdges = []
const nodes = graph.nodes.map((value, id)=>{return {id,value}})
const paths = graph.edges.filter(touches(initNode)).map(addDirections)

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

function x(d){
  currentEdges.forEach((ie) => drawnEdges.push(ie))
  const lastTargets = currentEdges.map(r.prop('to'))
  // add nodes to messages 
  currentEdges.forEach((edge) => {
    if ( messages.indexOf(edge.from) == -1 ) {
      messages.push(edge.from)
    }
    if ( messages.indexOf(ed0ge.to) == -1 ) {
      messages.push(edge.to)
    }
  })
  // select all edges from messages that lead to nodes that are not in messages
  // console.log(d.from, d.to, d)
  // console.log(currentEdges)
  // console.log( messages)
  const extendingEdges = G.edges.filter((link) => {
    const x = (messages.indexOf(link.source.index) > -1 ) ^ (messages.indexOf(link.target.index) > -1 )
    // console.log(messages, link.source.index, link.target.index, x)
    return x
  })
  // console.log(extendingEdges)
  const nextEdges = extendingEdges.map(addDirections)
  // console.log(nextEdges)
  update(currentEdges.concat(nextEdges))
}
function update(currentEdges){
  const t = d3.transition().duration(500)
  const t0 = d3.transition().duration(0)
  
  // const p = link.data().find(byIndex(d.index))
  // const source = p.source.index == d.from ? p.source.y : p.target.y
  // const target = p.source.index == d.from ? p.target.y : p.source.y
  // return d3.interpolate(source, target)(t)
  d3.transition(t)
    .ease(d3.easeLinear)
    .transition(t0)
}


function ticked(a) {
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

  context.beginPath()
  context.globalAlpha = 1
  currentEdges.forEach(drawMessage(simulation.alpha()))
  context.globalAlpha = 0.7
  context.strokeStyle = d3.interpolateViridis(0.635)
  context.stroke()
  // context.fillStyle = d3.interpolateViridis(0.335)
  // context.fill()
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

function drawMessage(a) {
  return function(d){
    const source = d.source == d.from ? nodes[d.source] : nodes[d.target]
    const target = d.source == d.from ? nodes[d.target] : nodes[d.source]
    const x =  d3.interpolate(source.x, target.x)(1 - a)
    const y =  d3.interpolate(source.y, target.y)(1 - a)
    context.moveTo(source.x, source.y)
    context.lineTo(x, y)
  }
}


function drawLink(d) {
  context.moveTo(d.source.x, d.source.y)
  context.lineTo(d.target.x, d.target.y)
}

function drawNode(d) {
  context.moveTo(d.x + 2.5, d.y)
  context.arc(d.x, d.y, messages.indexOf(d.index) > -1 ? 5 : 2.5, 0, 2 * Math.PI)
}
