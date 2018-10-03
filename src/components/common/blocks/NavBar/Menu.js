import React from 'react';
// import Router, { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled.a`
  display: inline-flex;
  color: ${props => props.theme.headerBackgroundColor};
  text-decoration: none;
  padding: 0 2em;
  text-transform: uppercase;
`;

const MenuWrapper = styled.div`
  display: inline-flex;
`;

function Menu() {
  return (
    <MenuWrapper>
      <StyledLink href="./">Menu</StyledLink>
    </MenuWrapper>
  );
}

export default Menu;
