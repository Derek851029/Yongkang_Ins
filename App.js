/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {Router, Scene} from 'react-native-router-flux';
import React, { Component } from 'react';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from './Home.js'
import Login from './Login.js'
import Scedule from './Scedule.js'
import Check_list from './Check_List.js'
import Add_RFID from './Add_RFID.js'
import Edit_RFID from './Edit_RFID.js'
import Take_Photo2 from './Take_Photo2.js'
import System from './System.js'
import Task_Content from './Task_Content.js'

export default class App extends React.Component {

  componentDidMount = async () =>{
    AsyncStorage.setItem('@Inspection:IP','http://192.168.10.4:5008/')
    // AsyncStorage.setItem('@Inspection:IP','http://210.68.227.123:5008/')
  }

  constructor(props) {
    super(props);
  }
  render() {
    const RootStack = () =>{
      return(
        <Router>
        <Scene key="root">
          <Scene key="Login" component={Login} title="登入" initial></Scene>
          <Scene key="Home" component={Home} title="首頁" ></Scene>
          <Scene key="Scedule" component={Scedule} title="行事曆"></Scene>
          <Scene key="Check_list" component={Check_list} title="檢查表"></Scene>
          <Scene key="Add_RFID" component={Add_RFID} title="新增設備"></Scene>
          <Scene key="Edit_RFID" component={Edit_RFID} title="修改設備"></Scene>
          <Scene key="Take_Photo2" component={Take_Photo2} title="相機"></Scene>
          <Scene key="System" component={System} title="系統設定"></Scene>
          <Scene key="Task_Content" component={Task_Content} title="檢查項目"></Scene>
        </Scene>
        </Router>
      )
    };
    return <RootStack />;
  }
}