const jsnx = require("jsnetworkx")
//const G = new jsnx.gnpRandomGraph(126, 0.025)
// const G = new jsnx.binomialGraph(126, 0.023)
const G = new jsnx.fullRaryTree(2, 200)
const d3 = require('d3')


const svg = d3.select("#canvas")
svg.attr("preserveAspectRatio", "xMidYMid meet")
svg.attr({ "width": "100%", "height": "100%" })

const window = require('global/window')
const width = +window.innerWidth
const height =  +window.innerHeight

const color = d3.scaleOrdinal(d3.schemeCategory20)




const nodes = G.nodes().map(node => ({id: node, group: jsnx.shortestPathLength(G, {source: 1, target: node})}))
const links = G.edges().map(edge => ({source: edge[0], target: edge[1], value: 1}))
const graph = { nodes, links }

const k = Math.sqrt(nodes.length / (width * height))

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(20))
    .force("charge", d3.forceManyBody().strength(-0.1 / k))
    .force("center", d3.forceCenter(width / 2, height / 2))

const link = svg.append("g")
								.attr("class", "links")
								.selectAll("line")
								.data(graph.links)
								.enter().append("line")
								.attr("stroke-width", function(d) { return Math.sqrt(d.value); })

const node = svg.append("g")
								.attr("class", "nodes")
								.selectAll("circle")
								.data(graph.nodes)
								.enter().append("circle")
								.attr("r", 5)
								.attr("fill", function(d) { return color(d.group); })
								// .call(d3.drag()
								// 				.on("start", dragstarted)
								// 				.on("drag", dragged)
								// 				.on("end", dragended))



function update(data){
	const t = d3.transition().duration(750)


	const msg = svg.append("g")
								 .attr("class", "messages")
								 .selectAll("line")
     						 .data(data, function(d) { return d; })
	msg.exit()
	 	 .attr("class", "exit")
		 .transition(t)
   	 .attr("y", 60)
     .style("fill-opacity", 1e-6)
     .remove()

// UPDATE old elements present in new data.
  msg.attr("class", "update")
      .attr("y", 0)
      .style("fill-opacity", 1)
    .transition(t)
      .attr("x", function(d, i) { return i * 32; })

  // ENTER new elements present in new data.
  msg.enter().append("line")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("y", -60)
      .attr("x", function(d, i) { return i * 32; })
      .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
    .transition(t)
      .attr("y", 0)
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


const randNode = require('random-number').gen({min:0, max: nodes.length -1})
update([rn()]);

// Grab a random sample of letters from the alphabet, in alphabetical order.
d3.interval(function() {
  update(d3.shuffle(alphabet)
      .slice(0, Math.floor(Math.random() * 26))
      .sort());
}, 1500);


// show the node with message
// get neighbours
// send message
// show the paths the message takes
// paths completed, new nodes have the message
// repeat from 2nd step, for each new node with message
