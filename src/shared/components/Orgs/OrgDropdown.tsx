import * as React from 'react';
import { Button, Icon, Popover } from 'antd';
import { OrgCardProps } from './OrgCard';
import OrgList from './OrgList';
import { any } from 'prop-types';

export interface OrgDropDownProps {
  activeName?: string;
  orgs?: OrgCardProps[];
  key?: any;
}

const OrgDropdown: React.FunctionComponent<OrgDropDownProps> = ({
  activeName,
  orgs = [],
  key = '',
}) => {
  const [selected, setSelected] = React.useState(activeName);

  const handleOrgSelected = (name: string) => {
    setSelected(name);
  };

  const overlay = (
    <div className="OrgDropdownPopover">
      <OrgList orgs={orgs} onOrgClick={name => handleOrgSelected(name)} />
      <div className="org-menu">
        <Button type="primary">Create New</Button>
        <Button>Explore All</Button>
      </div>
    </div>
  );
  return (
    <Popover
      openClassName="dropdown-open"
      placement="bottom"
      trigger="click"
      content={overlay}
      key={key}
    >
      <div className="OrgDropdown">
        <p className="org-name">
          {selected ? selected : 'Select an organization'}
        </p>
        <Icon type="down" />
      </div>
    </Popover>
  );
};

export default OrgDropdown;