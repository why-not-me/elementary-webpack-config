import './style/index.less'
class WebDeveloper {
  constructor({ name, age }) {
    this.name = name
    this.age = age
    this.desc = '是只程序猿哦'
  }
  getName() {
    return this.name
  }
}

const newWebDeveloper = new WebDeveloper({ name: 'wjm', age: '24' })

console.log('新生成的开发者', newWebDeveloper)

const avatarImg = require('./img/avatar-min.png')
const img = new Image()
img.src = avatarImg
document.body.appendChild(img)

const lesstenimg = require('./img/less-ten-img.png')
const lesstenImg = new Image()
lesstenImg.src = lesstenimg
document.body.appendChild(lesstenImg)

/**
 * 函数节流，计时器实现
 */

function throttle(func, wait) {
  let timer
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        func.apply(this, arguments)
      }, wait)
    }
  }
}
