import React, { Component, Node, Button } from 'react';
import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from "react-redux";

const Home = () => {
    const nickname = useSelector(state => state.nickname)
    return (
        <View>
            <Text>홈화면</Text>
        </View>
    );
};

const styles = StyleSheet.create({

});

export default Home;
