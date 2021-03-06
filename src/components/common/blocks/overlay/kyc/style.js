import styled, { css } from 'styled-components';
import { Button } from '@digix/gov-ui/components/common/elements/index';
import { media } from '@digix/gov-ui/components/common/breakpoints';
import { H3 } from '@digix/gov-ui/components/common/common-styles';

const MAX_PREVIEW_DIMENSION = '450px';

export const WizardContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

export const WizardMenu = styled.a`
  flex-grow: 1;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.borderColor.lighter.toString()};
  padding-bottom: 1rem;
  text-transform: uppercase;
  font-size: 1.4rem;

  ${props =>
    props.active &&
    css`
      color: ${props.theme.textSecondary.default.toString()};
      border-bottom: 3px solid ${props.theme.backgroundSecondary.default.toString()};
    `};
`;

export const WizardHeader = styled.div`
  display: flex;
  background: ${props => props.theme.backgroundDefault.default.toString()};
  box-shadow: ${props => props.theme.boxShadow};
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem 1rem 3rem;

  margin-bottom: 3rem;
`;

export const CallToAction = styled.div`
  display: flex;
  margin-top: 3rem;
`;

export const Title = styled(H3)`
  margin-bottom: 0;
  font-family: 'Futura PT Medium', sans-serif;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FieldItem = styled.div`
  position: relative;
  margin: 0 1rem 2rem 1rem;
  flex: 1;

  ${media.desktop``};
  ${media.tablet`
    margin-right: 1rem;
  `};
  ${media.mobile``};
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: ${props => (props.column ? 'column' : '')};
  margin: 0 -1rem;

  ${media.tablet`
    flex-direction: column;
  `}

  ${props =>
    props.upload &&
    css`
      > ${FieldItem} {
        &:first-child {
          margin-right: 2rem;
          flex: 0 0 500px;

          ${media.tablet`
            flex: 0 0 auto;
            margin-right: 0;
            width: 100%;
        `}
        }

        &:last-child {
          flex: 1 0 0;
          margin-top: 5px;

          ${media.tablet`
          margin-top: 2rem;
          width: 100%;
        `}
        }
      }
    `};
`;

export const PreviewImage = styled.div`
  background: ${props => props.theme.card.border.lighter.toString()};
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.card.border.lighter.toString()};
  height: 100%;
  margin-top: 2.5rem;
  position: relative;
  width: 100%;

  canvas,
  img {
    height: auto;
    max-height: 100%;
    max-width: 100%;
    width: auto;
  }

  ${media.tablet`
    margin-top: -3rem;
  `}
`;

export const PhotoVerification = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.backgroundPrimary.fade.toString()};
  border: 1px solid ${props => props.theme.borderColor.default.toString()};
  border-radius: ${props => props.theme.borderRadius};
  padding: 3rem;
  margin: 2rem 0 0 0;

  padding-left: 8rem;
  padding-right: 8rem;
`;

export const MediaContainer = styled.div`
  flex-direction: column;
  font-size: 1.4rem;
`;

export const GetStarted = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const IdentificationCode = styled.div`
  background: ${props => props.theme.backgroundDefault.default.toString()};
  border: 1px solid ${props => props.theme.borderColorSecondary.light.toString()};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 1rem 3rem;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

export const CamPreview = styled.div`
  background: ${props => props.theme.backgroundPrimary.default.toString()};
  border-radius: ${props => props.theme.borderRadius};
  height: 450px;
  margin-bottom: 3rem;
  width: 600px;
`;

export const WebcamCountdown = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  text-transform: uppercase;
`;

export const PhotoViewer = styled.div`
  display: flex;
  border: 1px solid ${props => props.theme.borderColor.default.toString()};
  border-radius: ${props => props.theme.borderRadius};
  margin: 3rem auto;
  width: 60%;
`;

export const SelfieGuide = styled.div`
  background: ${props => props.theme.backgroundPrimary.fade.toString()};
  border-right: 1px solid ${props => props.theme.borderColorPrimary.light.toString()};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
  max-height: ${MAX_PREVIEW_DIMENSION};
  min-width: 100px;
  width: 28%;
`;

export const GuideItem = styled.div`
  margin: 1rem;
  img {
    width: 100%;
  }
`;

export const Photo = styled.div`
  background: ${props => props.theme.backgroundPrimary.default.toString()};
  max-height: ${MAX_PREVIEW_DIMENSION};
  width: 100%;

  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

export const ErrorMessage = styled.span`
  color: ${props => props.theme.alertMessage.error.default.toString()};
  display: inline-block;
  font-size: 1.4rem;
`;

export const FilePreview = styled.div`
  background: #fff;
  border-bottom: 0;
  flex: 0 1 calc(50% - 0.5rem);
  margin-right: 0;
  margin-bottom: 1rem;
  position: relative;
  padding: 0;

  canvas,
  img {
    width: 100%;
  }

  ${media.mobile`
    flex: 0 1 100%;
  `}
`;

export const ModalCta = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin: 0;
  }
`;

export const Enlarge = styled(Button)`
  background: ${props => props.theme.background.white.toString()};
  border: 1px solid ${props => props.theme.borderColor.lighter.toString()};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: none;
  font-size: 1.2rem;
  margin: 0.5rem;
  padding: 1rem;
  position: absolute;
  right: 1rem;
  top: 1rem;

  div {
    height: 1.75rem;
    margin-right: 0;
    width: 1.75rem;
  }

  &:hover {
    background: ${props => props.theme.background.white.toString()};
    border: 1px solid ${props => props.theme.borderColor.lighter.toString()};
  }
`;
