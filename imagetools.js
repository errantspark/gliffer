var Orb = {};

Orb.getInfo = function(imagedata){
  var rawsize=imagedata.data.length/1024;
  console.log("raw size: "+rawsize+"kb");  
  console.log("width:    "+imagedata.width)
  console.log("height:   "+imagedata.height)
}

Orb.getPxi = function(x,y,w){
  return (x-1)*4+(y-1)*w*4;
}
  
function ImageData() {
  var i = 0;
  var f = false;
  if(arguments[0] instanceof Uint8ClampedArray || arguments[0] instanceof Uint8Array  ) {
    var data = arguments[i++];
    f = true;
  }
  var width = arguments[i++];
  var height = arguments[i];      

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(width, height);
  if (f) imageData.data.set(data);
  return imageData;
}
