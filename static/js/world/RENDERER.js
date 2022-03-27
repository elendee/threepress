import {
	WebGLRenderer,
	sRGBEncoding,
} from '../../inc/three.module.js?v=121'
import CAMERA from './CAMERA.js?v=121'
import STATE from './STATE.js?v=121'




const set_renderer = window.set_renderer = ( r, init ) => {
	r.setSize( 
		window.innerWidth / STATE.blur_divisor,
		window.innerHeight / STATE.blur_divisor,
		false 
	)
}

const renderer = new WebGLRenderer( { 
	antialias: true,
	alpha: true
} )

renderer.outputEncoding = sRGBEncoding

renderer.setPixelRatio( window.devicePixelRatio )
set_renderer( renderer, true )


renderer.shadowMap.enabled = true
// renderer.shadowMap.type = PCFSoftShadowMap

renderer.domElement.id = 'threepress-world-canvas'
renderer.domElement.tabindex = 1

renderer.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / window.innerHeight
	CAMERA.updateProjectionMatrix()

	set_renderer( renderer )

}

window.addEventListener( 'resize', renderer.onWindowResize, false )

export default renderer


