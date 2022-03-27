import { 
	Mesh,
	DirectionalLight, 
	// DirectionalLightHelper,
	HemisphereLight,
	TextureLoader,
	SpriteMaterial,
	Sprite,
	Color,
	Group,
	Vector3,
	PlaneGeometry,
	MeshLambertMaterial,
} from '../../inc/three.module.js?v=121'





const hemispherical = new HemisphereLight( 0x5599cc, 0xffffff, .4 )

export default { 
	hemispherical,
}