import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Image, SafeAreaView,Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import{launchCamera} from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native';

const styles = StyleSheet.create({
    View_back:{
        backgroundColor: '#6495ED',
        height: 80,
        marginBottom: 10,
    },
    Button_Text:{
        fontSize: 16,
    }
})

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        resourcePath: {},
        task: "",
        unit: [],
        location: [],
        nfc_id : [],
        };
    }
    componentDidMount = async () =>{
        var Download_task = await AsyncStorage.getItem('@Inspection:Task');
        if (Download_task != null){
        this.setState({task:Download_task})
        }else{
            Alert.alert(
                "警告:",
                "今日任務尚未下載，請至系統設定內下載",
                [
                  { text: "OK", onPress: () => Actions.reset('Home') }
                ]
            );
        }

        let Task_json = JSON.parse(this.state.task);
        let unit_array = [];
        let location_array = [];
        let nfc_id_array = [];
        // console.log(Task_json)
        // console.log(Task_json[0][2])
        // console.log(Task_json[0][4])
        for(let x=0; x<=Task_json.length-1; x++){
        unit_array.push(Task_json[x][1]);
        location_array.push(Task_json[x][2]);
        nfc_id_array.push(Task_json[x][3])
        }
        // console.log(unit_array);
        // console.log(location_array);
        // console.log(nfc_id_array);
        this.setState({unit: unit_array});
        this.setState({location: location_array});
        this.setState({nfc_id: nfc_id_array});
    }

    requestCameraPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Camera permission given");
          } else {
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
    };

    Start_Take = async (key) => {
        this.requestCameraPermission()
        var options = {
            mediaType: 'photo',
            includeBase64: true
        };
        launchCamera(options, res => {
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                this.setState({
                  resourcePath: res.base64,
                });
                // let Image64 = AsyncStorage.getItem('@Inspection:'+key+'');
                // if (Image64 != null){
                //     Image64.push(this.state.resourcePath)
                // }else{
                //     Alert.alert(
                //         "警告:",
                //         "請先檢查設備",
                //         [
                //           { text: "OK", onPress: () => Actions.reset('Home') }
                //         ]
                //     );
                // }
                // console.log(res.base64)
                // fetch('http://192.168.2.14:5008/Upload_image',{
                // method : 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                // body: JSON.stringify({
                //     'Image': this.state.resourcePath,
                //     //'NFC_ID': key
                // })
                // })
                // .then(response => response.json())
                // .then((response) =>{
                //     console.log(response)
                // })
            }
        });
    };

    render() {
        let key = []
        for(let x = 0;x<=this.state.unit.length-1;x++){
        key.push(this.state.nfc_id[x]);
        }
        //透過render的方式將顯示畫面放入陣列中, return這個陣列
        let lists = [];
        for(let i=0;i<=this.state.unit.length-1;i++){
        lists.push(
            <View style={styles.View_back}>
            <TouchableOpacity onPress={()=>{this.Start_Take(key[i])}}>
                <View>
                    <Text style={styles.Button_Text}>單元:{this.state.unit[i]}</Text>
                    <View style={{paddingBottom: 8}}></View>
                    <Text style={styles.Button_Text}>位置:{this.state.location[i]}</Text>
                    <View style={{paddingBottom: 8}}></View>
                    <Text style={styles.Button_Text}>任務日期:</Text>
                </View>
            </TouchableOpacity>
            </View>
            );
        }
    return (
        <SafeAreaView>
            {lists}
        </SafeAreaView>
    //   <View style={styles.container}>
    //     <View style={styles.container}>
    //       <Image
    //         source={{
    //           uri: 'data:image/jpeg;base64,' + this.state.resourcePath.data,
    //         }}
    //         style={{ width: 100, height: 100 }}
    //       />
    //       <Image
    //         source={{ uri: this.state.resourcePath.uri }}
    //         style={{ width: 200, height: 200 }}
    //       />
    //       <Text style={{ alignItems: 'center' }}>
    //         {this.state.resourcePath.uri}
    //       </Text>

    //       <TouchableOpacity onPress={this.Start_Take} style={styles.button}  >
    //           <Text style={styles.buttonText}>Select File</Text>
    //       </TouchableOpacity>       
    //     </View>
    //   </View>
    );
    }  
}