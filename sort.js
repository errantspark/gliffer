//CONSTANTS
var LOADTIME = performance.now();
var LOADDATE = Date.now();
console.log("we have liftoff t+0ms");
var IMG = "input.jpg";
var CORES = 2;
//
var inputImage = new Image();
inputImage.src = IMG;
inputImage.height = 128;
inputImage.width = 128;

var c = document.getElementById("canvas");

//TODO get rid of this debugging bullshit
var datz;
var ctx;

var doneemitter = function(n){
  var count = n-1;
  return function(){
    if (count === 0){
      console.log("sort took "+(performance.now()-spawntimer)+"ms");
      var sortrate = (inputImage.width*inputImage.height)/1000000/((performance.now()-spawntimer)/1000);
      console.log("sort rate was "+sortrate+" MP/s");
      for (var i=0;i<workarray.length;i++){
        for (var j=0;j<workarray[i].length;j++){
          datz.data[j+(workarray[0].length*i)] = workarray[i][j];
        }
      }
      ctx.putImageData(datz, 0,0);
      console.log("load to completion took "+(performance.now()-LOADTIME)+"ms");
   } else {
     count--;
   }
  };
};

var alldone = doneemitter(CORES);

var workers = [];
var how = [];
var workarray = [];

for (var i=0;i<CORES;i++){
  var tmp = new Worker("worker.js");
  tmp.onmessage = function(message){
    console.log("w["+message.data.count+"] returned data at  t+"+(performance.now()-LOADTIME)+"ms");
    var bufInt8 = new Uint8Array(message.data.image);
    workarray[message.data.count] = bufInt8;
    alldone();
  };
  workers.push(tmp);
}
console.log("all workers spawned t+"+(performance.now()-LOADTIME)+"ms");

var workdata = [];

//this is where the magic happens
var imageload;
var spawntimer; 
inputImage.onload = function(){
  imageload = performance.now();
  console.log("image loaded at t+"+(imageload-LOADTIME)+"ms");
  c.width = inputImage.width;
  c.height = inputImage.height;
  ctx = c.getContext("2d");

  var dawr = performance.now();
  ctx.drawImage(inputImage,-300,-200);
  console.log("drawing took "+(performance.now()-dawr)+"ms");

  var datss = performance.now();
  datz = ctx.getImageData(0,0,c.width,c.height);
  console.log("getting datz took "+(performance.now()-datss)+"ms");

  var preslice = performance.now();
  var imagearray = Array.prototype.slice.call(datz.data);
  //var imagearray = [];
  //for (var z =0;z<datz.data.length;z++){
  //    imagearray[z] = datz.data[z];
  //}
  console.log("turning the image into a regular array from a typed array took "+(performance.now()-preslice)+"ms");
  var slicesize = Math.round((inputImage.height/CORES)+0.5)*inputImage.width*4;


  spawntimer = performance.now();
  console.log("initializing data distribution subroutine *beep boop* t+"+(spawntimer-LOADTIME)+"ms");
  for (var i=0;i<CORES;i++){
    var start = performance.now();
    var sliced = imagearray.slice(i*slicesize,(i+1)*slicesize);
    workdata[i] = sliced;
    var ab = new ArrayBuffer(sliced.length);
    var bufInt8 = new Uint8Array(ab);
    for (var z =0;z<sliced.length;z++){
      bufInt8[z]= sliced[z];
    }
    var msg = {
      image: ab,
      width: inputImage.width,
      height: sliced.length/4/inputImage.width,
      count: i,
      loadtime: LOADDATE
    };
    var prepost = performance.now();
    //this crazy [] shit is a transferrable object which is faster 
    workers[i].postMessage(msg, [msg.image]);
    var end = performance.now();
    console.log("data sent to w["+i+"] at t+"+(end-LOADTIME)+"ms");
    console.log("postMessage took "+(end-prepost)+"ms and everything else was "+(prepost-start)+"ms");

  }
}
