import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { notification, Modal, message } from 'antd';

import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/StudioContext';
import { DASHBOARD_TYPE } from './CreateDashboardContainer';
import usePlugins from '../../../../shared/hooks/usePlugins';

const DashboardEditorContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  dashboardId: string;
  dashboardRev: number;
  dashboard: DashboardPayload;
  viewId?: string;
  showEditModal: boolean;
  setShowEditModal(showEditModal: boolean): void;
  onSuccess?(): void;
}> = ({
  orgLabel,
  projectLabel,
  dashboard,
  dashboardId,
  dashboardRev,
  showEditModal,
  setShowEditModal,
  onSuccess,
  viewId = DEFAULT_SPARQL_VIEW_ID,
}) => {
  const nexus = useNexusContext();
  const { label, description, dataQuery, plugins } = dashboard;
  const [busy, setBusy] = React.useState(false);
  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});

  // Launch modal when id is changed (someone selected a new dashboard to edit)
  React.useEffect(() => {
    if (!showEditModal) {
      setShowEditModal(true);
    }
  }, [viewId, dashboardId]);

  const handleSubmit = async (dashboardPayload: DashboardPayload) => {
    try {
      setBusy(true);

      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(dashboardId),
        dashboardRev,
        {
          ...dashboardPayload,
          '@context': STUDIO_CONTEXT['@id'],
          '@type': DASHBOARD_TYPE,
        }
      );

      setShowEditModal(false);

      message.success(
        <span>
          Dashboard <em>{dashboardPayload.label}</em> updated
        </span>
      );

      !!onSuccess && onSuccess();
    } catch (error) {
      notification.error({
        message: `Could not update dashboard`,
        description: error.reason || error.message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Edit ${label || 'Dashboard'}`}
      visible={showEditModal}
      onCancel={() => setShowEditModal(false)}
      style={{ minWidth: '75%' }}
      confirmLoading={busy}
      footer={null}
      destroyOnClose={true}
    >
      <DashboardConfigEditor
        availablePlugins={availablePlugins}
        dashboard={{
          label,
          description,
          dataQuery,
          plugins,
        }}
        onSubmit={handleSubmit}
        linkToSparqlQueryEditor={(dataQuery: string) => {
          return (
            <Link
              to={`/${orgLabel}/${projectLabel}/${viewId}/sparql?query=${encodeURIComponent(
                dataQuery
              )}`}
              target="_blank"
            >
              View query in Sparql Editor
            </Link>
          );
        }}
      ></DashboardConfigEditor>
    </Modal>
  );
};

export default DashboardEditorContainer;