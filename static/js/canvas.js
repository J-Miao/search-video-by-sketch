/**
 * Created by J-Miao on 4/3/16.
 */

var canvas;
var backCanvas;
var context = [null, null];
var paint;
var current_layer = 1;
var isEraser;
var sketchSlider;
var backSlider;
var eraserSlider;
var backgroundColor = "#ff0000";

function getPictures(searchTag) {
  $.ajax({
    type: "POST",
    url: "/get_pictures",
    data: {
      tag: searchTag
    }
  }).done(function(res) {
    console.log(res);
    for (var i = 0; i < res["pictures"].length; i++) {
      $("#image-match-" + i).removeClass("hidden");
      $("#image-match-" + i + " > a > img").attr("src", "data:image/png;base64," + res["pictures"][i]["pic"]);
      //$("#image-match-" + i + " .image-tag").text(res["pictures"][i]["tag"]);
    }
  });
}

$(document).ready(function() {

  //$('.grid').masonry({
  //  itemSelector: '.grid-item',
  //  columnWidth: 110,
  //  animate: true,
  //  animationOptions: {
  //    duration: 700,
  //    queue: true
  //  }
  //});

  $('#image-results').waterfall({
    itemCls: 'image-item',
    colWidth: 150,
    gutterWidth: 15,
    gutterHeight: 15,
    fitWidth: false,
    checkImagesLoaded: false
  });

  $("#background-color").on("change", function() {
    console.log(this.jscolor);
    backgroundColor = "#" + this.jscolor;
  });

  $("#sketch-results a img").click(function() {
    console.log($(this)[0]);
    var tempImg = new Image();
    tempImg.src = $(this)[0].src;
    context[1].drawImage(tempImg, 0, 0, backCanvas.width,backCanvas.height);
    getPictures($($(this)[0]).attr("tag"));
    saveCanvas();
  });

  $(".sketch-type.dropdown-menu li a").click(function(){
    var selText = $(this).text();
    console.log($.trim(selText));
    $(this).parents().find('.sketch-type.dropdown-toggle').html(selText+' <span class="caret"></span>');
    if ($.trim(selText) === "Draw sketch") {
      isEraser = 0;
      current_layer = 1;
    }
    else {
      if ($.trim(selText) === "Draw background") {
        isEraser = 0;
        current_layer = 0;
      }
      else {
        if ($.trim(selText === "Eraser")) {
          current_layer = 1;
          isEraser = 1;
        }
      }
    }
  });
  $('ul.dropdown-menu.not-close-dropdown-menu').on('click', function(event){
    event.stopPropagation();
  });

  sketchSlider = new Slider('#sketch-width-slider', {
      formatter: function (value) {
          return 'Current value: ' + value;
      }
  });
  backSlider = new Slider('#background-width-slider', {
      formatter: function (value) {
          return 'Current value: ' + value;
      }
  });
  eraserSlider = new Slider('#eraser-width-slider', {
      formatter: function (value) {
          return 'Current value: ' + value;
      }
  });
  loadSketchCanvas();
});


