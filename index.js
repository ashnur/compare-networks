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

const G = {nodes:[{}, {}, {}, {}]
  , links:[{source:0, target: 1, index:0}
          ,{source:1, target: 2, index:1}
          ,{source:2, target: 3, index:2}
          ]}
const k = Math.sqrt(G.nodes.length / (width * height))
const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(20))
      .force("charge", d3.forceManyBody().strength(-0.1 / k))
      .force("center", d3.forceCenter(width / 2, height / 3))

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
//.call(d3.drag()
//        .on("start", dragstarted)
//        .on("drag", dragged)
//        .on("end", dragended))

node.append("title")
 .text(function(d, id) { return id })
//
const msg = svg.append("g")
.attr("class", "msg")
.selectAll("line")
.data([G.links[2]])
.enter().append("line")
.style("stroke", function(d) { return color(d.group)})

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

}

function update(){
  var t = d3.transition()
      .duration(100)
      .ease(d3.easeLinear)

  msg
    .transition('t')
    .attrTween("x1", function(d) { const i = d3.interpolate(d.source.x);                                return function(t){ return d.source.x   }})
    .attrTween("y1", function(d) { const i = d3.interpolate(d.source.y);                                return function(t){ return d.source.x   }})
    .attrTween("x2", function(d) { const i = d3.interpolateNumber(d.source.x, d.target.x); return function(t){l(i(t)); return i(t)   }})
    .attrTween("y2", function(d) { const i = d3.interpolateNumber(d.source.y, d.target.y); return function(t){l(i(t)); return i(t)   }})
  
}

update()
