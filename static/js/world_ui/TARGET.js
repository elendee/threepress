import INSTALLS from '../world/INSTALLS.js?v=140'
import BROKER from '../world/WorldBroker.js?v=140'
import RENDERER from '../world/RENDERER.js?v=140'


const target = document.createElement('div')
target.id = 'world-target-ele'
setTimeout(() => {
	RENDERER.domElement.parentElement.appendChild( target )
}, 1000)




const set = event => {

	const { mesh } = event

	if( !mesh ) return clear()

	if( INSTALLS[ mesh.userData?.uuid ] ){
		INSTALLS[ mesh.userData.uuid ].set_controls( true )
	}

	target.innerHTML =  mesh.userData?.name || 'unknown target'
	// if( mesh.userData.description ){
	// 	target.innerHTML += '<div>' + mesh.userData.description + '</div>'
	// }
	target.classList.add('active')

	THREEPRESS.target_mesh = mesh

	// console.log( 'target set: ', mesh )
	
}


const clear = () => {

	target.innerHTML = ''
	target.classList.remove('active')
	for( const uuid in INSTALLS ){
		INSTALLS[ uuid ].set_controls( false )
	}
	delete THREEPRESS.target_mesh

}








const init = () => {

	BROKER.subscribe('TARGET_SET', set )
	BROKER.subscribe('TARGET_CLEAR', clear )

}


export default {
	init,
}

