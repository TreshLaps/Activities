import styled from "styled-components";

export const Container = styled.div`
    border-radius: 3px;
    margin-bottom: 20px;
`;

export const Box = styled(Container)`
    background: #fff;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;

    @media(max-width: 1440px) {
        padding: 10px;
    }
`;

export const StackContainer = styled(Container)`
    display: flex;
    flex-wrap: wrap;

    & > * {
        margin-right: 20px;

        &:last-child {
            margin-right: 0;
        }
    }
`;

export const SubHeader = styled.h2`
    font-size: 17px;
    line-height: 1;
    margin: 0;
    margin-bottom: 10px;
`;

export const Grid = styled.div<{columns: number}>`
    @media(min-width: 1000px) {
        display: grid;
        column-gap: 20px;
        row-gap: 20px;
        margin-bottom: 20px;
        grid-template-columns: repeat(${props => props.columns}, minmax(0, 1fr));
        grid-template-rows: auto;
    
        & > * {
            margin-bottom: 0;
        }
    }    
`;

export const Table = styled.table`
    width: calc(100% + 40px);
    max-width: calc(100% + 40px);
    border-spacing: 0;
    border-collapse: separate;
    margin: -20px;
    margin-top: 0;

    @media(max-width: 1440px) {
        width: calc(100% + 20px);
        max-width: calc(100% + 20px);
        margin: -10px;
        margin-top: 0;
    }

    th {
        text-align: right;
        padding: 10px;
        padding-top: 0;
        padding-bottom: 20px;
        font-size: 17px;

        &:first-child {
            text-align: left;
            padding-left: 20px;
        }

        &:last-child {
            padding-right: 20px;
        }
    }

    tbody tr {
        td { 
            border-top: thin solid #efefef;
        }

        &:nth-child(odd) {
            background: #fafafa;
        }
    }

    td {
        white-space: pre-wrap;
        max-width: 300px;
        text-align: right;
        vertical-align: text-top;
        padding: 10px;

        &:first-child {
            text-align: left;
            padding-left: 20px;
        }

        &:last-child {
            padding-right: 20px;
        }
    }
`;

export const Dropdown = styled.select`    
    border-radius: 3px;
    border: 0;
    padding: 10px;
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    line-height: 1;
    background: #fff;
    color: #000;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    font-weight: 500;
`;