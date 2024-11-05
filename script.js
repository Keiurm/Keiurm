/* The MIT License (MIT) Copyright (c) 2024 Juan Fuentes
(https://codepen.io/JuanFuentes/pen/qVdBpj) Permission is hereby granted, free
of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the
following conditions: The above copyright notice and this permission notice
shall be included in all copies or substantial portions of the Software. THE
SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */
(function () {
  // window Size
  var width = window.innerWidth,
    height = window.innerHeight;
  var half_width = width / 2,
    half_height = height / 2;
  var App = {
    bg: null,
    cursor: null,
    init: function () {
      this.cursor = new Attraction(0.0875);
      this.bg = new Background();
      this.addEvents();
      this.animate();
    },
    addEvents: function () {
      //for performance
      //@see https://lodash.com/docs/4.17.4#throttle
      var _resize = _.throttle(this.onResizeWindow, 350);
      window.addEventListener("resize", _resize.bind(this), false);
    },
    onResizeWindow: function () {
      width = window.innerWidth;
      height = window.innerHeight;
      half_width = width / 2;
      half_height = height / 2;
      this.bg.resize();
    },
    animate: function () {
      requestAnimationFrame(this.animate.bind(this));
      this.render();
    },
    render: function () {
      this.cursor.update();
      this.bg.light(this.cursor);
      this.bg.noise();
    },
  };

  var Attraction = function (coefficient) {
    this.forces = [];
    //center is default position
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.attract = null;
    this.friction = coefficient || 0.15;
    this.mouse_x = 1;
    this.mouse_y = 1;
    this.init = function () {
      var _throttle = _.throttle(this.onMouseMove, 50);
      document.addEventListener("mousemove", _throttle.bind(this), false);
    };
    this.onMouseMove = function (event) {
      this.mouse_x = event.clientX;
      this.mouse_y = event.clientY;
    };
    this.update = function () {
      this.x += (this.mouse_x - this.x) * this.friction;
      this.y += (this.mouse_y - this.y) * this.friction;
    };
    this.init();
    return this;
  };

  var Background = function () {
    this.canvas = null;
    this.tileCanvas = null;
    this.tileContext = null;
    this.colors = ["#21253b", "#0f1116"];
    this.tileSize = 200; //Tile size for noise
    this.init = function () {
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      //
      this.tileCanvas = document.createElement("canvas");
      this.tileCanvas.width = this.tileSize;
      this.tileCanvas.height = this.tileSize;
      this.tileContext = this.tileCanvas.getContext("2d");
      document.body.appendChild(this.canvas);
      this.resize();
    };
    this.resize = function () {
      this.canvas.width = width;
      this.canvas.height = height;
    };
    this.light = function (cursor) {
      this.context.clearRect(0, 0, width, height);
      // x0, y0, r0, x1, y1, r1
      var gradient = this.context.createRadialGradient(
        cursor.x,
        cursor.y,
        0,
        half_width,
        half_height,
        half_width * 1.5
      );
      gradient.addColorStop(0.0, this.colors[0]);
      gradient.addColorStop(0.3, this.colors[1]);
      // draw
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, width, height);
      this.context.globalAlpha = 1;
    };
    this.noise = function () {
      this.context.save();
      this.pixels = new ImageData(this.tileSize, this.tileSize);
      for (var i = 0; i < this.pixels.data.length; i += 4) {
        var rand = Math.random() * 160;
        this.pixels.data[i] = rand;
        this.pixels.data[i + 1] = rand;
        this.pixels.data[i + 2] = rand;
        this.pixels.data[i + 3] = 255;
      }
      var _width = this.canvas.width / this.tileSize + 1;
      var _height = this.canvas.height / this.tileSize;
      this.tileContext.putImageData(this.pixels, 0, 0);
      this.context.globalAlpha = 0.075;
      for (var x = 0; x < _width; x++) {
        for (var y = 0; y < _height; y++) {
          var _x = x * this.tileSize - (y % 2 === 0 ? this.tileSize / 2 : 0),
            _y = y * this.tileSize;
          this.context.drawImage(
            this.tileCanvas,
            _x,
            _y,
            this.tileSize,
            this.tileSize
          );
        }
      }
      this.context.restore();
    };
    this.init();
    return this;
  };
  App.init();
}).call(this);
