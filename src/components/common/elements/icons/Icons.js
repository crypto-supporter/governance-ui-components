import React from 'react';
import { Container } from './style';

const Icons = props => (
  <Container {...props} style={{ display: 'none' }}>
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol viewBox="0 0 24 24" id="arrow_up">
        <path d="M23.245 20l-11.245-14.374-11.219 14.374-.781-.619 12-15.381 12 15.391-.755.609z" />
      </symbol>
      <symbol viewBox="0 0 24 24" id="arrow_down">
        <path d="M23.245 4l-11.245 14.374-11.219-14.374-.781.619 12 15.381 12-15.391-.755-.609z" />
      </symbol>
      <symbol viewBox="0 0 24 24" id="vote">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-1293.000000, -413.000000)" fillRule="nonzero">
            <polygon
              points="1293.66667 426.666667 1296.33333 426.666667 1296.33333 418.666667 1293.66667 418.666667"
              fill="black"
            />
            <path
              d="M1308.33333,419.333333 C1308.33333,418.6 1307.73333,418 1307,418 L1302.79333,418 L1303.42667,414.953333 L1303.44667,414.74 C1303.44667,414.466667 1303.33333,414.213333 1303.15333,414.033333 L1302.44667,413.333333 L1298.06,417.726667 C1297.81333,417.966667 1297.66667,418.3 1297.66667,418.666667 L1297.66667,425.333333 C1297.66667,426.066667 1298.26667,426.666667 1299,426.666667 L1305,426.666667 C1305.55333,426.666667 1306.02667,426.333333 1306.22667,425.853333 L1308.24,421.153333 C1308.3,421 1308.33333,420.84 1308.33333,420.666667 L1308.33333,419.393333 L1308.32667,419.386667 L1308.33333,419.333333 Z"
              stroke="black"
              fill="none"
              strokeWidth="1"
            />
          </g>
        </g>
      </symbol>
    </svg>
  </Container>
);

Icons.defaultProps = {};

export default Icons;
