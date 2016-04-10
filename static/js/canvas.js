/**
 * Created by J-Miao on 4/3/16.
 */

/*
   Copyright 2014 zdd (zddhub.com)
mail: zddhub@gmail.com
*/

var canvas;
var context;
var paint;
var isEraser;
var mySlider;
$(document).ready(function() {

    mySlider = new Slider('#linewidth-slider', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    loadSketchCanvas();
});


function saveCanvas() {
  var canvasData = canvas.toDataURL("image/png");
  //delete "data:image/png;base64,"
  canvasData = canvasData.substring(22);
  $.ajax({
    type: "POST",
    url: "/recognize",
    data: {
      imgData: canvasData
    }
  }).done(function(sketchName) {
    console.log('sketch saved: ' + sketchName);
    if (sketchName)
      $("#name").text(sketchName);
    else
      $("#name").text('sketch name');
  });
}

var device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
var clickEvtName = device ? 'touchstart' : 'mousedown';
var moveEvtName = device ? 'touchmove' : 'mousemove';
var endEvtName = device ? 'touchend' : 'mouseup';
$(document).on(clickEvtName, '#canvas', mouseDownEvent);
$(document).on(moveEvtName, '#canvas', mouseMoveEvent);
$(document).on(endEvtName, '#canvas', mouseUpEvent);

var x, y, lastPostion = {};

function mouseDownEvent(event) {
  event.preventDefault();
  paint = true;
  if (device) {
    var touch = event.originalEvent.targetTouches[0];
    x = touch.pageX;
    y = touch.pageY
  } else {
    x = event.clientX;
    y = event.clientY
  }
  //redraw(x-this.offsetLeft, y-this.offsetTop);
  redraw(x-this.offsetLeft, y-this.offsetTop-$('#navbar').height());
}

function mouseMoveEvent(event) {
  event.preventDefault();
  if (paint) {
    if (device) {
      var touch = event.originalEvent.targetTouches[0];
      x = touch.pageX;
      y = touch.pageY
    } else {
      x = event.clientX;
      y = event.clientY
    }
      console.log(x, y, this.offsetLeft, this.offsetTop, $('#navbar').height());
    //redraw(x-this.offsetLeft, y-this.offsetTop);
    redraw(x-this.offsetLeft, y-this.offsetTop-$('#navbar').height());
  }
}

function mouseUpEvent(event) {
  event.preventDefault();
  if (paint) {
    paint = false;
    lastPostion = null;
    saveCanvas();
  }
}

function loadSketchCanvas() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext("2d");

  canvas.width = $('#sketch').width();
  canvas.height = $('#sketch').height();
  //  //
    //canvas.width = 600;
    //canvas.height = 400;

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

  isEraser = false;

  context.strokeStyle = "black";
  context.lineJoin = "round";
  context.lineWidth = mySlider.getValue();
  /*
     $('#canvas').mousedown(function(e) {
     paint = true;
     if (device) {
     var touch = event.originalEvent.targetTouches[0];
     var x = touch.pageX;
     var y = touch.pageY;
     addClick(touch.pageX - this.offsetLeft, touch.pageY - this.offsetTop);
     } else {

     addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
     }
     redraw();
     });

     $('#canvas').mousemove(function(e) {
     if(paint) {
     if (device) {
     var touch = event.originalEvent.targetTouches[0];
     var x = touch.pageX;
     var y = touch.pageY;
     addClick(touch.pageX - this.offsetLeft, touch.pageY - this.offsetTop);
     } else {

     addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
     }

     redraw();
     }

     });

     $('#canvas').mouseleave(function(e) {
     paint = false;
     });

     $('#canvas').mouseup(function(e) {
     paint = false;
     saveCanvas();
     });
     */
}

function changePen() {
  isEraser = !isEraser;
  if(isEraser) {
    document.getElementById("change").innerHTML = "pen";
  }
  else {
    document.getElementById("change").innerHTML = "eraser";
  }
}

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickEraser = new Array();

//save in server

function clearCanvas() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  clickEraser = new Array();

  isEraser = false;
  $("#name").text("sketch name");
  document.getElementById("change").innerHTML = "eraser";
}

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  clickEraser.push(isEraser);
}

function redraw(x, y) {
  if (isEraser) {
    context.globalCompositeOperation = "destination-out";
  } else {
    context.globalCompositeOperation = "source-over";
  }
  context.beginPath();
  if (!isEraser) {
    context.strokeStyle = "black";
    context.lineJoin = "round";
    context.lineWidth =  mySlider.getValue();
  }
  else {
    context.strokeStyle = "white";
    context.lineJoin = "round";
    context.lineWidth =  2*mySlider.getValue();
;
  }

  if (lastPostion) {
    context.moveTo(lastPostion[0], lastPostion[1]);
    context.lineTo(x, y);
  }

  context.closePath();
  context.stroke();

  lastPostion = [x, y];
  /*
     for(var i = 0; i < clickX.length; i++) {
     context.beginPath();

     if(!clickEraser[i]) {
     context.strokeStyle = "black";
     context.lineJoin = "round";
     context.lineWidth = 3;
     }
     else
     {
     context.strokeStyle = "white";
     context.lineJoin = "round";
     context.lineWidth = 9;
     }

     if(clickDrag[i] && i) {
     context.moveTo(clickX[i-1], clickY[i-1]);
     }
     else {
     context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
     }
     */
}