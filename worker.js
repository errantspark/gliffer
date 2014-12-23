var PASSES = 32;
var NOISE = 16;
var t0 = Date.now()
  onmessage = function(message){
    var start = Date.now()-message.data.loadtime;

    //i used to import the LUT from outside so I only had to calculate it once
    //but it turns out that that's actually slower somehow, maybe i'm an idiot though

    var gammalut = [];
    //here we make a linear -> 2.2 gamma LUT for 8 bit values
    for (var i = 0; i<256;i++){
      gammalut.push(Math.pow(i,2.2))
    }
    //perceptual LUT
    var rlut = gammalut.map(function(a){return a*0.2126})
      var glut = gammalut.map(function(a){return a*0.7152})
      var blut = gammalut.map(function(a){return a*0.0722})
      var lumil = function(r,g,b){
        return (rlut[r]+glut[g]+blut[b]);
      };

    var datanice = function(v){
      var real = v; 
      var mor = [];
      for (var i=0;i<real.length;i+=4)
      {
        mor.push([real[i],real[i+1],real[i+2],real[i+3]]);
      }
      return mor;
    };

    //takes an array of quadruples adds noise to each channel, clips the channels
    //to between 0 and 255 and flattens the array 
    var datanicen = function(v){
      var real = v; 
      var mor = [];
      var rnd = function(y){
        var c = NOISE;
        var hc = c/2;
        var sh = Math.round((Math.random()*c)-hc);
        var o = y+sh
          return Math.max(0, Math.min(o, 255))
          //return 0;
      }

      for (var i=0;i<real.length;i+=4)
      {
        var tm = [];
        for (var q=0;q<4;q++){
          tm[q] = rnd(real[i+q]);
        }
        mor.push(tm);
      }
      return mor;
    };

    var startTime = Date.now();
    var int8 = new Uint8Array(message.data.image);
    var sortit = function(int8a){

      var d = datanicen(int8a);
      //TODO refactor this out, legacy bullshit 
      var c = {height: message.data.height,
        width: message.data.width
      };
      var n = [];
      for (var i=0;i<c.height;i++){
        var tmp = d.slice(i*c.width,(i+1)*c.width);
        tmp.sort(function(a, b){return lumil(a[0],a[1],a[2]) - lumil(b[0],b[1],b[2])});
        //d[0] = d[0].concat(tmp)
        for (var l=0;l<tmp.length;l++){
          n.push(tmp[l]);
        };
      } 
      return n;
    }

     var avg = function(aofn, n){
      var l = aofn.length;
      var al = aofn[0].length;
      var o = [];
      //y is index in image
      for (var y=0;y<al;y++){
        //q is index in tetret
        var avg = [];
        for (var q=0;q<4;q++){
          var tet = 0;
          //x is index in array of images
          for (var x=0;x<l;x++){
            tet = tet*n + aofn[x][y][q]
          }
          avg[q] = Math.round(tet/(1+n));
        }
        o[y] = avg;
      }
      return o;
    };

    var sorts = sortit(int8);

    for (var h=1;h<PASSES;h++){
      var hi = sortit(int8);
      sorts = avg([sorts, hi], h);
    }
    
    var n = sorts;

    var ab = new ArrayBuffer(n.length*4);
    var bufInt8 = new Uint8Array(ab);
    for (var b=0;b<n.length;b++){
      bufInt8[0+b*4] = n[b][0];
      bufInt8[1+b*4] = n[b][1];
      bufInt8[2+b*4] = n[b][2];
      bufInt8[3+b*4] = n[b][3];
    }

    var test1 = Date.now();
    console.log("w["+message.data.count+"]'s sort started at t+"+start+"ms and took "+(test1 - startTime)+"ms");
    var out = {image: ab,
      count: message.data.count
    };
    postMessage(out, [out.image]);
  }

