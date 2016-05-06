/*
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
var tagList = [];
var locList = [];
var searchMode = 'Image';
var motionDir = 0;
var draggingNewSketch = false;

function getBackground() {
  var right = 0, left = backCanvas.width;
  var bottom = 0, top = backCanvas.height;
  for (var i = 0; i < backCanvas.width; i++) {
    for (var j = 0; j < backCanvas.height; j++) {
      var p = context[0].getImageData(i, j, 1, 1).data;
      if (p[0] > 200 && p[1] > 200 && p[2] > 200) {
        continue;
      }
      if (i < left) left = i;
      if (i > right) left = i;
      if (j < top) top = j;
      if (j > bottom) bottom = j;
    }
  }

  var imgData = context[0].getImageData(left, top, right - left + 1, bottom - top + 1);
  var tempCanvas = document.createElement('canvas');
  tempCanvas.setAttribute('id', 'temp-canvas');

  var tempContext = tempCanvas.getContext('2d');
  tempCanvas.width = right - left + 1;
  tempCanvas.height = bottom - top + 1;
  tempContext.putImageData(imgData, 0, 0);

  var canvasData = tempCanvas.toDataURL("image/png");

  document.getElementById('temp-canvas').remove();
  return canvasData.substring(22);
}

function getPictures(imgSrc) {
  imgSrc = "";
  var twoDString = get2DString();

  $.ajax({
    type: "POST",
    url: "/get_pictures",
    data: {
      tag: tagList.join(),
      two_d_string_x: twoDString[0].join(),
      two_d_string_y: twoDString[1].join(),
      sketch_filepath: imgSrc,
      background: getBackground()
    }
  }).done(function(res) {
    $('#image-results').empty();
    //for (var i = 0; i < 20; i++) {
    //  $("#image-match-" + i).addClass("hidden");
    //  $("#image-match-" + i + " > a > img").attr("src", "");
    //}
    console.log(res['pictures']);
    for (var i = 0; i < res["pictures"].length; i++) {
      var img = $('<img>'); //Equivalent: $(document.createElement('img'))
      img.attr('src', res["pictures"][i]["pic"]);
      var newA = $('<a/>', {href: '#', class:'thumbnail'});
      img.appendTo(newA);
      var newDiv =  $('<div/>', {id: 'image-match-'+i, class: 'pinto image-match'});
      newA.appendTo(newDiv);
      newDiv.appendTo('#image-results');

      //$("#image-match-" + i).removeClass("hidden");
      //$("#image-match-" + i + " > a > img").attr("src", res["pictures"][i]["pic"]);
      //$("#image-match-" + i).css("display","block");
      $("#image-match-" + i).draggable({
        helper: "clone",
        //revert: "invalid",
        //stack: ".droppable",
        //snap: ".droppable"
      });
      //$("#image-match-" + i + " .image-tag").text(res["pictures"][i]["tag"]);
    }
    //var imgRes = $("#image-results");

     $("#image-results").imagesLoaded(function () {
         $("#image-results").pinto({
            itemWidth: $('#result-wrapper').width() / 3 - 30,
            gapX:10,
            gapY:10
        });
    });
  });
}

function getVideos() {
  var twoDString = get2DString();
/*
  $.ajax({
    type: "POST",
    url: "/get_videos",
    data: {
      tag: tagList.join(),
      two_d_string_x: twoDString[0].join(),
      two_d_string_y: twoDString[1].join(),
      sketch_filepath: "",
      background: getBackground()
    }
  }).done(function(res) {
    for (var i = 0; i < 20; i++) {
      $("#video-match-" + i).addClass("hidden");
      $("#video-match-" + i + " > a > video").attr("src", "");
    }
    for (var i = 0; i < res["videos"].length; i++) {
      $("#video-match-" + i).removeClass("hidden");
      $("#video-match-" + i + " > a > video").attr("src", res["videos"][i]["src"]);
      //$("#video-match-" + i).draggable({
      //  helper: "clone",
      //  //revert: "invalid",
      //  //stack: ".droppable",
      //  //snap: ".droppable"
      //});
      //$("#image-match-" + i + " .image-tag").text(res["pictures"][i]["tag"]);
    }
    //var imgRes = $("#image-results");
    //
    ////imgRes.imagesLoaded(function () {
    //    imgRes.pinto({
    //        itemWidth:150,
    //        gapX:10,
    //        gapY:10
    //    });
    ////});
  });*/
  $('#video-match-v-' + 0).attr('src', '');
  $('#video-results').empty();
  var v = $('<video/>', {
    src: 'static/videos/black-shot-2.mp4',
    id: 'video-match-v-' + 0,
    type: 'video/mp4',
    controls: true
  });
  v.css('width', '100%');
  v.css('height', '100%');
  var newA = $('<a/>', {href: '#', class:'thumbnail'});
  v.appendTo(newA);
  var newDiv =  $('<div/>', {id: 'video-match-'+0, class: 'video-match '});
  newA.appendTo(newDiv);
  newDiv.appendTo('#video-results');
      //$("#image-match-" + i).removeClass("hidden");
      //$("#image-match-" + i + " > a > img").attr("src", res["pictures"][i]["pic"]);
      //$("#image-match-" + i).css("display","block");
      $("#video-match-" + 0).draggable({
        helper: "clone",
        //revert: "invalid",
        //stack: ".droppable",
        //snap: ".droppable"
      });
  //$("#video-match-" + 0).removeClass("hidden");
  //$("#video-match-" + i + " > a > video").attr("src", res["videos"][i]["src"]);
}


