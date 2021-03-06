import React from 'react';
import { Container } from './style';

const HelpIcon = props => (
  <Container {...props}>
    <svg viewBox="0 0 26 27">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-24.000000, -554.000000)">
          <g transform="translate(24.000000, 554.000000)">
            <g transform="translate(1.238095, 2.000000)">
              <path
                d="M18.3513796,11.9941684 L2.87220732,19.4956134 C1.87820916,19.9773202 0.681913924,19.562026 0.200207124,18.5680278 C0.0684489799,18.2961459 -1.83195104e-15,17.9979462 -1.33226763e-15,17.6958205 L-8.8817842e-16,0.893137593 C-1.02344917e-15,-0.211431907 0.8954305,-1.10686241 2,-1.10686241 C2.30212575,-1.10686241 2.60032543,-1.03841343 2.87220732,-0.906655283 L18.3513796,6.59478973 C19.8423768,7.31734993 20.4653181,9.11179278 19.7427579,10.60279 C19.4485819,11.2098199 18.9584094,11.6999923 18.3513796,11.9941684 Z"
                id="Triangle-Copy"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
              />
              <path
                d="M24.1428571,10.5 L24.1428571,14.5"
                id="Line-3"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
                strokeLinecap="square"
              />
              <path
                d="M7.31209438,6.97779743 C11.7518311,7.17789186 14.2562497,8.2347048 16.3950377,8.91649055 C20.4989429,10.2247007 22.6130712,11.2828544 22.6130712,13.5370997 C22.6130712,21.0890606 12.1887717,28.3299215 7.31209438,22.3700739 C5.61470378,20.295672 0.678838899,17.0876121 4.09937742,10.3521852 L7.31209438,6.97779743 Z"
                id="Path-6"
                fill="#FFFFFF"
              />
              <path
                d="M8.04761905,14.5 L8.04761905,17.5"
                id="Line-7"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
                strokeLinecap="square"
              />
              <path
                d="M8.04761905,10.5 L24.1428571,10.5"
                id="Line-5"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
                strokeLinecap="square"
              />
              <path
                d="M8.04761905,14.5 L24.1428571,14.5"
                id="Line-5"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
                strokeLinecap="square"
              />
              <path
                d="M8.04761905,20.5 L8.04761905,21.5"
                id="Line-8"
                stroke={
                  props.selected
                    ? props.theme.iconSecondaryColor.default.toString()
                    : props.theme.iconDefaultColor.light.toString()
                }
                strokeLinecap="square"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </Container>
);

HelpIcon.defaultProps = {
  // width: '2rem',
  // height: '2rem',
};

export default HelpIcon;
