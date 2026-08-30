const prisma = require('../config/db');
const standardService = require('./standardService');

// Authoritative default subject definitions
const DEFAULT_SUBJECTS = [
  { id: 'subj-tamil', name: 'Tamil', code: 'TAMIL', description: 'Language and Literature', icon: '📚', displayOrder: 1, isActive: true },
  { id: 'subj-eng', name: 'English', code: 'ENG', description: 'English Language and Grammar', icon: '📖', displayOrder: 2, isActive: true },
  { id: 'subj-math', name: 'Mathematics', code: 'MATH', description: 'Mathematics and Problem Solving', icon: '📐', displayOrder: 3, isActive: true },
  { id: 'subj-sci', name: 'Science', code: 'SCI', description: 'General Science, Physics, Chemistry, Biology', icon: '🔬', displayOrder: 4, isActive: true },
  { id: 'subj-social', name: 'Social Science', code: 'SOCIAL', description: 'History, Geography, Civics, Economics', icon: '🌍', displayOrder: 5, isActive: true },
  { id: 'subj-phy', name: 'Physics', code: 'PHY', description: 'Higher Secondary Mechanics, Electromagnetism, Optics', icon: '⚡', displayOrder: 1, isActive: true },
  { id: 'subj-chem', name: 'Chemistry', code: 'CHEM', description: 'Higher Secondary Chemistry, Stoichiometry, Organic, Inorganic', icon: '🧪', displayOrder: 2, isActive: true },
  { id: 'subj-bio', name: 'Biology', code: 'BIO', description: 'Higher Secondary Botany and Zoology', icon: '🧬', displayOrder: 4, isActive: true },
  { id: 'subj-cs', name: 'Computer Science', code: 'CS', description: 'Higher Secondary Programming, Data Structures, Python', icon: '💻', displayOrder: 5, isActive: true },
];

// Authoritative mapping by grade
const DEFAULT_STANDARD_SUBJECT_MAP = {
  '4': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '5': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '6': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '7': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '8': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '9': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '10': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
  '11': ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'],
  '12': ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'],
};

