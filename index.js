const jsnx = require("jsnetworkx")
//var G = new jsnx.gnpRandomGraph(126, 0.025)
const G = new jsnx.fullRaryTree(20, 200)

var color = d3.scale.category20()

const force = jsnx.draw(G, {
  element: "#canvas",
  layoutAttr: {
    charge: () => Math.random() * -1 * 300,
    linkDistance: () => Math.random() * 20,
    linkStrength: () => Math.random(),
    friction: 0.8,
    gravity: 0.2
  },
  nodeShape: "circle",
  nodeAttr: {
    r: 5,
    title: function(d) { return d.label}
  },
  nodeStyle: {
    color:"red",
    padding: "10px",
    margin: "10px",
    border: "10px solid transparent"
  },
  edgeStyle: {
      fill: "#999"
  }
})

var neighbors = {}

force.nodes().forEach(function(node) {
    neighbors[node.index] = neighbors[node.index] || []
})

force.links().forEach(function(link) {
    neighbors[link.source.index].push(link.target.index)
    neighbors[link.target.index].push(link.source.index)
})
console.log(neighbors)
//visual.on("tick", tick)

function tick(tick){
//  console.log(tick)
}

function transmitter(){
  const wave = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  const node = d3.select(this)
  return wave
}

d3.selectAll(".node")
  .on("click", nodeClick)

// d3.selectAll(".node")
//   .append(transmitter)
G.adj.get(0).get(1).color = "blue"


function connections(targetIndex){
  const edges = d3.selectAll(".edge")[0]
  return edges.filter((edge) => {
    return edge.__data__.target.index == targetIndex
  })
}


function nodeClick(d){
  const node = d3.select(this)
  // init node with message
  // node.append("circle").attr("r", 20)
  // console.log(this, node, d, neighbors[d.index])
  const links = connections(d.index)
  links.forEach((l) => {
    const edge = d3.select(l)
    const line = edge.select(".line")
    const length = line.node().getTotalLength()
    console.log(line, length )
    line.transition()
      .duration(2000)
      .ease("linear")
      .attrTween("transform", sendMsg())
    // const sourceVec = [l.source.x, l.source.y]
    // const targetVec = [l.target.x, l.target.y]
    // console.log(l, l.source, l.target)
  })
  node.attr("msg", Math.random())
}

function sendMsg(){
  return function(d, i, a){
    return function(t){
      console.log(t)
      return `translate(10,11)`
    }
  }
}



// show the node with message
// get neighbours
// send message
// show the paths the message takes
// paths completed, new nodes have the message
// repeat from 2nd step, for each new node with message
