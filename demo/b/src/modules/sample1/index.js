//import './style.scss';
//import React from 'react';
//import ReactDom from 'react-dom';
//import {Button} from 'antd';
//import 'antd/dist/antd.less';
//import {Modal} from 'antd-mobile';
//import Tpl from './index.tpl';
import { Router, Route, hashHistory, Link, IndexRedirect} from 'react-router';
//export default class Sample extends React.Component {
//  constructor(props) {
//    super(props);
//  }
//
//  render() {
//    return <div>
//      <div dangerouslySetInnerHTML={{__html:Tpl}} style={{color: "white"}}></div>
//      <Button type="danger">Danger</Button>
//    </div>
//  }
//}
//ReactDom.render(<Sample/>, document.getElementById('application'));
//import {Events} from 'rs-ecp-framework';
class Main {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={require('react-router!./sub1')}>
        </Route>
      </Router>
    )
  }

}
