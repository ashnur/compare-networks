const BalancedTree = null
const WattsStrogatz = null
const ErdosRenyi = null
const BarabasiAlbert = null

const state = { algorithm: "BalancedTree"	
							,	method: ""
							, h: 3
							, r: 3
							, n: 3
							, K: 3
							, x: 3
							, m0: 3
							, M: 3
							}

const gui = new dat.GUI()
const algorithm = gui.add(state, "algorithm", ["BalancedTree", "WattsStrogatz", "ErdosRenyi", "BarabasiAlbert"])
const method = gui.add(state, "method", ["alpha", "beta", "nm", "np"])
const bt = gui.addFolder('BalancedTree')
let actualAlgo = ""

let genGraph = () => {return{nodes:[], edges:[]}}

let algoArgs = []

algorithm.onChange((algo, ...args) => {
	actualAlgo = algo
	switch(algo){
		case "BalancedTree":
			genGraph = () => rg.BalancedTree(state.h, state.r)
			break
		case "WattsStrogatz":
			genGraph = () => rg.WattsStrogatz[state.method](state.n, state.K, state.x)		
			break
		case "ErdosRenyi":
			genGraph = () => rg.ErdosRenyi[state.method](state.n, state.x)		
			break
		case "BarabasiAlbert":
			genGraph = () => rg.BarabasiAlbert(state.n, state.m0, state.M)		
			break
	}	
})


    
const rg = require("randomgraph")
//const graph = rg.BalancedTree(3, 2)
//const graph = rg.WattsStrogatz.alpha(300, 4, 0.03)
//const graph = rg.ErdosRenyi.np(200, 0.01)
const graph = rg.BarabasiAlbert(300, 2, 2)
//const graph = rg.BarabasiAlbert(60, 2, 2)

module.exports = function(cb){
	const graph = genGraph(5,2)
	cb(graph)
}
