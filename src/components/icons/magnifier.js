import React from 'react';
import { Container } from './style';

const MagnifierIcon = props => (
  <Container {...props}>
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <desc>Created with Sketch.</desc>
      <defs />
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          id="header"
          transform="translate(-330.000000, -33.000000)"
          fill="#464E5B"
          fillRule="nonzero"
        >
          <path
            d="M339.778858,33 C336.349939,33 333.557716,35.7922234 333.557716,39.2211422 C333.557716,40.7108139 334.080195,42.0765494 334.957473,43.1482382 L330,48.1057108 L330.894289,49 L335.851762,44.0425273 C336.923451,44.9198054 338.289186,45.4422843 339.778858,45.4422843 C343.207777,45.4422843 346,42.6500609 346,39.2211422 C346,35.7922234 343.207777,33 339.778858,33 Z M339.778858,34.2442284 C342.53463,34.2442284 344.755772,36.4653709 344.755772,39.2211422 C344.755772,41.976914 342.53463,44.1980559 339.778858,44.1980559 C337.023087,44.1980559 334.801944,41.976914 334.801944,39.2211422 C334.801944,36.4653709 337.023087,34.2442284 339.778858,34.2442284 Z"
            id="Shape"
          />
        </g>
      </g>
    </svg>
  </Container>
);

MagnifierIcon.defaultProps = {
  width: '5rem',
  height: '5rem',
};

export default MagnifierIcon;
