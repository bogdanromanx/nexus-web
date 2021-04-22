// const nxv = 'https://bluebrain.github.io/nexus/vocabulary/';
// const prov = 'http://www.w3.org/ns/prov#';

export const fusionConfig = {
  // org and project to store application data
  configOrg: 'webapps',
  configProject: 'nexus-web',

  // prefix for the org to store personal projects 'prefix-username'
  personalOrgPrefix: 'fusion-',

  // resource types
  workflowStepType: 'nxv:WorkflowStep',
  activityWorkflowLink: 'nxv:activities',
  templateType: 'FusionTemplate',
  activityType: 'prov:Activity',
  projectMetadataType: 'FusionMetadata',
  fusionProjectTypes: ['FusionMetadata', 'FusionProject'],
  codeType: ['SoftwareSourceCode', 'Entity'],
  noteType: ['FusionNote', 'Entity'],
  agentOrgType: ['Agent', 'Organization'],
  agentPersonType: ['Agent', 'Person'],

  // project to fetch datamodels from
  datamodelsActivityId: 'prov:Activity',

  // Default API mappings for project creation.
  defaultAPIMappings: [
    {
      prefix: 'prov',
      namespace: 'http://www.w3.org/ns/prov#',
    },
    {
      prefix: 'provcommonshapes',
      namespace: 'https://provshapes.org/commons/',
    },
    {
      prefix: 'provdatashapes',
      namespace: 'https://provshapes.org/datashapes/',
    },
    {
      prefix: 'schemaorg',
      namespace: 'http://schema.org/',
    },
  ],
};

export default fusionConfig;