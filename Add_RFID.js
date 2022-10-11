import React from 'react';
import { Text, View, TouchableOpacity,Alert,ScrollView,StyleSheet,ActivityIndicator} from 'react-native';
import {DataTable,TextInput} from 'react-native-paper'
import { Actions } from 'react-native-router-flux';
import AwesomeLoading from 'react-native-awesome-loading'
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
})

export default class Add_RFID extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            device_array: [],
            device_num_array:[],
            IP: '',
            NFCID_List: [],
            local_id: '',
            already_owned:'',
        }
    }

    componentDidMount = async () =>{
        let IP = await AsyncStorage.getItem('@Inspection:IP');
        this.setState({IP:IP})
        this.Check_Device();
        this.NFCID_List();

        NfcManager.start();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
            //實際掃描nfc card獲取格式為json, 取得nfc card id(tag.id)
            let original_array = this.state.device_array;
            let device_num = this.state.device_num_array;

            for(let i=0; i<original_array.length;i++){
                //先檢查這張RFID是否已經掃描過
                if(original_array[i].includes(tag.id)){
                    Alert.alert(
                        "警告:",
                        "此RFID已掃描，請重新掃描",
                        [
                            { text: "OK"}
                        ]
                    );
                    this.setState({local_id:'YES'})
                    break
                }
            }

            if(this.state.local_id != 'YES'){
                let NFCID_List = this.state.NFCID_List
                for(let x=0; x<NFCID_List.length;x++){
                    if(NFCID_List[x].includes(tag.id)){
                        Alert.alert(
                            "警告:",
                            "此RFID已有相關設備，請重新掃描",
                            [
                                { text: "OK"}
                            ]
                        );
                        this.setState({already_owned:'YES'})
                        break
                    }
                    // else{
                    //     if(original_array[x].length < 3){
                    //         original_array[x].push(tag.id);
                    //         device_num[x].push(tag.id);
                    //         break;
                    //     }
                    //     else{
                    //         continue;
                    //     }
                    // }
                }
            }

            if(this.state.local_id != 'YES' && this.state.already_owned != 'YES'){
                console.log('123')
                for(let b=0;b<original_array.length;b++){
                    if(original_array[b].length < 4){
                        original_array[b].push(tag.id);
                        device_num[b].push(tag.id);
                        break;
                    }
                    else{
                        continue
                    }
                }

            }
            else{
                this.setState({local_id:'',already_owned:''})
            }
            //檢查掃描的id是不是已經有了, 檢查資料庫有沒有這個id 'YES'是有 'No'是沒有
            //如果兩個都測試過都沒有才會寫入, 偵測結束要清空

            this.setState({
                device_array: original_array,
                device_num_array: device_num
            })
        });

        try {
            NfcManager.registerTagEvent();
        } 
        catch (ex) {
            console.warn('ex', ex);
            NfcManager.unregisterTagEvent().catch(() => 0);
        }
    }

    Check_Device = () =>{
        this.setState({loading: true});
        fetch(''+this.state.IP+'Check_Device',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'Check': '',
            })
        })
        .then(response => response.json())
        .then((response) =>{
            let device = response.device

            //為了後端的id_S(編號), 需要知道update到哪個欄位, 先將編號單獨到一個陣列中
            let device_num = [];
            for(let i=0; i<device.length; i++){
                device_num.push([device[i][0]]) //原本push只有 [x,x,x,x] -> [[x],[x],[x]]
            }
            this.setState({
                device_array:device,
                device_num_array: device_num
            }) //第一個原陣列set, 第二個set id_S
            this.setState({loading: false});
        })
        .catch((e)=>{
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

    NFCID_List = () =>{
        fetch(''+this.state.IP+'NFCID_List',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then((response) =>{
            this.setState({NFCID_List: response.data})
        })
        .catch((e)=>{
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

    Save = async() =>{
        this.setState({loading: true});
        let result_data = this.state.device_num_array;
        console.log(result_data)
        if(result_data.length == 0){
            Alert.alert(
                "警告:",
                "未偵測到任何變更",
                [
                    { text: "OK", onPress: () => {this.setState({loading: false});} }
                ]
            );
        }
        else{
            fetch(''+this.state.IP+'Update_RFID',{
                timeout:1000,
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'data': result_data,
                })
            })
            .then(response => response.json())
            .then((response) =>{
                let res = response.data;
                if(res == 'success'){
                    Alert.alert(
                        "提醒:",
                        "儲存成功",
                        [
                            { text: "OK", onPress: () => 
                                {
                                    Actions.reset('Home');
                                    this.setState({loading: false});
                                } 
                            }
                        ]
                    );
                }
            })
            .catch((e)=>{
                console.log(e)
                Alert.alert(
                    "警告:",
                    "伺服器發生錯誤，請重新嘗試或洽詢管理員",
                    [
                        { text: "OK", onPress: () => {this.setState({loading: false})} }
                    ]
                );
            })
        }
    }
    // 陣列[[id_S,number,name_S],[xxx]] 第三個位置為後續加上去的RFID
    render() {
        let lists = [];
        console.log(this.state.device_array)
        for(let i=0;i<this.state.device_array.length;i++){
            lists.push(
                <DataTable.Row>
                    <DataTable.Cell>
                        <Text>{this.state.device_array[i][2]}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Text>{this.state.device_array[i][1]}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Text>{this.state.device_array[i][3]}</Text>
                    </DataTable.Cell>
                </DataTable.Row>
            )
        }
        return (
            <ScrollView>
            <AwesomeLoading indicatorId={4} size={50} isActive={this.state.loading} text="" />
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>RFID</Text></DataTable.Title>
                    </DataTable.Header>
                    {lists}
                </DataTable>
                <View style={{alignItems:'flex-end'}}>
                    <TouchableOpacity onPress={this.Save}>
                        <Text style={{color:'blue',fontSize:36}}>
                        儲存
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    } 
}