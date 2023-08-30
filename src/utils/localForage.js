import localForage from 'localforage'

export const setLocalForage = (key, data, cb, cb2) => {
  localForage.setItem(key, data).then((value) => {
    if (cb) cb(value)
  }).catch((err) => {
    if (cb2) cb2(err)
  })
}

export const getLocalForage = (key, cb) => {
  localForage.getItem(key, (err, value) => {
    cb(err, value)
  })
}

export const removeLocalForage = (key, cb, cb2) => {
  localForage.removeItem(key).then(() => {
    if (cb) cb()
  }).catch((err) => {
    if (cb2) cb2(err)
  })
}

export const clearLocalForage = (cb, cb2) => {
  localForage.clear().then(() => {
    if (cb) cb()
  }).catch((err) => {
    if (cb2) cb2(err)
  })
}

export const lengthLocalForage = (cb) => {
  localForage.length().then(
    numberOfKeys => {
      if (cb) cb(numberOfKeys)
      // console.log(numberOfKeys)
    }).catch((err) => {
    // eslint-disable-next-line no-empty
    if (err) {}
    // console.log(err)
  })
}

export const iteratorLocalForage = () => {
  localForage.iterate((value, key, iterationNumber) => {
    // console.log([key, value])
  }).then(() => {
    // console.log('Iteration has completed')
  }).catch((err) => {
    // eslint-disable-next-line no-empty
    if (err) {}
    // console.log(err)
  })
}

export const support = () => {
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || null
  if (indexedDB) {
    return true
  } else {
    return false
  }
}
