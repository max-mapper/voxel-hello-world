var createGame = require('voxel-engine')
var toolbar = require('toolbar')
var highlight = require('voxel-highlight')
var toolbar = require('toolbar')
var player = require('voxel-player')
var texturePath = require('painterly-textures')(__dirname)
var toolbar = require('toolbar')
var blockSelector = toolbar({el: '#tools'})
var voxel = require('voxel')
var extend = require('extend')

module.exports = function(opts) {
  var defaults = {
    generate: voxel.generator['Valley'],
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt'],
      'obsidian',
      'brick',
      'grass',
      'plank'
    ],
    texturePath: texturePath,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true }
  }
  opts = extend({}, defaults, opts || {})
  
  // setup the game and add some trees
  var game = createGame(opts)

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
  var highlighter = highlight(game, {
    color: 0xff0000,
    distance: 100,
    frequency: 20 // very frequent for "painting" mode
  })
  highlighter.on('highlight', function (voxelPos) {
    console.log("highlighted voxel: " + voxelPos)
    game.setBlock(voxelPos, currentMaterial) // paint mode
  })

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
  
  return game
}
