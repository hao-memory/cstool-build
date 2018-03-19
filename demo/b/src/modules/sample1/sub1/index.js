import React from 'react';

export default class Sub1 extends React.Component {
  render() {
    Object.assign({},{});
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
