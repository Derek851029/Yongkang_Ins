import React from 'react'
import {
  View, Text, TouchableOpacity, SafeAreaView, Touchable,StyleSheet, Alert,ScrollView
} from 'react-native'
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DataTable} from 'react-native-paper'
import { Actions } from 'react-native-router-flux';

const styles = StyleSheet.create({
  View_back:{
      backgroundColor: '#6495ED',
      height: 80,
      marginBottom: 10,
  },
  Button_Text:{
      fontSize: 16,
  },
})

class Check_List extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      task: "",
      location: [],
      nfc_id : [],
      // Date: [],
      device_name: [],
      device_num: [],
      finish_id: [],
    };
  }
  componentDidMount= async() => {
    var test = await AsyncStorage.getItem('@Inspection:412875ED500104E0');
    console.log(test)
    NfcManager.start();
    var Download_task = await AsyncStorage.getItem('@Inspection:Task');
    if (Download_task != null){
      this.setState({task:Download_task})
    }
    else{
      Alert.alert(
        "警告:",
        "今日任務尚未下載，請至系統設定內下載",
        [
          { text: "OK", onPress: () => Actions.reset('Home') }
        ]
      );
    }

    let task_original = JSON.parse(await AsyncStorage.getItem('@Inspection:Task'));
    for(let i=0;i<=task_original.length-1;i++){
      let nfc_id = task_original[i][3]
      let finish_ans = await AsyncStorage.getItem('@Inspection:'+nfc_id+'')
      let finish_ab = await AsyncStorage.getItem('@Inspection:ab_'+nfc_id+'')
      let finish_id = this.state.finish_id

      if(finish_ans !=null || finish_ab != null){
        finish_id.push('完成')
      }
      else{
        finish_id.push('未完成')
      }
    }

    NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
      //console.log(tag.id)
      let Task_json = JSON.parse(this.state.task);
      for(let i=0; i<Task_json.length; i++){
        if(Task_json[i].includes(tag.id) == true){
          Actions.Task_Content({title:''+Task_json[i][2]+'','nfc_id': tag.id})
          break
        }
        else if(i ==Task_json.length-1){
          Alert.alert(
            "警告:",
            "未找到任務，請確認是否為今日任務",
            [
              { text: "OK", onPress: () => {} }
            ]
          );
        }
      }
    });
    try {
         NfcManager.registerTagEvent();
    } catch (ex) {
        console.warn('ex', ex);
        NfcManager.unregisterTagEvent().catch(() => 0);
    }
    
    let Task_json = JSON.parse(this.state.task)
    let location_array = [];
    let nfc_id_array = [];
    // let Date_array = [];
    let device_name_array = [];
    let device_num_array = [];
    for(let x=0; x<=Task_json.length-1; x++){
      location_array.push(Task_json[x][2]);
      nfc_id_array.push(Task_json[x][3]);
      // Date_array.push(Task_json[x][14])
      device_name_array.push(Task_json[x][15])
      device_num_array.push(Task_json[x][16])
    }

    this.setState({location: location_array});
    this.setState({nfc_id: nfc_id_array});
    // this.setState({Date: Date_array});
    this.setState({device_name: device_name_array});
    this.setState({device_num: device_num_array});
  }
  
  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  test = async() =>{
    let task_original = JSON.parse(await AsyncStorage.getItem('@Inspection:Task'));
    for(let i=0;i<=task_original.length-1;i++){
      console.log(task_original[i][3])
      let nfc_id = task_original[i][3]
      let Check_finish = await AsyncStorage.getItem('@Inspection:'+nfc_id+'')
      let ab_finish = await AsyncStorage.getItem('@Inspection:ab_'+nfc_id+'')
      if(Check_finish !=null || ab_finish !=null){
        let finish_id_array = this.state.finish_id;
        finish_id_array.push(nfcid)
      }
    }
    console.log(this.state.finish_id)
  }

  render() {
    // console.log(this.state.unit)
    // console.log(this.state.location)
    // console.log(this.state.nfc_id)
    let title = []
    let key = []
    for(let x = 0;x<=this.state.device_name.length-1;x++){
      key.push(this.state.nfc_id[x]);
      title.push(this.state.location[x]);
    }
    //透過render的方式將顯示畫面放入陣列中, return這個陣列
    //this.test
    let finish_or_not = ''
    let lists = [];
    let finish_key = this.state.finish_id;
    console.log(finish_key)
    for(let i=0;i<this.state.device_name.length;i++){
      lists.push(
        <DataTable.Row>
            <DataTable.Cell>{this.state.device_name[i]}</DataTable.Cell>
            <DataTable.Cell>{this.state.device_num[i]}</DataTable.Cell>
            <DataTable.Cell>{finish_key[i]}</DataTable.Cell>
          </DataTable.Row>
      );
    };
    return (
      <ScrollView>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>狀態</Text></DataTable.Title>
          </DataTable.Header>
          {lists}
        </DataTable>
      </ScrollView>
      // <SafeAreaView>
      //   {lists}
      // </SafeAreaView>
      
    )
  }
}

export default Check_List