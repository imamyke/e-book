const { defineConfig } = require('@vue/cli-service')

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  transpileDependencies: true,
  assetsDir: 'static',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://47.99.166.157:3080',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }
      middlewares
        .unshift({
          name: 'home',
          path: '/book/home',
          middleware: (req, res) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.json(homeData)
          }
        })
      middlewares
        .unshift({
          name: 'home',
          path: '/book/shelf',
          middleware: (req, res) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.json(shelfData)
          }
        })
      middlewares
        .unshift({
          name: 'home',
          path: '/book/list',
          middleware: (req, res) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.json(listData)
          }
        })
      middlewares
        .unshift({
          name: 'home',
          path: '/book/flat-list',
          middleware: (req, res) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.json(flatListData)
          }
        })
      return middlewares
    }
  }
})
