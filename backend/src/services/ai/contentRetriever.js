/**
 * ChemEscape AI Assistant - Content Retriever
 * Retrieves authoritative syllabus content from Prisma database:
 * - Standard, Subject, Chapter, Topic definitions
 * - Questions, Answers, Hints, Explanations
 * - Validates mode (CURRENT_CHAPTER vs FULL_SYLLABUS)
 * - Excludes unpublished/draft content
 */

const prisma = require('../../config/db');

class ContentRetriever {
  /**
   * Retrieve relevant syllabus content based on user context, mode, and query
   */
  async retrieveContext({ userId, standardId, subjectId, chapterId, topicId, mode = 'CURRENT_CHAPTER', question = '' }) {
    // 1. Resolve User and Standard
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    });

    if (!user) {
      const err = new Error('Authenticated user not found.');
      err.statusCode = 401;
      throw err;
    }

    // Resolve Standard (Default to 11th Standard if not provided)
    let standard;
    if (standardId) {
      standard = await prisma.standard.findUnique({ where: { id: standardId } });
    }
    if (!standard) {
      standard = await prisma.standard.findFirst({
        where: { OR: [{ name: '11' }, { displayName: { contains: '11' } }] }
      });
    }
    if (!standard) {
      standard = await prisma.standard.findFirst();
    }

    // Resolve Subject (Chemistry)
    let subject;
    if (subjectId) {
      subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    }
    if (!subject) {
      subject = await prisma.subject.findFirst({ where: { code: 'CHEM' } });
    }
    if (!subject) {
      subject = await prisma.subject.findFirst();
    }

    // 2. Query Chapters based on mode
    let targetChapterId = chapterId;
    let chapters = [];

    if (mode === 'CURRENT_CHAPTER' && targetChapterId) {
      const ch = await prisma.chapter.findUnique({
        where: { id: targetChapterId },
        include: {
          topics: { orderBy: { orderNumber: 'asc' } },
          questions: {
            take: 10,
            include: { options: true }
          }
        }
      });
      if (ch) chapters.push(ch);
    }

    // If no chapter selected or mode is FULL_SYLLABUS, load all chapters for standard
    if (chapters.length === 0 && standard && subject) {
      chapters = await prisma.chapter.findMany({
        where: {
          standardId: standard.id,
          subjectId: subject.id,
          isLocked: false // Published / active chapters only
        },
        include: {
          topics: { orderBy: { orderNumber: 'asc' } },
          questions: {
            take: 5,
            include: { options: true }
          }
        },
        orderBy: { chapterNumber: 'asc' }
      });
    }

    // 3. Match relevant topics and questions against user's question
    const queryLower = question.toLowerCase();
    const retrievedItems = [];
    let matchedChapter = chapters[0] || null;
    let matchedTopic = null;

    for (const chapter of chapters) {
      const chapterTitleLower = chapter.title.toLowerCase();
      const chapterDescLower = (chapter.description || '').toLowerCase();

      let chapterRelevance = 0;
      if (queryLower.includes(chapterTitleLower)) chapterRelevance += 10;
      if (queryLower.split(' ').some(w => w.length > 3 && chapterTitleLower.includes(w))) chapterRelevance += 3;

      for (const topic of chapter.topics || []) {
        const topicTitleLower = topic.title.toLowerCase();
        if (queryLower.includes(topicTitleLower) || topicTitleLower.split(' ').some(w => w.length > 3 && queryLower.includes(w))) {
          matchedChapter = chapter;
          matchedTopic = topic;
          retrievedItems.push({
            type: 'TOPIC',
            chapterTitle: chapter.title,
            topicTitle: topic.title,
            description: topic.description || ''
          });
        }
      }

      for (const q of chapter.questions || []) {
        const qTextLower = q.questionText.toLowerCase();
        if (queryLower.split(' ').filter(w => w.length > 3).some(w => qTextLower.includes(w))) {
          retrievedItems.push({
            type: 'QUESTION_EXPLANATION',
            chapterTitle: chapter.title,
            questionText: q.questionText,
            explanation: q.explanation || q.hint || '',
            options: q.options ? q.options.map(o => `${o.optionText}${o.isCorrect ? ' (Correct)' : ''}`).join(', ') : ''
          });
        }
      }
    }

    return {
      standard: standard ? { id: standard.id, name: standard.name, displayName: standard.displayName } : null,
      subject: subject ? { id: subject.id, name: subject.name, code: subject.code } : null,
      currentChapter: matchedChapter ? { id: matchedChapter.id, title: matchedChapter.title, chapterNumber: matchedChapter.chapterNumber } : null,
      currentTopic: matchedTopic ? { id: matchedTopic.id, title: matchedTopic.title } : null,
      mode,
      availableChapters: chapters.map(c => ({ id: c.id, title: c.title, chapterNumber: c.chapterNumber })),
      retrievedItems: retrievedItems.slice(0, 5) // Limit to top 5 most relevant items for prompt economy
    };
  }
}

module.exports = new ContentRetriever();
