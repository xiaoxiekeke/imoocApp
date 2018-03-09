'use strict'
var baseconfig={
  rap:'http://rap.taobao.org/mockjs/9797/',
  local:'http://localhost:1234/',
  localIniOS:'http://192.168.66.224:1234/',
  prod:'http://gougou.xiaoxiekeke.com/'
}
module.exports={
  header:{
    method:'POST',
    headers:{
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  },
  api:{
    base:baseconfig.prod,
    creations:'api/u/creations',
    comments:'api/u/comments',
    up:'api/u/up',
    video:'api/creations/video',
    update:'api/u/update',
    signature:'api/signature',
    signup:'api/u/signup',
    verify:'api/u/verify'
  },
  qiniu:{
    upload:'http://upload.qiniu.com'
  },
  cloudinary:{
    cloud_name: 'xiaoke',
    api_key: '257192715654639',
    api_secret: 'YCkXEZjQFCzUgHJIwC1fyIpeGqg',
    base:'http://res.cloudinary.com/xiaoke',
    image:'https://api.cloudinary.com/v1_1/xiaoke/image/upload',
    video:'https://api.cloudinary.com/v1_1/xiaoke/video/upload',
    audio:'https://api.cloudinary.com/v1_1/xiaoke/raw/upload'
  }
}
