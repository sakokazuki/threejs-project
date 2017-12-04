import * as THREE from 'three'
import SceneBase from 'scene/scene-base'


export default class TestScene extends SceneBase{
  constructor(){
    super();

    this.camera = new THREE.PerspectiveCamera(30, 16/9, 0.2, 2000);
    this.camera.position.set(0, 0, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const pointLight = new THREE.PointLight(0xffffff, 1 );
    pointLight.position.copy( this.camera.position );
    this.add( pointLight );

    this.grid = new THREE.GridHelper( 20, 20, 0x888888, 0x888888 );
    this.grid.position.set( 0, 0, 0 );
    this.add(this.grid);

    this.debugSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 0.1, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
    );
    this.add(this.debugSphere);

    this.debugAxis = new THREE.AxesHelper(10);
    this.add(this.debugAxis);
  }

  update(deltaframe){
  }


}
