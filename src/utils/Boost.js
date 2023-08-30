/* eslint-disable */
Array.prototype.pushWithoutDuplicate = function () { // 函數的 this 指向 "調用者"
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
