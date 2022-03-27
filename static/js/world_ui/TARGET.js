import BROKER from '../world/WorldBroker.js?v=121'




const set = event => {
	const { mesh } = event

	// console.log( 'target set: ', mesh )
	
}








const init = () => {

	BROKER.subscribe('TARGET_SET', set )

}


export default {
	init,
}