function saveCanvas() {
  context[0].drawImage(canvas,0,0);

  //get the current ImageData for the canvas.
  var imgData = context[0].getImageData(0,0,Math.min(backCanvas.width,backCanvas.height), Math.min(backCanvas.width,backCanvas.height));

  //store the current globalCompositeOperation
  var compositeOperation = context[0].globalCompositeOperation;

  //set to draw behind current content
  context[0].globalCompositeOperation = "destination-over";

  //set background color
  context[0].fillStyle = "#FFFFFF";

  //draw background / rect on entire canvas
  context[0].fillRect(0,0,backCanvas.width, backCanvas.height);

  var canvasData = backCanvas.toDataURL("image/png");
  //delete "data:image/png;base64,"
  canvasData = canvasData.substring(22);
  console.log(canvasData);
  //clear the canvas
  context[0].clearRect(0,0,backCanvas.width, backCanvas.height);
  //restore it with original / cached ImageData
  context[0].putImageData(imgData, 0,0);

  //reset the globalCompositeOperation to what it was
  context[0].globalCompositeOperation = compositeOperation;

  $.ajax({
    type: "POST",
    url: "/get_sketches",
    data: {
      sketch: canvasData
    }
  }).done(function(res) {
    console.log(res);
    for (var i = 0; i < res["sketches"].length; i++) {
      $("#sketch-match-" + i).removeClass("hidden");
      $("#sketch-match-" + i + " > a > img").attr("src", res["sketches"][i]["img_url"]);
      $("#sketch-match-" + i + " > a > img").attr("tag", res["sketches"][i]["tag"]);
      $("#sketch-match-" + i + " .sketch-tag").text(res["sketches"][i]["tag"]);
    }
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
  if (isEraser) {
    redraw(1 - current_layer, x - this.offsetLeft, y - 9 - this.offsetTop-$('#navbar').height());
    //redraw(1 - current_layer, x - 16 -this.offsetLeft, y - 9 - this.offsetTop-$('#navbar').height());
  }
  redraw(current_layer, x - this.offsetLeft, y - 9 -this.offsetTop-$('#navbar').height());
  //redraw(current_layer, x - 16 - this.offsetLeft, y - 9 - this.offsetTop-$('#navbar').height());
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
    if (isEraser) {
      redraw(1 - current_layer, x-this.offsetLeft, y-10-this.offsetTop-$('#navbar').height());
      //redraw(1 - current_layer, x - 25, y - 10 - this.offsetTop-$('#navbar').height());
    }
    redraw(current_layer, x-this.offsetLeft, y-10-this.offsetTop-$('#navbar').height());
    //redraw(current_layer, x - 25, y - 10 - this.offsetTop-$('#navbar').height());
  }
}

function mouseUpEvent(event) {
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

    if (isEraser) {
      redraw(1 - current_layer, x - this.offsetLeft, y - 10 - this.offsetTop-$('#navbar').height());
      //redraw(1 - current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());
    }
    redraw(current_layer, x - this.offsetLeft, y - 10 - this.offsetTop-$('#navbar').height());
    //redraw(current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());

    paint = false;
    lastPostion = null;
    saveCanvas();
  }
}

function loadSketchCanvas() {
  canvas = document.getElementById('canvas');
  backCanvas = document.getElementById('canvas-color');
  context[0] = backCanvas.getContext("2d");
  context[1] = canvas.getContext("2d");

  canvas.width = $('#canvas-wrapper').width() * 0.98;
  canvas.height = $('#canvas-wrapper').height();
  backCanvas.width = $('#canvas-wrapper').width() * 0.98;
  backCanvas.height = $('#canvas-wrapper').height();
  //  //
    //canvas.width = 600;
    //canvas.height = 400;

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

  isEraser = false;

  context[0].strokeStyle = "black";
  context[0].lineJoin = "round";
  context[0].lineWidth = backSlider.getValue();

  context[1].strokeStyle = "black";
  context[1].lineJoin = "round";
  context[1].lineWidth = sketchSlider.getValue();
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

  context[0].clearRect(0, 0, context[0].canvas.width, context[0].canvas.height);
  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  clickEraser = new Array();

  isEraser = false;
  $("#name").text("sketch name");
  //document.getElementById("change").innerHTML = "eraser";
}

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  clickEraser.push(isEraser);
}

function redraw(idx, x, y) {
  if (isEraser) {
    context[idx].globalCompositeOperation = "destination-out";
  } else {
    context[idx].globalCompositeOperation = "source-over";
  }
  //console.log(isEraser, idx, current_layer);
  context[idx].beginPath();
  if (!isEraser) {
    if (idx === 1) {
      context[idx].strokeStyle = "black";
    }
    else {
      console.log(backgroundColor);
      context[idx].strokeStyle = backgroundColor;
    }
    context[idx].lineJoin = "round";
    context[idx].lineWidth =  idx==1 ? sketchSlider.getValue(): backSlider.getValue();
  }
  else {
    context[idx].strokeStyle = "white";
    context[idx].lineJoin = "round";
    context[idx].lineWidth =  eraserSlider.getValue();
  }

  if (lastPostion) {
    context[idx].moveTo(lastPostion[0], lastPostion[1]);
    context[idx].lineTo(x, y);
  }

  context[idx].closePath();
  context[idx].stroke();

  if (idx === current_layer) lastPostion = [x, y];
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
