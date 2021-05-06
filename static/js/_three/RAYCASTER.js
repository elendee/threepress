import {
	Raycaster,
} from '/node_modules/three/build/three.module.js'

import env from '../../env.js?v=6'

const raycaster = new Raycaster(); 

if( !env.DEV ) document.getElementById('dev').remove()//.style.display = 'none'

export default raycaster