'use strict'

module.exports={
  header:{
    method:'POST',
    headers:{
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  },
  api:{
    base:'http://rap.taobao.org/mockjs/9797/',
    creations:'api/creations',
    comments:'api/comments',
    up:'api/up',
    signup:'api/u/signup',
    verify:'api/u/verify'
  }
}
