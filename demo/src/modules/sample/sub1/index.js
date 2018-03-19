import React from 'react';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import {Button,Icon} from 'antd-mobile';
import './style.scss';

export default class Sub1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDetail: false,//是否显示生成的邀请码列表
      marketList: [],
      roleList: [],
      employeeTypes: [],
      status: false,//条件选择的组件是否可用 false:可用 true:不可用
      allDataStatus: false,//生成的邀请码的表单的状态
      currentMarket: '',
      currentRole: '',
      currentRoleCode: '',
      count: 0,
      allInviteList: [],
      isShowInvitCode: false,
      generateModalVisible: false,
      submitModalVisible: false,
    };
  }

  testMobileButton() {
    let val = new Map();
    val.set('s', 1);
    alert(val.get('s'));
  }

  render() {
    const {marketList, roleList, status, allDataStatus, allInviteList, count, employeeTypes, isShowInvitCode, generateModalVisible, submitModalVisible}=this.state;
    return (
      <div className="sub1">
        这是一个测试!
        <Icon type="check"></Icon>
        <Button className="btn" icon="check-circle-o" onClick={this.testMobileButton.bind(this)}>手机按钮</Button>
      </div>
    )
  }
}
