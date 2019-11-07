import { RouteProps } from 'react-router-dom';

import OrgsView from './views/OrgsView';
import ProjectsView from './views/ProjectsView';
import ProjectView from './views/ProjectView';
import Login from './views/Login';
import ResourceView from './views/ResourceView';
import ElasticSearchQueryView from './views/ElasticSearchQueryView';
import SparqlQueryView from './views/SparqlQueryView';
import ACLsView from './views/ACLsView';
import UserView from './views/UserView';

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: OrgsView,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/user',
    component: UserView,
  },
  {
    path: '/:orgLabel',
    exact: true,
    component: ProjectsView,
  },
  {
    path: '/:orgLabel/:projectLabel',
    exact: true,
    component: ProjectView,
  },
  {
    path: '/:orgLabel/:projectLabel/resources/:resourceId',
    component: ResourceView,
  },
  {
    path: '/:orgLabel/:projectLabel/:viewId/_search',
    component: ElasticSearchQueryView,
  },
  {
    path: '/:orgLabel/:projectLabel/:viewId/sparql',
    component: SparqlQueryView,
  },
  {
    path: '/:orgLabel/:projectLabel/_settings/acls',
    component: ACLsView,
  },
];

export default routes;