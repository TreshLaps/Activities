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

export const TableContainer = styled.div`
    overflow-x: auto;
`;

export const EmptyThead = styled.thead``;

export const NoWrapTd = styled.td``;

export const Table = styled.table`
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;
    border-radius: 3px;
    margin-bottom: 20px;
    background: #fff;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    > thead > tr > th {
        text-align: right;
        padding: 15px;
        font-size: 15px;
        line-height: 1;
        background: #bdc9ce;

        &:first-child {
            text-align: left;
            padding-left: 20px;
        }

        &:last-child {
            padding-right: 20px;
        }

        @media(max-width: 768px) {
            padding: 5px;
            font-size: 13px;
            line-height: 1;

            &:first-child {
                padding-left: 10px;
            }
    
            &:last-child {
                padding-right: 10px;
            }
        }
    }

    > ${EmptyThead} > tr > th {
        background: #ddd;
        padding-top: 10px;
        padding-bottom: 10px;
        font-weight: normal;

        @media(max-width: 768px) {
            padding-top: 5px;
            padding-bottom: 5px;
        }
    }

    > tbody > tr {
        > td { 
            border-top: thin solid #efefef;
        }

        &:nth-child(odd) {
            background: #fafafa;
        }

        > td {
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

            @media(max-width: 768px) {
                padding: 5px;
                font-size: 13px;
                line-height: 1.3;
    
                &:first-child {
                    padding-left: 10px;
                }
        
                &:last-child {
                    padding-right: 10px;
                }
            }
        }

        > ${NoWrapTd} {
            white-space: nowrap;
        }
    }
`;

export const LapsTable = styled.table`
    border-spacing: 0;
    border-collapse: separate;
    width: 100%;
    table-layout: fixed;

    th {
        white-space: nowrap;
        font-size: 11px;
        line-height: 1;
        text-align: right;
        font-weight: 600;
        padding-right: 12px;
        padding-bottom: 3px;

        &:last-child {
            padding-right: 2px;
        }
    }

    td {
        white-space: nowrap;
        font-size: 11px;
        line-height: 1;
        text-align: right;
        position: relative;
        border-right: 10px solid transparent;

        &:last-child {
            border-right: 0;
        }
    }
`;

export const LapFactor = styled.div<{color: string}>`
    position: absolute;
    right: 0;
    top: 0;
    bottom: 1px;
    opacity: 0.3;
    background: ${props => props.color};
`;

export const LapLabel = styled.span`
    z-index: 1;
    position: relative;
    display: block;
    padding: 2px;
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

export const Input = styled.input`    
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

export const DropdownLabel = styled.label`
    padding: 10px 0;
    padding-right: 10px;
    font-family: 'Roboto',sans-serif;
    font-size: 15px;
    line-height: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 0;
`;

export const WarningLabel = styled.span`
    padding: 10px 0;
    font-family: 'Roboto',sans-serif;
    font-size: 15px;
    line-height: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: red;
    font-weight: bold;
    margin-right: 20px;
`;