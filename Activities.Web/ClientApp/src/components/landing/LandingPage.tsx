import React from 'react';
import styled from 'styled-components';
import { Droplet, Pulse, Run } from 'styled-icons/boxicons-regular';
import foto from '../../assets/markus_ser_viktig_ut.jpg';

const LandingContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const BannerWrapper = styled.div`
    width: 100%;
    margin: 100px 0;
    background: #fff;
    border-radius: 10px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;

    span {
      font-size: 50px;
      color: #c90000;
      padding-left: 50px;
    }

    img {
      display: block;
      height: 200px;
      object-fit: contain;
    }

    @media (max-width: 768px) {
      display: block;
      margin: 0;
      border-radius: 0;
      margin-bottom: 50px;

      span {
        display: block;
        font-size: 30px;
        line-height: 1.5;
        padding-left: 0;
        padding: 20px;
        text-align: center;
      }

      img {
        width: 100%;
      }
    }
`;

const ContentWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;

    svg {
      width: 100px;
      margin: 0 auto;
      display: block;
    }
`;

const BoxWrapper = styled.div`
  padding: 10px;
  max-width: 400px;
  font-size: 20px;
  line-height: 1.5;
`;

const BoxText = styled.p`
  text-align: center;
  margin-bottom: 20px;
  margin-top: 5px;
`;

const LandingPage: React.FC<{ children?: any }> = () => (
  <LandingContainer>
    <BannerWrapper>
      <span>“All you need is red cells”</span>
      <img src={foto} alt="Markus ser viktig ut" />
    </BannerWrapper>
    <ContentWrapper>
      <BoxWrapper>
        <Pulse />
        <BoxText>
          Prinsippet bak vår trening er å bygge aerob kapasitet, som er den viktigste faktoren i langdistanseløping
        </BoxText>
      </BoxWrapper>
      <BoxWrapper>
        <Droplet />
        <BoxText>
          Treningen intensitetsstyres med å måle laktat, et direkte mål på anaerob energiforbruk
        </BoxText>
      </BoxWrapper>
      <BoxWrapper>
        <Run />
        <BoxText>
          Terskelintervaller gir mulighet for et stort volum på relativt høy intensitet, og stimulerer effektivt den aerobe kapasiteten
        </BoxText>
      </BoxWrapper>
    </ContentWrapper>
  </LandingContainer>
);

export default LandingPage;
