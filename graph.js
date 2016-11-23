const rg = require('randomgraph')

//const graph = rg.BalancedTree(3, 2)
//const graph = rg.WattsStrogatz.alpha(300, 4, 0.03)
//const graph = rg.ErdosRenyi.np(200, 0.01)
const graph = rg.BarabasiAlbert(3000, 2, 2)
//const graph = rg.BarabasiAlbert(60, 2, 2)

module.exports = graph
