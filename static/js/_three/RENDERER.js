import GLOBAL from '../../GLOBAL.js?v=6'
import env from '../../env.js?v=6'
import {
	WebGLRenderer,
	// PCFSoftShadowMap,
} from '/node_modules/three/build/three.module.js'
import CAMERA from './CAMERA.js?v=6'
// import GLOBAL from '../../GLOBAL.js?v=6'



const set_renderer = window.set_renderer = ( r, init ) => {
	// if( !init ) return false
	// console.log('set renderer: ', GLOBAL.RENDER.RES_KEY )
	r.setSize( 
		window.innerWidth / ( init ? 4 : GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ] ), 
		window.innerHeight / ( init ? 4 : GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ] ), 
		false 
	)
}

const renderer = new WebGLRenderer( { 
	antialias: true,
	alpha: true
} )

renderer.setPixelRatio( window.devicePixelRatio )
set_renderer( renderer, true )


renderer.shadowMap.enabled = true
// renderer.shadowMap.type = PCFSoftShadowMap

renderer.domElement.id = 'sky-canvas'
renderer.domElement.tabindex = 1

renderer.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / window.innerHeight
	CAMERA.updateProjectionMatrix()

	set_renderer( renderer )

}

window.addEventListener( 'resize', renderer.onWindowResize, false )

if( env.EXPOSE ) window.RENDERER = renderer

// renderer.physicallyCorrectLights = true //accurate lighting that uses the SI unit

// console.log('disabling renderer logs to prevent shader warnings in Firefox')
// renderer.context.getShaderInfoLog = function () { return '' }
// renderer.getContext.getShaderInfoLog = function () { return '' }

document.body.appendChild( renderer.domElement )

export default renderer


