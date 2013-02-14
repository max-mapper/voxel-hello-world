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
var maxPhysics = game.makePhysical(maxogden)
maxogden.position.set(0, 62, 20)
game.scene.add(maxogden)
game.addItem(maxPhysics)

maxPhysics.yaw = maxogden
maxPhysics.pitch = maxogden.head
maxPhysics.subjectTo(new game.THREE.Vector3(0, -0.00009, 0))

var substack = skin(game.THREE, 'substack.png').createPlayerObject()
var substackPhysics = game.makePhysical(substack)

substack.position.set(0, 62, -20)
game.scene.add(substack)
game.addItem(substackPhysics)

substackPhysics.yaw = substack
substackPhysics.pitch = substack.head
substackPhysics.subjectTo(new game.THREE.Vector3(0, -0.00009, 0))
substackPhysics.blocksCreation = true

game.control(substackPhysics)
mountPoint = substack.cameraInside
mountPoint.add(game.view.camera)

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
var mountPoint

game.on('fire', function(target, state) {
  var vec = game.cameraVector()
  var pos = game.cameraPosition()
  var point = game.raycast(pos, vec, 100)

  if(!point) {
    return
  }

  if(!state.firealt && !state.alt) {
    explode(point)  
  } else {
    game.createBlock(point.addSelf(vec.multiplyScalar(-game.cubeSize/2)), 1)
  }
})

window.addEventListener('keydown', function (ev) {
  if(ev.keyCode === 'R'.charCodeAt(0) && game.controlling === substackPhysics) {
    mountPoint = (mountPoint === substack.cameraInside ?
      substack.cameraOutside : substack.cameraInside)    
    mountPoint.add(game.view.camera)
  }
})

function ctrlToggle (ev) { erase = !ev.ctrlKey }
window.addEventListener('keyup', ctrlToggle)
window.addEventListener('keydown', ctrlToggle)

module.exports = game
