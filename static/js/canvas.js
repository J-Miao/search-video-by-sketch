/**
 * Created by J-Miao on 4/3/16.
 */

var canvas;
var backCanvas;
var tempCanvas;
var tempContext;
var context = [null, null];
var paint;
var current_layer = 1;
var isEraser;
var isSelecting = false;
var sketchSlider;
var backSlider;
var eraserSlider;
var backgroundColor = "#ff0000";

function getPictures(searchTag, imgSrc) {
  console.log(searchTag, imgSrc);
  $.ajax({
    type: "POST",
    url: "/get_pictures",
    data: {
      tag: searchTag,
      sketch_filepath: imgSrc
    }
  }).done(function(res) {
    console.log(res);
    for (var i = 0; i < 20; i++) {
      $("#image-match-" + i).addClass("hidden");
      $("#image-match-" + i + " > a > img").attr("src", "");
    }
    for (var i = 0; i < res["pictures"].length; i++) {
      $("#image-match-" + i).removeClass("hidden");
      $("#image-match-" + i + " > a > img").attr("src", "data:image/png;base64," + res["pictures"][i]["pic"]);
      $("#image-match-" + i).draggable({
        helper: "clone",
        //revert: "invalid",
        //stack: ".droppable",
        //snap: ".droppable"
      });
      //$("#image-match-" + i + " .image-tag").text(res["pictures"][i]["tag"]);
    }
      var imgRes = $("#image-results");

    //imgRes.imagesLoaded(function () {
        imgRes.pinto({
            itemWidth:150,
            gapX:10,
            gapY:10
        });
    //});
  });
}

function search() {
  var canvasData = canvas.toDataURL("image/png");
  //delete "data:image/png;base64,"
  canvasData = canvasData.substring(22);
  getPictures("", "");
}

function loadPicture2Canvas(img) {
  var tempImg = new Image();
  tempImg.src = $(img)[0].src;
  console.log(tempImg);
  context[0].clearRect(0, 0, context[0].canvas.width, context[0].canvas.height);
  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  //clearCanvas();

  var ww = backCanvas.width;
  var hh = backCanvas.width / $(img).width() * $(img).height();
  if (hh > backCanvas.height) {
    hh = backCanvas.height;
    ww = backCanvas.height / $(img).height() * $(img).width();
  }
  console.log(ww, hh);
  context[0].drawImage(tempImg, 0, 0, ww, hh);
}

var mouseX = 0, mouseY = 0;
var mousePressed = false;

