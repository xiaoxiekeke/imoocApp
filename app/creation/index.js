'use strict';
//es6语法
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import Mock from 'mockjs';
import config from '../common/config'
import request from '../common/request';
import Detail from './Detail'

var width=Dimensions.get('window').width;

var cachedResults={
  nextPage:1,
  items:[],
  total:0
}

var Item=React.createClass({
  getInitialState(){
    var row=this.props.row
    return {
      up:row.voted,
      row:row
    }
  },

  _up(){//点赞
    var up=!this.state.up
    var row=this.state.row
    var url=config.api.base+config.api.up
    var that = this
    var body={
      id:row._id,
      up:up?'yes':'no',
      accessToken:'123'
    }
    request.post(url,body)
    .then(function(data){
      if(data&&data.success){
        that.setState({
          up:up
        })
      }else{
        Alert.alert("点赞失败，稍后重试")
      }
    })
    .catch(function(err){
      console.log(err)
      Alert.alert("点赞失败，稍后重试")
    })
  },
  render(){
    var row=this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image source={{uri:row.thumb}} style={styles.thumb}>
            <Icon name='ios-play' size={28} style={styles.play}/>
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name={this.state.up?'ios-heart':'ios-heart-outline'}
                    size={28}
                    style={[styles.up,this.state.up?null:styles.down]}
                    onPress={this._up}/>
              <Text style={styles.handleText}
                    onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon name='ios-chatboxes-outline' size={28} style={styles.down}/>
              <Text style={styles.commentIcon}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
});

var List=React.createClass({

  getInitialState:function(){
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    return {
      isLoadingTail:false,
      isRefreshing:false,
      dataSource: ds.cloneWithRows([]),
    };
  },

  _renderRow:function(row){//在list里面渲染item
    return <Item
            key={row._id}
            onSelect={() => this._loadPage(row)}
            row={row} />
  },

  componentDidMount:function(){
    this._fetchData(1);
  },

  _fetchData:function(page){
    if(page!==0){
      this.setState({
        isLoadingTail:true
      });
    }else{
      this.setState({
        isRefreshing:true
      })
    }
    request.get(config.api.base+config.api.creations,{
      accessToken:'123',
      page:page
    })
    .then((data) => {
      var that =this
      if(data.success){
        var items=cachedResults.items.slice()
        if(page !== 0){
          items=items.concat(data.data)
        }else{
          items=data.data.concat(items)
        }
        cachedResults.items=items
        cachedResults.total=data.total

        if(page !== 0){
          that.setState({
            isLoadingTail:false,
            dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })
        }else{
          that.setState({
            isRefreshing:false,
            dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })
        }

      }
    })
    .catch((error) => {
      if(page!==0){
        this.setState({
          isLoadingTail:false,
        })
      }else{
        this.setState({
          isRefreshing:false,
        })
      }
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

  _onRefresh(){
    if(!this._hasMore()||this.state.isRefreshing){
      return
    }

    this._fetchData(0)
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

  _loadPage(row){
    //在_loadPage方法里执行navigator的push方法
    this.props.navigator.push({
      name:'detail',
      component:Detail,
      params:{
        data:row
      }

    })
  },

  render:function(){
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#f60"
              title="拼命加载中..."
              titleColor="#f60"
            />
          }
          onEndReachedThreshold={20}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets ={false}
        />
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
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  headerTitle:{
    color:'#fff',
    fontSize:16,
    textAlign:'center',
    fontWeight:'600'
  },
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  thumb:{
    width:width,
    height:width * 0.56,
    resizeMode:'cover'
  },
  title:{
    padding:10,
    fontSize:18,
    color:'#333'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width / 2 - 0.5,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#eb7d66'
  },
  handleText:{
    left:12,
    fontSize:18,
    color:'#333'
  },
  down:{
    fontSize:22,
    color:'#333'
  },
  up:{
    fontSize:22,
    color:'#eb7d66'
  },

  commentIcon:{
    fontSize:22,
    color:'#333'
  },
  loadingMore:{
    marginVertical:20,
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  }

});

module.exports=List;
