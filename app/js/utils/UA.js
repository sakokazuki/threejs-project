
class UA{

  constructor(){
    this.spMaxWidth = 414;
    if(window.innerWidth > this.spMaxWidth){
      this.isPC = true;
    }else{
      this.isPC = false;
    }

    // if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
    //   this.isPC = false;
    // }else{
    //   this.isPC = true;
    // }
  }

  IsPC(){
    if(window.innerWidth > this.spMaxWidth){
      return true;
    }else{
      return false;
    }
  }
}

const ua = new UA();
export default ua;
