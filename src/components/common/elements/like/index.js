import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from '@digix/gov-ui/components/common/elements/index';

class LikeButton extends React.Component {
  render() {
    const { hasVoted, onClick, likes, translations } = this.props;
    const likeMessage =
      likes && likes > 0 ? `${likes} ${translations.likes}` : `0 ${translations.likes}`;
    return (
      <Button kind="text" active={hasVoted} onClick={onClick}>
        <Icon kind="like" active={hasVoted} />
        {likeMessage}
      </Button>
    );
  }
}

const { bool, func, number, object } = PropTypes;

LikeButton.propTypes = {
  onClick: func,
  hasVoted: bool,
  likes: number,
  translations: object.isRequired,
};

LikeButton.defaultProps = {
  hasVoted: false,
  onClick: undefined,
  likes: undefined,
};

export default LikeButton;
