//import './style.scss';
//require("babel-polyfill");
import React from 'react';
import ReactDom from 'react-dom';
//import {Button} from 'antd';
//import 'antd/dist/antd.less';
//import {Modal} from 'antd-mobile';
//import Tpl from './index.tpl';
import createBrowserHistory from 'history/createBrowserHistory';
import {
  Route
} from 'react-router';
import { HashRouter } from 'react-router-dom';
//import Sub1 from './sub1';
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
class Index extends React.Component {
  render() {
    return (
      <div>
        Index1
      </div>
    )
  }
}
class Main extends React.Component {
  render() {
    return (
      <HashRouter history={history}>
        <div>
          <Route path="/" component={Index}/>
          <Route path="/sub1" component={require('react-proxy-loader!./sub1')}/>
        </div>
      </HashRouter>
    );
  }
}
ReactDom.render(<Main/>, document.getElementById('application'));
