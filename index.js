const r = require("ramda")
const d3 = require("d3")
const rg = require('randomgraph')
const l = console.log.bind(console)


const svg = d3.select("#canvas")
svg.attr("preserveAspectRatio", "xMidYMid meet")
svg.attr({ "width": "100%", "height": "100%" })

const window = require("global/window")
const width = +window.innerWidth
const height =  +window.innerHeight

// const G = {nodes:[{x:100}, {}, {}, {}]
//   , links:[{source:0, target: 1, index:0}
//           ,{source:1, target: 2, index:1}
//           ,{source:2, target: 3, index:2}
//           ]}
//const G = rg.BalancedTree(3, 5)
//const G = rg.WattsStrogatz.alpha(300, 4, 0.03)
//const G = rg.ErdosRenyi.np(200, 0.)
//const G = rg.BarabasiAlbert(300, 2, 1)
const G = rg.BarabasiAlbert(300, 2, 2)
const k = Math.sqrt(G.nodes.length / (width * height))
const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(50))
      .force("charge", d3.forceManyBody().strength(-0.5 / k))
      .force("center", d3.forceCenter(width / 2, height / 2))
//      .stop()

simulation.nodes(G.nodes).on("tick", ticked)
simulation.force("link").links(G.edges)

var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(G.edges)
  .enter().append("line")
  .attr("stroke-width", function(d) { return 1 })

var color = d3.scaleOrdinal(d3.schemeCategory20)

var node = svg.append("g")
.attr("class", "nodes")
.selectAll("circle")
.data(G.nodes)
.enter().append("circle")
.attr("r", 5)
.attr("fill", function(d) { return 1 })
.call(d3.drag()
       .on("start", dragstarted)
       .on("drag", dragged)
       .on("end", dragended))

node.append("title")
 .text(function(d, id) { return id })

const rn = require('random-number')
const randEdge = rn.generator({min: 0, max: G.edges.length-1, integer: true})
const randNode = rn.generator({min: 0, max: G.nodes.length-1, integer: true})
const initNode = randNode()
const touches = r.curry((node, link) => {
  const z = link.source.index == node || link.target.index == node
  console.log(node, link, z, link.source.index, link.target.index)
  return z
})

const messages = [initNode]

function addDirections(link){
  const to = messages.indexOf(link.source.index) > -1 ? link.target.index : link.source.index
  const from = messages.indexOf(link.source.index) > -1 ? link.source.index : link.target.index
  return r.merge({to, from}, link)
}

const currentEdges = G.edges.filter(touches(initNode)).map(addDirections)
const drawnEdges = []
console.log(currentEdges)

const msg = svg.append("g").attr("class", "msg")

function update(currentEdges){
  const t = d3.transition().duration(500)
  const t0 = d3.transition().duration(0)
  const line = msg.selectAll("line").data(currentEdges)
  
  line.enter().append("line")
    .style("stroke", function(d) { return color(d.group)})
    .transition(t)
    .ease(d3.easeLinear)
    .attr("stroke-width", function(d){ return 3 })
    .on("start", function repeat() {
      const message = this
      d3.active(message)
        .attrTween("x1", function(d) {
          return function(t){
            const p = link.data().find(byIndex(d.index))
            return p.source.index == d.from ? p.source.x : p.target.x
          }
        })
        .attrTween("y1", function(d) {
          return function(t){
            const p = link.data().find(byIndex(d.index))
            return p.source.index == d.from ? p.source.y : p.target.y
          }
        })
        .attrTween("x2", function(d) {
          return function(t){
            const p = link.data().find(byIndex(d.index))
            const source = p.source.index == d.from ? p.source.x : p.target.x
            const target = p.source.index == d.from ? p.target.x : p.source.x
            return d3.interpolate(source, target)(t)
          }
        })
        .attrTween("y2", function(d) {
          return function(t){
            const p = link.data().find(byIndex(d.index))
            const source = p.source.index == d.from ? p.source.y : p.target.y
            const target = p.source.index == d.from ? p.target.y : p.source.y
            return d3.interpolate(source, target)(t)
          }
        })
    })
    .transition(t0)
    .on("end", function(d){
      const line = this
      currentEdges.forEach((ie) => drawnEdges.push(ie))
      const lastTargets = currentEdges.map(r.prop('to'))
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
    })
}

update(currentEdges)

function ticked() {
  link
    .attr("x1", function(d) { return d.source.x })
    .attr("y1", function(d) { return d.source.y })
    .attr("x2", function(d) { return d.target.x })
    .attr("y2", function(d) { return d.target.y })

  node
    .attr("cx", function(d) { return d.x })
    .attr("cy", function(d) { return d.y })

  msg.selectAll("line")
    .attr("x1", function(d) { return d.source.x })
    .attr("y1", function(d) { return d.source.y })
    .attr("x2", function(d) { return d.target.x })
    .attr("y2", function(d) { return d.target.y })

}

const byIndex = r.propEq('index')
// function update(){
//   msg
//     .transition()
  
// }

// update()

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
