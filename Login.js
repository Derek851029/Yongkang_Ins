import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
    ImageBackground,
    Text,
    TextInput,
    TouchableOpacity,
    Alert
  } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import {Actions} from 'react-native-router-flux'
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeLoading from 'react-native-awesome-loading'

export default class Login extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
          IP: '',
          account: '',
          password:'',
          loading: false
        }
    }
    
    componentDidMount = async() =>{
      let IP = await AsyncStorage.getItem('@Inspection:IP')
      this.setState({IP:IP})

      let account = await AsyncStorage.getItem('@Inspection:account')
      let password = await AsyncStorage.getItem('@Inspection:password')
      let Authority = await AsyncStorage.getItem('@Inspection:Authority')
      console.log(account + password + Authority)
      if(account != null && password != null){
        if(Authority == '關閉'){
          Actions.reset('Home')
        }
        else{
          Actions.reset('Home')
        }
      }
    }

    Login = async() =>{
      let account = this.state.account;
      let password = this.state.password;
      console.log(this.state.IP)
      if(account != "" && password != ""){
        this.setState({loading:true})

        fetch(''+this.state.IP+'Login',{
          timeout:5000,
          method : 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              'account': account,
              'password': password,
          })
        })
        .then(response => response.json())
        .then((response) =>{
          this.setState({loading:false})

          AsyncStorage.setItem('@Inspection:account',account)
          AsyncStorage.setItem('@Inspection:password',password)

          //Actions.reset('Home')
          if(response.Authority == '開啟'){
            AsyncStorage.setItem('@Inspection:Authority',response.Authority.toString())
            Actions.reset('Home')
          }
          else if(response.Authority.length == 0){
            Alert.alert(
              "警告:",
              "帳號或密碼錯誤，請重新嘗試",
              [
                { text: "OK", onPress: () => {this.setState({loading: false});} }
              ]
            );
          }
          else if(response.Authority=='關閉'){
            AsyncStorage.setItem('@Inspection:Authority',response.Authority.toString())
            Actions.reset('Home')
          }
        })
        .catch((e)=>{
            this.setState({loading:false})
            console.log(e)
            Alert.alert(
                "警告:",
                "伺服器發生錯誤，請重新嘗試或洽詢管理員",
                [
                    { text: "OK", onPress: () => {this.setState({loading: false});} }
                ]
            );
        })    
      }
      else{
        if(this.state.account == ""){
          Alert.alert(
            "警告:",
            "請輸入帳號",
            [
              { text: "OK", onPress: () => {}}
            ]
          )
        }
        else if(this.state.password == ""){
          Alert.alert(
            "警告:",
            "請輸入密碼",
            [
              { text: "OK", onPress: () => {}}
            ]
          )
        }
      }
    }

    render(){
      return(
          <View style={styles.root}>
              <View style={styles.background}>
                  <ImageBackground
                  style={styles.rect}
                  source={require('./assets/images/Gradient_VHD2HEh.png')}
                  >
                      <View style={styles.logoColumn}>
                          <View style={styles.logo}>
                              <View style={styles.endWrapperFiller}></View>
                              <View style={styles.text3Column}>
                                  <Text style={styles.text3}>台南永康巡檢</Text>
                                  <View style={styles.rect7}></View>
                              </View>
                          </View>
                          <View style={styles.form}>
                              <View style={styles.usernameColumn}>
                                  <View style={styles.username}>
                                      <Icon
                                      name="person"
                                      style={styles.icon22}
                                      ></Icon>
                                      <TextInput
                                      placeholder="使用者名稱"
                                      placeholderTextColor="rgba(255,255,255,1)"
                                      secureTextEntry={false}
                                      onChangeText = {(text)=>this.setState({account:text})}
                                      style={styles.usernameInput}
                                      ></TextInput>
                                  </View>
                                  <View style={styles.password}>
                                      <Icon
                                      name="lock-closed"
                                      style={styles.icon2}
                                      ></Icon>
                                      <TextInput
                                      placeholder="密碼"
                                      placeholderTextColor="rgba(255,255,255,1)"
                                      secureTextEntry={true}
                                      onChangeText = {(text)=>this.setState({password:text})}
                                      style={styles.passwordInput}
                                      ></TextInput>
                                  </View>
                              </View>
                              <View style={styles.usernameColumnFiller}></View>
                              <TouchableOpacity
                              onPress={() => this.Login()}
                              style={styles.button}
                              >
                              <Text style={styles.text2}>登入</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                      <View style={styles.logoColumnFiller}></View>
                  </ImageBackground>
              </View>
              <AwesomeLoading indicatorId={1} size={50} isActive={this.state.loading} text="" />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "rgb(255,255,255)"
    },
    background: {
      flex: 1
    },
    rect: {
      flex: 1
    },
    logo: {
      width: 200,
      height: 111,
      alignSelf: "center"
    },
    endWrapperFiller: {
      flex: 1
    },
    text3: {
      color: "rgba(255,255,255,1)",
      fontSize:20,
      marginBottom: 4
    },
    rect7: {
      height: 8,
      backgroundColor: "#25cdec",
      marginRight: 11
    },
    text3Column: {
      marginBottom: 6,
      marginLeft: 2,
      marginRight: -8
    },
    form: {
      height: 230,
      marginTop: 144
    },
    username: {
      height: 59,
      backgroundColor: "rgba(251,247,247,0.25)",
      borderRadius: 5,
      flexDirection: "row"
    },
    icon22: {
      color: "rgba(255,255,255,1)",
      fontSize: 30,
      marginLeft: 20,
      alignSelf: "center"
    },
    usernameInput: {
      height: 40,
      color: "rgba(255,255,255,1)",
      flex: 1,
      marginRight: 11,
      marginLeft: 11,
      marginTop: 14
    },
    password: {
      height: 59,
      backgroundColor: "rgba(253,251,251,0.25)",
      borderRadius: 5,
      flexDirection: "row",
      marginTop: 27
    },
    icon2: {
      color: "rgba(255,255,255,1)",
      fontSize: 33,
      marginLeft: 20,
      alignSelf: "center"
    },
    passwordInput: {
      height: 40,
      color: "rgba(255,255,255,1)",
      flex: 1,
      marginRight: 17,
      marginLeft: 8,
      marginTop: 14
    },
    usernameColumn: {},
    usernameColumnFiller: {
      flex: 1
    },
    button: {
      height: 59,
      backgroundColor: "rgba(31,178,204,1)",
      borderRadius: 5,
      justifyContent: "center"
    },
    text2: {
      color: "rgba(255,255,255,1)",
      alignSelf: "center"
    },
    logoColumn: {
      marginLeft: 41,
      marginRight: 41
    },
    logoColumnFiller: {
      flex: 1
    },
    footerTexts: {
      height: 14,
      flexDirection: "row",
      marginBottom: 36,
      marginLeft: 37,
      marginRight: 36
    },
    button2: {
      width: 104,
      height: 14,
      alignSelf: "flex-end"
    },
    createAccountFiller: {
      flex: 1
    },
    createAccount: {
      color: "rgba(255,255,255,0.5)"
    },
    button2Filler: {
      flex: 1,
      flexDirection: "row"
    },
    needHelp: {
      color: "rgba(255,255,255,0.5)",
      alignSelf: "flex-end",
      marginRight: -1
    }
  });