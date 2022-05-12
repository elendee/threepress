import { 
	MeshBasicMaterial, 
	BackSide, 
	// CubeGeometry, 
	TextureLoader,
	Mesh,
	BoxBufferGeometry,
	DoubleSide,
} from '../../inc/three.module.js?v=140'



const SKY_WIDTH = 1000

let skyBox

const TYPE = 'standard'


if( TYPE === 'image' ){

	let skyGeometry = new CubeGeometry( 
		SKY_WIDTH, 
		SKY_WIDTH, 
		SKY_WIDTH 
	)	
	let materialArray = new Array(6)

	const loader = new TextureLoader()
		
	for( let i = 0; i < 6; i++ ){
		loader.load( '/resource/sky.jpg', tex => {
			materialArray[i] =  new MeshBasicMaterial({
				map: tex,
				side: BackSide,
				fog: false
			})
		} )
	}
		
	skyBox = new Mesh( skyGeometry, materialArray )

}else{

	const skyGeometry = new BoxBufferGeometry(1,1,1)
	const skyMat = new MeshBasicMaterial({
		color: 'rgb(50, 100, 255)',
		side: DoubleSide,
	})
	skyBox = new Mesh( skyGeometry, skyMat )
	skyBox.scale.multiplyScalar( SKY_WIDTH )

}



export default skyBox