function loadSketch2Canvas(img, xx, yy) {
  var tempImg = new Image();
  tempImg.src = $(img)[0].src;
  console.log(tempImg);
  //console.log($(img)[0].src);
  //var pattern = context[1].createPattern(tempImg, 'repeat');
  //context[1].fillStyle = pattern;
  //console.log($(img)[0].width, $(img)[0].height)
  //context[1].fillRect(0, 0, $(img)[0].width, $(img)[0].height);
  addRect(xx, yy, 100, 100, tempImg);
  //addRect(xx, yy, $(img)[0].width, $(img)[0].height, tempImg);
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
    $("#canvas-wrapper").droppable({
      drop: function(event, ui) {
        console.log(event);
        console.log($($(ui)[0].draggable[0]));
        if ($($(ui)[0].draggable[0]).hasClass('image-match')) {
          loadPicture2Canvas($($(ui)[0].draggable[0]).find('img'));
        }
        else {
          var xx, yy;
          if (device) {
            var touch = event.originalEvent.targetTouches[0];
            xx = touch.pageX;
            yy = touch.pageY
          } else {
            xx = event.clientX;
            yy = event.clientY
          }
          loadSketch2Canvas($($(ui)[0].draggable[0]).find('img'), xx, yy);
        }

      }
    });


  $("#background-color").on("change", function() {
    console.log(this.jscolor);
    backgroundColor = "#" + this.jscolor;
  });

  $("#sketch-results a img").click(function() {
    var tempImg = new Image();
    tempImg.src = $(this)[0].src;
    context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
    //clearCanvas();
    context[1].drawImage(tempImg, 0, 0, Math.min(backCanvas.width,backCanvas.height), Math.min(backCanvas.width,backCanvas.height));
    console.log(tempImg);
    var imgd = context[1].getImageData(0, 0, Math.min(backCanvas.width,backCanvas.height), Math.min(backCanvas.width,backCanvas.height));
    var pix = imgd.data;
    console.log(canvas.toDataURL("image/png"));
    context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
    console.log(pix);
    var newColor = {r:0,g:0,b:0, a:0};
    var replaceCnt = 0;
    for (var i = 0, n = pix.length; i <n; i += 4) {
      var r = pix[i],
        g = pix[i+1],
        b = pix[i+2];

      // If its white then change it
      if(r >= 200 && g >= 200 && b >= 200){
        // Change the white to whatever.
        pix[i] = newColor.r;
        pix[i+1] = newColor.g;
        pix[i+2] = newColor.b;
        pix[i+3] = newColor.a;
        replaceCnt += 1;
      }
    }
    console.log(replaceCnt);

    context[1].putImageData(imgd, 0, 0);
    console.log(canvas.toDataURL("image/png"));

    getPictures($($(this)[0]).attr("tag"), $(this)[0].src);
    saveCanvas();
  });

  $(".sketch-type.dropdown-menu li a").click(function(){
    var selText = $(this).text();
    $(this).parents().find('.sketch-type.dropdown-toggle').html(selText+' <span class="caret"></span>');
    if ($.trim(selText) === "Draw sketch") {
      isEraser = 0;
      current_layer = 1;
      isSelecting = 0;
    }
    else {
      if ($.trim(selText) === "Draw background") {
        isEraser = 0;
        current_layer = 0;
        isSelecting = 0;
      }
      else {
        if ($.trim(selText) === "Eraser") {
          current_layer = 1;
          isEraser = 1;
          isSelecting = 0;
        }
        else {
          if ($.trim(selText) === "Select") {
            current_layer = 1;
            isEraser = 0;
            isSelecting = 1;
          }
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
  //get the current ImageData for the canvas.
  var imgData = context[1].getImageData(0,0,canvas.width,canvas.height);

  // context[1].drawImage(canvas,0,0);
  //store the current globalCompositeOperation
  var compositeOperation = context[1].globalCompositeOperation;

  //set to draw behind current content
  context[1].globalCompositeOperation = "destination-over";

  //set background color
  context[1].fillStyle = "#FFFFFF";

  //draw background / rect on entire canvas
  context[1].fillRect(0,0,canvas.width, canvas.height);

  var canvasData = canvas.toDataURL("image/png");
  //delete "data:image/png;base64,"
  canvasData = canvasData.substring(22);
  console.log(canvasData);
  //clear the canvas
  context[1].clearRect(0,0,canvas.width, canvas.height);
  //restore it with original / cached ImageData
  context[1].putImageData(imgData, 0,0);

  //reset the globalCompositeOperation to what it was
  context[1].globalCompositeOperation = compositeOperation;

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
      $("#sketch-match-" + i).draggable({
        helper: "clone"
      });
    }
    init2();
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

  if (isSelecting) {
    getMouse(event);

    //we are over a selection box
    if (expectResize !== -1) {
      isResizeDrag = true;
      return;
    }

    clear(gctx);
    var l = boxes2.length;
    for (var i = l-1; i >= 0; i--) {
      // draw shape onto ghost context
      boxes2[i].draw(gctx, 'black');

      // get image data at the mouse x,y pixel
      var imageData = gctx.getImageData(mx, my, 1, 1);
      var index = (mx + my * imageData.width) * 4;

      // if the mouse pixel exists, select and break
      if (imageData.data[3] > 0) {
        mySel = boxes2[i];
        offsetx = mx - mySel.x;
        offsety = my - mySel.y;
        mySel.x = mx - offsetx;
        mySel.y = my - offsety;
        isDrag = true;

        invalidate();
        clear(gctx);
        return;
      }

    }
    // havent returned means we have selected nothing
    mySel = null;
    // clear the ghost canvas for next time
    clear(gctx);
    // invalidate because we might need the selection border to disappear
    invalidate();
  }
  else {
    paint = true;
    mousePressed = true;
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
      redraw(1 - current_layer, x - this.offsetLeft, y - 9 - this.offsetTop - $('#navbar').height(), false);
      //redraw(1 - current_layer, x - 16 -this.offsetLeft, y - 9 - this.offsetTop-$('#navbar').height());
    }
    redraw(current_layer, x - this.offsetLeft, y - 9 - this.offsetTop - $('#navbar').height(), false);
    //redraw(current_layer, x - 16 - this.offsetLeft, y - 9 - this.offsetTop-$('#navbar').height());
    if (isEraser) {
      redraw(1, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), true);
      //redraw(1 - current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());
    }
  }
}

function mouseMoveEvent(event) {
  event.preventDefault();

  if (isSelecting) {
    if (isDrag) {
      getMouse(event);

      mySel.x = mx - offsetx;
      mySel.y = my - offsety;

      // something is changing position so we better invalidate the canvas!
      invalidate();
    } else if (isResizeDrag) {
      // time ro resize!
      var oldx = mySel.x;
      var oldy = mySel.y;

      // 0  1  2
      // 3     4
      // 5  6  7
      switch (expectResize) {
        case 0:
          mySel.x = mx;
          mySel.y = my;
          mySel.w += oldx - mx;
          mySel.h += oldy - my;
          break;
        case 1:
          mySel.y = my;
          mySel.h += oldy - my;
          break;
        case 2:
          mySel.y = my;
          mySel.w = mx - oldx;
          mySel.h += oldy - my;
          break;
        case 3:
          mySel.x = mx;
          mySel.w += oldx - mx;
          break;
        case 4:
          mySel.w = mx - oldx;
          break;
        case 5:
          mySel.x = mx;
          mySel.w += oldx - mx;
          mySel.h = my - oldy;
          break;
        case 6:
          mySel.h = my - oldy;
          break;
        case 7:
          mySel.w = mx - oldx;
          mySel.h = my - oldy;
          break;
      }

      invalidate();
    }

    getMouse(event);
    // if there's a selection see if we grabbed one of the selection handles
    if (mySel !== null && !isResizeDrag) {
      for (var i = 0; i < 8; i++) {
        // 0  1  2
        // 3     4
        // 5  6  7

        var cur = selectionHandles[i];

        // we dont need to use the ghost context because
        // selection handles will always be rectangles
        if (mx >= cur.x && mx <= cur.x + mySelBoxSize &&
            my >= cur.y && my <= cur.y + mySelBoxSize) {
          // we found one!
          expectResize = i;
          invalidate();

          switch (i) {
            case 0:
              this.style.cursor='nw-resize';
              break;
            case 1:
              this.style.cursor='n-resize';
              break;
            case 2:
              this.style.cursor='ne-resize';
              break;
            case 3:
              this.style.cursor='w-resize';
              break;
            case 4:
              this.style.cursor='e-resize';
              break;
            case 5:
              this.style.cursor='sw-resize';
              break;
            case 6:
              this.style.cursor='s-resize';
              break;
            case 7:
              this.style.cursor='se-resize';
              break;
          }
          return;
        }

      }
      // not over a selection box, return to normal
      isResizeDrag = false;
      expectResize = -1;
      this.style.cursor='auto';
    }

  }
  else {
    if (paint) {
      if (device) {
        var touch = event.originalEvent.targetTouches[0];
        x = touch.pageX;
        y = touch.pageY
      } else {
        x = event.clientX;
        y = event.clientY
      }

      mouseX = x;
      mouseY = y;
      // console.log(x, y, this.offsetLeft, this.offsetTop, $('#navbar').height());
      //redraw(x-this.offsetLeft, y-this.offsetTop);
      if (isEraser) {
        redraw(1 - current_layer, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), false);
        //redraw(1 - current_layer, x - 25, y - 10 - this.offsetTop-$('#navbar').height());
      }
      redraw(current_layer, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), false);
      //redraw(current_layer, x - 25, y - 10 - this.offsetTop-$('#navbar').height());
      if (isEraser) {
        redraw(1, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), true);
        //redraw(1 - current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());
      }
    }
  }
}

