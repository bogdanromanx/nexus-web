import * as React from 'react';
import { Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import ResultsTable from '../../../shared/components/SparqlResultsTable';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';
import { CodeResourceData } from '../components/LinkCodeForm';
import { useLinkedActivities, ActivityItem } from '../hooks/useActivities';
import { createWorkflowBase } from '../utils/index';
import { StepResource } from '../types';

const ActivityResourcesContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  workflowStep: StepResource;
  linkCodeToActivity: (codeResourceId: string) => void;
}> = ({ orgLabel, projectLabel, workflowStep, linkCodeToActivity }) => {
  const nexus = useNexusContext();
  const base = createWorkflowBase(workflowStep);

  const { items, headerProperties } = useLinkedActivities(
    orgLabel,
    projectLabel,
    `${base}${workflowStep['@id']}`
  );

  const addCodeResource = (data: CodeResourceData) => {
    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.codeType,
      ...data,
    })
      .then(response => {
        linkCodeToActivity(response['@id']);
      })
      .catch(error => displayError(error, 'Failed to save'));
  };

  return (
    <div className="resources-list" style={{ margin: '20px' }}>
      <Spin spinning={items ? false : true}>
        <ResultsTable
          tableLabel="Activities"
          headerProperties={headerProperties}
          items={items ? (items as ActivityItem[]) : []}
          handleClick={() => {}}
        />
      </Spin>
    </div>
  );
};

export default ActivityResourcesContainer;