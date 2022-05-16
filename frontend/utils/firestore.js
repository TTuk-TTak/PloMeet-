import firestore from '@react-native-firebase/firestore';


export const saveChatting = async ({meetingId, message}) => {
    const chattingsRef = firestore()
        .collection('meetings').doc(meetingId)
        .collection('chattings');
    const newMessageRef = chattingsRef.doc();
    const newMessageId = newMessageRef.id;
    
    const newChatting = {
        _id: newMessageId,
        ...message,
    };
    await chattingsRef.doc(newMessageRef.id).set(newChatting);
    //await updateUserLastReadChatTime({meetingId, userId: message.userId, lastChatId: newMessageId, lastChatTime: message.createdAt});
    await updateLastChatTime({meetingId, lastChatTime: message.createdAt});
}

export const updateLastChatTime = async ({meetingId, lastChatTime}) => {
    const chattingDocRef = firestore()
        .collection('meetings').doc(meetingId);
    await chattingDocRef.update({
        lastChatTime: lastChatTime,
    });
}

export const updateUserLastReadChatTime = async ({meetingId, userId, lastChatId, lastChatTime}) => {
    const memberDocRef = firestore()
        .collection('meetings').doc(meetingId)
        .collection('members').doc(userId);
    await memberDocRef.update({
        lastReadChatId: lastChatId,
        lastReadChatTime: lastChatTime,
    });
}

//신규 사용자 추가
export const createUser = async ({userId, user}) => {
    const usersRef = firestore().collection('users');
    const newUser = {
        userId: userId,
        userNickName: user.userNickName,
        userProfileImg: user.userProfileImg,
    }
    //await usersRef.doc(userId).set(newUser);
}

//새로운 모임 생성 > 채팅방 생성
export const createMeeting = async ({meeting, userId}) => {
    const meetingId = meeting.meetingId;
    const meetingsRef = firestore().collection('meetings');
    const newMeeting = {
        meetingId,
        lastChatTime: meeting.createdAt,    //이 부분 그냥 방 만들어진 날짜로 해도 될 지 보기... > 될 듯..?
        notice: meeting.notice,
    }
    await meetingsRef.doc(meetingId).set(newMeeting);
    await joinMember(meetingId, userId, meeting.createdAt);
}

//채팅방 사용자 추가
export const joinMember = async ({meetingId, userId, lastChatTime}) => {
    const meetingMembersRef = firestore()
        .collection('meetings').doc(meetingId)
        .collection('members');
    const newMember = {
        userId: userId,
        lastReadChatId: 0,
        lastReadChatTime: lastChatTime, 
    }
    await meetingMembersRef.doc(userId).set(newMember);
}