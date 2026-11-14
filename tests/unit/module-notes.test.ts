import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';
import { generateGroundedNotesFallback } from '../../lib/ai/notes-generator';

describe('Module-Wise Notes & Student Module Selection', () => {
  it('retrieves modules with notes_markdown and learning_objectives for student reading', () => {
    const courses = db.getCourses();
    const cs101 = courses.find((c) => c.code === 'CS101') || courses[0];
    const modules = db.getModules(cs101.id);

    expect(modules.length).toBeGreaterThan(0);
    // At least one module has structured study notes
    const modWithNotes = modules.find((m) => m.notes_markdown && m.notes_markdown.length > 50);
    expect(modWithNotes).toBeDefined();
    expect(modWithNotes?.notes_markdown).toContain('Module');
    expect(modWithNotes?.notes_markdown).toContain('Learning Objectives');
  });

  it('generates rich grounded fallback notes when AI provider is unavailable', () => {
    const fallbackNotes = generateGroundedNotesFallback({
      courseTitle: 'CS101: Introduction to Computer Science & AI',
      moduleTitle: 'Module 4: Graph Algorithms & Dynamic Programming',
      moduleOrder: 4,
      moduleDescription: 'Shortest paths, Dijkstra algorithm, Bellman-Ford, and optimal substructure.',
      learningObjectives: [
        'Analyze directed vs undirected graph representations (matrix vs adjacency list).',
        'Apply Dijkstra shortest path algorithm with priority queues.',
        'Prove optimal substructure and overlapping subproblems for DP formulation.',
      ],
      groundingText: 'Graph theory fundamentals: vertices V and edges E. Adjacency list representation uses O(V+E) space. Dijkstra uses priority queues in O((V+E) log V). Dynamic programming relies on Bellman optimality principle.',
    });

    expect(fallbackNotes).toContain('# Module 4: Graph Algorithms & Dynamic Programming');
    expect(fallbackNotes).toContain('## 1. Module Overview & Learning Objectives');
    expect(fallbackNotes).toContain('Analyze directed vs undirected graph representations');
    expect(fallbackNotes).toContain('## 2. Foundational Principles & Core Concepts');
    expect(fallbackNotes).toContain('## 4. Key Terminology & Definitions');
    expect(fallbackNotes).toContain('## 5. Quick Revision & Key Takeaways');
  });

  it('allows updating module notes in the database store', () => {
    const courses = db.getCourses();
    const cs101 = courses.find((c) => c.code === 'CS101') || courses[0];
    const modules = db.getModules(cs101.id);
    expect(modules.length).toBeGreaterThan(0);
    const target = modules[0];

    const testNotes = `# Test Notes for ${target.title}\n\n- Key concept tested.`;
    const updated = db.updateModule(target.id, {
      notes_markdown: testNotes,
    });

    expect(updated).toBeDefined();
    expect(updated?.notes_markdown).toBe(testNotes);

    // Verify it is persisted in getModules
    const refreshed = db.getModules(cs101.id).find((m) => m.id === target.id);
    expect(refreshed?.notes_markdown).toBe(testNotes);
  });
});