function mouseUpEvent(event) {
  event.preventDefault();
  if (isSelecting) {
    isDrag = false;
    isResizeDrag = false;
    expectResize = -1;
  }
  else {
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
        redraw(1 - current_layer, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), false);
        //redraw(1 - current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());
      }
      redraw(current_layer, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), false);

      if (isEraser) {
        redraw(1, x - this.offsetLeft, y - 10 - this.offsetTop - $('#navbar').height(), true);
        //redraw(1 - current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());
      }
      //redraw(current_layer, x - 15, y - 10 - this.offsetTop-$('#navbar').height());

      paint = false;
      lastPostion = null;
      saveCanvas();
    }
  }
}

function loadSketchCanvas() {
  canvas = document.getElementById('canvas');
  backCanvas = document.getElementById('canvas-color');
  // tempCanvas = document.getElementById('temp-canvas');
  context[0] = backCanvas.getContext("2d");
  context[1] = canvas.getContext("2d");
  // tempContext = tempCanvas.getContext("2d");

  canvas.width = $('#canvas-wrapper').width() * 0.98;
  canvas.height = $('#canvas-wrapper').height();
  backCanvas.width = $('#canvas-wrapper').width() * 0.98;
  backCanvas.height = $('#canvas-wrapper').height();
  // tempCanvas.width = $('#canvas-wrapper').width() * 0.98;
  // tempCanvas.height = $('#canvas-wrapper').height();
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

function redraw(idx, x, y, transparent) {
console.log(isSelecting, isEraser);
  if (isEraser) {
    context[idx].globalCompositeOperation = "destination-out";
  } else {
    context[idx].globalCompositeOperation = "source-over";
  }
  //context[idx].globalCompositeOperation = "source-over";
  //console.log(isEraser, idx, current_layer);
  context[idx].beginPath();
  if (!isEraser) {
    if (idx === 1) {
      context[idx].strokeStyle = "black";
    }
    else {
      context[idx].strokeStyle = backgroundColor;
    }
    context[idx].lineJoin = "round";
    context[idx].lineWidth =  idx==1 ? sketchSlider.getValue(): backSlider.getValue();
  }
  else {
    if (transparent) {
      context[idx].strokeStyle = "rgba(0,0,0,0)";
    }
    else {
      context[idx].strokeStyle = "white";
    }
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
    context[idx].globalCompositeOperation = "source-over";

}



// holds all our boxes
var boxes2 = [];

// New, holds the 8 tiny boxes that will be our selection handles
// the selection handles will be in this order:
// 0  1  2
// 3     4
// 5  6  7
var selectionHandles = [];

// Hold canvas information
var WIDTH;
var HEIGHT;
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed

var isDrag = false;
var isResizeDrag = false;
var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
var mx, my; // mouse coordinates

 // when set to true, the canvas will redraw everything
 // invalidate() just sets this to false right now
 // we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel = null;

// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#CC0000';
var mySelWidth = 2;
var mySelBoxColor = 'darkred'; // New for selection boxes
var mySelBoxSize = 6;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;


// Box object to hold data
function Box2() {
  this.x = 0;
  this.y = 0;
  this.w = 1; // default width and height?
  this.h = 1;
  this.fill = '#444444';
}

// New methods on the Box class
Box2.prototype = {
  // we used to have a solo draw function
  // but now each box is responsible for its own drawing
  // mainDraw() will call this with the normal canvas
  // myDown will call this with the ghost canvas with 'black'
  draw: function(ctx, optionalColor) {
      if (ctx === gctx) {
        ctx.fillStyle = 'black'; // always want black for the ghost canvas
      } else {
        ctx.fillStyle = this.fill;
      }

      // We can skip the drawing of elements that have moved off the screen:
      if (this.x > WIDTH || this.y > HEIGHT) return;
      if (this.x + this.w < 0 || this.y + this.h < 0) return;

      ctx.fillRect(this.x,this.y,this.w,this.h);

    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (mySel === this) {
      ctx.strokeStyle = mySelColor;
      ctx.lineWidth = mySelWidth;
      ctx.strokeRect(this.x,this.y,this.w,this.h);

      // draw the boxes

      var half = mySelBoxSize / 2;

      // 0  1  2
      // 3     4
      // 5  6  7

      // top left, middle, right
      selectionHandles[0].x = this.x-half;
      selectionHandles[0].y = this.y-half;

      selectionHandles[1].x = this.x+this.w/2-half;
      selectionHandles[1].y = this.y-half;

      selectionHandles[2].x = this.x+this.w-half;
      selectionHandles[2].y = this.y-half;

      //middle left
      selectionHandles[3].x = this.x-half;
      selectionHandles[3].y = this.y+this.h/2-half;

      //middle right
      selectionHandles[4].x = this.x+this.w-half;
      selectionHandles[4].y = this.y+this.h/2-half;

      //bottom left, middle, right
      selectionHandles[6].x = this.x+this.w/2-half;
      selectionHandles[6].y = this.y+this.h-half;

      selectionHandles[5].x = this.x-half;
      selectionHandles[5].y = this.y+this.h-half;

      selectionHandles[7].x = this.x+this.w-half;
      selectionHandles[7].y = this.y+this.h-half;


      ctx.fillStyle = mySelBoxColor;
      for (var i = 0; i < 8; i ++) {
        var cur = selectionHandles[i];
        ctx.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
      }
    }

  } // end draw

}

//Initialize a new Box, add it, and invalidate the canvas
function addRect(x, y, w, h, fillImg) {
  var rect = new Box2;
  var image = new Image();
  image.src = fillImg.src;
  image.width = w;
  image.height = h;

  var pat = context[1].createPattern(image, 'no-repeat');
  rect.x = x;
  rect.y = y;
  rect.w = w/3;
  rect.h = h/3;
  rect.fill = pat;
  boxes2.push(rect);
  invalidate();
}

function addRect2(x, y, w, h, fill) {
  var rect = new Box2;
  rect.x = x;
  rect.y = y;
  rect.w = w
  rect.h = h;
  rect.fill = fill;
  boxes2.push(rect);
  invalidate();
}

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init2() {
  HEIGHT = canvas.height;
  WIDTH = canvas.width;
  ghostcanvas = document.createElement('canvas');
  ghostcanvas.height = HEIGHT;
  ghostcanvas.width = WIDTH;
  gctx = ghostcanvas.getContext('2d');

  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.onselectstart = function () { return false; }

  // fixes mouse co-ordinate problems when there's a border or padding
  // see getMouse for more detail
  if (document.defaultView && document.defaultView.getComputedStyle) {
    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)     || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)      || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)  || 0;
  }

  // make mainDraw() fire every INTERVAL milliseconds
  setInterval(mainDraw, INTERVAL);

  // set our events. Up and down are for dragging,
  // double click is for making new boxes
  // canvas.onmousedown = myDown;
  // canvas.onmouseup = myUp;
  canvas.ondblclick = myDblClick;
  // canvas.onmousemove = myMove;

  // set up the selection handle boxes
  for (var i = 0; i < 8; i ++) {
    var rect = new Box2;
    selectionHandles.push(rect);
  }

  // add custom initialization here:


  //// add a large green rectangle
  //addRect(260, 70, 60, 65, 'rgba(0,205,0,0.7)');
  //
  //// add a green-blue rectangle
  //addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');
  //
  //// add a smaller purple rectangle
  //addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');
}


//wipes the canvas context
function clear(c) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
}

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  if (canvasValid == false) {
    clear(context[1]);

    // Add stuff you want drawn in the background all the time here

    // draw all boxes
    var l = boxes2.length;
    for (var i = 0; i < l; i++) {
      boxes2[i].draw(context[1]); // we used to call drawshape, but now each box draws itself
    }

    // Add stuff you want drawn on top all the time here

    canvasValid = true;
  }
}


// adds a new node
function myDblClick(event) {
  getMouse(event);
  // for this method width and height determine the starting X and Y, too.
  // so I left them as vars in case someone wanted to make them args for something and copy this code
  var width = 20;
  var height = 20;
  addRect2(mx - (width / 2), my - (height / 2), width, height, 'rgba(220,205,65,0.7)');
}


function invalidate() {
  canvasValid = false;
}

// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(event) {
      var element = canvas, offsetX = 0, offsetY = 0;

      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }

      // Add padding and border style widths to offset
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;

      mx = event.pageX - offsetX;
      my = event.pageY - offsetY
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();
