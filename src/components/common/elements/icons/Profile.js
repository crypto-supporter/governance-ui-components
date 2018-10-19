import React from 'react';
import { Container } from './style';

const ProfileIcon = props => (
  <Container {...props}>
    <svg width="27px" height="26px" viewBox="0 0 27 26" version="1.1">
      <defs>
        <polygon
          id="path-1"
          points="2.84217094e-14 0 20 0 20 7.61538462 8 7.61538462 8 22 2.84217094e-14 22"
        />
      </defs>
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="sidepanel" transform="translate(-25.000000, -489.000000)">
          <g id="Sidemenu">
            <g id="Rectangle-9-Copy" transform="translate(25.000000, 489.000000)">
              <mask id="mask-2" fill="white">
                <use xlinkHref="#path-1" />
              </mask>
              <use id="Mask" fill="#FFFFFF" xlinkHref="#path-1" />
              <rect
                stroke={
                  props.selected
                    ? props.theme.backgroundSecondary.default.toString()
                    : props.theme.backgroundPrimary.default.toString()
                }
                mask="url(#mask-2)"
                x="0.5"
                y="1.5"
                width="19"
                height="19"
                rx="2"
              />
            </g>
            <g
              id="Group-5"
              transform="translate(35.000000, 498.000000)"
              fillRule="nonzero"
              stroke={
                props.selected
                  ? props.theme.backgroundSecondary.default.toString()
                  : props.theme.backgroundPrimary.default.toString()
              }
            >
              <path
                d="M14.1125649,9.03041951 L15.8479188,10.3874498 C16.0041828,10.5108161 16.045305,10.7328756 15.9466119,10.913813 L14.3017267,13.7594643 C14.2030336,13.9404017 13.9891985,14.0144215 13.8000367,13.9404017 L11.7521547,13.1179591 C11.3244846,13.4387117 10.8639167,13.7183422 10.3622268,13.9239528 L10.0496986,16.1034257 C10.0250253,16.3008119 9.85231237,16.4488516 9.64670172,16.4488516 L6.35693141,16.4488516 C6.15132077,16.4488516 5.97860782,16.3008119 5.95393455,16.1034257 L5.64140637,13.9239528 C5.13971639,13.7183422 4.67914855,13.4469361 4.25147841,13.1179591 L2.20359639,13.9404017 C2.02265902,14.0061971 1.80059953,13.9404017 1.70190642,13.7594643 L0.0570212631,10.913813 C-0.0416718463,10.7328756 -0.000549717386,10.5108161 0.155714372,10.3874498 L1.89106821,9.03041951 C1.85817051,8.76723788 1.83349723,8.49583183 1.83349723,8.22442578 C1.83349723,7.95301973 1.85817051,7.68161368 1.89106821,7.41843205 L0.155714372,6.0614018 C-0.000549717386,5.93803541 -0.0498962721,5.71597592 0.0570212631,5.53503855 L1.70190642,2.68938723 C1.80059953,2.50844986 2.0144346,2.43443003 2.20359639,2.50844986 L4.25147841,3.33089244 C4.67914855,3.01013984 5.13971639,2.73050936 5.64140637,2.52489871 L5.95393455,0.345425883 C5.97860782,0.148039664 6.15132077,0 6.35693141,0 L9.64670172,0 C9.85231237,0 10.0250253,0.148039664 10.0496986,0.345425883 L10.3622268,2.52489871 C10.8639167,2.73050936 11.3244846,3.00191541 11.7521547,3.33089244 L13.8000367,2.50844986 C13.9809741,2.44265446 14.2030336,2.50844986 14.3017267,2.68938723 L15.9466119,5.53503855 C16.045305,5.71597592 16.0041828,5.93803541 15.8479188,6.0614018 L14.1125649,7.41843205 C14.1454626,7.68161368 14.1701359,7.9447953 14.1701359,8.22442578 C14.1701359,8.50405626 14.1454626,8.76723788 14.1125649,9.03041951 Z M8.00181657,11.1029748 C9.58913074,11.1029748 10.8803656,9.81173995 10.8803656,8.22442578 C10.8803656,6.6371116 9.58913074,5.34587676 8.00181657,5.34587676 C6.41450239,5.34587676 5.12326754,6.6371116 5.12326754,8.22442578 C5.12326754,9.81173995 6.41450239,11.1029748 8.00181657,11.1029748 Z"
                id="Shape"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </Container>
);

ProfileIcon.defaultProps = {
  width: '2.8rem',
};

export default ProfileIcon;
