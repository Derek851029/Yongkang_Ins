import React from 'react';
import { Text, View, TouchableOpacity,Alert,ScrollView,StyleSheet,ActivityIndicator} from 'react-native';
import {Button, DataTable,Searchbar} from 'react-native-paper'
import { Actions } from 'react-native-router-flux';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import Dialog from "react-native-dialog";
import AwesomeLoading from 'react-native-awesome-loading'
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
})

export default class Add_RFID extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            IP: "",
            loading: false,
            dialog: false,
            search_text: '',
            edit_num: 0,
            search_device:[],
            NFCID_List: [],
            local_id: '',
            already_owned:'',
        }
    }

    componentDidMount = async () =>{
        let IP = await AsyncStorage.getItem('@Inspection:IP');
        this.setState({IP: IP})

        this.NFCID_List();
        
        NfcManager.start();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
            //實際掃描nfc card獲取格式為json, 取得nfc card id(tag.id)
            let device = this.state.search_device

            for(let i=0; i<device.length; i++){ //拆解陣列
                let position = device[i].indexOf(tag.id) //
                if(position != -1){
                    Alert.alert(
                        "警告:",
                        "此RFID已有相關設備，請重新掃描",
                        [
                            { text: "OK"}
                        ]
                    );
                    this.setState({local_id:'YES'})
                    break         
                }
            }

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
            }
            //檢查掃描的id是不是已經有了, 檢查資料庫有沒有這個id 'YES'是有 'No'是沒有
            //如果兩個都測試過都沒有才會寫入, 偵測結束要清空
            if(this.state.local_id != 'YES' && this.state.already_owned != 'YES'){
                for(let a=0; a<device.length; a++){ //拆解陣列
                    let position = device[a].indexOf(this.state.edit_num) //
                    if(position != -1){
                        device[a].splice(2,1,tag.id)       
                    }
                }
            }
            else{
                this.setState({local_id:'',already_owned:''})
            }
            this.setState
            ({
                search_device:device,
                dialog: false
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

    NFCID_List = () =>{
        fetch(''+this.state.IP+'NFCID_List',{
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
            console.log(response.data)
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

    Search = () =>{
        this.setState({loading: true});
        
        let search_text = this.state.search_text

        fetch(''+this.state.IP+'Search_device',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'data': search_text,
            })
        })
        .then(response => response.json())
        .then((response) =>{
            if(response.data.length == 0){
                Alert.alert(
                    "警告:",
                    "未找到關鍵字，請重新搜尋",
                    [
                        { text: "OK", onPress: () => {this.setState({loading: false});} }
                    ]
                );
            }
            else{
                this.setState
                ({
                    loading: false,
                    search_device:response.data,
                });
            }
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

    Edit = (num) =>{
        this.setState
        ({
            dialog:true,
            edit_num:num
        })
    }

    Save = async() =>{
        this.setState({loading: true});
        let result_data = this.state.search_device;
        console.log(result_data)

        fetch(''+this.state.IP+'Edit_RFID',{
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
                    "上傳成功",
                    [
                        { text: "OK", onPress: () => 
                            {
                                Actions.refresh();
                                this.setState
                                ({
                                    loading: false,
                                    search_device: [],
                                });
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
    // 陣列[[id_S,number,RFID,name_S],[xxx]] 第三個位置為後續加上去的RFID
    render() {
        let lists = [];
        console.log(this.state.search_device)
        for(let i=0;i<this.state.search_device.length;i++){
            lists.push(
                <DataTable.Row>
                    <DataTable.Cell>
                        <Text>{this.state.search_device[i][3]}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Text>{this.state.search_device[i][1]}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Text>{this.state.search_device[i][2]}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Button mode="Contained" dark={true} onPress={()=>{this.Edit(this.state.search_device[i][0])}}><Text>修改</Text></Button>
                    </DataTable.Cell>
                </DataTable.Row>
            )
        }

        return (
            <ScrollView>
            <AwesomeLoading indicatorId={4} size={50} isActive={this.state.loading} text="" />
            <Dialog.Container visible={this.state.dialog}>
                <Dialog.Title style={{color:'red'}}>請掃描RFID</Dialog.Title>
                <Dialog.Button label="取消" onPress={() =>{this.setState({dialog:false})} } />
            </Dialog.Container>
            <View style={{paddingBottom:10}}>
                <Searchbar 
                    placeholder="搜尋" 
                    onIconPress={() =>{this.Search()}} 
                    onChangeText={(text)=>{this.setState({search_text:text})}}
                >
                </Searchbar>
            </View>
            <View>
                <DataTable style={{paddingTop:5}}>
                    <DataTable.Header>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>RFID</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>功能</Text></DataTable.Title>
                    </DataTable.Header>
                    {lists}
                </DataTable>
            </View>
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