// import {
// 	OrbitControls,
// } from '../../inc/OrbitControls.js?v=140'
import RENDERER from './RENDERER.js?v=140'
import CAMERA from './CAMERA.js?v=140'
import SCENE from './SCENE.js?v=140'
import TOONS from './TOONS.js?v=140'
import BROKER from './WorldBroker.js?v=140'
import GROUND from './GROUND.js?v=140'
// import { update } from './grass.js?v=140'

const { BLOCK_REGISTER } = GROUND

// const CONTROLS = new OrbitControls( CAMERA, RENDERER.domElement );
// window.CONTROLS = CONTROLS
// CONTROLS.enablePan = false


let then, now, delta, delta_seconds = 0 

const animate = () => {

	now = performance.now()

	delta = now - then

	delta_seconds = delta / 1000

	then = now 

	for( const uuid in TOONS ) TOONS[ uuid ].update( delta_seconds )

	// update() // grass

	for( const b of BLOCK_REGISTER.blocks ){
		b.update()
	}

	// CONTROLS.update()

	// CAMERA.position
	requestAnimationFrame( animate )

	RENDERER.render( SCENE, CAMERA )
	// composeAnimate()

}




export default animate