function search() {
  if (searchMode === 'Image') {
    getPictures();
  }
  else {
    if (searchMode === 'Video') {
      getVideos();
    }
  }

}


function get2DString() {
  var xList = [], yList = [];
  for (var i = 0; i < tagList.length; i++) {
    var o = $('#selected-sketch-' + i).offset();
    var w = $('#selected-sketch-' + i).width();
    var h = $('#selected-sketch-' + i).height();
    xList.push([tagList[i], o.left]);
    xList.push([tagList[i], o.left + w]);
    yList.push([tagList[i], o.top]);
    yList.push([tagList[i], o.top + h]);
  }

  xList.sort(function(a, b) {
    return a[1] - b[1];
  });
  yList.sort(function(a, b) {
    return b[1] - a[1];
  });
  console.log(xList);
  console.log(yList);
  return [xList.map(function(d) {
    return d[0];
  }), yList.map(function(d) {
    return d[0];
  })];
}


function loadPicture2Canvas(img) {
  var tempImg = new Image();
  tempImg.src = $(img)[0].src;
  context[0].clearRect(0, 0, context[0].canvas.width, context[0].canvas.height);
  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  //clearCanvas();

  var ww = backCanvas.width;
  var hh = backCanvas.width / $(img).width() * $(img).height();
  if (hh > backCanvas.height) {
    hh = backCanvas.height;
    ww = backCanvas.height / $(img).height() * $(img).width();
  }
  context[0].drawImage(tempImg, 0, 0, ww, hh);
}


function loadVideo2Canvas(v) {
console.log(v);
  console.log($(v).attr('id'));
  context[0].clearRect(0, 0, context[0].canvas.width, context[0].canvas.height);
  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  //clearCanvas();
  var tempVideo = document.getElementById($(v).attr('id'));
console.log(tempVideo.width, tempVideo.height);
  var ww = backCanvas.width;
  var hh = backCanvas.width / $(v).width() * $(v).height();
  if (hh > backCanvas.height) {
    hh = backCanvas.height;
    ww = backCanvas.height / $(v).height() * $(v).width();
  }
console.log(ww, hh);
  context[0].drawImage(tempVideo, 0, 0, ww, hh);
}


var mouseX = 0, mouseY = 0;
var mousePressed = false;

