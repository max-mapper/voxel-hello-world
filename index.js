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
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, {
    color: 0x00ff00,
    distance: 100
  })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) substack.toggle()
  })

  // block interaction stuff, uses highlight data
  var currentMaterial = 1

  blockSelector.on('select', function(material) {
    material = +material // cast to int
    if (material > -1) currentMaterial = material
    else currentMaterial = 1
  })

  game.on('fire', function (target, state) {
    if (blockPosPlace) game.createBlock(blockPosPlace, currentMaterial)
    else if (blockPosErase) game.setBlock(blockPosErase, 0)
  })

  return game
}
