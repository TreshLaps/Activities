import React from 'react';
import styled from 'styled-components';
import { Droplet, Pulse, Run } from 'styled-icons/boxicons-regular';
import foto from '../../assets/markus_ser_viktig_ut.jpg';

const BannerWrapper = styled.div`
    background-image: url('${foto}'); /* fallback */
    background-image: linear-gradient(to right, #f7f7fa, rgba(226,234,253,0.2)), url('${foto}');
    background-position: right top;
    background-size: auto 120%;
    background-repeat: no-repeat;
    width: 100%;
    height: 400px;
    position: relative;
`;

const ContentWrapper = styled.div`
    width: 100%;
    flex: 1;
    flex-wrap: wrap;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
`;

const LandingContainer = styled.div`
    display: flex;
    flex-direction: column;
    // min-height: 100vh;
`;

const BannerText = styled.h1`
    color: #c90000;
    font-size: 3rem;
    font-family: Roboto Mono;
    padding: 5rem;
    text-align: center;
    bottom: 0;
    position: absolute;
`;

const BoxWrapper = styled.div`
  width: 15rem;
  padding: 2rem;
  color: #4c566a;
  :hover {
    color: #111317;
    font-color: #111317;
  }
`;

const BoxText = styled.p`
  color: inherit;
  font-size: 1rem;
  font-family: Roboto Mono;
  text-align: center;
`;

const LandingPage: React.FC<{ children?: any }> = ({ children }) => (
  <LandingContainer>
    <BannerWrapper>
      <BannerText>&quot;All you need is red cells&quot;</BannerText>
      {children}
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
          Treningen kvalitetsikres ved å måle laktat, det mest direkte målet på aerob og anaerob energiforbruk
        </BoxText>
      </BoxWrapper>
      <BoxWrapper>
        <Run />
        <BoxText>
          Terskelintervaller gir mulighet for et stort volum med aerob trening da det krever mindre restitusjon enn anaerob trening
        </BoxText>
      </BoxWrapper>
    </ContentWrapper>
  </LandingContainer>
);

export default LandingPage;
