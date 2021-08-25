import styled from 'styled-components';

export const EmptyThead = styled.thead``;

export const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-radius: 5px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 11px;
    line-height: 1.1;
    border-radius: 0;
  }

  > thead > tr > th {
    text-align: right;
    padding: 13px 15px 10px;
    font-size: inherit;
    line-height: 1;
    background: lightblue;

    &:first-child {
      text-align: left;
      padding-left: 20px;
    }

    &:last-child {
      padding-right: 20px;
    }

    @media (max-width: 768px) {
      padding: 5px;

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
    color: #555;
    padding-top: 5px;
    padding-bottom: 5px;
    font-weight: normal;
    font-size: 11px;

    @media (max-width: 768px) {
        padding: 4px 3px;

        &:first-child {
          padding-left: 10px;
        }

        &:last-child {
          padding-right: 10px;
        }
    }
  }

  > tbody > tr {
    > td {
      border-top: thin solid #efefef;
    }

    > td {
      max-width: 300px;
      text-align: right;
      padding: 5px 10px;
      white-space: nowrap;
      position: relative;

      &:first-child {
        text-align: left;
        padding-left: 20px;
      }

      &:last-child {
        padding-right: 20px;
      }

      @media (max-width: 768px) {
        padding: 4px 3px;

        &:first-child {
          padding-left: 10px;
        }

        &:last-child {
          padding-right: 10px;
        }
      }
    }
  }
`;

export const FixedWidthTable = styled(Table)`
  @media (min-width: 1024px) {
    table-layout: fixed;
  }
`;

export const SmallTable = styled(Table)`
  font-size: 11px;
  line-height: 1.3;
  table-layout: auto;

  @media (min-width: 769px) {
    > thead > tr > th {
      padding: 10px;
    }
  }
`;
