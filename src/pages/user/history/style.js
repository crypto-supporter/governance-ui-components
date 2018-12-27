import styled, { css } from 'styled-components';

import { Wrapper, Card } from '../../../components/common/common-styles';

export const EmptyStateContainer = styled.div`
  color: ${props => props.theme.textDefault.default.toString()};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 50vh;
  width: 320px;
  text-align: center;
  margin: 0 auto;

  svg {
    fill: ${props => props.theme.iconDefaultColor.light.toString()};
  }
`;
export const EmptyStateTitle = styled.div`
  font-size: 2rem;
  margin: 2rem 0 1rem;
`;

export const HistoryHeading = styled.div`
  display: flex;
  flex-direction: space-between;
  margin-bottom: 2rem;
`;

export const IconContainer = styled.div`
  width: 200px;
  display: block;
`;

export const Title = styled.h1``;

export const HistoryListView = styled.div`
  ${Wrapper};
  flex-direction: column;
`;

export const HistoryCard = styled.div`
  ${Card};
  margin-bottom: 2rem;
  padding: 1rem;
`;

export const TxDetails = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  flex-flow: row wrap;
  & > div {
    padding: 2rem;

    &:last-child {
      padding-left: 3rem;
    }
  }
`;

export const TxTitle = styled.div`
  flex-grow: 1;
  text-transform: uppercase;
  font-family: 'Futura PT Medium';
  flex: 0;
  min-width: 250px;
`;

export const TxStatus = styled.div`
  color: ${props => props.theme.textDefault.light.toString()};
  flex: 1;
  text-align: right;
`;

export const TxIcon = styled.div`
  padding: 1rem;
  border-left: 1px solid ${props => props.theme.borderColor.lighter.toString()};
  flex: 0;
  display: flex;
  align-items: center;

  ${props =>
    props.pending &&
    css`
      svg {
        fill: ${props.theme.transaction.pending.default.toString()};
      }
    `};

  ${props =>
    props.success &&
    css`
      svg {
        fill: ${props.theme.transaction.success.default.toString()};
      }
    `};

  ${props =>
    props.failed &&
    css`
      svg {
        fill: ${props.theme.transaction.failed.default.toString()};
      }
    `};
`;