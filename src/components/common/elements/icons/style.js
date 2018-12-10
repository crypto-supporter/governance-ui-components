import styled from 'styled-components';

export const Container = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.width || '3rem'};
  height: ${props => props.height || '3rem'};
  margin-right: 1rem;

  > svg {
    fill: ${props =>
      props.selected
        ? props.theme.textSecondary.default.toString()
        : props.theme.iconColor.toString()};
    width: 100%;
    height: 100%;
  }
`;
