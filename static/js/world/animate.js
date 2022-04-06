// import {
// 	OrbitControls,
// } from '../../inc/OrbitControls.js?v=130'
import RENDERER from './RENDERER.js?v=130'
import CAMERA from './CAMERA.js?v=130'
import SCENE from './SCENE.js?v=130'
import TOONS from './TOONS.js?v=130'
import BROKER from './WorldBroker.js?v=130'


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

	// CONTROLS.update()

	// CAMERA.position
	requestAnimationFrame( animate )

	RENDERER.render( SCENE, CAMERA )
	// composeAnimate()

}




export default animate