//function loadSketch2Canvas(img, xx, yy) {
//  var tempImg = new Image();
//  tempImg.src = $(img)[0].src;
//  console.log(tempImg);
//  //console.log($(img)[0].src);
//  //var pattern = context[1].createPattern(tempImg, 'repeat');
//  //context[1].fillStyle = pattern;
//  //console.log($(img)[0].width, $(img)[0].height)
//  //context[1].fillRect(0, 0, $(img)[0].width, $(img)[0].height);
//  addRect(xx, yy, 100, 100, tempImg);
//  //addRect(xx, yy, $(img)[0].width, $(img)[0].height, tempImg);
//}

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

  $('#switch').on('click', function () {
    if (searchMode === 'Video') {
      searchMode = 'Image';
      $(this).html('Image Mode');
      $('#video-results').addClass('hidden');
      $('#image-results').removeClass('hidden');
      $('#motion-dir-dropdown').addClass('disabled')
    }
    else {
      searchMode = 'Video';
      $(this).html('Video Mode');
      $('#image-results').addClass('hidden');
      $('#video-results').removeClass('hidden');
      $('#motion-dir-dropdown').removeClass('disabled')
    }
  })

    $("#canvas-wrapper").droppable({
      drop: function(event, ui) {

        if ($($(ui)[0].draggable[0]).hasClass('image-match')) {
          loadPicture2Canvas($($(ui)[0].draggable[0]).find('img'));
        }
        else {
          if ($($(ui)[0].draggable[0]).hasClass('video-match')) {
            //loadPicture2Canvas($($(ui)[0].draggable[0]).find('img'));
            loadVideo2Canvas($($(ui)[0].draggable[0]).find('video'));
          }
          //var xx, yy;
          //if (device) {
          //  var touch = event.originalEvent.targetTouches[0];
          //  xx = touch.pageX;
          //  yy = touch.pageY
          //} else {
          //  xx = event.clientX;
          //  yy = event.clientY
          //}
          //loadSketch2Canvas($($(ui)[0].draggable[0]).find('img'), xx, yy);
        }
      }
  });
  $("#sketch-layer").droppable({
    accept: '.sketch-match',
    drop: function (e, ui) {
      if (!draggingNewSketch) {
        return;
      }
      console.log($(ui.draggable));
      if ($(ui.draggable)[0].id != "") {
        x = ui.helper.clone();
        x.attr('id', 'selected-sketch-' + tagList.length);

        console.log($($($(ui.draggable)[0]).find('img')[0]).attr('tag'));
        tagList.push($($($(ui.draggable)[0]).find('img')[0]).attr('tag'));
        console.log(x.find('img')[0]);
        var originalSrc = $(x.find('img')[0]).attr('src');
        $(x.find('img')[0]).attr('src', originalSrc.substring(0, originalSrc.length - 4) + '_trans.png');
        x.draggable({
          helper: 'original',
          containment: '#sketch-layer',
          tolerance: 'fit'
        });
        x.resizable({
          maxHeight: 400,
          minHeight: 30,
          maxWidth: 400,
          minWidth: 30,
          handles: 'all',
          resize: function( event, ui ) {
            console.log("wocao", ui);
          }
        });
        x.on('dblclick', function() {
          console.log('hahaha');
          $(this).wrap('<div id="resizeSelector" style="dislplay:inline-block;">');
          $('#resizeSelector').draggable();
          $(this).resizable();
        });
        x.css('background-color', 'transparent');
        $(x.find('a')[0]).css('background-color', 'transparent');
        x.appendTo('#sketch-layer');
        ui.helper.remove();
      }
    }
  });


  $("#background-color").on("change", function() {

    backgroundColor = "#" + this.jscolor;
  });

  //$("#sketch-results a img").click(function() {
  //  var tempImg = new Image();
  //  tempImg.src = $(this)[0].src;
  //  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  //  //clearCanvas();
  //  context[1].drawImage(tempImg, 0, 0, Math.min(backCanvas.width,backCanvas.height), Math.min(backCanvas.width,backCanvas.height));
  //  console.log(tempImg);
  //  var imgd = context[1].getImageData(0, 0, Math.min(backCanvas.width,backCanvas.height), Math.min(backCanvas.width,backCanvas.height));
  //  var pix = imgd.data;
  //  console.log(canvas.toDataURL("image/png"));
  //  context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
  //  console.log(pix);
  //  var newColor = {r:0,g:0,b:0, a:0};
  //  var replaceCnt = 0;
  //  for (var i = 0, n = pix.length; i <n; i += 4) {
  //    var r = pix[i],
  //      g = pix[i+1],
  //      b = pix[i+2];
  //
  //    // If its white then change it
  //    if(r >= 200 && g >= 200 && b >= 200){
  //      // Change the white to whatever.
  //      pix[i] = newColor.r;
  //      pix[i+1] = newColor.g;
  //      pix[i+2] = newColor.b;
  //      pix[i+3] = newColor.a;
  //      replaceCnt += 1;
  //    }
  //  }
  //  console.log(replaceCnt);
  //
  //  context[1].putImageData(imgd, 0, 0);
  //  console.log(canvas.toDataURL("image/png"));
  //
  //  getPictures($($(this)[0]).attr("tag"), $(this)[0].src);
  //  saveCanvas();
  //});

  $(".sketch-type.dropdown-menu li a").click(function(){
    var selText = $(this).text();
    $(this).parents().find('.sketch-type.dropdown-toggle').html(selText+' <span class="caret"></span>');
    if ($.trim(selText) === "Draw sketch") {
      isEraser = 0;
      current_layer = 1;
      isSelecting = 0;
      $('#sketch-layer').css('z-index', 0);
    }
    else {
      if ($.trim(selText) === "Draw background") {
        isEraser = 0;
        current_layer = 0;
        isSelecting = 0;
        $('#sketch-layer').css('z-index', 0);
      }
      else {
        if ($.trim(selText) === "Eraser") {
          current_layer = 1;
          isEraser = 1;
          isSelecting = 0;
          $('#sketch-layer').css('z-index', 0);
        }
        else {
          if ($.trim(selText) === "Select") {
            current_layer = 1;
            isEraser = 0;
            isSelecting = 1;
            $('#sketch-layer').css('z-index', 1000);
          }
        }
      }
    }
  });


  $(".video-motion-dir.dropdown-menu li a").click(function(){
    var selText = $.trim($(this).text());
    $(this).parents().find('.video-motion-dir.dropdown-toggle').html(selText+' <span class="caret"></span>');
    switch (selText) {
      case 'Up': motionDir = 1; break;
      case 'Upper-Left': motionDir = 2; break;
      case 'Left': motionDir = 3; break;
      case 'Bottom-Left': motionDir = 4; break;
      case 'Down': motionDir = 5; break;
      case 'Bottom-Right': motionDir = 6; break;
      case 'Right': motionDir = 7; break;
      case 'Upper-Right': motionDir = 8; break;
      default:
            motionDir = 0; break;
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
    for (var i = 0; i < res["sketches"].length; i++) {
      $("#sketch-match-" + i).removeClass("hidden");
      $("#sketch-match-" + i + " > a > img").attr("src", res["sketches"][i]["img_url"]);
      $("#sketch-match-" + i + " > a > img").attr("tag", res["sketches"][i]["tag"]);
      $("#sketch-match-" + i + " .sketch-tag").text(res["sketches"][i]["tag"]);
      //$("#sketch-match-" + i).resizable({});
      $("#sketch-match-" + i).draggable({
        helper: "clone",
        cursor: 'move',
        tolerance: 'fit',
        start: function( event, ui ) {

          console.log(ui);
          draggingNewSketch = true;
          //tagList += ;
        },
        stop: function( event, ui ) {
          //$('#sketch-layer').addClass('hidden');
          context[1].clearRect(0, 0, context[1].canvas.width, context[1].canvas.height);
          draggingNewSketch = false;
        }
      });
    }
    //init2();
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
    if (current_layer == 1) {
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
  $("#sketch-layer").empty();
  tagList = [];
  //document.getElementById("change").innerHTML = "eraser";
}

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  clickEraser.push(isEraser);
}

function redraw(idx, x, y, transparent) {
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

  context[idx].globalCompositeOperation = "source-over";

}

