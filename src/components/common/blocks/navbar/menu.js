import React from 'react';
import styled from 'styled-components';
import Icon from '../../elements/icons';

const StyledLink = styled.a`
  text-decoration: none;
`;

const MenuWrapper = styled.div`
  flex: 0.5 0 0;
  display: inline-flex;
`;

function Menu() {
  return (
    <MenuWrapper>
      <StyledLink href="./" style={{ pointerEvents: 'none' }}>
        <Icon kind="menu" />
      </StyledLink>
    </MenuWrapper>
  );
}

export default Menu;
