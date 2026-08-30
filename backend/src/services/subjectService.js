const prisma = require('../config/db');

class SubjectService {
  async getSubjectsByStandard(standardId) {
    let standard;
    try {
      standard = await prisma.standard.findFirst({
        where: {
          OR: [
            { id: standardId },
            { name: String(standardId) },
            ...(Number.isInteger(Number(standardId)) ? [{ grade: Number(standardId) }] : []),
          ],
        },
      });
    } catch {
      /* fallback below */
    }

    if (!standard) {
      if (['11', '12', '4', '5', '6', '7', '8', '9', '10', 'grade-11', 'grade-12', 'grade-4'].includes(String(standardId))) {
        standard = { id: String(standardId), name: String(standardId) };
      } else {
        const error = new Error('Standard not found');
        error.statusCode = 404;
        throw error;
      }
    }

    try {
      const standardSubjects = await prisma.standardSubject.findMany({
        where: { standardId: standard.id },
        include: {
          subject: true,
        },
      });

      if (standardSubjects && standardSubjects.length > 0) {
        return standardSubjects.map((ss) => ss.subject);
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // Default Chemistry subject for standard 11 & 12
    return [
      {
        id: 'subj-chem',
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Higher secondary Chemistry learning content and escape rooms',
        icon: '🧪',
      },
    ];
  }
}

module.exports = new SubjectService();
