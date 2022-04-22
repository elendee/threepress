/*
	build the various world components found in (server) World._DATA
*/

import Tree from './Tree.js?v=130'
import Pillar from './Pillar.js?v=130'


let Builder

export default obj => {
	switch( obj.type ){
		case 'tree':
			Builder = Tree
			break;

		case 'pillar':
			Builder = Pillar
			break;

		default: 
			console.log('unknown factory type', obj )
			// debugger
			return 
	}

	if( !Builder){
		console.log('failed to build', obj)
		return
	}

	return new Builder( obj )

}



// export default class FactoryObject extends Entity {
// 	constructor( init ){
// 		switch( init)
// 	}
// }