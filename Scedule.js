import React from 'react'
import {
  View, Text, TouchableOpacity,StyleSheet, Alert,ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DataTable} from 'react-native-paper'
import { Actions } from 'react-native-router-flux';

const styles = StyleSheet.create({
})

class Check_List extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            IP:'',
            list:[],
            choose:'',
            choose2:'',
            choose_text:'blue',
            choose_text2:'gray'
        };
    }
    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@Inspection:IP');
        this.setState({IP:IP});
        this.Check_status('1')
    }

    Check_status = (flag) =>{
        if(flag == '1'){
            this.setState({choose_text:'blue',choose_text2:'gray'})
        }
        else{
            this.setState({choose_text:'gray',choose_text2:'blue'})
        }
        fetch(''+this.state.IP+'Check_status',{
            timeout:5000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'flag': flag,
            })
        })
        .then(response => response.json())
        .then((response) =>{
            this.setState({list:response.data})
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

  render() {
    let lists = [];
    console.log(this.state.list[0])
    for(let i=0;i<this.state.list.length;i++){
      lists.push(
        <DataTable.Row>
            <DataTable.Cell>{this.state.list[i][0]}</DataTable.Cell>
            <DataTable.Cell>{this.state.list[i][1]}</DataTable.Cell>
            <DataTable.Cell>{this.state.list[i][2]}</DataTable.Cell>
          </DataTable.Row>
      );
    };
    return (
      <ScrollView>
        <View style={{flexDirection:'row',alignSelf:'center',marginBottom:20}}>
            <TouchableOpacity
                onPress={()=>{this.Check_status('1')}}
            >
            <Text style={{color: 'white',fontSize:20,backgroundColor: this.state.choose_text,}}>已完成</Text></TouchableOpacity>

            <View style={{width:100}}></View>

            <TouchableOpacity
                onPress={()=>{this.Check_status('0')}}
            >
            <Text style={{color: 'white',fontSize:20,backgroundColor: this.state.choose_text2,}}>未完成</Text></TouchableOpacity>
        </View>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
            <DataTable.Title><Text style={{color: 'red',fontSize:20}}>完成日期</Text></DataTable.Title>
          </DataTable.Header>
          {lists}
        </DataTable>
      </ScrollView>
    )
  }
}

export default Check_List