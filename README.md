
## Installation
### CLI
```
npm install cutterjs -S
```
### Browser

```
<script src="https://unpkg.com/cutterjs@1.0.5/dist/cutterjs.min.js"></script>
```

## Quick Start
```
// init
let cutter = new Cutter({
    imageSrc: './images/bg.jpeg',
    containerEl: '.wrap',
    scalable: false,
    zoomable: false,
    rotatable: false,
    cutBoxResizable: false,
    scaleEl: '#scale',
    zoomEl: '#zoom',
    cutEl: '#cut',
    rotateEl: '#rotate',
    outputType: 'jpeg',
    onRender() {
        console.log('渲染成功')
    },
    onScale(config) {
        console.log(config, 'has scaled')
    },
    onZoom(config) {
        console.log(config, 'has zoomed')
    },
    onCut(url) {
        console.log(url, 'image base64 url')
        document.querySelector('#image').src = url
    }
})

// get cropped image's base64 url
let imagUrl = cutter.cutImage()
```

## Params
Param|Type|required|Default|Notes
---|---|---|---|---
imageSrc|String|true|''|A image's source that will be cropped.
containerEl|String|true|''|A area that operate cropping a image. It can be a class name or a id.
scalable|Boolean|false|true|If true, the image can be scaled.
zoomable|Boolean|false|true|If true, the image can be zoomed.
ratatable|Boolean|false|true|If true, the image can be rotated.
cutBoxResizable|Boolean|false|true|If true, the size of the cropped image can be resized.
scaleEl|String|false|''|A dom that can trigger scaling the image.If the value of scalable is true, it is required.
zoomEl|String|false|''|A dom that can trigger zooming the image.If the value of zoomable is true, it is required.
rotateEl|String|false|''|A dom that can trigger rotating the image.If the value of ratatable is true, it is required.
cutEl|String|false|''|A dom that can trigger cropping the image.
minCutWidth|Number|false|16|The minimum width of the cropped image's size.
cutWidth|Number|false|200|The width of the cropped image's  It must be bigger than the value of minCutWidth.
minCutHeight|Number|false|16|The minimum height of the cropped image's size.
cutHeight|Number|false|200|The heigth of the cropped image's size. It must be bigger than the value of minCutHeight.
maxScaleRatio|Number|false|3|The maximum scale ratio of the image.
maxZoomRatio|Number|false|3|The maximum zoom ratio of the image.
outputType|String|false|png|The cropped image's type, png or jpeg.
onRender|Function|false|null|The callback after rendering successfully.
onCut|Function|false|null|The callback after cropping. It will return base64 url of the cropped image.
onScale|Function|false|null|The callback after scaling. It will return all config.
onZoom|Function|false|null|The callback after zooming. It will return all config.

## Methods
- cutImage(imageUrl)
    cut the image and get the image's base64 url
    ```
    let cutter = new Cutter(
        ...
    )
    let imageUrl = cutter.cutImage()
    ```
