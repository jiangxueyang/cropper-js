
## Installation
```
npm install cropper-js -S
```

## Quick Start
```
import CropperJS from 'cropper-js'

new CropperJS({
    imageSrc: './images/1.jpeg',
    containerEl: '.wrap',
    mangnifyEl: '#magnify',
    reduceEl: '#reduce',
    cropEl: '#cut',
    rotateEl: '#rotate',
    onRender() {
        console.log('render success')
    },
    onManify(config) {
        console.log(config, 'magnify')
    },
    onReduce(config) {
        console.log(config, 'reduce')
    },
    onCrop(url) {
        console.log(url, 'url)
    }
})
```