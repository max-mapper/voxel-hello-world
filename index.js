var createGame = require('voxel-engine')
var voxel = require('voxel')
var toolbar = require('toolbar')
var player = require('voxel-player')
var createTerrain = require('voxel-perlin-terrain')
var highlighter = require('voxel-highlight')
var createTree = require('voxel-forest')
var texturePath = require('painterly-textures')(__dirname)
var blockSelector = toolbar({el: '#tools'})

// setup the game and add some trees
var game = createGame({
  generateVoxelChunk: createTerrain({ scaleFactor: 10 }),
  chunkDistance: 2,
  materials: [
    'obsidian',
    ['grass', 'dirt', 'grass_dirt'],
    'brick',
    'grass',
    'plank'
  ],
  texturePath: texturePath,
  worldOrigin: [0, 0, 0],
  controls: { discreteFire: true }
})

window.game = game // for debugging

var container = document.querySelector('#container')

game.appendTo(container)

for (var i = 0; i < 20; i++) createTree(game, { bark: 5, leaves: 4 })

// create the player from a minecraft skin file and tell the
// game to use it as the main player
var createPlayer = player(game)
var substack = createPlayer('substack.png')
substack.possess()

// fixes a dumb race condition somewhere
setTimeout(function() {
  substack.yaw.position.set(0, 50, 0)
}, 1000)

// toggle between first and third person modes
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) substack.toggle()
})

// block interaction stuff
var highlight = highlighter(game)
var currentMaterial = 1

blockSelector.on('select', function(material) {
  material = +material // cast to int
  if (material > -1) currentMaterial = material
  else currentMaterial = 1
})

game.on('fire', function(target, state) {
  var vec = game.cameraVector()
  var pos = game.cameraPosition()
  var point = game.raycast(pos, vec, 100)
  if (!point) return
  var erase = !state.firealt && !state.alt
  if (erase) {
    game.setBlock(point, 0)
  } else {
    game.createBlock(point.addSelf(vec.multiplyScalar(-game.cubeSize/2)), currentMaterial)
  }
})

module.exports = game
