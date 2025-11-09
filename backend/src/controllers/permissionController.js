const { validationResult } = require('express-validator');
const { Permission, Role } = require('../models');
const { Op } = require('sequelize');

// @desc    Obtener todos los permisos
// @route   GET /api/permissions
// @access  Private (admin usuarios)
const getPermissions = async (req, res, next) => {
  try {
    const { category, search = '' } = req.query;

    const where = { isActive: true };
    
    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const permissions = await Permission.findAll({
      where,
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Agrupar por categoría
    const grouped = permissions.reduce((acc, permission) => {
      const cat = permission.category || 'Sin categoría';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(permission);
      return acc;
    }, {});

    res.json({
      success: true,
      count: permissions.length,
      data: permissions,
      grouped
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener permiso por ID
// @route   GET /api/permissions/:id
// @access  Private (admin usuarios)
const getPermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permiso no encontrado'
      });
    }

    res.json({
      success: true,
      data: permission
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Crear nuevo permiso
// @route   POST /api/permissions
// @access  Private (admin usuarios)
const createPermission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, code, description, category } = req.body;

    // Verificar que no exista un permiso con el mismo código
    const existingPermission = await Permission.findOne({ where: { code } });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un permiso con ese código'
      });
    }

    const permission = await Permission.create({
      name,
      code,
      description,
      category
    });

    res.status(201).json({
      success: true,
      data: permission
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar permiso
// @route   PUT /api/permissions/:id
// @access  Private (admin usuarios)
const updatePermission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permiso no encontrado'
      });
    }

    const { name, description, category, isActive } = req.body;

    if (name !== undefined) permission.name = name;
    if (description !== undefined) permission.description = description;
    if (category !== undefined) permission.category = category;
    if (isActive !== undefined) permission.isActive = isActive;

    await permission.save();

    res.json({
      success: true,
      data: permission
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar permiso
// @route   DELETE /api/permissions/:id
// @access  Private (admin usuarios)
const deletePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permiso no encontrado'
      });
    }

    // Verificar si está siendo usado por algún rol
    const rolesCount = await permission.countRoles();

    if (rolesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar el permiso porque está asignado a ${rolesCount} rol(es)`
      });
    }

    await permission.destroy();

    res.json({
      success: true,
      message: 'Permiso eliminado correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener categorías de permisos
// @route   GET /api/permissions/categories
// @access  Private (admin usuarios)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Permission.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        category: { [Op.ne]: null }
      }
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    res.json({
      success: true,
      data: categoryList
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getCategories
};
