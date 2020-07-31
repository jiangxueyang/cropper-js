(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Cutter = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /* 数据类型 */
  function getType(value) {
    return Object.prototype.toString.call(value).toLowerCase().slice(8, -1);
  }
  /* 是否为对象 */

  function isObject(value) {
    return getType(value) === 'object';
  }
  /* 是否为函数 */

  function isFunction(value) {
    return getType(value) === 'function';
  }
  /* 是否为空 */

  function isEmpty(value) {
    return value === null || value === '' || value === undefined;
  }
  /* 是否为数值 */

  function isNumber(value) {
    return getType(value) === 'number' || /^\d+$/.test(value);
  }
  /* 打印报警，并返回false */

  function warn(tip) {
    console.error(tip);
    return false;
  }
  /* 保留小数点位数 */

  function toFixed(num) {
    var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    return Number(num.toFixed(decimal));
  }

  var _default = /*#__PURE__*/function () {
    function _default() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, _default);

      this.rotate = 0; // 旋转角度

      this.dragStatus = 0; // 拖拽状态

      this.cursorEnums = ['default', 'nw-resize', 'w-resize', 'sw-resize', 'n-resize', 's-resize', 'ne-resize', 'e-resize', 'se-resize', 'move']; // 鼠标状态

      this.cutterIsEnter = false; // 鼠标是否进入裁剪区域

      this.ropperIsDown = false; // 鼠标是否在裁剪区域按下

      this.startPos = null; // 开始坐标

      /* 默认配置 */

      this.defaultConfig = {
        cutWidth: 200,
        // 裁剪区域默认宽度，单位px
        cutHeight: 200,
        // 裁剪区域默认高度，单位px
        mincutWidth: 16,
        // 裁剪区域最小宽度，单位px
        mincutHeight: 16,
        // 裁剪区域最小高度，单位px
        maxScale: 3,
        // 图片能放大的最大倍数，相对图片原始尺寸
        minScale: 0.1,
        // 图片能缩小的最小倍数，相对图片原始尺寸
        scale: 1.2,
        // 每次放大的倍数，必须大于1，缩小为1/scale
        canMagnify: true,
        // boolean 是否可放大
        canReduce: true,
        // boolean 是否可缩小
        canRotate: true,
        // boolean 能否逆时针旋转图片
        canChangeCutSize: true,
        // boolean 能否改变裁剪区域大小，默认true
        imageSrc: '',
        // 图片资源, 必传
        containerEl: '',
        // 裁剪操作容器，图片与裁剪框将展示在这个区域，可为类名、id
        mangnifyEl: '',
        // 放大图片的dom元素，可为类名、id
        reduceEl: '',
        // 缩小图片的dom元素，可为类名、id
        cutEl: '',
        // 触发裁剪的dom元素，可为类名、id
        rotateEl: '',
        // 触发逆时针旋转的dom元素，可为类名、id
        onRender: null,
        // 渲染成功回调
        onCut: null // 裁剪成功回调

      };
      if (!this.checkConfig(config)) return;
      this.init();
    }
    /* 检查配置信息是否合法 */


    _createClass(_default, [{
      key: "checkConfig",
      value: function checkConfig(config) {
        if (isEmpty(config)) return false;
        if (!isObject(config)) return warn('配置信息格式不合法');
        var arr = ['cutWidth', 'cutHeight', 'mincutWidth', 'mincutHeight', 'maxScale', 'minScale', 'scale'];
        arr.forEach(function (key) {
          if (config.hasOwnProperty(key)) {
            config[key] = parseFloat(config[key]);
          }
        });
        config = _objectSpread2(_objectSpread2({}, this.defaultConfig), config);
        var _config = config,
            containerEl = _config.containerEl,
            mincutWidth = _config.mincutWidth,
            mincutHeight = _config.mincutHeight,
            cutWidth = _config.cutWidth,
            cutHeight = _config.cutHeight,
            maxScale = _config.maxScale,
            minScale = _config.minScale,
            canReduce = _config.canReduce,
            canMagnify = _config.canMagnify; // 判断containerEl

        if (isEmpty(containerEl)) return warn('containerEl未配置');
        var container = document.querySelector(containerEl);
        if (!container) return warn(containerEl + '的dom元素不存在');
        this.container = container; //判断mincutWidth, mincutHeight

        if (config.canChangeCutSize) {
          if (!isEmpty(mincutHeight)) {
            if (!isNumber(mincutHeight)) return warn('mincutHeight必须为数值');
            if (Number(mincutHeight) < 1) return warn('mincutHeight不能小于1');
          }

          if (!isEmpty(mincutWidth)) {
            if (!isNumber(mincutWidth)) return warn('mincutWidth必须为数值');
            if (Number(mincutWidth) < 1) return warn('mincutWidth不能小于1');
          }
        } // 判断cutWidth， cutHeight


        if (!isEmpty(cutWidth)) {
          if (!isNumber(cutWidth)) return warn('cutWidtht必须为数值');
          if (Number(cutWidth) < 1) return warn('cutWidth不能小于1');
        }

        if (!isEmpty(cutHeight)) {
          if (!isNumber(cutHeight)) return warn('cutHeight必须为数值');
          if (Number(cutHeight) < 1) return warn('cutHeight不能小于1');
        } // 判断放大缩小相关参数


        if (canMagnify) {
          if (!isEmpty(maxScale)) {
            if (!isNumber(maxScale)) return warn('maxScale必须为数值');
            if (Number(maxScale) < 1) return warn('maxScale不能小于1');
          }

          var _config2 = config,
              mangnifyEl = _config2.mangnifyEl;
          if (isEmpty(mangnifyEl)) return warn('mangnifyEl未配置');
          var mangnifyNode = document.querySelector(mangnifyEl);
          if (!mangnifyNode) return warn(mangnifyEl + '的dom元素不存在');
          this.mangnifyNode = mangnifyNode;
        }

        if (canReduce) {
          if (!isEmpty(minScale)) {
            if (!isNumber(minScale)) return warn('minScale必须为数值');
            if (Number(minScale) >= 1) return warn('minScale必须小于1');
          }

          var _config3 = config,
              reduceEl = _config3.reduceEl;
          if (isEmpty(reduceEl)) return warn('reduceEl未配置');
          var reduceNode = document.querySelector(reduceEl);
          if (!reduceNode) return warn(reduceEl + '的dom元素不存在');
          this.reduceNode = reduceNode;
        }

        if (canMagnify || canReduce) {
          var scale = this.scale;

          if (!isEmpty(scale)) {
            if (!isNumber(scale)) return warn('scale必须为数值');
            if (Number(maxScale) <= 1) return warn('scale必须大于1');
          }
        }
        /* 触发裁剪的dom校验 */


        var _config4 = config,
            cutEl = _config4.cutEl;

        if (!isEmpty(cutEl)) {
          var submitNode = document.querySelector(cutEl);
          if (!submitNode) return warn(cutEl + '的dom不存在');
          this.submitNode = submitNode;
        }
        /* 判断imageSrc*/


        var _config5 = config,
            imageSrc = _config5.imageSrc;
        if (isEmpty(imageSrc)) return warn('imageSrc不能为空');
        /* 判断是否可旋转 */

        var _config6 = config,
            canRotate = _config6.canRotate,
            rotateEl = _config6.rotateEl;

        if (canRotate) {
          if (isEmpty(rotateEl)) return warn('rotateEl未配置');
          var rotateNode = document.querySelector(rotateEl);
          if (!rotateNode) return warn(rotateEl + '的dom不存在');
          this.rotateNode = rotateNode;
        }

        this.config = config;
        return true;
      }
    }, {
      key: "init",
      value: function init() {
        var _this = this;

        this.canvas = document.createElement('canvas');
        this.loadImage(function () {
          _this.initContainer();

          var onRender = _this.config.onRender;
          if (isFunction(onRender)) onRender();

          _this.bindEvent();
        });
      }
      /* 加载图片 */

    }, {
      key: "loadImage",
      value: function loadImage(cb) {
        var _this2 = this;

        var imageSrc = this.config.imageSrc;
        var image = new Image();
        image.src = imageSrc;

        image.onload = function () {
          _this2.image = image;
          isFunction(cb) && cb();
        };

        image.onerror = function () {
          warn('图片资源加载失败');
        };
      }
      /* 初始化裁剪容器和尺寸 */

    }, {
      key: "initContainer",
      value: function initContainer() {
        var container = this.container,
            image = this.image;
        var orgImgH = image.naturalHeight;
        var orgImgW = image.naturalWidth;
        var containerH = container.offsetHeight;
        var containerW = container.offsetWidth;
        this.containerH = containerH;
        this.containerW = containerW;
        this.orgImgW = orgImgW;
        this.orgImgH = orgImgH;
        var imgWidth = orgImgW;
        var imgHeight = orgImgH;
        var imgRatio = orgImgW / orgImgH;
        var wrapRatio = containerW / containerH;

        if (imgHeight > containerH) {
          if (imgWidth > containerW) {
            if (imgRatio < wrapRatio) {
              imgHeight = containerH;
              imgWidth = imgHeight * imgRatio;
            } else {
              imgWidth = containerW;
              imgHeight = imgWidth / imgRatio;
            }
          } else {
            imgWidth = containerW;
            imgHeight = imgWidth / imgRatio;
          }
        } else {
          if (imgWidth > containerW) {
            imgHeight = containerH;
            imgWidth = imgHeight * imgRatio;
          }
        }

        var res = this.adjustToCut(imgWidth, imgHeight);
        imgWidth = toFixed(res.imgWidth);
        imgHeight = toFixed(res.imgHeight);
        image.style.width = imgWidth + 'px';
        image.style.height = imgHeight + 'px';
        var top = (containerH - imgHeight) / 2;
        var left = (containerW - imgWidth) / 2;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        image.style.top = top + 'px';
        image.style.left = left + 'px';
        this.imgTop = top;
        this.imgLeft = left;
        image.style.position = 'absolute';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.appendChild(image);
        this.addMask();
      }
      /* 添加蒙层 */

    }, {
      key: "addMask",
      value: function addMask() {
        var container = this.container,
            containerH = this.containerH,
            containerW = this.containerW;
        var _this$config = this.config,
            cutHeight = _this$config.cutHeight,
            cutWidth = _this$config.cutWidth;
        var cutterBox = document.createElement('div');
        cutterBox.setAttribute('style', 'position:absolute;box-sizing: border-box;border: 1px dashed #fff;');
        var leftMask = this.createMask();
        var rightMask = this.createMask();
        var topMask = this.createMask();
        var bottomMask = this.createMask();
        leftMask.style.left = 0;
        rightMask.style.right = 0;
        topMask.style.top = 0;
        bottomMask.style.bottom = 0;
        var array = [leftMask, rightMask, topMask, bottomMask, cutterBox];
        array.forEach(function (el) {
          container.appendChild(el);
        });
        this.cutterBox = cutterBox;
        this.leftMask = leftMask;
        this.rightMask = rightMask;
        this.topMask = topMask;
        this.bottomMask = bottomMask;
        var left = (containerW - cutWidth) / 2;
        var top = (containerH - cutHeight) / 2;
        this.setMaskStyle(left, top, cutWidth, cutHeight);
      }
      /* 设置mask和cutterBox的样式 */

    }, {
      key: "setMaskStyle",
      value: function setMaskStyle(left, top, cutWidth, cutHeight) {
        var cutterBox = this.cutterBox,
            leftMask = this.leftMask,
            rightMask = this.rightMask,
            bottomMask = this.bottomMask,
            topMask = this.topMask,
            containerW = this.containerW,
            containerH = this.containerH;
        cutterBox.style.top = top + 'px';
        cutterBox.style.left = left + 'px';
        cutterBox.style.width = cutWidth + 'px';
        cutterBox.style.height = cutHeight + 'px';
        rightMask.style.width = containerW - left - cutWidth + 'px';
        leftMask.style.width = left + 'px';
        leftMask.style.height = rightMask.style.height = containerH + 'px';
        topMask.style.width = bottomMask.style.width = cutWidth + 'px';
        bottomMask.style.height = containerH - top - cutHeight + 'px';
        topMask.style.height = top + 'px';
        topMask.style.left = bottomMask.style.left = left + 'px';
        this.config.cutWidth = cutWidth;
        this.config.cutHeight = cutHeight;
        this.cutTop = top;
        this.cutLeft = left;
      }
    }, {
      key: "createMask",
      value: function createMask() {
        var node = document.createElement('div');
        node.style.position = 'absolute';
        node.style.background = 'rgba(255, 255, 255, 0.45)';
        return node;
      }
      /* 绑定事件 */

    }, {
      key: "bindEvent",
      value: function bindEvent() {
        var _this3 = this;

        var container = this.container,
            cutterBox = this.cutterBox;

        cutterBox.onmouseenter = function (e) {
          _this3.cutterIsEnter = true;

          _this3.initMouse(e);

          container.onmousemove = function (e) {
            if (!_this3.cutterIsEnter) return;

            if (_this3.cutterIsDown) {
              _this3.handleResize(e);
            } else {
              _this3.initMouse(e);
            }
          };

          container.onmousedown = function (e) {
            if (!_this3.cutterIsEnter) return;
            if (_this3.dragStatus <= 0) return;
            _this3.cutterIsDown = true;

            _this3.handleMouseDown(e);

            container.onmouseup = function () {
              if (!_this3.cutterIsDown) return;
              _this3.cutterIsDown = false;

              _this3.checkCutterBox();

              container.onmouseup = null;
            };
          };
        };

        container.onmouseleave = function () {
          _this3.cutterIsEnter = false;
          _this3.dragStatus = 0;
          _this3.cutterIsDown = false;
          container.onmousemove = null;
          container.onmousedown = null;
          container.onmouseup = null;

          _this3.checkCutterBox();
        };

        var _this$config2 = this.config,
            canRotate = _this$config2.canRotate,
            canMagnify = _this$config2.canMagnify,
            canReduce = _this$config2.canReduce,
            scale = _this$config2.scale;
        /* 放大 */

        if (canMagnify && this.mangnifyNode) {
          this.mangnifyNode.onclick = function () {
            if (!_this3.config.canMagnify) return;

            _this3.changeImageSize(scale);
          };
        }
        /* 缩小 */


        if (canReduce && this.reduceNode) {
          this.reduceNode.onclick = function () {
            if (!_this3.config.canReduce) return;

            _this3.changeImageSize(1 / scale);
          };
        }
        /* 逆时针旋转图片 */


        if (canRotate && this.rotateNode) {
          this.rotateNode.onclick = function () {
            _this3.rotateImage();
          };
        }
        /* 裁剪 */


        if (this.submitNode) {
          this.submitNode.onclick = function () {
            _this3.cutImage();
          };
        }
      }
      /* 裁剪图片 */

    }, {
      key: "cutImage",
      value: function cutImage() {
        var canvas = this.canvas,
            rotate = this.rotate,
            orgImgW = this.orgImgW,
            imgHeight = this.imgHeight,
            imgWidth = this.imgWidth,
            imgTop = this.imgTop,
            imgLeft = this.imgLeft,
            cutLeft = this.cutLeft,
            cutTop = this.cutTop,
            image = this.image,
            containerW = this.containerW,
            containerH = this.containerH;
        var _this$config3 = this.config,
            cutHeight = _this$config3.cutHeight,
            cutWidth = _this$config3.cutWidth,
            onCut = _this$config3.onCut;
        var scale = imgWidth / orgImgW;
        var ctx = canvas.getContext('2d');
        var sWidth = cutWidth / scale;
        var sHeight = cutHeight / scale;
        canvas.width = cutWidth;
        canvas.height = cutHeight;

        if (rotate === -1) {
          var sx = toFixed((containerH - cutHeight - cutTop - (containerH - imgWidth) / 2) / scale);
          var sy = toFixed((cutLeft - (containerW - imgHeight) / 2) / scale);
          sWidth = cutHeight / scale;
          sHeight = cutWidth / scale;
          ctx.rotate(90 * rotate * Math.PI / 180);
          ctx.drawImage(image, sx, sy, sWidth, sHeight, -cutHeight, 0, cutHeight, cutWidth);
        } else if (rotate === -2) {
          var _sx = this.toFixed((containerW - cutLeft - cutWidth - (containerW - imgWidth) / 2) / scale);

          var _sy = this.toFixed((containerH - cutHeight - cutTop - (containerH - imgHeight) / 2) / scale);

          ctx.rotate(90 * rotate * Math.PI / 180);
          ctx.drawImage(image, _sx, _sy, sWidth, sHeight, -cutWidth, -cutHeight, cutWidth, cutHeight);
        } else if (rotate === -3) {
          var _sx2 = this.toFixed((cutTop - (containerH - imgWidth) / 2) / scale);

          var _sy2 = this.toFixed((containerW - cutLeft - cutWidth - (containerW - imgHeight) / 2) / scale);

          sWidth = cutHeight / scale;
          sHeight = cutWidth / scale;
          ctx.rotate(90 * rotate * Math.PI / 180);
          ctx.drawImage(image, _sx2, _sy2, sWidth, sHeight, 0, -cutWidth, cutHeight, cutWidth);
        } else {
          var _sx3 = (cutLeft - imgLeft) / scale;

          var _sy3 = (cutTop - imgTop) / scale;

          ctx.drawImage(image, _sx3, _sy3, sWidth, sHeight, 0, 0, cutWidth, cutHeight);
        }

        var cutImgSrc = canvas.toDataURL('image/png');
        if (isFunction(onCut)) onCut(cutImgSrc);
        return cutImgSrc;
      }
      /* 改变图片尺寸 */

    }, {
      key: "changeImageSize",
      value: function changeImageSize(scale) {
        var imgWidth = this.imgWidth,
            orgImgW = this.orgImgW,
            orgImgH = this.orgImgH,
            imgHeight = this.imgHeight,
            containerH = this.containerH,
            containerW = this.containerW,
            image = this.image;
        var _this$config4 = this.config,
            maxScale = _this$config4.maxScale,
            minScale = _this$config4.minScale,
            onManify = _this$config4.onManify,
            onReduce = _this$config4.onReduce;
        imgWidth *= scale;
        imgHeight *= scale;

        if (scale > 1) {
          this.config.canReduce = true;
          /* 不能超过最大放大比例 */

          if (imgWidth / orgImgW > maxScale) {
            this.config.canMagnify = false;
            imgWidth = orgImgW * maxScale;
            imgHeight = orgImgH * maxScale;
          }
        } else {
          this.config.canMagnify = true;
          /* 不能小于最小缩小比例 */

          if (imgWidth / orgImgW < minScale) {
            this.containerH.canReduce = false;
            imgWidth = orgImgW * minScale;
            imgHeight = orgImgH * minScale;
          }
        }
        /* 图片不能小于cutterBox的尺寸 */


        var res = this.adjustToCut(imgWidth, imgHeight);
        imgWidth = toFixed(res.imgWidth);
        imgHeight = toFixed(res.imgHeight);
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        image.style.width = imgWidth + 'px';
        image.style.height = imgHeight + 'px';
        var top = toFixed((containerH - imgHeight) / 2);
        var left = toFixed((containerW - imgWidth) / 2);
        image.style.top = top + 'px';
        image.style.left = left + 'px';
        this.imgTop = top;
        this.imgLeft = left;
        this.checkCutterBox();
        if (scale > 1 && isFunction(onManify)) onManify(this.config);
        if (scale < 1 && isFunction(onReduce)) onReduce(this.config);
      }
      /* 逆时针旋转图片 */

    }, {
      key: "rotateImage",
      value: function rotateImage() {
        var rotate = this.rotate,
            image = this.image;
        rotate -= 1;

        if (rotate % 4 === 0) {
          rotate = 0;
        }

        image.style.transform = "rotate(".concat(90 * rotate, "deg)");
        this.rotate = rotate;
        this.checkCutterBox();
      }
      /* 初始化鼠标状态 */

    }, {
      key: "initMouse",
      value: function initMouse(e) {
        e.preventDefault();
        if (!this.cutterIsEnter) return;
        var cutterBox = this.cutterBox,
            cursorEnums = this.cursorEnums,
            container = this.container;
        var _this$config5 = this.config,
            cutWidth = _this$config5.cutWidth,
            cutHeight = _this$config5.cutHeight,
            canChangeCutSize = _this$config5.canChangeCutSize;
        var clientX = e.clientX,
            clientY = e.clientY;

        var _cutterBox$getBoundin = cutterBox.getBoundingClientRect(),
            top = _cutterBox$getBoundin.top,
            left = _cutterBox$getBoundin.left;

        var offsetX = clientX - left;
        var offsetY = clientY - top;
        var size = 10;
        var status = 0;

        if (offsetX < size && offsetX > -size) {
          if (offsetY < size && offsetY > -size) {
            // 左上角
            status = 1;
          } else if (offsetY >= size && offsetY <= cutHeight - size) {
            // 左侧
            status = 2;
          } else if (offsetY > cutHeight - size && offsetY < cutHeight + size) {
            // 左下角
            status = 3;
          }
        } else if (offsetX >= size && offsetX <= cutWidth - size) {
          if (offsetY < size && offsetY > -size) {
            // 上
            status = 4;
          } else if (offsetY > cutHeight - size && offsetY < cutHeight + size) {
            // 下
            status = 5;
          } else if (offsetY >= size && offsetY <= cutHeight - size) {
            // 中间
            status = 9;
          }
        } else if (offsetX > cutWidth - size && offsetX < cutWidth + size) {
          if (offsetY < size && offsetY > -size) {
            // 右上角
            status = 6;
          } else if (offsetY >= size && offsetY <= cutHeight - size) {
            // 右侧
            status = 7;
          } else if (offsetY > cutHeight - size && offsetY < cutHeight + size) {
            // 右下角
            status = 8;
          }
        }

        if (canChangeCutSize || !canChangeCutSize && status === 9) {
          cutterBox.style.cursor = cursorEnums[status] || 'default';
          this.dragStatus = status;
        }

        if (offsetX < -size || offsetX > cutWidth + size || offsetY < -size || offsetY > cutHeight + size) {
          this.cutterIsEnter = false;
          this.cutterIsDown = false;
          container.onmousemove = null;
          container.onmousedown = null;
          container.onmouseup = null;
        }
      }
      /* 移动鼠标改变尺寸和位置 */

    }, {
      key: "handleResize",
      value: function handleResize(e) {
        e.preventDefault();
        var _this$config6 = this.config,
            cutWidth = _this$config6.cutWidth,
            cutHeight = _this$config6.cutHeight,
            mincutWidth = _this$config6.mincutWidth;
        var cutTop = this.cutTop,
            cutLeft = this.cutLeft,
            startPos = this.startPos,
            dragStatus = this.dragStatus,
            containerW = this.containerW,
            containerH = this.containerH;
        var moveX = e.clientX - startPos.clientX;
        var moveY = e.clientY - startPos.clientY;

        if (dragStatus >= 1 && dragStatus <= 3) {
          // 左侧
          var newWidth = cutWidth - moveX;
          var newLeft = cutLeft + moveX;
          var newHeight = cutHeight;
          var newTop = cutTop;
          if (newWidth < mincutWidth) return;

          if (newLeft < 0) {
            newLeft = 0;
          }

          if (dragStatus === 1) {
            // 左上角 与右上角一样
            var res = this.resizeTop(cutHeight, cutTop, moveY);
            newHeight = res.newHeight;
            newTop = res.newTop;
          } else if (dragStatus === 3) {
            var _res = this.resizeBottom(cutHeight, cutTop, moveY);

            newHeight = _res.newHeight;
          }

          this.setMaskStyle(newLeft, newTop, newWidth, newHeight);
        } else if (dragStatus === 4) {
          var _res2 = this.resizeTop(cutHeight, cutTop, moveY);

          var _newHeight = _res2.newHeight;
          var _newTop = _res2.newTop;
          this.setMaskStyle(cutLeft, _newTop, cutWidth, _newHeight);
        } else if (dragStatus === 5) {
          var _res3 = this.resizeBottom(cutHeight, cutTop, moveY);

          var _newHeight2 = _res3.newHeight;
          this.setMaskStyle(cutLeft, cutTop, cutWidth, _newHeight2);
        } else if (dragStatus >= 6 && dragStatus <= 8) {
          // 右侧
          var _newWidth = cutWidth + moveX;

          var _newTop2 = cutTop;
          var _newHeight3 = cutHeight;
          if (_newWidth < mincutWidth) return;

          if (cutLeft + _newWidth > containerW) {
            _newWidth = containerW - cutWidth;
          }

          if (dragStatus === 6) {
            // 右上角
            var _res4 = this.resizeTop(cutHeight, cutTop, moveY);

            _newHeight3 = _res4.newHeight;
            _newTop2 = _res4.newTop;
          } else if (dragStatus === 8) {
            // 右下角
            var _res5 = this.resizeBottom(cutHeight, cutTop, moveY);

            _newHeight3 = _res5.newHeight;
          }

          this.setMaskStyle(cutLeft, _newTop2, _newWidth, _newHeight3);
        } else if (dragStatus === 9) {
          var _newLeft = cutLeft + moveX;

          var _newTop3 = cutTop + moveY;

          if (_newTop3 < 0) _newTop3 = 0;
          if (_newLeft < 0) _newLeft = 0;
          if (_newLeft + cutWidth > containerW) _newLeft = containerW - cutWidth;
          if (_newTop3 + cutHeight > containerH) _newTop3 = containerH - cutHeight;
          this.setMaskStyle(_newLeft, _newTop3, cutWidth, cutHeight);
        }

        this.startPos = {
          clientX: e.clientX,
          clientY: e.clientY
        };
      }
      /* 判断cuttererbox的位置是否超过image */

    }, {
      key: "checkCutterBox",
      value: function checkCutterBox() {
        var _this$config7 = this.config,
            cutHeight = _this$config7.cutHeight,
            cutWidth = _this$config7.cutWidth;
        var cutterBox = this.cutterBox,
            cutTop = this.cutTop,
            cutLeft = this.cutLeft,
            imgTop = this.imgTop,
            imgLeft = this.imgLeft,
            imgHeight = this.imgHeight,
            imgWidth = this.imgWidth,
            bottomMask = this.bottomMask,
            topMask = this.topMask,
            rightMask = this.rightMask,
            leftMask = this.leftMask,
            containerW = this.containerW,
            containerH = this.containerH,
            rotate = this.rotate;

        if (rotate % 2 !== 0) {
          imgLeft = (containerW - imgHeight) / 2;
          imgTop = (containerH - imgWidth) / 2;
          var tmp = imgWidth;
          imgWidth = imgHeight;
          imgHeight = tmp;
        }

        if (cutWidth > imgWidth) cutWidth = imgWidth;
        if (cutHeight > imgHeight) cutHeight = imgHeight;
        if (cutLeft < imgLeft) cutLeft = imgLeft;
        if (cutLeft + cutWidth > imgLeft + imgWidth) cutLeft = imgLeft + imgWidth - cutWidth;
        if (cutTop < imgTop) cutTop = imgTop;
        if (cutTop + cutHeight > imgTop + imgHeight) cutTop = imgTop + imgHeight - cutHeight;
        var animateStyle = 'all 0.3s';
        var array = [cutterBox, bottomMask, topMask, rightMask, leftMask];
        array.forEach(function (el) {
          el.style.transition = animateStyle;
        });
        this.setMaskStyle(cutLeft, cutTop, cutWidth, cutHeight);
        setTimeout(function () {
          array.forEach(function (el) {
            el.style.transition = '';
          });
        }, 300);
      }
    }, {
      key: "handleMouseDown",
      value: function handleMouseDown(e) {
        this.startPos = {
          clientX: e.clientX,
          clientY: e.clientY
        };
      }
    }, {
      key: "resizeTop",
      value: function resizeTop(cutHeight, cutTop, moveY) {
        var mincutHeight = this.config.mincutHeight;
        var newHeight = cutHeight - moveY;
        var newTop = cutTop + moveY;
        if (newHeight < mincutHeight) return;

        if (newTop < 0) {
          newTop = 0;
        }

        return {
          newTop: newTop,
          newHeight: newHeight
        };
      }
    }, {
      key: "resizeBottom",
      value: function resizeBottom(cutHeight, cutTop, moveY) {
        var containerH = this.containerH;
        var mincutHeight = this.config.mincutHeight;
        var newHeight = cutHeight + moveY;
        if (newHeight < mincutHeight) return;

        if (cutTop + newHeight > containerH) {
          newHeight = containerH - cutTop;
        }

        return {
          newHeight: newHeight
        };
      }
      /* 图片尺寸与裁剪不能小于裁剪区尺寸 */

    }, {
      key: "adjustToCut",
      value: function adjustToCut(imgWidth, imgHeight) {
        var orgImgW = this.orgImgW,
            orgImgH = this.orgImgH;
        var _this$config8 = this.config,
            cutWidth = _this$config8.cutWidth,
            cutHeight = _this$config8.cutHeight;
        var imgRatio = orgImgW / orgImgH;
        var cutRatio = cutWidth / cutHeight;

        if (imgHeight < cutHeight) {
          this.config.canReduce = false;

          if (imgWidth < cutWidth) {
            if (imgRatio > cutRatio) {
              imgHeight = cutHeight;
              imgWidth = imgHeight * imgRatio;
            } else {
              imgWidth = cutWidth;
              imgHeight = imgWidth / imgRatio;
            }
          } else {
            imgHeight = cutHeight;
            imgWidth = imgHeight * imgRatio;
          }
        } else {
          if (imgWidth < cutWidth) {
            this.config.canReduce = false;
            imgWidth = cutWidth;
            imgHeight = imgWidth / imgRatio;
          }
        }

        return {
          imgWidth: imgWidth,
          imgHeight: imgHeight
        };
      }
    }]);

    return _default;
  }();

  return _default;

})));
