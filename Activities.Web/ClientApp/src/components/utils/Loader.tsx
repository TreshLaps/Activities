import React, { } from 'react';
import styled from 'styled-components';

const LoaderContainer = styled.div`
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    svg {
        width: 100px;
    }

    animation: fadein 2s;

    @keyframes fadein {
        0% { opacity: 0; }
        50% { opacity: 0; }
        100%   { opacity: 1; }
    }
`;

const Message = styled.div`
    text-align: center;
    margin-top: 20px;
`;

export enum LoadingStatus {
    None,
    Loading,
    Error
};

const Loader: React.FC<{status: LoadingStatus, loadingMessage?: string, errorMessage?: string}> = ({status, loadingMessage, errorMessage}) => {

    if (status === LoadingStatus.None) {
        return null;
    }

    return (
        <LoaderContainer>
            {status === LoadingStatus.Loading && 
                <>
                    <svg version="1.1" id="L1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100">
                        <circle fill="none" stroke="#209cee" strokeWidth="6" strokeMiterlimit="15" strokeDasharray="14.2472,14.2472" cx="50" cy="50" r="47" >
                            <animateTransform
                                attributeName="transform"
                                attributeType="XML"
                                type="rotate"
                                dur="5s"
                                from="0 50 50"
                                to="360 50 50"
                                repeatCount="indefinite" />
                        </circle>
                        <circle fill="none" stroke="#209cee" strokeWidth="1" strokeMiterlimit="10" strokeDasharray="10,10" cx="50" cy="50" r="39">
                            <animateTransform
                                attributeName="transform"
                                attributeType="XML"
                                type="rotate"
                                dur="5s"
                                from="0 50 50"
                                to="-360 50 50"
                                repeatCount="indefinite" />
                        </circle>
                        <g fill="#209cee">
                            <rect x="30" y="35" width="5" height="30">
                                <animateTransform
                                    attributeName="transform"
                                    dur="1s"
                                    type="translate"
                                    values="0 5 ; 0 -5; 0 5"
                                    repeatCount="indefinite"
                                    begin="0.1" />
                            </rect>
                            <rect x="40" y="35" width="5" height="30" >
                                <animateTransform
                                    attributeName="transform"
                                    dur="1s"
                                    type="translate"
                                    values="0 5 ; 0 -5; 0 5"
                                    repeatCount="indefinite"
                                    begin="0.2" />
                            </rect>
                            <rect x="50" y="35" width="5" height="30" >
                                <animateTransform
                                    attributeName="transform"
                                    dur="1s"
                                    type="translate"
                                    values="0 5 ; 0 -5; 0 5"
                                    repeatCount="indefinite"
                                    begin="0.3" />
                            </rect>
                            <rect x="60" y="35" width="5" height="30" >
                                <animateTransform
                                    attributeName="transform"
                                    dur="1s"
                                    type="translate"
                                    values="0 5 ; 0 -5; 0 5"
                                    repeatCount="indefinite"
                                    begin="0.4" />
                            </rect>
                            <rect x="70" y="35" width="5" height="30" >
                                <animateTransform
                                    attributeName="transform"
                                    dur="1s"
                                    type="translate"
                                    values="0 5 ; 0 -5; 0 5"
                                    repeatCount="indefinite"
                                    begin="0.5" />
                            </rect>
                        </g>
                    </svg>
                    <Message>{(loadingMessage ?? 'Loading items ...')}</Message>
                </>
            }            
            {status === LoadingStatus.Error && <Message>{(errorMessage ?? 'Failed to fetch content. Unknown error')}</Message>}
        </LoaderContainer>
    );
}

export default Loader;