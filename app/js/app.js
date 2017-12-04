import $ from 'jquery'
import 'babel-polyfill'
import SceneManager from 'scene/scene-manager'


class App{
  constructor(){
    console.log("app ready");
    console.log("env: "+ENV.env);

    SceneManager.createScene();
  }


}

$(document).ready(()=>{
  const app = new App();
});


