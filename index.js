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

const G = {nodes:[{x:100}, {}, {}, {}]
  , links:[{source:0, target: 1, index:0}
          ,{source:1, target: 2, index:1}
          ,{source:2, target: 3, index:2}
          ]}
const k = Math.sqrt(G.nodes.length / (width * height))
const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(50))
      .force("charge", d3.forceManyBody().strength(-0.1 / k))
      .force("center", d3.forceCenter(width / 2, height / 3))
//      .stop()

simulation.nodes(G.nodes).on("tick", ticked)
simulation.force("link").links(G.links)

var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(G.links)
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
const randEdge = rn.generator({min: 0, max: G.links.length-1, integer: true})
const randNode = rn.generator({min: 0, max: G.nodes.length-1, integer: true})
const initNode = randNode()
const touches = r.curry((node, link) => {
  const z = link.source.index == node || link.target.index == node
  console.log(node, link, z, link.source.index, link.target.index)
  return z
})

const messages = [initNode]

const initEdges = G.links.filter(touches(initNode)).map(r.assoc("from", initNode))
console.log(initEdges)

const msg = svg.append("g")
.attr("class", "msg")
.selectAll("line")
.data(initEdges)
.enter().append("line")
.style("stroke", function(d) { return color(d.group)})
.transition()
.duration(2000)
.ease(d3.easeLinear)
.on("start", function repeat() {
  const message = this
  d3.active(message)
    .attrTween("x1", function(d) {
      return function(){
        return link.data().find(byIndex(d.index)).source.x
      }
    })
    .attrTween("y1", function(d) {
      return function(){
        return link.data().find(byIndex(d.index)).source.y
      }
    })
    .attrTween("x2", function(d) {
      return function(t){
        const p = link.data().find(byIndex(d.index))
        debugger
        const source = message.initNode ? p.source.x : p.target.x
        const target = message.initNode ? p.target.x : p.source.x
        return d3.interpolate(source, target)(t)
      }
    })
    .attrTween("y2", function(d) {
      return function(t){
        const p = link.data().find(byIndex(d.index))
        //l(t, p.source.y, p.target.y, p.target.y - p.source.y)
        return d3.interpolate(p.source.y, p.target.y)(t)
      }
    })
    .transition()
    .on("start", repeat)
    .on("end", function(d){
      const line = this
      
    })
})

.attr("stroke-width", function(d){ return 3 })

function ticked() {
  link
    .attr("x1", function(d) { return d.source.x })
    .attr("y1", function(d) { return d.source.y })
    .attr("x2", function(d) { return d.target.x })
    .attr("y2", function(d) { return d.target.y })

  node
    .attr("cx", function(d) { return d.x })
    .attr("cy", function(d) { return d.y })

  // msg
  //   .attr("x1", function(d) { return d.source.x })
  //   .attr("y1", function(d) { return d.source.y })
  //   .attr("x2", function(d) { return d.target.x })
  //   .attr("y2", function(d) { return d.target.y })

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
