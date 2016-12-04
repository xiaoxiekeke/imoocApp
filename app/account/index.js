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
  AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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

var ImagePicker = require('NativeModules').ImagePickerManager;
var Account=React.createClass({
  getInitialState(){
    var user = this.props.user || {}//空对象
    return{
      user:user
    }
  },

  _pickPhoto(){
    var that =this
    ImagePicker.showImagePicker(photoOptions, (res) => {

      if (res.didCancel) {
        return
      }


      var avatarData = 'data:image/jpeg;base64,' + res.data
      var user = that.state.user

      user.avatar=avatarData

      that.setState({
        user:user
      })


    });
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
          <Text style={styles.toolbarTitle}>我的账户
          </Text>
        </View>


        {
          user.avatar
          ?<TouchableOpacity
           onPress={this._pickPhoto}
           style={styles.avatarContainer}>
            <Image source={{uri:user.avatar}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Image source={{uri:user.avatar}}
                        style={styles.avatar}/>
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          :<TouchableOpacity
          onPress={this._pickPhoto}
          style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加狗狗头像</Text>
            <View style={styles.avatarBox}>
              <Icon name='ios-cloud-upload-outline'
                    style={styles.plusIcon} />
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
