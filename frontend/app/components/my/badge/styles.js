import styled from 'styled-components/native';
import { color } from '../styles';

export const BadgesContainer = styled.View`
    background-color: white;
`;

export const BadgeContainerTitleLine = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
`;

export const BadgeContainerTitle = styled.Text`
    font-size: 20px;
    color: ${color.blackFont};
`;

export const BadgeMoreComponent = styled.TouchableOpacity`
    flex-direction: row;
`;

export const BadgeMoreText = styled.Text`
    font-size: 13px;
    color: ${color.blackFont};
`;

export const BadgeComponent = styled.View`
    flex-direction: column;
    align-items: center;
    margin: 10px;
    width: 80px;
    height: 100px;
`;

export const BadgeImage = styled.Image`
    width: 60px;
    height: 60px;
    margin-top: 5px;
    margin-bottom: 5px;
    border-radius: 50px;
`;

export const BadgeTitle = styled.Text`
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 13px;
    color: ${color.blackFont};
`;

export const BadgeComponentTouchchable = styled.TouchableOpacity``;

export const BadgeDescComponent = styled.View`
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;
`;

export const BadgeDescImg = styled.Image`
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    border-radius: 50px;
`;

export const BadgeDescTitle = styled.Text`
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 17px;
    color: ${color.blackFont};
`;

export const BadgeDescInfo = styled.Text`
    margin: 3px;
    font-size: 13px;
    color: ${color.blackFont};
`;
