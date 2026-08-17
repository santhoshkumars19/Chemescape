const prisma = require('../config/db');

class SubjectService {
  async getSubjectsByStandard(standardId) {
    // Check if standard exists (by ID or by name e.g. "11")
    let standard = await prisma.standard.findFirst({
      where: {
        OR: [{ id: standardId }, { name: standardId }],
      },
    });

    if (!standard) {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    const standardSubjects = await prisma.standardSubject.findMany({
      where: { standardId: standard.id },
      include: {
        subject: true,
      },
    });

    return standardSubjects.map((ss) => ss.subject);
  }
}

module.exports = new SubjectService();
