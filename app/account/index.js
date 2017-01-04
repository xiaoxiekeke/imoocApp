'use strict';
//es6语法
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  AlertIOS
} from 'react-native';
import config from '../common/config';
import request from '../common/request';
import sha1 from 'sha1';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress'
var width=Dimensions.get('window').width;
var photoOptions = {
  title: '选择头像',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'选择相册',
  quality:0.75,
  allowEditing:true,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};
var CLOUDINARY = {
  cloud_name: 'xiaoke',
  api_key: '257192715654639',
  api_secret: 'YCkXEZjQFCzUgHJIwC1fyIpeGqg',
  base:'http://res.cloudinary.com/xiaoke',
  image:'https://api.cloudinary.com/v1_1/xiaoke/image/upload',
  video:'https://api.cloudinary.com/v1_1/xiaoke/video/upload',
  audio:'https://api.cloudinary.com/v1_1/xiaoke/raw/upload'
}

//生成图片的标准地址
function avatar(id,type){
  if (id.indexOf('http')> -1) {
    return id
  }

  if (id.indexOf('data:image')> -1){
    return id
  }
  return CLOUDINARY.base+'/'+type+'/upload/'+id
}

var ImagePicker = require('NativeModules').ImagePickerManager;
var Account=React.createClass({
  getInitialState(){
    var user = this.props.user || {}//空对象
    return{
      user:user,
      avatarProgress:0,
      avatarUploading:false
    }
  },

  _pickPhoto(){
    var that =this
    ImagePicker.showImagePicker(photoOptions, (res) => {

      if (res.didCancel) {
        return
      }


      var avatarData = 'data:image/jpeg;base64,' + res.data

      // 修改avatar数据
      // var user = that.state.user
      // user.avatar=avatarData
      // that.setState({
      //   user:user
      // })

      var timestamp=Date.now();//时间戳
      var tags='app,avatar'
      var folder='avatar'
      var signatureURL=config.api.base+config.api.signature
      var accessToken=this.state.user.accessToken
      request.post(signatureURL,{
        accessToken:accessToken,
        timestamp:timestamp,
        folder:folder,
        tags:tags,
        type:'avatar'
      })
      .catch((err) => {
        console.log(err);
      })
      .then((data)=>{
        if (data && data.success) {
          //模拟生成签名值，应该在后端进行的
          var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + CLOUDINARY.api_secret
          signature = sha1(signature)
          var body = new FormData()
          body.append('folder', folder)
          body.append('signature', signature)
          body.append('tags', tags)
          body.append('timestamp', timestamp)
          body.append('api_key', CLOUDINARY.api_key)
          body.append('resource_type', 'image')
          body.append('file', avatarData)
          that._upload(body)
        }
      })

    });
  },

  //把图片上传到图床
  _upload(body){
    var that = this
    var xhr = new XMLHttpRequest()
    var url = CLOUDINARY.image
    xhr.open('POST',url)
    console.log(body)
    //上传之前设置状态
    this.setState({
      avatarUploading:true,
      avatarProgress:0
    })

    xhr.onload = () => {

      if (xhr.status!==200) {
        AlertIOS.alert('请求失败2')
        console.log(xhr.responseText)
        return
      }
      if (!xhr.responseText) {
        AlertIOS.alert('请求失败')
        return
      }
      var response
      try {
        response=JSON.parse(xhr.response)
      }
      catch(e){
        console.log(e)
        console.log('parse fails')
      }

      //如果返回public_id则表示上传成功
      if (response&&response.public_id) {
        var user=this.state.user
        user.avatar = response.public_id  //获取图片标准地址
        //上传之后设置状态
        that.setState({
          user:user,
          avatarUploading:false,
          avatarProgress:0
        })
        // 向后台同步用户数据
        that._asyncUser(true)
      }
    }

    //设置上传进度
    if(xhr.upload){
      xhr.upload.onprogress=(event) =>{
        if(event.lengthComputable){
          var percent=Number((event.loaded/event.total).toFixed(2))
          that.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body)
  },

  _asyncUser(isAvatar) {
    var that = this
    var user = this.state.user
    if(user && user.accessToken){
      var url = config.api.base + config.api.update
      request.post(url,user)
      .then((data)=>{
        if (data && data.success) {
          var user = data.data
          if(isAvatar){
            AlertIOS.alert('头像更新成功')
          }
          that.setState({
            user:user
          },function(){
            AsyncStorage.setItem('user',JSON.stringify(user))
          })
        }
      })
      .catch((err) => {
        console.log(err);
      })
    }
  },

  componentDidMount(){
    var that=this

    AsyncStorage.getItem('user')
    .then((data)=>{
      var user
      if (data) {
        user=JSON.parse(data)
      }
      if (user && user.accessToken) {
        that.setState({
          user:user
        })
      }
    })
  },

  render(){
    var user = this.state.user
    return (

      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>狗狗的账户
          </Text>
          <Text style={styles.toolbarExtra}>编辑</Text>
        </View>

        {
          user.avatar
          ?<TouchableOpacity
           onPress={this._pickPhoto}
           style={styles.avatarContainer}>
            <Image source={{uri:avatar(user.avatar,'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                  ?<Progress.Circle
                    showsText={true}
                    size={75}
                    color={'#ee735c'}
                    progress={this.state.avatarProgress}
                     />
                  :<Image source={{uri:avatar(user.avatar,'image')}}
                          style={styles.avatar}/>
                }

              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          :<TouchableOpacity
          onPress={this._pickPhoto}
          style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加狗狗头像</Text>
            <View style={styles.avatarBox}>
              {
                this.state.avatarUploading
                ?<Progress.Circle
                  showsText={true}
                  size={75}
                  color={'#ee735c'}
                  progress={this.state.avatarProgress}
                   />
                :<Icon name='ios-cloud-upload-outline'
                      style={styles.plusIcon} />
              }
            </View>
          </TouchableOpacity>
        }
      </View>
    )
  }
});



//es5语法
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle:{
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  toolbarExtra:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#666'
  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  avatar:{
    marginBottom:15,
    width:width * .2,
    height:width * .2,
    resizeMode: 'cover',
    borderRadius: width * .1
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:24,
    backgroundColor:'#fff',
    borderRadius: 8,
  }

});

module.exports=Account;
