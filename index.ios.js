/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 父子组件撕逼大战
 */
'use strict';
//es6语法
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

var List=require('./app/creation/index');
var Edit=require('./app/edit/index');
var Login=require('./app/account/login');
var Account=require('./app/account/index');

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  Navigator,
  AsyncStorage
} from 'react-native';


//es5语法
// var React=require('react-native')
// var {
//   AppRegistry,
//   StyleSheet,
//   Text,
//   View
// } = React

// var React=require('react-native')
// var Component=React.Component
// var AppRegistry=React.AppRegistry
// var StyleSheet=React.StyleSheet
// var Text=React.Text
// var View=React.View
// var TabBarIOS=React.TabBarIOS
// var Icon=require('react-native-vector-icons/Ionicons');



// es5语法imoocApp
var imoocApp =React.createClass({

  getInitialState: function() {
    return {
      selectedTab: 'account',
      logined:false
    };
  },

  componentDidMount(){
    this._asyncAppStatus()
  },

  _asyncAppStatus(){
    var that = this
    AsyncStorage.getItem('user')
    .then((data)=>{
      var user
      var newState={}
      if(data){
        user=JSON.parse(data)
      }
      if(user && user.accessToken){
        newState.user=user
        newState.logined=true
      }else{
        newState.logined=false
      }
      that.setState(newState)
    })
  },
  _afterLogin(user){
    var that =this
    var user=JSON.stringify(user)
    AsyncStorage.setItem('user',user)
    .then(()=>{
      that.setState({
        logined:true,
        user:user
      })
    })
  },
  render: function() {
    if (!this.state.logined) {
      return <Login afterLogin={this._afterLogin}/>
    }
    return (
      <TabBarIOS tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list'
            })
          }}>
          <Navigator
          initialRoute={{
            name:'list',
            component:List
          }}
          configureScene={(route)=>{
            return Navigator.SceneConfigs.FloatFromRight
          }}
          renderScene={(route,navigator)=>{
            var Component=route.component
            return <Component {...route.params} navigator={navigator} />
          }}/>
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          badge={5}
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit'
            })
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account'
            })
          }}>
          <Account />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }

})



//es5语法
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})



AppRegistry.registerComponent('imoocApp', () => imoocApp);
