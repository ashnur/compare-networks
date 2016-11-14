//const jsnx = require("jsnetworkx")
// const mori = require("mori")
// const {assoc, get, map} = mori
//const G = new jsnx.gnpRandomGraph(126, 0.025)
// const G = new jsnx.binomialGraph(126, 0.023)
// const G = new jsnx.fullRaryTree(2, 10)
//
const debug = true
const r = require("ramda")
const d3 = require("d3")
const rg = require('randomgraph')
//console.log(rg)
//const G = rg.WattsStrogatz.alpha(100, 2, 0.1)
const G = rg.BalancedTree(3, 5)

//console.log(G)


const svg = d3.select("#canvas")
svg.attr("preserveAspectRatio", "xMidYMid meet")
svg.attr({ "width": "100%", "height": "100%" })

const window = require("global/window")
const width = +window.innerWidth
const height =  +window.innerHeight

const color = d3.scaleOrdinal(d3.schemeCategory20)
function distanceFromCenter(graph, node) {
  return 1
}

const k = Math.sqrt(G.nodes.length / (width * height))

const chooseNodeRandom = require("random-number").generator({min:0, max: G.nodes.length -1, integer: true})

const rndNode = chooseNodeRandom()
const source = r.prop('source')
const target = r.prop('target')
const sourceIs = r.propEq('source')
const targetIs = r.propEq('target')
const sourceOrTarget = r.either(sourceIs, targetIs)
const rndNodeNeighbors = G.edges.filter(function(edge){
  return sourceOrTarget(rndNode, edge)
})
function makeActor({target}){
  return {node: target, hasMsg: true}
}
let actors = [{node: rndNode, hasMsg: true}]

const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(20))
      .force("charge", d3.forceManyBody().strength(-0.1 / k))
      .force("center", d3.forceCenter(width / 2, height / 3))

const getId = r.prop("id")
const getArrayElemId = (_, id) => id
const getNode = r.prop("node")

const byId = r.curry((by, id) => by === id)
const link = svg.append("g").attr("class", "links")
const node = svg.append("g").attr("class", "nodes")
function refresh(){
  		link
  		.selectAll("line")
  		.data(G.edges, getArrayElemId)
  		//.data(G.edges, function(x) {
      //  console.log(x, {source: x.source, target:x.target, data: x})
      //  return [x.source, x.target]
      //  return {source: x.source, target:x.target, value: x}
      //})
  		.enter().append("line")
  		.attr("stroke-width", function(d) { return Math.sqrt(1); })


  		node
  		.selectAll("circle")
  		.data(G.nodes)
      .enter().append("circle")
  		.attr("r", 5).attr("fill", function(d){
        // console.log('actors #', actors.length)
        //console.log(actors.map(getNode).indexOf(d.index), d.index)
        return actors.map(getNode).indexOf(d.index) > -1  ? "red" : "black"
      })
}

// node.attr("fill", function(d){
//         // console.log('actors #', actors.length)
//         console.log(actors.map(getNode).indexOf(d.index), d.index)
//         return actors.map(getNode).indexOf(d.index) > -1  ? "red" : "black"
//       })

//  		.attr("fill", function(d) { return color(d.group); })
  							// .call(d3.drag()
  							// 				.on("start", dragstarted)
  							// 				.on("drag", dragged)
  							// 				.on("end", dragended))

const message = svg.append("g").attr("class", "messages")


const getX1 = (d) => { return d.source.x}
const getY1 = (d) => { return d.source.y}
const getX2 = (d) => { return d.target.x}
const getY2 = (d) => { return d.target.y}

function getLink(edge, id, edges){
  const link = this
  // console.log(this, edge, edges)
  return edge
}
function update(messages, actors){
  const t = d3.transition().duration(2750)

  refresh()

  const msg = message.selectAll("line").data(messages, getLink)
  msg.size()
//  console.log(msg, msg.size())

  msg.exit()
   	.attr("class", "exit")
  	.transition(t)
    .style("fill-opacity", 1e-6)
    .remove()

  msg.attr("class", "update")
    .style("fill-opacity", 1)
    .attr("x1", function(d, i) {
      return i * 32;
    })
    .transition(t)

  msg.enter().append("line")
    .attr("class", "enter")
    .style("fill-opacity", 1e-6)
    .attr("x1", getX1)
    .attr("y1", getY1)
    .attr("x2", getX2)
    .attr("y2", getY2)
    .transition(t)
    .style("fill-opacity", 1)

}


simulation
  .nodes(G.nodes)
  .on("tick", ticked)

//console.log(G.edges)
simulation.force("link").links(G.edges)

function ticked() {
  link
  	.attr("x1", function(d) { return d.source.x; })
  	.attr("y1", function(d) { return d.source.y; })
  	.attr("x2", function(d) { return d.target.x; })
  	.attr("y2", function(d) { return d.target.y; })

  node
  	.attr("cx", function(d) { return d.x; })
  	.attr("cy", function(d) { return d.y; })
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(d) {
  d.fx = d3.event.x
  d.fy = d3.event.y
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}


function messageFromEdge({source, target}){
  console.log(x)
  return {source: nodes[src], target: nodes[tgt]}
}
let messages = rndNodeNeighbors//.map(messageFromEdge)
//console.log(rndNodeNeighbors)

function upProgress(msg){
  //console.log(msg.link, msg.progress)
  // console.log(nodes[msg.node], G.edges([G.nodes()[msg.node]]))//, G.edges(nodes[msg.node]))
  // msg.progress = msg.progress >= 0.99 ? 1 : msg.progress + 0.01
//  return {link, progress: progress >= 0.99 ? 1 : progress + 0.01 }
  return msg
}

function hasArrived(msg){
  console.log(msg, actors, actors.some(actor => actor.node == msg.target.index))
  return ! actors.some(actor => actor.node == msg.target.index)
}

function newActor(msg){
  return makeActor({target: msg.target.index})
}

function flow(actors, msg){
  // for each message that just arrived create a new actor
  if ( hasArrived(msg) ) {
    //debugger
    actors.push(newActor(msg))
  }
  return actors
}

function moveForward(messages, actors){
  return [messages.reduce(upProgress, messages), messages.reduce(flow, actors)]
}

update(messages, actors)
d3.interval(function(t) {
  //console.log(actors, messages)
  update(messages, actors)
  ;[messages, actors] = moveForward(messages, actors)
}, 5000)


// show the node with message
// get neighbours
// send message
// show the paths the message takes
// paths completed, new nodes have the message
// repeat from 2nd step, for each new node with message
