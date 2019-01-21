import { Action, ActionCreator, Dispatch } from 'redux';
import { Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';

enum ProjectActionTypes {
  FETCHING = '@@nexus/PROJECT_FETCHING',
  FULFILLED = '@@nexus/PROJECT_FETHCING_FULFILLED',
  FAILED = '@@nexus/PROJECT_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: ProjectActionTypes.FETCHING,
  FULFILLED: ProjectActionTypes.FULFILLED,
  FAILED: ProjectActionTypes.FAILED,
};

const fetchProjectsAction: ActionCreator<
  FetchAction<ProjectActionTypes.FETCHING>
> = () => ({
  type: ProjectActionTypes.FETCHING,
});

const fetchProjectsFulfilledAction: ActionCreator<
  FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
> = (project: Project) => ({
  type: ProjectActionTypes.FULFILLED,
  payload: project,
});

const fetchProjectsFailedAction: ActionCreator<
  FetchFailedAction<ProjectActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: ProjectActionTypes.FAILED,
});

export type ProjectActions =
  | FetchAction<ProjectActionTypes.FETCHING>
  | FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
  | FetchFailedAction<ProjectActionTypes.FAILED>;

export const fetchAndAssignProject: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<
    | FetchFulfilledAction<ProjectActionTypes.FULFILLED, Project>
    | FetchFailedAction<ProjectActionTypes.FAILED>
  > => {
    dispatch(fetchProjectsAction());
    try {
      const project: Project = await Project.get(orgLabel, projectLabel);
      return dispatch(fetchProjectsFulfilledAction(project));
    } catch (e) {
      return dispatch(fetchProjectsFailedAction(e));
    }
  };
};