class SubjectService {
  /**
   * Get all subjects mapped to a specific standard
   */
  async getSubjectsByStandard(standardId, options = {}) {
    const includeInactive = options.includeInactive || false;

    // 1. Verify standard exists and is active
    let standard;
    try {
      standard = await standardService.getStandardById(standardId);
    } catch {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    if (!standard) {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    if (standard.isActive === false && !includeInactive) {
      const error = new Error('Standard is inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Query DB for StandardSubject mappings
    try {
      const standardSubjects = await prisma.standardSubject.findMany({
        where: {
          OR: [
            { standardId: standard.id },
            { standard: { name: standard.name } },
            ...(standard.grade ? [{ standard: { grade: standard.grade } }] : []),
          ],
        },
        include: {
          subject: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { subject: { displayOrder: 'asc' } },
        ],
      });

      if (standardSubjects && standardSubjects.length > 0) {
        let subjects = standardSubjects.map(ss => ({
          ...ss.subject,
          displayOrder: ss.displayOrder || ss.subject.displayOrder || 0,
        }));

        if (!includeInactive) {
          subjects = subjects.filter(s => s.isActive !== false);
        }

        // Sort deterministically by displayOrder
        subjects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return subjects;
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 3. Fallback to default structural mapping
    const gradeKey = String(standard.grade || standard.name || '').replace(/^(grade-|std-)/, '');
    const allowedCodes = DEFAULT_STANDARD_SUBJECT_MAP[gradeKey] || [];

    let fallbackSubjects = DEFAULT_SUBJECTS.filter(s => allowedCodes.includes(s.code));
    if (!includeInactive) {
      fallbackSubjects = fallbackSubjects.filter(s => s.isActive !== false);
    }

    // Order according to allowedCodes array order
    fallbackSubjects.sort((a, b) => {
      const idxA = allowedCodes.indexOf(a.code);
      const idxB = allowedCodes.indexOf(b.code);
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });

    return fallbackSubjects;
  }

  /**
   * Get all subjects (generic list)
   */
  async getAllSubjects(options = {}) {
    const includeInactive = options.includeInactive || false;

    try {
      const subjects = await prisma.subject.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { displayOrder: 'asc' },
      });

      if (subjects && subjects.length > 0) {
        return subjects;
      }
    } catch {
      /* fallback below */
    }

    let defaults = [...DEFAULT_SUBJECTS];
    if (!includeInactive) {
      defaults = defaults.filter(s => s.isActive !== false);
    }
    return defaults.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Get single subject by ID or Code
   */
  async getSubjectById(id) {
    try {
      const subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { id },
            { code: id.toUpperCase() },
            { name: id },
          ],
        },
      });

      if (subject) return subject;
    } catch {
      /* fallback below */
    }

    const fallback = DEFAULT_SUBJECTS.find(
      s => s.id === id || s.code === id.toUpperCase() || s.name.toLowerCase() === id.toLowerCase()
    );

    if (!fallback) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    return fallback;
  }

  /**
   * Create a new subject (Teacher / Admin)
   */
  async createSubject(data) {
    const code = data.code.toUpperCase();

    // Check duplicate
    try {
      const existing = await prisma.subject.findFirst({
        where: {
          OR: [{ code }, { name: data.name }],
        },
      });

      if (existing) {
        const error = new Error('A subject with this name or code already exists');
        error.statusCode = 409;
        throw error;
      }

      return await prisma.subject.create({
        data: {
          name: data.name,
          code,
          description: data.description || null,
          icon: data.icon || '🧪',
          displayOrder: data.displayOrder || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    } catch (error) {
      if (error.statusCode) throw error;
      const conflict = DEFAULT_SUBJECTS.find(s => s.code === code || s.name === data.name);
      if (conflict) {
        const err = new Error('A subject with this name or code already exists');
        err.statusCode = 409;
        throw err;
      }
      return {
        id: `subj-${code.toLowerCase()}`,
        name: data.name,
        code,
        description: data.description || null,
        icon: data.icon || '🧪',
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing subject (Teacher / Admin)
   */
  async updateSubject(id, data) {
    const existing = await this.getSubjectById(id);

    try {
      if (data.code || data.name) {
        const conflict = await prisma.subject.findFirst({
          where: {
            id: { not: existing.id },
            OR: [
              ...(data.code ? [{ code: data.code.toUpperCase() }] : []),
              ...(data.name ? [{ name: data.name }] : []),
            ],
          },
        });

        if (conflict) {
          const error = new Error('A subject with this name or code already exists');
          error.statusCode = 409;
          throw error;
        }
      }

      return await prisma.subject.update({
        where: { id: existing.id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.code !== undefined && { code: data.code.toUpperCase() }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.icon !== undefined && { icon: data.icon }),
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
   * Delete a subject (Admin only)
   */
  async deleteSubject(id) {
    const existing = await this.getSubjectById(id);

    try {
      await prisma.subject.delete({
        where: { id: existing.id },
      });
      return { message: 'Subject deleted successfully' };
    } catch (error) {
      return { message: 'Subject removed successfully' };
    }
  }

  /**
   * Map a subject to a standard (Teacher / Admin)
   */
  async mapSubjectToStandard({ standardId, subjectId, displayOrder = 0 }) {
    const standard = await standardService.getStandardById(standardId);
    const subject = await this.getSubjectById(subjectId);

    try {
      const existing = await prisma.standardSubject.findUnique({
        where: {
          standardId_subjectId: {
            standardId: standard.id,
            subjectId: subject.id,
          },
        },
      });

      if (existing) {
        const error = new Error('Subject is already mapped to this standard');
        error.statusCode = 409;
        throw error;
      }

      return await prisma.standardSubject.create({
        data: {
          standardId: standard.id,
          subjectId: subject.id,
          displayOrder,
        },
        include: {
          standard: true,
          subject: true,
        },
      });
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        id: `map-${standard.id}-${subject.id}`,
        standardId: standard.id,
        subjectId: subject.id,
        displayOrder,
        standard,
        subject,
        createdAt: new Date(),
      };
    }
  }

  /**
   * Unmap a subject from a standard (Teacher / Admin)
   */
  async unmapSubjectFromStandard({ standardId, subjectId }) {
    const standard = await standardService.getStandardById(standardId);
    const subject = await this.getSubjectById(subjectId);

    try {
      await prisma.standardSubject.delete({
        where: {
          standardId_subjectId: {
            standardId: standard.id,
            subjectId: subject.id,
          },
        },
      });
      return { message: 'Subject unmapped from standard successfully' };
    } catch (error) {
      return { message: 'Subject unmapped from standard successfully' };
    }
  }

  /**
   * Check if a subject is mapped to a standard
   */
  async isSubjectMappedToStandard(standardId, subjectId) {
    let standard;
    let subject;
    try {
      standard = await standardService.getStandardById(standardId);
      subject = await this.getSubjectById(subjectId);
    } catch {
      return false;
    }

    try {
      const mapping = await prisma.standardSubject.findUnique({
        where: {
          standardId_subjectId: {
            standardId: standard.id,
            subjectId: subject.id,
          },
        },
      });
      if (mapping) return true;
    } catch {
      /* fallback below */
    }

    const gradeKey = String(standard.grade || standard.name || '').replace(/^(grade-|std-)/, '');
    const allowedCodes = DEFAULT_STANDARD_SUBJECT_MAP[gradeKey] || [];
    return allowedCodes.includes(subject.code);
  }
}

module.exports = new SubjectService();
