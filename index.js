var createGame = require('voxel-engine')
var voxel = require('voxel')
var toolbar = require('toolbar')
var skin = require('minecraft-skin')
var debris = require('voxel-debris')
var texturePath = require('painterly-textures')(__dirname)
var blockSelector = toolbar({el: '#tools'})
var highlighter = require('voxel-highlight')

var game = createGame({
  generate: voxel.generator['Valley'],
  startingPosition: [185, 100, 0],
  texturePath: texturePath
})

window.game = game // for debugging

var container = document.querySelector('#container')

game.appendTo(container)

var maxogden = skin(game.THREE, 'maxogden.png').createPlayerObject()
maxogden.position.set(0, 62, 20)
game.scene.add(maxogden)

var substack = skin(game.THREE, 'substack.png').createPlayerObject()
substack.position.set(0, 62, -20)
game.scene.add(substack)

var currentMaterial = 1

var highlight = highlighter(game, {
  distance: 100,
  wireframeLinewidth: 10,
  wireframeOpacity: .9
})

var highlightedPosition = undefined

highlight.on('highlight', function(position, mesh) {
  highlightedPosition = position
})

highlight.on('remove', function(mesh) {
  highlightedPosition = undefined
})

blockSelector.on('select', function(material) {
  var idx = game.materials.indexOf(material)
  if (idx === -1) {
    for (var m = 0; m < game.materials.length; m++) {
      if (typeof game.materials[m] === 'object' && game.materials[m][0] === material) idx = m
    }
  }
  if (idx > -1) currentMaterial = idx + 1
})

var explode = debris(game, { power : 1.5, yield: 0 })

game.on('fire', function(mount, state) {
  var vec = mount.worldVector()
    , pos = mount.worldPosition()
    , point = game.raycast(pos, vec, 100)

  if(!point) {
    return
  }

  if(!state.firealt && !state.alt) {
    explode(point)  
  } else {
    game.createBlock(point.addSelf(vec.multiplyScalar(-game.cubeSize/2)), 1)
  }
})

game.on('mousedown', function (pos) {
  if (highlightedPosition) {
    if (erase) explode(pos)
    else game.createBlock(pos, currentMaterial)
  }
})

var erase = true
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'X'.charCodeAt(0)) {
    erase = !erase
  }
})

function ctrlToggle (ev) { erase = !ev.ctrlKey }
window.addEventListener('keyup', ctrlToggle)
window.addEventListener('keydown', ctrlToggle)

module.exports = game
