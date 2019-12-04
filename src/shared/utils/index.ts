import { Resource, Identity } from '@bbp/nexus-sdk';

/**
 * getProp utility - an alternative to lodash.get
 * @author @harish2704, @muffypl, @pi0
 * @param {Object} object
 * @param {String|Array} path
 * @param {*} defaultVal
 */
export const getProp = function getPropertyWithPath(
  object: any,
  path: string | any[],
  defaultVal: any = null
): any {
  if (!object) {
    return defaultVal;
  }
  const pathArray = Array.isArray(path)
    ? path
    : path.split('.').filter(i => i.length);

  if (!pathArray.length) {
    return object === undefined ? defaultVal : object;
  }
  const newObj = object[pathArray.shift()];
  if (!newObj) {
    return defaultVal;
  }
  return getPropertyWithPath(newObj, pathArray, defaultVal);
};

/**
 * moveTo utility - move an array element to a new index position
 * @author Richard Scarrott
 * @param {Array} array
 * @param {number} from
 * @param {number} to
 */
export const moveTo = function moveArrayElement(
  array: any[],
  from: number,
  to: number
): any[] {
  return array.splice(to, 0, array.splice(from, 1)[0]);
};

/**
 * creates a random UUID
 * @author https://stackoverflow.com/users/109538/broofa
 * @export
 * @returns {string}
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Given an array of identities, returns a list of usernames or []
 *
 * @param {Identity[]} identities an array of identities
 * @returns {string[]} A list of usernames, or an empty array
 */
export const getUserList = (identities: Identity[]) =>
  identities
    .filter(identity => identity['@type'] === 'User')
    .map(identity => identity.subject);

/**
 *  Given an array of identities, returns a unique list of permissions, in importance order.
 * - Anonymous
 * - Authenticated
 * - User
 *
 * If a project has an identity of type anonymous, then is it "public" access
 * If a project has an identity of type authenticated, then all authenticated users have access
 * If a project has an identity of type User, only this or these users will have access
 *
 * @param {Indentity[]} identities
 * @returns {string[]} list of ordered permissions
 */
export const getOrderedPermissions = (
  identities: Identity[]
): Identity['@type'][] => {
  const permissionWeight: { [key: string]: number } = {
    Anonymous: 1,
    Authenticated: 2,
    Group: 3,
    User: 4,
  };

  const sorted = identities
    .sort(
      (idA, idB) =>
        permissionWeight[idA['@type']] - permissionWeight[idB['@type']]
    )
    .map(identity => identity['@type']);

  return [...new Set(sorted)];
};

export const asyncTimeout = (timeInMilliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
};

/**
 * Ensure a path fragment has a leading slash, to compute routes.
 */
export const addLeadingSlash = (path: string) => {
  return path.charAt(0) === '/' ? path : `/${path}`;
};

/**
 * Compute route path without base path.
 *
 * Useful when using MemoryHistory which does not support `basename`.
 *
 * Code taken from react-router StaticRouter component's private methods.
 */
export const stripBasename = (basename: string, path: string) => {
  if (!basename) return path;

  const base = addLeadingSlash(basename);

  if (path.indexOf(base) !== 0) return path;

  return path.substr(base.length);
};

// For getting the last part of a uri path as a title or label
export const labelOf = (string: string) => {
  const slash = string.substring(string.lastIndexOf('/') + 1);
  const title = slash.substring(slash.lastIndexOf('#') + 1);
  return title;
};

export const isBrowser = typeof window !== 'undefined';

/**
 * Returns the logout URL of the realm the user is authenticated with
 *
 * @param identities
 * @param realms
 */
export function getLogoutUrl(
  identities: Identity[],
  realms: { label: string; endSessionEndpoint: string }[]
): string {
  // find authenticated Identity and get realm name
  const identity = identities.find(
    identity => identity['@type'] === 'Authenticated'
  );
  if (identity === undefined) {
    return '';
  }

  // find realm with the matching label
  const realm = realms.find(realm => realm.label === identity.realm);
  if (realm === undefined) {
    return '';
  }

  // return logout URL
  return realm.endSessionEndpoint;
}

export function hasExpired(timestamp: number): Boolean {
  return timestamp < Date.now().valueOf() / 1000;
}

export function getDestinationParam(): string {
  const destinationPath = encodeURIComponent(window.location.pathname.slice(1));
  return destinationPath ? `?destination=${destinationPath}` : '';
}

/**
 * Returns a nice username
 *
 * @param user a url-like user https://api.bluebrainnexus.io/v1/realms/myrealm/users/kenny
 * @returns a nice username
 */
export function getUsername(user: string): string {
  let userName;
  if (user.length === 0) {
    userName = 'Unknown';
  } else {
    try {
      [userName] = user.split('/').slice(-1);
    } catch (e) {
      userName = user;
    }
  }
  return userName;
}

export function blacklistKeys(raw: { [key: string]: any }, keys: string[]) {
  return Object.keys(raw)
    .filter(key => !keys.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = raw[key];
      return obj;
    }, {});
}

/**
 * Returns a nice human label based on @mfsy 's suggestions
 *
 * @param {Resource} resource
 * @returns {string} human readable label
 */
export function getResourceLabel(
  resource: Resource & {
    [key: string]: any;
  }
) {
  return resource.name || resource.label || labelOf(resource['@id']);
}

/**
 * Returns a resource's administrative info
 *
 * @param {self} string
 * @returns {{
 * orgLabel: string,
 * projectLabel: string,
 * resourceId: string
 * }}
 */
export function getResourceLabelsAndIdsFromSelf(self: string) {
  // for system resource like Files or Schemas
  const systemResourceTypes = [
    'files',
    'views',
    'schemas',
    'archives',
    'resolvers',
    'storages',
  ];
  const [id, project, org, systemResourceType] = self.split('/').reverse();

  if (systemResourceTypes.includes(systemResourceType)) {
    return {
      orgLabel: org,
      projectLabel: project,
      resourceId: id,
    };
  }

  // its a normal resource
  const [resourceId, schemaId, projectLabel, orgLabel] = self
    .split('/')
    .reverse();
  return {
    orgLabel,
    projectLabel,
    schemaId,
    resourceId,
  };
}

/**
 * Returns a project and org labels from url
 *
 * @param {projectUrl} string
 * @returns {
 * [org: string, proj: string]
 * }
 */
export const parseProjectUrl = (projectUrl: string) => {
  const projectUrlR = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const [, org, proj] = projectUrl.match(projectUrlR) as string[];
  return [org, proj];
};

/**
 * this function changes cameCasedString to Camel Cased String
 * @author https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
 * @param labelString String in camelCase
 */
export const camelCaseToLabelString = (labelString: string): string => {
  return (
    labelString
      // insert a space before all caps
      .replace(/([A-Z])/g, ' $1')
      // upper case the first character
      .replace(/^./, str => str.toUpperCase())
      // remove potential white spaces from both sides of the string
      .trim()
  );
};

/*
 * Converts camelCase strings to Camel Case titles
 *
 * @param {string} camelCase string
 * @returns {string} Title Case
 */
export const camelCaseToTitleCase = (camelCase: string): string => {
  const result = camelCase
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replace(/( +)/g, ' ');
  // capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};
