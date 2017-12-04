import $ from 'jquery'

//three classes
import * as THREE from 'three'
import Stats from 'stats-js'
import dat from 'three-extras/libs/dat.gui.min.js'
import EffectComposer from 'imports-loader?THREE=three!exports-loader?THREE.EffectComposer!three-extras/postprocessing/EffectComposer'
import ClearPass from 'imports-loader?THREE=three!exports-loader?THREE.ClearPass!three-extras/postprocessing/ClearPass'
import RenderPass from 'imports-loader?THREE=three!exports-loader?THREE.RenderPass!three-extras/postprocessing/RenderPass'
import CopyShader from 'imports-loader?THREE=three!exports-loader?THREE.CopyShader!three-extras/shaders/CopyShader'
import ShaderPass from 'imports-loader?THREE=three!exports-loader?THREE.ShaderPass!three-extras/postprocessing/ShaderPass'
import OrbitControls from 'imports-loader?THREE=three!exports-loader?THREE.OrbitControls!three-extras/controls/OrbitControls'
//original
import AppBase from 'common/app-base'
import Ticker from 'common/ticker'
import TestScene from 'scene/test-scene'
import GUIManager from 'gui/gui-manager'

class SceneManager extends AppBase{
  constructor(){
    super();
    this.isLoadCompleted = false;
    this.minWidth = 1280;

    this.testscene = new TestScene();




  }

  createScene(renderPasses){
    Ticker.init();

    this.addWindowResizeEvent();
    const appElem = document.getElementById('app');

    //レンダラーとか画面サイズとか
    this.width = 1600;
    this.height = 900;
    this.aspect = 16/9;
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer();
    this.setRendererSize();
    this.renderer.setClearColor (0xffffff, 1);
    this.renderer.autoClear = false;
    appElem.appendChild(this.renderer.domElement);

    //render compose
    this.composer = new THREE.EffectComposer(this.renderer);
    const clearPass = new THREE.ClearPass('black', 1);
    this.composer.addPass(clearPass);

    //core
    this.composer.addPass(this.testscene.getRenderPass());

    const copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;
    this.composer.addPass(copyPass);

    this.stats = new Stats();
    document.body.appendChild(this.stats.domElement);

    this.guiParam = {
      debugCam: false,
      reverseColor: false
    };
    this.guiParam2 = {
      hoge: 0
    };
    // setTimeout(()=>{
    //   gui.remove(item)
    // }, 3000)

    // var gui = new dat.GUI();
    // gui.add(this.guiParam, "debugCam");
    // var item = gui.add(this.guiParam, "reverseColor")
    // gui.add(this.guiParam2, "hoge")
    // gui.open();

    const controls = new THREE.OrbitControls(this.testscene.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0 );
    controls.update();

    this.animate();
  }

  resized(){
    this.setRendererSize();
  }

  setRendererSize(){
    const ww = Math.max(window.innerWidth, this.minWidth);
    const wh = window.innerHeight;

    const ratio = ww/wh > this.aspect ? ww/this.width : wh/this.height;
    this.width = this.width*ratio;
    this.height = this.height*ratio;
    this.renderer.setSize(this.width, this.height);

    $(this.renderer.domElement).css({
      "margin-left": -this.width/2,
      "margin-top": -this.height/2,
      "left": "50%",
      "top": "50%",
      "position": "absolute"
    });
  }

  animate() {
    const loop = ()=>{
      Ticker.update(this.clock.getDelta());
      this.renderer.clear();
      this.renderer.setViewport(0, 0, this.width, this.height);

      this.stats.update();
      this.composer.render();
      requestAnimationFrame( loop );
      // console.log(this.guiParam);
    }
    loop();
  }
}

const SM = new SceneManager();
export default SM;
