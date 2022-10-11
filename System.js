import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetch from 'react-native-fetch-polyfill';
import { Actions } from 'react-native-router-flux';
import AwesomeLoading from 'react-native-awesome-loading'

const styles = StyleSheet.create({
    Button_end:{
        flex: 1,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'gray'
    },
    Button_Text:{
        fontSize: 25,
        color: 'white'
    },
})

class setting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            IP: '',
            loading: false,
            Dialog_Input: "",
            Download_Date: "",
            Upload_Date: "",
            Task: "",
            finish_task: [],
            abnormal_task: [],
            ab_img_task: []
        };
    }

    componentDidMount =  async () => {
        var IP = await AsyncStorage.getItem('@Inspection:IP')
        var Download_Date =  await AsyncStorage.getItem('@Inspection:Download_Date')
        var Upload_Date = await AsyncStorage.getItem('@Inspection:Upload_Date')
        if (IP != null){
            this.setState({IP: IP})
        }
        if (Download_Date != null){
            this.setState({Download_Date: Download_Date})
        }
        if (Upload_Date != null){
            this.setState({Upload_Date: Upload_Date})
        }
    }

    Download = async() =>{
        let Task = await AsyncStorage.getItem('@Inspection:Task');

        if(Task !=null){
            Alert.alert(
                "警告:",
                "有任務未完成或任務未上傳，請上傳後再重新嘗試",
                [
                  { text: "OK", onPress: () => {Actions.reset('Home');} }
                ]
            );
        }
        else{
            try{
                this.setState({loading: true})
                fetch(''+this.state.IP+'Select_task',{
                    timeout:5000,
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'Get_task': "",
                    })
                })
                .then(response => response.json())
                .then((response) =>{
                    AsyncStorage.setItem('@Inspection:Task',JSON.stringify(response.Task))
                    console.log(response.Task)
                    var date = new Date();

                    var year = date.getFullYear().toString();
                    var month = (date.getMonth()+1).toString();
                    var day = date.getDate().toString();
                    var hour =  date.getHours().toString();
                    var minute = date.getMinutes().toString();
            
                    var today = year+'年'+month+'月'+day+'日'
                    this.setState({Download_Date:today});
                    AsyncStorage.setItem('@Inspection:Download_Date',today);
                    Alert.alert(
                        "提醒:",
                        "下載成功",
                        [
                            { text: "OK", onPress: () => {Actions.reset('Home');this.setState({loading: false})} }
                        ]
                    ); 
                })
                .catch((e)=>{
                    console.log(e)
                    Alert.alert(
                        "警告:",
                        "下載失敗，請重新嘗試或洽詢管理員",
                        [
                            { text: "OK", onPress: () => {this.setState({loading: false})} }
                        ]
                    );
                })
            }
            catch(error){
                this.setState({loading: false})
                console.log(error)
            }
        }
    }

    Upload = async() =>{
        this.setState({loading: true})
        
        let task_original = JSON.parse(await AsyncStorage.getItem('@Inspection:Task'));
        if(task_original == null){
            Alert.alert(
                "警告:",
                "尚未偵測到任務，請確認是否下載",
                [
                    { text: "OK", onPress: () => {this.setState({loading: false})} }
                ]
            );
        }
        else{
            for(let i=0;i<task_original.length;i++){
                let nfc_id = task_original[i][3]
                let id_C = task_original[i][0]

                let finish_ans = await AsyncStorage.getItem('@Inspection:'+nfc_id+'')
                let abnormal_ans = await AsyncStorage.getItem('@Inspection:ab_'+nfc_id+'');
                let ab_img_ans = await AsyncStorage.getItem('@Inspection:img_'+nfc_id+'');
                if(finish_ans !=null){
                    let finish_task = this.state.finish_task
                    finish_task.push(finish_ans)
                }
                else{
                    let finish_task = this.state.finish_task
                    finish_task.push('未巡檢'+','+nfc_id+','+id_C) //因為後端python有處理轉成陣列 這裡要用字串
                }

                if(abnormal_ans != null){
                    let abnormal_task =  this.state.abnormal_task;
                    abnormal_task.push(abnormal_ans)
                }
                if(ab_img_ans != null){
                    let ab_img_task =  this.state.ab_img_task;
                    ab_img_task.push(ab_img_ans)
                }
            }
            // console.log(this.state.finish_task)
            // console.log(this.state.abnormal_task)
            // console.log(this.state.ab_img_task)
            try{
                fetch(''+this.state.IP+'Insert_result',{
                    timeout:5000,
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'finish_task': this.state.finish_task,
                        'abnormal_task': this.state.abnormal_task,
                        'ab_img_task': this.state.ab_img_task,
                    })
                })
                .then(response => response.json())
                .then((response) =>{
                    console.log(response);
                    if(response.message != 'success'){
                        Alert.alert(
                            "警告:",
                            "上傳失敗，請重新嘗試或洽詢管理員",
                            [
                                { text: "OK", onPress: () => {this.setState({loading: false})} }
                            ]
                        );
                    }
                    else{
                        var date = new Date();

                        var year = date.getFullYear().toString();
                        var month = (date.getMonth()+1).toString();
                        var day = date.getDate().toString();
                        var hour =  date.getHours().toString();
                        var minute = date.getMinutes().toString();
                
                        var today = year+'年'+month+'月'+day+'日'
                        this.setState({Upload_Date:today});
                        AsyncStorage.setItem('@Inspection:Upload_Date',today);
                        this.Remove_storage()
                    }
                })
                .catch((e)=>{
                    Alert.alert(
                        "警告:",
                        "上傳失敗，請重新嘗試或洽詢管理員",
                        [
                            { text: "OK", onPress: () => {this.setState({loading: false})} }
                        ]
                    );
                })
            }
            catch(error){
                this.setState({loading: false})
                console.log(error);

            }
        }
    }

    Remove_storage = async() =>{
        let task_original = JSON.parse(await AsyncStorage.getItem('@Inspection:Task'));
        for(let i=0;i<task_original.length;i++){
            let nfc_id = task_original[i][3]
            AsyncStorage.removeItem('@Inspection:'+nfc_id+'')
            AsyncStorage.removeItem('@Inspection:ab_'+nfc_id+'')
            AsyncStorage.removeItem('@Inspection:img_'+nfc_id+'');
        }
        AsyncStorage.removeItem('@Inspection:Task')

        Alert.alert(
            "提醒:",
            "上傳成功",
            [
                { text: "OK", onPress: () => {Actions.reset('Home')}}
            ]
        );
    }

    Logout = async() =>{
        let task_original = JSON.parse(await AsyncStorage.getItem('@Inspection:Task'));
        if(task_original != null){
            for(let i=0;i<task_original.length;i++){
                let nfc_id = task_original[i][3]
                AsyncStorage.removeItem('@Inspection:'+nfc_id+'')
                AsyncStorage.removeItem('@Inspection:ab_'+nfc_id+'')
                AsyncStorage.removeItem('@Inspection:img_'+nfc_id+'');
            }
            AsyncStorage.removeItem('@Inspection:Task')
        }
        AsyncStorage.removeItem('@Inspection:account')
        AsyncStorage.removeItem('@Inspection:password')
        AsyncStorage.removeItem('@Inspection:Authority')

        Alert.alert(
            "提醒:",
            "登出成功",
            [
              { text: "OK", onPress: () => {Actions.reset('Login');} }
            ]
        );
    }

    render(){
        return(
            <SafeAreaView>
                <View>
                    <Image 
                    source={require('./assets/images/syncicon.png')}
                    style={{width: '100%', height: '75%'}}>
                    </Image>
                    <Text style={{fontSize:20,paddingBottom: 30}}>案件下載時間:{this.state.Download_Date}</Text>
                    <Text style={{fontSize:20}}>案件上傳時間:{this.state.Upload_Date}</Text>
                </View>
                <View  style={{flexDirection: 'row'}}>
                    <TouchableHighlight style={styles.Button_end} onPress={this.Download}>
                        <Text style={styles.Button_Text}>下載</Text>
                    </TouchableHighlight>
                    <View style={{width: 5}}></View>

                    <TouchableHighlight style={styles.Button_end} onPress={this.Upload}>
                        <Text style={styles.Button_Text}>上傳</Text>
                    </TouchableHighlight>

                    <View style={{width: 5}}></View>

                    <TouchableHighlight style={styles.Button_end} onPress={() =>{this.Logout()}}>
                        <Text style={styles.Button_Text}>登出</Text>
                    </TouchableHighlight>
                </View>
                <AwesomeLoading indicatorId={1} size={50} isActive={this.state.loading} text="" />
            </SafeAreaView>
        )
    }
}

export default setting