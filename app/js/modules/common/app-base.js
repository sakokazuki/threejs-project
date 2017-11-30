

export default class AppBase{

  constructor(){
    this.windowResizeFunction = ()=>{
      this.eve();
    }
  }

  eve(){
    if (this.t !== false) {
      clearTimeout(this.t);
    }
    this.t = setTimeout(()=> {
       this.resized();
    }, 200);
  }

  addWindowResizeEvent(){
    window.addEventListener("resize", this.windowResizeFunction);
  }

  removeWindowResizeEvent(){
    window.removeEventListener("resize", this.windowResizeFunction, false);
  }

  resized(){
  }

}
