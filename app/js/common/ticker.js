import EventEmitter from 'wolfy87-eventemitter'

class Ticker extends EventEmitter{
  constructor(){
    
    super();
  }

  init(){
    this.timer = 0;
    this.fps = 30;
  }


  update(deltaTime){
    const sec = 1.0/this.fps;
    if(this.timer > sec){
      const frameStep = parseInt(this.timer/sec);
      this.emit('update', frameStep);

      this.timer -= sec*frameStep;

    }
    this.timer += deltaTime;
  }
}

export default new Ticker();