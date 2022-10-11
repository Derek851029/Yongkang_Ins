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
            nfc_id : "",
            id_C: "",
            check_img: "",
            img_ans: [],
            num: '',
        };
    }

    componentDidMount = async () =>{
        let check_img =  await AsyncStorage.getItem('@Inspection:img_'+this.props.nfc_id+'');
        if(check_img !=null){
            check_img = check_img.split(',')
        }

        this.setState({
            nfc_id:this.props.nfc_id,
            id_C: this.props.id_C,
            num: this.props.num,
            check_img: check_img
        });
        
        this.Start_Take();
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

    Start_Take = async () => {
        this.requestCameraPermission()
        var options = {
            mediaType: 'photo',
            includeBase64: true,
            videoQuality: 'low',
            maxWidth: 800,
            maxHeight: 600,
        };
        launchCamera (options, res => {
            if (res.didCancel) {
                console.log('User cancelled image picker');
                Actions.pop();
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                let img_array = this.state.img_ans;
                let nfc_id = this.state.nfc_id;
                let id_C = this.state.id_C;
                let num = this.state.num;
                img_array.push(
                    num,
                    res.base64,
                )
                //判斷是否已經有拍過照
                if(this.state.check_img == null){
                    AsyncStorage.setItem('@Inspection:img_'+nfc_id+'',img_array.toString());
                }
                else{
                    let getItem = this.state.check_img;
                    getItem.push(res.base64)
                    AsyncStorage.setItem('@Inspection:img_'+nfc_id+'',getItem.toString());
                }
                Actions.pop();
            }
        });
    };

    render() {
        return (
            <View></View>
        );
    }  
}