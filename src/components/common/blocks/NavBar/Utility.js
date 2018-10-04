import React from 'react';
// import Router, { Link } from 'react-router-dom';
import styled from 'styled-components';
import Icon from '../../elements/Icons/index';

const UtilityWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  padding: 0;
`;

function Utility() {
  return (
    <UtilityWrapper>
      <Icon kind="notification" />
    </UtilityWrapper>
  );
}

export default Utility;
