const { isArray } = require('lodash');
const { escapeValue } = require('../utils');

const formatRoleOptions = (roleOptions = {}) => {
  const options = [];
  if (roleOptions.superuser !== undefined) {
    options.push(roleOptions.superuser ? 'SUPERUSER' : 'NOSUPERUSER');
  }
  if (roleOptions.createdb !== undefined) {
    options.push(roleOptions.createdb ? 'CREATEDB' : 'NOCREATEDB');
  }
  if (roleOptions.createrole !== undefined) {
    options.push(roleOptions.createrole ? 'CREATEROLE' : 'NOCREATEROLE');
  }
  if (roleOptions.inherit !== undefined) {
    options.push(roleOptions.inherit ? 'INHERIT' : 'NOINHERIT');
  }
  if (roleOptions.login !== undefined) {
    options.push(roleOptions.login ? 'LOGIN' : 'NOLOGIN');
  }
  if (roleOptions.replication !== undefined) {
    options.push(roleOptions.replication ? 'REPLICATION' : 'NOREPLICATION');
  }
  if (roleOptions.bypassrls !== undefined) {
    options.push(roleOptions.bypassrls ? 'BYPASSRLS' : 'NOBYPASSRLS');
  }
  if (roleOptions.limit) {
    options.push(`CONNECTION LIMIT ${Number(roleOptions.limit)}`);
  }
  if (roleOptions.password !== undefined) {
    const encrypted =
      roleOptions.encrypted === false ? 'UNENCRYPTED' : 'ENCRYPTED';
    options.push(`${encrypted} PASSWORD ${escapeValue(roleOptions.password)}`);
  }
  if (roleOptions.valid !== undefined) {
    const valid = roleOptions.valid
      ? escapeValue(roleOptions.valid)
      : "'infinity'";
    options.push(`VALID UNTIL ${valid}`);
  }
  if (roleOptions.inRole) {
    const inRole = isArray(roleOptions.inRole)
      ? roleOptions.inRole.join(',')
      : roleOptions.inRole;
    options.push(`IN ROLE ${inRole}`);
  }
  if (roleOptions.role) {
    const role = isArray(roleOptions.role)
      ? roleOptions.role.join(',')
      : roleOptions.role;
    options.push(`ROLE ${role}`);
  }
  if (roleOptions.admin) {
    const admin = isArray(roleOptions.admin)
      ? roleOptions.admin.join(',')
      : roleOptions.admin;
    options.push(`ADMIN ${admin}`);
  }

  return options.join(' ');
};

function dropRole(mOptions) {
  const _drop = (roleName, { ifExists } = {}) => {
    const ifExistsStr = ifExists ? ' IF EXISTS' : '';
    const roleNameStr = mOptions.literal(roleName);
    return `DROP ROLE${ifExistsStr} ${roleNameStr};`;
  };
  return _drop;
}

function createRole(mOptions) {
  const _create = (roleName, roleOptions = {}) => {
    const options = formatRoleOptions({
      ...roleOptions,
      superuser: roleOptions.superuser || false,
      createdb: roleOptions.createdb || false,
      createrole: roleOptions.createrole || false,
      inherit: roleOptions.inherit !== false,
      login: roleOptions.login || false,
      replication: roleOptions.replication || false
    });
    const optionsStr = options ? ` WITH ${options}` : '';
    return `CREATE ROLE ${mOptions.literal(roleName)}${optionsStr};`;
  };
  _create.reverse = dropRole(mOptions);
  return _create;
}

function alterRole(mOptions) {
  const _alter = (roleName, roleOptions = {}) => {
    const options = formatRoleOptions(roleOptions);
    return options
      ? `ALTER ROLE ${mOptions.literal(roleName)} WITH ${options};`
      : '';
  };
  return _alter;
}

function renameRole(mOptions) {
  const _rename = (oldRoleName, newRoleName) => {
    const oldRoleNameStr = mOptions.literal(oldRoleName);
    const newRoleNameStr = mOptions.literal(newRoleName);
    return `ALTER ROLE ${oldRoleNameStr} RENAME TO ${newRoleNameStr};`;
  };
  _rename.reverse = (oldRoleName, newRoleName) =>
    _rename(newRoleName, oldRoleName);
  return _rename;
}

module.exports = {
  createRole,
  dropRole,
  alterRole,
  renameRole
};
