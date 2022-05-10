import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWindowDimensions, Text, View, StyleSheet } from "react-native";
import styled from "styled-components/native";
import MapSvg from '../icons/map.svg';
import TimeSvg from '../icons/timer.svg';
import { useSelector } from "react-redux"
import weatherApiInstance from "../../../../utils/weatherAPI";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackSvg from '../icons/back.svg'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

//나중에 환경변수 처리
const serviceKey = "Yw3zPCyzMoX2VB0yMPfZgip2qIHGaFLGT5RuJ9gtVFGvzjbuNNZa5qB5DFUm%2BNMe%2B0kHhUWAYIH1j0BK%2Fdj6MQ%3D%3D";

const PloggingStatusBar = ({ mm = 0, ss = 0, distSum, isPlogging, setTimeSum, timeSumString, setIsSave }) => {
  const layout = useWindowDimensions();
  const countInterval = useRef(null);
  const [minutes, setMinutes] = useState(parseInt(mm));
  const [seconds, setSeconds] = useState(parseInt(ss));
  const weatherLoc = useSelector(state => state.weatherLoc);
  const [currWeatherTime, setCurrWeatherTime] = useState(0);
  const curr = new Date();
  const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const kr_curr = new Date(utc + (KR_TIME_DIFF));
  const [temp, setTemp] = useState(20);
  const [weather, setWeather] = useState("weather-sunny");
  const navigation = useNavigation();
  const showEndPage = useSelector(state => state.showPloggingEndPage);
  const isSave = useSelector(state => state.isSave);

  useEffect(() => {
    countInterval.current = setInterval(() => {
      if (isPlogging) {
        if (parseInt(seconds) >= 0) {
          setSeconds(parseInt(seconds) + 1);
        }
        if (parseInt(seconds) === 59) {
          setMinutes(parseInt(minutes) + 1);
          setSeconds(0);
        }
        if (seconds < 10) setTimeSum(minutes + " : " + 0 + seconds);
        else setTimeSum(minutes + " : " + seconds);
      }
    }, 1000);
    return () => {
      clearInterval(countInterval.current);
    };
  }, [minutes, seconds, isPlogging]);

  useEffect(() => { //10분마다 날씨정보 갱신 연계
    setCurrWeatherTime(parseInt(minutes / 10));
  }, [minutes])

  useEffect(() => {
    const year = kr_curr.getFullYear();
    const month = ('0' + (kr_curr.getMonth() + 1)).slice(-2);
    const day = ('0' + kr_curr.getDate()).slice(-2);
    const dateString = year + month + day;

    const hours = ('0' + kr_curr.getHours()).slice(-2);
    const minutes = ('0' + kr_curr.getMinutes()).slice(-2);
    const timeString = hours + minutes;
    let weatherTimeParam = hours + minutes;
    if (parseInt(minutes) <= 40)  // 매시간 40분 후에 api가 제공됨..하..
      weatherTimeParam = (parseInt(hours) - 1) + "" + 50;

    async function getWeatherInfo() {
      await weatherApiInstance.get(`/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${dateString}&base_time=${weatherTimeParam}&nx=${weatherLoc[0]}&ny=${weatherLoc[1]}`)
        .then((response) => {
          if (response.status === 200) {
            organizeWeatherData(response.data.response.body.items.item, parseInt(timeString));
          } else {
            console.log("FAIL");
          }
        })
    }
    getWeatherInfo();
  }, [weatherLoc, currWeatherTime]);

  useEffect(() => {
    if (isSave) {
      makeSaveFalse();
      let timeStr = "" + minutes;
      timeStr += seconds;
      async function saveLog() {
        try {
          await axiosInstance.post("/ploggings", {
            userId: 1, // 차후 유저 정보로 수정
            plogDist: distSum,
            plogTime: timeStr,
            plogWeather: weather,
            route: "여기 해야지.."
          })
            .then((response) => {
              if (response.status === 200) {
                setTrashcanList(response.data.data);
                console.log("get Trashcans SUCCESS");
              } else {
                console.log("get Trashcans FAIL");
              }
            })
            .catch((response) => { console.log(response); });
        } catch (err) { console.log(err); }
      };
      saveLog();
    }
  }, [isSave])

  const makeSaveFalse = () => {
    setIsSave(false);
  }

  const organizeWeatherData = (data, time) => {//0 맑음 1 쏘쏘 2 흐림 3 비 4 눈/비 5 눈
    const PTY = data[0].obsrValue;
    const REH = data[1].obsrValue;
    setTemp(data[3].obsrValue);
    if (PTY === "1" || PTY === "5")
      setWeather("weather-pouring");
    else if (PTY === "2" || PTY === "6")
      setWeather("weather-snowy-rainy");
    else if (PTY === "3" || PTY === "7")
      setWeather("weather-snowy-heavy");
    else
      if (REH > 85)
        setWeather("weather-cloudy");
      else if (REH < 75)
        if (time > 600 && time < 1900)
          setWeather("weather-sunny");
        else if (time >= 1900 && time < 2030)
          setWeather("weather-sunset");
        else
          setWeather("weather-night");
      else
        if (time > 600 && time < 1900)
          setWeather("weather-partly-cloudy");
        else
          setWeather("weather-night-partly-cloudy");
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerTitle}>
        {!isPlogging &&
          <TouchableOpacity onPress={navigation.goBack}>
            <BackSvg width={20} height={20} fill={"#FFF"} style={{ marginLeft: 5 }}></BackSvg>
          </TouchableOpacity>
        }
        {!showEndPage &&
          <Text style={styles.titleText}>플로깅</Text>
        }
      </View>
      <PloggingStatusBarBlock width={layout.width}>
        <View style={styles.statusView}>
          <MapSvg width={20} height={20} fill={"#FFF"} />
          <Text style={styles.statusText}>{distSum}km</Text>
        </View>
        <View style={styles.statusView}>
          <TimeSvg width={20} height={20} fill={"#FFF"} />
          <Text style={styles.statusText}>{timeSumString}</Text>
        </View>
        <View style={styles.statusView}>
          <Icon name={weather} size={20} color="#292D32" />
          <Text style={styles.statusText}>{temp}℃</Text>
        </View>

      </PloggingStatusBarBlock>
    </View>
  );
};

export default PloggingStatusBar;


const styles = StyleSheet.create({
  statusView: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 10
  },
  containerTitle: {
    flex: 1,
    backgroundColor: "white",
    alignItems: 'center',
    borderBottomWidth: 0.3,
    flexDirection: "row",
  },
  titleText: {
    fontSize: 20,
    marginLeft: 40,
    fontWeight: "bold",
    position: "absolute",
  },
  container: {
    flexDirection: "column",
    height: "15%",
    backgroundColor: "white",
  },
})

const PloggingStatusBarBlock = styled.View`
  display: flex;
  flex-direction: row;
  width: ${props => props.width}px;
  height: 72px;
  background-color: #ffffff;
  padding: 26px 20px 26px 20px;
`

