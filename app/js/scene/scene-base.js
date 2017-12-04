import * as THREE from 'three'
import Ticker from 'common/ticker'

export default class SceneBase extends THREE.Scene{
  constructor(){
    super();
    this.camera;

    Ticker.on('update', this.update.bind(this))
  }

  getRenderPass(){
    if(this.camera == null) return;
    const pass = new THREE.RenderPass(this, this.camera);
    pass.clear = false;
    pass.clearDepth = true;
    return pass;
  }

  update(deltaframe){

  }
}
