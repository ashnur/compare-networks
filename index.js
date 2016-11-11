const jsnx = require("jsnetworkx")
// const mori = require("mori")
// const {assoc, get, map} = mori
//const G = new jsnx.gnpRandomGraph(126, 0.025)
// const G = new jsnx.binomialGraph(126, 0.023)
const G = new jsnx.fullRaryTree(2, 10)
const d3 = require("d3")


const svg = d3.select("#canvas")
svg.attr("preserveAspectRatio", "xMidYMid meet")
svg.attr({ "width": "100%", "height": "100%" })

const window = require("global/window")
const width = +window.innerWidth
const height =  +window.innerHeight

const color = d3.scaleOrdinal(d3.schemeCategory20)

const nodes = G.nodes().map(node => ({id: node, group: jsnx.shortestPathLength(G, {source: 1, target: node})}))
const links = G.edges().map(edge => ({source: edge[0], target: edge[1], value: 1}))
const graph = { nodes, links }

const k = Math.sqrt(nodes.length / (width * height))

const chooseNodeRandom = require("random-number").generator({min:0, max: nodes.length -1, integer: true})

const rndNode = chooseNodeRandom()
const rndNodeNeighbors = G.edges([G.nodes()[rndNode]])
// console.log(rndNode, rndNodeNeighbors)
function makeActor([src, tgt]){
  return {node: tgt, hasMsg: true}
}
let actors = [{node: rndNode, hasMsg: true}].concat(rndNodeNeighbors.map(makeActor))

const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(20))
      .force("charge", d3.forceManyBody().strength(-0.1 / k))
      .force("center", d3.forceCenter(width / 2, height / 2))

const r = require("ramda")
const getId = r.prop("id")
const getNode = r.prop("node")

const link = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(graph.links, getId)
			.enter().append("line")
			.attr("stroke-width", function(d) { return Math.sqrt(d.value); })

const node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(graph.nodes, getId)
			.enter().append("circle")
			.attr("r", 5)
      .attr("fill", function(d){
        console.log(actors.map(getNode), d.id, actors.map(getNode).indexOf(d.id))
        return actors.map(getNode).indexOf(d.id) > -1 ? "red" : "black"
      })
//			.attr("fill", function(d) { return color(d.group); })
								// .call(d3.drag()
								// 				.on("start", dragstarted)
								// 				.on("drag", dragged)
								// 				.on("end", dragended))



const getX1 = (d) => d.source.x
const getY1 = (d) => d.source.y
const getX2 = (d) => d.target.x
const getY2 = (d) => d.target.y

function getLink(...args){
  // console.log(this, args)
  return args[0]
}
function update(data){
	const t = d3.transition().duration(750)


	const msg = svg.append("g")
				.attr("class", "messages")
				.selectAll("line")
     		.data(data, getLink)
  
	msg.exit()
	 	.attr("class", "exit")
		.transition(t)
    .style("fill-opacity", 1e-6)
    .remove()

  msg.attr("class", "update")
    .style("fill-opacity", 1)
    .attr("x1", function(d, i) {
      console.log(d, i, G.getEdgeData(links[d.link][0], links[d.link][1]))
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
	.nodes(graph.nodes)
	.on("tick", ticked)

simulation.force("link")
	.links(graph.links)

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


function messageFromEdge([src, tgt]){
  return {source: nodes[src], target: nodes[tgt]}
}
let messages = rndNodeNeighbors.map(messageFromEdge)

function upProgress(msg){
  //console.log(msg.link, msg.progress)
  // console.log(nodes[msg.node], G.edges([G.nodes()[msg.node]]))//, G.edges(nodes[msg.node]))
  // msg.progress = msg.progress >= 0.99 ? 1 : msg.progress + 0.01
//  return {link, progress: progress >= 0.99 ? 1 : progress + 0.01 }
  return msg
}

function moveForward(messages){
  return messages.map(upProgress)
}

update({messages, actors})
d3.interval(function(t) {
  console.log(actors, messages)
  messages = moveForward(messages)
  update(messages)
}, 5000)


// show the node with message
// get neighbours
// send message
// show the paths the message takes
// paths completed, new nodes have the message
// repeat from 2nd step, for each new node with message
