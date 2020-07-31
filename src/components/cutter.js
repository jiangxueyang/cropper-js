import {isObject, isEmpty, isNumber, warn, toFixed, isFunction} from '../utils'
export default class {
	constructor(config = {}) {
		this.rotate = 0 // 旋转角度
		this.dragStatus = 0 // 拖拽状态
		this.cursorEnums = ['default', 'nw-resize', 'w-resize', 'sw-resize', 'n-resize', 's-resize', 'ne-resize', 'e-resize', 'se-resize', 'move'] // 鼠标状态
		this.cropperIsEnter = false // 鼠标是否进入裁剪区域
		this.ropperIsDown = false // 鼠标是否在裁剪区域按下
		this.startPos = null // 开始坐标
		/* 默认配置 */
		this.defaultConfig = {
			cropWidth: 200, // 裁剪区域默认宽度，单位px
			cropHeight: 200, // 裁剪区域默认高度，单位px
			minCropWidth: 16, // 裁剪区域最小宽度，单位px
			minCropHeight: 16, // 裁剪区域最小高度，单位px
			maxScale: 3, // 图片能放大的最大倍数，相对图片原始尺寸
			minScale: 0.1, // 图片能缩小的最小倍数，相对图片原始尺寸
			scale: 1.2, // 每次放大的倍数，必须大于1，缩小为1/scale
			canMagnify: true, // boolean 是否可放大
			canReduce: true, // boolean 是否可缩小
			canRotate: true, // boolean 能否逆时针旋转图片
			canChangeCropSize: true, // boolean 能否改变裁剪区域大小，默认true
			imageSrc: '', // 图片资源, 必传
			containerEl: '', // 裁剪操作容器，图片与裁剪框将展示在这个区域，可为类名、id
			mangnifyEl: '', // 放大图片的dom元素，可为类名、id
			reduceEl: '', // 缩小图片的dom元素，可为类名、id
			cropEl: '', // 触发裁剪的dom元素，可为类名、id
			rotateEl: '', // 触发逆时针旋转的dom元素，可为类名、id
			onRender: null, // 渲染成功回调
			onCrop: null // 裁剪成功回调
		}
		if (!this.checkConfig(config)) return
		this.init()
	}
	/* 检查配置信息是否合法 */
	checkConfig(config) {
		if (isEmpty(config)) return false
		if (!isObject(config)) return warn('配置信息格式不合法')
		let arr = ['cropWidth', 'cropHeight', 'minCropWidth', 'minCropHeight', 'maxScale', 'minScale', 'scale']
		arr.forEach((key) => {
			if (config.hasOwnProperty(key)) {
				config[key] = parseFloat(config[key])
			}
		})
		config = {...this.defaultConfig, ...config}
		let {containerEl, minCropWidth, minCropHeight, cropWidth, cropHeight, maxScale, minScale, canReduce, canMagnify} = config
		// 判断containerEl
		if (isEmpty(containerEl)) return warn('containerEl未配置')
		let container = document.querySelector(containerEl)
		if (!container) return warn(containerEl + '的dom元素不存在')
		this.container = container
		//判断minCropWidth, minCropHeight
		if (config.canChangeCropSize) {
			if (!isEmpty(minCropHeight)) {
				if (!isNumber(minCropHeight)) return warn('minCropHeight必须为数值')
				if (Number(minCropHeight) < 1) return warn('minCropHeight不能小于1')
			}
			if (!isEmpty(minCropWidth)) {
				if (!isNumber(minCropWidth)) return warn('minCropWidth必须为数值')
				if (Number(minCropWidth) < 1) return warn('minCropWidth不能小于1')
			}
		}
		// 判断cropWidth， cropHeight
		if (!isEmpty(cropWidth)) {
			if (!isNumber(cropWidth)) return warn('cropWidtht必须为数值')
			if (Number(cropWidth) < 1) return warn('cropWidth不能小于1')
		}
		if (!isEmpty(cropHeight)) {
			if (!isNumber(cropHeight)) return warn('cropHeight必须为数值')
			if (Number(cropHeight) < 1) return warn('cropHeight不能小于1')
		}
		// 判断放大缩小相关参数
		if (canMagnify) {
			if (!isEmpty(maxScale)) {
				if (!isNumber(maxScale)) return warn('maxScale必须为数值')
				if (Number(maxScale) < 1) return warn('maxScale不能小于1')
			}
			let {mangnifyEl} = config
			if (isEmpty(mangnifyEl)) return warn('mangnifyEl未配置')
			let mangnifyNode = document.querySelector(mangnifyEl)
			if (!mangnifyNode) return warn(mangnifyEl + '的dom元素不存在')
			this.mangnifyNode = mangnifyNode
		}
		if (canReduce) {
			if (!isEmpty(minScale)) {
				if (!isNumber(minScale)) return warn('minScale必须为数值')
				if (Number(minScale) >= 1) return warn('minScale必须小于1')
			}
			let {reduceEl} = config
			if (isEmpty(reduceEl)) return warn('reduceEl未配置')
			let reduceNode = document.querySelector(reduceEl)
			if (!reduceNode) return warn(reduceEl + '的dom元素不存在')
			this.reduceNode = reduceNode
		}
		if (canMagnify || canReduce) {
			let {scale} = this
			if (!isEmpty(scale)) {
				if (!isNumber(scale)) return warn('scale必须为数值')
				if (Number(maxScale) <= 1) return warn('scale必须大于1')
			}
		}
		/* 触发裁剪的dom校验 */
		let {cropEl} = config
		if (!isEmpty(cropEl)) {
			let submitNode = document.querySelector(cropEl)
			if (!submitNode) return warn(cropEl + '的dom不存在')
			this.submitNode = submitNode
		}
		/* 判断imageSrc*/
		let {imageSrc} = config
		if (isEmpty(imageSrc)) return warn('imageSrc不能为空')
		/* 判断是否可旋转 */
		let {canRotate, rotateEl} = config
		if (canRotate) {
			if (isEmpty(rotateEl)) return warn('rotateEl未配置')
			let rotateNode = document.querySelector(rotateEl)
			if (!rotateNode) return warn(rotateEl + '的dom不存在')
			this.rotateNode = rotateNode
		}
		this.config = config
		return true
	}
	init() {
		this.canvas = document.createElement('canvas')
		this.loadImage(() => {
			this.initContainer()
			let {onRender} = this.config
			if (isFunction(onRender)) onRender()
			this.bindEvent()
		})
	}
	/* 加载图片 */
	loadImage(cb) {
		let {imageSrc} = this.config
		let image = new Image()
		image.src = imageSrc
		image.onload = () => {
			this.image = image
			isFunction(cb) && cb()
		}
		image.onerror = () => {
			warn('图片资源加载失败')
		}
	}
	/* 初始化裁剪容器和尺寸 */
	initContainer() {
		let {container, image} = this
		let orgImgH = image.naturalHeight
		let orgImgW = image.naturalWidth
		let containerH = container.offsetHeight
		let containerW = container.offsetWidth
		this.containerH = containerH
		this.containerW = containerW
		this.orgImgW = orgImgW
		this.orgImgH = orgImgH
		let imgWidth = orgImgW
		let imgHeight = orgImgH
		let imgRatio = orgImgW / orgImgH
		let wrapRatio = containerW / containerH

		if (imgHeight > containerH) {
			if (imgWidth > containerW) {
				if (imgRatio < wrapRatio) {
					imgHeight = containerH
					imgWidth = imgHeight * imgRatio
				} else {
					imgWidth = containerW
					imgHeight = imgWidth / imgRatio
				}
			} else {
				imgWidth = containerW
				imgHeight = imgWidth / imgRatio
			}
		} else {
			if (imgWidth > containerW) {
				imgHeight = containerH
				imgWidth = imgHeight * imgRatio
			}
		}
		let res = this.adjustToCrop(imgWidth, imgHeight)
		imgWidth = toFixed(res.imgWidth)
		imgHeight = toFixed(res.imgHeight)
		image.style.width = imgWidth + 'px'
		image.style.height = imgHeight + 'px'
		let top = (containerH - imgHeight) / 2
		let left = (containerW - imgWidth) / 2
		this.imgWidth = imgWidth
		this.imgHeight = imgHeight
		image.style.top = top + 'px'
		image.style.left = left + 'px'
		this.imgTop = top
		this.imgLeft = left
		image.style.position = 'absolute'
		container.style.position = 'relative'
		container.style.overflow = 'hidden'
		container.appendChild(image)
		this.addMask()
	}
	/* 添加蒙层 */
	addMask() {
		let {container, containerH, containerW} = this
		let {cropHeight, cropWidth} = this.config
		let cropBox = document.createElement('div')
		cropBox.setAttribute('style', 'position:absolute;box-sizing: border-box;border: 1px dashed #fff;')
		let leftMask = this.createMask()
		let rightMask = this.createMask()
		let topMask = this.createMask()
		let bottomMask = this.createMask()
		leftMask.style.left = 0
		rightMask.style.right = 0
		topMask.style.top = 0
		bottomMask.style.bottom = 0
		let array = [leftMask, rightMask, topMask, bottomMask, cropBox]
		array.forEach(el => {
			container.appendChild(el)
		})
		this.cropBox = cropBox
		this.leftMask = leftMask
		this.rightMask = rightMask
		this.topMask = topMask
		this.bottomMask = bottomMask
		let left = (containerW - cropWidth) / 2
		let top = (containerH - cropHeight) / 2
		this.setMaskStyle(left, top, cropWidth, cropHeight)
	}
	/* 设置mask和cropperBox的样式 */
	setMaskStyle(left, top, cropWidth, cropHeight) {
		let {cropBox, leftMask, rightMask, bottomMask, topMask, containerW, containerH} = this
		cropBox.style.top = top + 'px'
		cropBox.style.left = left + 'px'
		cropBox.style.width = cropWidth + 'px'
		cropBox.style.height = cropHeight + 'px'
		rightMask.style.width = containerW - left - cropWidth + 'px'
		leftMask.style.width = left + 'px'
		leftMask.style.height = rightMask.style.height = containerH + 'px'
		topMask.style.width = bottomMask.style.width = cropWidth + 'px'
		bottomMask.style.height = containerH - top - cropHeight + 'px'
		topMask.style.height = top + 'px'
		topMask.style.left = bottomMask.style.left = left + 'px'
		this.config.cropWidth = cropWidth
		this.config.cropHeight = cropHeight
		this.cropTop = top
		this.cropLeft = left
	}
	createMask() {
		let node = document.createElement('div')
		node.style.position = 'absolute'
		node.style.background = 'rgba(255, 255, 255, 0.45)'
		return node
	}
	/* 绑定事件 */
	bindEvent() {
		let {container, cropBox} = this
		cropBox.onmouseenter = (e) => {
			this.cropperIsEnter = true
			this.initMouse(e)
			container.onmousemove = (e) => {
				if (!this.cropperIsEnter) return
				if (this.cropperIsDown) {
					this.handleResize(e)
				} else {
					this.initMouse(e)
				}
			}
			container.onmousedown = (e) => {
				if (!this.cropperIsEnter) return
				if (this.dragStatus <= 0) return
				this.cropperIsDown = true
				this.handleMouseDown(e)
				container.onmouseup = () => {
					if (!this.cropperIsDown) return
					this.cropperIsDown = false
					this.checkCropperBox()
					container.onmouseup = null
				}
			}
		}
		container.onmouseleave = () => {
			this.cropperIsEnter = false
			this.dragStatus = 0
			this.cropperIsDown = false
			container.onmousemove = null
			container.onmousedown = null
			container.onmouseup = null
			this.checkCropperBox()
		}
		let {canRotate, canMagnify, canReduce, scale} = this.config
		/* 放大 */
		if (canMagnify && this.mangnifyNode) {
			this.mangnifyNode.onclick = () => {
				if (!this.config.canMagnify) return
				this.changeImageSize(scale)
			}
		}
		/* 缩小 */
		if (canReduce && this.reduceNode) {
			this.reduceNode.onclick = () => {
				if (!this.config.canReduce) return
				this.changeImageSize(1 / scale)
			}
		}
		/* 逆时针旋转图片 */
		if (canRotate && this.rotateNode) {
			this.rotateNode.onclick = () => {
				this.rotateImage()
			}
		}
		/* 裁剪 */
		if (this.submitNode) {
			this.submitNode.onclick = () => {
				this.cropImage()
			}
		}
	}
	/* 裁剪图片 */
	cropImage() {
		let {canvas, rotate, orgImgW, imgHeight, imgWidth, imgTop, imgLeft, cropLeft, cropTop, image, containerW, containerH} = this
		let {cropHeight, cropWidth, onCrop} = this.config
		let scale = imgWidth / orgImgW
		let ctx = canvas.getContext('2d')
		let sWidth = cropWidth / scale
		let sHeight = cropHeight / scale
		canvas.width = cropWidth
		canvas.height = cropHeight
		if (rotate === -1) {
			let sx = toFixed((containerH - cropHeight - cropTop - (containerH - imgWidth) / 2) / scale)
			let sy = toFixed((cropLeft - (containerW - imgHeight) / 2) / scale)
			sWidth = cropHeight / scale
			sHeight = cropWidth / scale
			ctx.rotate((90 * rotate * Math.PI) / 180)
			ctx.drawImage(image, sx, sy, sWidth, sHeight, -cropHeight, 0, cropHeight, cropWidth)
		} else if (rotate === -2) {
			let sx = this.toFixed((containerW - cropLeft - cropWidth - (containerW - imgWidth) / 2) / scale)
			let sy = this.toFixed((containerH - cropHeight - cropTop - (containerH - imgHeight) / 2) / scale)
			ctx.rotate((90 * rotate * Math.PI) / 180)
			ctx.drawImage(image, sx, sy, sWidth, sHeight, -cropWidth, -cropHeight, cropWidth, cropHeight)
		} else if (rotate === -3) {
			let sx = this.toFixed((cropTop - (containerH - imgWidth) / 2) / scale)
			let sy = this.toFixed((containerW - cropLeft - cropWidth - (containerW - imgHeight) / 2) / scale)
			sWidth = cropHeight / scale
			sHeight = cropWidth / scale
			ctx.rotate((90 * rotate * Math.PI) / 180)
			ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, -cropWidth, cropHeight, cropWidth)
		} else {
			let sx = (cropLeft - imgLeft) / scale
			let sy = (cropTop - imgTop) / scale
			ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, cropWidth, cropHeight)
		}
		let cropImgSrc = canvas.toDataURL('image/png')
		if (isFunction(onCrop)) onCrop(cropImgSrc)
		return cropImgSrc
	}
	/* 改变图片尺寸 */
	changeImageSize(scale) {
		let {imgWidth, orgImgW, orgImgH, imgHeight, containerH, containerW, image} = this
		let {maxScale, minScale, onManify, onReduce} = this.config
		imgWidth *= scale
		imgHeight *= scale
		if (scale > 1) {
			this.config.canReduce = true
			/* 不能超过最大放大比例 */
			if (imgWidth / orgImgW > maxScale) {
				this.config.canMagnify = false
				imgWidth = orgImgW * maxScale
				imgHeight = orgImgH * maxScale
			}
		} else {
			this.config.canMagnify = true
			/* 不能小于最小缩小比例 */
			if (imgWidth / orgImgW < minScale) {
				this.containerH.canReduce = false
				imgWidth = orgImgW * minScale
				imgHeight = orgImgH * minScale
			}
		}
		/* 图片不能小于cropperBox的尺寸 */
		let res = this.adjustToCrop(imgWidth, imgHeight)
		imgWidth = toFixed(res.imgWidth)
		imgHeight = toFixed(res.imgHeight)

		this.imgWidth = imgWidth
		this.imgHeight = imgHeight
		image.style.width = imgWidth + 'px'
		image.style.height = imgHeight + 'px'
		let top = toFixed((containerH - imgHeight) / 2)
		let left = toFixed((containerW - imgWidth) / 2)
		image.style.top = top + 'px'
		image.style.left = left + 'px'
		this.imgTop = top
		this.imgLeft = left
		this.checkCropperBox()
		if (scale > 1 && isFunction(onManify)) onManify(this.config)
		if (scale < 1 && isFunction(onReduce)) onReduce(this.config)
	}
	/* 逆时针旋转图片 */
	rotateImage() {
		let {rotate, image} = this
		rotate -= 1
		if (rotate % 4 === 0) {
			rotate = 0
		}
		image.style.transform = `rotate(${90 * rotate}deg)`
		this.rotate = rotate
		this.checkCropperBox()
	}
	/* 初始化鼠标状态 */
	initMouse(e) {
		e.preventDefault()
		if (!this.cropperIsEnter) return
		let {cropBox, cursorEnums, container} = this
		let {cropWidth, cropHeight, canChangeCropSize} = this.config
		let {clientX, clientY} = e
		let {top, left} = cropBox.getBoundingClientRect()
		let offsetX = clientX - left
		let offsetY = clientY - top
		let size = 10
		let status = 0
		if (offsetX < size && offsetX > -size) {
			if (offsetY < size && offsetY > -size) {
				// 左上角
				status = 1
			} else if (offsetY >= size && offsetY <= cropHeight - size) {
				// 左侧
				status = 2
			} else if (offsetY > cropHeight - size && offsetY < cropHeight + size) {
				// 左下角
				status = 3
			}
		} else if (offsetX >= size && offsetX <= cropWidth - size) {
			if (offsetY < size && offsetY > -size) {
				// 上
				status = 4
			} else if (offsetY > cropHeight - size && offsetY < cropHeight + size) {
				// 下
				status = 5
			} else if (offsetY >= size && offsetY <= cropHeight - size) {
				// 中间
				status = 9
			}
		} else if (offsetX > cropWidth - size && offsetX < cropWidth + size) {
			if (offsetY < size && offsetY > -size) {
				// 右上角
				status = 6
			} else if (offsetY >= size && offsetY <= cropHeight - size) {
				// 右侧
				status = 7
			} else if (offsetY > cropHeight - size && offsetY < cropHeight + size) {
				// 右下角
				status = 8
			}
		}
		if (canChangeCropSize || (!canChangeCropSize && status === 9)) {
			cropBox.style.cursor = cursorEnums[status] || 'default'
			this.dragStatus = status
		}
		if (offsetX < -size || offsetX > cropWidth + size || offsetY < -size || offsetY > cropHeight + size) {
			this.cropperIsEnter = false
			this.cropperIsDown = false
			container.onmousemove = null
			container.onmousedown = null
			container.onmouseup = null
		}
	}
	/* 移动鼠标改变尺寸和位置 */
	handleResize(e) {
		e.preventDefault()
		let {cropWidth, cropHeight, minCropWidth} = this.config
		let {cropTop, cropLeft, startPos, dragStatus, containerW, containerH} = this
		let moveX = e.clientX - startPos.clientX
		let moveY = e.clientY - startPos.clientY
		if (dragStatus >= 1 && dragStatus <= 3) {
			// 左侧
			let newWidth = cropWidth - moveX
			let newLeft = cropLeft + moveX
			let newHeight = cropHeight
			let newTop = cropTop
			if (newWidth < minCropWidth) return
			if (newLeft < 0) {
				newLeft = 0
			}
			if (dragStatus === 1) {
				// 左上角 与右上角一样
				let res = this.resizeTop(cropHeight, cropTop, moveY)
				newHeight = res.newHeight
				newTop = res.newTop
			} else if (dragStatus === 3) {
				let res = this.resizeBottom(cropHeight, cropTop, moveY)
				newHeight = res.newHeight
			}
			this.setMaskStyle(newLeft, newTop, newWidth, newHeight)
		} else if (dragStatus === 4) {
			let res = this.resizeTop(cropHeight, cropTop, moveY)
			let newHeight = res.newHeight
			let newTop = res.newTop
			this.setMaskStyle(cropLeft, newTop, cropWidth, newHeight)
		} else if (dragStatus === 5) {
			let res = this.resizeBottom(cropHeight, cropTop, moveY)
			let newHeight = res.newHeight
			this.setMaskStyle(cropLeft, cropTop, cropWidth, newHeight)
		} else if (dragStatus >= 6 && dragStatus <= 8) {
			// 右侧
			let newWidth = cropWidth + moveX
			let newTop = cropTop
			let newHeight = cropHeight
			if (newWidth < minCropWidth) return
			if (cropLeft + newWidth > containerW) {
				newWidth = containerW - cropWidth
			}
			if (dragStatus === 6) {
				// 右上角
				let res = this.resizeTop(cropHeight, cropTop, moveY)
				newHeight = res.newHeight
				newTop = res.newTop
			} else if (dragStatus === 8) {
				// 右下角
				let res = this.resizeBottom(cropHeight, cropTop, moveY)
				newHeight = res.newHeight
			}
			this.setMaskStyle(cropLeft, newTop, newWidth, newHeight)
		} else if (dragStatus === 9) {
			let newLeft = cropLeft + moveX
			let newTop = cropTop + moveY
			if (newTop < 0) newTop = 0
			if (newLeft < 0) newLeft = 0
			if (newLeft + cropWidth > containerW) newLeft = containerW - cropWidth
			if (newTop + cropHeight > containerH) newTop = containerH - cropHeight
			this.setMaskStyle(newLeft, newTop, cropWidth, cropHeight)
		}
		this.startPos = {clientX: e.clientX, clientY: e.clientY}
	}
	/* 判断cropperbox的位置是否超过image */
	checkCropperBox() {
		let {cropHeight, cropWidth} = this.config
		let {cropBox, cropTop, cropLeft, imgTop, imgLeft, imgHeight, imgWidth, bottomMask, topMask, rightMask, leftMask, containerW, containerH, rotate} = this
		if (rotate % 2 !== 0) {
			imgLeft = (containerW - imgHeight) / 2
			imgTop = (containerH - imgWidth) / 2
			let tmp = imgWidth
			imgWidth = imgHeight
			imgHeight = tmp
		}
		if (cropWidth > imgWidth) cropWidth = imgWidth
		if (cropHeight > imgHeight) cropHeight = imgHeight
		if (cropLeft < imgLeft) cropLeft = imgLeft
		if (cropLeft + cropWidth > imgLeft + imgWidth) cropLeft = imgLeft + imgWidth - cropWidth
		if (cropTop < imgTop) cropTop = imgTop
		if (cropTop + cropHeight > imgTop + imgHeight) cropTop = imgTop + imgHeight - cropHeight
		let animateStyle = 'all 0.3s'
		let array = [cropBox, bottomMask, topMask, rightMask, leftMask]
		array.forEach((el) => {
			el.style.transition = animateStyle
		})
		this.setMaskStyle(cropLeft, cropTop, cropWidth, cropHeight)
		setTimeout(() => {
			array.forEach((el) => {
				el.style.transition = ''
			})
		}, 300)
	}
	handleMouseDown(e) {
		this.startPos = {clientX: e.clientX, clientY: e.clientY}
	}
	resizeTop(cropHeight, cropTop, moveY) {
		let {minCropHeight} = this.config
		let newHeight = cropHeight - moveY
		let newTop = cropTop + moveY
		if (newHeight < minCropHeight) return
		if (newTop < 0) {
			newTop = 0
		}
		return {newTop, newHeight}
	}
	resizeBottom(cropHeight, cropTop, moveY) {
		let {containerH} = this
		let {minCropHeight} = this.config
		let newHeight = cropHeight + moveY
		if (newHeight < minCropHeight) return
		if (cropTop + newHeight > containerH) {
			newHeight = containerH - cropTop
		}
		return {newHeight}
	}
	/* 图片尺寸与裁剪不能小于裁剪区尺寸 */
	adjustToCrop(imgWidth, imgHeight) {
		let {orgImgW, orgImgH} = this
		let {cropWidth, cropHeight} = this.config
		let imgRatio = orgImgW / orgImgH
		let cropRatio = cropWidth / cropHeight
		if (imgHeight < cropHeight) {
			this.config.canReduce = false
			if (imgWidth < cropWidth) {
				if (imgRatio > cropRatio) {
					imgHeight = cropHeight
					imgWidth = imgHeight * imgRatio
				} else {
					imgWidth = cropWidth
					imgHeight = imgWidth / imgRatio
				}
			} else {
				imgHeight = cropHeight
				imgWidth = imgHeight * imgRatio
			}
		} else {
			if (imgWidth < cropWidth) {
				this.config.canReduce = false
				imgWidth = cropWidth
				imgHeight = imgWidth / imgRatio
			}
		}
		return {imgWidth, imgHeight}
	}
}
