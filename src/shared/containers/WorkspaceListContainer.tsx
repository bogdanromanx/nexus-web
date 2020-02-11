import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button } from 'antd';
import TabList from '../components/Tabs/TabList';
import AddWorkspaceContainer from './AddWorkspaceContainer';
import WorkspaceForm from './WorkspaceFormContainer';
import { Dashboard } from './DashboardListContainer';
import useQueryString from '../hooks/useQueryString';
import { resourcesWritePermissionsWrapper } from '../utils/permission';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

type WorkspaceListProps = {
  workspaceIds: string[];
  orgLabel: string;
  projectLabel: string;
  studioResource: StudioResource;
  onListUpdate?(): void;
  dashboardListComponent(dashboardListComponentProps: {
    dashboards: Dashboard[]; // TODO add Dashboard type
    workspaceId: string;
  }): React.ReactElement;
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds = [],
  orgLabel,
  projectLabel,
  studioResource,
  onListUpdate,
  dashboardListComponent,
}) => {
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [queryParams, setQueryString] = useQueryString();
  const { workspaceId } = queryParams;
  const [workspaces, setWorkspaces] = React.useState<Resource<any>[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<
    Resource<any>
  >();
  const [showEdit, setShowEdit] = React.useState<boolean>(false);
  const [workspaceToEdit, setWorkSpaceToEdit] = React.useState<string>();
  const nexus = useNexusContext();
  const dashboards =
    selectedWorkspace && selectedWorkspace['dashboards']
      ? selectedWorkspace['dashboards']
      : [];
  const selectWorkspace = (id: string, values: Resource[]) => {
    const w = values.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
    setQueryString({
      ...queryParams,
      workspaceId: id,
      // Make sure to deselect dashboards
      // Some workspaces may share a dashboard with the same @id
      // remove keys using undefined
      // https://www.npmjs.com/package/query-string#falsy-values
      dashboardId: undefined,
    });
  };

  React.useEffect(() => {
    Promise.all(
      workspaceIds.map(workspaceId => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(workspaceId)
        ) as Promise<Resource>;
      })
    )
      .then(values => {
        setWorkspaces(
          values.sort(({ _createdAt: dateA }, { _createdAt: dateB }) => {
            const a = new Date(dateA);
            const b = new Date(dateB);
            if (a > b) {
              return 1;
            }
            if (a < b) {
              return -1;
            }
            return 0;
          })
        );
        if (workspaceId) {
          const workspaceFilteredById = values.find(
            w => w['@id'] === workspaceId
          );
          setSelectedWorkspace(
            workspaceFilteredById ? workspaceFilteredById : values[0]
          );
        } else {
          console.log('setting the first one....');

          setSelectedWorkspace(values[0]);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [workspaceIds]);

  const tabAction = (
    <AddWorkspaceContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      studio={studioResource}
      onAddWorkspace={onListUpdate}
    />
  );

  const editButtonWrapper = (id: string) => {
    const editButton = (
      <Button
        type="link"
        size="small"
        onClick={e => {
          setWorkSpaceToEdit(id);
          setShowEdit(true);
          e.stopPropagation();
        }}
      >
        Edit
      </Button>
    );
    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
  };

  return (
    <>
      <TabList
        items={workspaces.map(w => ({
          label: w.label,
          description: w.description,
          id: w['@id'],
        }))}
        onSelected={(id: string) => {
          selectWorkspace(id, workspaces);
        }}
        activeKey={
          workspaces.length
            ? (selectedWorkspace && selectedWorkspace['@id']) ||
              workspaces[0]['@id']
            : undefined
        }
        position="top"
        tabAction={resourcesWritePermissionsWrapper(tabAction, permissionsPath)}
        editButton={editButtonWrapper}
      >
        {selectedWorkspace ? (
          <div className="workspace">
            {dashboardListComponent({
              dashboards,
              workspaceId: workspaceId || selectedWorkspace['@id'],
            })}{' '}
          </div>
        ) : null}
      </TabList>
      {showEdit && !!workspaceToEdit ? (
        <WorkspaceForm
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          workspaceId={workspaceToEdit}
          onCancel={() => setShowEdit(false)}
          onSuccess={onListUpdate}
        />
      ) : null}
    </>
  );
};

export default WorkspaceList;
