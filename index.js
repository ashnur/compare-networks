const jsnx = require('jsnetworkx')
//var G = new jsnx.gnpRandomGraph(126, 0.025);
const G = new jsnx.fullRaryTree(20, 200)

 
 
var color = d3.scale.category20();

jsnx.draw(G, {
    element: '#canvas',
    layoutAttr: {
      charge: () => Math.random() * -1 * 300,
      linkDistance: () => Math.random() * 20,
      linkStrength: () => Math.random(),
      friction: 0.8,
      gravity: 0.2
    },
    nodeAttr: {
        r: 5,
        title: function(d) { return d.label;}
    },
    nodeStyle: {
      color:"red",
      padding: "10px",
      border: "1px solid red"
    },
    edgeStyle: {
        fill: '#999'
    }
});


