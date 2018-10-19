import Color from 'color';

// const blackHex = Color('#000');
// const black = {
//   default: blackHex,
//   darker: blackHex.darken(0.5),
//   lighter: blackHex.lighten(0.5),
// };

const blueHex = Color('#111E36');
const blue = {
  default: blueHex,
  darker: blueHex.darken(1),
  lighter: blueHex.lighten(2),
};

// const darkBlueHex = Color('#111E36');
// const darkBlue = {
//   default: darkBlueHex,
//   darker: darkBlueHex.darken(1),
//   lighter: darkBlueHex.lighten(0.1),
// };

// const goldHex = Color('#E4C88E');
const goldHex = Color('#C19F58');
const gold = {
  default: goldHex,
  darker: goldHex.darken(0.05),
  light: goldHex.lighten(0.05),
  lighter: goldHex.lighten(0.05),
  lightest: goldHex.lighten(0.05),
};

// const darkGoldHex = Color('#C4A159');
// const darkGold = {
//   default: darkGoldHex,
//   darker: darkGoldHex.darken(0.05),
//   lighter: darkGoldHex.lighten(0.05),
// };

const grayHex = Color('#E8ECF2');
const gray = {
  default: grayHex,
  darker: grayHex.darken(0.1),
  light: grayHex.lighten(0.0599),
};

const darkGrayHex = Color('#464E5B');
const darkGray = {
  default: darkGrayHex,
  darker: darkGrayHex.darken(0.5),
  light: darkGrayHex.lighten(0.5),
  lighter: darkGrayHex.lighten(1),
  lightest: darkGrayHex.lighten(1.9),
};

const whiteHex = Color('#fff');
const white = {
  default: whiteHex,
  darker: whiteHex.darken(0.05),
  lighter: whiteHex.lighten(0.05),
};

const redHex = Color('#D0021B');
const red = {
  default: redHex,
  darker: redHex.darken(0.05),
  lighter: redHex.lighten(0.05),
};

const primaryColor = blue;
const secondaryColor = gold;

const boxShadowStyle = '0 4px 8px 0 rgba(231, 233, 236, 0.8), 0 2px 4px 0 rgba(231, 233, 236, 0.6)';

const ErrorMessage = {
  // backgroundColor: gray,
  // padding: '1em',
};

const LightTheme = {
  primary: blue,
  secondary: gold,

  boxShadow: boxShadowStyle,

  defaultBgColor: white,
  mainBgColor: gray,
  leftPanelBgColor: white,

  headerBackgroundColor: white.default,
  headerBorderColor: gray.default,

  timelineBgColor: darkGray,
  timelineCurrentBgColor: primaryColor,

  // textColor: black,
  defaultTextColor: darkGray,
  textColorInverted: white,
  cardBorderColor: darkGray,
  borderColor: darkGray,

  iconColor: primaryColor.default,

  filterActive: gold.default,
  filterCount: darkGray,

  buttonBgPrimary: primaryColor.default,
  buttonBgSecondary: secondaryColor.default,
  buttonTextPrimary: primaryColor.default,
  buttonTextPrimaryReverse: white.default,
  buttonTextSecondary: secondaryColor.default,
  buttonTextSecondaryReverse: white.default,
  buttonBorderPrimary: primaryColor.default,
  buttonBorderSecondary: secondaryColor.default,
  buttonBorderDisabled: darkGray.lighter,
  buttonFlatColor: red.default,
  transition: 'all 0.3s ease',

  ErrorMessage,
};

export default LightTheme;
