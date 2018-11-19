import styled, { css } from 'styled-components';
import { ButtonStyles, GhostBtn } from '../../../components/common/common-styles';

export const UploadButtonContainer = styled.div``;

export const UploadInput = styled.input`
  display: none;
`;
export const UploadButton = styled.label`
  display: inline-block;
  border-radius: 4px;
  ${ButtonStyles};
  ${props =>
    props.ghost &&
    css`
      ${GhostBtn};
    `};
  ${props =>
    props.disabled &&
    css`
      background-color: orangered;
    `};
`;