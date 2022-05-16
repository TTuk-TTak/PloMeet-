import React, { useState, useEffect } from 'react';
import { GiftedChat  } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Entypo'
import { color, Container } from '../styles';
import CustomBubble from './custom/custom_bubble';
import CustomSend from './custom/custom_send';
import CustomInputToolbar from './custom/custom_inputtoolbar';
import firestore from '@react-native-firebase/firestore';
import { saveChatting, updateUserLastReadChatTime } from '../../../../utils/firestore';
import { useSelector } from 'react-redux';


const InsideRoom = React.memo(({ navigation, route: {params: {meeting}} }) => {
    const title = meeting.meetingName;
    const [user, setUser] = useState();
    const userId = useSelector(state => state.userId);
    const name = useSelector(state => state.name);
    const img = useSelector(state => state.img);
    const members = {};
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

    const  _handleMessageUpdate = async(updateUserLastReadChatTimeData) => {
        await updateUserLastReadChatTime({...updateUserLastReadChatTimeData})
    }

    const renderBubble = (props) => {
        const bubbleProps = {
            ...props,
            conUser: user,
        }
        return(
            <CustomBubble {...bubbleProps} />
        )
    };

    const renderInputToolbar = props => {
        return(
            <CustomInputToolbar {...props} />
        )
    };

    const renderSend = (props) => {
        return(
            <CustomSend {...props} />
        )
    };

    const setMessagesData = async(queryArray) => {
        const list = [];
        const promises = queryArray.map(async message => {
            const messageData = message.data();
            var userInfo = {};
            if(members[userId] == undefined) members[userId] = await getUserInfo(messageData.userId);
            userInfo = members[userId];
            //userInfo = await getUserInfo(messageData.userId);
            const messageInfo = {
                _id: messageData._id,
                text: messageData.text,
                createdAt: messageData.createdAt,
                user: userInfo,
            };
            list.push(messageInfo);
        });
        await Promise.all(promises);

        setMessages(list);
    };

    const getUserInfo = async (messageUserId) => {
        const userInfo = {};
        await firestore().collection('users')
            .doc(messageUserId).get().then((doc)=>{
                userInfo._id = messageUserId;
                userInfo.name = doc.data().userNickName;
                userInfo.avatar = doc.data().userProfileImg;
            });
        return userInfo;
    };
    
    
    useEffect(() => {
        navigation.setOptions({
            headerTitle: title,
            headerRight: () => (
                <Icon name="menu" size={20} color={color.black} style={{marginRight: 10}} />
            ),
        });
    }, []);
    
    
    useEffect(() => {
            const userInfo = {
                _id: userId,
                avatar: img,
                name: name,
            };
            setUser(userInfo);
        
        //console.log("meetingId::"+ meeting.meetingId);
        const subscriberChatting = firestore()
            .collection('meetings')
            .doc(meeting.meetingId)
            .collection('chattings')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapShot => {
                setMessagesData(querySnapShot.docs);
            });
        
        return () => {
            subscriberUser();
            subscriberChatting();
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
            });
        return () => subscriberMember();
    }, []);
    */

    
    useEffect(() => {
        if(messages.length != 0){
            const updateUserLastReadChatTimeData = {
                meetingId: meeting.meetingId,
                userId,
                lastChatId: messages[0]._id,
                lastChatTime: messages[0].createdAt,
            };
            _handleMessageUpdate(updateUserLastReadChatTimeData);
        }    
    }, [messages]);
    

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
});

export default InsideRoom;