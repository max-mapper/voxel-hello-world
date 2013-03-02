var createGame = require('voxel-engine')
var toolbar = require('toolbar')
var player = require('voxel-player')
var texturePath = require('painterly-textures')(__dirname)
var blockSelector = toolbar({el: '#tools'})
var highlight = require('voxel-highlight')

function makeSphereWorld(x, y, z) {
  if ((x*x + y*y + z*z) > 200) return 0
  return 2
}

// setup the game and add some trees
var game = createGame({
  generate: makeSphereWorld,
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

// create the player from a minecraft skin file and tell the
// game to use it as the main player
var createPlayer = player(game)
var substack = createPlayer('substack.png')
substack.possess()
substack.yaw.position.set(2, 14, 4)

// highlight blocks when you look at them
var highlighter = highlight(game)

// toggle between first and third person modes
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) substack.toggle()
})

// block interaction stuff
var currentMaterial = 1

blockSelector.on('select', function(material) {
  material = +material // cast to int
  if (material > -1) currentMaterial = material
  else currentMaterial = 1
})

game.on('fire', function(target, state) {
  var point = game.raycast()
  if (!point) return
  var erase = !state.firealt && !state.alt
  if (erase) {
    game.setBlock(point.position, 0)
  } else {
    game.createBlock(point.adjacent, currentMaterial)
  }
})
