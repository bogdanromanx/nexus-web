import { Resource, Identity } from '@bbp/nexus-sdk';
import {
  isMatch,
  isMatchWith,
  isRegExp,
  isMatchWithCustomizer,
  pick,
} from 'lodash';

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
export const labelOf = (inputString: string) => {
  const slash = inputString.substring(inputString.lastIndexOf('/') + 1);
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
  return (
    resource.prefLabel ||
    resource.label ||
    resource.name ||
    labelOf(resource['@id'])
  );
}

/**
 * Returns a resource's project and org label
 *
 * @param {resource} Resource
 * @returns {{
 * orgLabel: string,
 * projectLabel: string,
 * }}
 */
export function getOrgAndProjectFromResource(resource: Resource) {
  return getOrgAndProjectFromProjectId(resource._project);
}

/**
 * Returns a resource's project and org label
 *
 * @param {string} projectId
 * @returns {{
 * orgLabel: string,
 * projectLabel: string,
 * }}
 */
export function getOrgAndProjectFromProjectId(projectId: string) {
  const [projectLabel, orgLabel, ...rest] = projectId.split('/').reverse();
  return {
    orgLabel,
    projectLabel,
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

/*
 * Tests for project and resource path in a given string.
 *
 * @param {string} entry url string
 * @returns {string} path (either resource pr project path) or the input url.
 */
export const matchResultUrls = (entry: string) => {
  const projectUrlPattern = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const resourceUrlPattern = /resources\/(.[^/]*)\/(.[^/]*)\/(.[^/]*)\/(.*)/;
  const fileUrlPattern = /files(\/([\w-]+)\/([\w-]+))/;
  if (projectUrlPattern.test(entry)) {
    const [, org, proj] = entry.match(projectUrlPattern) as string[];
    return `${org}/${proj}`;
  }
  if (resourceUrlPattern.test(entry)) {
    const labels = entry.match(resourceUrlPattern) as string[];
    const [, orgLabel, projectLabel, schema, resourceId] = labels;
    return `/${orgLabel}/${projectLabel}/resources/${resourceId}`;
  }
  if (fileUrlPattern.test(entry)) {
    const labels = entry.match(fileUrlPattern) as string[];
    const [resourceId] = entry.split('/').reverse();
    const [projectLabel, orgLabel] = labels.reverse();
    return `/${orgLabel}/${projectLabel}/resources/${resourceId}`;
  }
  return entry;
};

/*
 * Tests if a string is an ISO date
 *
 * @param {string} string
 * @returns {boolean} if a string is an ISO date or not
 */
export const isISODate = (date: string) => {
  const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.[0-9Z+]{1,9}/;

  return isoDateRegex.test(date);
};

/*
 * filter plugin array using properties in pluginMap and return a matching subset.
 *
 * @param {Object} pluginMap
 * @param {string} plugins
 * @param {string}
 * @returns {string[]}
 */
export const matchPlugins = (
  pluginMap: Object,
  plugins: string[],
  resource: Resource
) => {
  const matchValueWithArray = (value: any, other: any[]) => {
    const regexChars = new RegExp(/[!@#$%^&*(),.?":{}|<>]/, 'g');
    return typeof value === 'string'
      ? other.some(o => {
          if (typeof o === 'string') {
            if (regexChars.test(o)) {
              const regex = new RegExp(o);
              return regex.test(value);
            }
            return o === value;
          }
          return false;
        })
      : other.some(o => {
          return customizer(value, o, '', o, value); // Apply the match logic recursively.
        });
  };

  const matchArrays = (value: any[], other: any[]) => {
    return value.some(v => {
      return matchValueWithArray(v, other);
    });
  };

  const customizer: isMatchWithCustomizer = (value: any, other: any) => {
    // return true if  value  match any object in
    // other array.
    if (Array.isArray(other) && !Array.isArray(value)) {
      return matchValueWithArray(value, other);
    }

    // return true if any object in value array match any object in
    // other array.
    if (Array.isArray(other) && Array.isArray(value)) {
      return matchArrays(value, other);
    }
    return isMatch(value, other);
  };
  return filterPlugins(pluginMap, plugins, resource, customizer);
};

export type PluginMapping = {
  [pluginKey: string]: object;
};

/*
 * Returns plugins mappings
 *
 * @param {object} plugin Manifest
 * @returns {array} plugins
 */
export const pluginsMap = (pluginManifest: any) =>
  Object.keys(pluginManifest || {}).reduce((mapping, pluginManifestKey) => {
    if (!pluginManifest) {
      return mapping;
    }
    mapping[pluginManifestKey] = pluginManifest[pluginManifestKey].mapping;
    return mapping;
  }, {} as PluginMapping);

/*
 * Returns plugins that should be excluded
 *
 * @param {object} plugin Manifest
 * @returns {array} plugins
 */
export const pluginsExcludeMap = (pluginManifest: any) =>
  Object.keys(pluginManifest || {}).reduce((mapping, pluginManifestKey) => {
    if (!pluginManifest) {
      return mapping;
    }
    mapping[pluginManifestKey] = pluginManifest[pluginManifestKey].exclude;
    return mapping;
  }, {} as PluginMapping);

/*
 * Returns studio uri
 *
 * @param {string} orgLabel
 * @param {string} projectLabel
 * @param {string} studioId
 * @returns {string} studio uri
 */
export const makeStudioUri = (
  orgLabel: string,
  projectLabel: string,
  studioId: string
) => {
  return `/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(studioId)}`;
};

/**
 *
 * @param pluginMap
 * @param plugins
 * @param resource
 * @param customizer
 * @returns {string[]}
 *
 */

function filterPlugins(
  pluginMap: Object,
  plugins: string[],
  resource: Resource<{ [key: string]: any }>,
  customizer: isMatchWithCustomizer
) {
  const map = new Map(Object.entries(pluginMap));
  const newPlugins = plugins.filter(p => {
    const shape = map.get(p);
    if (resource && shape) {
      if (Array.isArray(shape)) {
        for (let i = 0; i < shape.length; i += 1) {
          if (
            isMatchWith(
              pick(resource, Object.keys(shape[i])),
              shape[i],
              customizer
            )
          ) {
            return true;
          }
        }
      }
      return isMatchWith(pick(resource, Object.keys(shape)), shape, customizer);
    }
    return false;
  });
  return newPlugins;
}

export const parseJsonMaybe = <T = object>(
  str: string | null | undefined,
  errorCallback?: (error: Error) => void
) => {
  let parsedJson: T | null = null;
  try {
    parsedJson = JSON.parse(str || '');
  } catch (error) {
    errorCallback && errorCallback(error as Error);
  }
  return parsedJson;
};

export const forceAsArray = <T>(objectOrArray: T | T[] | null | undefined) => {
  return !!objectOrArray
    ? Array.isArray(objectOrArray)
      ? objectOrArray
      : [objectOrArray]
    : [];
};
