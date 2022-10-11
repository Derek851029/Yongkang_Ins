import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableHighlight,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import {Actions} from 'react-native-router-flux'
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog";

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      task: "",
      nfc_id : "",
      dialog: false,
      show: true,
    }
  }

  componentDidMount = async() => {
    let Authority = await AsyncStorage.getItem('@Inspection:Authority')
    if(Authority == '關閉'){
      this.setState({show:false})
    }
  }

  componentWillUnmount() {
  }

  schedule = () => {
    Actions.Scedule();
  }

  check_list = () => {
    Actions.Check_list()
  }

  Add_RFID = () =>{
    this.setState({dialog:true});
  }
  
  setting = () =>{
    Actions.System()
  }

  view_device = () =>{
    Actions.System()
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Dialog.Container visible={this.state.dialog}>
          <Dialog.Title style={{color:'red'}}>請選擇新增/修改:</Dialog.Title>
          <Dialog.Button label="取消" onPress={() =>{this.setState({dialog:false})} } />
          <Dialog.Button label="新增" onPress={()=>{Actions.Add_RFID(); this.setState({dialog:false});}}/>
          <Dialog.Button label="修改" onPress={()=>{Actions.Edit_RFID(); this.setState({dialog:false});}}/>
        </Dialog.Container>
        <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top:0,
              bottom: 0,
              flex: 1 }}
        >
          <Image
            source={require('./assets/images/logo.png')}
            style={{width: '100%', height: '30%',alignSelf:'center',resizeMode:'contain'}}>
          </Image>
          <View style={{width: '100%', height: '25%', flexDirection: 'row',marginBottom: 40,marginTop:30}}>
            <View style={{width: '5%', height: '100%'}}>
            <TouchableHighlight onPress={() =>{Actions.Task_Content({title:'進流抽水站','nfc_id':'412875ED500104E0'})}}><Text>123</Text></TouchableHighlight>
            </View>
            
            <TouchableHighlight //檢查表
              style={{width: '40%', height: '90%'}}
              onPress={this.check_list}>
              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'}}>
                <Image
                  source={require('./assets/images/check_list2.png')}
                  style={{width: '120%', height: '150%'}}>
                </Image>
              </View>
            </TouchableHighlight>
            <View style={{width: '5%', height: '100%'}}>
            </View>
          </View>
          <View style={{width: '100%', height: '2%', flexDirection: 'row'}}>
          </View>

          <View style={{width: '100%', height: '25%', flexDirection: 'row'}}>
            <View style={{width: '5%', height: '100%'}}>
            </View>
            
            {this.state.show &&<TouchableHighlight //新增RFID 這邊有做顯示不顯示處理:true顯示 false不顯示
              style={{width: '40%', height: '90%'}}
              onPress={this.Add_RFID}>
              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'}}>
                <Image
                  source={require('./assets/images/add.png')}
                  style={{width: '120%', height: '150%'}}>
                </Image>
              </View>
            </TouchableHighlight>}
            {this.state.show && <View style={{width: '10%', height: '100%'}}>
            </View>}
            <TouchableHighlight //系統設定
              style={{width: '40%', height: '90%'}}
              onPress={this.setting}>
              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'}}>
                <Image
                  source={require('./assets/images/setting2.png')}
                  style={{width: '120%', height: '150%'}}>
                </Image>
              </View>
            </TouchableHighlight>
            <View style={{width: '5%', height: '100%'}}>
            </View>
          </View>
          <View style={{width: '100%', height: '10%', flexDirection: 'row'}}></View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

 export default Home;
