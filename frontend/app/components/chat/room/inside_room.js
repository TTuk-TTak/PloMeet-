import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { GiftedChat  } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Entypo'
import { color, Container } from '../styles';
import CustomBubble from './custom/custom_bubble';
import CustomSend from './custom/custom_send';
import CustomInputToolbar from './custom/custom_inputtoolbar';
import firestore from '@react-native-firebase/firestore';
import { saveChatting } from '../../../../utils/firestore';


const InsideRoom = ({ navigation, route: {params: {item, userNum}} }) => {
    const meeting = item.meeting;
    const chat = item.chatting;
    const title = meeting.meetingName;
    const [user, setUser] = useState();
    const [members, setMembers] = useState();
    const [messages, setMessages] = useState([]);

    
    const _handleMessageSend = async messageList => {
        const newMessage = messageList[0];
        const message = {
            text: newMessage.text,
            createdAt: Date.now(),
            userId: newMessage.user._id,
        };
        try{
            await saveChatting({ meetingId: meeting.meetingId, message});
        }catch(e){
            Alert.alert('Send Message Error', e.message);
        }
    };

    const renderBubble = (props) => {
        const bubbleProps = {
            ...props,
            conUser: user,
        }
        return(
            <CustomBubble {...bubbleProps} />
        )
    }

    const renderInputToolbar = props => {
        return(
            <CustomInputToolbar {...props} />
        )
    }

    const renderSend = (props) => {
        return(
            <CustomSend {...props} />
        )
    }

    const setMessagesData = async(queryArray) => {
        const list = [];
        const promises = queryArray.map(async message => {
            const messageData = message.data();
            var userInfo = {};
            if(messageData.userId != userNum) userInfo = {"_id": userNum};
                userInfo = await getUserInfo(messageData.userId);
            //var userInfo = members[messageData.userId];
            //if(userInfo == undefined) userInfo = await getUserInfo(messageData.userId);
            const messageInfo = {
                _id: messageData._id,
                text: messageData.text,
                createdAt: messageData.createdAt,
                user: userInfo,
                //user: members[messageData.userId],
            };
            list.push(messageInfo);
        });
        await Promise.all(promises);

        setMessages(list);
    }

    const getUserInfo = async (userId) => {
        const userInfo = {};
        await firestore().collection('users')
            .doc(userId).get().then((doc)=>{
                userInfo._id = userId;
                userInfo.name = doc.data().userNickName;
                userInfo.avatar = doc.data().userProfileImg;
            });
        return userInfo;
    }
    
    useEffect(() => {
        navigation.setOptions({
            headerTitle: title,
            headerRight: () => (
                <Icon name="menu" size={20} color={color.black} style={{marginRight: 10}} />
            ),
        });
    }, []);

    useEffect(() => {
        const subscriberUser = firestore()
            .collection('users')
            .doc(userNum)
            .onSnapshot(querySnapShot => {
                const userData = querySnapShot.data();
                const userInfo = {
                    _id: userData.userId.toString(),
                    avatar: userData.userProfileImg,
                    name: userData.userNickName,
                }
                setUser(userInfo);
            });
        
        console.log("meetingId::"+ meeting.meetingId);
        /*   
        const subscriberMember = firestore()
            .collection('meetings')
            .doc(meeting.meetingId)
            .collection('members')
            .onSnapshot(querySnapShot => {
                const memberInfos = {};
                querySnapShot.forEach(async (member) => {
                    const memberData = member.data();
                    const memberId = memberData.userId;
                    const userInfo = await getUserInfo(memberId);
                    memberInfos[memberData.userId] = userInfo;
                });
                setMembers(memberInfos);
            });
        */
        return () => {
            subscriberUser();
            //subscriberMember();
        }
    }, []);

    /*
    useEffect(() => {
        console.log("meetingId::"+ meeting.meetingId);        
        const subscriberMember = firestore()
            .collection('meetings')
            .doc(meeting.meetingId)
            .collection('members')
            .onSnapshot(querySnapShot => {
                const memberInfos = {};
                querySnapShot.forEach(async (member) => {
                    const memberData = member.data();
                    const memberId = memberData.userId;
                    const userInfo = await getUserInfo(memberId);
                    memberInfos[memberData.userId] = userInfo;
                });
                setMembers(memberInfos);
                console.log("memberInfos");
                console.log(memberInfos);
            });
        return () => subscriberMember();
    }, []);
    */
    
    useEffect(() => {
        const subscriberChatting = firestore()
            .collection('meetings')
            .doc(meeting.meetingId)
            .collection('chattings')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapShot => {
                setMessagesData(querySnapShot.docs);
            });
        return () => subscriberChatting();
    }, [members]);
    

    return (
        <Container>
            <GiftedChat
                listViewProps={{
                    style: { 
                        backgroundColor: color.white,
                        marginBottom: 2,
                    },
                }}
                placeholder="메세지를 입력해주세요"
                messages={messages}
                user={user}
                renderUsernameOnMessage={true}
                scrollToBottom={true}
                renderBubble={renderBubble}
                textInputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    textContentType: 'none',
                    underlineColorAndroid: 'transparent',
                }}
                multiline={true}
                renderInputToolbar={renderInputToolbar}
                renderSend={renderSend}
                onSend={_handleMessageSend}
                alwaysShowSend={true}
            />
        </Container>
    );
}

export default InsideRoom;