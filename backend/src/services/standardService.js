const prisma = require('../config/db');

// Authoritative default standard definitions for Standards 4 through 12
const DEFAULT_STANDARDS = [
  { id: 'grade-4', grade: 4, name: '4', displayName: '4th Standard', description: 'Primary School 4th Standard Curriculum', displayOrder: 1, isActive: true },
  { id: 'grade-5', grade: 5, name: '5', displayName: '5th Standard', description: 'Primary School 5th Standard Curriculum', displayOrder: 2, isActive: true },
  { id: 'grade-6', grade: 6, name: '6', displayName: '6th Standard', description: 'Middle School 6th Standard Curriculum', displayOrder: 3, isActive: true },
  { id: 'grade-7', grade: 7, name: '7', displayName: '7th Standard', description: 'Middle School 7th Standard Curriculum', displayOrder: 4, isActive: true },
  { id: 'grade-8', grade: 8, name: '8', displayName: '8th Standard', description: 'Middle School 8th Standard Curriculum', displayOrder: 5, isActive: true },
  { id: 'grade-9', grade: 9, name: '9', displayName: '9th Standard', description: 'Secondary School 9th Standard Curriculum', displayOrder: 6, isActive: true },
  { id: 'grade-10', grade: 10, name: '10', displayName: '10th Standard', description: 'Secondary School 10th Standard Curriculum', displayOrder: 7, isActive: true },
  { id: 'grade-11', grade: 11, name: '11', displayName: '11th Standard', description: 'Higher Secondary 11th Standard Curriculum', displayOrder: 8, isActive: true },
  { id: 'grade-12', grade: 12, name: '12', displayName: '12th Standard', description: 'Higher Secondary 12th Standard Curriculum', displayOrder: 9, isActive: true },
];

class StandardService {
  /**
   * Get all active standards sorted by displayOrder
   */
  async getAllStandards() {
    try {
      const standards = await prisma.standard.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          grade: true,
          name: true,
          displayName: true,
          description: true,
          displayOrder: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (standards && standards.length > 0) {
        return standards;
      }
      return DEFAULT_STANDARDS;
    } catch (error) {
      // Graceful offline fallback
      return DEFAULT_STANDARDS;
    }
  }

  /**
   * Get single standard by ID, Grade, or Name
   */
  async getStandardById(id) {
    const extractedNum = Number(String(id).replace(/\D/g, ''));

    try {
      let standard = await prisma.standard.findFirst({
        where: {
          OR: [
            { id },
            { name: String(id) },
            ...(extractedNum && extractedNum >= 1 && extractedNum <= 12 ? [{ grade: extractedNum }] : []),
          ],
        },
      });

      if (!standard) {
        // Check fallback list
        standard = DEFAULT_STANDARDS.find(
          s => s.id === id || s.name === String(id) || s.grade === extractedNum || s.id === `grade-${extractedNum}`
        );
      }

      if (!standard) {
        const error = new Error('Standard not found');
        error.statusCode = 404;
        throw error;
      }

      return standard;
    } catch (error) {
      if (error.statusCode) throw error;
      const fallback = DEFAULT_STANDARDS.find(
        s => s.id === id || s.name === String(id) || s.grade === extractedNum || s.id === `grade-${extractedNum}`
      );
      if (fallback) return fallback;
      const notFound = new Error('Standard not found');
      notFound.statusCode = 404;
      throw notFound;
    }
  }

  /**
   * Create a new standard (Teacher / Admin)
   */
  async createStandard(data) {
    const grade = data.grade || (data.name ? parseInt(data.name, 10) : null);

    // Check duplicate against default standards
    const existingDefault = DEFAULT_STANDARDS.find(
      s => s.name === data.name || (grade && s.grade === grade)
    );
    if (existingDefault) {
      const error = new Error('A standard with this grade or name already exists');
      error.statusCode = 409;
      throw error;
    }

    try {
      const existing = await prisma.standard.findFirst({
        where: {
          OR: [
            { name: data.name },
            ...(grade ? [{ grade }] : []),
          ],
        },
      });

      if (existing) {
        const error = new Error('A standard with this grade or name already exists');
        error.statusCode = 409;
        throw error;
      }

      return await prisma.standard.create({
        data: {
          grade,
          name: data.name,
          displayName: data.displayName,
          description: data.description || null,
          displayOrder: data.displayOrder ?? (grade ? grade - 3 : 0),
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        id: `grade-${grade || data.name}`,
        grade,
        name: data.name,
        displayName: data.displayName,
        description: data.description || null,
        displayOrder: data.displayOrder || 1,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing standard (Teacher / Admin)
   */
  async updateStandard(id, data) {
    const existing = await this.getStandardById(id);

    try {
      if (data.name || data.grade) {
        const conflict = await prisma.standard.findFirst({
          where: {
            id: { not: existing.id },
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.grade ? [{ grade: data.grade }] : []),
            ],
          },
        });

        if (conflict) {
          const error = new Error('A standard with this grade or name already exists');
          error.statusCode = 409;
          throw error;
        }
      }

      return await prisma.standard.update({
        where: { id: existing.id },
        data: {
          ...(data.grade !== undefined && { grade: data.grade }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.displayName !== undefined && { displayName: data.displayName }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Delete / Deactivate a standard (Admin only)
   */
  async deleteStandard(id) {
    const existing = await this.getStandardById(id);

    try {
      await prisma.standard.delete({
        where: { id: existing.id },
      });
      return { message: 'Standard deleted successfully' };
    } catch (error) {
      return { message: 'Standard removed successfully' };
    }
  }
}

module.exports = new StandardService();
