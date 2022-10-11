import React from 'react'
import { View, Text, TouchableOpacity,StyleSheet,Alert, ScrollView} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import DropDownPicker from 'react-native-dropdown-picker';
import Dialog from "react-native-dialog";

const styles = StyleSheet.create({
    Text:{
        fontSize: 18
    }
  })

class Task_Content extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            task: "",
            task_owner: [],
            nfc_id : "",
            id_C : "",
            Dialog_Input: "",
            num: 0,
            ques_result: [],
            dia_result: [],
            drop_deafult:'default',
            dialog: false,
            name: "",
            device_num: "",
        };
    }
    componentDidMount= async() => {
        //掃描後會傳送nfcid到props
        this.setState({nfc_id: ''+this.props.nfc_id+''})

        var Download_task = await AsyncStorage.getItem('@Inspection:Task');
        this.setState({task: Download_task})

        //console.log(this.state.task)
        //找到上一頁傳過來的nfcid在哪一個陣列中, 並寫進state 初始陣列為兩層[[],[]]

        let Task_json = JSON.parse(this.state.task);
        for(let i=0; i<=Task_json.length-1; i++){
            if(Task_json[i].includes(this.state.nfc_id) == true){
                this.setState({
                    task_owner: Task_json[i],
                    id_C: Task_json[i][0],
                    name: Task_json[i][15],
                    device_num: Task_json[i][16],
                });
                break;   
            }
        }
    }

    Input_value = (text,num) =>{
        if(text == '異常'){
            this.setState({dialog: true});
            this.setState({num: num});
        }
        let result_array = this.state.ques_result;
        let In_or_Out = result_array.indexOf(num.toString())
        if(In_or_Out == -1){
            result_array.push(num.toString())
            result_array.push(text);
        }
        else{
            result_array.splice(In_or_Out+1,1,text); //取代(位置,取代數量,內容)
        }
        console.log(result_array)
    }

    Save = async() =>{
        let result_array = this.state.ques_result;
        let ab_array = this.state.dia_result;
        
        if(result_array.includes('請選擇巡檢結果')){
            Alert.alert(
                "警告:",
                "尚有巡檢結果未填，請重新查看",
                [
                  { text: "OK"}
                ]
            );
        }
        else{     
            let nfc_id = this.state.nfc_id;
            let id_C = this.state.id_C;

            if(result_array.includes(nfc_id) == false){
                result_array.push(''+nfc_id+'',id_C);
                AsyncStorage.setItem('@Inspection:'+nfc_id+'',result_array.toString());
            };
            if(ab_array.length != 0){
                ab_array.push(''+nfc_id+'',id_C);
                AsyncStorage.setItem('@Inspection:ab_'+nfc_id+'',ab_array.toString());
            }
            Actions.reset('Home');
        }
        console.log(this.state.result_array)
    }

    Save_abnormal_text = () =>{
        let ab_text = this.state.Dialog_Input
        if(ab_text.length < 1){
            Alert.alert(
                "警告:",
                "請輸入異常原因",
                [
                  { text: "OK", onPress: () => {} }
                ]
            );
        }
        else{
            let ab_array = this.state.dia_result;
        
        ab_array.push(
            this.state.num.toString(),
            this.state.Dialog_Input
        );
        // ab_array.push(this.state.Dialog_Input);

        this.setState({dialog: false});
        console.log(ab_array)
    }
        }

    render(){
        let task_owner = this.state.task_owner
        let question = [];
        let question_value = [];
        for(let x=4;x<task_owner.length-3; x++){ //問題是從陣列第4個開始,-3是因為後面三個不屬於問題和建議輸入 雙數都是問題, 單數是建議輸入, 雙數除2整除就是問題
            if(x%2 == 0){
                if(task_owner[x] != null){
                    question.push(task_owner[x])
                }
                else{
                    break;
                }
            }else{
                question_value.push(task_owner[x])
            }
        }
        let lists = [];
        // console.log(task_owner)
        // console.log(question)
        // console.log(question_value)
        //問題是陣列, 將問題用for迴圈解析
        // 陣列最後一位是時間 所以-2
        for(let z=0; z<question.length; z++){
            if(question[z] == "" && question_value[z] == ""){
                continue
            }
            lists.push(
                <View>
                    <Text style={styles.Text}>{question[z] + '('+''+question_value[z]+''+')'+':'}</Text>
                    <View style={{height:10}}></View>
                        <DropDownPicker
                        defaultValue={this.state.drop_deafult}
                        items={[
                            {label:'請選擇巡檢結果',value:'default'},
                            {label:'正常',value:'answer'},
                            {label:'異常',value:'answer'},
                        ]}
                        containerStyle={{height:50}}
                        itemStyle={{
                            justifyContent: 'flex-start'
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item =>{this.Input_value(item.label,''+z+'')}}
                        >
                        </DropDownPicker>
                    <View style={{height:10}}></View>
                </View>
            )
        }
        return(
            <ScrollView style={{flex:1}}>
                <View>
                    <Text style={{color:'blue',fontSize:24}}>設備名稱:{this.state.name}</Text>
                    <Text style={{color:'blue',fontSize:24,marginBottom:5}}>設備編號:{this.state.device_num}</Text>
                </View>
                {lists}
                <View style={{flexDirection:'row',marginTop:110}}>
                    <TouchableOpacity 
                    onPress={() =>{Actions.reset('Home')}}
                    >
                        <Text style={{color:'red',fontSize:36}}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={{marginLeft:210}} 
                        onPress={this.Save}
                    >
                        <Text style={{color:'blue',fontSize:36}}>確定</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Dialog.Container visible={this.state.dialog}>
                        <Dialog.Title style={{color:'red'}}>請輸入異常原因:</Dialog.Title>
                        <Dialog.Input onChangeText={text =>{this.setState({Dialog_Input:text})}}></Dialog.Input>
                        <Dialog.Button label="取消" onPress={() =>{this.setState({dialog:false})}} />
                        <Dialog.Button label="拍攝照片" onPress={() =>{Actions.Take_Photo2({'nfc_id':this.state.nfc_id,'id_C':this.state.id_C,'num':this.state.device_num})}}/>
                        <Dialog.Button label="確定" onPress={this.Save_abnormal_text}/>
                    </Dialog.Container>
                </View>
            </ScrollView>
        )
    }
}

export default Task_Content