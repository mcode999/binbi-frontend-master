import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const Footer: React.FC = () => {
  // const defaultMessage = 'RsBin.Top出品';
  const defaultMessage = '';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'Bin智能 BI',
          title: 'Bin智能 BI',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/ant-design/ant-design-pro',
          blankTarget: true,
        },
        {
          key: 'rsbin.top',
          title: 'Bin智能 BI',
          href: 'https://ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
