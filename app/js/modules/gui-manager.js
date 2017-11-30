import dat from 'three-extras/libs/dat.gui.min.js'

import Tweakpane from 'tweakpane'
import TweakpaneCSS from 'tweakpane/dst/tweakpane.css'

class GUIManager{
  constructor(){
    this.panes = new Object();
    this.injectedCss();
    this.paneWidth = 200;

    //以下動作テスト
    //パラメータをObject形式で渡す(2階層目はfolderになり3階層目はエラー)
    //もしくは Tweakpaneをそのまま渡す(button使いたいとかイベント使いたいとき外部で作りたいときなど)
    var params = {
      speed: 0.5,
      keyColor: '#00ff00',
      bool: true,
      test: {
        a: 0.0,
        b: 1.0
      }
    };
    this.add("test", params)

    var params = {
      speed: 0.5
    };
    var pane = new Tweakpane();
    pane.addControl(params, 'speed');
    this.addPane("test2", pane);

    //remove
    setTimeout(()=>{
      this.remove("test");
    }, 4000);
  }

  injectedCss(){
    const injected = document.createElement('style');
    injected.type = 'text/css';
    injected.innerHTML = TweakpaneCSS;
    const head = document.getElementsByTagName('head')[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }

  cssobjToString(styleobj){
    let css = ""
    for(var key in styleobj){
      css += key + ":" + styleobj[key] + ";";
    };
    return css;
  }

  add(id, params, style){
    const pane = new Tweakpane();
    this.addControlls(pane, params);
    this.addPane(id, pane, style);
  }

  addPane(id, pane, style){
    const rootElem = pane.view_.elem_.parentNode;
    rootElem.style = this.createStyle(style);
    this.panes[id] = pane;
  }

  addControlls(pane, params){
    for(var key in params){
      const type = typeof(params[key]);
      if(type=="object"){
        const folder = pane.addFolder(key);
        this.addControlls(folder, params[key]);
      }else{
        pane.addControl(params, key);
      }
    };
  }

  createStyle(style){
    const defaultStyle = {width: this.paneWidth+"px", position: "absolute", right: (this.paneWidth+10)*Object.keys(this.panes).length+"px", top: "0"};
    const styleobj = style || defaultStyle;
    return this.cssobjToString(styleobj);
  }

  remove(id){
    const view = this.panes[id].view_.elem_
    document.body.removeChild(view.parentNode);
    delete this.panes[id];
    this.reposPanes();
  }

  reposPanes(){
    let count = 0;
    for(var key in this.panes){
      const r = this.panes[key].view_.elem_.parentNode;
      r.style.right = this.paneWidth*count+"px";
      count++;
    };
  }
}

export default new GUIManager();
