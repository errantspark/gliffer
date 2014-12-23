var IMG = "input.jpg";
var LOADDATE = Date.now();
//
var inputImage = new Image();
inputImage.src = IMG;
inputImage.height = 256;
inputImage.width = 256;

var c = document.getElementById("canvas");

//TODO get rid of this debugging bullshit
var datz;
var ctx;
var imagedata;
var imagearray;
var barry;
//this is where the magic happens
inputImage.onload = function(){
  c.width = inputImage.width;
  c.height = inputImage.height;
  ctx = c.getContext("2d");

  ctx.drawImage(inputImage,-300,-200);
  imagedata = ctx.getImageData(0,0,c.width,c.height);
  imagearray = Array.prototype.slice.call(imagedata.data);
  for(var i=0;i<imagearray.length;i++){
    if (!(i%3)){
      imagedata.data[i] = Math.round(Math.random()*255);
    }
  }

  ctx.putImageData(imagedata, 0,0);
  //TODO rewrite this shit so that it just makes a bigass array for the rescaled image
  //and then writes directly to it like random access style which will be wayy less memory huge
  var rescale = function(id, fa){
    var idd = imagedata.data;
    var arry = [];
    for (var i=0;i<id.height;i++){
      console.log("line:"+i)
      for (var n=0;n<fa;n++){
        console.log("double:"+n)
        for (var j=0;j<id.width;j++){
          var os = Orb.getPxi(j+1,i+1,id.width);
          for (var f=0;f<fa;f++){
            arry.push(idd[os],idd[os+1],idd[os+2],idd[os+3])
          }
        }
      }
    }
    barry = new Uint8Array(arry);
    var newdata = new ImageData(barry, id.width*fa, id.height*fa);
    return newdata;
  }

  var imagedata2 = rescale(imagedata, 3)

  c.width = c.width*3;
  c.height = c.height*3;
  ctx.putImageData(imagedata2, 0 ,0);
  
}

//var worker = new Worker("work.js");
//worker.onmessage = function(a){
//  console.log(Date.now()-a.data.start)
//}
//var message = {
//  array: new Uint8Array(128*128*128*128),
//  start: Date.now()
//}
//worker.postMessage(message, [message.array.buffer]);

