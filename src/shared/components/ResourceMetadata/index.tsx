import * as React from 'react';
import { Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { getUsername } from '../../utils';
import { Resource } from '@bbp/nexus-sdk/lib/types';
import * as moment from 'moment';
import FriendlyTimeAgo from '../FriendlyDate';
import TypesIcon from '../Types/TypesIcon';

const ResourceMetadata: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel }) => {
  return (
    <Row>
      <Col span={12}>
        <Row>
          <Col>
            <b>Organization:</b>{' '}
            <Link
              to={`/admin/${orgLabel}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {orgLabel}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Project:</b>{' '}
            <Link
              to={`/admin/${orgLabel}/${projectLabel}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {projectLabel}
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Type(s):</b>{' '}
            {resource['@type'] && (
              <TypesIcon type={[resource['@type']].flat()} full={true} />
            )}
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row>
          <Col>
            <b>Created:</b>{' '}
            <FriendlyTimeAgo date={moment(resource._createdAt)} />
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Created By:</b> {getUsername(resource._createdBy)}
          </Col>
        </Row>

        <Row>
          <Col>
            <b>Updated:</b>{' '}
            <FriendlyTimeAgo date={moment(resource._updatedAt)} />
          </Col>
        </Row>
        <Row>
          <Col>
            <b>Updated By:</b> {getUsername(resource._updatedBy)}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ResourceMetadata;
