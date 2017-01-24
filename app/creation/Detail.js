'use strict';
//es6语法
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ListView,
  TextInput,
  Modal,
  AlertIOS
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../common/config';
import request from '../common/request';
var width=Dimensions.get('window').width;
var Video =require('react-native-video').default;
var Button =require('react-native-button').default;
var cachedResults={
  nextPage:1,
  items:[],
  total:0
}

var Detail=React.createClass({
  getInitialState(){
    var data=this.props.data
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })
    return {
      data:data,

      //comments
      dataSource: ds.cloneWithRows([]),

      //video load
      videoOK:true,
      videoLoaded:false,
      playing:false,
      paused:false,
      videoProgress:0.01,
      videoTotal:0,
      currentTime:0,

      //video player
      rate:1,
      muted:false,
      resizeMode:'contain',
      repeat:true,

      //modal
      content:'',
      animationType:'none',
      modalVisible:false,
      isSending:false

    }
  },
  _pop(){
    this.props.navigator.pop()
  },
  _onLoadStart(){
    console.log('onLoadStart');
  },
  _onLoad(){
    console.log('onLoad');
  },
  _onProgress(data){
    if(!this.state.videoLoaded){
      this.setState({
        videoLoaded:true
      })
    }

    var duration=data.playableDuration
    var currentTime=data.currentTime
    var percent=Number((currentTime / duration).toFixed(2))
    var newState={
      videoTotal:duration,
      currentTime:Number(currentTime / duration).toFixed(2),
      videoProgress:percent
    }
    if (!this.state.videoLoaded) {
      newState.videoLoaded=true
    }
    if (!this.state.playing) {
      newState.playing=true
    }
    this.setState(newState)

  },
  _onEnd(){
    this.setState({
      videoProgress:1,
      playing:false
    });
    console.log('onEnd');
  },
  _onError(e){
    this.setState({
      videoOK:false
    });
  },
  _rePlay(){
    this.refs.videoPlayer.seek(0)
  },
  _pause(){
    if (!this.state.paused) {
      this.setState({
        paused:true
      });
    }
  },
  _resume(){
    if (this.state.paused) {
      this.setState({
        paused:false
      });
    }
  },

  componentDidMount(){
    this._fetchData()
  },


  _fetchData:function(page){
    this.setState({
      isLoadingTail:true
    });
    request.get(config.api.base + config.api.comments,{
      accessToken:'123',
      page:page,
      creation:124
    })
    .then((data) => {
      var that =this
      if(data.success){
        var items=cachedResults.items.slice()
        items=items.concat(data.data)

        cachedResults.items=items
        cachedResults.total=data.total

        that.setState({
          isLoadingTail:false,
          dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
        })

      }
    })
    .catch((error) => {
      this.setState({
        isLoadingTail:false,
      })
      console.warn(error);
    });
  },

  _hasMore:function(){
    return cachedResults.items.length!== cachedResults.total
  },

  _fetchMoreData:function(){
    if(!this._hasMore()||this.state.isLoadingTail){
      return
    }
    var page=cachedResults.nextPage
    cachedResults.nextPage+=1
    this._fetchData(page)
  },

  _renderFooter:function(){
    if(!this._hasMore() && cachedResults.total!==0){
      return(
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            没有更多了
          </Text>
        </View>
      )
    }

    if(!this.state.isLoadingTail){
      return <View style={styles.loadingMore} />
    }

    return <ActivityIndicator style={styles.loadingMore}/>
  },



  _renderRow(row){
    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri:row.replyBy.avatar}}/>
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    )
  },

  _focus(){
    this._setModalVisible(true)
  },

  _blur(){

  },

  _closeModal(){
    this._setModalVisible(false)
  },

  _setModalVisible(isVisible){
    this.setState({
      modalVisible:isVisible
    })
  },

  _renderHeader(){
    var data=this.state.data
    return (
      <View style={styles.listHeader}>

        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri:data.author.avatar}}/>
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>

        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <TextInput
              placeholder="敢不敢评论一个"
              style={styles.content}
              multiline={true}
              onFocus={this._focus}
            />
          </View>
        </View>

        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>
            精彩评论
          </Text>
        </View>
      </View>
    )
  },

  _submit(){
    var that = this
    if (!this.state.content) {
      return AlertIOS.alert('留言不能为空！')
    }
    if (this.state.isSending) {
      return AlertIOS.alert('正在评论中！')
    }
    this.setState({
      isSending:true
    },function(){
      var body={
        accessToken:'abc',
        creation:'123',
        content:this.state.content
      }
      var url=config.api.base+config.api.comments
      request.post(url,body)
      .then(function(data){
        if (data&&data.success) {
          var items=cachedResults.items.slice()
          var content=that.state.content

          items=[{
            content:that.state.content,
            replyBy:{
              nickname:'狗狗说',
              avatar:'http://dummyimage.com/640x640/02a013)'
            }
          }].concat(items)
          cachedResults.items=items
          cachedResults.total=cachedResults.total + 1
          that.setState({
            isSending:false,
            content:'',
            dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })

          that._setModalVisible(false)
        }
      })
      .catch((err) => {
        console.log(err)
        that.setState({
          isSending:false
        })
        that._setModalVisible(false)
        AlertIOS.alert('留言失败')
      })
    })
  },

  render:function(){
    var data = this.props.data
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop}>
          <Icon name='ios-arrow-back'
                  size={30}
                  style={styles.backIcon} />
          <Text style={styles.backText}>返回
          </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} NumberOflines={1}>视频详情页
          </Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri:data.video}}
            style={styles.video}
            volume={20}
            paused={this.state.paused}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}
            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onProgress={this._onProgress}
            onEnd={this._onEnd}
            onError={this._onError} />
          {
            !this.state.videoOK && <Text style={styles.failText}>视频出错了！很抱歉</Text>
          }
          {
            !this.state.videoLoaded && <ActivityIndicator
                                          color="#ee735c"
                                          style={styles.loading}/>
          }
          {
            this.state.videoLoaded && !this.state.playing
            ? <Icon onPress={this._rePlay}
                    name='ios-play'
                    size={30}
                    style={styles.playIcon} />
            : null
          }
          {
            this.state.videoLoaded && this.state.playing
          ? <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
            {
              this.state.paused
              ? <Icon onPress={this._resume} name='ios-play'
                      style={styles.resumeIcon} size={30} />
              :<Text></Text>
            }
            </TouchableOpacity>:null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar,{width:width*this.state.videoProgress}]}></View>
          </View>

        </View>

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderHeader={this._renderHeader}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets ={false}
        />

        <Modal 
               visible={this.state.modalVisible}
               onRequestClose={() => {this._setModalVisible(false)}}>
               <View style={styles.modalContainer}>
                 <Icon
                   onPress={this._closeModal}
                   name='ios-close-outline'
                   style={styles.closeIcon} />
                 <View style={styles.commentBox}>
                   <View style={styles.comment}>
                     <TextInput
                       placeholder="敢不敢评论一个"
                       style={styles.content}
                       multiline={true}
                       defaultValue={this.state.content}
                       onChangeText={(text) => {
                         this.setState({
                           content:text
                         })
                       }}
                     />
                   </View>
                 </View>
                 <Button style={styles.submitBtn} onPress={this._submit}>评论</Button>
               </View>
        </Modal>
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
  modalContainer:{
    flex:1,
    paddingTop:45,
    backgroundColor:'#fff'
  },
  closeIcon:{
    alignSelf:'center',
    fontSize:30,
    color:'#ee753c'
  },
  submitBtn:{
    width:width - 20,
    padding:16,
    marginTop:10,
    marginLeft:10,
    marginBottom:20,
    borderWidth:1,
    borderColor:'#ee753c',
    borderRadius:4,
    fontSize:18,
    color:'#ee753c'
  },
  header:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    width:width,
    height:64,
    paddingTop:20,
    paddingLeft:10,
    borderBottomWidth:1,
    borderColor:'rgba(0,0,0,0.1)',
    backgroundColor:'#fff'
  },
  backBox:{
    position:'absolute',
    left:12,
    top:32,
    width:50,
    flexDirection:'row',
    alignItems:'center',
  },
  headerTitle:{
    width:width - 120,
    textAlign:'center'
  },
  backIcon:{
    color:'#999',
    fontSize:20,
    marginRight:5
  },
  backText:{
    color:'#999'
  },
  videoBox:{
    width:width,
    height:width * 0.56,
    backgroundColor:"#000"
  },
  video:{
    width:width,
    height:width * 0.56,
    backgroundColor:'#000'
  },
  failText:{
    position:'absolute',
    left:0,
    top:90,
    width:width,
    textAlign:'center',
    color:'#fff',
    backgroundColor:'transparent'
  },
  loading:{
    position:'absolute',
    left:0,
    top:80,
    width:width,
    alignSelf:'center',
    backgroundColor:'transparent'
  },
  progressBox:{
    width:width,
    height:2,
    backgroundColor:'#ccc'
  },
  progressBar:{
    width:1,
    height:2,
    backgroundColor:'#ff6600'
  },
  playIcon:{
    position:'absolute',
    top:90,
    left:width / 2 - 30,
    width:60,
    height:60,
    paddingTop:14,
    paddingLeft:24,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#eb7d66'
  },
  pauseBtn:{
    position:'absolute',
    left:0,
    top:0,
    width:width,
    height:360
  },
  resumeIcon:{
    position:'absolute',
    top:80,
    left:width / 2 - 30,
    width:60,
    height:60,
    paddingTop:14,
    paddingLeft:24,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    alignSelf:'center',
    color:'#eb7d66'
  },
  infoBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'center',
    marginTop:10
  },
  avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30
  },
  descBox:{
    flex:1
  },
  nickname:{
    fontSize:18
  },
  title:{
    marginTop:8
  },
  replyBox:{
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:10
  },
  replyAvatar:{
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  replyNickname:{
    color:"#666"
  },
  replyContent:{
    marginTop:4,
    color:'#666'
  },
  reply:{
    flex:1
  },
  loadingMore:{
    marginVertical:20,
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  },
  commentBox:{
    marginTop:10,
    marginBottom:10,
    padding:8,
    width:width
  },
  content:{
    paddingLeft:2,
    color:'#333',
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:4,
    fontSize:14,
    height:80
  },
  commentArea:{
    width:width,
    paddingBottom:6,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  }


});

module.exports=Detail;
