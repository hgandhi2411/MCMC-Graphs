# mcmc-graphs [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> This package uses Markov Chain Monte Carlo to calculate the most probable graphs for a given number of nodes in space.

Markov chain Monte Carlo (MCMC) methods are a class of algorithms for sampling from a probability distribution based on constructing a Markov chain that has the desired distribution as its equilibrium distribution. The state of the chain after a number of steps is then used as a sample of the desired distribution. The quality of the sample improves as a function of the number of steps.
## Installation

You will first need to clone the repo.
```
git clone https://github.com/hgandhi2411/MCMC-Graphs
```
Then inside the repo, install the package. The usage is described in the next section.
```sh
$ npm install --save mcmc-graphs
```
You can use the package in your code using the following line:
```js
const mcmcGraphs = require('mcmc-graphs');
```
## Usage

Once the repo is cloned and package is installed, run the code:
```sh
$ node lib\index.js 
```
You can use the commandline options to give the following parameters:
* -n, --nodeNumber : Number of nodes, default value is 10.
* -r, --rfactor: The r multiplier in the theta function, default is 1.
* -t, --temperature : Temperature, default  value is 298.
* -c, --coordinates : Coordinates as an array, for example, -c [[1, 2], [2, 3], [4,5]]. The array size must equal the nodeNumber. The program will not throw an error if nodeNumber < 10 and coordinates are not specified, but any nodeNumber > 10 will throw an error.

An example of running the code is:
```sh
$ node lib\index.js -r 2 -n 5 -c [[1, 2], [3, 4], [6, 7], [7, 8], [0, 5]]
```

### Problems to address

1. The code throws errors after a certain number of iterations. Error still untracked!
2. Quantiling not as expected. The package is still broken, it doesn't give the top 10% of graphs correctly.
2. Tests for mcmc function not in place
## License

Apache-2.0 © [Heta Gandhi]()


[npm-image]: https://badge.fury.io/js/mcmc-graphs.svg
[npm-url]: https://npmjs.org/package/mcmc-graphs
[travis-image]: https://travis-ci.org/hgandhi2411/mcmc-graphs.svg?branch=master
[travis-url]: https://travis-ci.org/hgandhi2411/mcmc-graphs
[daviddm-image]: https://david-dm.org/hgandhi2411/mcmc-graphs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/hgandhi2411/mcmc-graphs
[coveralls-image]: https://coveralls.io/repos/hgandhi2411/mcmc-graphs/badge.svg
[coveralls-url]: https://coveralls.io/r/hgandhi2411/mcmc-graphs
