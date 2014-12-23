onmessage = function(msg){
  var m = msg.data;
  postMessage(m, [m.array.buffer]);
}


