import request from 'superagent';

import 'babel-polyfill';

class CancellationToken {


  constructor(parentToken = null) {
    this.isCancellationRequested = false;

    this.cancellationPromise = new Promise(resolve => {
      this.cancel = e => {
        this.isCancellationRequested = true;
        if (e) {
          resolve(e);
        } else {
          var err = new Error("cancelled");
          err.cancelled = true;
          resolve(err);
        }
      }
    });
    if (parentToken && parentToken instanceof CancellationToken) {
      parentToken.register(this.cancel);
    }
  }

  register(callback) {
    this.cancellationPromise.then(callback);
  }

  createDependentToken() {
    return new CancellationToken(this);
  }

}

class WPRequester{

  constructor(){
    this.baseUrl = "http://hoge.com/wp-json/wp/v2/";
    this.cts = {};
  }

  cancelRequest(hash){
    if(this.cts[hash] == null) return;
    this.cts[hash].cancel();
  }

  
  async request(url, hash)
  {
    try{
      const ct = new CancellationToken();
      this.cts[hash] = ct;

      const res = await this.wprequest(this.baseUrl+url ,ct)
      delete this.cts[hash];
      return res;
    }catch(e){
      delete this.cts[hash];
      if(e.cancelled){
        console.log("request cancelled");
        return;
      }
      console.error(e); 
    }
  }


  async wprequest(url, cancellationToken = null){
    return new Promise((resolve, reject) => {
      request.get(url)
        .end((err, res) => 
        {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      if (cancellationToken) {
        cancellationToken.register(reject);
      }
    }).catch((e)=>{
      console.log(e);
    });
  }

  // async request(directory){
  //   return this.wprequest(this.baseUrl+directory);
  // }

  // async wprequest(url){

  //   try {
  //     const response = await request.get(url);

  //     return response.body;

  //   }catch(err){
  //     let requesthash = url.replace(this.baseUrl, "");
  //     if(requesthash.indexOf("?") != -1){
  //       requesthash = requesthash.substring(0, requesthash.indexOf("?"));
  //     }
  //     console.error(err);
  //     switch(requesthash){
  //       case 'works/':
  //       case 'news/':
  //         return [];
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }
}

const req = new WPRequester();
export default req;