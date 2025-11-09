const { validationResult } = require('express-validator');
const { Role, Permission, RolePermission, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// @desc    Obtener todos los roles
// @route   GET /api/roles
// @access  Private (admin usuarios)
const getRoles = async (req, res, next) => {
  try {
    const { includeInactive = false, search = '' } = req.query;

    const where = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const roles = await Role.findAll({
      where,
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }, // No incluir datos de la tabla intermedia
          attributes: ['id', 'name', 'code', 'category']
        }
      ],
      order: [['name', 'ASC']]
    });

    // Contar usuarios por rol
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.count({ where: { role: role.code } });
        return {
          ...role.toJSON(),
          userCount
        };
      })
    );

    res.json({
      success: true,
      count: rolesWithCount.length,
      data: rolesWithCount
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener rol por ID
// @route   GET /api/roles/:id
// @access  Private (admin usuarios)
const getRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code', 'category', 'description']
        }
      ]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    // Contar usuarios con este rol
    const userCount = await User.count({ where: { role: role.code } });

    res.json({
      success: true,
      data: {
        ...role.toJSON(),
        userCount
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Crear nuevo rol
// @route   POST /api/roles
// @access  Private (admin usuarios)
const createRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, code, description, color, permissionIds = [] } = req.body;

    // Verificar que no exista un rol con el mismo código
    const existingRole = await Role.findOne({ where: { code } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un rol con ese código'
      });
    }

    // Crear el rol
    const role = await Role.create({
      name,
      code,
      description,
      color,
      isSystemRole: false
    });

    // Asignar permisos si se proporcionaron
    if (permissionIds.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: permissionIds }
      });

      if (permissions.length !== permissionIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Algunos permisos no existen'
        });
      }

      await role.addPermissions(permissions);
    }

    // Recargar con permisos
    await role.reload({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: role
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar rol
// @route   PUT /api/roles/:id
// @access  Private (admin usuarios)
const updateRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    // No permitir modificar roles del sistema (código)
    if (role.isSystemRole && req.body.code && req.body.code !== role.code) {
      return res.status(403).json({
        success: false,
        error: 'No se puede cambiar el código de un rol del sistema'
      });
    }

    const { name, description, color, isActive } = req.body;

    // Actualizar campos
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (color !== undefined) role.color = color;
    if (isActive !== undefined && !role.isSystemRole) {
      // Solo permitir desactivar si no es rol del sistema
      role.isActive = isActive;
    }

    await role.save();

    // Recargar con permisos
    await role.reload({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    const userCount = await User.count({ where: { role: role.code } });

    res.json({
      success: true,
      data: {
        ...role.toJSON(),
        userCount
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar rol
// @route   DELETE /api/roles/:id
// @access  Private (admin usuarios)
const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    // No permitir eliminar roles del sistema
    if (role.isSystemRole) {
      return res.status(403).json({
        success: false,
        error: 'No se pueden eliminar roles del sistema'
      });
    }

    // Verificar si hay usuarios con este rol
    const userCount = await User.count({ where: { role: role.code } });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar el rol porque tiene ${userCount} usuario(s) asignado(s)`,
        userCount
      });
    }

    await role.destroy();

    res.json({
      success: true,
      message: 'Rol eliminado correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener permisos de un rol
// @route   GET /api/roles/:id/permissions
// @access  Private (admin usuarios)
const getRolePermissions = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: ['created_at'] }
        }
      ]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    res.json({
      success: true,
      data: role.permissions
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Asignar permisos a un rol
// @route   POST /api/roles/:id/permissions
// @access  Private (admin usuarios)
const assignPermissions = async (req, res, next) => {
  try {
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar un array de IDs de permisos'
      });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }

    // Verificar que todos los permisos existan
    const permissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    if (permissions.length !== permissionIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Algunos permisos no existen'
      });
    }

    // Asignar permisos (esto reemplazará los existentes)
    await role.setPermissions(permissions);

    // Recargar con permisos
    await role.reload({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Permisos asignados correctamente',
      data: role
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Agregar un permiso a un rol
// @route   POST /api/roles/:id/permissions/:permissionId
// @access  Private (admin usuarios)
const addPermission = async (req, res, next) => {
  try {
    const { id, permissionId } = req.params;

    const role = await Role.findByPk(id);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({
        success: false,
        error: 'Rol o permiso no encontrado'
      });
    }

    // Verificar si ya tiene el permiso
    const hasPermission = await role.hasPermission(permission);

    if (hasPermission) {
      return res.status(400).json({
        success: false,
        error: 'El rol ya tiene este permiso asignado'
      });
    }

    await role.addPermission(permission);

    res.json({
      success: true,
      message: 'Permiso agregado correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Quitar un permiso de un rol
// @route   DELETE /api/roles/:id/permissions/:permissionId
// @access  Private (admin usuarios)
const removePermission = async (req, res, next) => {
  try {
    const { id, permissionId } = req.params;

    const role = await Role.findByPk(id);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({
        success: false,
        error: 'Rol o permiso no encontrado'
      });
    }

    await role.removePermission(permission);

    res.json({
      success: true,
      message: 'Permiso removido correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener roles sin uso (sin usuarios asignados)
// @route   GET /api/roles/unused
// @access  Private (admin usuarios)
const getUnusedRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      where: {
        isSystemRole: false,
        isActive: true
      },
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    // Filtrar roles sin usuarios
    const unusedRoles = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.count({ where: { role: role.code } });
        return { role, userCount };
      })
    );

    const rolesWithoutUsers = unusedRoles
      .filter(item => item.userCount === 0)
      .map(item => ({
        ...item.role.toJSON(),
        userCount: 0
      }));

    res.json({
      success: true,
      count: rolesWithoutUsers.length,
      data: rolesWithoutUsers
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadísticas de roles
// @route   GET /api/roles/stats
// @access  Private (admin usuarios)
const getRoleStats = async (req, res, next) => {
  try {
    const totalRoles = await Role.count();
    const activeRoles = await Role.count({ where: { isActive: true } });
    const systemRoles = await Role.count({ where: { isSystemRole: true } });

    // Roles con más usuarios
    const roles = await Role.findAll({
      where: { isActive: true }
    });

    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.count({ where: { role: role.code } });
        return {
          id: role.id,
          name: role.name,
          code: role.code,
          userCount
        };
      })
    );

    rolesWithUserCount.sort((a, b) => b.userCount - a.userCount);

    res.json({
      success: true,
      data: {
        totalRoles,
        activeRoles,
        systemRoles,
        customRoles: totalRoles - systemRoles,
        topRoles: rolesWithUserCount.slice(0, 5)
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignPermissions,
  addPermission,
  removePermission,
  getUnusedRoles,
  getRoleStats
};
